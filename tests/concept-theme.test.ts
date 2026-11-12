import assert from "node:assert/strict";
import test from "node:test";
import { conceptTheme } from "../web/lib/lessons/concept-theme";

test("concept preview picks a topic theme deterministically", () => {
  assert.equal(conceptTheme("Explain why the moon changes shape."), "SPACE");
  assert.equal(conceptTheme("Explain 3 × 2 as three equal groups of two carrots"), "MATHS");
  assert.equal(conceptTheme("Why we wash hands before eating"), "HYGIENE");
  assert.equal(conceptTheme("Why does it rain?"), "WEATHER");
  assert.equal(conceptTheme("How does a seed grow into a plant?"), "PLANTS");
  assert.equal(conceptTheme("Words that rhyme with cat"), "LETTERS");
  assert.equal(conceptTheme("बारिश क्यों होती है?"), "WEATHER");
  assert.equal(conceptTheme("Teach good manners"), "DEFAULT");
});
