import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { fronts, projects, projectMemberships, users, workflowColumns } from "../src/db/schema";

config({ path: ".env.local" });
const url = process.env.MIGRATION_DATABASE_URL;
if (!url) throw new Error("MIGRATION_DATABASE_URL é necessária para o bootstrap");
const pool = new Pool({ connectionString: url, max: 1 });
const db = drizzle(pool);
const projectId = "petbsi";

const frontNames = [
  ["f1", "Ensino e Nivelamento", "Tutoria e materiais de apoio", "#2563eb"],
  ["f2", "Pesquisa e Desenvolvimento de IA", "Pesquisa e protótipo do Tutor Virtual", "#7c3aed"],
  ["f3", "Extensão e Letramento Algorítmico", "Oficinas e comunidade", "#059669"],
  ["f4", "Gestão Ágil", "Acompanhamento transversal", "#d97706"],
] as const;
const workflow = [
  ["backlog", "Product Backlog"], ["todo", "A fazer"], ["in_progress", "Em andamento"],
  ["blocked", "Bloqueado"], ["review", "Em revisão"], ["done", "Concluído"],
] as const;

async function core() {
  await db.transaction(async (tx) => {
    await tx.insert(projects).values({ id: projectId, name: "PETBSI Scrum", description: "Default project" }).onConflictDoNothing();
    for (const [id, name, description, color] of frontNames) {
      await tx.insert(fronts).values({ id, projectId, name, description, color }).onConflictDoNothing();
    }
    for (const [index, [status, name]] of workflow.entries()) {
      await tx.insert(workflowColumns).values({ id: `c_${status}`, projectId, status, name, orderIndex: index, wipLimit: null })
        .onConflictDoNothing();
    }
  });
  console.log("Frentes e colunas iniciais cadastradas; revise o fluxo e os limites de WIP com a equipe.");
}

async function invite(emailInput: string, roleInput: string, nameInput: string) {
  const email = z.email().parse(emailInput.trim().toLowerCase());
  const role = z.enum(["MEMBER", "COORDINATOR", "PRODUCT_OWNER", "SCRUM_MASTER", "SCRUM_MASTER_ASSISTANT"]).parse(roleInput);
  const name = z.string().trim().min(2).max(150).parse(nameInput);
  await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing?.googleSubject) throw new Error("Esta conta já está vinculada ao Google; não altere papéis por este comando.");
    const userId = existing?.id ?? randomUUID();
    if (!existing) await tx.insert(users).values({ id: userId, email, name, enabled: false });
    const [membership] = await tx.select().from(projectMemberships)
      .where(and(eq(projectMemberships.userId, userId), eq(projectMemberships.projectId, projectId))).limit(1);
    if (membership) throw new Error("Esta pessoa já tem vínculo; não altere papéis por este comando.");
    await tx.insert(projectMemberships).values({ id: randomUUID(), projectId, userId, role,
      primaryFrontId: role === "MEMBER" ? null : "f4", frontPermissions: [] });
    await tx.update(users).set({ enabled: true, name }).where(eq(users.id, userId));
  });
  console.log(`Convite de ${email} registrado com papel ${role}.`);
}

async function main() {
  try {
    if (process.argv[2] === "core") await core();
    else if (process.argv[2] === "invite") await invite(process.argv[3] ?? "", process.argv[4] ?? "", process.argv.slice(5).join(" "));
    else throw new Error("Use 'core' ou 'invite email papel Nome Completo'");
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error("Bootstrap falhou:", error instanceof Error ? error.message : "erro desconhecido");
  process.exitCode = 1;
});
