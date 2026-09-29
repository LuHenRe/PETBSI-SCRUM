"use server";

import { auth } from "@/auth";
import { getDb } from "@/db";
import { projectMemberships, users, fronts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";

export async function registerMember(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  
  const db = getDb();

  let primaryFrontId: string | null = null;
  let frontPermissions: { frontId: string; canView: boolean; canEdit: boolean }[] = [];

  const allFronts = await db.select().from(fronts).where(eq(fronts.projectId, "petbsi"));

  if (role === "COORDINATOR") {
    frontPermissions = allFronts.map(f => ({
      frontId: f.id,
      canView: true,
      canEdit: false
    }));
  } else if (role === "MEMBER") {
    const pFront = formData.get("primaryFront") as string;
    const sFront = formData.get("secondaryFront") as string;
    
    if (!pFront) throw new Error("Frente primária obrigatória para bolsistas.");
    primaryFrontId = pFront;

    frontPermissions.push({ frontId: pFront, canView: true, canEdit: true });
    
    if (sFront && sFront !== pFront) {
      frontPermissions.push({ frontId: sFront, canView: true, canEdit: true });
    }
  } else {
    throw new Error("Papel inválido");
  }

  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ name, enabled: true })
      .where(eq(users.id, session.user!.id!));

    await tx.insert(projectMemberships).values({
      id: randomUUID(),
      projectId: "petbsi",
      userId: session.user!.id!,
      role,
      primaryFrontId,
      frontPermissions
    });
  });

  redirect("/");
}
