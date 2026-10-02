import {
  pgTable,
  text,
  timestamp,
  boolean,
  primaryKey,
  integer,
  jsonb,
  uniqueIndex,
  check,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { sql } from "drizzle-orm";

// --- NextAuth.js Tables ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  enabled: boolean("enabled").notNull().default(false),
  googleSubject: text("googleSubject").unique(),
  systemRole: text("systemRole").notNull().default("USER"), // 'USER' or 'ADMIN'
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// --- Domain Tables ---

export const projects = pgTable("project", {
  id: text("id").primaryKey(), // Using text for custom IDs like "petbsi"
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const fronts = pgTable("front", {
  id: text("id").primaryKey(),
  projectId: text("projectId").notNull().default("petbsi"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
});

export const projectMemberships = pgTable("project_membership", {
  id: text("id").primaryKey(),
  projectId: text("projectId").notNull().default("petbsi").references(() => projects.id),
  userId: text("userId").notNull().references(() => users.id),
  primaryFrontId: text("primaryFrontId").references(() => fronts.id),
  role: text("role").notNull(), // e.g., 'PRODUCT_OWNER', 'MEMBER', etc
  frontPermissions: jsonb("frontPermissions").$type<{ frontId: string; canView: boolean; canEdit: boolean }[]>().default([]).notNull(),
}, (table) => [
  uniqueIndex("membership_project_user_unique").on(table.projectId, table.userId),
  uniqueIndex("membership_one_product_owner").on(table.projectId).where(sql`${table.role} = 'PRODUCT_OWNER'`),
  check("membership_valid_role", sql`${table.role} in ('MEMBER', 'COORDINATOR', 'PRODUCT_OWNER', 'SCRUM_MASTER', 'SCRUM_MASTER_ASSISTANT')`),
]);

export const sprints = pgTable("sprint", {
  id: text("id").primaryKey(),
  projectId: text("projectId").notNull().default("petbsi"),
  name: text("name").notNull(),
  goal: text("goal").notNull(),
  status: text("status").notNull(), // 'planned' | 'active' | 'closed'
  startDate: timestamp("startDate", { mode: "date" }).notNull(),
  endDate: timestamp("endDate", { mode: "date" }).notNull(),
}, (table) => [uniqueIndex("sprint_one_active_per_project").on(table.projectId).where(sql`${table.status} = 'active'`)]);

export const backlogItems = pgTable("backlog_item", {
  id: text("id").primaryKey(),
  projectId: text("projectId").notNull().default("petbsi").references(() => projects.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  frontId: text("frontId").notNull().references(() => fronts.id),
  priority: text("priority").notNull(), // 'baixa' | 'media' | 'alta'
  status: text("status").notNull(), // 'backlog', 'todo', 'in_progress', etc
  type: text("type"), // 'codigo', 'documento', etc
  value: text("value"), // 'PQ', 'M', 'S'
  sprintId: text("sprintId").references(() => sprints.id),
  orderIndex: integer("orderIndex").notNull().default(0),
  deadline: timestamp("deadline", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  parentId: text("parentId").references((): AnyPgColumn => backlogItems.id),
}, (table) => [
  check("backlog_valid_status", sql`${table.status} in ('backlog', 'todo', 'in_progress', 'blocked', 'review', 'done', 'cancelled')`),
  check("backlog_valid_priority", sql`${table.priority} in ('baixa', 'media', 'alta')`),
]);

export const itemAssignees = pgTable("item_assignee", {
  itemId: text("itemId").notNull().references(() => backlogItems.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.itemId, table.userId] })
}));

export const blockers = pgTable("blocker", {
  id: text("id").primaryKey(),
  itemId: text("itemId").notNull().references(() => backlogItems.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  openedAt: timestamp("openedAt", { mode: "string" }).notNull(),
  openedBy: text("openedBy").notNull().references(() => users.id),
  resolvedAt: timestamp("resolvedAt", { mode: "string" }),
  resolvedBy: text("resolvedBy").references(() => users.id),
});

export const workflowColumns = pgTable("workflow_column", {
  id: text("id").primaryKey(),
  projectId: text("projectId").notNull().default("petbsi").references(() => projects.id),
  status: text("status").notNull(),
  name: text("name").notNull(),
  wipLimit: integer("wipLimit"),
  orderIndex: integer("orderIndex").notNull(),
}, (table) => [
  uniqueIndex("workflow_project_status_unique").on(table.projectId, table.status),
  check("workflow_positive_wip", sql`${table.wipLimit} is null or ${table.wipLimit} > 0`),
]);

export const stateChanges = pgTable("work_item_state_change", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("projectId").notNull().default("petbsi").references(() => projects.id),
  itemId: text("itemId").notNull().references(() => backlogItems.id),
  fromStatus: text("fromStatus"),
  toStatus: text("toStatus").notNull(),
  changedBy: text("changedBy").notNull().references(() => users.id),
  reason: text("reason"),
  changedAt: timestamp("changedAt", { mode: "date" }).notNull().defaultNow(),
});

export const calendarEvents = pgTable("calendar_event", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("projectId").notNull().default("petbsi").references(() => projects.id),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  kind: text("kind").notNull(),
  sourceItemId: text("sourceItemId").references(() => backlogItems.id),
  syncStatus: text("syncStatus").notNull().default("local"),
});

export const deliveries = pgTable("delivery", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("projectId").notNull().default("petbsi").references(() => projects.id),
  frontId: text("frontId").notNull().references(() => fronts.id),
  sprintId: text("sprintId").references(() => sprints.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("planejada"),
  completedOn: text("completedOn"),
}, (table) => [check("delivery_valid_status", sql`${table.status} in ('planejada', 'em_andamento', 'entregue')`)]);

export const deliveryItems = pgTable("delivery_item", {
  deliveryId: text("deliveryId").notNull().references(() => deliveries.id),
  itemId: text("itemId").notNull().references(() => backlogItems.id),
}, (table) => [primaryKey({ columns: [table.deliveryId, table.itemId] })]);

export const auditEvents = pgTable("audit_event", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorId: text("actorId").notNull(),
  action: text("action").notNull(),
  aggregate: text("aggregate").notNull(),
  at: timestamp("at", { mode: "string" }).notNull(),
});
