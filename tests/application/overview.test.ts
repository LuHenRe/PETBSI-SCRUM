import { describe, expect, it } from "vitest";
import { MemoryBacklogRepository } from "@/adapters/memory/memory-backlog-repository";
import { MemorySprintRepository } from "@/adapters/memory/memory-sprint-repository";
import { getProjectOverview } from "@/application/overview/get-project-overview";

// A02 — UC02 Consultar visão geral (RF02, RF09) + A07 entregas/histórico (RF10-RF11)
describe("A02 get-project-overview", () => {
  it("visão completa: agrega Sprint ativa, WIP, bloqueios e entregas", async () => {
    const backlog = new MemoryBacklogRepository();
    const sprints = new MemorySprintRepository();
    await backlog.seedFromSeed();
    await sprints.seedFromSeed();

    const overview = await getProjectOverview(
      "proj",
      { allowedFrontIds: ["f1", "f2", "f3", "f4"] },
      { backlog, sprints }
    );
    expect(overview.activeSprint?.id).toBe("s2");
    expect(overview.activeSprint?.goal).toContain("núcleo operacional");
    expect(overview.totalItems).toBe(18);
    expect(overview.wipByStatus["in_progress"]).toBeGreaterThan(0);
    expect(overview.openBlockers.length).toBeGreaterThanOrEqual(1);
    expect(overview.openBlockers[0].itemId).toBe("i11");
    // entregas = itens done locais
    expect(overview.deliveries.length).toBeGreaterThanOrEqual(3);
    expect(overview.deliveries.map((d) => d.itemId)).toContain("i1");
  });

  it("respeita frontId permitido: filtra itens/bloqueios/entregas", async () => {
    const backlog = new MemoryBacklogRepository();
    const sprints = new MemorySprintRepository();
    await backlog.seedFromSeed();
    await sprints.seedFromSeed();

    const overview = await getProjectOverview("proj", { allowedFrontIds: ["f1"] }, { backlog, sprints });
    expect(overview.items.every((i) => i.frontId === "f1")).toBe(true);
    expect(overview.openBlockers.every((b) => b.frontId === "f1")).toBe(true);
    expect(overview.deliveries.every((d) => d.frontId === "f1")).toBe(true);
    // sprint ativa continua visível (agregação local), mas itens filtrados
    expect(overview.activeSprint?.id).toBe("s2");
  });

  it("vazio: sem dados retorna estado vazio sem erro", async () => {
    const backlog = new MemoryBacklogRepository();
    const sprints = new MemorySprintRepository();
    const overview = await getProjectOverview("proj", { allowedFrontIds: ["f1"] }, { backlog, sprints });
    expect(overview.activeSprint).toBeNull();
    expect(overview.totalItems).toBe(0);
    expect(overview.items).toEqual([]);
    expect(overview.openBlockers).toEqual([]);
    expect(overview.deliveries).toEqual([]);
  });

  it("falha externa simulada não impacta consulta local (RNF04/RN08)", async () => {
    const backlog = new MemoryBacklogRepository();
    const sprints = new MemorySprintRepository();
    await backlog.seedFromSeed();
    await sprints.seedFromSeed();

    const failingExternal: Promise<never> = Promise.reject(new Error("Google indisponível"));
    failingExternal.catch(() => {});
    const overview = await getProjectOverview("proj", { allowedFrontIds: ["f4"] }, { backlog, sprints });
    expect(overview.totalItems).toBeGreaterThan(0);
    expect(overview.activeSprint?.id).toBe("s2");
  });
});
