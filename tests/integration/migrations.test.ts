import { afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const database = new PGlite();
afterAll(async () => database.close());

describe("migrações versionadas PostgreSQL", () => {
  it("aplica as migrações em ordem e exige convite explícito para login", async () => {
    const journal = JSON.parse(readFileSync(resolve(process.cwd(), "drizzle/meta/_journal.json"), "utf8")) as { entries: { tag: string }[] };
    for (const migration of journal.entries) {
      const sql = readFileSync(resolve(process.cwd(), "drizzle", `${migration.tag}.sql`), "utf8");
      for (const statement of sql.split("--> statement-breakpoint")) {
        if (statement.trim()) await database.exec(statement);
      }
    }
    await database.query('insert into "user" ("id", "email") values ($1, $2)', ["person-1", "member@example.org"]);
    const { rows } = await database.query<{ enabled: boolean }>('select "enabled" from "user" where "id" = $1', ["person-1"]);
    expect(rows[0].enabled).toBe(false);
    await database.query('insert into "project_membership" ("id", "userId", "role") values ($1, $2, $3)', ["m1", "person-1", "MEMBER"]);
    await expect(database.query('insert into "project_membership" ("id", "userId", "role") values ($1, $2, $3)', ["m2", "person-1", "PRODUCT_OWNER"]))
      .rejects.toThrow();
    const columns = await database.query('select * from "workflow_column"');
    expect(columns.rows).toHaveLength(0);
  }, 20000);
});
