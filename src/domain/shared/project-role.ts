import { DomainError } from "./domain-error";

export type ProjectRole =
  | "MEMBER"
  | "SCRUM_MASTER"
  | "SCRUM_MASTER_ASSISTANT"
  | "COORDINATOR"
  | "PRODUCT_OWNER";

export const PROJECT_ROLE_VALUES: readonly ProjectRole[] = [
  "MEMBER",
  "SCRUM_MASTER",
  "SCRUM_MASTER_ASSISTANT",
  "COORDINATOR",
  "PRODUCT_OWNER",
];

export function isProjectRole(value: unknown): value is ProjectRole {
  return typeof value === "string" && PROJECT_ROLE_VALUES.includes(value as ProjectRole);
}

export function assertProjectRole(value: unknown): asserts value is ProjectRole {
  if (!isProjectRole(value)) {
    throw new DomainError(`Papel inválido: ${String(value)}`);
  }
}

export const PROJECT_ROLE_LABEL: Record<ProjectRole, string> = {
  MEMBER: "Membro",
  SCRUM_MASTER: "Scrum Master",
  SCRUM_MASTER_ASSISTANT: "Scrum Master Assistente",
  COORDINATOR: "Coordenador",
  PRODUCT_OWNER: "Coordenador (Product Owner)",
};

export function isTechAdmin(role: ProjectRole): boolean {
  return role === "SCRUM_MASTER" || role === "SCRUM_MASTER_ASSISTANT";
}

export function isCoordinator(role: ProjectRole): boolean {
  return role === "COORDINATOR" || role === "PRODUCT_OWNER";
}