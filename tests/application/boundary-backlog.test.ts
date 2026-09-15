import { describe, expect, it, beforeEach } from "vitest";
import { DomainError } from "@/domain/shared/domain-error";
import { createApiClient } from "@/lib/api-client";
import { testUid, resetTestUid, fixedNow } from "./fixtures/factories";

// Boundary: backlog — erro de domínio vira alert da página.
describe("boundary backlog — DomainError vira alert", () => {
  beforeEach(() => {
    resetTestUid();
  });

  function toAlert(error: unknown): string {
    if (error instanceof DomainError) return error.message;
    return "Erro inesperado ao salvar item";
  }

  it("título<3 vira alert", async () => {
    const client = createApiClient();
    let alert: string | null = null;
    try {
      await client.createItem(
        { title: "ab", frontId: "f1", priority: "alta" },
        { uid: testUid, now: fixedNow, actorId: "p5" }
      );
    } catch (e) {
      alert = toAlert(e);
    }
    expect(alert).not.toBeNull();
    expect(alert!).toMatch(/Título/i);
  });

  it("frente vazia vira alert", async () => {
    const client = createApiClient();
    let alert: string | null = null;
    try {
      await client.createItem(
        { title: "Título válido", frontId: "", priority: "alta" },
        { uid: testUid, now: fixedNow, actorId: "p5" }
      );
    } catch (e) {
      alert = toAlert(e);
    }
    expect(alert).not.toBeNull();
    expect(alert!).toMatch(/Frente/i);
  });

  it("sem permissão (Visitante) vira alert", async () => {
    const client = createApiClient();
    let alert: string | null = null;
    try {
      await client.createItem(
        { title: "Item visitante", frontId: "f3", priority: "alta" },
        { uid: testUid, now: fixedNow, actorId: "p6" }
      );
    } catch (e) {
      alert = toAlert(e);
    }
    expect(alert).not.toBeNull();
    expect(alert!).toMatch(/permissão/i);
  });

  it("save com título curto vira alert (edição)", async () => {
    const client = createApiClient();
    let alert: string | null = null;
    try {
      await client.saveItem(
        "i9",
        { title: "x", frontId: "f1", priority: "alta" },
        { now: fixedNow, actorId: "p5" }
      );
    } catch (e) {
      alert = toAlert(e);
    }
    expect(alert).not.toBeNull();
    expect(alert!).toMatch(/Título/i);
  });
});
