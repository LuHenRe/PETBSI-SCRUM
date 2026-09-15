import { DomainError } from "./domain-error";

export type BacklogPriority = "alta" | "media" | "baixa";

export const BACKLOG_PRIORITY_VALUES: readonly BacklogPriority[] = ["alta", "media", "baixa"];

export function isBacklogPriority(value: unknown): value is BacklogPriority {
  return typeof value === "string" && BACKLOG_PRIORITY_VALUES.includes(value as BacklogPriority);
}

export function assertBacklogPriority(value: unknown): asserts value is BacklogPriority {
  if (!isBacklogPriority(value)) {
    throw new DomainError(`Prioridade de backlog inválida: ${String(value)}`);
  }
}