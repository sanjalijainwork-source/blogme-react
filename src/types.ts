export interface Post {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}

export type View = "feed" | "editor" | "reading";
export type Tab = "new" | "stories";
export type SaveStatus = "saved" | "unsaved";

export const CATEGORIES = [
  { value: "daily-thoughts", label: "Daily Thoughts" },
  { value: "learnings", label: "Learnings" },
  { value: "work", label: "Work" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];
