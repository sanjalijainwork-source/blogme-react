import { useCallback, useEffect, useRef, useState } from "react";
import { CloudOff, Check, Trash2, Bold, Italic, Link2, Quote } from "lucide-react";
import { CATEGORIES } from "../types";
import type { SaveStatus } from "../types";
import { formatFullDate, countWords } from "../utils";

interface EditorViewProps {
  title: string;
  body: string;
  category: string;
  saveStatus: SaveStatus;
  savedAction: "self" | "share" | null;
  canDelete: boolean;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSave: () => void;
  onSaveAndShare: () => void;
  onDelete: () => void;
  isViewMode?: boolean;
  onEnterEditMode?: () => void;
  onExitEditMode?: () => void;
}

export default function EditorView({
  title,
  body,
  category,
  saveStatus,
  savedAction,
  canDelete,
  onTitleChange,
  onBodyChange,
  onCategoryChange,
  onSave,
  onSaveAndShare,
  onDelete,
  isViewMode = false,
  onEnterEditMode,
  onExitEditMode,
}: EditorViewProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbar, setToolbar] = useState<{ top: number; left: number } | null>(null);
  const wordCount = countWords(body);

  const isInternalChange = useRef(false);
  useEffect(() => {
    if (!bodyRef.current || isInternalChange.current) return;
    if (bodyRef.current.innerHTML !== body) {
      bodyRef.current.innerHTML = body || "";
    }
  }, [body]);

  const emitBodyChange = useCallback(() => {
    if (!bodyRef.current) return;
    isInternalChange.current = true;
    onBodyChange(bodyRef.current.innerHTML);
    requestAnimationFrame(() => {
      isInternalChange.current = false;
    });
  }, [onBodyChange]);

  const execFormat = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value ?? undefined);
    bodyRef.current?.focus();
    emitBodyChange();
  }, [emitBodyChange]);

  const updateToolbarPosition = useCallback(() => {
    const sel = document.getSelection();
    const body = bodyRef.current;
    if (!body || !sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setToolbar(null);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!body.contains(range.commonAncestorContainer)) {
      setToolbar(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    const toolbarHeight = 40;
    const gap = 8;
    setToolbar({
      top: rect.top - toolbarHeight - gap,
      left: rect.left + rect.width / 2,
    });
  }, []);

  const hideToolbar = useCallback(() => {
    setToolbar(null);
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const onSelect = () => requestAnimationFrame(updateToolbarPosition);
    const onDocMouseDown = (e: MouseEvent) => {
      if (toolbarRef.current?.contains(e.target as Node)) return;
      hideToolbar();
    };
    body.addEventListener("mouseup", onSelect);
    body.addEventListener("keyup", onSelect);
    document.addEventListener("mousedown", onDocMouseDown);
    return () => {
      body.removeEventListener("mouseup", onSelect);
      body.removeEventListener("keyup", onSelect);
      document.removeEventListener("mousedown", onDocMouseDown);
    };
  }, [updateToolbarPosition, hideToolbar]);

  const handleToolbarAction = useCallback((fn: () => void) => {
    fn();
    setToolbar(null);
  }, []);

  const handleLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) execFormat("createLink", url);
    setToolbar(null);
  }, [execFormat]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          document.execCommand("insertHTML", false, `<img src="${dataUrl}" alt="Pasted" style="max-width:100%;height:auto;" />`);
          emitBodyChange();
        };
        reader.readAsDataURL(file);
        return;
      }
    }
    setTimeout(emitBodyChange, 0);
  }, [emitBodyChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      document.execCommand("insertHTML", false, `<img src="${dataUrl}" alt="Dropped" style="max-width:100%;height:auto;" />`);
      emitBodyChange();
    };
    reader.readAsDataURL(file);
  }, [emitBodyChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section className="max-w-full w-full pb-20">
      {/* Toolbar: view mode = Edit + tick + words only; edit mode = full actions */}
      <div className="flex items-center justify-between gap-4 w-full py-3 border-b border-[var(--color-border-light)] mb-4 sticky top-0 bg-[var(--color-bg)] z-10">
        {!isViewMode && (
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-[14px] font-normal tracking-wide leading-tight min-w-0"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        )}
        {isViewMode && (
          <span className="text-[14px] uppercase tracking-wider whitespace-nowrap text-gray-500 font-medium leading-tight">
            {formatFullDate(new Date())}
          </span>
        )}
        <div className="flex items-center gap-4">
          {isViewMode ? (
            <>
              <span className="flex items-center gap-2 text-[14px] text-[var(--color-stone-400)]">
                <Check className="w-[16px] h-[16px] shrink-0 text-[var(--color-stone-600)]" title="Published" />
                {wordCount} word{wordCount !== 1 ? "s" : ""}
              </span>
              {onEnterEditMode && (
                <button
                  onClick={onEnterEditMode}
                  className="flex items-center gap-1.5 text-[14px] font-normal px-4 py-1.5 border-[1.5px] border-[var(--color-stone-300)] rounded-[999px] transition-all duration-250 leading-tight hover:border-[var(--color-stone-400)] w-fit whitespace-nowrap bg-transparent box-border text-[var(--color-stone-800)]"
                >
                  Edit
                </button>
              )}
            </>
          ) : (
            <>
              {canDelete && (
                <button
                  onClick={onDelete}
                  title="Delete post"
                  className="flex items-center justify-center w-[34px] h-[34px] rounded-md text-[var(--color-stone-400)] transition-all duration-250 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {onExitEditMode && canDelete && (
                <button
                  onClick={onExitEditMode}
                  className="flex items-center gap-1.5 text-[14px] font-normal px-4 py-1.5 border-[1.5px] border-[var(--color-stone-300)] rounded-[999px] transition-all duration-250 leading-tight hover:border-[var(--color-stone-400)] w-fit whitespace-nowrap bg-transparent box-border text-[var(--color-stone-800)]"
                >
                  View
                </button>
              )}
              <button
                onClick={onSave}
                className="flex items-center gap-1.5 text-[14px] font-normal px-4 py-1.5 border-[1.5px] border-[var(--color-stone-300)] rounded-[999px] transition-all duration-250 leading-tight hover:border-[var(--color-stone-400)] w-fit whitespace-nowrap bg-transparent box-border text-[var(--color-stone-800)]"
              >
                {savedAction === "self" ? <Check className="w-4 h-4 text-[var(--color-stone-600)] shrink-0" /> : null}
                For Self
              </button>
              <button
                onClick={onSaveAndShare}
                className="flex items-center gap-1.5 text-[14px] font-normal px-4 py-1.5 border-[1.5px] border-transparent bg-green-600 text-white rounded-full transition-all duration-250 leading-tight hover:bg-green-700 hover:-translate-y-px hover:shadow-lg w-fit whitespace-nowrap box-border"
              >
                {savedAction === "share" ? <Check className="w-4 h-4 text-white shrink-0" /> : null}
                Share
              </button>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Date (left) + word count + save status (right) — only in edit mode */}
      {!isViewMode && (
      <div className="flex items-center justify-between gap-2 mb-5">
        <span className="text-[14px] uppercase tracking-wider whitespace-nowrap text-gray-500 font-medium leading-tight">
          {formatFullDate(new Date())}
        </span>
        <span
          className="flex items-center justify-start gap-2 text-[14px] font-normal text-[var(--color-stone-400)] leading-tight"
          title={saveStatus === "saved" ? "Saved" : "Unsaved changes"}
        >
          {saveStatus === "saved" ? (
            <Check className="w-[16px] h-[16px] shrink-0 text-[var(--color-stone-600)]" />
          ) : (
            <CloudOff className="w-[16px] h-[16px] shrink-0 text-[var(--color-stone-400)]" />
          )}
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
      </div>
      )}

      {/* Title */}
      {isViewMode ? (
        <h1
          className="w-full text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title || "Untitled"}
        </h1>
      ) : (
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
      )}

      {/* Body: contenteditable when editing, read-only when viewing */}
      <div
        ref={bodyRef}
        contentEditable={!isViewMode}
        suppressContentEditableWarning
        onInput={isViewMode ? undefined : emitBodyChange}
        onPaste={isViewMode ? undefined : handlePaste}
        onDrop={isViewMode ? undefined : handleDrop}
        onDragOver={isViewMode ? undefined : handleDragOver}
        data-placeholder="Tell your story... (you can paste or drop images)"
        className="w-full text-[1.05rem] leading-[1.7] min-h-[50vh] outline-none tracking-wide empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
        style={{ fontFamily: "var(--font-sans)" }}
      />

      {/* Floating format toolbar — only when editing */}
      {!isViewMode && toolbar && (
        <div
          ref={toolbarRef}
          className="fixed z-50 flex items-center gap-0 py-1 px-1 rounded-lg bg-white border border-[var(--color-stone-200)] shadow-lg"
          style={{
            top: toolbar.top,
            left: toolbar.left,
            transform: "translate(-50%, 0)",
          }}
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleToolbarAction(() => execFormat("bold"));
            }}
            className="p-2 rounded hover:bg-stone-100 transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4 text-[var(--color-stone-700)]" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleToolbarAction(() => execFormat("italic"));
            }}
            className="p-2 rounded hover:bg-stone-100 transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4 text-[var(--color-stone-700)]" />
          </button>
          <div className="w-px h-5 bg-[var(--color-stone-200)] mx-0.5" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleToolbarAction(handleLink);
            }}
            className="p-2 rounded hover:bg-stone-100 transition-colors"
            title="Link"
          >
            <Link2 className="w-4 h-4 text-[var(--color-stone-700)]" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleToolbarAction(() => execFormat("formatBlock", "blockquote"));
            }}
            className="p-2 rounded hover:bg-stone-100 transition-colors"
            title="Quote"
          >
            <Quote className="w-4 h-4 text-[var(--color-stone-700)]" />
          </button>
        </div>
      )}
    </section>
  );
}
