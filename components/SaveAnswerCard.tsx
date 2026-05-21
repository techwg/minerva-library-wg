"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface SaveAnswerCardProps {
  chapterLabel: string;
  onSave: () => void;
}

export function SaveAnswerCard({ chapterLabel, onSave }: SaveAnswerCardProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onSave();
  };

  if (saved) {
    return (
      <div
        className="flex items-start gap-3 px-3 py-2.5 rounded-xl border"
        style={{
          background: "var(--book-accent-soft)",
          borderColor: "var(--book-accent)",
        }}
      >
        <BookmarkCheck
          size={14}
          className="flex-shrink-0 mt-0.5"
          style={{ color: "var(--book-accent-deep)" }}
        />
        <div>
          <p className="text-[12px] font-black" style={{ color: "var(--book-accent-deep)" }}>
            책갈피에 저장됨
          </p>
          <p className="text-[11px] text-ink-500 mt-0.5">
            {chapterLabel}로 다시 오면 답변이 그대로 펼쳐져요.
          </p>
          <button
            onClick={() => setSaved(false)}
            className="mt-1 text-[11px] text-ink-400 underline hover:text-ink-600"
          >
            실행 취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSave}
      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border border-dashed text-left transition-all hover:border-opacity-80"
      style={{
        borderColor: "var(--book-accent)",
        background: "transparent",
      }}
    >
      <Bookmark
        size={14}
        className="flex-shrink-0 mt-0.5"
        style={{ color: "var(--book-accent)" }}
      />
      <div>
        <p className="text-[12px] font-black" style={{ color: "var(--book-accent-deep)" }}>
          이 답변, 책갈피에 저장
        </p>
        <p className="text-[11px] text-ink-500 mt-0.5">
          맘에 들면 저장해요. {chapterLabel}으로 다시 오면 자동으로 펼쳐져요.
        </p>
      </div>
    </button>
  );
}
