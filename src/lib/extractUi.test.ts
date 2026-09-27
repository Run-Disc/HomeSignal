import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countsAsFailedLiveExtraction,
  extractionButtonLabel,
  shouldCallExtractionApi,
} from "./extractUi";

describe("extraction UI for keyless deployments", () => {
  it("does not call the API or claim a live request in source-review mode", () => {
    assert.equal(shouldCallExtractionApi("source-review"), false);
    assert.equal(extractionButtonLabel("source-review", false), "Extraction status");
    assert.equal(extractionButtonLabel("source-review", true), "Extraction status");
    assert.equal(countsAsFailedLiveExtraction("source-review", "unavailable"), false);
  });

  it("uses a waiting label only when a live or saved lookup is in flight", () => {
    assert.equal(shouldCallExtractionApi("live"), true);
    assert.equal(extractionButtonLabel("live", true), "Waiting for the model (up to 15 seconds)…");
    assert.equal(extractionButtonLabel("live", false), "Ask AI to extract evidence");
    assert.equal(countsAsFailedLiveExtraction("live", "unavailable"), true);
    assert.equal(countsAsFailedLiveExtraction("saved", "unavailable"), false);
  });
});
