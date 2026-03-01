import { useApp } from "./useApp";
import Header from "./components/Header";
import FeedView from "./components/FeedView";
import EditorView from "./components/EditorView";
import ReadingView from "./components/ReadingView";
import Footer from "./components/Footer";

export default function App() {
  const {
    posts,
    currentPost,
    activeTab,
    view,
    saveStatus,
    isEditing,
    editorTitle,
    editorBody,
    category,
    loadError,
    switchTab,
    openEditor,
    openReading,
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
        onNewPost={() => openEditor()}
      />

      <main className="px-6 min-h-[60vh] w-full">
        {view === "feed" && (
          <FeedView posts={posts} onPostClick={openReading} />
        )}

        {view === "editor" && (
          <EditorView
            title={editorTitle}
            body={editorBody}
            category={category}
            saveStatus={saveStatus}
            isEditing={isEditing}
            onTitleChange={handleTitleChange}
            onBodyChange={handleBodyChange}
            onCategoryChange={handleCategoryChange}
            onSave={savePost}
            onSaveAndShare={saveAndShare}
            onDelete={deletePost}
          />
        )}

        {view === "reading" && currentPost && (
          <ReadingView
            post={currentPost}
            onEdit={() => openEditor(currentPost.id)}
          />
        )}
      </main>

      <Footer loadError={loadError} />
    </>
  );
}
