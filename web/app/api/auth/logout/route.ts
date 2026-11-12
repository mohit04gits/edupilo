import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, isSameOrigin } from "@/lib/auth";
import { invalidOrigin } from "@/lib/http/responses";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return invalidOrigin();
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  clearSessionCookie(response);
  return response;
}
