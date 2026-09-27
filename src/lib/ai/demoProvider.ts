import {
  RUNTIME_AI_MODEL_ID,
  RUNTIME_AI_PROMPT_VERSION,
  TARGET_RUNTIME_PROVIDER,
} from "../constants";
import { buildDemoProposal } from "../demoExtraction";
import { explainDiscovery } from "../discovery";
import type { PermitRecord } from "../types";
import { recordContextPayload, RUNTIME_SYSTEM_PROMPT } from "./prompts";
import {
  demoRequestId,
  estimateTokens,
  simulateLatency,
  type ProviderOptions,
  type RuntimeAiProvider,
} from "./provider";
import type {
  AiFinding,
  CoverageItem,
  DecisionSupport,
  EvidenceRef,
  FollowUpQuestionId,
  RecordBrief,
  RuntimeAiError,
  RuntimeAiSuccess,
  RuntimeAskSuccess,
} from "./schema";

function ref(
  record: PermitRecord,
  field: EvidenceRef["field"],
  quote: string,
): EvidenceRef | null {
  const text =
    field === "workDescriptionSanitized"
      ? record.workDescriptionSanitized || ""
      : field === "workTypeRaw"
        ? record.workTypeRaw || ""
        : field === "permitTypeRaw"
          ? record.permitTypeRaw || ""
          : field === "sourceClassRaw"
            ? record.sourceClassRaw || ""
            : field === "issueDate"
              ? record.issueDate
              : record.sourceStatusRaw || "";
  if (!quote || !text.includes(quote)) return null;
  return {
    recordId: record.recordId,
    sourcePermitId: record.sourcePermitId,
    citationId: record.citationId,
    field,
    quote,
  };
}

function firstQuote(record: PermitRecord, needles: string[], field: EvidenceRef["field"]): EvidenceRef | null {
  const text =
    field === "workDescriptionSanitized"
      ? record.workDescriptionSanitized || ""
      : field === "workTypeRaw"
        ? record.workTypeRaw || ""
        : field === "permitTypeRaw"
          ? record.permitTypeRaw || ""
          : field === "sourceClassRaw"
            ? record.sourceClassRaw || ""
            : "";
  const upper = text.toUpperCase();
  for (const needle of needles) {
    const idx = upper.indexOf(needle.toUpperCase());
    if (idx >= 0) {
      return ref(record, field, text.slice(idx, idx + needle.length));
    }
  }
  return null;
}

function usageFor(input: string, output: string) {
  const inputTokensEstimated = estimateTokens(input);
  const outputTokensEstimated = estimateTokens(output);
  return {
    inputTokensEstimated,
    outputTokensEstimated,
    totalTokensEstimated: inputTokensEstimated + outputTokensEstimated,
    note: "Estimated from character length for the simulated provider. No tokens were billed.",
  };
}

const DWELLING_PHRASE = /\b\d+\s+DWELLING UNITS?\b/i;

