# Codex Operating Instructions

These instructions apply to the entire repository. Follow more specific `AGENTS.md` files if they are added under a subdirectory, but never use them to override approved product requirements or safety rules.

## 1. Project context

### Product purpose

Build an AI-assisted platform that helps an adult turn a foundational concept into an age-appropriate educational story video. The intended working audience is parents and teachers creating content for Nursery, kindergarten, and Classes 1–4. The overall child-focused pivot is still pending formal founder approval; do not represent it as finally approved until `docs/DECISIONS.md` records that approval.

The product should make concepts easier to understand through bilingual narration, illustrated storytelling, deterministic educational visuals, programmatic motion, captions or learning labels, and adult review. It is not a general-purpose video editor or unrestricted text-to-video generator.

### V1 working scope

- Adult-operated authentication and Parent/Teacher onboarding
- Learner class or age-band, subject, topic, language, and natural-language lesson input
- Hindi and English support
- Structured script and storyboard generation as one coherent plan
- Adult review, revision, and approval before media generation
- Hybrid illustrated storytelling and concept-based programmatic animation
- Deterministic rendering of counts, groups, equations, sequences, and labels
- Narration, age-adaptive captions or learning labels, synchronized visual actions, and transitions
- Asynchronous generation status, safe retry/checkpoint behavior, preview, and authorized playback
- Metadata and media persistence according to approved storage and retention decisions

Treat items marked Proposed or Pending Founder Approval in `docs/DECISIONS.md` as unavailable for implementation unless the founder explicitly approves them for the requested task.

### Explicit V1 exclusions

- User-facing video download
- Curriculum-board-specific alignment or compliance claims
- Quizzes, assessments, games, and in-video interactivity
- Learning-progress analytics and adaptive learning
- Student accounts and child-facing chatbots
- Classroom rosters and assignments
- Recommendations based on child history
- Multi-user collaboration and team features
- Payments, subscriptions, and billing
- Social or autonomous publishing
- Voice cloning and AI avatars
- Complex skeletal character animation
- Fully generated cinematic video

Do not implement a deferred feature merely because it seems useful or is easy to add.

### Educational safety and quality

- Educational usefulness and correctness take precedence over novelty.
- Treat AI content as a proposal, not trusted curriculum material.
- Keep the adult approval gate in the workflow; do not create a bypass without explicit approval.
- Calculate educational quantities and equations from structured data and validate them deterministically.
- Keep narration, visuals, labels, captions, actions, and displayed quantities semantically aligned.
- Match vocabulary, sentence length, pacing, text density, and examples to the selected age band.
- Use controlled, consistent characters and reusable visual assets before unrestricted generation.
- Reject or flag unsafe, developmentally inappropriate, discriminatory, violent, sexual, self-harm, medical, legal, or political content according to the approved safety policy. If the policy is unresolved, stop and request direction rather than inventing one.
- Never claim measured learning improvement without an approved evaluation and supporting evidence.
- Never silently substitute languages, lower final quality, alter approved facts, or replace missing assets with misleading content.

## 2. Sources of truth

Use the following order when planning or implementing work:

1. `docs/PRD.md` defines product requirements, boundaries, acceptance expectations, and open questions.
2. `docs/DECISIONS.md` defines the approval status of product and technical decisions and records known inconsistencies.
3. Approved architecture documents define implementation structure, contracts, and deployment choices. Architecture documents do not override the PRD or decision register.
4. `PROJECT_STATUS.md` records what is actually implemented, verified, blocked, or pending. It is evidence of progress, not a source of new scope.
5. Existing code and tests show current behavior but do not override approved requirements.

Before relying on a technology or feature, check its row-level status in `docs/DECISIONS.md`. “Proposed,” “candidate,” “evaluation fallback,” “open decision,” and “pending founder approval” do not mean approved. If documents disagree, report the conflict and request a decision; do not resolve it silently.

Never override an approved requirement based on convenience, convention, inference, an outdated document, or a provider limitation.

## 3. Development rules

