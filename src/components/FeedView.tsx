import type { Post } from "../types";
import { formatDate, excerpt, readingTime } from "../utils";

interface FeedViewProps {
  posts: Post[];
  onPostClick: (postId: string) => void;
}

export default function FeedView({ posts, onPostClick }: FeedViewProps) {
  const sorted = [...posts].sort((a, b) => b.updatedAt - a.updatedAt);

  if (sorted.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-0.5">
      {sorted.map((post) => (
        <article
          key={post.id}
          onClick={() => onPostClick(post.id)}
          className="block py-2 border-b border-[var(--color-border-light)] cursor-pointer transition-opacity duration-250 hover:opacity-85"
        >
          <h2
            className="text-[28px] font-semibold leading-tight mb-0.5 tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {post.title || "Untitled"}
          </h2>
          <p className="text-[0.9rem] text-[var(--color-stone-500)] leading-relaxed mb-2 line-clamp-2">
            {excerpt(post.body, 160)}
          </p>
          <div className="text-[0.72rem] text-[var(--color-stone-400)] tracking-wide leading-tight">
            {formatDate(post.updatedAt)} &nbsp;·&nbsp; {readingTime(post.body)}
          </div>
        </article>
      ))}
    </section>
  );
}
