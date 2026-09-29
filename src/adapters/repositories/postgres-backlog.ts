import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { auditEvents, backlogItems, blockers, stateChanges } from "@/db/schema";
import { BacklogItem } from "@/domain/backlog/backlog-item";
import { Blocker } from "@/domain/blocker/blocker";
import type { BacklogPriority } from "@/domain/shared/backlog-priority";
import type { WorkItemStatus } from "@/domain/shared/work-item-status";
import type { AuditPort, BacklogRepository } from "@/application/ports/repositories";
import { PROJECT_ID } from "@/server/authorization/membership";

type Transaction = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

export function postgresPorts(tx: Transaction): { backlog: BacklogRepository; audit: AuditPort } {
  const backlog: BacklogRepository = {
    async load(id) {
      const [row] = await tx.select().from(backlogItems)
        .where(and(eq(backlogItems.id, id), eq(backlogItems.projectId, PROJECT_ID))).limit(1);
      if (!row) return null;
      const rows = await tx.select().from(blockers).where(eq(blockers.itemId, id));
      const restored = rows.map((b) => {
        const blocker = Blocker.open({ id: b.id, description: b.description, reportedBy: b.openedBy, openedAt: b.openedAt });
        if (b.resolvedAt) blocker.resolve(b.resolvedBy ?? b.openedBy, b.resolvedAt);
        return blocker;
      });
      return BacklogItem.restore({ id: row.id, title: row.title, description: row.description,
        frontId: row.frontId, priority: row.priority as BacklogPriority,
        deadline: row.deadline?.toISOString().slice(0, 10) ?? null,
        status: row.status as WorkItemStatus, blockers: restored });
    },
    async save(item) {
      await tx.insert(backlogItems).values({ id: item.id, projectId: PROJECT_ID,
        title: item.title, description: item.description, frontId: item.frontId,
        priority: item.priority, status: item.status,
        deadline: item.deadline ? new Date(`${item.deadline}T12:00:00Z`) : null })
        .onConflictDoUpdate({ target: backlogItems.id, set: { title: item.title,
          description: item.description, frontId: item.frontId, priority: item.priority,
          status: item.status, deadline: item.deadline ? new Date(`${item.deadline}T12:00:00Z`) : null } });
      for (const change of item.getStateChanges()) {
        await tx.insert(stateChanges).values({ id: change.id, projectId: PROJECT_ID,
          itemId: item.id, fromStatus: change.from, toStatus: change.to,
          changedBy: change.actorId, reason: change.reason, changedAt: new Date(change.at) }).onConflictDoNothing();
      }
      for (const blocker of item.getBlockers()) {
        await tx.insert(blockers).values({ id: blocker.id, itemId: item.id,
          description: blocker.description, openedAt: blocker.openedAt,
          openedBy: blocker.reportedBy, resolvedAt: blocker.resolvedAt, resolvedBy: blocker.resolvedBy })
          .onConflictDoUpdate({ target: blockers.id, set: { resolvedAt: blocker.resolvedAt, resolvedBy: blocker.resolvedBy } });
      }
    },
    async listByProject(projectId) {
      const rows = await tx.select({ id: backlogItems.id }).from(backlogItems).where(eq(backlogItems.projectId, projectId));
      const items = await Promise.all(rows.map((row) => backlog.load(row.id)));
      return items.filter((item): item is BacklogItem => item !== null);
    },
  };
  const audit: AuditPort = {
    async record(event) {
      await tx.insert(auditEvents).values({ id: crypto.randomUUID(), actorId: event.actorId,
        action: event.action, aggregate: event.aggregate, at: event.at });
    },
    async list(aggregateId) {
      const rows = await tx.select().from(auditEvents)
        .where(aggregateId ? eq(auditEvents.aggregate, aggregateId) : undefined);
      return rows.map((row) => ({ actorId: row.actorId, action: row.action, aggregate: row.aggregate, at: row.at }));
    },
  };
  return { backlog, audit };
}
