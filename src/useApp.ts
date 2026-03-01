import { useCallback, useEffect, useRef, useState } from "react";
import type { Post, Tab, View, SaveStatus } from "./types";
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost as deletePostApi,
} from "./api";
import {
  loadPostsFromStorage,
  savePostsToStorage,
} from "./storage";
import { generateId } from "./utils";

export function useApp() {
  const [posts, setPosts] = useState<Post[]>(() => loadPostsFromStorage());
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const [view, setView] = useState<View>("editor");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("unsaved");
  const [loadError, setLoadError] = useState<string | null>(null);

  const editorTitle = useRef("");
  const editorBody = useRef("");
  const category = useRef("daily-thoughts");
  const [editorTitleState, setEditorTitleState] = useState("");
  const [editorBodyState, setEditorBodyState] = useState("");
  const [categoryState, setCategoryState] = useState("daily-thoughts");

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiAvailable = useRef<boolean | null>(null);
  const currentPostIdRef = useRef<string | null>(null);
  currentPostIdRef.current = currentPostId;

  // Keep refs in sync for use in callbacks
  editorTitle.current = editorTitleState;
  editorBody.current = editorBodyState;
  category.current = categoryState;

  const markDirty = useCallback(() => {
    setSaveStatus("unsaved");
  }, []);

  const markSaved = useCallback(() => {
    setSaveStatus("saved");
  }, []);

  // Load posts on mount: try API first, fall back to localStorage
  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    fetchPosts()
      .then((list) => {
        if (cancelled) return;
        apiAvailable.current = true;
        setPosts(list);
      })
      .catch(() => {
        if (cancelled) return;
        apiAvailable.current = false;
        setPosts(loadPostsFromStorage());
        setLoadError("Using local storage (database not connected).");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist to localStorage whenever posts change (fallback when API not used)
  useEffect(() => {
    if (apiAvailable.current === false) {
      savePostsToStorage(posts);
    }
  }, [posts]);

  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    if (tab === "stories") {
      setView("feed");
    } else if (tab === "new") {
      setCurrentPostId(null);
      setEditorTitleState("");
      setEditorBodyState("");
      setCategoryState("daily-thoughts");
      setSaveStatus("unsaved");
      setView("editor");
    }
  }, []);

  const openEditor = useCallback(
    (postId?: string) => {
      if (postId) {
        const post = posts.find((p) => p.id === postId);
        if (!post) return;
        setCurrentPostId(postId);
        setEditorTitleState(post.title);
        setEditorBodyState(post.body);
        setCategoryState(post.category);
        setSaveStatus("saved");
      } else {
        setCurrentPostId(null);
        setEditorTitleState("");
        setEditorBodyState("");
        setCategoryState("daily-thoughts");
        setSaveStatus("unsaved");
      }
      setView("editor");
    },
    [posts],
  );

  const savePost = useCallback(async () => {
    const title = editorTitle.current.trim();
    const body = editorBody.current.trim();
    const cat = category.current;
    if (!title && !body) {
      setSaveStatus("unsaved");
      return;
    }

    const payload = {
      title: title || "Untitled",
      body,
      category: cat,
    };

    if (apiAvailable.current === true) {
      try {
        if (currentPostId) {
          const updated = await updatePost(currentPostId, payload);
          setPosts((prev) =>
            prev.map((p) => (p.id === currentPostId ? updated : p)),
          );
        } else {
          const created = await createPost({
            ...payload,
            id: generateId(),
          });
          setCurrentPostId(created.id);
          setPosts((prev) => [created, ...prev]);
        }
        markSaved();
        return;
      } catch {
        apiAvailable.current = false;
      }
    }

    // Fallback: in-memory + localStorage
    setPosts((prev) => {
      if (currentPostId) {
        const next = prev.map((p) =>
          p.id === currentPostId
            ? {
                ...p,
                ...payload,
                updatedAt: Date.now(),
              }
            : p,
        );
        savePostsToStorage(next);
        return next;
      } else {
        const newPost: Post = {
          id: generateId(),
          ...payload,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setCurrentPostId(newPost.id);
        const next = [newPost, ...prev];
        savePostsToStorage(next);
        return next;
      }
    });
    markSaved();
  }, [currentPostId, markSaved]);

  const saveAndShare = useCallback(async () => {
    await savePost();
    const title = editorTitle.current.trim();
    const body = editorBody.current.trim();
    const post = currentPostId
      ? posts.find((p) => p.id === currentPostId)
      : posts[0];
    const sharePost = post ?? {
      id: "",
      title: title || "Untitled",
      body,
      category: category.current,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const shareText = `${sharePost.title}\n\n${sharePost.body}`;
    if (navigator.share) {
      navigator.share({ title: sharePost.title, text: shareText }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
  }, [savePost, currentPostId, posts]);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const title = editorTitle.current.trim();
      const body = editorBody.current.trim();
      const cat = category.current;
      const postId = currentPostIdRef.current;
      if (!title && !body) return;

      if (apiAvailable.current === true) {
        (async () => {
          try {
            if (postId) {
              const updated = await updatePost(postId, {
                title: title || "Untitled",
                body,
                category: cat,
              });
              setPosts((prev) =>
                prev.map((p) => (p.id === postId ? updated : p)),
              );
            } else {
              const created = await createPost({
                id: generateId(),
                title: title || "Untitled",
                body,
                category: cat,
              });
              setCurrentPostId(created.id);
              setPosts((prev) => [created, ...prev]);
            }
            markSaved();
          } catch {
            apiAvailable.current = false;
          }
        })();
        return;
      }

      setPosts((prev) => {
        if (postId) {
          return prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  title: title || "Untitled",
                  body,
                  category: cat,
                  updatedAt: Date.now(),
                }
              : p,
          );
        } else {
          const newPost: Post = {
            id: generateId(),
            title: title || "Untitled",
            body,
            category: cat,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setCurrentPostId(newPost.id);
          return [newPost, ...prev];
        }
      });
      markSaved();
    }, 2000);
  }, [currentPostId, markSaved]);

  const deletePost = useCallback(async () => {
    if (!currentPostId) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;

    if (apiAvailable.current === true) {
      try {
        await deletePostApi(currentPostId);
        setPosts((prev) => prev.filter((p) => p.id !== currentPostId));
        setCurrentPostId(null);
        setView("feed");
        setActiveTab("stories");
        return;
      } catch {
        apiAvailable.current = false;
      }
    }

    const next = posts.filter((p) => p.id !== currentPostId);
    setPosts(next);
    savePostsToStorage(next);
    setCurrentPostId(null);
    setView("feed");
    setActiveTab("stories");
  }, [currentPostId, posts]);

  const openReading = useCallback((postId: string) => {
    setCurrentPostId(postId);
    setView("reading");
  }, []);

  const handleTitleChange = useCallback(
    (value: string) => {
      setEditorTitleState(value);
      markDirty();
      triggerAutoSave();
    },
    [markDirty, triggerAutoSave],
  );

  const handleBodyChange = useCallback(
    (value: string) => {
      setEditorBodyState(value);
      markDirty();
      triggerAutoSave();
    },
    [markDirty, triggerAutoSave],
  );

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryState(value);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (view === "editor") {
          e.preventDefault();
          void savePost();
        }
      }
      if (e.key === "Escape") {
        if (view === "editor" || view === "reading") {
          switchTab("stories");
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        switchTab("new");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [view, savePost, switchTab]);

  const currentPost = currentPostId
    ? posts.find((p) => p.id === currentPostId)
    : null;
  const isEditing = !!currentPostId;

  return {
    posts,
    currentPost,
    activeTab,
    view,
    saveStatus,
    isEditing,
    editorTitle: editorTitleState,
    editorBody: editorBodyState,
    category: categoryState,
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
  };
}
