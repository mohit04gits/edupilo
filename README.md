# AI Educational Story Video Platform

**Project status:** Planning / pre-POC · **PRD status:** Draft — Pending Founder Review  
**Working name:** AI Educational Story Video Platform · **Last documented:** 10 November 2026

## What this project is

A proposed adult-operated platform in which **parents and teachers** turn foundational concepts for **Nursery, kindergarten, and Classes 1–4** into short, age-appropriate animated stories. The intended experience combines reusable cartoon illustrations, deterministic educational diagrams, motion, captions/labels, and **Hindi or English** narration. It is **not** an online class, general video editor, or child-facing chatbot.

This repository currently contains documentation only. No app, integration, generated video, POC, or deployment is verified as completed.

## Documentation map

| File | Responsibility |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Product vision, V1 and deferred scope, journeys, requirements, quality and acceptance criteria |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Per-decision approval statuses and PRD inconsistencies |
| [`docs/TECHNICAL_DESIGN.md`](docs/TECHNICAL_DESIGN.md) | Proposed architecture, AI pipeline, job design, MongoDB schemas, API contracts and POC design |
| [`AGENTS.md`](AGENTS.md) | Repository-level instructions and approval boundaries for Codex |
| [`PROJECT_STATUS.md`](PROJECT_STATUS.md) | Actual work completed, blockers, technical state and next priorities |
| [`docs/POC_EXECUTION_PLAN.md`](docs/POC_EXECUTION_PLAN.md) | Proposed Phase 0 validation sequence, evidence and go/change/stop gate; not implementation approval |

**Source-of-truth order:** PRD for scope → DECISIONS for approval status → approved technical design for implementation → PROJECT_STATUS for actual progress. The technical design does not grant approval to proposed tools.

## V1 at a glance

1. Adult selects Parent or Teacher experience, age/class, subject, topic and Hindi/English narration.
2. Adult describes the explanation; a structured educational script **and** storyboard are proposed together.
3. Structured rules validate concepts and quantities; a reviewer flags potential problems; an adult checks and approves the plan.
4. Reusable layered illustrations, narration and timed programmatic motion are composed into a video.
5. Adult previews and plays the result through authorized access.

**Explicitly excluded from V1:** quizzes, games, learning analytics, child accounts, online classroom functionality, paid subscriptions, voice cloning, cinematic generative video, user-facing MP4 download, and board-specific curriculum alignment.

## Technical direction — do not mistake candidates for approvals

| Area | Current documented status |
|---|---|
| Gemini creator and Groq semantic reviewer/fallback | Approved **Phase 0 evaluation direction**; exact models not approved |
| Azure AI Speech | Approved **evaluation direction**; voices and production selection pending |
| Cloudflare R2 | Approved **hosted-media direction**; access and lifecycle policies pending |
| Next.js + TypeScript + Tailwind | Proposed application stack; founder approval pending |
| MongoDB Atlas Free + Mongoose | Proposed metadata stack; free tier not for MP4 storage |
| Separate Node.js worker | Proposed; one heavy job at a time during local experiments |
| Remotion / FFmpeg | Candidate / proposed; license and feasibility checks pending |
| Illustration system | Reusable layered SVG/PNG and deterministic educational elements preferred; optional AI-generated art not part of first proof |

**Budget and hardware:** Zero-cost-first experimentation on a Windows laptop with ~8 GB RAM and Intel Iris Xe. Cloud free tiers, legal permissions, voice quality, full-resolution rendering and later hosting require verification. No paid account, paid tier or purchase is authorized by this README.

## Next step

Request explicit authorization for the narrow **rabbit-and-carrots multiplication POC** and its evaluation tools before implementation. Follow [`docs/POC_EXECUTION_PLAN.md`](docs/POC_EXECUTION_PLAN.md); do not scaffold the whole web app first.

Decisions still open include final product pivot approval, V1 scope signoff, initial topic set, proof criteria and transfer topic, mandatory adult-gate signoff, 1080p requirement signoff, aspect ratio, frame rate, authentication, full-stack architecture, retention and commercial licensing. See `docs/DECISIONS.md` for the authoritative status of each.

## Local development

There are **no verified installation or run commands yet**. Once implementation exists, add only commands confirmed to work on the actual repository. Never commit secrets; keep private media out of the repository and database binaries.