export function buildDecisionSupport(record: PermitRecord): {
  decisionSupport: DecisionSupport;
  coverage: CoverageItem[];
} {
  const desc = record.workDescriptionSanitized || "";
  const blank = !desc.trim() || record.qualityFlags.includes("blank_description");
  const dwelling = blank ? null : desc.match(DWELLING_PHRASE);
  const noWork = !blank && /\bNO WORK\b/i.test(desc);
  const conversion = !blank && /\b(CHANGE (OF )?OCCUPANCY|CHANGE OF USE|CONVERT)/i.test(desc);
  const newBuild = !blank && /\b(NEW BUILDING|NEW CONSTRUCTION|CONSTRUCT A NEW)\b/i.test(desc);
  const statusSaysComplete = /complet|final|closed/i.test(record.sourceStatusRaw ?? "");

  const establishes: string[] = [
    `Permit ${record.sourcePermitId}${record.workTypeRaw ? ` (${record.workTypeRaw})` : ""} was issued ${record.issueDate} in ${record.neighborhood}.`,
  ];
  if (blank) {
    establishes.push("The public work description for this row is blank.");
  } else if (dwelling) {
    establishes.push(`The public work description explicitly references “${dwelling[0]}”.`);
  }
  if (newBuild) establishes.push("The description uses new-building language.");
  if (conversion) establishes.push("The description uses conversion or change-of-occupancy language.");
  if (noWork) establishes.push("The description includes the phrase “NO WORK”.");
  if (record.sourceStatusRaw) {
    establishes.push(`The snapshot lists a current administrative status of “${record.sourceStatusRaw}”.`);
  }

  const doesNotEstablish: string[] = [
    "Whether construction started or finished.",
    "Whether any homes are occupied or currently exist.",
  ];
  if (dwelling) {
    doesNotEstablish.push("Whether the referenced unit count is a new total, an existing count, or a net change.");
  } else {
    doesNotEstablish.push("Any dwelling-unit count. None is stated in this record.");
  }
  doesNotEstablish.push("Whether other permit records describe the same building or project.");
  doesNotEstablish.push("Affordability, rents, residents, or zoning and code compliance.");

  const verifyNext: string[] = [];
  if (blank) {
    verifyNext.push("Open the official permit record to see whether a work description exists outside this public snapshot.");
  }
  if (noWork) {
    verifyNext.push("If the record is used as housing evidence, confirm with City permit staff whether it is an administrative or occupancy-continuation filing.");
  }
  if (dwelling) {
    verifyNext.push(`Confirm whether “${dwelling[0]}” describes the proposed total or an existing count before recording it.`);
  }
  if (statusSaysComplete) {
    verifyNext.push(
      `If the “${record.sourceStatusRaw}” status matters for your analysis, confirm with City permit staff what that status records for this permit.`,
    );
  }
  verifyNext.push(
    "If you need evidence of delivered housing, check whether separate inspection, completion, or occupancy records exist for this permit in OneStopPGH or with City permit staff.",
  );
  if (dwelling || newBuild || conversion) {
    verifyNext.push("Before counting units once per project, search for related permit IDs that may describe the same building.");
  }

  const coverage: CoverageItem[] = [
    {
      label: "Source description",
      status: blank ? "missing" : "available",
      detail: blank ? "Blank in the public snapshot." : `${desc.length} characters of public text.`,
    },
    {
      label: "Dwelling-unit language",
      status: dwelling ? "explicit" : "missing",
      detail: dwelling ? `“${dwelling[0]}”` : "No “N DWELLING UNIT(S)” phrase in this record.",
    },
    {
      label: "Construction completion",
      status: "not_established",
      detail: statusSaysComplete
        ? `Source status reads “${record.sourceStatusRaw}”, an administrative permit label. It is not treated as confirmed construction completion or occupancy.`
        : "An issued permit is not evidence that work finished.",
    },
    {
      label: "Occupancy",
      status: "not_established",
      detail: "This record carries no occupancy evidence.",
    },
    {
      label: "Related permits",
      status: "not_checked",
      detail: "HomeSignal reviews one record at a time.",
    },
  ];

  return {
    decisionSupport: {
      establishes: establishes.slice(0, 6),
      doesNotEstablish: doesNotEstablish.slice(0, 6),
      verifyNext: verifyNext.slice(0, 5),
    },
    coverage,
  };
}

