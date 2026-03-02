import { useApp } from "./useApp";
import Header from "./components/Header";
import FeedView from "./components/FeedView";
import EditorView from "./components/EditorView";
import Footer from "./components/Footer";

export default function App() {
  const {
    posts,
    activeTab,
    view,
    saveStatus,
    savedAction,
    isViewMode,
    openedForEdit,
    enterEditMode,
    exitEditMode,
    editorTitle,
    editorBody,
    category,
    loadError,
    switchTab,
    openEditor,
    savePost,
    saveAndShare,
    deletePost,
    handleTitleChange,
    handleBodyChange,
    handleCategoryChange,
  } = useApp();

  return (
    <>
      <Header
        activeTab={activeTab}
        onTabChange={switchTab}
        onNewPost={() => switchTab("new")}
      />

      <main className="px-6 min-h-[60vh] w-full">
        {view === "feed" && (
          <FeedView posts={posts} onPostClick={(id) => openEditor(id)} />
        )}

        {view === "editor" && (
          <EditorView
            title={editorTitle}
            body={editorBody}
            category={category}
            saveStatus={saveStatus}
            savedAction={savedAction}
            canDelete={openedForEdit}
            onTitleChange={handleTitleChange}
            onBodyChange={handleBodyChange}
            onCategoryChange={handleCategoryChange}
            onSave={() => savePost("self")}
            onSaveAndShare={saveAndShare}
            onDelete={deletePost}
            isViewMode={isViewMode}
            onEnterEditMode={enterEditMode}
            onExitEditMode={exitEditMode}
          />
        )}

      </main>

      <Footer loadError={loadError} />
    </>
  );
}
