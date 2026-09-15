import type { SprintRepository } from "../../application/ports/repositories";
import { Sprint } from "../../domain/sprint/sprint";
import { createSeedState } from "../../lib/seed";
import { sprintFromSeed, type SeedSprintStatus } from "./sprint-mapper";

export class MemorySprintRepository implements SprintRepository {
  private readonly store = new Map<string, Sprint>();

  async load(id: string): Promise<Sprint | null> {
    return this.store.get(id) ?? null;
  }

  async save(sprint: Sprint): Promise<void> {
    this.store.set(sprint.id, sprint);
  }

  async listActive(): Promise<Sprint[]> {
    return [...this.store.values()].filter((s) => s.isActive());
  }

  async listAll(): Promise<Sprint[]> {
    return [...this.store.values()];
  }

  async seedFromSeed(): Promise<void> {
    const seed = createSeedState();
    for (const s of seed.sprints) {
      const sprint = sprintFromSeed({
        id: s.id,
        name: s.name,
        goal: s.goal,
        status: s.status as SeedSprintStatus,
        startDate: s.startDate,
        endDate: s.endDate,
        itemIds: [...s.itemIds],
      });
      this.store.set(sprint.id, sprint);
    }
  }
}
