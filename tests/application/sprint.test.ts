import { describe, expect, it, beforeEach } from "vitest";
import { DomainError } from "@/domain/shared/domain-error";
import { Sprint } from "@/domain/sprint/sprint";
import { DateRange } from "@/domain/shared/date-range";
import { BacklogItem } from "@/domain/backlog/backlog-item";
import { MemorySprintRepository } from "@/adapters/memory/memory-sprint-repository";
import { MemoryBacklogRepository } from "@/adapters/memory/memory-backlog-repository";
import { MemoryAudit } from "@/adapters/memory/memory-audit";
import { definirMetaSprint, selecionarItemSprint } from "@/application/sprint/plan-sprint";
import { fixedNow } from "./fixtures/factories";

// A04 — UC04 Planejar Sprint (RF04-RF05)
describe("A04 plan-sprint", () => {
  let sprints: MemorySprintRepository;
  let backlog: MemoryBacklogRepository;
  let audit: MemoryAudit;

  async function seedSprint(id = "s1"): Promise<void> {
    const sprint = Sprint.create({
      id,
      name: "Sprint 1",
      period: new DateRange("2026-09-08", "2026-09-25"),
    });
    await sprints.save(sprint);
  }

  async function seedBacklogItem(id: string): Promise<void> {
    const item = BacklogItem.create({
      id,
      title: `Item ${id}`,
      description: "desc",
      frontId: "f4",
      priority: "alta",
      deadline: null,
    });
    await backlog.save(item);
  }

  beforeEach(() => {
    sprints = new MemorySprintRepository();
    backlog = new MemoryBacklogRepository();
    audit = new MemoryAudit();
  });

  it("definir meta: rascunho -> planejada", async () => {
    await seedSprint("s1");
    const sprint = await definirMetaSprint("s1", "Concluir núcleo operacional", "p1", {
      sprints, backlog, audit, now: fixedNow,
    });
    expect(sprint.goal).toBe("Concluir núcleo operacional");
    expect(sprint.status).toBe("planejada");
    expect(audit.events[0].action).toBe("SprintMetaDefined");
  });

  it("selecionar item: registra sem duplicar", async () => {
    await seedSprint("s1");
    await seedBacklogItem("i4");
    await seedBacklogItem("i5");
    await definirMetaSprint("s1", "Meta", "p1", { sprints, backlog, audit, now: fixedNow });
    const sprint = await selecionarItemSprint("s1", "i4", "p1", { sprints, backlog, audit, now: fixedNow });
    expect(sprint.getSelectedItemIds()).toEqual(["i4"]);
    await selecionarItemSprint("s1", "i5", "p1", { sprints, backlog, audit, now: fixedNow });
    expect((await sprints.load("s1"))!.getSelectedItemIds()).toEqual(["i4", "i5"]);
  });

  it("item duplicado: segunda seleção rejeitada", async () => {
    await seedSprint("s1");
    await seedBacklogItem("i4");
    await definirMetaSprint("s1", "Meta", "p1", { sprints, backlog, audit, now: fixedNow });
    await selecionarItemSprint("s1", "i4", "p1", { sprints, backlog, audit, now: fixedNow });
    await expect(
      selecionarItemSprint("s1", "i4", "p1", { sprints, backlog, audit, now: fixedNow })
    ).rejects.toThrow(DomainError);
    expect((await sprints.load("s1"))!.getSelectedItemIds()).toEqual(["i4"]);
  });

  it("Sprint encerrada rejeita novo item", async () => {
    await seedSprint("s1");
    await seedBacklogItem("i9");
    await definirMetaSprint("s1", "Meta", "p1", { sprints, backlog, audit, now: fixedNow });
    const loaded = (await sprints.load("s1"))!;
    loaded.iniciar([]);
    loaded.close();
    await sprints.save(loaded);
    await expect(
      selecionarItemSprint("s1", "i9", "p1", { sprints, backlog, audit, now: fixedNow })
    ).rejects.toThrow(DomainError);
  });

  it("sprint inexistente é rejeitada", async () => {
    await expect(
      definirMetaSprint("missing", "Meta", "p1", { sprints, backlog, audit, now: fixedNow })
    ).rejects.toThrow(DomainError);
  });
});
