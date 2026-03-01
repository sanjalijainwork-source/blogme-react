import type { Post } from "./types";

const STORAGE_KEY = "dailymuse_posts";

export function loadPostsFromStorage(): Post[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePostsToStorage(posts: Post[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}
