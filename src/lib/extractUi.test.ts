import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countsAsFailedLiveExtraction,
  extractionButtonLabel,
  reviewStatusChip,
  shouldCallExtractionApi,
} from "./extractUi";

describe("extraction UI for keyless deployments", () => {
  it("can call the extract API in source-review for simulated extraction", () => {
    assert.equal(shouldCallExtractionApi("source-review"), true);
    assert.equal(extractionButtonLabel("source-review", false), "Extract evidence");
    assert.equal(extractionButtonLabel("source-review", true), "Preparing simulated extraction…");
    assert.equal(countsAsFailedLiveExtraction("source-review", "unavailable"), false);
  });

  it("uses a waiting label only when a live or saved lookup is in flight", () => {
    assert.equal(shouldCallExtractionApi("live"), true);
    assert.equal(extractionButtonLabel("live", true), "Waiting for the model (up to 15 seconds)…");
    assert.equal(extractionButtonLabel("live", false), "Ask AI to extract evidence");
    assert.equal(countsAsFailedLiveExtraction("live", "unavailable"), true);
    assert.equal(countsAsFailedLiveExtraction("saved", "unavailable"), false);
  });

  it("never shows an extraction as accepted until a person saves a decision", () => {
    assert.deepEqual(reviewStatusChip(undefined, true), { label: "Extracted — review required", tone: "pending" });
    assert.deepEqual(reviewStatusChip("unreviewed", false), { label: "Not reviewed", tone: "pending" });
    assert.equal(reviewStatusChip("accepted", true).label, "Accepted by reviewer");
    assert.equal(reviewStatusChip("rejected", true).tone, "excluded");
  });
});
