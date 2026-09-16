"use client";

import { CalendarDays } from "lucide-react";
import type { BacklogItem, BacklogItemType, BacklogPriority, Front, Person, WorkItemStatus } from "@/lib/types";
import { PRIORITY_LABEL, PRIORITY_TONE, STATUS_LABEL, TYPE_LABEL, VALUE_LABEL } from "@/lib/labels";
import { deadlineLabel, deadlineTone } from "@/lib/seed";
import { Badge, AvatarStack } from "@/components/ui";
import { frontById } from "@/lib/store";
import type { AppState } from "@/lib/types";

export function StatusBadge({ status }: { status: WorkItemStatus }) {
  const tone =
    status === "done" ? "ok" :
    status === "blocked" ? "danger" :
    status === "review" ? "warn" :
    status === "in_progress" ? "primary" :
    status === "todo" ? "info" :
    "muted";
  return (
    <Badge tone={tone} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: BacklogItemType }) {
  return <Badge tone="muted">{TYPE_LABEL[type]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: BacklogPriority }) {
  return <Badge tone={PRIORITY_TONE[priority]}>{PRIORITY_LABEL[priority]}</Badge>;
}

export function ValueBadge({ value }: { value: BacklogItem["value"] }) {
  const tone = value === "PQ" ? "info" : value === "M" ? "warn" : "muted";
  return <Badge tone={tone}>{VALUE_LABEL[value]}</Badge>;
}

export function FrontTag({ front, truncate }: { front: Front | null | undefined; truncate?: boolean }) {
  if (!front) return null;
  return (
    <span
      className="badge"
      title={front.name}
      style={{
        background: `${front.color}14`,
        color: front.color,
      }}
    >
      <span className="dot" style={{ background: front.color }} aria-hidden />
      <span className={truncate ? "badge-truncate" : ""}>{front.name}</span>
    </span>
  );
}

export function DeadlinePill({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;
  return (
    <Badge tone={deadlineTone(deadline) as "ok" | "warn" | "danger"}>
      <CalendarDays size={12} aria-hidden />
      {deadlineLabel(deadline)}
    </Badge>
  );
}

export function Assignees({ item, state }: { item: BacklogItem; state: AppState }) {
  const people = item.assigneeIds.map((id) => state.people.find((p) => p.id === id)).filter((p): p is Person => !!p);
  if (people.length === 0) return <span className="text-xs text-muted">Sem responsáveis</span>;
  return <AvatarStack people={people} />;
}

export function FrontBar({ frontId, state }: { frontId: string; state: AppState }) {
  const front = frontById(state, frontId);
  return <span className="front-bar" style={{ background: front?.color ?? "#cbd5e1" }} aria-hidden />;
}

// Cartão usado dentro das colunas do Kanban
export function KanbanCard({ item, state }: { item: BacklogItem; state: AppState }) {
  const front = frontById(state, item.frontId);
  return (
    <a className="mini-card" href={`/itens/${item.id}`}>
      <div className="mini-card-top">
        <span className="mini-card-title">{item.title}</span>
      </div>
      {item.description && (
        <div
          className="text-xs text-muted"
          style={{
            marginTop: "6px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
          }}
        >
          {item.description}
        </div>
      )}
      <div className="mini-card-meta" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ width: "100%", minWidth: 0 }}>
          <FrontTag front={front} truncate />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <TypeBadge type={item.type} />
          <Assignees item={item} state={state} />
        </div>
      </div>
      {item.deadline && (
        <div className="mt-2 flex">
          <DeadlinePill deadline={item.deadline} />
        </div>
      )}
    </a>
  );
}