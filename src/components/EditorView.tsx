import { useCallback, useEffect, useRef } from "react";
import { CloudOff, CheckCircle, Trash2 } from "lucide-react";
import { CATEGORIES } from "../types";
import type { SaveStatus } from "../types";
import { formatFullDate, countWords } from "../utils";

interface EditorViewProps {
  title: string;
  body: string;
  category: string;
  saveStatus: SaveStatus;
  isEditing: boolean;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSave: () => void;
  onSaveAndShare: () => void;
  onDelete: () => void;
}

export default function EditorView({
  title,
  body,
  category,
  saveStatus,
  isEditing,
  onTitleChange,
  onBodyChange,
  onCategoryChange,
  onSave,
  onSaveAndShare,
  onDelete,
}: EditorViewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const wordCount = countWords(body);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [body, autoResize]);

  // Focus title on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section className="max-w-full w-full pb-20">
      {/* Toolbar */}
      <div className="flex items-center justify-center gap-0 w-full py-4 pb-5 border-b border-[var(--color-border-light)] mb-8 sticky top-0 bg-[var(--color-bg)] z-10 mx-0 px-0">
        {/* Date */}
        <span className="w-full text-[14px] uppercase tracking-wider whitespace-nowrap text-gray-500 font-medium leading-tight">
          {formatFullDate(new Date())}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-3 w-fit">
          {/* Delete */}
          {isEditing && (
            <button
              onClick={onDelete}
              title="Delete post"
              className="flex items-center justify-center w-[34px] h-[34px] rounded-md text-[var(--color-stone-400)] transition-all duration-250 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Publish for Self — outline */}
          <button
            onClick={onSave}
            className="text-[14px] font-normal px-3 py-2 border-[1.5px] border-[var(--color-stone-300)] rounded-[999px] transition-all duration-250 leading-tight hover:border-[var(--color-stone-400)] w-fit whitespace-nowrap bg-transparent box-border text-[var(--color-stone-800)]"
          >
            {isEditing ? "Update" : "For Self"}
          </button>

          {/* Share — green */}
          <button
            onClick={onSaveAndShare}
            className="text-[14px] font-normal px-3 py-2 border-[1.5px] border-transparent bg-green-600 text-white rounded-full transition-all duration-250 leading-tight hover:bg-green-700 hover:-translate-y-px hover:shadow-lg w-fit whitespace-nowrap box-border"
          >
            Share
          </button>
        </div>
      </div>

      {/* Editor container */}
      <div>
        {/* Meta: blog type dropdown (left) + save status + word count (right) */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="category-select bg-white text-gray-800 border border-gray-200 rounded-full text-[14px] font-normal tracking-wide leading-tight cursor-pointer transition-colors duration-200 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 hover:border-gray-300"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <span
            className="flex items-center justify-start gap-4 text-[14px] font-normal text-[var(--color-stone-400)] leading-tight"
            title={saveStatus === "saved" ? "Saved" : "Unsaved changes"}
          >
            {saveStatus === "saved" ? (
              <CheckCircle className="w-[16px] h-[16px] shrink-0 text-[var(--color-stone-600)] transition-colors duration-300" />
            ) : (
              <CloudOff className="w-[16px] h-[16px] shrink-0 text-[var(--color-stone-400)] transition-colors duration-300" />
            )}
            {wordCount} word{wordCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Title */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Headline"
          autoComplete="off"
          className="w-full text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight mb-6 tracking-tight placeholder:text-gray-300 border-none outline-none bg-transparent"
          style={{ fontFamily: "var(--font-serif)" }}
        />

        {/* Body */}
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => {
            onBodyChange(e.target.value);
            autoResize();
          }}
          placeholder="Tell your story..."
          className="w-full text-[1.05rem] leading-[1.7] min-h-[50vh] resize-none tracking-wide placeholder:text-gray-300 border-none outline-none bg-transparent"
          style={{ fontFamily: "var(--font-sans)" }}
        />
      </div>
    </section>
  );
}
