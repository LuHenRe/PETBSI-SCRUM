import { describe, expect, it, beforeEach } from "vitest";
import { DomainError } from "@/domain/shared/domain-error";
import { BacklogItem } from "@/domain/backlog/backlog-item";
import { MemoryBacklogRepository } from "@/adapters/memory/memory-backlog-repository";
import { MemoryAudit } from "@/adapters/memory/memory-audit";
import { moveBacklogItem } from "@/application/workflow/move-backlog-item";
import {
  memberF1,
  visitanteF1,
  memberF2,
  scrumMaster,
  makeColumn,
  fixedNow,
} from "./fixtures/factories";

// A05 — UC05 Atualizar item no fluxo (RF06-RF08, RN01-RN05)
describe("A05 move-backlog-item", () => {
  let backlog: MemoryBacklogRepository;
  let audit: MemoryAudit;

  async function seedItem(id = "i1"): Promise<BacklogItem> {
    const item = BacklogItem.create({
      id,
      title: "Item de fluxo",
      description: "desc",
      frontId: "f1",
      priority: "alta",
      deadline: null,
    });
    await backlog.save(item);
    return item;
  }

  beforeEach(() => {
    backlog = new MemoryBacklogRepository();
    audit = new MemoryAudit();
  });

  it("válida: backlog -> todo com permissão", async () => {
    await seedItem("i1");
    const column = makeColumn("todo", 4);
    const item = await moveBacklogItem(
      { itemId: "i1", column, countInTarget: 0, actorId: "p5", membership: memberF1() },
      { backlog, audit, now: fixedNow }
    );
    expect(item.status).toBe("todo");
    expect(item.getStateChanges()).toHaveLength(1);
    expect(audit.events).toHaveLength(1);
    expect(audit.events[0].action).toBe("BacklogItemMoved");
  });

  it("WIP excedido: mantém estado e não registra histórico/auditoria", async () => {
    await seedItem("i1");
    const column = makeColumn("todo", 1);
    await expect(
      moveBacklogItem(
        { itemId: "i1", column, countInTarget: 1, actorId: "p5", membership: memberF1() },
        { backlog, audit, now: fixedNow }
      )
    ).rejects.toThrow(DomainError);
    const reloaded = (await backlog.load("i1"))!;
    expect(reloaded.status).toBe("backlog");
    expect(reloaded.getStateChanges()).toHaveLength(0);
    expect(audit.events).toHaveLength(0);
  });

  it("transição proibida: backlog -> in_progress (pula todo)", async () => {
    await seedItem("i1");
    const column = makeColumn("in_progress", 4);
    await expect(
      moveBacklogItem(
        { itemId: "i1", column, countInTarget: 0, actorId: "p5", membership: memberF1() },
        { backlog, audit, now: fixedNow }
      )
    ).rejects.toThrow(DomainError);
    expect((await backlog.load("i1"))!.status).toBe("backlog");
    expect(audit.events).toHaveLength(0);
  });

  it("sem permissão: membro de outra frente é bloqueado", async () => {
    await seedItem("i1");
    await expect(
      moveBacklogItem(
        { itemId: "i1", column: makeColumn("todo", 4), countInTarget: 0, actorId: "p7", membership: memberF2() },
        { backlog, audit, now: fixedNow }
      )
    ).rejects.toThrow(DomainError);
    expect((await backlog.load("i1"))!.status).toBe("backlog");
  });

  it("Visitante bloqueado: canEdit=false não move mesmo na própria frente", async () => {
    await seedItem("i1");
    await expect(
      moveBacklogItem(
        { itemId: "i1", column: makeColumn("todo", 4), countInTarget: 0, actorId: "p6", membership: visitanteF1() },
        { backlog, audit, now: fixedNow }
      )
    ).rejects.toThrow(DomainError);
  });

  it("override SM: Scrum Master de outra frente pode mover", async () => {
    await seedItem("i1");
    const item = await moveBacklogItem(
      { itemId: "i1", column: makeColumn("todo", 4), countInTarget: 0, actorId: "p3", membership: scrumMaster() },
      { backlog, audit, now: fixedNow }
    );
    expect(item.status).toBe("todo");
  });

  it("item inexistente é rejeitado", async () => {
    await expect(
      moveBacklogItem(
        { itemId: "missing", column: makeColumn("todo", 4), countInTarget: 0, actorId: "p5", membership: memberF1() },
        { backlog, audit, now: fixedNow }
      )
    ).rejects.toThrow(DomainError);
  });
});
