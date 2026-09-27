import { NextResponse } from "next/server";
import { currentRuntimeProvider } from "@/lib/ai/demoProvider";
import { askRequestSchema, runtimeAiErrorSchema, runtimeAskSuccessSchema } from "@/lib/ai/schema";
import { sanitizedInputHash } from "@/lib/hash";
import { findPermit } from "@/lib/loadSnapshot";

export const runtime = "nodejs";

async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.length > 4000) {
    throw new Error("TOO_LARGE");
  }
  return JSON.parse(text);
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await readJson(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "TOO_LARGE";
    return NextResponse.json(
      runtimeAiErrorSchema.parse({
        success: false,
        runtimeMode: "simulated",
        provider: "demo",
        error: tooLarge ? "Request body is too large." : "Invalid JSON body.",
        code: "invalid_request",
      }),
      { status: 400 },
    );
  }
  const parsed = askRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      runtimeAiErrorSchema.parse({
        success: false,
        runtimeMode: "simulated",
        provider: "demo",
        error: "recordId and a supported questionId are required.",
        code: "invalid_request",
      }),
      { status: 400 },
    );
  }
  const record = findPermit(parsed.data.recordId);
  if (!record) {
    return NextResponse.json(
      runtimeAiErrorSchema.parse({
        success: false,
        runtimeMode: "simulated",
        provider: "demo",
        error: "Unknown record.",
        code: "unknown_record",
      }),
      { status: 404 },
    );
  }
  const result = await currentRuntimeProvider().answer(
    record,
    sanitizedInputHash(record),
    parsed.data.questionId,
  );
  if (!result.success) return NextResponse.json(result, { status: 503 });
  const checked = runtimeAskSuccessSchema.safeParse(result);
  if (!checked.success || checked.data.recordId !== record.recordId) {
    return NextResponse.json(
      runtimeAiErrorSchema.parse({
        success: false,
        runtimeMode: "simulated",
        provider: "demo",
        error: "The follow-up response failed schema validation and was discarded.",
        code: "unavailable",
      }),
      { status: 503 },
    );
  }
  return NextResponse.json(checked.data, { status: 200 });
}
