import type { Post } from "../types";
import { formatDate, formatDateShort, excerpt, readingTime } from "../utils";

interface FeedViewProps {
  posts: Post[];
  onPostClick: (postId: string) => void;
}

export default function FeedView({ posts, onPostClick }: FeedViewProps) {
  const sorted = [...posts].sort((a, b) => b.updatedAt - a.updatedAt);

  if (sorted.length === 0) {
    return null;
  }

  const hero = sorted[0];
  const rest = sorted.slice(1);

  return (
    <section>
      {/* Hero post */}
      <div
        onClick={() => onPostClick(hero.id)}
        className="py-9 pb-7 border-b border-[var(--color-border)] cursor-pointer transition-opacity duration-250 hover:opacity-85"
      >
        <div className="text-[0.72rem] font-bold tracking-wider text-[var(--color-stone-600)] mb-2.5 leading-tight">
          {hero.category}
        </div>
        <h2
          className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight mb-3 max-w-[800px]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {hero.title || "Untitled"}
        </h2>
        <p className="text-base text-[var(--color-stone-500)] leading-relaxed max-w-[600px] mb-3">
          {excerpt(hero.body, 260)}
        </p>
        <div className="text-[0.72rem] text-[var(--color-stone-400)] tracking-wider leading-tight">
          {formatDate(hero.updatedAt)} &nbsp;·&nbsp; {readingTime(hero.body)}
        </div>
      </div>

      {/* Post grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          {rest.map((post, i) => (
            <div
              key={post.id}
              onClick={() => onPostClick(post.id)}
              className="animate-fade-in py-6 pr-6 pl-6 border-b border-[var(--color-border-light)] border-r border-r-[var(--color-border-light)] cursor-pointer transition-opacity duration-250 hover:opacity-75 max-md:border-r-0 max-md:pl-0 max-md:pr-0"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="text-[0.7rem] font-bold tracking-wider text-[var(--color-stone-600)] mb-1.5 leading-tight">
                {post.category}
              </div>
              <h3
                className="text-[1.2rem] font-bold leading-tight mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {post.title || "Untitled"}
              </h3>
              <p className="text-[0.88rem] text-[var(--color-stone-500)] leading-relaxed mb-2.5 line-clamp-3">
                {excerpt(post.body)}
              </p>
              <div className="text-[0.68rem] text-[var(--color-stone-400)] tracking-wider leading-tight">
                {formatDateShort(post.updatedAt)} &nbsp;·&nbsp;{" "}
                {readingTime(post.body)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
