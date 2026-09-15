import { BacklogItem } from "../../domain/backlog/backlog-item";
import { Blocker } from "../../domain/blocker/blocker";
import { WorkflowColumn } from "../../domain/workflow/workflow-column";
import { WipLimit } from "../../domain/shared/wip-limit";
import type { WorkItemStatus } from "../../domain/shared/work-item-status";
import type { BacklogPriority } from "../../domain/shared/backlog-priority";
import type { BacklogRepository } from "../../application/ports/repositories";
import { createSeedState } from "../../lib/seed";

function columnFor(status: WorkItemStatus): WorkflowColumn {
  return new WorkflowColumn({
    id: `c_${status}`,
    status,
    name: status,
    wipLimit: WipLimit.unlimited(),
  });
}

function pathTo(target: WorkItemStatus): WorkItemStatus[] {
  switch (target) {
    case "backlog":
      return [];
    case "todo":
      return ["todo"];
    case "in_progress":
      return ["todo", "in_progress"];
    case "blocked":
      return ["todo", "in_progress", "blocked"];
    case "review":
      return ["todo", "in_progress", "review"];
    case "done":
      return ["todo", "in_progress", "review", "done"];
    case "cancelled":
      return ["cancelled"];
  }
}

export function buildSeedBacklogItems(): BacklogItem[] {
  const seed = createSeedState();
  const byId = new Map<string, BacklogItem>();

  for (const s of seed.backlogItems) {
    const item = BacklogItem.create({
      id: s.id,
      title: s.title,
      description: s.description,
      frontId: s.frontId,
      priority: s.priority as BacklogPriority,
      deadline: s.deadline,
    });
    byId.set(s.id, item);
  }

  for (const b of seed.blockers) {
    const item = byId.get(b.itemId);
    if (!item) continue;
    const blocker = Blocker.open({
      id: b.id,
      description: b.description,
      reportedBy: b.openedBy,
      openedAt: b.openedAt,
    });
    item.registerBlocker(blocker);
    if (b.resolvedAt) {
      blocker.resolve(b.resolvedBy ?? b.openedBy, b.resolvedAt);
    }
  }

  const seedActor = "seed";
  const seedAt = "2026-09-13T00:00:00Z";
  for (const s of seed.backlogItems) {
    const item = byId.get(s.id);
    if (!item) continue;
    const steps = pathTo(s.status as WorkItemStatus);
    for (const step of steps) {
      item.moveTo(columnFor(step), 0, { actorId: seedActor, at: seedAt, reason: null });
    }
  }

  return [...byId.values()];
}

export class MemoryBacklogRepository implements BacklogRepository {
  private readonly store = new Map<string, BacklogItem>();

  async load(id: string): Promise<BacklogItem | null> {
    return this.store.get(id) ?? null;
  }

  async save(item: BacklogItem): Promise<void> {
    this.store.set(item.id, item);
  }

  async listByProject(_projectId: string): Promise<BacklogItem[]> {
    return [...this.store.values()];
  }

  async seedFromSeed(): Promise<void> {
    for (const item of buildSeedBacklogItems()) {
      this.store.set(item.id, item);
    }
  }

  get size(): number {
    return this.store.size;
  }
}
