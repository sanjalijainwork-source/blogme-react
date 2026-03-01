import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureTable, getDb } from "../db";

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
  const id = req.query.id as string;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!id) {
    res.status(400).json({ error: "Missing post id" });
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
    const rs = await db.execute({
      sql: "SELECT id, title, body, category, created_at, updated_at FROM posts WHERE id = ?",
      args: [id],
    });
    if (rs.rows.length === 0) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.status(200).json(rowToPost(rs.rows[0] as Parameters<typeof rowToPost>[0]));
    return;
  }

  if (req.method === "PUT") {
    const body = req.body as { title?: string; body?: string; category?: string };
    const title = typeof body?.title === "string" ? body.title : "Untitled";
    const postBody = typeof body?.body === "string" ? body.body : "";
    const category =
      typeof body?.category === "string" ? body.category : "daily-thoughts";
    const now = Date.now();

    const rs = await db.execute({
      sql: "SELECT created_at FROM posts WHERE id = ?",
      args: [id],
    });
    if (rs.rows.length === 0) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    const createdAt = rs.rows[0].created_at as number;

    await db.execute({
      sql: `UPDATE posts SET title = ?, body = ?, category = ?, updated_at = ? WHERE id = ?`,
      args: [title, postBody, category, now, id],
    });

    res.status(200).json({
      id,
      title,
      body: postBody,
      category,
      createdAt,
      updatedAt: now,
    });
    return;
  }

  if (req.method === "DELETE") {
    const rs = await db.execute({
      sql: "DELETE FROM posts WHERE id = ?",
      args: [id],
    });
    if (rs.rowsAffected === 0) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.status(204).end();
  }
}
