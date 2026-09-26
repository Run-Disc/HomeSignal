import { NextResponse } from "next/server";
import { currentAiMode, extractForRecord, modeDescription } from "@/lib/extractClient";
import { findPermit } from "@/lib/loadSnapshot";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { recordId?: string };
  try {
    body = (await request.json()) as { recordId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const recordId = body.recordId;
  if (!recordId || typeof recordId !== "string") {
    return NextResponse.json({ error: "recordId is required." }, { status: 400 });
  }
  const record = findPermit(recordId);
  if (!record) {
    return NextResponse.json({ error: "Unknown record." }, { status: 404 });
  }
  const result = await extractForRecord(record);
  if (result.status === "unavailable") {
    return NextResponse.json({
      status: "unavailable",
      message: result.message,
      mode: currentAiMode(),
      modeDescription: modeDescription(currentAiMode()),
    });
  }
  return NextResponse.json({
    status: "ok",
    proposal: result.proposal,
    mode: currentAiMode(),
    modeDescription: modeDescription(currentAiMode()),
  });
}
