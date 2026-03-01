import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Use Turso when env is set; otherwise local SQLite file (for dev)
export const db = createClient(
  url
    ? { url, authToken: authToken ?? undefined }
    : { url: "file:./blog.db" }
);

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
  await db.execute(INIT_SQL);
  initialized = true;
}
