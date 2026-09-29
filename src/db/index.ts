import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Lazy initialization keeps builds and public pages independent of production credentials.
let pool: Pool | undefined;
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) console.warn("Aviso: DATABASE_URL não configurada no servidor.");
  pool ??= new Pool({ connectionString: url || "postgresql://dummy:dummy@localhost/dummy", max: 2, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 });
  return drizzle(pool, { schema });
}
