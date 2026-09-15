import { WorkflowColumn } from "../../domain/workflow/workflow-column";
import { WipLimit } from "../../domain/shared/wip-limit";
import { DomainError } from "../../domain/shared/domain-error";
import type { WorkItemStatus } from "../../domain/shared/work-item-status";
import type { BacklogItem as DomainBacklogItem } from "../../domain/backlog/backlog-item";
import { createSeedState } from "../../lib/seed";
import type {
  AppState,
  BacklogItem as LegacyBacklogItem,
  BacklogItemType,
  Blocker as LegacyBlocker,
  Front,
  Person,
  ProjectMembership as LegacyMembership,
  Sprint as LegacySprint,
  WorkflowColumn as LegacyColumn,
  WorkItemStatus as LegacyStatus,
} from "../../lib/types";
import { applyScheduleCorrections } from "./presentation-schedule";

export interface ItemExtras {
  type: BacklogItemType;
  value: LegacyBacklogItem["value"];
  sprintId: string | null;
  assigneeIds: string[];
  createdAt: string;
}

export interface PresentationDraft {
  type?: BacklogItemType;
  value?: LegacyBacklogItem["value"];
  sprintId?: string | null;
  assigneeIds?: string[];
}

/**
 * PresentationStore — estado de apresentação (type/value/sprintId/assignees,
 * ordem, fronts, people, columns, events, deliveries) derivado do seed.
 * O estado de domínio (status, blockers, auditoria) vive nos Memory*.
 * Após cada escrita via domínio, o api-client sincroniza aqui e notifica
 * os listeners (useSyncExternalStore nos hooks).
 */
export class PresentationStore {
  private items: LegacyBacklogItem[] = [];
  private blockers: LegacyBlocker[] = [];
  private order: string[] = [];
  private extras = new Map<string, ItemExtras>();
  private statics!: AppState;

  constructor() {
    this.reset();
  }

  reset(): void {
    const seed = createSeedState();
    this.items = seed.backlogItems.map((i) => ({
      ...i,
      assigneeIds: [...i.assigneeIds],
    }));
    this.blockers = seed.blockers.map((b) => ({ ...b }));
    this.order = seed.backlogItems.map((i) => i.id);
    this.extras = new Map<string, ItemExtras>(
      seed.backlogItems.map((i) => [
        i.id,
        {
          type: i.type,
          value: i.value,
          sprintId: i.sprintId,
          assigneeIds: [...i.assigneeIds],
          createdAt: i.createdAt,
        },
      ])
    );
    // MT-4.4 (RF20): horários corrigidos no adapter (18:30→08:00 nas
    // reuniões e1/e2); o seed legado permanece intocado.
    seed.events = applyScheduleCorrections(seed.events);
    this.statics = seed;
  }

  columnFor(status: WorkItemStatus): WorkflowColumn {
    const meta = this.statics.columns.find((c) => c.status === (status as string));
    if (!meta) {
      throw new DomainError(`Coluna ${status} não encontrada`);
    }
    return new WorkflowColumn({
      id: meta.id,
      status,
      name: meta.name,
      wipLimit:
        meta.wipLimit === null || meta.wipLimit === undefined
          ? WipLimit.unlimited()
          : WipLimit.of(meta.wipLimit),
    });
  }

  listItems(): LegacyBacklogItem[] {
    const byId = new Map(this.items.map((i) => [i.id, i]));
    const ordered: LegacyBacklogItem[] = [];
    for (const id of this.order) {
      const it = byId.get(id);
      if (it) ordered.push({ ...it, assigneeIds: [...it.assigneeIds] });
    }
    for (const it of this.items) {
      if (!this.order.includes(it.id)) {
        ordered.push({ ...it, assigneeIds: [...it.assigneeIds] });
      }
    }
    return ordered;
  }

  listBlockers(): LegacyBlocker[] {
    return this.blockers.map((b) => ({ ...b }));
  }

  listFronts(): Front[] {
    return this.statics.fronts.map((f) => ({ ...f }));
  }

  listPeople(): Person[] {
    return this.statics.people.map((p) => ({ ...p }));
  }

