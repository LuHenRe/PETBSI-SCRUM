import { Sprint, type SprintStatus } from "../../domain/sprint/sprint";
import { DateRange } from "../../domain/shared/date-range";

export type SeedSprintStatus = "planned" | "active" | "closed";

export interface SeedSprint {
  id: string;
  name: string;
  goal: string;
  status: SeedSprintStatus;
  startDate: string;
  endDate: string;
  itemIds: string[];
}

export function toDomainStatus(seed: SeedSprintStatus): SprintStatus {
  switch (seed) {
    case "planned":
      return "planejada";
    case "active":
      return "em_andamento";
    case "closed":
      return "encerrada";
  }
}

export function toSeedStatus(domain: SprintStatus): SeedSprintStatus {
  switch (domain) {
    case "rascunho":
      return "planned";
    case "planejada":
      return "planned";
    case "em_andamento":
      return "active";
    case "encerrada":
      return "closed";
  }
}

export function sprintFromSeed(seed: SeedSprint): Sprint {
  const sprint = Sprint.create({
    id: seed.id,
    name: seed.name,
    period: new DateRange(seed.startDate, seed.endDate),
  });
  const goal = seed.goal?.trim() ?? "";
  if (goal.length > 0) {
    sprint.definirMeta(goal);
  }
  for (const itemId of seed.itemIds) {
    sprint.selectItem(itemId);
  }
  if (seed.status === "active" || seed.status === "closed") {
    sprint.iniciar([]);
  }
  if (seed.status === "closed") {
    sprint.close();
  }
  return sprint;
}

export function sprintToSeed(sprint: Sprint): SeedSprint {
  return {
    id: sprint.id,
    name: sprint.name,
    goal: sprint.goal ?? "",
    status: toSeedStatus(sprint.status),
    startDate: sprint.period.startsOn,
    endDate: sprint.period.endsOn,
    itemIds: [...sprint.getSelectedItemIds()],
  };
}
