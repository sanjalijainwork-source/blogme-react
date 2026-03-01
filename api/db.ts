// Turso/Vercel: use web client (fetch-based). Env vars can come from Vercel Turso integration.
const url =
  process.env.TURSO_DATABASE_URL ||
  process.env.LIBSQL_URL ||
  process.env.DATABASE_URL;
const authToken =
  process.env.TURSO_AUTH_TOKEN ||
  process.env.LIBSQL_AUTH_TOKEN;

let dbInstance: Awaited<ReturnType<typeof getDb>> | null = null;

async function getDb() {
  if (dbInstance) return dbInstance;
  if (url && (url.startsWith("libsql:") || url.startsWith("https:"))) {
    const { createClient } = await import("@libsql/client/web");
    dbInstance = createClient({
      url,
      authToken: authToken ?? undefined,
    });
  } else {
    const { createClient } = await import("@libsql/client");
    dbInstance = createClient({ url: "file:./blog.db" });
  }
  return dbInstance;
}

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`;

let initialized = false;

export async function ensureTable(): Promise<void> {
  if (initialized) return;
  const db = await getDb();
  await db.execute(INIT_SQL);
  initialized = true;
}

export { getDb };
