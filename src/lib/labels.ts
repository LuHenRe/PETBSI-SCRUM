import type { BacklogItemType, BacklogPriority, DeliveryStatus, ProjectRole, WorkItemStatus } from "./types";

export const STATUS_LABEL: Record<WorkItemStatus, string> = {
  backlog: "Product Backlog",
  todo: "A fazer",
  in_progress: "Em andamento",
  blocked: "Bloqueado",
  review: "Em revisão",
  done: "Concluído",
};

export const TYPE_LABEL: Record<BacklogItemType, string> = {
  documento: "Documento",
  codigo: "Código",
  pesquisa: "Pesquisa",
  material: "Material",
  infra: "Infra / Integração",
  gestao: "Gestão",
};

export const PRIORITY_LABEL: Record<BacklogPriority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const PRIORITY_TONE: Record<BacklogPriority, "danger" | "warn" | "muted"> = {
  alta: "danger",
  media: "warn",
  baixa: "muted",
};

export const VALUE_LABEL: Record<string, string> = {
  PQ: "Produto do projeto",
  M: "Melhoria",
  S: "Supérfluo",
};

export const ROLE_LABEL: Record<ProjectRole, string> = {
  MEMBER: "Membro",
  SCRUM_MASTER: "Scrum Master",
  SCRUM_MASTER_ASSISTANT: "Scrum Master Assistente",
  COORDINATOR: "Coordenador",
  PRODUCT_OWNER: "Coordenador (Product Owner)",
};

export const DELIVERY_LABEL: Record<DeliveryStatus, string> = {
  planejada: "Planejada",
  em_andamento: "Em andamento",
  entregue: "Entregue",
};

export const DELIVERY_TONE: Record<DeliveryStatus, "muted" | "warn" | "ok"> = {
  planejada: "muted",
  em_andamento: "warn",
  entregue: "ok",
};

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function isTechAdmin(role: ProjectRole): boolean {
  return role === "SCRUM_MASTER" || role === "SCRUM_MASTER_ASSISTANT";
}

export function isCoordinator(role: ProjectRole): boolean {
  return role === "COORDINATOR" || role === "PRODUCT_OWNER";
}