- Implement only approved scope or a narrowly authorized experiment/POC.
- Use only approved technologies for production implementation. A tool approved for evaluation is authorized only for the approved evaluation, not automatically for production.
- Follow the approved architecture and existing repository conventions.
- Write clean, modular, maintainable code with explicit boundaries around external providers.
- Prefer the simplest design that meets current requirements. Avoid speculative abstractions, microservices, premature optimization, and unnecessary infrastructure.
- Use TypeScript where an approved architecture specifies it. Keep types and schemas strict at external and persistence boundaries.
- Do not introduce a new framework, database, queue, provider, deployment service, paid API, mandatory subscription, or infrastructure dependency without approval.
- Never treat a free tier as a production guarantee or an unlimited resource.
- Keep heavy media generation outside synchronous web request handlers when the approved architecture requires background processing.
- Make billable or expensive operations idempotent where applicable. Bound retries and preserve successful checkpoints.
- Do not store video, audio, frames, or large image binaries in a metadata database.
- Do not expose user media through permanent public object URLs.
- Preserve existing working behavior unless the approved change requires modifying it.
- Avoid unrelated refactoring, formatting churn, dependency upgrades, and generated-file changes.
- Add focused tests for new behavior and regressions in proportion to risk.
- Never hard-code API credentials, tokens, provider quotas, prices, model availability, or secrets.

## 4. AI and media pipeline rules

### Planning and review

- Require every LLM response used by the pipeline to conform to a versioned, validated structured schema.
- The creator must generate the initial script and storyboard together so narration and visuals stay coherent.
- Keep creator and reviewer responsibilities separate. Do not let a reviewer silently replace an adult-approved plan.
- Run schema validation before semantic review or downstream media work.
- Treat LLM factual review as advisory; it does not replace deterministic validation or adult approval.
- Preserve the last valid plan when a retry, correction, or fallback fails.

### Deterministic education logic

- Store numbers, equations, counts, units, sequences, and labels as structured values separate from prose.
- Compute mathematical results and object layouts in deterministic code.
- Assert that rendered quantities match the approved structured values.
- Never ask an image or video model to determine exact educational counts.

### Approval and generation

- Do not initiate TTS, asset generation, animation rendering, or other expensive media work from an unapproved plan.
- Make the approval action idempotent so repeated clicks cannot create duplicate jobs or provider charges.
- Keep revisions scoped to affected stages when safe; do not regenerate successful artifacts unnecessarily.

### Provider boundaries

- Keep LLM, semantic reviewer, TTS, storage, and renderer integrations behind replaceable interfaces.
- Keep provider-specific models, voices, regions, limits, and settings in validated configuration.
- Protect API keys server-side and redact secrets and unnecessary child information from logs.
- Respect RPM, token, character, storage, concurrency, and daily limits. Use bounded exponential backoff for retryable errors and honor provider retry guidance.
- Record provider/model identifiers, sanitized error codes, latency, attempts, and usage needed for cost visibility.
- Do not automatically switch to an unapproved provider or model.

### Narration, synchronization, and quality

- Treat generated narration timing as authoritative after audio synthesis; storyboard estimates are planning aids.
- Drive captions, labels, object reveals, counting actions, and transitions from normalized word or phrase timing.
- Never silently change the requested narration language or voice.
- If a voice, asset, renderer, or provider cannot meet the approved quality bar, fail clearly or return the project for review.
- Reduced-quality previews may be used only when approved and clearly labeled. Never substitute a preview for the required final-quality output.
- Validate final media integrity, duration, streams, readable text, audio quality, synchronization, and authorized playback.

## 5. Codex workflow

### Before implementation

1. Read the relevant sections of `docs/PRD.md`, `docs/DECISIONS.md`, approved architecture documents, `PROJECT_STATUS.md`, and applicable repository instructions.
2. Inspect existing code, tests, configuration, and the working tree before proposing changes.
3. Summarize the requested outcome and distinguish approved scope from assumptions or unresolved decisions.
4. Identify the files and systems expected to change.
5. Explain significant design, provider, cost, privacy, licensing, or migration implications.
6. Request explicit approval before changing product scope, architecture, provider selection, data retention, security posture, paid usage, or a Pending/Proposed decision.

Do not ask for approval for routine, reversible implementation details already inside approved scope unless repository instructions require it.

### During implementation

1. Implement only the requested and approved functionality.
2. Keep the patch focused; avoid unrelated refactoring.
3. Preserve compatible behavior and user data.
4. Validate inputs and handle relevant provider, authorization, storage, job, and rendering errors.
5. Follow existing naming, structure, linting, formatting, testing, and logging conventions.
6. Keep external operations observable, retry-safe, and bounded.
7. Stop and request direction if implementation exposes an unresolved product, architecture, privacy, safety, licensing, or cost decision.

