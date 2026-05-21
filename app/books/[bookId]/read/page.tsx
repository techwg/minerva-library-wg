"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ImmersiveReader } from "@/components/ImmersiveReader";
import { getBook } from "@/data/books";
import { loadBookmarks, saveBookmark, getBookmarksByBook } from "@/lib/bookmarks";
import type { ChapterContent, SavedBookmark } from "@/lib/types";

async function fetchChapter(bookId: string, chapterId: string): Promise<ChapterContent | null> {
  try {
    const res = await fetch(`/content/books/${bookId}/${chapterId}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function ReaderPage() {
  const params = useParams<{ bookId: string }>();
  const searchParams = useSearchParams();
  const bookId = params.bookId;
  const book = getBook(bookId);

  const [activeChapterId, setActiveChapterId] = useState<string>(() =>
    searchParams.get("ch") ?? book?.chapters[0]?.id ?? "",
  );
  const [chapterContent, setChapterContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);

  useEffect(() => { if (book) setBookmarks(getBookmarksByBook(book.id)); }, [book]);

  useEffect(() => {
    if (!book || !activeChapterId) return;
    setLoading(true);
    fetchChapter(book.id, activeChapterId).then((c) => {
      setChapterContent(c);
      setLoading(false);
    });
  }, [book, activeChapterId]);

  const handleSaveBookmark = useCallback((bm: Omit<SavedBookmark, "id" | "createdAt">) => {
    const saved = saveBookmark(bm);
    setBookmarks((prev) => [saved, ...prev]);
  }, []);

  const handleBookmarkClick = useCallback((bm: SavedBookmark) => {
    setActiveChapterId(bm.chapterId);
  }, []);

  if (!book) {
    return (
      <div className="flex items-center justify-center h-[100dvh] text-ink-500 text-[15px] font-bold">
        책을 찾을 수 없습니다.
      </div>
    );
  }

  const chapterIdx = book.chapters.findIndex((c) => c.id === activeChapterId);
  const hasPrev = chapterIdx > 0;
  const hasNext = chapterIdx < book.chapters.length - 1;

  return (
    <ImmersiveReader
      book={book}
      chapter={chapterContent}
      loading={loading}
      bookmarks={bookmarks}
      activeChapterId={activeChapterId}
      onChapterSelect={(id) => { setActiveChapterId(id); window.scrollTo({ top: 0 }); }}
      onSaveBookmark={handleSaveBookmark}
      onBookmarkClick={handleBookmarkClick}
      onPrevChapter={() => { if (hasPrev) setActiveChapterId(book.chapters[chapterIdx - 1].id); }}
      onNextChapter={() => { if (hasNext) setActiveChapterId(book.chapters[chapterIdx + 1].id); }}
      hasPrev={hasPrev}
      hasNext={hasNext}
    />
  );
}
