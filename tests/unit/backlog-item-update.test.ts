import { describe, expect, it, beforeEach } from "vitest";
import { BacklogItem } from "@/domain/backlog/backlog-item";
import { DomainError } from "@/domain/shared/domain-error";
import { MemoryBacklogRepository } from "@/adapters/memory/memory-backlog-repository";
import { MemoryAudit } from "@/adapters/memory/memory-audit";
import {
  createBacklogItem,
  saveBacklogItem,
} from "@/application/backlog/manage-backlog-item";
import {
  resetTestUid,
  testUid,
  fixedNow,
  memberF1,
  visitanteF1,
} from "../application/fixtures/factories";

// MT-4.1 — BacklogItem.updateFields (RF03, RF10)
// Cobre: válido gera histórico edited sem mudar status; título curto rejeita;
// frente vazia rejeita; Visitante bloqueado no application.
describe("MT-4.1 BacklogItem.updateFields", () => {
  const base = {
    id: "i1",
    title: "Título original",
    description: "Descrição original",
    frontId: "f1",
    priority: "alta" as const,
    deadline: "2026-09-30",
  };

  it("válido: atualiza campos e registra histórico edited sem mudar status", () => {
    const item = BacklogItem.create(base);
    expect(item.status).toBe("backlog");
    item.updateFields(
      {
        title: "Título atualizado",
        description: "Nova descrição",
        frontId: "f1",
        priority: "media",
        deadline: "2026-10-01",
      },
      { actorId: "p5", at: "2026-09-13T10:00:00Z" }
    );
    expect(item.title).toBe("Título atualizado");
    expect(item.description).toBe("Nova descrição");
    expect(item.priority).toBe("media");
    expect(item.deadline).toBe("2026-10-01");
    expect(item.status).toBe("backlog");
    const changes = item.getStateChanges();
    expect(changes).toHaveLength(1);
    expect(changes[0].from).toBe("backlog");
    expect(changes[0].to).toBe("backlog");
    expect(changes[0].actorId).toBe("p5");
  });

  it("título curto (<3) é rejeitado e não altera o item", () => {
    const item = BacklogItem.create(base);
    expect(() =>
      item.updateFields(
        { title: "ab", frontId: "f1" },
        { actorId: "p5", at: "2026-09-13T10:00:00Z" }
      )
    ).toThrow(DomainError);
    expect(item.title).toBe("Título original");
    expect(item.getStateChanges()).toHaveLength(0);
  });

  it("frente vazia é rejeitada e não altera o item", () => {
    const item = BacklogItem.create(base);
    expect(() =>
      item.updateFields(
        { title: "Título válido", frontId: "  " },
        { actorId: "p5", at: "2026-09-13T10:00:00Z" }
      )
    ).toThrow(DomainError);
    expect(item.frontId).toBe("f1");
    expect(item.getStateChanges()).toHaveLength(0);
  });

  it("deadline vazio (string em branco) é rejeitado", () => {
    const item = BacklogItem.create(base);
    expect(() =>
      item.updateFields(
        { title: "Título válido", frontId: "f1", deadline: "   " },
        { actorId: "p5", at: "2026-09-13T10:00:00Z" }
      )
    ).toThrow(DomainError);
    expect(item.deadline).toBe("2026-09-30");
  });

  it("application: Visitante (canEdit=false) bloqueado ao salvar edição", async () => {
    resetTestUid();
    const backlog = new MemoryBacklogRepository();
    const audit = new MemoryAudit();
    const created = await createBacklogItem(
      { title: "Item editável", frontId: "f1", priority: "alta" },
      memberF1(),
      { backlog, audit, uid: testUid, now: fixedNow }
    );
    const loaded = (await backlog.load(created.id))!;
    loaded.updateFields(
      { title: "Tentativa visitante" },
      { actorId: "p6", at: fixedNow() }
    );
    await expect(
      saveBacklogItem(loaded, visitanteF1(), {
        backlog,
        audit,
        uid: testUid,
        now: fixedNow,
      })
    ).rejects.toThrow(DomainError);
  });
});
