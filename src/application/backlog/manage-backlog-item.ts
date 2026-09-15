import { BacklogItem } from "../../domain/backlog/backlog-item";
import { DomainError } from "../../domain/shared/domain-error";
import type { BacklogPriority } from "../../domain/shared/backlog-priority";
import type { ProjectMembership } from "../../domain/project/project-membership";
import type {
  AuditPort,
  BacklogRepository,
  Clock,
  IdGenerator,
} from "../ports/repositories";
import { defaultClock, defaultIdGenerator } from "../ports/repositories";

export interface CreateBacklogInput {
  title: string;
  description?: string;
  frontId: string;
  priority: BacklogPriority;
  deadline?: string | null;
}

export interface BacklogDeps {
  backlog: BacklogRepository;
  audit: AuditPort;
  uid?: IdGenerator;
  now?: Clock;
}

function canCreateInFront(membership: ProjectMembership, frontId: string): boolean {
  return (
    membership.canMoveItem(frontId) ||
    membership.isTechAdmin() ||
    membership.isCoordinator()
  );
}

export async function createBacklogItem(
  input: CreateBacklogInput,
  membership: ProjectMembership,
  deps: BacklogDeps
): Promise<BacklogItem> {
  const uid = deps.uid ?? defaultIdGenerator();
  const now = deps.now ?? defaultClock();

  const title = input.title?.trim() ?? "";
  if (title.length < 3) {
    throw new DomainError("Título do item deve ter pelo menos 3 caracteres");
  }
  const frontId = input.frontId?.trim() ?? "";
  if (!frontId) {
    throw new DomainError("Frente do item é obrigatória");
  }
  if (!canCreateInFront(membership, frontId)) {
    throw new DomainError(`Sem permissão para criar item na frente ${frontId}`);
  }

  const item = BacklogItem.create({
    id: uid("i"),
    title,
    description: (input.description ?? "").trim(),
    frontId,
    priority: input.priority,
    deadline: input.deadline ?? null,
  });

  await deps.backlog.save(item);
  await deps.audit.record({
    actorId: membership.personId,
    action: "BacklogItemCreated",
    aggregate: item.id,
    at: now(),
  });
  return item;
}

export async function saveBacklogItem(
  item: BacklogItem,
  membership: ProjectMembership,
  deps: BacklogDeps
): Promise<BacklogItem> {
  const now = deps.now ?? defaultClock();
  if (!canCreateInFront(membership, item.frontId)) {
    throw new DomainError(`Sem permissão para editar item na frente ${item.frontId}`);
  }
  await deps.backlog.save(item);
  await deps.audit.record({
    actorId: membership.personId,
    action: "BacklogItemSaved",
    aggregate: item.id,
    at: now(),
  });
  return item;
}
