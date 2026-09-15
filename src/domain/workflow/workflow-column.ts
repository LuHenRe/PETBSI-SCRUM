import { DomainError } from "../shared/domain-error";
import { WipLimit } from "../shared/wip-limit";
import { WorkItemStatus, assertWorkItemStatus } from "../shared/work-item-status";

export class WorkflowColumn {
  readonly id: string;
  readonly status: WorkItemStatus;
  readonly name: string;
  private readonly _wipLimit: WipLimit;

  constructor(draft: { id: string; status: WorkItemStatus; name: string; wipLimit: WipLimit }) {
    if (!draft.id || !draft.id.trim()) {
      throw new DomainError("Identificador da coluna não pode ser vazio");
    }
    if (!draft.name || !draft.name.trim()) {
      throw new DomainError("Nome da coluna não pode ser vazio");
    }
    assertWorkItemStatus(draft.status);
    this.id = draft.id;
    this.status = draft.status;
    this.name = draft.name;
    this._wipLimit = draft.wipLimit;
    Object.freeze(this);
  }

  get wipLimit(): WipLimit {
    return this._wipLimit;
  }

  canReceive(currentCount: number): boolean {
    return WipPolicy.canEnter(this._wipLimit, currentCount);
  }
}

class WipPolicy {
  static canEnter(limit: WipLimit, currentCount: number): boolean {
    if (!Number.isInteger(currentCount) || currentCount < 0) {
      throw new DomainError(`Contagem atual inválida: ${currentCount}. Deve ser inteiro >= 0.`);
    }
    return limit.allows(currentCount + 1);
  }
}

export { WipPolicy };