import type { LearnerLevel, NormalizedPlanDraft } from "../domain";
import type { ReviewFinding } from "../ai/contracts";

export interface AgeQualityRules {
  maxWordsPerSentence: number;
  vocabularyGuidance: string;
  advancedWords: readonly string[];
}

export const AGE_QUALITY_RULES: Readonly<Record<LearnerLevel, AgeQualityRules>> = {
  NURSERY: { maxWordsPerSentence: 8, vocabularyGuidance: "Use familiar everyday words. Avoid technical terms unless immediately explained in very simple words.", advancedWords: ["orbit", "orbits", "phase", "phases", "lunar", "waxing", "waning", "crescent"] },
  KG: { maxWordsPerSentence: 10, vocabularyGuidance: "Use simple concrete words and explain every new idea with a familiar example.", advancedWords: ["lunar", "waxing", "waning", "photosynthesis", "atmosphere"] },
  CLASS_1: { maxWordsPerSentence: 12, vocabularyGuidance: "Use short concrete explanations and define unfamiliar subject words in plain language.", advancedWords: ["photosynthesis", "atmospheric", "denominator", "numerator"] },
  CLASS_2: { maxWordsPerSentence: 14, vocabularyGuidance: "Use clear primary-school vocabulary and explain new subject terms with a visible example.", advancedWords: ["photosynthesis", "atmospheric", "denominator"] },
  CLASS_3: { maxWordsPerSentence: 16, vocabularyGuidance: "Introduce one technical term at a time and explain it with a concrete visual example.", advancedWords: ["atmospheric", "metamorphosis"] },
  CLASS_4: { maxWordsPerSentence: 18, vocabularyGuidance: "Use age-appropriate subject vocabulary, defining technical terms before relying on them.", advancedWords: ["anthropogenic", "stoichiometry"] },
};

export const MIN_PLAN_SCENES = 4;
export const MIN_PLAN_DURATION_MS = 45_000;

const words = (text: string) => text.match(/[\p{L}\p{N}]+/gu) ?? [];
const sentences = (text: string) => text.split(/[.!?।]+/u).map((part) => part.trim()).filter(Boolean);

export interface PlanQualityResult {
  valid: boolean;
  totalDurationMs: number;
  findings: ReviewFinding[];
}

export function validatePlanQuality(plan: NormalizedPlanDraft, level: LearnerLevel): PlanQualityResult {
  const rules = AGE_QUALITY_RULES[level], findings: ReviewFinding[] = [];
  const totalDurationMs = plan.scenes.reduce((sum, scene) => sum + scene.estimatedDurationMs, 0);
  if (plan.scenes.length < MIN_PLAN_SCENES) findings.push({ code: "TOO_FEW_SCENES", severity: "ERROR", sceneIndex: null, message: `Use at least ${MIN_PLAN_SCENES} purposeful scenes with a hook, exploration, demonstration, and recap.` });
  if (totalDurationMs < MIN_PLAN_DURATION_MS) findings.push({ code: "PLAN_TOO_SHORT", severity: "ERROR", sceneIndex: null, message: "Allow at least about 45 seconds so the learner can follow the idea without rushing." });
  plan.scenes.forEach((scene, sceneIndex) => {
    sentences(scene.narration).forEach((sentence) => {
      const count = words(sentence).length;
      if (count > rules.maxWordsPerSentence) findings.push({ code: "SENTENCE_TOO_LONG", severity: "ERROR", sceneIndex, message: `Keep narration sentences to ${rules.maxWordsPerSentence} words or fewer for this learner level.` });
    });
    const narrationWords = new Set(words(scene.narration.toLocaleLowerCase("en-IN")));
    const advanced = rules.advancedWords.filter((word) => narrationWords.has(word));
    if (advanced.length) findings.push({ code: "VOCABULARY_TOO_ADVANCED", severity: "ERROR", sceneIndex, message: `Replace or immediately explain advanced words: ${advanced.join(", ")}.` });
  });
  return { valid: findings.length === 0, totalDurationMs, findings };
}
