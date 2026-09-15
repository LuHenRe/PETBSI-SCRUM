/**
 * api-client — fronteira fina entre app/components/hooks e os casos de uso.
 * Páginas e componentes SÓ chamam este módulo. Regras de WIP, transição e
 * permissão vivem no domínio (via DomainError); a apresentação vive no
 * PresentationStore (adapters/memory). Infra real segue adiada (READMEs).
 */
import { MemoryBacklogRepository } from "@/adapters/memory/memory-backlog-repository";
import { MemorySprintRepository } from "@/adapters/memory/memory-sprint-repository";
import { MemoryMembershipRepository } from "@/adapters/memory/memory-membership-repository";
import { MemoryAudit } from "@/adapters/memory/memory-audit";
import { PresentationStore } from "@/adapters/memory/presentation-store";
import type { AppState, BacklogItem as LegacyBacklogItem, BacklogItemType, Blocker as LegacyBlocker, Front, Person, ProjectMembership as LegacyMembership, Sprint as LegacySprint, WorkflowColumn as LegacyColumn } from "@/lib/types";
import { moveBacklogItem } from "@/application/workflow/move-backlog-item";
import { createBacklogItem, saveBacklogItem } from "@/application/backlog/manage-backlog-item";
import { openBlockerForItem, resolveBlockerForItem } from "@/application/workflow/manage-blocker";
import { getProjectOverview, type ProjectOverview } from "@/application/overview/get-project-overview";
import { setFrontPermission } from "@/application/backlog/manage-front-permissions";
import { DomainError } from "@/domain/shared/domain-error";
import type { WorkItemStatus } from "@/domain/shared/work-item-status";
import type { BacklogPriority } from "@/domain/shared/backlog-priority";
import type { BacklogItem as DomainBacklogItem } from "@/domain/backlog/backlog-item";
import type { ProjectMembership } from "@/domain/project/project-membership";
import type { Blocker } from "@/domain/blocker/blocker";
import { defaultClock, defaultIdGenerator, type AuditEvent, type AuditPort, type BacklogRepository, type Clock, type IdGenerator, type MembershipRepository, type SprintRepository } from "@/application/ports/repositories";

export const PROJECT_ID = "petbsi";
export interface ApiDeps { backlog: BacklogRepository; sprints: SprintRepository; memberships: MembershipRepository; audit: AuditPort; }
export interface CreateItemDraft { title: string; description?: string; frontId: string; priority: BacklogPriority; deadline?: string | null; type?: BacklogItemType; value?: LegacyBacklogItem["value"]; sprintId?: string | null; assigneeIds?: string[]; }
export interface SaveItemDraft extends CreateItemDraft {}

async function resolveMembershipForFront(frontId: string, actorId: string, deps: ApiDeps): Promise<ProjectMembership> {
  if (!actorId || !actorId.trim()) throw new DomainError("Usuário não autenticado");
  const all = await deps.memberships.listAll();
  const mine = all.filter((m) => m.personId === actorId);
  if (mine.length === 0) throw new DomainError("Vínculo do usuário não encontrado");
  const direct = mine.find((m) => m.frontId === frontId);
  if (direct) return direct;
  const sm = mine.find((m) => m.isTechAdmin());
  if (sm) return sm;
  const coord = mine.find((m) => m.isCoordinator());
  if (coord) return coord;
  throw new DomainError(`Sem permissão para atuar na frente ${frontId}`);
}
async function resolveAnyMembership(actorId: string, deps: ApiDeps): Promise<ProjectMembership> {
  if (!actorId || !actorId.trim()) throw new DomainError("Usuário não autenticado");
  const all = await deps.memberships.listAll();
  const mine = all.filter((m) => m.personId === actorId);
  if (mine.length === 0) throw new DomainError("Vínculo do usuário não encontrado");
  return mine.find((m) => m.isTechAdmin()) ?? mine.find((m) => m.isCoordinator()) ?? mine[0];
}

export interface ApiClient {
  getDeps(): ApiDeps; getCurrentUserId(): string | null; setCurrentUserId(id: string | null): void;
  subscribe(listener: () => void): () => void; getVersion(): number; reset(): void;
  moveItem(itemId: string, toStatus: WorkItemStatus, opts?: { reason?: string | null; now?: Clock; actorId?: string }): Promise<DomainBacklogItem>;
  createItem(draft: CreateItemDraft, opts?: { uid?: IdGenerator; now?: Clock; actorId?: string }): Promise<DomainBacklogItem>;
  saveItem(itemId: string, draft: SaveItemDraft, opts?: { now?: Clock; actorId?: string }): Promise<DomainBacklogItem>;
  openBlocker(itemId: string, description: string, opts?: { uid?: IdGenerator; now?: Clock; actorId?: string }): Promise<Blocker>;
  resolveBlocker(itemId: string, blockerId: string, opts?: { now?: Clock; actorId?: string }): Promise<Blocker>;
  getOverview(filters?: { allowedFrontIds?: readonly string[] }, opts?: { actorId?: string }): Promise<ProjectOverview>;
  getAllowedFrontIds(opts?: { actorId?: string }): Promise<string[]>;
  setCanEdit(membershipId: string, canEdit: boolean, opts?: { now?: Clock; actorId?: string }): Promise<ProjectMembership>;
  listAudit(itemId?: string): Promise<AuditEvent[]>;
  listPresentationItems(): LegacyBacklogItem[]; listPresentationBlockers(): LegacyBlocker[];
  listFronts(): Front[]; listPeople(): Person[]; listColumns(): LegacyColumn[];
  listSprints(): LegacySprint[]; listMembershipsLegacy(): LegacyMembership[];
  getStatics(): AppState; reorderItem(id: string, direction: -1 | 1): void;
  listOpenBlockersForItem(itemId: string): Promise<LegacyBlocker[]>;
}

