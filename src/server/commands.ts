import "server-only";
import { randomUUID } from "node:crypto";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { auditEvents, backlogItems, calendarEvents, deliveries, deliveryItems, fronts, itemAssignees, projectMemberships, sprints, users, workflowColumns, projects } from "@/db/schema";
import { createBacklogItem, saveBacklogItem } from "@/application/backlog/manage-backlog-item";
import { moveBacklogItem } from "@/application/workflow/move-backlog-item";
import { openBlockerForItem, resolveBlockerForItem } from "@/application/workflow/manage-blocker";
import { ProjectMembership } from "@/domain/project/project-membership";
import { WorkflowColumn } from "@/domain/workflow/workflow-column";
import { WipLimit } from "@/domain/shared/wip-limit";
import { DomainError } from "@/domain/shared/domain-error";
import { postgresPorts } from "@/adapters/repositories/postgres-backlog";
import { PROJECT_ID, type getCurrentMember } from "./authorization/membership";

type Member = NonNullable<Awaited<ReturnType<typeof getCurrentMember>>>;
const id = z.string().min(1).max(100);
const status = z.enum(["backlog", "todo", "in_progress", "blocked", "review", "done", "cancelled"]);
const draft = z.object({
  title: z.string().trim().min(3).max(250), description: z.string().max(10000).default(""), frontId: id,
  priority: z.enum(["alta", "media", "baixa"]), deadline: z.iso.date().nullable().default(null),
  type: z.enum(["documento", "codigo", "pesquisa", "material", "infra", "gestao"]).default("documento"),
  value: z.enum(["PQ", "M", "S"]).default("M"), sprintId: id.nullable().default(null),
  parentId: id.nullable().default(null),
  assigneeIds: z.array(id).max(20).default([]),
});
export const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("createItem"), draft }),
  z.object({ action: z.literal("updateItem"), itemId: id, draft }),
  z.object({ action: z.literal("moveItem"), itemId: id, toStatus: status, reason: z.string().max(1000).nullable().optional() }),
  z.object({ action: z.literal("openBlocker"), itemId: id, description: z.string().trim().min(3).max(2000) }),
  z.object({ action: z.literal("resolveBlocker"), itemId: id, blockerId: id }),
  z.object({ action: z.literal("reorderItem"), itemId: id, direction: z.union([z.literal(-1), z.literal(1)]) }),
  z.object({ action: z.literal("updateSprintGoal"), sprintId: id, goal: z.string().trim().min(3).max(1000) }),
  z.object({ action: z.literal("createSprint"), name: z.string().trim().min(3).max(150),
    goal: z.string().trim().min(3).max(1000), startDate: z.iso.date(), endDate: z.iso.date() }),
  z.object({ action: z.literal("startSprint"), sprintId: id }),
  z.object({ action: z.literal("closeSprint"), sprintId: id }),
  z.object({ action: z.literal("setColumnWip"), columnId: id, wipLimit: z.number().int().min(1).max(999).nullable() }),
  z.object({ action: z.literal("setFrontPermission"), membershipId: id, frontId: id, canView: z.boolean(), canEdit: z.boolean() }),
  z.object({ action: z.literal("createEvent"), title: z.string().trim().min(3).max(200),
    date: z.iso.date(), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    kind: z.enum(["reuniao-terca", "reuniao-quarta", "prazo", "evento"]), sourceItemId: id.nullable() }),
  z.object({ action: z.literal("createDelivery"), title: z.string().trim().min(3).max(200),
    description: z.string().max(5000), frontId: id, sprintId: id.nullable(), itemIds: z.array(id).min(1).max(100) }),
  z.object({ action: z.literal("setDeliveryStatus"), deliveryId: id, status: z.enum(["planejada", "em_andamento", "entregue"]) }),
  z.object({ action: z.literal("createProject"), id: id, name: z.string().trim().min(3).max(150), description: z.string().max(2000).default("") }),
  z.object({ action: z.literal("createFront"), projectId: id, name: z.string().trim().min(3).max(150), description: z.string().max(2000).default(""), color: z.string().regex(/^#[0-9A-Fa-f]{6}$/) }),
  z.object({ action: z.literal("setPersonTags"), personId: id, tags: z.array(z.string().trim().min(2).max(30)).max(4) }),
  z.object({ action: z.literal("updatePersonalInfo"), personId: id, displayName: z.string().trim().max(100), phone: z.string().trim().max(30) }),
]);
export type Command = z.infer<typeof commandSchema>;

function ensure(condition: unknown, message = "Operação não autorizada"): asserts condition {
  if (!condition) throw new DomainError(message);
}

export async function executeCommand(member: Member, command: Command): Promise<void> {
  const db = getDb();
  const permission = new ProjectMembership({ id: member.membershipId, personId: member.id,
    primaryFrontId: member.primaryFrontId, role: member.role, frontPermissions: member.frontPermissions });
  await db.transaction(async (tx) => {
    const ports = postgresPorts(tx);
    const audit = async (action: string, aggregate: string) => {
      await tx.insert(auditEvents).values({ id: randomUUID(), actorId: member.id, action, aggregate, at: new Date().toISOString() });
    };
    const findItem = async (itemId: string) => {
      const item = await ports.backlog.load(itemId);
      ensure(item, "Item não encontrado");
      return item;
    };
    const ensureFront = async (frontId: string) => {
      const [front] = await tx.select({ id: fronts.id }).from(fronts)
        .where(and(eq(fronts.id, frontId), eq(fronts.projectId, PROJECT_ID))).limit(1);
      ensure(front, "Frente não encontrada");
    };
    const ensureAssignments = async (frontId: string, sprintId: string | null, assigneeIds: string[]) => {
      await ensureFront(frontId);
      if (sprintId) {
        const [sprint] = await tx.select({ status: sprints.status }).from(sprints)
          .where(and(eq(sprints.id, sprintId), eq(sprints.projectId, PROJECT_ID))).limit(1);
        ensure(sprint && sprint.status !== "closed", "Sprint indisponível");
      }
      const unique = [...new Set(assigneeIds)];
      if (unique.length) {
        const active = await tx.select({ id: users.id }).from(users)
          .innerJoin(projectMemberships, and(eq(projectMemberships.userId, users.id), eq(projectMemberships.projectId, PROJECT_ID)))
          .where(and(inArray(users.id, unique), eq(users.enabled, true)));
        ensure(active.length === unique.length, "Responsável não pertence ao projeto");
      }
      return unique;
    };
    switch (command.action) {
      case "createProject": {
        ensure(member.systemRole === "ADMIN", "Somente um Admin Global pode criar novos projetos.");
        await tx.insert(projects).values({
          id: command.id,
          name: command.name,
          description: command.description,
        });
        await audit("createProject", command.id);
        break;
      }
      case "updatePersonalInfo": {
        ensure(member.id === command.personId || member.systemRole === "ADMIN", "Somente o próprio usuário ou um Admin pode alterar dados pessoais.");
        await tx.update(users)
          .set({ displayName: command.displayName, phone: command.phone })
          .where(eq(users.id, command.personId));
        await audit("updatePersonalInfo", command.personId);
        break;
      }
      case "createFront": {
        ensure(member.systemRole === "ADMIN" || member.role === "PRODUCT_OWNER", "Somente Admin ou PO podem criar frentes.");
        const frontId = randomUUID();
        await tx.insert(fronts).values({
          id: frontId,
          projectId: command.projectId,
          name: command.name,
          description: command.description,
          color: command.color,
        });
        await audit("createFront", frontId);
        break;
      }
      case "setPersonTags": {
        ensure(member.systemRole === "ADMIN", "Somente um Admin Global pode editar as tags dos usuários.");
        await tx.update(users).set({ tags: command.tags }).where(eq(users.id, command.personId));
        await audit("setPersonTags", command.personId);
        break;
      }
      case "createItem": {
        ensure(member.role === "PRODUCT_OWNER", "Somente o Product Owner cria itens no Product Backlog");
        const d = command.draft;
        const assignments = await ensureAssignments(d.frontId, d.sprintId, d.assigneeIds);
        const item = await createBacklogItem(d, permission, { ...ports, uid: () => randomUUID() });
        const [order] = await tx.select({ value: sql<number>`coalesce(max(${backlogItems.orderIndex}), 0)` }).from(backlogItems)
          .where(eq(backlogItems.projectId, PROJECT_ID));
        await tx.update(backlogItems).set({ type: d.type, value: d.value, sprintId: d.sprintId, parentId: d.parentId,
          orderIndex: Number(order.value) + 1 }).where(eq(backlogItems.id, item.id));
        if (assignments.length) await tx.insert(itemAssignees).values(assignments.map((userId) => ({ itemId: item.id, userId })));
        break;
      }
      case "updateItem": {
        ensure(member.role === "PRODUCT_OWNER", "Somente o Product Owner edita o Product Backlog");
        const item = await findItem(command.itemId);
        ensure(permission.canEditFront(item.frontId) && permission.canEditFront(command.draft.frontId));
        const d = command.draft;
        if (d.frontId !== item.frontId) {
          const [linked] = await tx.select({ itemId: deliveryItems.itemId }).from(deliveryItems)
            .where(eq(deliveryItems.itemId, item.id)).limit(1);
          ensure(!linked, "Um item vinculado a uma entrega não pode mudar de frente");
        }
        const assignments = await ensureAssignments(d.frontId, d.sprintId, d.assigneeIds);
        item.updateFields(d, { actorId: member.id, at: new Date().toISOString() });
        await saveBacklogItem(item, permission, ports);
        await tx.update(backlogItems).set({ type: d.type, value: d.value, sprintId: d.sprintId, parentId: d.parentId })
          .where(and(eq(backlogItems.id, item.id), eq(backlogItems.projectId, PROJECT_ID)));
        await tx.delete(itemAssignees).where(eq(itemAssignees.itemId, item.id));
        if (assignments.length) await tx.insert(itemAssignees).values(assignments.map((userId) => ({ itemId: item.id, userId })));
        break;
      }
      case "moveItem": {
        await tx.execute(sql`select id from backlog_item where id = ${command.itemId} and "projectId" = ${PROJECT_ID} for update`);
        const item = await findItem(command.itemId);
        ensure(permission.canEditFront(item.frontId));
        const [row] = await tx.select().from(workflowColumns)
          .where(and(eq(workflowColumns.projectId, PROJECT_ID), eq(workflowColumns.status, command.toStatus))).limit(1);
        ensure(row, "Coluna não configurada");
        await tx.execute(sql`select id from workflow_column where id = ${row.id} for update`);
        const [total] = await tx.select({ value: count() }).from(backlogItems)
          .where(and(eq(backlogItems.projectId, PROJECT_ID), eq(backlogItems.status, row.status)));
        const column = new WorkflowColumn({ id: row.id, name: row.name, status: command.toStatus,
          wipLimit: row.wipLimit === null ? WipLimit.unlimited() : WipLimit.of(row.wipLimit) });
        await moveBacklogItem({ itemId: item.id, column, countInTarget: total.value,
          membership: permission, actorId: member.id, reason: command.reason }, ports);
        break;
      }
      case "openBlocker": {
        await tx.execute(sql`select id from backlog_item where id = ${command.itemId} and "projectId" = ${PROJECT_ID} for update`);
        const item = await findItem(command.itemId);
        ensure(permission.canEditFront(item.frontId));
        ensure(item.status === "in_progress", "Somente um item em andamento pode ser bloqueado");
        const [target] = await tx.select().from(workflowColumns)
          .where(and(eq(workflowColumns.projectId, PROJECT_ID), eq(workflowColumns.status, "blocked"))).limit(1);
        ensure(target, "Coluna de bloqueio não configurada");
        await tx.execute(sql`select id from workflow_column where id = ${target.id} for update`);
        const [total] = await tx.select({ value: count() }).from(backlogItems)
          .where(and(eq(backlogItems.projectId, PROJECT_ID), eq(backlogItems.status, "blocked")));
        await openBlockerForItem(item.id, command.description, permission, { ...ports, uid: () => randomUUID() });
        await moveBacklogItem({ itemId: item.id, actorId: member.id, membership: permission,
          column: new WorkflowColumn({ id: target.id, status: "blocked", name: target.name,
            wipLimit: target.wipLimit === null ? WipLimit.unlimited() : WipLimit.of(target.wipLimit) }),
          countInTarget: total.value, reason: command.description }, ports);
        break;
      }
      case "resolveBlocker": {
        const item = await findItem(command.itemId);
        ensure(permission.canEditFront(item.frontId));
        await resolveBlockerForItem(item.id, command.blockerId, permission, ports);
        break;
      }
      case "reorderItem": {
        ensure(member.role === "PRODUCT_OWNER");
        const item = await findItem(command.itemId);
        ensure(permission.canEditFront(item.frontId));
        await tx.execute(sql`select id from backlog_item where "projectId" = ${PROJECT_ID} order by "orderIndex", id for update`);
        const ordered = await tx.select({ id: backlogItems.id }).from(backlogItems)
          .where(eq(backlogItems.projectId, PROJECT_ID)).orderBy(backlogItems.orderIndex, backlogItems.id);
        const index = ordered.findIndex((row) => row.id === item.id);
        const next = index + command.direction;
        if (next < 0 || next >= ordered.length) break;
        [ordered[index], ordered[next]] = [ordered[next], ordered[index]];
        for (const [orderIndex, row] of ordered.entries()) {
          await tx.update(backlogItems).set({ orderIndex }).where(eq(backlogItems.id, row.id));
        }
        await audit("BacklogReordered", item.id);
        break;
      }
      case "updateSprintGoal": {
        ensure(member.role === "PRODUCT_OWNER" || permission.isTechAdmin());
        const [sprint] = await tx.select().from(sprints).where(and(eq(sprints.id, command.sprintId), eq(sprints.projectId, PROJECT_ID))).limit(1);
        ensure(sprint && sprint.status === "planned", "A Meta da Sprint só pode ser editada no planejamento");
        await tx.update(sprints).set({ goal: command.goal }).where(eq(sprints.id, sprint.id));
        await audit("SprintGoalUpdated", sprint.id);
        break;
      }
      case "createSprint": {
        ensure(member.role === "PRODUCT_OWNER" || permission.isTechAdmin());
        ensure(command.startDate <= command.endDate, "O término da Sprint deve ser posterior ao início");
        const sprintId = randomUUID();
        await tx.insert(sprints).values({ id: sprintId, projectId: PROJECT_ID,
          name: command.name, goal: command.goal, status: "planned",
          startDate: new Date(`${command.startDate}T12:00:00Z`), endDate: new Date(`${command.endDate}T12:00:00Z`) });
        await audit("SprintCreated", sprintId);
        break;
      }
      case "startSprint": {
        ensure(member.role === "PRODUCT_OWNER" || permission.isTechAdmin());
        const [sprint] = await tx.select().from(sprints).where(and(eq(sprints.id, command.sprintId), eq(sprints.projectId, PROJECT_ID))).limit(1);
        ensure(sprint && sprint.status === "planned" && sprint.goal.trim(), "Sprint não está planejada");
        // The partial unique index is the final guard for concurrent starts.
        await tx.update(sprints).set({ status: "active" }).where(eq(sprints.id, sprint.id));
        await audit("SprintStarted", sprint.id);
        break;
      }
      case "closeSprint": {
        ensure(member.role === "PRODUCT_OWNER" || permission.isTechAdmin());
        const [sprint] = await tx.select().from(sprints).where(and(eq(sprints.id, command.sprintId), eq(sprints.projectId, PROJECT_ID))).limit(1);
        ensure(sprint && sprint.status === "active", "Somente a Sprint ativa pode ser encerrada");
        await tx.update(sprints).set({ status: "closed" }).where(eq(sprints.id, sprint.id));
        await audit("SprintClosed", sprint.id);
        break;
      }
      case "setColumnWip": {
        ensure(permission.isTechAdmin());
        const [column] = await tx.select().from(workflowColumns)
          .where(and(eq(workflowColumns.id, command.columnId), eq(workflowColumns.projectId, PROJECT_ID))).limit(1);
        ensure(column, "Coluna não encontrada");
        ensure(command.wipLimit === null || !["backlog", "done"].includes(column.status), "Esta coluna não utiliza limite de WIP");
        await tx.execute(sql`select id from workflow_column where id = ${column.id} for update`);
        const [total] = await tx.select({ value: count() }).from(backlogItems)
          .where(and(eq(backlogItems.projectId, PROJECT_ID), eq(backlogItems.status, column.status)));
        ensure(command.wipLimit === null || total.value <= command.wipLimit, "Limite menor que o WIP atual");
        await tx.update(workflowColumns).set({ wipLimit: command.wipLimit }).where(eq(workflowColumns.id, column.id));
        await audit("WipLimitChanged", column.id);
        break;
      }
      case "setFrontPermission": {
        ensure(permission.isTechAdmin());
        ensure(command.canView || !command.canEdit, "Edição exige permissão de visualização");
        await ensureFront(command.frontId);
        await tx.execute(sql`select id from project_membership where id = ${command.membershipId} and "projectId" = ${PROJECT_ID} for update`);
        const [target] = await tx.select().from(projectMemberships).where(and(eq(projectMemberships.id, command.membershipId), eq(projectMemberships.projectId, PROJECT_ID))).limit(1);
        ensure(target, "Vínculo não encontrado");
        const frontPermissions = target.frontPermissions.filter((p) => p.frontId !== command.frontId);
        frontPermissions.push({ frontId: command.frontId, canView: command.canView, canEdit: command.canEdit });
        await tx.update(projectMemberships).set({ frontPermissions }).where(eq(projectMemberships.id, target.id));
        await audit("FrontPermissionChanged", target.id);
        break;
      }
      case "createEvent": {
        ensure(permission.isTechAdmin() || member.role === "PRODUCT_OWNER");
        if (command.sourceItemId) {
          const item = await findItem(command.sourceItemId);
          ensure(permission.canViewFront(item.frontId));
        }
        const eventId = randomUUID();
        await tx.insert(calendarEvents).values({ id: eventId, projectId: PROJECT_ID,
          title: command.title, date: command.date, time: command.time,
          kind: command.kind, sourceItemId: command.sourceItemId, syncStatus: "local" });
        await audit("CalendarEventCreated", eventId);
        break;
      }
      case "createDelivery": {
        ensure(member.role === "PRODUCT_OWNER" || permission.isTechAdmin());
        await ensureFront(command.frontId);
        ensure(permission.canEditFront(command.frontId));
        if (command.sprintId) {
          const [sprint] = await tx.select({ id: sprints.id }).from(sprints)
            .where(and(eq(sprints.id, command.sprintId), eq(sprints.projectId, PROJECT_ID))).limit(1);
          ensure(sprint, "Sprint não encontrada");
        }
        const itemIds = [...new Set(command.itemIds)];
        const linked = await tx.select({ id: backlogItems.id, frontId: backlogItems.frontId }).from(backlogItems)
          .where(and(eq(backlogItems.projectId, PROJECT_ID), inArray(backlogItems.id, itemIds)));
        ensure(linked.length === itemIds.length && linked.every((item) => item.frontId === command.frontId), "Itens inválidos para a frente");
        const deliveryId = randomUUID();
        await tx.insert(deliveries).values({ id: deliveryId, projectId: PROJECT_ID, title: command.title,
          description: command.description, frontId: command.frontId, sprintId: command.sprintId });
        await tx.insert(deliveryItems).values(itemIds.map((itemId) => ({ deliveryId, itemId })));
        await audit("DeliveryCreated", deliveryId);
        break;
      }
      case "setDeliveryStatus": {
        ensure(member.role === "PRODUCT_OWNER" || permission.isTechAdmin());
        const [delivery] = await tx.select().from(deliveries)
          .where(and(eq(deliveries.id, command.deliveryId), eq(deliveries.projectId, PROJECT_ID))).limit(1);
        ensure(delivery && permission.canEditFront(delivery.frontId), "Entrega não encontrada ou sem permissão");
        ensure(delivery.status !== "entregue", "Uma entrega concluída não pode regredir de estado");
        if (command.status === "entregue") {
          const items = await tx.select({ status: backlogItems.status }).from(deliveryItems)
            .innerJoin(backlogItems, eq(deliveryItems.itemId, backlogItems.id))
            .where(eq(deliveryItems.deliveryId, delivery.id));
          ensure(items.length > 0 && items.every((item) => item.status === "done"), "Conclua os itens vinculados antes de registrar a entrega");
        }
        await tx.update(deliveries).set({ status: command.status,
          completedOn: command.status === "entregue" ? new Date().toISOString().slice(0, 10) : null })
          .where(eq(deliveries.id, delivery.id));
        await audit("DeliveryStatusChanged", delivery.id);
        break;
      }
    }
  });
}
