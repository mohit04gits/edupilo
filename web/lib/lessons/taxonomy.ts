import type { LearnerLevel } from "../domain";
export const SUBJECTS = {
  MATHEMATICS: "Mathematics",
  ENVIRONMENTAL_STUDIES: "Environmental Studies",
  ENGLISH: "English",
} as const;
export type SubjectKey = keyof typeof SUBJECTS;
export const TOPICS = {
  COUNTING: "Counting",
  SHAPES_PATTERNS: "Shapes and Patterns",
  ADDITION: "Addition",
  SUBTRACTION: "Subtraction",
  MULTIPLICATION_EQUAL_GROUPS: "Multiplication as Equal Groups",
  SIMPLE_DIVISION: "Simple Division",
  BASIC_FRACTIONS: "Basic Fractions",
  ANIMALS_HABITATS: "Animals and Habitats",
  PLANTS_GROWTH: "Plants and Growth",
  WEATHER_SEASONS: "Weather and Seasons",
  COMMUNITY_HELPERS: "Community Helpers",
  HEALTHY_HABITS: "Healthy Habits",
  ALPHABET_PHONICS: "Alphabet and Phonics",
  VOCABULARY: "Vocabulary",
  RHYMING_WORDS: "Rhyming Words",
  SIMPLE_SENTENCES: "Simple Sentences",
  STORY_COMPREHENSION: "Story Comprehension",
} as const;
export type TopicKey = keyof typeof TOPICS;
const EARLY_MATH = ["COUNTING", "SHAPES_PATTERNS"] as const,
  MATH_1 = [...EARLY_MATH, "ADDITION", "SUBTRACTION"] as const,
  MATH_2 = [
    "SHAPES_PATTERNS",
    "ADDITION",
    "SUBTRACTION",
    "MULTIPLICATION_EQUAL_GROUPS",
    "SIMPLE_DIVISION",
  ] as const,
  MATH_34 = [
    "ADDITION",
    "SUBTRACTION",
    "MULTIPLICATION_EQUAL_GROUPS",
    "SIMPLE_DIVISION",
    "BASIC_FRACTIONS",
  ] as const;
const EARLY_EVS = ["ANIMALS_HABITATS", "WEATHER_SEASONS", "HEALTHY_HABITS"] as const,
  ALL_EVS = [
    "ANIMALS_HABITATS",
    "PLANTS_GROWTH",
    "WEATHER_SEASONS",
    "COMMUNITY_HELPERS",
    "HEALTHY_HABITS",
  ] as const;
const EARLY_ENGLISH = ["ALPHABET_PHONICS", "VOCABULARY", "RHYMING_WORDS"] as const,
  ALL_ENGLISH = [...EARLY_ENGLISH, "SIMPLE_SENTENCES", "STORY_COMPREHENSION"] as const;
export const APPROVED_TAXONOMY: Readonly<
  Record<LearnerLevel, Readonly<Record<SubjectKey, readonly TopicKey[]>>>
> = {
  NURSERY: { MATHEMATICS: EARLY_MATH, ENVIRONMENTAL_STUDIES: EARLY_EVS, ENGLISH: EARLY_ENGLISH },
  KG: { MATHEMATICS: EARLY_MATH, ENVIRONMENTAL_STUDIES: EARLY_EVS, ENGLISH: EARLY_ENGLISH },
  CLASS_1: { MATHEMATICS: MATH_1, ENVIRONMENTAL_STUDIES: ALL_EVS, ENGLISH: ALL_ENGLISH },
  CLASS_2: { MATHEMATICS: MATH_2, ENVIRONMENTAL_STUDIES: ALL_EVS, ENGLISH: ALL_ENGLISH },
  CLASS_3: { MATHEMATICS: MATH_34, ENVIRONMENTAL_STUDIES: ALL_EVS, ENGLISH: ALL_ENGLISH },
  CLASS_4: { MATHEMATICS: MATH_34, ENVIRONMENTAL_STUDIES: ALL_EVS, ENGLISH: ALL_ENGLISH },
};
export const LEARNER_LABELS: Readonly<Record<LearnerLevel, string>> = {
  NURSERY: "Nursery",
  KG: "KG",
  CLASS_1: "Class 1",
  CLASS_2: "Class 2",
  CLASS_3: "Class 3",
  CLASS_4: "Class 4",
};
export function isApprovedLessonTopic(
  level: LearnerLevel,
  subject: string,
  topic: string,
): subject is SubjectKey {
  return (
    subject in SUBJECTS &&
    (APPROVED_TAXONOMY[level][subject as SubjectKey] as readonly string[]).includes(topic)
  );
}
