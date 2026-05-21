"use client";

import type { SavedBookmark } from "@/lib/types";

const STORAGE_KEY = "minerva_library_bookmarks";

export function loadBookmarks(): SavedBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedBookmark[]) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(bm: Omit<SavedBookmark, "id" | "createdAt">): SavedBookmark {
  const bookmarks = loadBookmarks();
  const newBm: SavedBookmark = {
    ...bm,
    id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newBm, ...bookmarks];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newBm;
}

export function removeBookmark(id: string): void {
  const bookmarks = loadBookmarks().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function getBookmarksByBook(bookId: string): SavedBookmark[] {
  return loadBookmarks().filter((b) => b.bookId === bookId);
}

export function getBookmarksByChapter(bookId: string, chapterId: string): SavedBookmark[] {
  return loadBookmarks().filter((b) => b.bookId === bookId && b.chapterId === chapterId);
}
