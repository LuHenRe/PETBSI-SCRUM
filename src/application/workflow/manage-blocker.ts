import { Blocker } from "../../domain/blocker/blocker";
import { DomainError } from "../../domain/shared/domain-error";
import type { ProjectMembership } from "../../domain/project/project-membership";
import type {
  AuditPort,
  BacklogRepository,
  Clock,
  IdGenerator,
} from "../ports/repositories";
import { defaultClock, defaultIdGenerator } from "../ports/repositories";

export interface BlockerDeps {
  backlog: BacklogRepository;
  audit: AuditPort;
  uid?: IdGenerator;
  now?: Clock;
}

function ensureCanEdit(itemFrontId: string, membership: ProjectMembership): void {
  const ok = membership.canMoveItem(itemFrontId);
  if (!ok) {
    throw new DomainError(`Sem permissão para gerenciar bloqueio da frente ${itemFrontId}`);
  }
}

export async function openBlockerForItem(
  itemId: string,
  description: string,
  membership: ProjectMembership,
  deps: BlockerDeps
): Promise<Blocker> {
  const uid = deps.uid ?? defaultIdGenerator();
  const now = deps.now ?? defaultClock();

  const item = await deps.backlog.load(itemId);
  if (!item) {
    throw new DomainError(`Item ${itemId} não encontrado`);
  }
  ensureCanEdit(item.frontId, membership);

  const blocker = Blocker.open({
    id: uid("b"),
    description,
    reportedBy: membership.personId,
    openedAt: now(),
  });
  item.registerBlocker(blocker);
  await deps.backlog.save(item);
  await deps.audit.record({
    actorId: membership.personId,
    action: "BlockerOpened",
    aggregate: item.id,
    at: now(),
  });
  return blocker;
}

export async function resolveBlockerForItem(
  itemId: string,
  blockerId: string,
  membership: ProjectMembership,
  deps: BlockerDeps
): Promise<Blocker> {
  const now = deps.now ?? defaultClock();

  const item = await deps.backlog.load(itemId);
  if (!item) {
    throw new DomainError(`Item ${itemId} não encontrado`);
  }
  ensureCanEdit(item.frontId, membership);

  const blocker = item.getBlockers().find((b) => b.id === blockerId);
  if (!blocker) {
    throw new DomainError(`Bloqueio ${blockerId} não encontrado no item ${itemId}`);
  }
  blocker.resolve(membership.personId, now());
  await deps.backlog.save(item);
  await deps.audit.record({
    actorId: membership.personId,
    action: "BlockerResolved",
    aggregate: item.id,
    at: now(),
  });
  return blocker;
}
