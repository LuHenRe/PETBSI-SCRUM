import { describe, expect, it, beforeEach } from "vitest";
import { DomainError } from "@/domain/shared/domain-error";
import { MemoryBacklogRepository } from "@/adapters/memory/memory-backlog-repository";
import { MemoryAudit } from "@/adapters/memory/memory-audit";
import { createBacklogItem, saveBacklogItem } from "@/application/backlog/manage-backlog-item";
import {
  resetTestUid,
  testUid,
  fixedNow,
  memberF1,
  visitanteF1,
  memberF2,
  scrumMaster,
  coordinator,
} from "./fixtures/factories";

// A03 — UC03 Gerenciar Product Backlog (RF03)
describe("A03 manage-backlog-item", () => {
  let backlog: MemoryBacklogRepository;
  let audit: MemoryAudit;

  beforeEach(() => {
    resetTestUid();
    backlog = new MemoryBacklogRepository();
    audit = new MemoryAudit();
  });

  it("criar: coordenador cria item válido e registra auditoria", async () => {
    const item = await createBacklogItem(
      { title: "Nova funcionalidade X", description: "Detalhes", frontId: "f1", priority: "alta", deadline: null },
      coordinator(),
      { backlog, audit, uid: testUid, now: fixedNow }
    );
    expect(item.title).toBe("Nova funcionalidade X");
    expect(item.status).toBe("backlog");
    expect(item.frontId).toBe("f1");

    const loaded = await backlog.load(item.id);
    expect(loaded?.id).toBe(item.id);
    expect(audit.events).toHaveLength(1);
    expect(audit.events[0].action).toBe("BacklogItemCreated");
    expect(audit.events[0].aggregate).toBe(item.id);
  });

  it("criar: membro com edição na frente cria item", async () => {
    const item = await createBacklogItem(
      { title: "Roteiro de tutoria", frontId: "f1", priority: "media" },
      memberF1(),
      { backlog, audit, uid: testUid, now: fixedNow }
    );
    expect(item.id).toContain("i_");
    expect((await backlog.listByProject("proj")).length).toBe(1);
  });

  it("criar: Scrum Master (override) cria em frente distinta", async () => {
    const item = await createBacklogItem(
      { title: "Ajuste transversal", frontId: "f1", priority: "baixa" },
      scrumMaster(),
      { backlog, audit, uid: testUid, now: fixedNow }
    );
    expect(item.frontId).toBe("f1");
  });

  it("editar via re-save: item persistido pode ser re-salvo", async () => {
    const item = await createBacklogItem(
      { title: "Item editável", frontId: "f1", priority: "alta" },
      memberF1(),
      { backlog, audit, uid: testUid, now: fixedNow }
    );
    const loaded = (await backlog.load(item.id))!;
    await saveBacklogItem(loaded, memberF1(), { backlog, audit, uid: testUid, now: fixedNow });
    const reloaded = await backlog.load(item.id);
    expect(reloaded?.title).toBe("Item editável");
    expect(audit.events.length).toBeGreaterThanOrEqual(2);
  });

  it("dados inválidos: título curto (<3) é rejeitado", async () => {
    await expect(
      createBacklogItem({ title: "ab", frontId: "f1", priority: "alta" }, memberF1(), {
        backlog, audit, uid: testUid, now: fixedNow,
      })
    ).rejects.toThrow(DomainError);
    await expect(
      createBacklogItem({ title: "  ", frontId: "f1", priority: "alta" }, memberF1(), {
        backlog, audit, uid: testUid, now: fixedNow,
      })
    ).rejects.toThrow(DomainError);
    expect(await backlog.listByProject("proj")).toHaveLength(0);
    expect(audit.events).toHaveLength(0);
  });

  it("dados inválidos: frente obrigatória", async () => {
    await expect(
      createBacklogItem({ title: "Título válido", frontId: "", priority: "alta" }, memberF1(), {
        backlog, audit, uid: testUid, now: fixedNow,
      })
    ).rejects.toThrow(DomainError);
  });

  it("papel incorreto: Visitante (canEdit=false) é bloqueado", async () => {
    await expect(
      createBacklogItem({ title: "Tentativa visitante", frontId: "f1", priority: "alta" }, visitanteF1(), {
        backlog, audit, uid: testUid, now: fixedNow,
      })
    ).rejects.toThrow(DomainError);
    expect(audit.events).toHaveLength(0);
  });

  it("papel incorreto: membro de outra frente sem override é bloqueado", async () => {
    await expect(
      createBacklogItem({ title: "Item de outra frente", frontId: "f1", priority: "alta" }, memberF2(), {
        backlog, audit, uid: testUid, now: fixedNow,
      })
    ).rejects.toThrow(DomainError);
  });
});
