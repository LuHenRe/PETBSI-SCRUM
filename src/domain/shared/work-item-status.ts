import { DomainError } from "./domain-error";

export type WorkItemStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "blocked"
  | "review"
  | "done"
  | "cancelled";

export const WORK_ITEM_STATUS_VALUES: readonly WorkItemStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "blocked",
  "review",
  "done",
  "cancelled",
];

export function isWorkItemStatus(value: unknown): value is WorkItemStatus {
  return typeof value === "string" && WORK_ITEM_STATUS_VALUES.includes(value as WorkItemStatus);
}

export function assertWorkItemStatus(value: unknown): asserts value is WorkItemStatus {
  if (!isWorkItemStatus(value)) {
    throw new DomainError(`Status de item de trabalho inválido: ${String(value)}`);
  }
}