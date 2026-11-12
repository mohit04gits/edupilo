import { NextRequest,NextResponse } from "next/server";
import { getCurrentUser,isSameOrigin } from "@/lib/auth";
import { invalidOrigin,jsonError,unauthorized } from "@/lib/http/responses";
import { approveOwnedPlan } from "@/lib/plans";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:NextRequest,{params}:{params:Promise<{projectId:string;planId:string}>}){const user=await getCurrentUser();if(!user)return unauthorized();if(!isSameOrigin(request))return invalidOrigin();const {projectId,planId}=await params;const plan=await approveOwnedPlan(user.id,projectId,planId);if(!plan)return jsonError("PLAN_NOT_APPROVABLE","This plan is missing, blocked, already approved, or no longer current.",409);return NextResponse.json({plan})}
