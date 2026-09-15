import { describe, expect, it, beforeEach } from "vitest";
import { MemoryBacklogRepository } from "@/adapters/memory/memory-backlog-repository";
import { MemoryAudit } from "@/adapters/memory/memory-audit";
import {
  createBacklogItem,
  saveBacklogItem,
} from "@/application/backlog/manage-backlog-item";
import { moveBacklogItem } from "@/application/workflow/move-backlog-item";
import { createApiClient } from "@/lib/api-client";
import {
  resetTestUid,
  testUid,
  memberF1,
  makeColumn,
} from "./fixtures/factories";

// MT-4.2 — Auditoria visível (RF10, RF09-RF11)
// criar → mover → editar gera 3+ eventos ordenados (audit append-only +
// histórico do agregado preservado).
describe("MT-4.2 audit-visible", () => {
  beforeEach(() => {
    resetTestUid();
  });

  it("use-cases: criar→mover→editar gera 3 eventos de auditoria ordenados", async () => {
    const backlog = new MemoryBacklogRepository();
    const audit = new MemoryAudit();
    let tick = 0;
    const seqNow = (): string =>
      `2026-09-13T10:00:0${tick++}Z`;

    const created = await createBacklogItem(
      { title: "Item auditável", frontId: "f1", priority: "alta" },
      memberF1(),
      { backlog, audit, uid: testUid, now: seqNow }
    );
    await moveBacklogItem(
      {
        itemId: created.id,
        column: makeColumn("todo", 4),
        countInTarget: 0,
        actorId: "p5",
        membership: memberF1(),
        reason: null,
        at: seqNow(),
      },
      { backlog, audit, now: seqNow }
    );
    const loaded = (await backlog.load(created.id))!;
    loaded.updateFields(
      { title: "Item auditável editado" },
      { actorId: "p5", at: seqNow() }
    );
    await saveBacklogItem(loaded, memberF1(), {
      backlog,
      audit,
      uid: testUid,
      now: seqNow,
    });

    const events = await audit.list(created.id);
    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(events.map((e) => e.action)).toEqual([
      "BacklogItemCreated",
      "BacklogItemMoved",
      "BacklogItemSaved",
    ]);
    const ats = events.map((e) => e.at);
    expect([...ats].sort()).toEqual(ats);

    // Histórico do agregado é append-only: move + edited, sem apagar.
    const reloaded = (await backlog.load(created.id))!;
    expect(reloaded.getStateChanges()).toHaveLength(2);
    expect(reloaded.status).toBe("todo");
    expect(reloaded.title).toBe("Item auditável editado");
  });

  it("apiClient.listAudit(itemId?) expõe a auditoria com filtro", async () => {
    const client = createApiClient();
    let tick = 0;
    const seqNow = (): string =>
      `2026-09-13T11:00:0${tick++}Z`;

    const item = await client.createItem(
      { title: "Item via api", frontId: "f1", priority: "alta" },
      { uid: testUid, now: seqNow, actorId: "p5" }
    );
    // Libera uma vaga em todo (todo está 4/4 no seed) e move o novo item.
    await client.moveItem("i6", "backlog", { actorId: "p3", now: seqNow });
    await client.moveItem(item.id, "todo", { actorId: "p5", now: seqNow });
    await client.saveItem(
      item.id,
      { title: "Item via api editado", frontId: "f1", priority: "media" },
      { actorId: "p5", now: seqNow }
    );

    const mine = await client.listAudit(item.id);
    expect(mine.length).toBeGreaterThanOrEqual(3);
    expect(mine.map((e) => e.action)).toEqual([
      "BacklogItemCreated",
      "BacklogItemMoved",
      "BacklogItemSaved",
    ]);
    const all = await client.listAudit();
    expect(all.length).toBeGreaterThanOrEqual(mine.length + 1);
    expect(all.filter((e) => e.aggregate === item.id)).toHaveLength(
      mine.length
    );
  });
});
