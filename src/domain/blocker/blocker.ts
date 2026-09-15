import { DomainError } from "../shared/domain-error";

export class Blocker {
  readonly id: string;
  readonly description: string;
  readonly reportedBy: string;
  readonly openedAt: string;
  private _resolvedAt: string | null;
  private _resolvedBy: string | null;

  private constructor(draft: {
    id: string;
    description: string;
    reportedBy: string;
    openedAt: string;
    resolvedAt?: string | null;
    resolvedBy?: string | null;
  }) {
    this.id = draft.id;
    this.description = draft.description;
    this.reportedBy = draft.reportedBy;
    this.openedAt = draft.openedAt;
    this._resolvedAt = draft.resolvedAt ?? null;
    this._resolvedBy = draft.resolvedBy ?? null;
    // Entity is mutable (has resolve method)
    // Object.freeze removed intentionally
  }

  static open(draft: {
    id: string;
    description: string;
    reportedBy: string;
    openedAt: string;
  }): Blocker {
    const desc = draft.description.trim();
    if (desc.length < 3) {
      throw new DomainError("A descrição do bloqueio deve ter pelo menos 3 caracteres");
    }
    if (!draft.id || !draft.id.trim()) {
      throw new DomainError("Identificador do bloqueio não pode ser vazio");
    }
    if (!draft.reportedBy || !draft.reportedBy.trim()) {
      throw new DomainError("Identificador do autor não pode ser vazio");
    }
    if (!draft.openedAt || !draft.openedAt.trim()) {
      throw new DomainError("Data de abertura não pode ser vazia");
    }
    return new Blocker({ ...draft, description: desc });
  }

  isOpen(): boolean {
    return this._resolvedAt === null;
  }

  isResolved(): boolean {
    return !this.isOpen();
  }

  get resolvedAt(): string | null {
    return this._resolvedAt;
  }

  get resolvedBy(): string | null {
    return this._resolvedBy;
  }

  resolve(resolvedBy: string, at: string): void {
    if (this.isResolved()) {
      throw new DomainError("O bloqueio já foi resolvido");
    }
    if (!resolvedBy || !resolvedBy.trim()) {
      throw new DomainError("Identificador do resolvedor não pode ser vazio");
    }
    if (!at || !at.trim()) {
      throw new DomainError("Data de resolução não pode ser vazia");
    }
    // Note: In a real implementation, we'd need to mutate the object
    // For now, we'll allow it since this is used in tests
    // A better approach would be to return a new Blocker instance
    (this as any)._resolvedAt = at;
    (this as any)._resolvedBy = resolvedBy;
  }
}