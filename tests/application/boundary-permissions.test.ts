import { describe, expect, it, beforeEach } from "vitest";
import { DomainError } from "@/domain/shared/domain-error";
import { createApiClient } from "@/lib/api-client";
import { testUid, resetTestUid, fixedNow } from "./fixtures/factories";

// MT-4.3 — Permissões + Visitante (RF24, RN10, RN13)
// Membro perde a capacidade de edição após o SM revogar canEdit:
// criar, mover e salvar passam a ser rejeitados; vínculo exibe "Visitante".
describe("MT-4.3 boundary-permissions", () => {
  beforeEach(() => {
    resetTestUid();
  });

  it("membro perde edição após revogar: criar/mover/salvar bloqueados", async () => {
    const client = createApiClient();

    // Antes de revogar, p5 (membro f1 com edição) cria em f1.
    const before = await client.createItem(
      { title: "Item antes da revogação", frontId: "f1", priority: "alta" },
      { uid: testUid, now: fixedNow, actorId: "p5" }
    );
    expect(before.id).toBeTruthy();

    // SM revoga a edição de m5 (p5/f1).
    const revoked = await client.setCanEdit("m5", false, {
      actorId: "p3",
      now: fixedNow,
    });
    expect(revoked.canEdit).toBe(false);
    expect(revoked.displayTitle).toBe("Visitante");

    // Criar passa a ser rejeitado.
    await expect(
      client.createItem(
        { title: "Item após revogação", frontId: "f1", priority: "alta" },
        { uid: testUid, now: fixedNow, actorId: "p5" }
      )
    ).rejects.toThrow(DomainError);

    // Mover item da frente passa a ser rejeitado (i9 está em in_progress/f1).
    await expect(
      client.moveItem("i9", "review", { actorId: "p5", now: fixedNow })
    ).rejects.toThrow(DomainError);

    // Salvar (editar) passa a ser rejeitado.
    await expect(
      client.saveItem(
        "i9",
        { title: "Edição após revogação", frontId: "f1", priority: "alta" },
        { actorId: "p5", now: fixedNow }
      )
    ).rejects.toThrow(DomainError);
  });

  it("SM mantém override após revogar membro comum", async () => {
    const client = createApiClient();
    await client.setCanEdit("m5", false, {
      actorId: "p3",
      now: fixedNow,
    });
    // SM (tech admin) continua podendo mover item de f1.
    const moved = await client.moveItem("i9", "review", {
      actorId: "p3",
      now: fixedNow,
    });
    expect(moved.status).toBe("review");
  });
});
