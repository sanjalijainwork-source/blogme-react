import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureTable, getDb } from "./db";

function rowToPost(row: {
  id: string;
  title: string;
  body: string;
  category: string;
  created_at: number;
  updated_at: number;
}) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let db: Awaited<ReturnType<typeof getDb>>;
  try {
    await ensureTable();
    db = await getDb();
  } catch (e) {
    console.error("DB init error", e);
    res.status(500).json({ error: "Database unavailable" });
    return;
  }

  if (req.method === "GET") {
    const rs = await db.execute(
      "SELECT id, title, body, category, created_at, updated_at FROM posts ORDER BY updated_at DESC"
    );
    const posts = rs.rows.map((r) =>
      rowToPost(r as Parameters<typeof rowToPost>[0])
    );
    res.status(200).json(posts);
    return;
  }

  if (req.method === "POST") {
    const body = req.body as {
      id?: string;
      title?: string;
      body?: string;
      category?: string;
    };
    const id =
      typeof body?.id === "string" && body.id
        ? body.id
        : crypto.randomUUID();
    const title = typeof body?.title === "string" ? body.title : "Untitled";
    const postBody = typeof body?.body === "string" ? body.body : "";
    const category =
      typeof body?.category === "string" ? body.category : "daily-thoughts";
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO posts (id, title, body, category, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, title, postBody, category, now, now],
    });

    res.status(201).json({
      id,
      title,
      body: postBody,
      category,
      createdAt: now,
      updatedAt: now,
    });
  }
}
