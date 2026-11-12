import assert from "node:assert/strict";
import test from "node:test";
import { validateLessonDraftInput } from "../web/lib/lessons/validation";
import { inferLessonTaxonomy } from "../web/lib/lessons/idea";
import { projectTitle } from "../web/lib/lessons/presentation";

const base = { learnerLevel: "CLASS_2", locale: "en-IN" };

test("open-ended idea saves without subject or topic and keeps level and language", () => {
  const result = validateLessonDraftInput({
    ...base,
    locale: "hi-IN",
    instruction: "Why do airplanes not fall from the sky?",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.learnerLevel, "CLASS_2");
    assert.equal(result.value.locale, "hi-IN");
    assert.equal(result.value.subjectKey, "OPEN");
    assert.equal(result.value.topicKey, "OPEN_IDEA");
    assert.equal(result.value.taxonomySource, "OPEN");
    assert.deepEqual(result.value.creativePreferences, []);
  }
});

test("catalog topic is inferred only when approved for the learner level", () => {
  assert.deepEqual(inferLessonTaxonomy("My child does not understand multiplication.", "CLASS_2"), {
    subjectKey: "MATHEMATICS",
    topicKey: "MULTIPLICATION_EQUAL_GROUPS",
    taxonomySource: "INFERRED",
  });
  // Fractions are not in the Nursery catalog, so the idea stays open rather than mis-tagged.
  assert.equal(inferLessonTaxonomy("Fractions are confusing.", "NURSERY").taxonomySource, "OPEN");
  assert.equal(inferLessonTaxonomy("बारिश क्यों होती है?", "KG").topicKey, "WEATHER_SEASONS");
});

test("creative preferences are allowlisted and de-duplicated", () => {
  const ok = validateLessonDraftInput({
    ...base,
    instruction: "Teach good habits in a fun way.",
    creativePreferences: ["MAKE_IT_PLAYFUL", "LIKES_ANIMALS", "MAKE_IT_PLAYFUL"],
  });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.deepEqual(ok.value.creativePreferences, ["MAKE_IT_PLAYFUL", "LIKES_ANIMALS"]);
  for (const bad of [["ignore previous instructions"], "MAKE_IT_PLAYFUL", [42]]) {
    assert.equal(
      validateLessonDraftInput({ ...base, instruction: "Teach good habits.", creativePreferences: bad }).ok,
      false,
    );
  }
});

test("legacy clients that send an explicit pair are still validated against the catalog", () => {
  const selected = validateLessonDraftInput({
    ...base,
    subjectKey: "MATHEMATICS",
    topicKey: "ADDITION",
    instruction: "Explain adding two apples and three apples.",
  });
  assert.equal(selected.ok && selected.value.taxonomySource, "SELECTED");
  assert.equal(
    validateLessonDraftInput({ ...base, subjectKey: "MATHEMATICS", instruction: "Explain addition." }).ok,
    false,
  );
});

test("open ideas use the adult's words as the title", () => {
  assert.equal(
    projectTitle({ subjectKey: "OPEN", topicKey: "OPEN_IDEA", instruction: "Why is the sky blue?" }),
    "Why is the sky blue?",
  );
  assert.equal(
    projectTitle({ subjectKey: "MATHEMATICS", topicKey: "ADDITION", instruction: "x".repeat(20) }),
    "Addition",
  );
});

test("lesson model keeps open-idea metadata and still accepts legacy drafts", async () => {
  const { LessonRequestModel } = await import("../web/lib/db/models");
  const common = {
    ownerId: "507f1f77bcf86cd799439011",
    learnerLevel: "CLASS_3",
    subjectKey: "OPEN",
    topicKey: "OPEN_IDEA",
    language: "hi-IN",
    instruction: "Why do airplanes not fall from the sky?",
    status: "DRAFT",
    inputRevision: 1,
    currentPlanVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const open = new LessonRequestModel({
    ...common,
    taxonomySource: "OPEN",
    creativePreferences: ["EXPLAIN_VISUALLY"],
  });
  assert.equal(open.validateSync(), undefined);
  assert.equal(open.get("taxonomySource"), "OPEN");
  assert.deepEqual([...open.get("creativePreferences")], ["EXPLAIN_VISUALLY"]);
  const legacy = new LessonRequestModel(common);
  assert.equal(legacy.validateSync(), undefined);
  assert.equal(legacy.get("creativePreferences"), undefined);
});