export function assembleRecordBrief(record: PermitRecord): RecordBrief {
  const desc = record.workDescriptionSanitized || "";
  const blank = !desc.trim() || record.qualityFlags.includes("blank_description");
  const discovery = explainDiscovery(record);
  const findings: AiFinding[] = [];
  const notes: string[] = [];

  findings.push({
    id: "identity",
    title: "This is one issued permit record",
    explanation: `${record.sourcePermitId} was issued ${record.issueDate} in ${record.neighborhood}. It is a permit record in snapshot ${record.snapshotVersion}, not a completed home and not a project-level unit total.`,
    kind: "info",
    evidence: [ref(record, "issueDate", record.issueDate)].filter((x): x is EvidenceRef => Boolean(x)),
  });

  if (blank) {
    notes.push("The public work description is blank, so housing relevance cannot be read from source text.");
    findings.push({
      id: "blank",
      title: "No work description is available",
      explanation:
        "This snapshot row has no public work description. Do not infer dwelling counts, scope, or occupancy. Mark insufficient evidence and verify on the official record.",
      kind: "gap",
      evidence: [],
    });
  } else {
    const dwelling = desc.match(/\b\d+\s+DWELLING UNITS?\b/i);
    if (dwelling) {
      findings.push({
        id: "dwelling-count",
        title: "The description mentions dwelling units",
        explanation: `The public text includes “${dwelling[0]}”. That is a mention in an issued-permit description, not proof that those homes were built or occupied. Story, bedroom, parking, and accessibility-unit phrases are not treated as this count.`,
        kind: "attention",
        evidence: [ref(record, "workDescriptionSanitized", dwelling[0])].filter((x): x is EvidenceRef => Boolean(x)),
      });
    } else if (/\b(STOR(Y|IES)|BEDROOM|PARKING|ACCESSIBLE UNITS)\b/i.test(desc)) {
      findings.push({
        id: "non-unit-numbers",
        title: "Numeric language is present but is not a dwelling-unit count",
        explanation:
          "The description includes story, bedroom, parking, or accessibility-unit language. HomeSignal does not treat those figures as housing-unit counts.",
        kind: "attention",
        evidence: [
          firstQuote(record, ["STORIES", "STORY", "BEDROOM", "PARKING", "ACCESSIBLE UNITS"], "workDescriptionSanitized"),
        ].filter((x): x is EvidenceRef => Boolean(x)),
      });
    }

    const conversion = firstQuote(
      record,
      ["CHANGE OCCUPANCY", "CHANGE OF USE", "CONVERT"],
      "workDescriptionSanitized",
    );
    if (conversion) {
      findings.push({
        id: "conversion",
        title: "The text describes a conversion or occupancy change",
        explanation: `Quoted language “${conversion.quote}” supports a conversion-style reading of this record. It does not establish that the change was completed or occupied.`,
        kind: "info",
        evidence: [conversion],
      });
    }

    const newBuild = firstQuote(
      record,
      ["NEW BUILDING", "NEW CONSTRUCTION", "CONSTRUCT A NEW"],
      "workDescriptionSanitized",
    );
    if (newBuild) {
      findings.push({
        id: "new-building",
        title: "The text describes new-building work",
        explanation: `Quoted language “${newBuild.quote}” is present in the issued description. An issued new-building permit is still not construction start, completion, or occupancy.`,
        kind: "info",
        evidence: [newBuild],
      });
    }

    if (/\bNO WORK\b/i.test(desc)) {
      findings.push({
        id: "no-work",
        title: "The description says no work",
        explanation:
          "The public text includes “NO WORK”. Treat counts and housing claims as administrative or occupancy-continuation language until a human confirms the official record.",
        kind: "attention",
        evidence: [firstQuote(record, ["NO WORK"], "workDescriptionSanitized")].filter(
          (x): x is EvidenceRef => Boolean(x),
        ),
      });
    }

    if (!dwelling && !conversion && !newBuild && !/\b(DWELLING|APARTMENT|RESIDENTIAL|HOUSING)\b/i.test(desc)) {
      findings.push({
        id: "no-housing-phrase",
        title: "No explicit housing phrase was matched",
        explanation:
          "This description does not contain an explicit dwelling, apartment, or residential phrase used by the local matcher. Do not invent housing activity for it.",
        kind: "gap",
        evidence: [],
      });
    }
  }

  if (record.sourceClassRaw) {
    const classRef = ref(record, "sourceClassRaw", record.sourceClassRaw);
    if (classRef) {
      findings.push({
        id: "admin-class",
        title: "Source class is an administrative label",
        explanation: `The source class is “${record.sourceClassRaw}”. Residential/Commercial labels are administrative. Commercial records can include housing; Residential class does not prove new units.`,
        kind: "info",
        evidence: [classRef],
      });
    }
  }

  if (discovery.selected) {
    findings.push({
      id: "queue",
      title: "Why this record is in the housing queue",
      explanation: `${discovery.summary} ${discovery.caveat}`,
      kind: "info",
      evidence: [
        firstQuote(record, discovery.keywordHits.slice(0, 2), "workDescriptionSanitized"),
        firstQuote(record, discovery.workTypeHits.slice(0, 1), "workTypeRaw"),
      ].filter((x): x is EvidenceRef => Boolean(x)),
    });
  }

  if (record.sourceStatusRaw) {
    findings.push({
      id: "status",
      title: "Source status is not occupancy",
      explanation: `The source status is “${record.sourceStatusRaw}”. That is a current administrative label, not a timeline of inspections, completion, or occupancy.`,
      kind: "attention",
      evidence: [ref(record, "sourceStatusRaw", record.sourceStatusRaw)].filter((x): x is EvidenceRef => Boolean(x)),
    });
  }

  const summary = blank
    ? `${record.sourcePermitId} is in the 2025 Building/BDA snapshot for ${record.neighborhood}, issued ${record.issueDate}, but the public description is blank. No dwelling count or occupancy conclusion is supported.`
    : `${record.sourcePermitId} is an issued ${record.workTypeRaw ?? "permit"} record in ${record.neighborhood} dated ${record.issueDate}. The simulated analysis uses only this row’s public fields and does not add other permits, addresses, or a homes-built total.`;

  const { decisionSupport, coverage } = buildDecisionSupport(record);

  return {
    summary,
    decisionSupport,
    coverage,
    findings: findings.slice(0, 8),
    followUpQuestions: [
      "Does the official OneStopPGH record still match this issued description?",
      "Has inspection or occupancy been recorded after this issue date?",
      "Do other permit IDs describe the same building?",
    ],
    evidenceCoverage: {
      hasDescription: !blank,
      descriptionLength: desc.length,
      candidateSelected: discovery.selected,
      notes,
    },
  };
}

