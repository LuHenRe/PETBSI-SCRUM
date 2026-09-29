import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/domain/shared/domain-error";
import { getCurrentMember } from "@/server/authorization/membership";
import { commandSchema, executeCommand } from "@/server/commands";

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  // Authenticated cookies do not replace an Origin check for mutating HTTP endpoints.
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origem não permitida" }, { status: 403 });
  }
  try {
    const command = commandSchema.parse(await request.json());
    await executeCommand(member, command);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    if (error instanceof DomainError) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error("Falha ao executar comando", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Não foi possível concluir a operação" }, { status: 500 });
  }
}
