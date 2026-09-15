import { DomainError } from "../shared/domain-error";
import { WorkItemStatus, assertWorkItemStatus } from "../shared/work-item-status";

export class WorkItemStateChange {
  readonly id: string;
  readonly itemId: string;
  readonly actorId: string;
  readonly from: WorkItemStatus | null;
  readonly to: WorkItemStatus;
  readonly at: string;
  readonly reason: string | null;

  constructor(draft: {
    id: string;
    itemId: string;
    actorId: string;
    from: WorkItemStatus | null;
    to: WorkItemStatus;
    at: string;
    reason: string | null;
  }) {
    if (!draft.id || !draft.id.trim()) {
      throw new DomainError("Identificador da mudança de estado não pode ser vazio");
    }
    if (!draft.itemId || !draft.itemId.trim()) {
      throw new DomainError("Identificador do item não pode ser vazio");
    }
    if (!draft.actorId || !draft.actorId.trim()) {
      throw new DomainError("Identificador do ator não pode ser vazio");
    }
    if (!draft.at || !draft.at.trim()) {
      throw new DomainError("Timestamp da mudança não pode ser vazio");
    }
    if (draft.from !== null) {
      assertWorkItemStatus(draft.from);
    }
    assertWorkItemStatus(draft.to);
    if (draft.from !== null && draft.from === draft.to && draft.reason !== "edited") {
      throw new DomainError("Transição nula: estado de origem e destino são iguais");
    }
    this.id = draft.id;
    this.itemId = draft.itemId;
    this.actorId = draft.actorId;
    this.from = draft.from;
    this.to = draft.to;
    this.at = draft.at;
    this.reason = draft.reason;
    Object.freeze(this);
  }
}