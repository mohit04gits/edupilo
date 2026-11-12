import { NextRequest, NextResponse } from "next/server";
import { clientAddress, consumeRateLimit, getCurrentUser, isSameOrigin } from "@/lib/auth";
import { invalidOrigin, jsonError, rateLimited, unauthorized } from "@/lib/http/responses";
import {
  createLessonDraft,
  findRecentOwnedProjects,
  validateLessonDraftInput,
} from "@/lib/lessons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json(
    { projects: await findRecentOwnedProjects(user.id) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!isSameOrigin(request)) return invalidOrigin();

  const limit = consumeRateLimit(
    `lesson-draft:${user.id}:${clientAddress(request.headers)}`,
    30,
    10 * 60 * 1000,
  );
  if (!limit.allowed) {
    return rateLimited("Too many draft requests. Try again shortly.", limit.retryAfterSeconds);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_REQUEST", "Complete the lesson details.", 400);
  }
  const parsed = validateLessonDraftInput(body);
  if (!parsed.ok) return jsonError("VALIDATION_ERROR", parsed.message, 400);

  try {
    return NextResponse.json(
      { project: await createLessonDraft(user.id, parsed.value) },
      { status: 201 },
    );
  } catch {
    console.error("[lessons] draft creation failed");
    return jsonError("LESSON_UNAVAILABLE", "Unable to save the lesson draft right now.", 500);
  }
}
