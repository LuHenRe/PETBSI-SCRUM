import { DomainError } from "../../domain/shared/domain-error";
import type { Sprint } from "../../domain/sprint/sprint";
import type {
  AuditPort,
  BacklogRepository,
  Clock,
  SprintRepository,
} from "../ports/repositories";
import { defaultClock } from "../ports/repositories";

export interface SprintDeps {
  sprints: SprintRepository;
  backlog?: BacklogRepository;
  audit: AuditPort;
  now?: Clock;
}

export async function definirMetaSprint(
  sprintId: string,
  meta: string,
  actorId: string,
  deps: SprintDeps
): Promise<Sprint> {
  const now = deps.now ?? defaultClock();
  const sprint = await deps.sprints.load(sprintId);
  if (!sprint) {
    throw new DomainError(`Sprint ${sprintId} não encontrada`);
  }
  sprint.definirMeta(meta);
  await deps.sprints.save(sprint);
  await deps.audit.record({
    actorId,
    action: "SprintMetaDefined",
    aggregate: sprint.id,
    at: now(),
  });
  return sprint;
}

export async function selecionarItemSprint(
  sprintId: string,
  itemId: string,
  actorId: string,
  deps: SprintDeps
): Promise<Sprint> {
  const now = deps.now ?? defaultClock();
  const sprint = await deps.sprints.load(sprintId);
  if (!sprint) {
    throw new DomainError(`Sprint ${sprintId} não encontrada`);
  }
  if (deps.backlog) {
    const item = await deps.backlog.load(itemId);
    if (!item) {
      throw new DomainError(`Item ${itemId} não encontrado`);
    }
  }
  sprint.selectItem(itemId);
  await deps.sprints.save(sprint);
  await deps.audit.record({
    actorId,
    action: "SprintItemSelected",
    aggregate: sprint.id,
    at: now(),
  });
  return sprint;
}