### After implementation

1. Summarize the completed behavior and affected files.
2. Report the exact verification performed and its outcome.
3. Disclose failed checks, skipped checks, limitations, assumptions, and unresolved risks.
4. Update `PROJECT_STATUS.md` when the change materially affects actual implementation status, verification, blockers, or next steps.
5. Do not report a feature as complete without implementation and verification evidence.

## 6. Documentation rules

- Keep project documentation in Markdown unless an approved deliverable requires another format.
- Update relevant technical documentation after approved architecture, interface, operational, or workflow changes.
- Do not rewrite, normalize, or “clean up” `docs/PRD.md` automatically.
- Do not change a decision status in `docs/DECISIONS.md` without explicit founder approval or documented evidence required by the existing decision.
- Record important architectural decisions and their consequences in the approved architecture-decision format or location. If none exists, propose one before creating it.
- Keep examples consistent with approved schemas and behavior.
- Use `PROJECT_STATUS.md` for factual progress only. Separate implemented, verified, blocked, and planned work.
- Never mark work complete because files were created, code compiled, or an API returned once; use the relevant acceptance and verification evidence.

## 7. Budget and infrastructure constraints

- Follow a zero-cost-first development strategy, while preserving approved safety and quality requirements.
- Prefer reusable project-owned layered SVG/PNG assets, deterministic programmatic visuals, local development tools, caching, and selective regeneration.
- Use provider free tiers only within documented current limits and acceptable data terms.
- Avoid unnecessary hosted services, queues, containers, databases, and observability platforms.
- Design for the available 8 GB Windows development laptop: run heavy work sequentially unless measurements and approval justify concurrency.
- Never lower final quality, weaken validation, or bypass safety merely to remain free.
- Measure tokens, characters, provider requests, retries, render time, memory, output size, storage, and estimated cost during POCs.
- Obtain founder approval before enabling paid usage, adding billing details, purchasing assets/licenses, or introducing an expense commitment.

## 8. Safety, privacy, and access control

- Accounts are adult-operated. Do not create direct child accounts in V1.
- Collect the minimum learner context required. Prefer class or age band over date of birth.
- Do not require or infer a child’s full name, photo, voice, school, precise location, or other unnecessary identifiers.
- Do not add child personalization while its approval remains unresolved.
- Protect every project, plan, job, and media reference with user-level authorization.
- Use authenticated access or short-lived signed media URLs; do not expose permanent public media URLs.
- Sanitize generated text, SVG, HTML, filenames, logs, and renderer inputs.
- Keep credentials and provider secrets out of client code, repositories, media, logs, and error responses.
- Preserve consent/version information and support approved deletion and retention behavior once defined.
- Avoid behavioral tracking, targeted advertising, profiling, and manipulative engagement patterns aimed at children.
- Validate generated educational content for schema, age level, factual consistency, quantities, language, visual safety, and narration/visual agreement before adult review.
- If a safety or retention policy is not yet approved, do not invent production behavior; flag the blocker and request approval.

## 9. Current approval guardrails

At the time this file was created, the following distinctions are especially important:

- Gemini is approved as the Phase 0 creator/planner direction; the exact model and production configuration are not approved.
- A Groq-hosted open model is approved as the Phase 0 reviewer/fallback direction; the exact model is not approved.
- ElevenLabs is approved only as the internal Phase 0 narration evaluation default; exact model/voices, privacy suitability, quota behavior, and production/commercial use are not approved. Do not enable paid usage. Azure AI Speech is superseded as the default and requires separate reauthorization.
- Cloudflare R2 is the approved hosted-media direction; access, retention, deletion, backup, and pricing configuration remain open.
- Next.js, TypeScript stack composition, MongoDB Atlas/Mongoose, the separate worker, Remotion, FFmpeg, Tailwind, REST endpoints, and job persistence remain Proposed, Candidate, or otherwise unresolved unless `docs/DECISIONS.md` is updated after approval.
- Remotion is not an approved commercial dependency. FFmpeg distribution and codec compliance are not approved until reviewed.
- Aspect ratio, FPS, authentication method, initial topics, retention, licensing, and several safety/operations decisions remain open.

Always re-read `docs/DECISIONS.md`; this summary may become stale as decisions are formally updated.
