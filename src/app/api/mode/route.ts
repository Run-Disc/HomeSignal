import { NextResponse } from "next/server";
import { SNAPSHOT_VERSION } from "@/lib/constants";
import { currentAiMode, modeDescription, readSavedExamples } from "@/lib/extractClient";
import { sourceManifest } from "@/lib/loadSnapshot";

export const runtime = "nodejs";

export async function GET() {
  const mode = currentAiMode();
  return NextResponse.json({
    mode,
    modeDescription: modeDescription(mode),
    snapshotVersion: SNAPSHOT_VERSION,
    savedExampleCount: readSavedExamples().length,
    source: sourceManifest(),
  });
}
