import { DomainError } from "../shared/domain-error";
import { ProjectRole, assertProjectRole, PROJECT_ROLE_LABEL, isTechAdmin, isCoordinator } from "../shared/project-role";

export class ProjectMembership {
  readonly id: string;
  readonly personId: string;
  readonly primaryFrontId: string | null;
  readonly role: ProjectRole;
  readonly frontPermissions: { frontId: string; canView: boolean; canEdit: boolean }[];

  constructor(draft: { id: string; personId: string; primaryFrontId: string | null; role: ProjectRole; frontPermissions: { frontId: string; canView: boolean; canEdit: boolean }[] }) {
    if (!draft.id || !draft.id.trim()) {
      throw new DomainError("Identificador do vínculo não pode ser vazio");
    }
    if (!draft.personId || !draft.personId.trim()) {
      throw new DomainError("Identificador da pessoa não pode ser vazio");
    }
    assertProjectRole(draft.role);
    this.id = draft.id;
    this.personId = draft.personId;
    this.primaryFrontId = draft.primaryFrontId;
    this.role = draft.role;
    this.frontPermissions = draft.frontPermissions;
    // Entity is mutable in principle but fields are readonly
    // Object.freeze removed intentionally for consistency
  }



  get displayTitle(): string {
    return PROJECT_ROLE_LABEL[this.role] ?? "Membro";
  }

  canMoveItem(frontId: string): boolean {
    return this.canEditFront(frontId);
  }

  canEditFront(frontId: string): boolean {
    const fp = this.frontPermissions.find(p => p.frontId === frontId);
    if (fp) {
      return fp.canEdit;
    }
    if (this.role === "SCRUM_MASTER" || this.role === "SCRUM_MASTER_ASSISTANT" || this.role === "PRODUCT_OWNER") {
      return true;
    }
    return false;
  }

  canViewFront(frontId: string): boolean {
    const fp = this.frontPermissions.find(p => p.frontId === frontId);
    if (fp) {
      return fp.canView;
    }
    if (this.role === "SCRUM_MASTER" || this.role === "SCRUM_MASTER_ASSISTANT" || this.role === "PRODUCT_OWNER" || this.role === "COORDINATOR") {
      return true;
    }
    if (this.primaryFrontId === frontId) {
      return true;
    }
    return false;
  }

  isTechAdmin(): boolean {
    return isTechAdmin(this.role);
  }

  isCoordinator(): boolean {
    return isCoordinator(this.role);
  }
}