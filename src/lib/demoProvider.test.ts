import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SNAPSHOT_VERSION } from "./constants";
import { assembleRecordBrief, buildDecisionSupport, DemoAIProvider } from "./ai/demoProvider";
import { buildRecordSummaryText } from "./ai/summaryText";
import { analyzeRequestSchema, runtimeAiSuccessSchema } from "./ai/schema";
import type { PermitRecord } from "./types";

function permit(over: Partial<PermitRecord> = {}): PermitRecord {
  return {
    recordId: "pli:TEST-1",
    sourcePermitId: "TEST-1",
    sourceResourceId: "f4d1177a-f597-4c32-8cbf-7885f56253f6",
    issueDate: "2025-04-23",
    permitTypeRaw: "Building & Development Application",
    permitTypeNormalized: "building_development_application",
    sourceClassRaw: "Commercial",
    workTypeRaw: "New Construction",
    sourceStatusRaw: "Issued",
    neighborhood: "Middle Hill",
    workDescriptionSanitized:
      "CONSTRUCT A NEW FOUR-STORY BUILDING WITH A BASEMENT. TOTAL OF 12 DWELLING UNITS ABOVE.",
    citationId: "src:pli:TEST-1",
    snapshotVersion: SNAPSHOT_VERSION,
    qualityFlags: [],
    candidateDiscovery: { selected: true, method: "keyword_or_structured_work_type" },
    inReviewCorpus: true,
    inComparisonSample: false,
    ...over,
  };
}

const provider = new DemoAIProvider();

