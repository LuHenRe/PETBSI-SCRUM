import { ProjectMembership } from "../../domain/project/project-membership";
import type { ProjectRole } from "../../domain/shared/project-role";
import type { MembershipRepository } from "../../application/ports/repositories";
import { createSeedState } from "../../lib/seed";

export class MemoryMembershipRepository implements MembershipRepository {
  private readonly store = new Map<string, ProjectMembership>();

  async load(id: string): Promise<ProjectMembership | null> {
    return this.store.get(id) ?? null;
  }

  async save(membership: ProjectMembership): Promise<void> {
    this.store.set(membership.id, membership);
  }

  async listAll(): Promise<ProjectMembership[]> {
    return [...this.store.values()];
  }

  async seedFromSeed(): Promise<void> {
    const seed = createSeedState();
    for (const m of seed.memberships) {
      this.store.set(
        m.id,
        new ProjectMembership({
          id: m.id,
          personId: m.personId,
          frontId: m.frontId,
          role: m.role as ProjectRole,
          canEdit: m.canEdit,
        })
      );
    }
  }
}
