import { Pool } from "pg";
export function createPool() {
  return new Pool({
    host: process.env.PGHOST || "127.0.0.1",
    port: Number(process.env.PGPORT || 5432),
    database: process.env.POSTGRES_DB || "aeris",
    user: process.env.POSTGRES_USER || "aeris",
    password: process.env.POSTGRES_PASSWORD,
    max: 5,
    connectionTimeoutMillis: 2000,
    query_timeout: 3000,
    statement_timeout: 3000,
  });
}
export async function waitForDatabase(pool: Pool) {
  for (let attempt = 1; attempt <= 15; attempt++) {
    try {
      await pool.query("SELECT id FROM searches LIMIT 0");
      return;
    } catch {
      if (attempt === 15)
        throw new Error(
          "Base indisponible ou table searches absente. Vérifiez PostgreSQL et database/init.sql.",
        );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
