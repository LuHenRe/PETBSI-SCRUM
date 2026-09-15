export type ProjectRole =
  | "MEMBER"
  | "SCRUM_MASTER"
  | "SCRUM_MASTER_ASSISTANT"
  | "COORDINATOR"
  | "PRODUCT_OWNER";

export type WorkItemStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "blocked"
  | "review"
  | "done";

export type BacklogItemType =
  | "documento"
  | "codigo"
  | "pesquisa"
  | "material"
  | "infra"
  | "gestao";

export type BacklogPriority = "alta" | "media" | "baixa";

export type SprintStatus = "planned" | "active" | "closed";

export type DeliveryStatus = "planejada" | "em_andamento" | "entregue";

export type UploadStatus = "pending" | "synced" | "failed";

export type NotificationStatus = "draft" | "sent" | "failed" | "cancelled";

export type EventKind = "reuniao-terca" | "reuniao-quarta" | "prazo" | "evento";

export type TelegramMessageKind = "EVENT" | "DEADLINE_REMINDER";

export interface Person {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export interface Pair {
  id: string;
  name: string;
  personIds: string[];
}

export interface Front {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface ProjectMembership {
  id: string;
  personId: string;
  frontId: string;
  role: ProjectRole;
  canEdit: boolean;
}

export interface BacklogItem {
  id: string;
  title: string;
  type: BacklogItemType;
  description: string;
  frontId: string;
  status: WorkItemStatus;
  priority: BacklogPriority;
  value: "PQ" | "M" | "S"; // produto do projeto acadêmico, melhoraria ou supérfluo
  sprintId: string | null;
  assigneeIds: string[];
  deadline: string | null; // ISO date
  createdAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  itemIds: string[];
}

export interface WorkflowColumn {
  id: string;
  status: WorkItemStatus;
  name: string;
  wipLimit: number | null;
}

export interface Blocker {
  id: string;
  itemId: string;
  description: string;
  openedAt: string;
  openedBy: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface WorkItemStateChange {
  id: string;
  itemId: string;
  fromStatus: WorkItemStatus | null;
  toStatus: WorkItemStatus;
  changedAt: string;
  changedBy: string;
}

export interface Delivery {
  id: string;
  title: string;
  description: string;
  frontId: string;
  status: DeliveryStatus;
  completedOn: string | null;
  sprintName: string;
  itemIds: string[];
}

export interface Attachment {
  id: string;
  name: string;
  kind: "item" | "entrega";
  refId: string;
  url: string;
  status: UploadStatus;
  uploadedBy: string;
  uploadedAt: string;
}

export interface NotificationRecipient {
  personId: string;
  status: "pending" | "sent" | "failed";
}

export interface Notification {
  id: string;
  subject: string;
  body: string;
  recipients: NotificationRecipient[];
  status: NotificationStatus;
  createdAt: string;
  sentAt: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  kind: EventKind;
  syncStatus: "local" | "synced" | "pending";
  sourceItemId: string | null;
}

export interface TelegramMessage {
  id: string;
  chatName: string;
  kind: TelegramMessageKind;
  body: string;
  status: "pending" | "sent" | "failed";
  createdAt: string;
}

export interface AppState {
  currentUserId: string | null;
  people: Person[];
  pairs: Pair[];
  fronts: Front[];
  memberships: ProjectMembership[];
  backlogItems: BacklogItem[];
  sprints: Sprint[];
  columns: WorkflowColumn[];
  blockers: Blocker[];
  stateChanges: WorkItemStateChange[];
  deliveries: Delivery[];
  attachments: Attachment[];
  notifications: Notification[];
  events: CalendarEvent[];
  telegramMessages: TelegramMessage[];
}