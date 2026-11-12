import type { Locale, StoryProject } from "../domain";
import { CREATIVE_PREFERENCES, OPEN_SUBJECT_KEY, OPEN_TOPIC_KEY } from "./idea";
import { SUBJECTS, TOPICS, type SubjectKey, type TopicKey } from "./taxonomy";

export const PROJECT_STATUS_LABELS: Record<StoryProject["status"], string> = {
  DRAFT: "Draft",
  PLANNING: "Planning",
  REVIEW_READY: "Ready for review",
  APPROVED: "Approved",
  ARCHIVED: "Archived",
};

export const LOCALE_LABELS: Record<Locale, string> = { "en-IN": "English", "hi-IN": "Hindi" };

export const topicLabel = (key: string): string =>
  key === OPEN_TOPIC_KEY ? "Open learning idea" : (TOPICS[key as TopicKey] ?? key);
export const subjectLabel = (key: string): string =>
  key === OPEN_SUBJECT_KEY ? "Open idea" : (SUBJECTS[key as SubjectKey] ?? key);

export const isOpenIdea = (project: Pick<StoryProject, "subjectKey">): boolean =>
  project.subjectKey === OPEN_SUBJECT_KEY;

/** Card/page title: the catalog topic when known, otherwise the adult's own words. */
export function projectTitle(project: Pick<StoryProject, "subjectKey" | "topicKey" | "instruction">) {
  if (!isOpenIdea(project)) return topicLabel(project.topicKey);
  const text = project.instruction.replace(/\s+/g, " ").trim();
  return text.length > 70 ? `${text.slice(0, 67).trimEnd()}…` : text;
}

export const preferenceLabel = (key: string): string =>
  CREATIVE_PREFERENCES[key as keyof typeof CREATIVE_PREFERENCES] ?? key;
export const localeLabel = (locale: Locale): string => LOCALE_LABELS[locale] ?? locale;

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatDate = (iso: string): string => dateFormat.format(new Date(iso));
export const formatDateTime = (iso: string): string => dateTimeFormat.format(new Date(iso));
