import { useSyncExternalStore } from "react";
import {
  createSeedState,
  loadState,
  saveState,
} from "./seed";
import type {
  AppState,
  BacklogItem,
  BacklogItemType,
  BacklogPriority,
  CalendarEvent,
  EventKind,
  WorkItemStatus,
} from "./types";

let state: AppState = createSeedState();
const listeners = new Set<() => void>();

function set(newState: AppState) {
  state = newState;
  saveState(state);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function getState(): AppState {
  return state;
}

export function hydrateStore() {
  const stored = loadState();
  set(stored);
}

export function resetStore() {
  set(createSeedState());
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
  set({ ...state, currentUserId: personId });
}

export function logout() {
  set({ ...state, currentUserId: null });
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
  assigneeIds: string[];
  deadline: string | null;
}) {
  const item: BacklogItem = {
    id: uid("i"),
    status: "backlog",
    createdAt: new Date().toISOString().slice(0, 10),
    ...draft,
  };
  set({ ...state, backlogItems: [item, ...state.backlogItems] });
}

export function updateBacklogItem(id: string, patch: Partial<BacklogItem>) {
  set({
    ...state,
    backlogItems: state.backlogItems.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    ),
  });
}

export function reorderBacklogItem(id: string, direction: -1 | 1) {
  const index = state.backlogItems.findIndex((i) => i.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= state.backlogItems.length) return;
  const items = [...state.backlogItems];
  const [item] = items.splice(index, 1);
  items.splice(target, 0, item);
  set({ ...state, backlogItems: items });
}

export function moveBacklogItem(id: string, toStatus: WorkItemStatus, changedBy: string) {
  const item = state.backlogItems.find((i) => i.id === id);
  if (!item || item.status === toStatus) return;
  set({
    ...state,
    backlogItems: state.backlogItems.map((i) =>
      i.id === id ? { ...i, status: toStatus } : i
    ),
    stateChanges: [
      {
        id: uid("h"),
        itemId: id,
        fromStatus: item.status,
        toStatus,
        changedAt: new Date().toISOString().slice(0, 10),
        changedBy,
      },
      ...state.stateChanges,
    ],
  });
}

// ─── Bloqueios ─────────────────────────────────────────────────────────────

export function openBlocker(itemId: string, description: string, openedBy: string) {
  const blocker = {
    id: uid("b"),
    itemId,
    description,
    openedAt: new Date().toISOString().slice(0, 10),
    openedBy,
    resolvedAt: null as string | null,
    resolvedBy: null as string | null,
  };
  set({
    ...state,
    blockers: [...state.blockers, blocker],
    backlogItems: state.backlogItems.map((i) =>
      i.id === itemId && i.status !== "blocked"
        ? { ...i, status: "blocked" as WorkItemStatus }
        : i
    ),
  });
}

export function resolveBlocker(blockerId: string, resolvedBy: string) {
  const blocker = state.blockers.find((b) => b.id === blockerId);
  if (!blocker) return;
  set({
    ...state,
    blockers: state.blockers.map((b) =>
      b.id === blockerId
        ? { ...b, resolvedAt: new Date().toISOString().slice(0, 10), resolvedBy }
        : b
    ),
  });
}

// ─── Agenda ────────────────────────────────────────────────────────────────

export function createEvent(draft: {
  title: string;
  date: string;
  time: string;
  kind: EventKind;
  sourceItemId: string | null;
}) {
  const event: CalendarEvent = {
    id: uid("e"),
    syncStatus: "local",
    ...draft,
  };
  set({ ...state, events: [...state.events, event] });
}

export function setSyncStatus(eventId: string, syncStatus: CalendarEvent["syncStatus"]) {
  set({
    ...state,
    events: state.events.map((e) =>
      e.id === eventId ? { ...e, syncStatus } : e
    ),
  });
}

// ─── Sprint ─────────────────────────────────────────────────────────────────

export function updateSprintGoal(sprintId: string, goal: string) {
  set({
    ...state,
    sprints: state.sprints.map((s) =>
      s.id === sprintId ? { ...s, goal } : s
    ),
  });
}

export function closeSprint(sprintId: string) {
  set({
    ...state,
    sprints: state.sprints.map((s) =>
      s.id === sprintId ? { ...s, status: "closed" as const } : s
    ),
  });
}

// ─── Configurações ──────────────────────────────────────────────────────────

export function setColumnWip(columnId: string, wipLimit: number | null) {
  set({
    ...state,
    columns: state.columns.map((c) =>
      c.id === columnId ? { ...c, wipLimit } : c
    ),
  });
}

export function setMembershipEdit(membershipId: string, canEdit: boolean) {
  set({
    ...state,
    memberships: state.memberships.map((m) =>
      m.id === membershipId ? { ...m, canEdit } : m
    ),
  });
}

// ─── Arquivos ──────────────────────────────────────────────────────────────

export async function uploadAttachment(draft: {
  name: string;
  kind: "item" | "entrega";
  refId: string;
  uploadedBy: string;
}) {
  const attachment = {
    id: uid("a"),
    url: `https://drive.google.com/file/d/${uid("file")}`,
    status: "pending" as const,
    uploadedAt: new Date().toISOString().slice(0, 10),
    ...draft,
  };
  set({ ...state, attachments: [attachment, ...state.attachments] });
  await new Promise((resolve) => setTimeout(resolve, 900));
  set({
    ...state,
    attachments: state.attachments.map((a) =>
      a.id === attachment.id ? { ...a, status: "synced" as const } : a
    ),
  });
}

// ─── Notificações ──────────────────────────────────────────────────────────

export async function sendNotification(draft: {
  subject: string;
  body: string;
  recipientIds: string[];
}) {
  const notification = {
    id: uid("n"),
    status: "sent" as const,
    createdAt: new Date().toISOString().slice(0, 10),
    sentAt: new Date().toISOString(),
    subject: draft.subject,
    body: draft.body,
    recipients: draft.recipientIds.map((personId) => ({
      personId,
      status: "sent" as const,
    })),
  };
  set({ ...state, notifications: [notification, ...state.notifications] });
  await new Promise((resolve) => setTimeout(resolve, 700));
}

// ─── Telegram (simulação por frontend) ─────────────────────────────────────

export function sendTelegram(kind: "EVENT" | "DEADLINE_REMINDER", body: string) {
  set({
    ...state,
    telegramMessages: [
      {
        id: uid("t"),
        chatName: "PETBSI notificações",
        kind,
        body,
        status: "sent" as const,
        createdAt: new Date().toISOString(),
      },
      ...state.telegramMessages,
    ],
  });
}