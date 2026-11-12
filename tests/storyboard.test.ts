import assert from 'node:assert/strict';
import test from 'node:test';
import rawStoryboard from '../src/domain/storyboard.json';
import {validateStoryboard} from '../src/domain/storyboard';

test('approved storyboard validates', () => {
  const result = validateStoryboard(rawStoryboard);
  assert.equal(result.lesson.facts.groups, 3);
  assert.equal(result.lesson.facts.itemsPerGroup, 2);
  assert.equal(result.lesson.facts.total, 6);
});

test('wrong total is rejected deterministically', () => {
  const invalid = structuredClone(rawStoryboard);
  invalid.lesson.facts.total = 7;
  assert.throws(() => validateStoryboard(invalid), /Math invariant failed/);
});

test('wrong equation is rejected deterministically', () => {
  const invalid = structuredClone(rawStoryboard);
  invalid.lesson.facts.multiplicationEquation = '3 × 2 = 7';
  assert.throws(() => validateStoryboard(invalid), /Multiplication equation/);
});

test('timeline gaps are rejected', () => {
  const invalid = structuredClone(rawStoryboard);
  invalid.languages.en.scenes[1].startMs += 100;
  assert.throws(() => validateStoryboard(invalid), /timeline must be contiguous/);
});
