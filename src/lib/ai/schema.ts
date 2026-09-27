import { z } from "zod";

export const FOLLOW_UP_QUESTION_IDS = [
  "why-flagged",
  "review-first",
  "counts",
  "occupancy",
  "status",
] as const;

export type FollowUpQuestionId = (typeof FOLLOW_UP_QUESTION_IDS)[number];

export const FOLLOW_UP_QUESTIONS: Array<{ id: FollowUpQuestionId; label: string }> = [
  { id: "why-flagged", label: "Why is this in the housing queue?" },
  { id: "review-first", label: "What should I review first?" },
  { id: "counts", label: "What unit counts does the text support?" },
  { id: "occupancy", label: "Does this mean homes were built?" },
  { id: "status", label: "What does the source status mean?" },
];

export const analyzeRequestSchema = z
  .object({
    recordId: z.string().min(1).max(120),
  })
  .strict();

export const askRequestSchema = z
  .object({
    recordId: z.string().min(1).max(120),
    questionId: z.enum(FOLLOW_UP_QUESTION_IDS),
  })
  .strict();

export const evidenceRefSchema = z.object({
  recordId: z.string(),
  sourcePermitId: z.string(),
  citationId: z.string(),
  field: z.enum(["workDescriptionSanitized", "workTypeRaw", "permitTypeRaw", "sourceClassRaw", "issueDate", "sourceStatusRaw"]),
  quote: z.string(),
});

export const aiFindingSchema = z.object({
  id: z.string(),
  title: z.string(),
  explanation: z.string(),
  kind: z.enum(["info", "attention", "gap"]),
  evidence: z.array(evidenceRefSchema),
});

export const runtimeUsageSchema = z.object({
  inputTokensEstimated: z.number().int().nonnegative(),
  outputTokensEstimated: z.number().int().nonnegative(),
  totalTokensEstimated: z.number().int().nonnegative(),
  note: z.string(),
});

export const coverageItemSchema = z.object({
  label: z.string(),
  status: z.enum(["available", "explicit", "missing", "not_established", "not_checked"]),
  detail: z.string(),
});

export const decisionSupportSchema = z.object({
  establishes: z.array(z.string()).min(1).max(6),
  doesNotEstablish: z.array(z.string()).min(1).max(6),
  verifyNext: z.array(z.string()).min(1).max(5),
});

export const recordBriefSchema = z.object({
  summary: z.string(),
  decisionSupport: decisionSupportSchema,
  coverage: z.array(coverageItemSchema).min(1).max(6),
  findings: z.array(aiFindingSchema).min(1).max(8),
  followUpQuestions: z.array(z.string()).max(6),
  evidenceCoverage: z.object({
    hasDescription: z.boolean(),
    descriptionLength: z.number().int().nonnegative(),
    candidateSelected: z.boolean(),
    notes: z.array(z.string()),
  }),
});

export const runtimeAiSuccessSchema = z.object({
  success: z.literal(true),
  runtimeMode: z.literal("simulated"),
  provider: z.literal("demo"),
  targetProvider: z.string(),
  requestId: z.string(),
  model: z.string(),
  promptVersion: z.string(),
  generatedAt: z.string(),
  latencyMs: z.number().int().nonnegative(),
  usage: runtimeUsageSchema,
  recordId: z.string(),
  sourcePermitId: z.string(),
  citationId: z.string(),
  brief: recordBriefSchema,
});

export const runtimeAskSuccessSchema = z.object({
  success: z.literal(true),
  runtimeMode: z.literal("simulated"),
  provider: z.literal("demo"),
  targetProvider: z.string(),
  requestId: z.string(),
  model: z.string(),
  promptVersion: z.string(),
  generatedAt: z.string(),
  latencyMs: z.number().int().nonnegative(),
  usage: runtimeUsageSchema,
  recordId: z.string(),
  questionId: z.enum(FOLLOW_UP_QUESTION_IDS),
  answer: z.string(),
  evidence: z.array(evidenceRefSchema),
});

export const runtimeAiErrorSchema = z.object({
  success: z.literal(false),
  runtimeMode: z.literal("simulated"),
  provider: z.literal("demo"),
  requestId: z.string().optional(),
  error: z.string(),
  code: z.enum(["invalid_request", "unknown_record", "no_evidence", "unavailable", "timeout"]),
});

export type EvidenceRef = z.infer<typeof evidenceRefSchema>;
export type AiFinding = z.infer<typeof aiFindingSchema>;
export type RecordBrief = z.infer<typeof recordBriefSchema>;
export type CoverageItem = z.infer<typeof coverageItemSchema>;
export type DecisionSupport = z.infer<typeof decisionSupportSchema>;
export type RuntimeAiSuccess = z.infer<typeof runtimeAiSuccessSchema>;
export type RuntimeAskSuccess = z.infer<typeof runtimeAskSuccessSchema>;
export type RuntimeAiError = z.infer<typeof runtimeAiErrorSchema>;
export type RuntimeUsage = z.infer<typeof runtimeUsageSchema>;
