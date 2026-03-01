import { PenLine } from "lucide-react";
import type { Post } from "../types";
import { formatDate, countWords, readingTime, textToHTML } from "../utils";

interface ReadingViewProps {
  post: Post;
  onEdit: () => void;
}

export default function ReadingView({ post, onEdit }: ReadingViewProps) {
  return (
    <section className="max-w-full px-6 pb-20">
      {/* Toolbar */}
      <div className="flex items-center justify-end py-4 pb-5 border-b border-[var(--color-border-light)] mb-10">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-[0.82rem] font-medium text-[var(--color-stone-500)] transition-colors duration-250 leading-tight hover:text-[var(--color-text)]"
        >
          <PenLine className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </div>

      {/* Article */}
      <article>
        <div className="text-[0.75rem] font-bold tracking-wider text-[var(--color-stone-600)] mb-3.5 leading-tight">
          {post.category}
        </div>
        <h1
          className="text-[clamp(2rem,5vw,3rem)] font-bold leading-tight mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {post.title || "Untitled"}
        </h1>
        <div className="text-[0.78rem] text-[var(--color-stone-400)] pb-6 mb-7 border-b border-[var(--color-border-light)] tracking-wide leading-tight">
          {formatDate(post.createdAt)} &nbsp;·&nbsp; {countWords(post.body)}{" "}
          words &nbsp;·&nbsp; {readingTime(post.body)}
        </div>
        <div
          className="reading-body text-[1.08rem] leading-[1.75] tracking-wide [&_p]:mb-[1.5em]"
          style={{ fontFamily: "var(--font-sans)" }}
          dangerouslySetInnerHTML={{ __html: textToHTML(post.body) }}
        />
      </article>
    </section>
  );
}
