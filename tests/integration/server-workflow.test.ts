import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/auth", () => ({ auth: async () => null }));

describe.skipIf(!process.env.TEST_DATABASE_URL)("PostgreSQL: caso de uso com autorização e WIP concorrente", () => {
  it("grava histórico e impede que dois usuários ultrapassem o WIP", async () => {
    if (!new URL(process.env.TEST_DATABASE_URL!).pathname.endsWith("_test")) {
      throw new Error("TEST_DATABASE_URL deve apontar para um banco descartável *_test");
    }
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    const [{ getDb }, { users, projects, fronts, projectMemberships, backlogItems, blockers, workflowColumns, stateChanges, auditEvents }, { executeCommand }, { allowGoogleLogin }, { getDashboardState }] = await Promise.all([
      import("@/db"), import("@/db/schema"), import("@/server/commands"),
      import("@/server/authorization/membership"), import("@/server/dashboard-state"),
    ]);
    const { eq, and } = await import("drizzle-orm");
    const db = getDb();
    const id = crypto.randomUUID();
    await db.insert(users).values({ id, name: "Usuário de teste", email: `${id}@example.org`, enabled: true });
    await db.insert(projects).values({ id: "petbsi", name: "PETBSI Scrum", description: "Default project" }).onConflictDoNothing();
    await db.insert(fronts).values({ id: "f4", projectId: "petbsi", name: "Gestão Ágil", description: "Gestão Ágil", color: "#d97706" }).onConflictDoNothing();
    const membershipId = crypto.randomUUID();
    await db.insert(projectMemberships).values({ id: membershipId, userId: id, projectId: "petbsi",
      role: "PRODUCT_OWNER", primaryFrontId: "f4", frontPermissions: [] });
    const member = { id, name: "Usuário de teste", email: `${id}@example.org`, membershipId,
      role: "PRODUCT_OWNER" as const, primaryFrontId: "f4", frontPermissions: [] };
    let ids: string[] = [];
    const draft = { description: "", frontId: "f4", priority: "alta" as const, deadline: null,
      type: "codigo" as const, value: "M" as const, sprintId: null, assigneeIds: [] };
    try {
      expect(await allowGoogleLogin(`${id}@example.org`, "verified-google-subject")).toBe(true);
      expect(await allowGoogleLogin(`${id}@example.org`, "other-google-subject")).toBe(false);
      await db.update(workflowColumns).set({ wipLimit: 1 })
        .where(and(eq(workflowColumns.projectId, "petbsi"), eq(workflowColumns.status, "todo")));
      await executeCommand(member, { action: "createItem", draft: { ...draft, title: `Tarefa A ${id}` } });
      await executeCommand(member, { action: "createItem", draft: { ...draft, title: `Tarefa B ${id}` } });
      const items = await db.select().from(backlogItems).where(eq(backlogItems.projectId, "petbsi"));
      ids = items.filter((item) => item.title.endsWith(id)).map((item) => item.id);
      expect(ids).toHaveLength(2);
      const snapshot = await getDashboardState(member);
      expect(snapshot.currentUserId).toBe(id);
      expect(snapshot.backlogItems.filter((item) => ids.includes(item.id))).toHaveLength(2);
      const results = await Promise.allSettled(ids.map((itemId) =>
        executeCommand(member, { action: "moveItem", itemId, toStatus: "todo" })));
      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
      const changes = await db.select().from(stateChanges).where(eq(stateChanges.projectId, "petbsi"));
      expect(changes.filter((change) => ids.includes(change.itemId))).toHaveLength(1);
      const movedId = ids[results.findIndex((result) => result.status === "fulfilled")];
      await executeCommand(member, { action: "moveItem", itemId: movedId, toStatus: "in_progress" });
      await executeCommand(member, { action: "openBlocker", itemId: movedId, description: "Aguardando resposta" });
      const [blocked] = await db.select({ status: backlogItems.status }).from(backlogItems).where(eq(backlogItems.id, movedId));
      expect(blocked.status).toBe("blocked");
      await expect(executeCommand(member, { action: "moveItem", itemId: movedId, toStatus: "in_progress" })).rejects.toThrow();
      const [blocker] = await db.select({ id: blockers.id }).from(blockers).where(eq(blockers.itemId, movedId));
      await executeCommand(member, { action: "resolveBlocker", itemId: movedId, blockerId: blocker.id });
      await executeCommand(member, { action: "moveItem", itemId: movedId, toStatus: "in_progress" });
      await expect(executeCommand({ ...member, role: "MEMBER", primaryFrontId: "f1" },
        { action: "createItem", draft: { ...draft, title: "Não autorizado" } })).rejects.toThrow();
    } finally {
      const { inArray } = await import("drizzle-orm");
      if (ids.length) {
        await db.delete(stateChanges).where(inArray(stateChanges.itemId, ids));
        await db.delete(blockers).where(inArray(blockers.itemId, ids));
        await db.delete(auditEvents).where(inArray(auditEvents.aggregate, ids));
        await db.delete(backlogItems).where(inArray(backlogItems.id, ids));
      }
      await db.delete(projectMemberships).where(eq(projectMemberships.id, membershipId));
      await db.delete(users).where(eq(users.id, id));
      await db.update(workflowColumns).set({ wipLimit: null })
        .where(and(eq(workflowColumns.projectId, "petbsi"), eq(workflowColumns.status, "todo")));
    }
  }, 60000);
});
