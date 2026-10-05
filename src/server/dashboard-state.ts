import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { backlogItems, blockers, calendarEvents, deliveries, deliveryItems, fronts, itemAssignees, projectMemberships, sprints, stateChanges, users, workflowColumns, projects } from "@/db/schema";
import { ProjectMembership } from "@/domain/project/project-membership";
import { PROJECT_ID, type getCurrentMember } from "./authorization/membership";
import type { AppState, BacklogItemType, BacklogPriority, ProjectRole, SprintStatus, WorkItemStatus } from "@/lib/types";

type Member = NonNullable<Awaited<ReturnType<typeof getCurrentMember>>>;
const statuses = new Set(["backlog", "todo", "in_progress", "blocked", "review", "done"]);
const roles = new Set(["MEMBER", "SCRUM_MASTER", "SCRUM_MASTER_ASSISTANT", "COORDINATOR", "PRODUCT_OWNER"]);

export async function getDashboardState(member: Member): Promise<AppState> {
  const db = getDb();
  const [projectRows, frontRows, memberRows, sprintRows, columnRows, itemRows, eventRows, deliveryRows] = await Promise.all([
    db.select().from(projects),
    db.select().from(fronts),
    db.select({ person: users, membership: projectMemberships }).from(projectMemberships)
      .innerJoin(users, eq(projectMemberships.userId, users.id))
      .where(eq(users.enabled, true)),
    db.select().from(sprints),
    db.select().from(workflowColumns).orderBy(workflowColumns.orderIndex),
    db.select().from(backlogItems).orderBy(backlogItems.orderIndex),
    db.select().from(calendarEvents),
    db.select().from(deliveries),
  ]);
  const permission = new ProjectMembership({ id: member.membershipId, personId: member.id,
    primaryFrontId: member.primaryFrontId, role: member.role, frontPermissions: member.frontPermissions });
  const isAdmin = member.systemRole === "ADMIN";
  const visibleFronts = frontRows.filter((front) => isAdmin || permission.canViewFront(front.id));
  const visibleIds = new Set(visibleFronts.map((front) => front.id));
  const visibleItems = itemRows.filter((item) => visibleIds.has(item.frontId));
  const itemIds = visibleItems.map((item) => item.id);
  const visibleDeliveries = deliveryRows.filter((row) => visibleIds.has(row.frontId));
  const links = visibleDeliveries.length ? await db.select().from(deliveryItems)
    .where(inArray(deliveryItems.deliveryId, visibleDeliveries.map((row) => row.id))) : [];
  const [assigneeRows, blockerRows, changeRows] = itemIds.length ? await Promise.all([
    db.select().from(itemAssignees).where(inArray(itemAssignees.itemId, itemIds)),
    db.select().from(blockers).where(inArray(blockers.itemId, itemIds)),
    db.select().from(stateChanges).where(inArray(stateChanges.itemId, itemIds)),
  ]) : [[], [], []];

  return {
    currentUserId: member.id,
    activeProjectId: null,
    projects: projectRows.map(({ id, name, description }) => ({ id, name, description })),
    people: memberRows.map(({ person }) => ({ id: person.id, name: person.name ?? "Participante", email: person.email ?? "",
      initials: (person.name ?? "P").split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase(),
      tags: person.tags as string[], systemRole: person.systemRole }))
      .concat(member.id === "preview-user-id" ? [{ id: "preview-user-id", name: "Admin Preview", email: "preview@petbsi.com", initials: "AP", tags: [], systemRole: "ADMIN" }] : []),
    pairs: [],
    fronts: visibleFronts.map(({ id, projectId, name, description, color }) => ({ id, projectId, name, description, color })),
    memberships: memberRows.map(({ membership }) => ({ id: membership.id, personId: membership.userId,
      primaryFrontId: membership.primaryFrontId && visibleIds.has(membership.primaryFrontId) ? membership.primaryFrontId : null,
      role: roles.has(membership.role) ? membership.role as ProjectRole : "MEMBER",
      frontPermissions: membership.userId === member.id || permission.isTechAdmin() ? membership.frontPermissions : [],
    })).concat(member.id === "preview-user-id" ? [{ id: "preview-membership", personId: "preview-user-id", primaryFrontId: member.primaryFrontId, role: "SCRUM_MASTER", frontPermissions: member.frontPermissions }] : []),
    backlogItems: visibleItems.filter((item) => statuses.has(item.status)).map((item) => ({
      id: item.id, title: item.title, description: item.description, frontId: item.frontId,
      priority: item.priority as BacklogPriority, status: item.status as WorkItemStatus,
      type: (item.type ?? "documento") as BacklogItemType, value: (item.value ?? "M") as "PQ" | "M" | "S",
      sprintId: item.sprintId, parentId: item.parentId, assigneeIds: assigneeRows.filter((a) => a.itemId === item.id).map((a) => a.userId),
      deadline: item.deadline?.toISOString().slice(0, 10) ?? null, createdAt: item.createdAt.toISOString().slice(0, 10),
    })),
    sprints: sprintRows.map((sprint) => ({ id: sprint.id, projectId: sprint.projectId, name: sprint.name, goal: sprint.goal,
      status: sprint.status as SprintStatus, startDate: sprint.startDate.toISOString().slice(0, 10),
      endDate: sprint.endDate.toISOString().slice(0, 10), itemIds: visibleItems.filter((item) => item.sprintId === sprint.id).map((item) => item.id) })),
    columns: columnRows.filter((column) => statuses.has(column.status)).map((column) => ({
      id: column.id, status: column.status as WorkItemStatus, name: column.name, wipLimit: column.wipLimit,
    })),
    blockers: blockerRows.map((blocker) => ({ id: blocker.id, itemId: blocker.itemId, description: blocker.description,
      openedAt: blocker.openedAt.slice(0, 10), openedBy: blocker.openedBy,
      resolvedAt: blocker.resolvedAt?.slice(0, 10) ?? null, resolvedBy: blocker.resolvedBy })),
    stateChanges: changeRows.map((change) => ({ id: change.id, itemId: change.itemId,
      fromStatus: change.fromStatus as WorkItemStatus, toStatus: change.toStatus as WorkItemStatus,
      changedAt: change.changedAt.toISOString().slice(0, 10), changedBy: change.changedBy })),
    deliveries: visibleDeliveries.map((delivery) => ({ id: delivery.id, title: delivery.title,
      description: delivery.description, frontId: delivery.frontId,
      status: delivery.status as "planejada" | "em_andamento" | "entregue", completedOn: delivery.completedOn,
      sprintName: sprintRows.find((sprint) => sprint.id === delivery.sprintId)?.name ?? "—",
      itemIds: links.filter((link) => link.deliveryId === delivery.id && itemIds.includes(link.itemId)).map((link) => link.itemId),
    })), attachments: [], notifications: [],
    events: eventRows.filter((event) => !event.sourceItemId || itemIds.includes(event.sourceItemId)).map((event) => ({
      id: event.id, title: event.title, date: event.date, time: event.time,
      kind: event.kind as "reuniao-terca" | "reuniao-quarta" | "prazo" | "evento",
      syncStatus: "local" as const, sourceItemId: event.sourceItemId,
    })), telegramMessages: [],
    rotationConfig: { intervalDays: 7, startDayOfWeek: 2, startDate: "", activeScrumMasterId: null, activeProductOwnerId: null },
  };
}