function seedDeps(): ApiDeps {
  const deps: ApiDeps = { backlog: new MemoryBacklogRepository(), sprints: new MemorySprintRepository(), memberships: new MemoryMembershipRepository(), audit: new MemoryAudit() };
  void (deps.backlog as MemoryBacklogRepository).seedFromSeed();
  void (deps.sprints as MemorySprintRepository).seedFromSeed();
  void (deps.memberships as MemoryMembershipRepository).seedFromSeed();
  return deps;
}

export function createApiClient(): ApiClient {
  let deps = seedDeps();
  const store = new PresentationStore();
  let currentUserId: string | null = null;
  let version = 0;
  const listeners = new Set<() => void>();
  function notify(): void { version += 1; listeners.forEach((l) => l()); }
  return {
    getDeps(): ApiDeps { return deps; },
    getCurrentUserId(): string | null { return currentUserId; },
    setCurrentUserId(id: string | null): void { currentUserId = id; notify(); },
    subscribe(listener: () => void): () => void { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getVersion(): number { return version; },
    reset(): void { deps = seedDeps(); store.reset(); currentUserId = null; notify(); },
    async moveItem(itemId, toStatus, opts) {
      const actorId = opts?.actorId ?? currentUserId ?? "";
      const item = await deps.backlog.load(itemId);
      if (!item) throw new DomainError(`Item ${itemId} não encontrado`);
      const membership = await resolveMembershipForFront(item.frontId, actorId, deps);
      const all = await deps.backlog.listByProject(PROJECT_ID);
      const countInTarget = all.filter((i) => i.status === toStatus).length;
      const at = (opts?.now ?? defaultClock())();
      const result = await moveBacklogItem({ itemId, column: store.columnFor(toStatus), countInTarget, actorId, membership, reason: opts?.reason ?? null, at }, { backlog: deps.backlog, audit: deps.audit, now: () => at });
      store.syncStatus(itemId, toStatus as LegacyBacklogItem["status"]);
      notify();
      return result;
    },
    async createItem(draft, opts) {
      const actorId = opts?.actorId ?? currentUserId ?? "";
      const membership = await resolveMembershipForFront(draft.frontId?.trim() ?? "", actorId, deps);
      const item = await createBacklogItem({ title: draft.title, description: draft.description ?? "", frontId: draft.frontId, priority: draft.priority, deadline: draft.deadline ?? null }, membership, { backlog: deps.backlog, audit: deps.audit, uid: opts?.uid ?? defaultIdGenerator(), now: opts?.now ?? defaultClock() });
      store.trackCreated(item, { type: draft.type, value: draft.value, sprintId: draft.sprintId, assigneeIds: draft.assigneeIds });
      notify();
      return item;
    },
    async saveItem(itemId, draft, opts) {
      const actorId = opts?.actorId ?? currentUserId ?? "";
      const existing = await deps.backlog.load(itemId);
      if (!existing) throw new DomainError(`Item ${itemId} não encontrado`);
      const membership = await resolveMembershipForFront(draft.frontId?.trim() || existing.frontId, actorId, deps);
      const at = (opts?.now ?? defaultClock())();
      // Validação e histórico via domínio: updateFields registra "edited" sem mudar o status.
      existing.updateFields({ title: draft.title, description: draft.description ?? "", frontId: draft.frontId, priority: draft.priority, deadline: draft.deadline ?? null }, { actorId, at });
      const saved = await saveBacklogItem(existing, membership, { backlog: deps.backlog, audit: deps.audit, now: () => at });
      store.syncItem(saved, { type: draft.type, value: draft.value, sprintId: draft.sprintId, assigneeIds: draft.assigneeIds });
      notify();
      return saved;
    },
    async openBlocker(itemId, description, opts) {
      const actorId = opts?.actorId ?? currentUserId ?? "";
      const item = await deps.backlog.load(itemId);
      if (!item) throw new DomainError(`Item ${itemId} não encontrado`);
      const blocker = await openBlockerForItem(itemId, description, await resolveMembershipForFront(item.frontId, actorId, deps), { backlog: deps.backlog, audit: deps.audit, uid: opts?.uid ?? defaultIdGenerator(), now: opts?.now ?? defaultClock() });
      store.refreshBlockers(await deps.backlog.listByProject(PROJECT_ID));
      notify();
      return blocker;
    },
    async resolveBlocker(itemId, blockerId, opts) {
      const actorId = opts?.actorId ?? currentUserId ?? "";
      const item = await deps.backlog.load(itemId);
      if (!item) throw new DomainError(`Item ${itemId} não encontrado`);
      const blocker = await resolveBlockerForItem(itemId, blockerId, await resolveMembershipForFront(item.frontId, actorId, deps), { backlog: deps.backlog, audit: deps.audit, now: opts?.now ?? defaultClock() });
      store.refreshBlockers(await deps.backlog.listByProject(PROJECT_ID));
      notify();
      return blocker;
    },
    async getOverview(filters, opts) {
      const actorId = opts?.actorId ?? currentUserId ?? "";
      const allowed = filters?.allowedFrontIds ?? (await this.getAllowedFrontIds({ actorId }));
      return getProjectOverview(PROJECT_ID, { allowedFrontIds: allowed }, { backlog: deps.backlog, sprints: deps.sprints });
    },
    async getAllowedFrontIds(opts) {
      const actorId = opts?.actorId ?? currentUserId ?? "";
      if (!actorId) return [];
      const mine = (await deps.memberships.listAll()).filter((m) => m.personId === actorId);
      if (mine.length === 0) return [];
      if (mine.some((m) => m.isTechAdmin() || m.isCoordinator())) return store.listFronts().map((f) => f.id);
      return [...new Set(mine.map((m) => m.frontId))];
    },
    async setCanEdit(membershipId, canEdit, opts) {
      const updated = await setFrontPermission(membershipId, canEdit, await resolveAnyMembership(opts?.actorId ?? currentUserId ?? "", deps), { memberships: deps.memberships, audit: deps.audit, now: opts?.now ?? defaultClock() });
      notify();
      return updated;
    },
    async listAudit(itemId): Promise<AuditEvent[]> { return deps.audit.list(itemId); },
    listPresentationItems(): LegacyBacklogItem[] { return store.listItems(); },
    listPresentationBlockers(): LegacyBlocker[] { return store.listBlockers(); },
    listFronts(): Front[] { return store.listFronts(); },
    listPeople(): Person[] { return store.listPeople(); },
    listColumns(): LegacyColumn[] { return store.listColumns(); },
    listSprints(): LegacySprint[] { return store.listSprints(); },
    listMembershipsLegacy(): LegacyMembership[] { return store.listMembershipsLegacy(); },
    getStatics(): AppState { return store.getStatics(); },
    reorderItem(id, direction): void { store.reorder(id, direction); notify(); },
    async listOpenBlockersForItem(itemId): Promise<LegacyBlocker[]> {
      const item = await deps.backlog.load(itemId);
      if (!item) return [];
      return item.getBlockers().filter((b) => b.isOpen()).map((b) => ({ id: b.id, itemId, description: b.description, openedAt: (b.openedAt ?? "").slice(0, 10), openedBy: b.reportedBy, resolvedAt: null, resolvedBy: null }));
    },
  };
}

// ─── Singleton para a UI (demo) ───
let singleton: ApiClient | null = null;
export function getApiClient(): ApiClient { if (!singleton) singleton = createApiClient(); return singleton; }
/** Singleton de deps exigido pela ETAPA 3.1. */
export function getDeps(): ApiDeps { return getApiClient().getDeps(); }
export function getCurrentUserId(): string | null { return getApiClient().getCurrentUserId(); }
export function setCurrentUserId(id: string | null): void { getApiClient().setCurrentUserId(id); }
/** Fachada do singleton para páginas/hooks (estilo apiClient.moveItem). */
export const apiClient: ApiClient = new Proxy({} as ApiClient, {
  get(_t, prop: string | symbol) {
    const client = getApiClient();
    const key = prop as string as keyof ApiClient;
    const value = client[key];
    if (typeof value === "function") return (value as (...args: never[]) => unknown).bind(client);
    return value;
  },
});
export function moveItem(...a: Parameters<ApiClient["moveItem"]>): ReturnType<ApiClient["moveItem"]> { return getApiClient().moveItem(...a); }
export function createItem(...a: Parameters<ApiClient["createItem"]>): ReturnType<ApiClient["createItem"]> { return getApiClient().createItem(...a); }
export function saveItem(...a: Parameters<ApiClient["saveItem"]>): ReturnType<ApiClient["saveItem"]> { return getApiClient().saveItem(...a); }
export function getOverview(...a: Parameters<ApiClient["getOverview"]>): ReturnType<ApiClient["getOverview"]> { return getApiClient().getOverview(...a); }
export function setCanEdit(...a: Parameters<ApiClient["setCanEdit"]>): ReturnType<ApiClient["setCanEdit"]> { return getApiClient().setCanEdit(...a); }
