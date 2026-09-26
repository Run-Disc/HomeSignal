import { createHash } from "node:crypto";
import type { PermitRecord } from "./types";

export function sha256Text(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function sanitizedInputHash(record: PermitRecord): string {
  const payload = JSON.stringify({
    recordId: record.recordId,
    snapshotVersion: record.snapshotVersion,
    issueDate: record.issueDate,
    permitTypeRaw: record.permitTypeRaw,
    sourceClassRaw: record.sourceClassRaw,
    workTypeRaw: record.workTypeRaw,
    sourceStatusRaw: record.sourceStatusRaw,
    neighborhood: record.neighborhood,
    workDescriptionSanitized: record.workDescriptionSanitized,
    citationId: record.citationId,
  });
  return sha256Text(payload);
}
