import { DomainError } from "../shared/domain-error";
import { WorkItemStatus, assertWorkItemStatus } from "../shared/work-item-status";
import { BacklogPriority, assertBacklogPriority } from "../shared/backlog-priority";
import { WorkflowColumn } from "../workflow/workflow-column";
import { WorkItemStateChange } from "../workflow/work-item-state-change";
import { Blocker } from "../blocker/blocker";

export interface MoveContext {
  actorId: string;
  at: string;
  reason?: string | null;
}

const ALLOWED_TRANSITIONS: Readonly<Record<WorkItemStatus, readonly WorkItemStatus[]>> = {
  backlog: ["todo", "cancelled"],
  todo: ["backlog", "in_progress", "cancelled"],
  in_progress: ["blocked", "review"],
  blocked: ["in_progress"],
  review: ["in_progress", "done"],
  done: [],
  cancelled: [],
};

const REQUIRES_BLOCKER: readonly WorkItemStatus[] = ["blocked"];
const REQUIRES_REASON: readonly WorkItemStatus[] = ["cancelled"];

export interface UpdateFieldsInput {
  title?: string;
  description?: string;
  frontId?: string;
  priority?: BacklogPriority;
  deadline?: string | null;
}

export interface UpdateFieldsContext {
  actorId: string;
  at: string;
}

export class BacklogItem {
  readonly id: string;
  title: string;
  description: string;
  frontId: string;
  priority: BacklogPriority;
  deadline: string | null;
  private _status: WorkItemStatus;
  private readonly _stateChanges: WorkItemStateChange[];
  private readonly _blockers: Blocker[];

  private constructor(draft: {
    id: string;
    title: string;
    description: string;
    frontId: string;
    priority: BacklogPriority;
    deadline: string | null;
    status: WorkItemStatus;
    stateChanges: WorkItemStateChange[];
    blockers: Blocker[];
  }) {
    this.id = draft.id;
    this.title = draft.title;
    this.description = draft.description;
    this.frontId = draft.frontId;
    this.priority = draft.priority;
    this.deadline = draft.deadline;
    this._status = draft.status;
    this._stateChanges = draft.stateChanges;
    this._blockers = draft.blockers;
    // Entity is mutable (has methods like moveTo, registerBlocker)
    // Object.freeze removed intentionally
  }

  static create(draft: {
    id: string;
    title: string;
    description: string;
    frontId: string;
    priority: BacklogPriority;
    deadline: string | null;
  }): BacklogItem {
    if (!draft.title || !draft.title.trim()) {
      throw new DomainError("Título do item não pode ser vazio");
    }
    if (!draft.id || !draft.id.trim()) {
      throw new DomainError("Identificador do item não pode ser vazio");
    }
    if (!draft.frontId || !draft.frontId.trim()) {
      throw new DomainError("Identificador da frente não pode ser vazio");
    }
    assertBacklogPriority(draft.priority);
    if (draft.deadline !== null && draft.deadline !== undefined && !draft.deadline.trim()) {
      throw new DomainError("Prazo não pode ser vazio se informado");
    }
    return new BacklogItem({
      ...draft,
      status: "backlog",
      stateChanges: [],
      blockers: [],
    });
  }

  get status(): WorkItemStatus {
    return this._status;
  }

  getStateChanges(): readonly WorkItemStateChange[] {
    return [...this._stateChanges];
  }

  getBlockers(): readonly Blocker[] {
    return [...this._blockers];
  }

  hasOpenBlocker(): boolean {
    return this._blockers.some((b) => b.isOpen());
  }

  registerBlocker(blocker: Blocker): void {
    if (!blocker.isOpen()) {
      throw new DomainError("Só é possível registrar bloqueios abertos");
    }
    if (this._blockers.some((b) => b.id === blocker.id)) {
      throw new DomainError(`Bloqueio com id ${blocker.id} já registrado`);
    }
    // Note: In a real implementation, we'd return a new BacklogItem instance
    // For now, we mutate the internal array (test compatibility)
    (this._blockers as Blocker[]).push(blocker);
  }

  moveTo(target: WorkflowColumn, currentCountInTarget: number, context: MoveContext): void {
    const fromStatus = this._status;
    const toStatus = target.status;

    if (fromStatus === toStatus) {
      throw new DomainError(`Transição nula: item já está em ${toStatus}`);
    }

    const allowed = ALLOWED_TRANSITIONS[fromStatus] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new DomainError(`Transição inválida: ${fromStatus} -> ${toStatus}`);
    }

    if (REQUIRES_BLOCKER.includes(toStatus) && !this.hasOpenBlocker()) {
      throw new DomainError("Não é possível mover para 'blocked' sem um bloqueio aberto");
    }

    if (fromStatus === "blocked" && this.hasOpenBlocker()) {
      throw new DomainError("Resolva o bloqueio antes de sair de 'blocked'");
    }

    if (REQUIRES_REASON.includes(toStatus)) {
      const reason = context.reason?.trim();
      if (!reason) {
        throw new DomainError("Cancelar um item exige justificativa");
      }
    }

    if (!target.canReceive(currentCountInTarget)) {
      throw new DomainError(
        `Limite de WIP da coluna "${target.name}" seria ultrapassado (${currentCountInTarget + 1}/${target.wipLimit.value ?? "∞"})`
      );
    }

    if (!context.actorId || !context.actorId.trim()) {
      throw new DomainError("Identificador do ator não pode ser vazio");
    }
    if (!context.at || !context.at.trim()) {
      throw new DomainError("Timestamp da mudança não pode ser vazio");
    }

    const change = new WorkItemStateChange({
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      itemId: this.id,
      actorId: context.actorId,
      from: fromStatus,
      to: toStatus,
      at: context.at,
      reason: context.reason?.trim() ?? null,
    });

    (this._stateChanges as WorkItemStateChange[]).push(change);
    this._status = toStatus;
  }

  updateFields(input: UpdateFieldsInput, context: UpdateFieldsContext): void {
    if (!context.actorId || !context.actorId.trim()) {
      throw new DomainError("Identificador do ator não pode ser vazio");
    }
    if (!context.at || !context.at.trim()) {
      throw new DomainError("Timestamp da mudança não pode ser vazio");
    }
    const nextTitle = input.title === undefined ? this.title : input.title.trim();
    if (nextTitle.length < 3) {
      throw new DomainError("Título do item deve ter pelo menos 3 caracteres");
    }
    const nextFrontId = input.frontId === undefined ? this.frontId : input.frontId.trim();
    if (!nextFrontId) {
      throw new DomainError("Frente do item é obrigatória");
    }
    const nextPriority = input.priority === undefined ? this.priority : input.priority;
    assertBacklogPriority(nextPriority);
    let nextDeadline: string | null;
    if (input.deadline === undefined) {
      nextDeadline = this.deadline;
    } else if (input.deadline === null) {
      nextDeadline = null;
    } else if (!input.deadline.trim()) {
      throw new DomainError("Prazo não pode ser vazio se informado");
    } else {
      nextDeadline = input.deadline;
    }
    const nextDescription =
      input.description === undefined ? this.description : input.description.trim();

    this.title = nextTitle;
    this.description = nextDescription;
    this.frontId = nextFrontId;
    this.priority = nextPriority;
    this.deadline = nextDeadline;

    const change = new WorkItemStateChange({
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      itemId: this.id,
      actorId: context.actorId,
      from: this._status,
      to: this._status,
      at: context.at,
      reason: "edited",
    });
    (this._stateChanges as WorkItemStateChange[]).push(change);
  }
}