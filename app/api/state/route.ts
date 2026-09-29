import { NextResponse } from "next/server";
import { getCurrentMember } from "@/server/authorization/membership";
import { getDashboardState } from "@/server/dashboard-state";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  return NextResponse.json(await getDashboardState(member), { headers: { "Cache-Control": "no-store" } });
}
