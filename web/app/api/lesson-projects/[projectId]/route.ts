import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { invalidOrigin, jsonError, unauthorized } from "@/lib/http/responses";
import { deleteOwnedProject } from "@/lib/plans";
import { findOwnedProject } from "@/lib/lessons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { projectId } = await params;
  const project = await findOwnedProject(user.id, projectId);
  if (!project) return jsonError("NOT_FOUND", "Lesson project not found.", 404);
  return NextResponse.json({ project }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!isSameOrigin(request)) return invalidOrigin();
  const { projectId } = await params;
  const result = await deleteOwnedProject(user.id, projectId);
  if (result === "NOT_FOUND") return jsonError("NOT_FOUND", "This idea was not found.", 404);
  if (result === "BUSY")
    return jsonError("PLANNING_IN_PROGRESS", "We’re still writing this one. Try deleting it in a minute.", 409);
  return NextResponse.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
}