  listColumns(): LegacyColumn[] {
    return this.statics.columns.map((c) => ({ ...c }));
  }

  listSprints(): LegacySprint[] {
    return this.statics.sprints.map((s) => ({
      ...s,
      itemIds: [...s.itemIds],
    }));
  }

  listMembershipsLegacy(): LegacyMembership[] {
    return this.statics.memberships.map((m) => ({ ...m }));
  }

  getStatics(): AppState {
    return this.statics;
  }

  syncStatus(itemId: string, status: LegacyStatus): void {
    const idx = this.items.findIndex((i) => i.id === itemId);
    if (idx >= 0) {
      this.items[idx] = { ...this.items[idx], status };
    }
  }

  trackCreated(item: DomainBacklogItem, draft: PresentationDraft): void {
    const extras: ItemExtras = {
      type: draft.type ?? "documento",
      value: draft.value ?? "M",
      sprintId: draft.sprintId ?? null,
      assigneeIds: draft.assigneeIds ? [...draft.assigneeIds] : [],
      createdAt: new Date().toISOString().slice(0, 10),
    };
    this.extras.set(item.id, extras);
    this.items.unshift({
      id: item.id,
      title: item.title,
      type: extras.type,
      description: item.description,
      frontId: item.frontId,
      status: item.status as LegacyStatus,
      priority: item.priority,
      value: extras.value,
      sprintId: extras.sprintId,
      assigneeIds: [...extras.assigneeIds],
      deadline: item.deadline,
      createdAt: extras.createdAt,
    });
    this.order.unshift(item.id);
  }

  syncItem(item: DomainBacklogItem, draft: PresentationDraft): void {
    const ex =
      this.extras.get(item.id) ??
      ({
        type: "documento",
        value: "M",
        sprintId: null,
        assigneeIds: [],
        createdAt: new Date().toISOString().slice(0, 10),
      } satisfies ItemExtras);
    ex.type = draft.type ?? ex.type;
    ex.value = draft.value ?? ex.value;
    ex.sprintId = draft.sprintId ?? null;
    ex.assigneeIds = draft.assigneeIds ? [...draft.assigneeIds] : ex.assigneeIds;
    this.extras.set(item.id, ex);
    const idx = this.items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      this.items[idx] = {
        ...this.items[idx],
        title: item.title,
        description: item.description,
        frontId: item.frontId,
        priority: item.priority,
        deadline: item.deadline,
        type: ex.type,
        value: ex.value,
        sprintId: ex.sprintId,
        assigneeIds: [...ex.assigneeIds],
      };
    }
  }

  refreshBlockers(domainItems: DomainBacklogItem[]): void {
    const next: LegacyBlocker[] = [];
    for (const item of domainItems) {
      for (const b of item.getBlockers()) {
        next.push({
          id: b.id,
          itemId: item.id,
          description: b.description,
          openedAt: (b.openedAt ?? "").slice(0, 10),
          openedBy: b.reportedBy,
          resolvedAt: b.resolvedAt ? b.resolvedAt.slice(0, 10) : null,
          resolvedBy: b.resolvedBy,
        });
      }
    }
    // Domínio tem precedência por id; legados sem correspondente são mantidos.
    const byId = new Map(next.map((b) => [b.id, b]));
    for (const lb of this.blockers) {
      if (!byId.has(lb.id)) byId.set(lb.id, lb);
    }
    this.blockers = [...byId.values()];
  }

  reorder(id: string, direction: -1 | 1): void {
    const idx = this.order.indexOf(id);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= this.order.length) return;
    const next = [...this.order];
    const [picked] = next.splice(idx, 1);
    next.splice(target, 0, picked as string);
    this.order = next;
    const byId = new Map(this.items.map((i) => [i.id, i]));
    const rebuilt: LegacyBacklogItem[] = [];
    for (const oid of next) {
      const it = byId.get(oid);
      if (it) rebuilt.push(it);
    }
    for (const it of this.items) {
      if (!next.includes(it.id)) rebuilt.push(it);
    }
    this.items = rebuilt;
  }
}
