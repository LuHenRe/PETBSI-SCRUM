import type { BacklogItem } from "../../domain/backlog/backlog-item";
import type { SprintStatus } from "../../domain/sprint/sprint";
import type { BacklogRepository, SprintRepository } from "../ports/repositories";

export interface OverviewFilters {
  allowedFrontIds: readonly string[];
}

export interface OverviewActiveSprint {
  id: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
}

export interface OverviewBlockerInfo {
  blockerId: string;
  itemId: string;
  description: string;
  frontId: string;
}

export interface OverviewDeliveryInfo {
  itemId: string;
  title: string;
  frontId: string;
  status: string;
}

export interface ProjectOverview {
  activeSprint: OverviewActiveSprint | null;
  totalItems: number;
  wipByStatus: Record<string, number>;
  openBlockers: OverviewBlockerInfo[];
  deliveries: OverviewDeliveryInfo[];
  items: BacklogItem[];
}

export interface OverviewDeps {
  backlog: BacklogRepository;
  sprints: SprintRepository;
}

export async function getProjectOverview(
  projectId: string,
  filters: OverviewFilters,
  deps: OverviewDeps
): Promise<ProjectOverview> {
  const allowed = new Set(filters.allowedFrontIds);
  const allItems = await deps.backlog.listByProject(projectId);
  const items = allItems.filter((i) => allowed.has(i.frontId));

  const active = await deps.sprints.listActive();
  const activeSprint = active.length > 0
    ? {
        id: active[0].id,
        name: active[0].name,
        goal: active[0].goal,
        status: active[0].status,
      }
    : null;

  const wipByStatus: Record<string, number> = {};
  for (const item of items) {
    wipByStatus[item.status] = (wipByStatus[item.status] ?? 0) + 1;
  }

  const openBlockers: OverviewBlockerInfo[] = [];
  for (const item of items) {
    for (const blocker of item.getBlockers()) {
      if (blocker.isOpen()) {
        openBlockers.push({
          blockerId: blocker.id,
          itemId: item.id,
          description: blocker.description,
          frontId: item.frontId,
        });
      }
    }
  }

  const deliveries: OverviewDeliveryInfo[] = items
    .filter((i) => i.status === "done")
    .map((i) => ({
      itemId: i.id,
      title: i.title,
      frontId: i.frontId,
      status: i.status,
    }));

  return {
    activeSprint,
    totalItems: items.length,
    wipByStatus,
    openBlockers,
    deliveries,
    items,
  };
}
