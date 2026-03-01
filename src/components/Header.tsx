import type { Tab } from "../types";

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onNewPost: () => void;
}

export default function Header({
  activeTab,
  onTabChange,
  onNewPost,
}: HeaderProps) {
  return (
    <header className="px-6 pt-6">
      {/* Top row: title + write button */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex flex-col flex-1">
          <h1
            className="text-[32px] font-medium leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span>Blog</span>
            <span>Me</span>
          </h1>
          <p className="text-[0.82rem] text-[var(--color-stone-500)] tracking-wide mt-0.5 font-normal leading-tight">
            My thoughts over the days
          </p>
        </div>

        {/* Write button — hidden on editor tab; outline to stand out */}
        {activeTab !== "new" && (
          <button
            onClick={onNewPost}
            className="text-[0.85rem] font-semibold tracking-wide py-1.5 px-3 rounded-full border-[1.5px] border-stone-500 text-[var(--color-stone-700)] bg-stone-100 transition-all duration-250 leading-tight hover:bg-stone-200 hover:border-stone-600"
          >
            Write
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--color-border)]" />

      {/* Tabs */}
      <nav className="flex justify-start items-start gap-1.5 py-3 pb-3 h-fit">
        <button
          onClick={() => onTabChange("new")}
          className={`text-[0.85rem] font-medium tracking-wide px-5 py-2 rounded-full transition-all duration-250 leading-tight ${
            activeTab === "new"
              ? "text-white bg-[var(--color-accent)]"
              : "text-[var(--color-stone-500)] hover:text-[var(--color-text)] hover:bg-black/[0.04]"
          }`}
        >
          Begin a New Story
        </button>
        <button
          onClick={() => onTabChange("stories")}
          className={`text-[0.85rem] font-medium tracking-wide px-5 py-2 rounded-full transition-all duration-250 leading-tight ${
            activeTab === "stories"
              ? "text-white bg-[var(--color-accent)]"
              : "text-[var(--color-stone-500)] hover:text-[var(--color-text)] hover:bg-black/[0.04]"
          }`}
        >
          My Stories
        </button>
      </nav>
    </header>
  );
}
