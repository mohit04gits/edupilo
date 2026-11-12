import { LEARNER_LEVELS, SUPPORTED_LOCALES, type LearnerLevel, type Locale } from "../domain";
import {
  MAX_CREATIVE_PREFERENCES,
  inferLessonTaxonomy,
  isCreativePreference,
  type CreativePreference,
  type TaxonomySource,
} from "./idea";
import { isApprovedLessonTopic } from "./taxonomy";

export const IDEA_MIN_LENGTH = 10;
export const IDEA_MAX_LENGTH = 2000;

export interface LessonDraftInput {
  learnerLevel: LearnerLevel;
  /** Approved catalog key, an inferred catalog key, or "OPEN" for open-ended ideas. */
  subjectKey: string;
  topicKey: string;
  taxonomySource: TaxonomySource;
  locale: Locale;
  instruction: string;
  creativePreferences: CreativePreference[];
}

export type LessonDraftValidation =
  | { ok: true; value: LessonDraftInput }
  | { ok: false; message: string };

/**
 * Accepts an open-ended learning idea. Subject/topic are optional: when both are supplied
 * (legacy clients) they must still be an approved pair; when absent they are inferred
 * deterministically or stored as OPEN.
 */
export function validateLessonDraftInput(value: unknown): LessonDraftValidation {
  if (typeof value !== "object" || value === null)
    return { ok: false, message: "Tell us what you’d like to teach." };
  const x = value as Record<string, unknown>;
  const learnerLevel = x.learnerLevel;
  const locale = x.locale;
  const instruction =
    typeof x.instruction === "string" ? x.instruction.trim().normalize("NFKC") : "";

  if (
    typeof learnerLevel !== "string" ||
    !(LEARNER_LEVELS as readonly string[]).includes(learnerLevel)
  )
    return { ok: false, message: "Choose a supported learner level." };
  if (typeof locale !== "string" || !(SUPPORTED_LOCALES as readonly string[]).includes(locale))
    return { ok: false, message: "Choose English or Hindi." };
  if (instruction.length < IDEA_MIN_LENGTH || instruction.length > IDEA_MAX_LENGTH)
    return {
      ok: false,
      message: `Describe your idea in ${IDEA_MIN_LENGTH}–${IDEA_MAX_LENGTH} characters.`,
    };

  const level = learnerLevel as LearnerLevel;
  let taxonomy: { subjectKey: string; topicKey: string; taxonomySource: TaxonomySource };
  const hasSubject = x.subjectKey !== undefined && x.subjectKey !== null && x.subjectKey !== "";
  const hasTopic = x.topicKey !== undefined && x.topicKey !== null && x.topicKey !== "";
  if (hasSubject || hasTopic) {
    if (
      typeof x.subjectKey !== "string" ||
      typeof x.topicKey !== "string" ||
      !isApprovedLessonTopic(level, x.subjectKey, x.topicKey)
    )
      return { ok: false, message: "Choose an approved subject and topic for this learner level." };
    taxonomy = { subjectKey: x.subjectKey, topicKey: x.topicKey, taxonomySource: "SELECTED" };
  } else {
    taxonomy = inferLessonTaxonomy(instruction, level);
  }

  const rawPreferences = x.creativePreferences ?? [];
  if (
    !Array.isArray(rawPreferences) ||
    rawPreferences.length > MAX_CREATIVE_PREFERENCES ||
    !rawPreferences.every(isCreativePreference)
  )
    return { ok: false, message: "Choose from the suggested creative options." };

  return {
    ok: true,
    value: {
      learnerLevel: level,
      ...taxonomy,
      locale: locale as Locale,
      instruction,
      creativePreferences: [...new Set(rawPreferences)],
    },
  };
}