describe("simulated runtime AI provider", () => {
  it("returns a valid success schema grounded in the supplied record", async () => {
    const record = permit();
    const result = await provider.analyze(record, "hash-a", { delayMs: 0 });
    assert.equal(result.success, true);
    if (!result.success) return;
    const parsed = runtimeAiSuccessSchema.safeParse(result);
    assert.equal(parsed.success, true);
    assert.equal(result.runtimeMode, "simulated");
    assert.equal(result.provider, "demo");
    assert.match(result.requestId, /^demo_req_/);
    assert.match(result.brief.summary, /TEST-1/);
    assert.match(result.brief.summary, /2025-04-23/);
    assert.equal(result.brief.findings.some((f) => f.explanation.includes("12 DWELLING UNITS")), true);
    assert.equal(result.brief.findings.some((f) => /2019|contractor|Main Street/i.test(f.explanation)), false);
    assert.equal(result.usage.totalTokensEstimated > 0, true);
  });

  it("is deterministic for the same record and hash", async () => {
    const record = permit();
    const a = await provider.analyze(record, "hash-a", { delayMs: 0 });
    const b = await provider.analyze(record, "hash-a", { delayMs: 0 });
    assert.deepEqual(a.success ? a.brief : null, b.success ? b.brief : null);
    assert.equal(a.success && b.success ? a.requestId === b.requestId : false, true);
  });

  it("does not invent permits when the description is blank", async () => {
    const result = await provider.analyze(
      permit({
        workDescriptionSanitized: "",
        qualityFlags: ["blank_description"],
      }),
      "hash-blank",
      { delayMs: 0 },
    );
    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.brief.evidenceCoverage.hasDescription, false);
    assert.match(result.brief.summary, /blank/i);
    assert.equal(result.brief.findings.some((f) => f.id === "blank"), true);
    assert.equal(result.brief.findings.some((f) => /12 DWELLING/.test(f.explanation)), false);
  });

  it("does not call old activity recent or invent extra IDs on a January record", async () => {
    const brief = assembleRecordBrief(
      permit({
        issueDate: "2025-01-08",
        workDescriptionSanitized: "NO WORK - CORRECTION OF CO CONTINUED USE OF TWO STORY BUILDING FOR 32 UNIT DWELLINGS",
      }),
    );
    const text = `${brief.summary} ${brief.findings.map((f) => f.explanation).join(" ")}`;
    assert.equal(/recent construction|2019|2022|BDA-2024-05307/.test(text), false);
    assert.match(text, /2025-01-08/);
    assert.match(text, /NO WORK/);
    assert.equal(/\b32 dwelling units\b/i.test(text), false);
  });

  it("does not hallucinate housing on a signage-only description", async () => {
    const brief = assembleRecordBrief(
      permit({
        candidateDiscovery: { selected: false, method: "keyword_or_structured_work_type" },
        workTypeRaw: "Existing (alteration/addition)",
        workDescriptionSanitized: "INSTALL VARIOUS BUSINESS IDENTIFICATION WALL AND GROUND SIGNAGE FOR NEW PRESBYTERIAN TOWER",
      }),
    );
    assert.equal(brief.findings.some((f) => f.id === "no-housing-phrase"), true);
    assert.equal(brief.findings.some((f) => f.id === "dwelling-count"), false);
  });

  it("answers occupancy without claiming homes were built", async () => {
    const result = await provider.answer(permit(), "hash-a", "occupancy", { delayMs: 0 });
    assert.equal(result.success, true);
    if (!result.success) return;
    assert.match(result.answer, /No/);
    assert.match(result.answer, /occupancy/i);
  });

  it("supports simulated failure without random demo breakage", async () => {
    const result = await provider.analyze(permit(), "hash-a", { delayMs: 0, fail: true });
    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.code, "unavailable");
  });

  it("separates what the flagship record establishes from what it does not", () => {
    const { decisionSupport, coverage } = buildDecisionSupport(permit());
    assert.equal(decisionSupport.establishes.some((s) => s.includes("“12 DWELLING UNITS”")), true);
    const establishes = decisionSupport.establishes.join(" ");
    assert.equal(/complet|occupied|built|contractor|owner|zoning|inspection passed/i.test(establishes), false);
    const notEst = decisionSupport.doesNotEstablish.join(" ");
    assert.match(notEst, /construction started or finished/);
    assert.match(notEst, /occupied/);
    const byLabel = Object.fromEntries(coverage.map((c) => [c.label, c.status]));
    assert.equal(byLabel["Dwelling-unit language"], "explicit");
    assert.equal(byLabel["Construction completion"], "not_established");
    assert.equal(byLabel["Occupancy"], "not_established");
  });

  it("phrases next steps conditionally and never asserts other records exist", () => {
    const { decisionSupport } = buildDecisionSupport(permit());
    for (const step of decisionSupport.verifyNext) {
      assert.match(step, /^(If |Confirm |Before |Open )/);
      assert.equal(/\b(was|were) (completed|occupied)\b|records show|has been inspected/i.test(step), false);
    }
    assert.equal(decisionSupport.verifyNext.some((s) => /check whether separate inspection/.test(s)), true);
  });

  it("reports blank descriptions honestly with no dwelling claims", () => {
    const { decisionSupport, coverage } = buildDecisionSupport(
      permit({ workDescriptionSanitized: "", qualityFlags: ["blank_description"] }),
    );
    const byLabel = Object.fromEntries(coverage.map((c) => [c.label, c.status]));
    assert.equal(byLabel["Source description"], "missing");
    assert.equal(byLabel["Dwelling-unit language"], "missing");
    assert.equal(decisionSupport.establishes.some((s) => /DWELLING/.test(s)), false);
    assert.match(decisionSupport.doesNotEstablish.join(" "), /Any dwelling-unit count/);
    assert.equal(decisionSupport.verifyNext.some((s) => /Open the official permit record/.test(s)), true);
  });

  it("does not read a Completed source status as confirmed completion", () => {
    const { coverage, decisionSupport } = buildDecisionSupport(permit({ sourceStatusRaw: "Completed" }));
    const completion = coverage.find((c) => c.label === "Construction completion");
    assert.equal(completion?.status, "not_established");
    assert.match(completion?.detail ?? "", /administrative permit label/);
    assert.equal(decisionSupport.verifyNext.some((s) => /^If the “Completed” status matters/.test(s)), true);
  });

  it("does not treat non-standard unit wording as an explicit dwelling count", () => {
    const { coverage, decisionSupport } = buildDecisionSupport(
      permit({
        workDescriptionSanitized: "NO WORK - CORRECTION OF CO CONTINUED USE OF TWO STORY BUILDING FOR 32 UNIT DWELLINGS",
      }),
    );
    assert.equal(coverage.find((c) => c.label === "Dwelling-unit language")?.status, "missing");
    assert.equal(decisionSupport.verifyNext.some((s) => /administrative or occupancy-continuation/.test(s)), true);
  });

  it("labels copied summaries as simulated and keeps reviewer status separate", async () => {
    const record = permit();
    const result = await provider.analyze(record, "hash-a", { delayMs: 0 });
    assert.equal(result.success, true);
    if (!result.success) return;
    const text = buildRecordSummaryText({ record, brief: result, review: null, reviewLabel: "Not reviewed" });
    assert.match(text, /SIMULATED AI INTERPRETATION — non-authoritative/);
    assert.match(text, /Reviewer status: Not reviewed/);
    assert.equal(/Reviewed fact:/.test(text), false);
    const plain = buildRecordSummaryText({ record, brief: null, review: null, reviewLabel: "Not reviewed" });
    assert.equal(/SIMULATED/.test(plain), false);
  });

  it("rejects invalid analyze requests at the schema boundary", () => {
    assert.equal(analyzeRequestSchema.safeParse({}).success, false);
    assert.equal(analyzeRequestSchema.safeParse({ recordId: "pli:TEST-1", extra: true }).success, false);
    assert.equal(analyzeRequestSchema.safeParse({ recordId: "pli:TEST-1" }).success, true);
  });
});
