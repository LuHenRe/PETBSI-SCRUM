import "server-only";
import { and, eq, or, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { projectMemberships, users } from "@/db/schema";
import { auth } from "@/auth";
import type { ProjectRole } from "@/domain/shared/project-role";

export const PROJECT_ID = "petbsi";

export async function allowGoogleLogin(email: string, subject: string): Promise<boolean> {
  const db = getDb();
  const [membership] = await db.select({ id: users.id, subject: users.googleSubject })
    .from(users)
    .innerJoin(projectMemberships, and(eq(projectMemberships.userId, users.id), eq(projectMemberships.projectId, PROJECT_ID)))
    .where(and(eq(users.email, email), eq(users.enabled, true)))
    .limit(1);
  if (!membership || (membership.subject && membership.subject !== subject)) return false;
  // A compare-and-set prevents a second Google account from claiming an invited user.
  const bound = await db.update(users).set({ googleSubject: subject })
    .where(and(eq(users.id, membership.id), or(isNull(users.googleSubject), eq(users.googleSubject, subject))))
    .returning({ id: users.id });
  return bound.length === 1;
}

export async function userIdForGoogleSubject(subject: string): Promise<string | null> {
  const [user] = await getDb().select({ id: users.id }).from(users)
    .innerJoin(projectMemberships, and(eq(projectMemberships.userId, users.id), eq(projectMemberships.projectId, PROJECT_ID)))
    .where(and(eq(users.googleSubject, subject), eq(users.enabled, true))).limit(1);
  return user?.id ?? null;
}

export async function getCurrentMember() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const [member] = await getDb().select({
    id: users.id,
    name: users.name,
    email: users.email,
    membershipId: projectMemberships.id,
    role: projectMemberships.role,
    primaryFrontId: projectMemberships.primaryFrontId,
    frontPermissions: projectMemberships.frontPermissions,
  }).from(users)
    .innerJoin(projectMemberships, and(eq(projectMemberships.userId, users.id), eq(projectMemberships.projectId, PROJECT_ID)))
    .where(and(eq(users.id, session.user.id), eq(users.enabled, true))).limit(1);
  if (!member) return null;
  return { ...member, role: member.role as ProjectRole };
}
