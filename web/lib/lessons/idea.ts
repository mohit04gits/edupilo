import type { LearnerLevel } from "../domain";
import { APPROVED_TAXONOMY, type SubjectKey, type TopicKey } from "./taxonomy";

/** Stored when an open-ended idea does not map to the approved V1 catalog. */
export const OPEN_SUBJECT_KEY = "OPEN";
export const OPEN_TOPIC_KEY = "OPEN_IDEA";

/** How subject/topic metadata was obtained. The adult never has to pick them in the UI. */
export type TaxonomySource = "SELECTED" | "INFERRED" | "OPEN";

/** Optional creative hints. A fixed allowlist: free text never reaches prompts through this field. */
export const CREATIVE_PREFERENCES = {
  LIKES_ANIMALS: "My child likes animals",
  ADVENTURE_STYLE: "Use an adventure style",
  EXPLAIN_VISUALLY: "Explain it visually",
  MAKE_IT_PLAYFUL: "Make it playful",
  KEEP_IT_SIMPLE: "Keep it simple",
} as const;
export type CreativePreference = keyof typeof CREATIVE_PREFERENCES;
export const MAX_CREATIVE_PREFERENCES = Object.keys(CREATIVE_PREFERENCES).length;

export function isCreativePreference(value: unknown): value is CreativePreference {
  return typeof value === "string" && Object.hasOwn(CREATIVE_PREFERENCES, value);
}

/**
 * Deterministic keyword hints (English + Hindi) → approved catalog topic. This is advisory
 * metadata for later planning, not a content decision; unmatched ideas are stored as OPEN.
 * Order matters: more specific topics first.
 */
const TOPIC_HINTS: ReadonlyArray<readonly [SubjectKey, TopicKey, RegExp]> = [
  ["MATHEMATICS", "BASIC_FRACTIONS", /fraction|half|halves|quarter|भिन्न|आधा/i],
  ["MATHEMATICS", "MULTIPLICATION_EQUAL_GROUPS", /multipl|times table|equal groups|गुणा|पहाड़ा/i],
  ["MATHEMATICS", "SIMPLE_DIVISION", /divi|share equally|sharing|भाग|बाँट|बांट/i],
  ["MATHEMATICS", "SUBTRACTION", /subtract|minus|take away|घटा/i],
  ["MATHEMATICS", "ADDITION", /\badd|addition|plus|sum\b|जोड़/i],
  ["MATHEMATICS", "SHAPES_PATTERNS", /shape|circle|triangle|square|pattern|आकार|आकृति/i],
  ["MATHEMATICS", "COUNTING", /count|number|गिन|संख्या/i],
  ["ENVIRONMENTAL_STUDIES", "PLANTS_GROWTH", /plant|seed|tree|grow|flower|पौध|बीज|पेड़/i],
  ["ENVIRONMENTAL_STUDIES", "ANIMALS_HABITATS", /animal|habitat|bird|fish|insect|जानवर|पशु|पक्षी/i],
  ["ENVIRONMENTAL_STUDIES", "WEATHER_SEASONS", /weather|season|rain|monsoon|winter|summer|मौसम|बारिश/i],
  ["ENVIRONMENTAL_STUDIES", "HEALTHY_HABITS", /habit|brush|wash|clean|hygiene|healthy|आदत|सफ़ाई|सफाई/i],
  ["ENVIRONMENTAL_STUDIES", "COMMUNITY_HELPERS", /doctor|police|farmer|postman|helper|firefighter/i],
  ["ENGLISH", "RHYMING_WORDS", /rhym|तुक/i],
  ["ENGLISH", "ALPHABET_PHONICS", /alphabet|phonic|letter|abc|वर्णमाला|अक्षर/i],
  ["ENGLISH", "SIMPLE_SENTENCES", /sentence|grammar|वाक्य/i],
  ["ENGLISH", "STORY_COMPREHENSION", /comprehension|reading|story understanding/i],
  ["ENGLISH", "VOCABULARY", /vocabulary|new words|meaning of|शब्द/i],
];

export function inferLessonTaxonomy(
  instruction: string,
  level: LearnerLevel,
): { subjectKey: string; topicKey: string; taxonomySource: TaxonomySource } {
  for (const [subjectKey, topicKey, pattern] of TOPIC_HINTS) {
    if (pattern.test(instruction) && APPROVED_TAXONOMY[level][subjectKey].includes(topicKey)) {
      return { subjectKey, topicKey, taxonomySource: "INFERRED" };
    }
  }
  return { subjectKey: OPEN_SUBJECT_KEY, topicKey: OPEN_TOPIC_KEY, taxonomySource: "OPEN" };
}
