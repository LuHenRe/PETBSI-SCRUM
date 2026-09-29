import { randomBytes } from "node:crypto";
import { closeSync, existsSync, openSync, unlinkSync, writeSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

const roleName = "petbsi_app";
const envFile = resolve(".env.local");
const direct = process.env.MIGRATION_DATABASE_URL;
const pooled = process.env.POOLED_OWNER_DATABASE_URL;

function neonUrl(raw: string | undefined, connection: "direct" | "pooled"): URL {
  if (!raw) throw new Error(`Conexão ${connection} não informada`);
  const url = new URL(raw);
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname.endsWith(".neon.tech") ||
      url.searchParams.get("sslmode") !== "verify-full" ||
      (connection === "pooled") !== url.hostname.includes("-pooler")) {
    throw new Error(`A conexão ${connection} deve ser Neon com sslmode=verify-full`);
  }
  return url;
}

async function main(): Promise<void> {
  if (existsSync(envFile)) throw new Error(".env.local já existe; nenhuma credencial será sobrescrita");
  const migrationUrl = neonUrl(direct, "direct");
  const ownerPoolUrl = neonUrl(pooled, "pooled");
  if (migrationUrl.pathname !== ownerPoolUrl.pathname || migrationUrl.username !== ownerPoolUrl.username) {
    throw new Error("As conexões direta e pooled devem apontar para o mesmo banco e papel proprietário");
  }
  if (migrationUrl.pathname.endsWith("_test")) throw new Error("Não provisione o papel da aplicação no banco descartável de testes");

  const password = randomBytes(32).toString("hex");
  const runtimeUrl = new URL(ownerPoolUrl);
  runtimeUrl.username = roleName;
  runtimeUrl.password = password;
  const databaseName = decodeURIComponent(migrationUrl.pathname.slice(1)).replaceAll('"', '""');
  const ownerPool = new Pool({ connectionString: migrationUrl.toString(), max: 1 });
  const client = await ownerPool.connect();
  let wroteFile = false;
  try {
    await client.query("BEGIN");
    const existing = await client.query("select 1 from pg_roles where rolname = $1", [roleName]);
    if (existing.rowCount) throw new Error("Papel petbsi_app já existe; não altere sua senha sem planejar a rotação");
    // Password is generated as hex: interpolation cannot inject SQL syntax.
    await client.query(`CREATE ROLE petbsi_app WITH LOGIN PASSWORD '${password}'`);
    await client.query(`GRANT CONNECT ON DATABASE "${databaseName}" TO petbsi_app`);
    await client.query("GRANT USAGE ON SCHEMA public TO petbsi_app");
    await client.query(`GRANT SELECT ON "user", project_membership, front, sprint, backlog_item,
      workflow_column, work_item_state_change, blocker, item_assignee, calendar_event,
      delivery, delivery_item TO petbsi_app`);
    await client.query('GRANT UPDATE ("googleSubject") ON "user" TO petbsi_app');
    await client.query(`GRANT INSERT, UPDATE ON backlog_item, blocker, sprint, project_membership,
      workflow_column TO petbsi_app`);
    await client.query(`GRANT INSERT ON work_item_state_change, audit_event, calendar_event,
      item_assignee, delivery, delivery_item TO petbsi_app`);
    await client.query("GRANT UPDATE ON delivery TO petbsi_app");
    await client.query("GRANT DELETE ON item_assignee TO petbsi_app");

    const fd = openSync(envFile, "wx", 0o600);
    wroteFile = true;
    try {
      writeSync(fd, `# Ambiente Neon de desenvolvimento; nunca envie este arquivo ao Git.\n` +
        `DATABASE_URL=${JSON.stringify(runtimeUrl.toString())}\n` +
        `AUTH_URL="http://localhost:3000"\n` +
        `AUTH_SECRET="${randomBytes(48).toString("base64url")}"\n` +
        `# Após configurar o Google Cloud, acrescente AUTH_GOOGLE_ID e AUTH_GOOGLE_SECRET.\n`);
    } finally {
      closeSync(fd);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    if (wroteFile) unlinkSync(envFile);
    throw error;
  } finally {
    client.release();
    await ownerPool.end();
  }

  const runtimePool = new Pool({ connectionString: runtimeUrl.toString(), max: 1 });
  try {
    const { rows } = await runtimePool.query<{ current_user: string; can_create_schema: boolean; can_create_database: boolean }>(
      `SELECT current_user,
       has_schema_privilege(current_user, 'public', 'CREATE') AS can_create_schema,
       has_database_privilege(current_user, current_database(), 'CREATE') AS can_create_database`);
    if (rows[0]?.current_user !== roleName || rows[0].can_create_schema || rows[0].can_create_database) {
      throw new Error("O papel foi criado, mas os privilégios precisam ser revisados");
    }
    await runtimePool.query("SELECT id FROM front LIMIT 1");
    console.log("Papel de aplicação restrito criado e validado; .env.local criado com permissões 0600.");
  } finally {
    await runtimePool.end();
  }
}

void main().catch((error: unknown) => {
  console.error("Provisionamento falhou:", error instanceof Error ? error.message : "erro desconhecido");
  process.exitCode = 1;
});
