import { DomainError } from "../shared/domain-error";
import { DateRange } from "../shared/date-range";

export type SprintStatus = "rascunho" | "planejada" | "em_andamento" | "encerrada";

export class Sprint {
  readonly id: string;
  readonly name: string;
  readonly period: DateRange;
  private _goal: string | null;
  private _status: SprintStatus;
  private _selectedItemIds: string[];

  private constructor(draft: {
    id: string;
    name: string;
    period: DateRange;
    goal: string | null;
    status: SprintStatus;
    selectedItemIds: string[];
  }) {
    if (!draft.id || !draft.id.trim()) {
      throw new DomainError("Identificador da Sprint não pode ser vazio");
    }
    if (!draft.name || !draft.name.trim()) {
      throw new DomainError("Nome da Sprint não pode ser vazio");
    }
    this.id = draft.id;
    this.name = draft.name;
    this.period = draft.period;
    this._goal = draft.goal;
    this._status = draft.status;
    this._selectedItemIds = draft.selectedItemIds;
    // Entity is mutable (has methods like iniciar, selectItem, close)
    // Object.freeze removed intentionally
  }

  static create(draft: { id: string; name: string; period: DateRange }): Sprint {
    return new Sprint({
      ...draft,
      goal: null,
      status: "rascunho",
      selectedItemIds: [],
    });
  }

  get goal(): string | null {
    return this._goal;
  }

  get status(): SprintStatus {
    return this._status;
  }

  isActive(): boolean {
    return this._status === "em_andamento";
  }

  getSelectedItemIds(): readonly string[] {
    return [...this._selectedItemIds];
  }

  definirMeta(meta: string): void {
    if (this._status === "em_andamento" || this._status === "encerrada") {
      throw new DomainError("A Meta da Sprint não pode ser alterada após o início");
    }
    const trimmed = meta.trim();
    if (!trimmed) {
      throw new DomainError("A Meta da Sprint não pode ser vazia");
    }
    this._goal = trimmed;
    this._status = "planejada";
  }

  iniciar(outrasSprints: readonly Sprint[] = []): void {
    if (this._goal === null) {
      throw new DomainError("Defina a Meta da Sprint antes de iniciar");
    }
    if (this._status !== "planejada") {
      throw new DomainError(`A Sprint não pode iniciar no estado "${this._status}"`);
    }
    if (outrasSprints.some((s) => s.isActive())) {
      throw new DomainError("Não é possível iniciar outra Sprint: já existe uma Sprint ativa");
    }
    this._status = "em_andamento";
  }

  selectItem(itemId: string): void {
    if (this._status === "encerrada") {
      throw new DomainError("Sprint encerrada não aceita novos itens");
    }
    if (!itemId || !itemId.trim()) {
      throw new DomainError("Identificador de item inválido");
    }
    if (this._selectedItemIds.includes(itemId)) {
      throw new DomainError(`O item ${itemId} já está seleccionado nesta Sprint`);
    }
    this._selectedItemIds.push(itemId);
  }

  close(): void {
    if (this._status !== "em_andamento") {
      throw new DomainError("Só uma Sprint em andamento pode ser encerrada");
    }
    this._status = "encerrada";
  }
}