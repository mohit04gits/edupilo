import Link from "next/link";
import type { StoryProject } from "@/lib/domain";
import {
  PROJECT_STATUS_LABELS,
  formatDate,
  localeLabel,
  subjectLabel,
  isOpenIdea,
  projectTitle,
} from "@/lib/lessons/presentation";
import { LEARNER_LABELS } from "@/lib/lessons/taxonomy";
import { chip } from "../ui/styles";

export function ProjectCard({ project }: { project: StoryProject }) {
  return (
    <Link
      href={`/stories/${project.id}`}
      className="group flex h-full flex-col rounded-[20px] border border-line bg-white p-5 soft-shadow transition hover:-translate-y-0.5 hover:border-ink/30"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-mint px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-green">
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
        <time dateTime={project.updatedAt} className="text-xs text-ink-2">
          {formatDate(project.updatedAt)}
        </time>
      </div>
      <h3 className="display mt-4 text-2xl leading-tight">{projectTitle(project)}</h3>
      {!isOpenIdea(project) && (
        <p className="mt-2 line-clamp-2 text-sm text-ink-2">{project.instruction}</p>
      )}
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <span className={chip}>{LEARNER_LABELS[project.learnerLevel]}</span>
        {!isOpenIdea(project) && <span className={chip}>{subjectLabel(project.subjectKey)}</span>}
        <span className={chip}>{localeLabel(project.locale)}</span>
      </div>
      <span className="mt-4 text-sm font-bold text-ink-2 transition group-hover:text-ink">
        Open idea <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
