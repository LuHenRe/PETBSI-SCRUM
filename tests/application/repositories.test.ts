import { describe, expect, it } from "vitest";
import { BacklogItem } from "@/domain/backlog/backlog-item";
import { Sprint } from "@/domain/sprint/sprint";
import { DateRange } from "@/domain/shared/date-range";
import { ProjectMembership } from "@/domain/project/project-membership";
import { MemoryBacklogRepository } from "@/adapters/memory/memory-backlog-repository";
import { MemorySprintRepository } from "@/adapters/memory/memory-sprint-repository";
import { MemoryMembershipRepository } from "@/adapters/memory/memory-membership-repository";
import { MemoryAudit } from "@/adapters/memory/memory-audit";
import { toDomainStatus, toSeedStatus, sprintFromSeed } from "@/adapters/memory/sprint-mapper";

describe("memory repositories — isolamento e seed", () => {
  it("backlog: instâncias isoladas", async () => {
    const a = new MemoryBacklogRepository();
    const b = new MemoryBacklogRepository();
    const item = BacklogItem.create({
      id: "i1", title: "Item", description: "d", frontId: "f1", priority: "alta", deadline: null,
    });
    await a.save(item);
    expect(await a.load("i1")).not.toBeNull();
    expect(await b.load("i1")).toBeNull();
    expect(await b.listByProject("proj")).toEqual([]);
  });

  it("sprint: instâncias isoladas e listActive filtra", async () => {
    const a = new MemorySprintRepository();
    const b = new MemorySprintRepository();
    const sprint = Sprint.create({ id: "s1", name: "S1", period: new DateRange("2026-09-01", "2026-09-15") });
    sprint.definirMeta("Meta");
    sprint.iniciar([]);
    await a.save(sprint);
    expect((await a.listActive()).map((s) => s.id)).toEqual(["s1"]);
    expect(await b.listActive()).toEqual([]);
  });

  it("membership: instâncias isoladas", async () => {
    const a = new MemoryMembershipRepository();
    const b = new MemoryMembershipRepository();
    await a.save(new ProjectMembership({ id: "m1", personId: "p1", frontId: "f1", role: "MEMBER", canEdit: true }));
    expect(await a.load("m1")).not.toBeNull();
    expect(await b.load("m1")).toBeNull();
  });

  it("audit: instâncias isoladas", async () => {
    const a = new MemoryAudit();
    const b = new MemoryAudit();
    await a.record({ actorId: "p1", action: "X", aggregate: "i1", at: "2026-09-13T10:00:00Z" });
    expect(a.events).toHaveLength(1);
    expect(b.events).toHaveLength(0);
  });

  it("sprint-mapper: conversão explícita seed <-> domínio", () => {
    expect(toDomainStatus("planned")).toBe("planejada");
    expect(toDomainStatus("active")).toBe("em_andamento");
    expect(toDomainStatus("closed")).toBe("encerrada");
    expect(toSeedStatus("planejada")).toBe("planned");
    expect(toSeedStatus("em_andamento")).toBe("active");
    expect(toSeedStatus("encerrada")).toBe("closed");
    // rascunho (sem meta) mapeia para planned no legado
    expect(toSeedStatus("rascunho")).toBe("planned");
  });

  it("sprintFromSeed: reconstrói ciclo de vida", async () => {
    const s1 = sprintFromSeed({
      id: "s1", name: "Sprint 1", goal: "Base", status: "closed",
      startDate: "2026-08-18", endDate: "2026-09-04", itemIds: ["i1"],
    });
    expect(s1.status).toBe("encerrada");
    expect(s1.goal).toBe("Base");
    expect(s1.getSelectedItemIds()).toEqual(["i1"]);

    const s2 = sprintFromSeed({
      id: "s2", name: "Sprint 2", goal: "Núcleo", status: "active",
      startDate: "2026-09-08", endDate: "2026-09-25", itemIds: [],
    });
    expect(s2.status).toBe("em_andamento");
    expect(s2.isActive()).toBe(true);
  });

  it("seed: backlog com 18 itens e sprint ativa s2", async () => {
    const backlog = new MemoryBacklogRepository();
    const sprints = new MemorySprintRepository();
    const memberships = new MemoryMembershipRepository();
    await backlog.seedFromSeed();
    await sprints.seedFromSeed();
    await memberships.seedFromSeed();
    expect((await backlog.listByProject("proj")).length).toBe(18);
    expect((await sprints.listActive()).map((s) => s.id)).toEqual(["s2"]);
    expect((await memberships.listAll()).length).toBe(9);
  });
});
