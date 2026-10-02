import { useSyncExternalStore } from "react";
import type {
  AppState,
  BacklogItem,
  BacklogItemType,
  BacklogPriority,
  CalendarEvent,
  EventKind,
  WorkItemStatus,
} from "./types";

const emptyState: AppState = {
  currentUserId: null, people: [], pairs: [], fronts: [], memberships: [], backlogItems: [],
  sprints: [], columns: [], blockers: [], stateChanges: [], deliveries: [], attachments: [],
  notifications: [], events: [], telegramMessages: [],
  rotationConfig: { intervalDays: 7, startDayOfWeek: 2, startDate: "", activeScrumMasterId: null, activeProductOwnerId: null },
};
let state: AppState = emptyState;
const listeners = new Set<() => void>();

function set(newState: AppState) {
  state = newState;
  listeners.forEach((listener) => listener());
}

export async function dispatch(payload: Record<string, unknown>): Promise<void> {
  try {
    const response = await fetch("/api/commands", {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const result = await response.json() as { error?: string };
      throw new Error(result.error ?? "Operação não concluída");
    }
    const snapshot = await fetch("/api/state", { credentials: "same-origin", cache: "no-store" });
    if (!snapshot.ok) throw new Error("Não foi possível atualizar os dados");
    set(await snapshot.json() as AppState);
  } catch (error) {
    window.alert(error instanceof Error ? error.message : "Operação não concluída");
  }
}

// Aliasing for internal usage
const command = dispatch;

function unavailable(): void {
  window.alert("Esta funcionalidade ainda não está disponível com integração real.");
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state, () => emptyState);
}

export function getState(): AppState {
  return state;
}

export function setServerState(snapshot: AppState) {
  set(snapshot);
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function personById(state: AppState, id: string | null) {
  return state.people.find((p) => p.id === id) ?? null;
}

export function frontById(state: AppState, id: string | null) {
  return state.fronts.find((f) => f.id === id) ?? null;
}

export function sprintById(state: AppState, id: string | null) {
  return state.sprints.find((s) => s.id === id) ?? null;
}

export function itemById(state: AppState, id: string) {
  return state.backlogItems.find((i) => i.id === id) ?? null;
}

// ─── Sessão ────────────────────────────────────────────────────────────────

export function login(personId: string) {
  // Identity comes from the authenticated server session, never from a browser choice.
  void personId;
  unavailable();
}

export function logout() {
  unavailable();
}

// ─── Product Backlog ───────────────────────────────────────────────────────

export function createBacklogItem(draft: {
  title: string;
  type: BacklogItemType;
  description: string;
  frontId: string;
  priority: BacklogPriority;
  value: BacklogItem["value"];
  sprintId: string | null;
  parentId: string | null;
  assigneeIds: string[];
  deadline: string | null;
}) {
  void command({ action: "createItem", draft });
}

export function updateBacklogItem(id: string, patch: Partial<BacklogItem>) {
  const previous = itemById(state, id);
  if (!previous) return unavailable();
  void command({ action: "updateItem", itemId: id, draft: { ...previous, ...patch } });
}

export function reorderBacklogItem(id: string, direction: -1 | 1) {
  void command({ action: "reorderItem", itemId: id, direction });
}

export function moveBacklogItem(id: string, toStatus: WorkItemStatus, changedBy: string) {
  void changedBy;
  void command({ action: "moveItem", itemId: id, toStatus });
}

// ─── Bloqueios ─────────────────────────────────────────────────────────────

export function openBlocker(itemId: string, description: string, openedBy: string) {
  void openedBy;
  void command({ action: "openBlocker", itemId, description });
}

export function resolveBlocker(blockerId: string, resolvedBy: string) {
  const blocker = state.blockers.find((b) => b.id === blockerId);
  if (!blocker) return;
  void resolvedBy;
  void command({ action: "resolveBlocker", itemId: blocker.itemId, blockerId });
}

// ─── Agenda ────────────────────────────────────────────────────────────────

export function createEvent(draft: {
  title: string;
  date: string;
  time: string;
  kind: EventKind;
  sourceItemId: string | null;
}) {
  void command({ action: "createEvent", ...draft });
}

export function setSyncStatus(eventId: string, syncStatus: CalendarEvent["syncStatus"]) {
  void eventId; void syncStatus;
  unavailable();
}

// ─── Sprint ─────────────────────────────────────────────────────────────────

export function updateSprintGoal(sprintId: string, goal: string) {
  void command({ action: "updateSprintGoal", sprintId, goal });
}

export function createSprint(draft: { name: string; goal: string; startDate: string; endDate: string }) {
  void command({ action: "createSprint", ...draft });
}

export function createDelivery(draft: { title: string; description: string; frontId: string; sprintId: string | null; itemIds: string[] }) {
  void command({ action: "createDelivery", ...draft });
}

export function setDeliveryStatus(deliveryId: string, status: "planejada" | "em_andamento" | "entregue") {
  void command({ action: "setDeliveryStatus", deliveryId, status });
}

export function startSprint(sprintId: string) {
  void command({ action: "startSprint", sprintId });
}

export function closeSprint(sprintId: string) {
  void command({ action: "closeSprint", sprintId });
}

// ─── Configurações ──────────────────────────────────────────────────────────

export function setColumnWip(columnId: string, wipLimit: number | null) {
  void command({ action: "setColumnWip", columnId, wipLimit });
}

export function setFrontPermission(personId: string, frontId: string, canView: boolean, canEdit: boolean) {
  const membership = state.memberships.find((m) => m.personId === personId);
  if (!membership) return unavailable();
  void command({ action: "setFrontPermission", membershipId: membership.id, frontId, canView, canEdit });
}

export function changePersonRole(personId: string, newRole: AppState["memberships"][0]["role"]) {
  void personId; void newRole;
  unavailable();
}

export function removePerson(personId: string) {
  void personId;
  unavailable();
}

export function updateRotationConfig(patch: Partial<AppState["rotationConfig"]>) {
  void patch;
  unavailable();
}

// ─── Arquivos ──────────────────────────────────────────────────────────────

export async function uploadAttachment(draft: {
  name: string;
  kind: "item" | "entrega";
  refId: string;
  uploadedBy: string;
}) {
  void draft;
  unavailable();
}

// ─── Notificações ──────────────────────────────────────────────────────────

export async function sendNotification(draft: {
  subject: string;
  body: string;
  recipientIds: string[];
}) {
  void draft;
  unavailable();
}

// ─── Telegram (simulação por frontend) ─────────────────────────────────────

export function sendTelegram(kind: "EVENT" | "DEADLINE_REMINDER", body: string) {
  void kind; void body;
  unavailable();
}