export function answerFromEvidence(record: PermitRecord, questionId: FollowUpQuestionId): {
  answer: string;
  evidence: EvidenceRef[];
} {
  const discovery = explainDiscovery(record);
  const desc = record.workDescriptionSanitized || "";
  const blank = !desc.trim() || record.qualityFlags.includes("blank_description");
  if (questionId === "why-flagged") {
    return {
      answer: discovery.selected
        ? `${discovery.summary} ${discovery.caveat}`
        : "This record is not selected by the keyword/work-type discovery rule. It can still be opened from the full issued list.",
      evidence: [
        firstQuote(record, discovery.keywordHits.slice(0, 2), "workDescriptionSanitized"),
        firstQuote(record, discovery.workTypeHits.slice(0, 1), "workTypeRaw"),
      ].filter((x): x is EvidenceRef => Boolean(x)),
    };
  }
  if (questionId === "review-first") {
    if (blank) {
      return {
        answer: "Review the official permit first. This snapshot row has no public description to quote.",
        evidence: [],
      };
    }
    const dwelling = desc.match(/\b\d+\s+DWELLING UNITS?\b/i);
    if (dwelling) {
      return {
        answer: `Start with the exact phrase “${dwelling[0]}” in the public description. Confirm whether it is an existing count, a proposed total, or another use of the word unit, then save a human review.`,
        evidence: [ref(record, "workDescriptionSanitized", dwelling[0])].filter((x): x is EvidenceRef => Boolean(x)),
      };
    }
    return {
      answer:
        "Read the full public description and the administrative class/work type. If no explicit dwelling-unit phrase exists, save insufficient evidence rather than a count.",
      evidence: [ref(record, "workDescriptionSanitized", desc.slice(0, Math.min(80, desc.length)))].filter(
        (x): x is EvidenceRef => Boolean(x),
      ),
    };
  }
  if (questionId === "counts") {
    const dwelling = desc.match(/\b\d+\s+DWELLING UNITS?\b/i);
    if (!dwelling) {
      return {
        answer:
          "No explicit “N DWELLING UNIT(S)” phrase was found in this description. The local provider will not invent a unit count. Stories, bedrooms, parking, and accessibility units stay uncounted.",
        evidence: [],
      };
    }
    return {
      answer: `The only dwelling-unit phrase matched in this row is “${dwelling[0]}”. It is a text mention, not a citywide production total and not proof of occupancy.`,
      evidence: [ref(record, "workDescriptionSanitized", dwelling[0])].filter((x): x is EvidenceRef => Boolean(x)),
    };
  }
  if (questionId === "occupancy") {
    return {
      answer: `No. ${record.sourcePermitId} is an issued permit record dated ${record.issueDate}. HomeSignal does not treat issue date or source status as construction start, completion, or occupancy.`,
      evidence: [ref(record, "issueDate", record.issueDate)].filter((x): x is EvidenceRef => Boolean(x)),
    };
  }
  return {
    answer: record.sourceStatusRaw
      ? `The source status “${record.sourceStatusRaw}” is a current administrative label in the WPRDC snapshot. It is not a historical inspection timeline.`
      : "This row has no source status value in the snapshot.",
    evidence: record.sourceStatusRaw
      ? [ref(record, "sourceStatusRaw", record.sourceStatusRaw)].filter((x): x is EvidenceRef => Boolean(x))
      : [],
  };
}

