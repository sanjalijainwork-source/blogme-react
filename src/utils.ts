export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Strip HTML tags for word count / excerpt */
export function stripHtml(html: string): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body?.textContent ?? "").trim();
}

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  const plain = text.includes("<") ? stripHtml(text) : text;
  return plain.trim().split(/\s+/).filter(Boolean).length;
}

export function excerpt(text: string, maxLen = 180): string {
  if (!text) return "";
  const plain = text.includes("<") ? stripHtml(text) : text;
  const clean = plain.replace(/\n+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

export function readingTime(text: string): string {
  const words = countWords(text);
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

export function textToHTML(text: string): string {
  if (!text) return "";
  if (text.includes("<") && text.includes(">")) return text;
  return text
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
