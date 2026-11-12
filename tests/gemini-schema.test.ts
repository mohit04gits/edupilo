import assert from "node:assert/strict";
import test from "node:test";
import { geminiPlanJsonSchema, withOmittedPlanDefaults } from "../web/lib/ai/schemas";

test("Gemini plan schema has no nullable unions, asset layers or free-form parameters", () => {
  const text = JSON.stringify(geminiPlanJsonSchema);
  assert.equal(text.includes('"null"'), false);
  assert.equal(text.includes("requiredLayers"), false);
  assert.equal(text.includes('"parameters"'), false);
});

test("omitted Gemini fields are restored before normalisation", () => {
  const restored = withOmittedPlanDefaults({
    scenes: [{ narration: "Hi", actions: [{ id: "a1", type: "SHOW_LABEL" }] }],
  }) as { scenes: { assets: unknown[]; actions: { parameters: object }[] }[] };
  assert.deepEqual(restored.scenes[0].assets, []);
  assert.deepEqual(restored.scenes[0].actions[0].parameters, {});
});
