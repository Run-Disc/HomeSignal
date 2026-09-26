import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { csvEscape, neutralizeSpreadsheetText, toCsv } from "./csv";

describe("csv safety", () => {
  it("quotes commas and doubles quotes", () => {
    assert.equal(csvEscape('A, "B"'), '"A, ""B"""');
  });

  it("neutralizes formula-control prefixes", () => {
    assert.equal(neutralizeSpreadsheetText("=cmd"), "'=cmd");
    assert.equal(neutralizeSpreadsheetText("+1"), "'+1");
    assert.equal(neutralizeSpreadsheetText("-1"), "'-1");
    assert.equal(neutralizeSpreadsheetText("@SUM"), "'@SUM");
    assert.equal(toCsv(["a"], [["=1"]]).includes('"\'=1"'), true);
  });

  it("preserves empty unknowns as empty quoted fields", () => {
    assert.equal(csvEscape(null), '""');
  });
});
