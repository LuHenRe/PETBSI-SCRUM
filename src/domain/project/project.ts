import { DomainError } from "../shared/domain-error";
import { ProjectMembership } from "./project-membership";

export class Project {
  readonly id: string;
  readonly name: string;

  constructor(draft: { id: string; name: string }) {
    if (!draft.id || !draft.id.trim()) {
      throw new DomainError("Identificador do projeto não pode ser vazio");
    }
    if (!draft.name || !draft.name.trim()) {
      throw new DomainError("Nome do projeto não pode ser vazio");
    }
    this.id = draft.id;
    this.name = draft.name;
  }

  static assertSinglePO(memberships: readonly ProjectMembership[]): void {
    const poCount = memberships.filter((m) => m.role === "PRODUCT_OWNER").length;
    if (poCount > 1) {
      throw new DomainError("Só pode existir um coordenador exercendo o Product Owner por projeto");
    }
  }
}