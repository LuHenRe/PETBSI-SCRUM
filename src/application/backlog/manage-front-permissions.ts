import { DomainError } from "../../domain/shared/domain-error";
import { ProjectMembership } from "../../domain/project/project-membership";
import type {
  AuditPort,
  Clock,
  MembershipRepository,
} from "../ports/repositories";
import { defaultClock } from "../ports/repositories";

export interface PermissionsDeps {
  memberships: MembershipRepository;
  audit: AuditPort;
  now?: Clock;
}

export async function setFrontPermission(
  membershipId: string,
  frontId: string,
  canView: boolean,
  canEdit: boolean,
  actor: ProjectMembership,
  deps: PermissionsDeps
): Promise<ProjectMembership> {
  const now = deps.now ?? defaultClock();

  if (!actor.isTechAdmin()) {
    throw new DomainError("Apenas Scrum Master/Assistente pode gerenciar permissões por frente");
  }

  const target = await deps.memberships.load(membershipId);
  if (!target) {
    throw new DomainError(`Membro com vínculo ${membershipId} não encontrado`);
  }

  const updatedPermissions = target.frontPermissions.filter(p => p.frontId !== frontId);
  if (canView || canEdit) {
    updatedPermissions.push({ frontId, canView, canEdit });
  }

  const updated = new ProjectMembership({
    id: target.id,
    personId: target.personId,
    primaryFrontId: target.primaryFrontId,
    role: target.role,
    frontPermissions: updatedPermissions,
  });

  await deps.memberships.save(updated);
  await deps.audit.record({
    actorId: actor.personId,
    action: "FrontPermissionChanged",
    aggregate: target.id,
    at: now(),
  });
  return updated;
}
