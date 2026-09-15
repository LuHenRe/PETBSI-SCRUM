import { describe, expect, it, beforeEach } from "vitest";
import { DomainError } from "@/domain/shared/domain-error";
import { createApiClient } from "@/lib/api-client";
import { testUid, resetTestUid, fixedNow } from "./fixtures/factories";

// Boundary: fluxo — erro de domínio vira wipWarning de UI (sem regra na página).
describe("boundary fluxo — DomainError vira mensagem de UI", () => {
  beforeEach(() => {
    resetTestUid();
  });

  function toWipWarning(error: unknown): string {
    // Contrato da página: exibe DomainError.message em wipWarning.
    if (error instanceof DomainError) return error.message;
    return "Erro inesperado ao mover item";
  }

  it("WIP excedido vira wipWarning (burlado via console falha)", async () => {
    const client = createApiClient();
    // i14 backlog/f2; SM tenta backlog->todo mas todo está 4/4.
    let warning: string | null = null;
    try {
      await client.moveItem("i14", "todo", { actorId: "p3" });
    } catch (e) {
      warning = toWipWarning(e);
    }
    expect(warning).not.toBeNull();
    expect(warning!).toMatch(/WIP/i);
  });

  it("sem permissão vira acesso negado (membro de outra frente)", async () => {
    const client = createApiClient();
    // i9 está em f1; p7 é membro de f2 sem override.
    let warning: string | null = null;
    try {
      await client.moveItem("i9", "review", { actorId: "p7" });
    } catch (e) {
      warning = toWipWarning(e);
    }
    expect(warning).not.toBeNull();
    expect(warning!).toMatch(/permissão/i);
  });

  it("Visitante bloqueado vira acesso negado", async () => {
    const client = createApiClient();
    let warning: string | null = null;
    try {
      await client.moveItem("i15", "todo", { actorId: "p6" });
    } catch (e) {
      warning = toWipWarning(e);
    }
    expect(warning).not.toBeNull();
    expect(warning!).toMatch(/permissão/i);
  });

  it("transição proibida vira mensagem (backlog->done)", async () => {
    const client = createApiClient();
    let warning: string | null = null;
    try {
      await client.moveItem("i15", "done", { actorId: "p3" });
    } catch (e) {
      warning = toWipWarning(e);
    }
    expect(warning).not.toBeNull();
    expect(warning!).toMatch(/Transição inválida/i);
  });

  it("bloqueio sem permissão vira mensagem (manage-blocker via api-client)", async () => {
    const client = createApiClient();
    let warning: string | null = null;
    try {
      await client.openBlocker("i9", "Tentativa sem permissão", {
        uid: testUid,
        now: fixedNow,
        actorId: "p7",
      });
    } catch (e) {
      warning = toWipWarning(e);
    }
    expect(warning).not.toBeNull();
    expect(warning!).toMatch(/permissão/i);
  });
});
