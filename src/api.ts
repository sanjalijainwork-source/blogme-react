import type { Post } from "./types";

const API_BASE = "/api";

async function request<T>(
  path: string,
  options?: { method?: string; body?: Record<string, unknown> }
): Promise<T> {
  const { method = "GET", body } = options ?? {};
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body != null ? { "Content-Type": "application/json" } : undefined,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function fetchPosts(): Promise<Post[]> {
  return request<Post[]>("/posts");
}

export async function createPost(post: {
  id?: string;
  title: string;
  body: string;
  category: string;
}): Promise<Post> {
  return request<Post>("/posts", {
    method: "POST",
    body: {
      id: post.id,
      title: post.title,
      body: post.body,
      category: post.category,
    },
  });
}

export async function updatePost(
  id: string,
  post: { title: string; body: string; category: string }
): Promise<Post> {
  return request<Post>(`/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: post,
  });
}

export async function deletePost(id: string): Promise<void> {
  return request<void>(`/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
