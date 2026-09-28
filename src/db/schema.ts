import {
  pgTable,
  text,
  timestamp,
  boolean,
  primaryKey,
  integer,
  jsonb
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// --- NextAuth.js Tables ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
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

export const fronts = pgTable("front", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
});

export const projectMemberships = pgTable("project_membership", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  primaryFrontId: text("primaryFrontId").references(() => fronts.id),
  role: text("role").notNull(), // e.g., 'PRODUCT_OWNER', 'MEMBER', etc
  frontPermissions: jsonb("frontPermissions").default('[]').notNull(),
});

export const sprints = pgTable("sprint", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  goal: text("goal").notNull(),
  status: text("status").notNull(), // 'planned' | 'active' | 'closed'
  startDate: timestamp("startDate", { mode: "date" }).notNull(),
  endDate: timestamp("endDate", { mode: "date" }).notNull(),
});

export const backlogItems = pgTable("backlog_item", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  frontId: text("frontId").notNull().references(() => fronts.id),
  priority: text("priority").notNull(), // 'baixa' | 'media' | 'alta'
  status: text("status").notNull(), // 'backlog', 'todo', 'in_progress', etc
  type: text("type"), // 'codigo', 'documento', etc
  value: text("value"), // 'PQ', 'M', 'S'
  sprintId: text("sprintId").references(() => sprints.id),
  deadline: timestamp("deadline", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

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

export const auditEvents = pgTable("audit_event", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorId: text("actorId").notNull(),
  action: text("action").notNull(),
  aggregate: text("aggregate").notNull(),
  at: timestamp("at", { mode: "string" }).notNull(),
});
