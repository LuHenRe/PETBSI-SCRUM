import type { AppState } from "./types";

const ISO = (d: string) => d;

export const TODAY = "2026-09-13";

export function createSeedState(): AppState {
  return {
    currentUserId: "p1",
    people: [
      { id: "p1", name: "Ana Ribeiro", email: "ana.ribeiro@petbsi.edu.br", initials: "AR" },
      { id: "p2", name: "Bruno Sales", email: "bruno.sales@petbsi.edu.br", initials: "BS" },
      { id: "p3", name: "Carla Menezes", email: "carla.menezes@petbsi.edu.br", initials: "CM" },
      { id: "p4", name: "Diego Farias", email: "diego.farias@petbsi.edu.br", initials: "DF" },
      { id: "p5", name: "Elisa Nogueira", email: "elisa.nogueira@petbsi.edu.br", initials: "EN" },
      { id: "p6", name: "Felipe Lima", email: "felipe.lima@petbsi.edu.br", initials: "FL" },
      { id: "p7", name: "Gabriela Rocha", email: "gabriela.rocha@petbsi.edu.br", initials: "GR" },
      { id: "p8", name: "Hugo Martins", email: "hugo.martins@petbsi.edu.br", initials: "HM" },
    ],
    pairs: [
      { id: "d1", name: "Dupla 01 — Coordenação", personIds: ["p1", "p2"] },
      { id: "d2", name: "Dupla 02 — Gestão Ágil", personIds: ["p3", "p4"] },
      { id: "d3", name: "Dupla 03 — Ensino", personIds: ["p5", "p6"] },
      { id: "d4", name: "Dupla 04 — Pesquisa e Extensão", personIds: ["p7", "p8"] },
    ],
    fronts: [
      {
        id: "f1",
        name: "Ensino e Nivelamento",
        description: "Tutoria por pares, planejamento didático e materiais de apoio.",
        color: "#2563eb",
      },
      {
        id: "f2",
        name: "Pesquisa e Desenvolvimento de IA",
        description: "PLN, aprendizado de máquina e protótipo de Tutor Virtual.",
        color: "#7c3aed",
      },
      {
        id: "f3",
        name: "Extensão e Letramento Algorítmico",
        description: "Relação com a comunidade, materiais e oficinas de lógica.",
        color: "#059669",
      },
      {
        id: "f4",
        name: "Gestão Ágil",
        description: "Acompanhamento transversal, fluxo, entregas e apoio à coordenação.",
        color: "#d97706",
      },
    ],
    memberships: [
      { id: "m1", personId: "p1", primaryFrontId: "f4", role: "PRODUCT_OWNER", frontPermissions: [] },
      { id: "m2", personId: "p2", primaryFrontId: "f4", role: "COORDINATOR", frontPermissions: [] },
      { id: "m3", personId: "p3", primaryFrontId: "f4", role: "SCRUM_MASTER", frontPermissions: [] },
      { id: "m4", personId: "p4", primaryFrontId: "f4", role: "SCRUM_MASTER_ASSISTANT", frontPermissions: [] },
      { id: "m5", personId: "p5", primaryFrontId: "f1", role: "MEMBER", frontPermissions: [] },
      { id: "m6", personId: "p6", primaryFrontId: "f1", role: "MEMBER", frontPermissions: [{ frontId: "f3", canView: true, canEdit: false }] },
      { id: "m8", personId: "p7", primaryFrontId: "f2", role: "MEMBER", frontPermissions: [] },
      { id: "m9", personId: "p8", primaryFrontId: "f3", role: "MEMBER", frontPermissions: [] },
    ],
    backlogItems: [
      { id: "i1", title: "Diagrama de casos de uso do sistema", type: "documento", description: "Diagrama UML cobrindo os atores Coordenador, Scrum Master, Membro, Google, Telegram e Agendador.", frontId: "f4", status: "done", priority: "alta", value: "PQ", sprintId: "s1", assigneeIds: ["p1", "p2"], deadline: "2026-08-28", createdAt: "2026-08-17" },
      { id: "i2", title: "Especificação de requisitos (02 e 03)", type: "documento", description: "Requisitos funcionais e casos de uso alinhados ao modelo de atores.", frontId: "f4", status: "done", priority: "alta", value: "PQ", sprintId: "s1", assigneeIds: ["p1", "p3"], deadline: "2026-09-02", createdAt: "2026-08-18" },
      { id: "i3", title: "Implementar autenticação (login)", type: "codigo", description: "Tela de login e seleção da pessoa autenticada com redirecionamento para a visão geral.", frontId: "f4", status: "done", priority: "alta", value: "PQ", sprintId: "s1", assigneeIds: ["p3", "p4"], deadline: "2026-09-04", createdAt: "2026-08-20" },
      { id: "i4", title: "Quadro Kanban com limites de WIP", type: "codigo", description: "Quadro derivado das colunas do fluxo com mover item e exibição dos limites de WIP.", frontId: "f4", status: "in_progress", priority: "alta", value: "PQ", sprintId: "s2", assigneeIds: ["p3", "p4"], deadline: "2026-09-18", createdAt: "2026-09-08" },
      { id: "i5", title: "Product Backlog ordenável", type: "codigo", description: "Lista ordenável com tipo, valor, prioridade, frente e estado.", frontId: "f4", status: "in_progress", priority: "alta", value: "PQ", sprintId: "s2", assigneeIds: ["p5", "p6"], deadline: "2026-09-20", createdAt: "2026-09-08" },
      { id: "i6", title: "Integração Telegram com lembretes de prazo", type: "codigo", description: "Bot envia ao chat PETBSI notificações o lembrete 'A tarefa X falta Y dias para o prazo final.'", frontId: "f4", status: "todo", priority: "media", value: "M", sprintId: "s2", assigneeIds: ["p3", "p4"], deadline: "2026-09-22", createdAt: "2026-09-09" },
      { id: "i7", title: "Integração Google Drive (arquivos)", type: "infra", description: "Vínculo de arquivos com metadados e link no Drive, sem expor tokens.", frontId: "f4", status: "todo", priority: "media", value: "M", sprintId: "s2", assigneeIds: ["p4"], deadline: null, createdAt: "2026-09-09" },
      { id: "i8", title: "Reunião principal de quarta — configuração", type: "gestao", description: "Distinguir reunião de quarta como reunião principal de acompanhamento.", frontId: "f4", status: "review", priority: "media", value: "M", sprintId: "s2", assigneeIds: ["p1", "p3"], deadline: "2026-09-12", createdAt: "2026-09-05" },
      { id: "i9", title: "Material de nivelamento IEEE para calouros", type: "material", description: "Slides e exercícios de nivelamento de lógica e Python.", frontId: "f1", status: "in_progress", priority: "alta", value: "PQ", sprintId: "s2", assigneeIds: ["p5", "p6"], deadline: "2026-09-19", createdAt: "2026-09-09" },
      { id: "i10", title: "Roteiro de tutoria por pares", type: "documento", description: "Roteiro semanal de tutoria com entregas por dupla.", frontId: "f1", status: "review", priority: "media", value: "M", sprintId: "s2", assigneeIds: ["p5"], deadline: "2026-09-15", createdAt: "2026-09-06" },
      { id: "i11", title: "Cronograma de minicursos", type: "gestao", description: "Datas, salas e responsáveis dos minicursos do semestre.", frontId: "f1", status: "blocked", priority: "media", value: "M", sprintId: "s2", assigneeIds: ["p6"], deadline: "2026-09-24", createdAt: "2026-09-04" },
      { id: "i12", title: "Levantamento bibliográfico de PLN", type: "pesquisa", description: "Revisão sistemática sobre tutoria com processamento de linguagem natural.", frontId: "f2", status: "in_progress", priority: "alta", value: "PQ", sprintId: "s2", assigneeIds: ["p7"], deadline: "2026-09-26", createdAt: "2026-09-08" },
      { id: "i13", title: "Modelagem do protótipo do Tutor Virtual", type: "codigo", description: "Arquitetura do protótipo de tutor com dados sintéticos.", frontId: "f2", status: "todo", priority: "media", value: "M", sprintId: "s2", assigneeIds: ["p7"], deadline: null, createdAt: "2026-09-10" },
      { id: "i14", title: "Coleta de dados para avaliação do tutor", type: "pesquisa", description: "Instrumento de avaliação e termo de consentimento.", frontId: "f2", status: "backlog", priority: "baixa", value: "S", sprintId: null, assigneeIds: ["p7", "p8"], deadline: null, createdAt: "2026-09-11" },
      { id: "i15", title: "Artigo sobre letramento algorítmico", type: "documento", description: "Consolidação dos resultados de extensão e letramento.", frontId: "f3", status: "backlog", priority: "baixa", value: "S", sprintId: null, assigneeIds: ["p8"], deadline: null, createdAt: "2026-09-11" },
      { id: "i16", title: "Oficinas de lógica para a comunidade", type: "material", description: "Dinâmicas e apostilas das oficinas de letramento algorítmico.", frontId: "f3", status: "in_progress", priority: "alta", value: "PQ", sprintId: "s2", assigneeIds: ["p8"], deadline: "2026-09-23", createdAt: "2026-09-09" },
      { id: "i17", title: "Relatório de extensão", type: "documento", description: "Relatório parcial das atividades de extensão do semestre.", frontId: "f3", status: "todo", priority: "media", value: "M", sprintId: "s2", assigneeIds: ["p6", "p8"], deadline: "2026-09-29", createdAt: "2026-09-10" },
      { id: "i18", title: "Simulação da Sprint com a equipe", type: "gestao", description: "Simulação do fluxo e coleta de ajustes de política e WIP.", frontId: "f4", status: "backlog", priority: "media", value: "M", sprintId: null, assigneeIds: ["p1", "p2", "p3"], deadline: null, createdAt: "2026-09-12" },
    ],
    sprints: [
      { id: "s1", name: "Sprint 1", goal: "Estabelecer a base do sistema e do fluxo de trabalho.", status: "closed", startDate: "2026-08-18", endDate: "2026-09-04", itemIds: ["i1", "i2", "i3"] },
      { id: "s2", name: "Sprint 2", goal: "Concluir o núcleo operacional do backlog e do fluxo para validação da equipe.", status: "active", startDate: "2026-09-08", endDate: "2026-09-25", itemIds: ["i4", "i5", "i6", "i7", "i8", "i9", "i10", "i11", "i12", "i13", "i16", "i17"] },
      { id: "s3", name: "Sprint 3", goal: "Aprofundar integrações e consolidar entregas das frentes.", status: "planned", startDate: "2026-09-29", endDate: "2026-10-16", itemIds: [] },
    ],
    columns: [
      { id: "c_backlog", status: "backlog", name: "Product Backlog", wipLimit: null },
      { id: "c_todo", status: "todo", name: "A fazer", wipLimit: 4 },
      { id: "c_in_progress", status: "in_progress", name: "Em andamento", wipLimit: 4 },
      { id: "c_blocked", status: "blocked", name: "Bloqueado", wipLimit: 2 },
      { id: "c_review", status: "review", name: "Em revisão", wipLimit: 3 },
      { id: "c_done", status: "done", name: "Concluído", wipLimit: null },
    ],
    blockers: [
      { id: "b1", itemId: "i11", description: "Aguardando confirmação da Unidade sobre salas e horários.", openedAt: "2026-09-08", openedBy: "p6", resolvedAt: null, resolvedBy: null },
    ],
    stateChanges: [
      { id: "h1", itemId: "i1", fromStatus: null, toStatus: "done", changedAt: "2026-08-28", changedBy: "p2" },
      { id: "h2", itemId: "i2", fromStatus: null, toStatus: "done", changedAt: "2026-09-02", changedBy: "p3" },
      { id: "h3", itemId: "i3", fromStatus: "todo", toStatus: "done", changedAt: "2026-09-04", changedBy: "p4" },
      { id: "h4", itemId: "i4", fromStatus: "todo", toStatus: "in_progress", changedAt: "2026-09-10", changedBy: "p3" },
      { id: "h5", itemId: "i5", fromStatus: "todo", toStatus: "in_progress", changedAt: "2026-09-11", changedBy: "p5" },
      { id: "h6", itemId: "i11", fromStatus: "todo", toStatus: "blocked", changedAt: "2026-09-08", changedBy: "p6" },
    ],
    deliveries: [
      { id: "dv1", title: "Levantamento inicial e especificação", description: "Diagrama de casos de uso e requisitos do sistema.", frontId: "f4", status: "entregue", completedOn: "2026-09-04", sprintName: "Sprint 1", itemIds: ["i1", "i2"] },
      { id: "dv2", title: "Núcleo operacional do sistema", description: "Login, backlog, Kanban e integrações base.", frontId: "f4", status: "em_andamento", completedOn: null, sprintName: "Sprint 2", itemIds: ["i3", "i4", "i5", "i6", "i7"] },
      { id: "dv3", title: "Material didático de nivelamento", description: "Slides e exercícios de nívelamento para calouros.", frontId: "f1", status: "em_andamento", completedOn: null, sprintName: "Sprint 2", itemIds: ["i9", "i10"] },
      { id: "dv4", title: "Protótipo do Tutor Virtual", description: "Primeira versão navegável do protótipo de tutor.", frontId: "f2", status: "planejada", completedOn: null, sprintName: "Sprint 3", itemIds: ["i12", "i13", "i14"] },
    ],
    attachments: [
      { id: "a1", name: "diagrama-casos-de-uso.pdf", kind: "item", refId: "i1", url: "https://drive.google.com/file/d/abc123", status: "synced", uploadedBy: "p2", uploadedAt: "2026-08-28" },
      { id: "a2", name: "especificacao-requisitos.md", kind: "item", refId: "i2", url: "https://drive.google.com/file/d/def456", status: "synced", uploadedBy: "p3", uploadedAt: "2026-09-02" },
      { id: "a3", name: "slides-nivelamento.pdf", kind: "item", refId: "i9", url: "https://drive.google.com/file/d/ghi789", status: "synced", uploadedBy: "p5", uploadedAt: "2026-09-11" },
      { id: "a4", name: "kanban-wip-mock.tsx", kind: "item", refId: "i4", url: "https://drive.google.com/file/d/jkl012", status: "pending", uploadedBy: "p4", uploadedAt: "2026-09-12" },
    ],
    notifications: [
      { id: "n1", subject: "Planejamento da Sprint 2", body: "Estamos abrindo a Sprint 2 nesta terça. Revisem os itens selecionados antes da reunião de quarta.", recipients: [{ personId: "p1", status: "sent" }, { personId: "p2", status: "sent" }, { personId: "p3", status: "sent" }, { personId: "p4", status: "sent" }, { personId: "p5", status: "sent" }, { personId: "p6", status: "sent" }, { personId: "p7", status: "sent" }, { personId: "p8", status: "sent" }], status: "sent", createdAt: "2026-09-08", sentAt: "2026-09-08T08:10:00Z" },
      { id: "n2", subject: "Confirmação de salas da semana", body: "Confirmem a disponibilidade das salas para os minicursos.", recipients: [{ personId: "p6", status: "failed" }], status: "failed", createdAt: "2026-09-10", sentAt: null },
    ],
    events: [
      { id: "e1", title: "Reunião de acompanhamento — terça", date: "2026-09-15", time: "18:30", kind: "reuniao-terca", syncStatus: "local", sourceItemId: null },
      { id: "e2", title: "Reunião principal — quarta", date: "2026-09-16", time: "18:30", kind: "reuniao-quarta", syncStatus: "synced", sourceItemId: null },
      { id: "e3", title: "Prazo: Quadro Kanban com limites de WIP", date: "2026-09-18", time: "23:59", kind: "prazo", syncStatus: "local", sourceItemId: "i4" },
      { id: "e4", title: "Prazo: Material de nivelamento IEEE", date: "2026-09-19", time: "23:59", kind: "prazo", syncStatus: "local", sourceItemId: "i9" },
      { id: "e5", title: "Início da Sprint 3", date: "2026-09-29", time: "18:30", kind: "evento", syncStatus: "pending", sourceItemId: null },
    ],
    telegramMessages: [
      { id: "t1", chatName: "PETBSI notificações", kind: "DEADLINE_REMINDER", body: "A tarefa Quadro Kanban com limites de WIP falta 5 dias para o prazo final.", status: "sent", createdAt: "2026-09-13T08:00:00Z" },
      { id: "t2", chatName: "PETBSI notificações", kind: "EVENT", body: "Item 'Product Backlog ordenável' movido para Em andamento.", status: "sent", createdAt: "2026-09-11T19:05:00Z" },
    ],
    rotationConfig: {
      intervalDays: 7,
      startDayOfWeek: 2, // Tuesday
      startDate: "2026-09-08", // a Tuesday
      activeScrumMasterId: null,
      activeProductOwnerId: null,
    },
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return createSeedState();
  try {
    const raw = window.localStorage.getItem("petbsi-app-state");
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !Array.isArray(parsed.backlogItems)) return createSeedState();

    // Migrations
    if (!parsed.rotationConfig) {
      parsed.rotationConfig = {
        intervalDays: 7,
        startDayOfWeek: 2,
        startDate: "2026-09-08",
        activeScrumMasterId: null,
        activeProductOwnerId: null,
      };
    }

    if (parsed.memberships) {
      parsed.memberships = parsed.memberships.map((m: any) => ({
        ...m,
        primaryFrontId: m.primaryFrontId !== undefined ? m.primaryFrontId : (m.frontId ?? null),
        frontPermissions: m.frontPermissions || [],
      }));
    }

    return parsed;
  } catch {
    return createSeedState();
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("petbsi-app-state", JSON.stringify(state));
  } catch {
    // armazenamento indisponível: mantém estado em memória
  }
}

// Formata data no padrão dd/mm/aaaa
export function formatDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-").map((n) => Number(n));
  if (!y || !m || !d) return isoDate;
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export function daysUntil(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map((n) => Number(n));
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function deadlineLabel(isoDate: string | null): string {
  if (!isoDate) return "Sem prazo";
  const days = daysUntil(isoDate);
  if (days < 0) return `Atrasado há ${Math.abs(days)} dia(s)`;
  if (days === 0) return "Prazo vence hoje";
  if (days === 1) return "Prazo amanhã";
  return `Faltam ${days} dias`;
}

export function deadlineTone(isoDate: string | null): "ok" | "warn" | "danger" | "none" {
  if (!isoDate) return "none";
  const days = daysUntil(isoDate);
  if (days < 2) return "danger";
  if (days <= 5) return "warn";
  return "ok";
}