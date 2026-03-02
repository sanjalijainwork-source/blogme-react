import { Check } from "lucide-react";
import type { Post } from "../types";
import { formatFullDate, countWords, textToHTML, stripHtml } from "../utils";

interface ReadingViewProps {
  post: Post;
  onEdit: () => void;
}

function hasContent(body: string): boolean {
  if (!body || !body.trim()) return false;
  const plain = body.includes("<") ? stripHtml(body) : body;
  return plain.trim().length > 0;
}

export default function ReadingView({ post, onEdit }: ReadingViewProps) {
  const showBody = hasContent(post.body);

  const wordCount = countWords(post.body);

  return (
    <section className="max-w-full w-full pb-12">
      {/* Date + save + words row — matches editor UI */}
      <div className="flex items-center justify-between gap-2 mb-5">
        <span className="text-[14px] uppercase tracking-wider whitespace-nowrap text-gray-500 font-medium leading-tight">
          {formatFullDate(new Date(post.updatedAt))}
        </span>
        <span className="flex items-center justify-start gap-2 text-[14px] font-normal text-[var(--color-stone-400)] leading-tight">
          <Check className="w-[16px] h-[16px] shrink-0 text-[var(--color-stone-600)]" />
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
      </div>

      <article>
        <h1
          className="text-[clamp(2rem,5vw,3rem)] font-bold leading-tight mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {post.title || "Untitled"}
        </h1>

        {showBody && (
          <div
            className="reading-body text-[1.08rem] leading-[1.75] tracking-wide [&_p]:mb-[1.5em] [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
            style={{ fontFamily: "var(--font-sans)" }}
            dangerouslySetInnerHTML={{ __html: textToHTML(post.body) }}
          />
        )}
        <div className="mt-4">
          <button onClick={onEdit} className="text-[0.9rem] font-medium text-[var(--color-stone-500)] hover:text-[var(--color-text)] transition-colors">
            Edit
          </button>
        </div>
      </article>
    </section>
  );
}
