import { readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SNAPSHOT_VERSION } from "./constants";
import { loadPermits } from "./loadSnapshot";

describe("snapshot privacy and schema", () => {
  const records = loadPermits();

  it("loads the 2025 building/BDA cohort", () => {
    assert.ok(records.length > 1000);
    assert.ok(records.every((r) => r.snapshotVersion === SNAPSHOT_VERSION));
    assert.ok(records.every((r) => r.issueDate.startsWith("2025-")));
    assert.ok(
      records.every(
        (r) =>
          r.permitTypeRaw === "BUILDING" ||
          r.permitTypeRaw === "Building & Development Application",
      ),
    );
  });

  it("public JSON files do not contain parcel identifiers", () => {
    const raw = readFileSync(join(process.cwd(), "data/public/permits-2025.json"), "utf8");
    assert.equal(raw.includes('"parcelId"'), false);
    assert.equal(raw.includes('"parcel_num"'), false);
    const rows = JSON.parse(raw) as Array<Record<string, unknown>>;
    assert.equal(rows.length, records.length);
    assert.ok(rows.every((row) => !("parcelId" in row) && !("parcel_num" in row)));
  });

  it("loaded records omit owner, contractor, address, and parcel keys", () => {
    const forbidden = [
      "owner_name",
      "contractor_name",
      "address",
      "latitude",
      "longitude",
      "parcelId",
      "parcel_num",
    ];
    for (const record of records) {
      const keys = Object.keys(record as unknown as Record<string, unknown>);
      for (const key of forbidden) {
        assert.equal(keys.includes(key), false, key);
      }
    }
  });

  it("does not leave emails, phones, or house-number street addresses in descriptions", () => {
    const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    const phone = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/;
    const houseStreet =
      /\b\d{1,6}[A-Z]?\s+(?:[NSEW]\.?\s+)?[A-Z0-9][A-Z0-9.'-]{0,30}(?:\s+[A-Z0-9.'-]{1,20}){0,3}\s+(?:STREET|AVENUE|BOULEVARD|ROAD|DRIVE|LANE|COURT|PLACE|TERRACE|PARKWAY|CIRCLE|HIGHWAY|ST|AVE|BLVD|RD|DR|LN|CT|PL|TER|PKWY|CIR|HWY)\.?\b/i;
    for (const r of records) {
      const text = r.workDescriptionSanitized || "";
      assert.equal(email.test(text), false, r.sourcePermitId);
      assert.equal(phone.test(text), false, r.sourcePermitId);
      assert.equal(houseStreet.test(text), false, r.sourcePermitId);
    }
  });

  it("preserves permit IDs as strings and keeps commercial candidates", () => {
    assert.ok(records.every((r) => typeof r.sourcePermitId === "string"));
    const commercialCandidates = records.filter(
      (r) => r.sourceClassRaw === "Commercial" && r.candidateDiscovery.selected,
    );
    assert.ok(commercialCandidates.length > 0);
  });

  it("keeps blank descriptions as blank rather than invented text", () => {
    const blanks = records.filter((r) => r.qualityFlags.includes("blank_description"));
    assert.ok(blanks.length > 0);
    assert.ok(blanks.every((r) => !r.workDescriptionSanitized));
  });
});
