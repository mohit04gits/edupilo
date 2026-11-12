import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, unauthorized } from "@/lib/http/responses";
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