export class DemoAIProvider implements RuntimeAiProvider {
  readonly id = "demo" as const;
  readonly modelLabel = RUNTIME_AI_MODEL_ID;

  async extract(record: PermitRecord, inputHash: string, options?: ProviderOptions) {
    await simulateLatency(`${record.recordId}:extract`, options);
    const demo = buildDemoProposal(record, inputHash);
    if (demo.ok) return { status: "ok" as const, proposal: demo.value };
    return {
      status: "unavailable" as const,
      message: `Simulated extraction could not be validated for this record (${demo.error}). Source review still works. No external model was called.`,
    };
  }

  async analyze(record: PermitRecord, inputHash: string, options?: ProviderOptions) {
    const requestId = demoRequestId(["analyze", record.recordId, inputHash]);
    if (options?.fail) {
      return {
        success: false as const,
        runtimeMode: "simulated" as const,
        provider: "demo" as const,
        requestId,
        error: "Simulated runtime analysis failed before a brief was assembled.",
        code: "unavailable" as const,
      } satisfies RuntimeAiError;
    }
    const latencyMs = await simulateLatency(requestId, options);
    const brief = assembleRecordBrief(record);
    const generatedAt = "2026-09-27T18:00:00.000Z";
    const payload = recordContextPayload({
      recordId: record.recordId,
      sourcePermitId: record.sourcePermitId,
      citationId: record.citationId,
      issueDate: record.issueDate,
      neighborhood: record.neighborhood,
      permitTypeRaw: record.permitTypeRaw,
      sourceClassRaw: record.sourceClassRaw,
      workTypeRaw: record.workTypeRaw,
      sourceStatusRaw: record.sourceStatusRaw,
      workDescriptionSanitized: record.workDescriptionSanitized,
      qualityFlags: record.qualityFlags,
      candidateDiscovery: record.candidateDiscovery,
      snapshotVersion: record.snapshotVersion,
      sanitizedInputHash: inputHash,
    });
    const result: RuntimeAiSuccess = {
      success: true,
      runtimeMode: "simulated",
      provider: "demo",
      targetProvider: TARGET_RUNTIME_PROVIDER,
      requestId,
      model: RUNTIME_AI_MODEL_ID,
      promptVersion: RUNTIME_AI_PROMPT_VERSION,
      generatedAt,
      latencyMs,
      usage: usageFor(RUNTIME_SYSTEM_PROMPT + payload, JSON.stringify(brief)),
      recordId: record.recordId,
      sourcePermitId: record.sourcePermitId,
      citationId: record.citationId,
      brief,
    };
    return result;
  }

  async answer(
    record: PermitRecord,
    inputHash: string,
    questionId: FollowUpQuestionId,
    options?: ProviderOptions,
  ) {
    const requestId = demoRequestId(["ask", record.recordId, inputHash, questionId]);
    if (options?.fail) {
      return {
        success: false as const,
        runtimeMode: "simulated" as const,
        provider: "demo" as const,
        requestId,
        error: "Simulated follow-up failed.",
        code: "unavailable" as const,
      } satisfies RuntimeAiError;
    }
    const latencyMs = await simulateLatency(requestId, options);
    const { answer, evidence } = answerFromEvidence(record, questionId);
    const result: RuntimeAskSuccess = {
      success: true,
      runtimeMode: "simulated",
      provider: "demo",
      targetProvider: TARGET_RUNTIME_PROVIDER,
      requestId,
      model: RUNTIME_AI_MODEL_ID,
      promptVersion: RUNTIME_AI_PROMPT_VERSION,
      generatedAt: "2026-09-27T18:00:00.000Z",
      latencyMs,
      usage: usageFor(questionId + record.workDescriptionSanitized, answer),
      recordId: record.recordId,
      questionId,
      answer,
      evidence,
    };
    return result;
  }
}

export const demoAiProvider = new DemoAIProvider();

export function currentRuntimeProvider(): RuntimeAiProvider {
  return demoAiProvider;
}
