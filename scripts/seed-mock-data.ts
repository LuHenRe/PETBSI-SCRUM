import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { 
  users, fronts, projectMemberships, sprints, workflowColumns, 
  backlogItems, itemAssignees, blockers, stateChanges, deliveries, 
  deliveryItems, calendarEvents 
} from "../src/db/schema";
import { createSeedState } from "../src/lib/seed";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing");

const pool = new Pool({ connectionString: url, max: 1 });
const db = drizzle(pool);

async function main() {
  const state = createSeedState();
  const projectId = "petbsi";

  console.log("Seeding mock data...");

  await db.transaction(async (tx) => {
    // 1. Users
    for (const p of state.people) {
      await tx.insert(users).values({
        id: p.id,
        name: p.name,
        email: p.email,
        enabled: true,
      }).onConflictDoNothing();
    }

    // 2. Fronts
    for (const f of state.fronts) {
      await tx.insert(fronts).values({
        id: f.id,
        projectId,
        name: f.name,
        description: f.description,
        color: f.color,
      }).onConflictDoNothing();
    }

    // 3. Project Memberships
    for (const m of state.memberships) {
      await tx.insert(projectMemberships).values({
        id: m.id,
        projectId,
        userId: m.personId,
        primaryFrontId: m.primaryFrontId,
        role: m.role,
        frontPermissions: m.frontPermissions as any,
      }).onConflictDoNothing();
    }

    // 4. Sprints
    for (const s of state.sprints) {
      await tx.insert(sprints).values({
        id: s.id,
        projectId,
        name: s.name,
        goal: s.goal,
        status: s.status,
        startDate: new Date(s.startDate),
        endDate: new Date(s.endDate),
      }).onConflictDoNothing();
    }

    // 5. Workflow Columns
    let colIdx = 0;
    for (const c of state.columns) {
      await tx.insert(workflowColumns).values({
        id: c.id,
        projectId,
        status: c.status,
        name: c.name,
        wipLimit: c.wipLimit,
        orderIndex: colIdx++,
      }).onConflictDoNothing();
    }

    // 6. Backlog Items
    let itemIdx = 0;
    for (const i of state.backlogItems) {
      await tx.insert(backlogItems).values({
        id: i.id,
        projectId,
        title: i.title,
        description: i.description,
        frontId: i.frontId,
        priority: i.priority,
        status: i.status,
        type: i.type,
        value: i.value,
        sprintId: i.sprintId,
        orderIndex: itemIdx++,
        deadline: i.deadline ? new Date(i.deadline) : null,
        createdAt: new Date(i.createdAt),
      }).onConflictDoNothing();

      // Assignees
      for (const userId of i.assigneeIds) {
        await tx.insert(itemAssignees).values({
          itemId: i.id,
          userId: userId,
        }).onConflictDoNothing();
      }
    }

    // 7. Blockers
    for (const b of state.blockers) {
      await tx.insert(blockers).values({
        id: b.id,
        itemId: b.itemId,
        description: b.description,
        openedAt: b.openedAt,
        openedBy: b.openedBy,
        resolvedAt: b.resolvedAt,
        resolvedBy: b.resolvedBy,
      }).onConflictDoNothing();
    }

    // 8. State Changes
    for (const h of state.stateChanges) {
      await tx.insert(stateChanges).values({
        id: h.id,
        projectId,
        itemId: h.itemId,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        changedBy: h.changedBy,
        changedAt: new Date(h.changedAt),
      }).onConflictDoNothing();
    }

    // 9. Deliveries
    for (const dv of state.deliveries) {
      const sprintId = state.sprints.find(s => s.name === dv.sprintName)?.id || null;
      await tx.insert(deliveries).values({
        id: dv.id,
        projectId,
        frontId: dv.frontId,
        sprintId: sprintId,
        title: dv.title,
        description: dv.description,
        status: dv.status,
        completedOn: dv.completedOn,
      }).onConflictDoNothing();

      for (const itemId of dv.itemIds) {
        await tx.insert(deliveryItems).values({
          deliveryId: dv.id,
          itemId: itemId,
        }).onConflictDoNothing();
      }
    }

    // 10. Calendar Events
    for (const e of state.events) {
      await tx.insert(calendarEvents).values({
        id: e.id,
        projectId,
        title: e.title,
        date: e.date,
        time: e.time,
        kind: e.kind,
        sourceItemId: e.sourceItemId,
        syncStatus: e.syncStatus,
      }).onConflictDoNothing();
    }
  });

  console.log("✅ Mock data seeded successfully!");
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
}).finally(() => {
  pool.end();
});
