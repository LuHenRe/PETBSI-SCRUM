import { DomainError } from "../../domain/shared/domain-error";
import type { WorkflowColumn } from "../../domain/workflow/workflow-column";
import type { BacklogItem } from "../../domain/backlog/backlog-item";
import type { ProjectMembership } from "../../domain/project/project-membership";
import type { AuditPort, BacklogRepository, Clock } from "../ports/repositories";
import { defaultClock } from "../ports/repositories";

export interface MoveBacklogInput {
  itemId: string;
  column: WorkflowColumn;
  countInTarget: number;
  actorId: string;
  membership: ProjectMembership;
  reason?: string | null;
  at?: string;
}

export interface MoveDeps {
  backlog: BacklogRepository;
  audit: AuditPort;
  now?: Clock;
}

export async function moveBacklogItem(
  input: MoveBacklogInput,
  deps: MoveDeps
): Promise<BacklogItem> {
  const now = deps.now ?? defaultClock();

  const item = await deps.backlog.load(input.itemId);
  if (!item) {
    throw new DomainError(`Item ${input.itemId} não encontrado`);
  }

  const authorized =
    input.membership.canMoveItem(item.frontId) || input.membership.isTechAdmin();
  if (!authorized) {
    throw new DomainError(`Sem permissão para mover item da frente ${item.frontId}`);
  }

  if (!input.column.canReceive(input.countInTarget)) {
    throw new DomainError(
      `Limite de WIP da coluna "${input.column.name}" seria ultrapassado`
    );
  }

  const at = input.at ?? now();
  item.moveTo(input.column, input.countInTarget, {
    actorId: input.actorId,
    at,
    reason: input.reason ?? null,
  });

  await deps.backlog.save(item);
  await deps.audit.record({
    actorId: input.actorId,
    action: "BacklogItemMoved",
    aggregate: item.id,
    at,
  });
  return item;
}
