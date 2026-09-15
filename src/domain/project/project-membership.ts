import { DomainError } from "../shared/domain-error";
import { ProjectRole, assertProjectRole, PROJECT_ROLE_LABEL, isTechAdmin, isCoordinator } from "../shared/project-role";

export class ProjectMembership {
  readonly id: string;
  readonly personId: string;
  readonly frontId: string;
  readonly role: ProjectRole;
  private readonly _canEdit: boolean;

  constructor(draft: { id: string; personId: string; frontId: string; role: ProjectRole; canEdit: boolean }) {
    if (!draft.id || !draft.id.trim()) {
      throw new DomainError("Identificador do vínculo não pode ser vazio");
    }
    if (!draft.personId || !draft.personId.trim()) {
      throw new DomainError("Identificador da pessoa não pode ser vazio");
    }
    if (!draft.frontId || !draft.frontId.trim()) {
      throw new DomainError("Identificador da frente não pode ser vazio");
    }
    assertProjectRole(draft.role);
    this.id = draft.id;
    this.personId = draft.personId;
    this.frontId = draft.frontId;
    this.role = draft.role;
    this._canEdit = draft.canEdit;
    // Entity is mutable in principle but fields are readonly
    // Object.freeze removed intentionally for consistency
  }

  get canEdit(): boolean {
    return this._canEdit;
  }

  get displayTitle(): string {
    return this._canEdit ? PROJECT_ROLE_LABEL[this.role] : "Visitante";
  }

  canMoveItem(frontId: string): boolean {
    return this.frontId === frontId && this._canEdit;
  }

  isTechAdmin(): boolean {
    return isTechAdmin(this.role);
  }

  isCoordinator(): boolean {
    return isCoordinator(this.role);
  }
}