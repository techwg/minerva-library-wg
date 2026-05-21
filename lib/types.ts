export type Tradition = "eastern" | "western";

export type BookTier = "free" | "premium";
export type BookStatus = "available" | "preparing";
export type BookPalette = "vermilion" | "gold";
export type OriginalLangCode = "hanja" | "greek" | "latin" | "english";

export interface Sage {
  id: string;
  name: { ko: string; en: string };
  hanja: string;
  era: string;
  region: string;
  tradition: Tradition;
  color: string;
  books: number;
  bookTitle: string;
  blurb: string;
  coverGlyph: string;
  pending?: string;
  featured?: boolean;
  /** /library/portraits/{id}.png 가 있으면 글리프 대신 표시 */
  portrait?: string;
}

export interface BookChapter {
  id: string;
  number: string;
  title: string;
  titleOriginal?: string;
  count?: number;
}

export interface Book {
  id: string;
  personaId: string;
  title: { ko: string; original: string; en?: string };
  subtitle?: string;
  author: string;
  era: string;
  language: string;
  hasTranslation: boolean;
  license: string;
  source: string;
  tier: BookTier;
  status: BookStatus;
  palette: BookPalette;
  coverGlyph: string;
  chapters: BookChapter[];
}

export interface Paragraph {
  id: string;
  original: string;
  originalEn?: string;
  ko: string;
  highlight?: boolean;
}

export interface ChapterContent {
  bookId: string;
  chapterId: string;
  bookTitle: string;
  bookOriginal: string;
  author: string;
  persona: string;
  palette: BookPalette;
  number: string;
  chapterLabel: string;
  title: string;
  titleOriginal?: string;
  originalLang: string;
  originalLangCode: OriginalLangCode;
  originalLangs: { code: OriginalLangCode; label: string }[];
  sourceCredit: string;
  englishCredit?: string;
  breadcrumb: string[];
  intro: string;
  paragraphs: Paragraph[];
}

export interface SavedBookmark {
  id: string;
  bookId: string;
  chapterId: string;
  passageId: string;
  selectedText: string;
  aiPersonaId: string;
  aiResponseMd: string;
  citedQuote: string;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LibraryContext {
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  visibleText: string;
  selectedText?: string;
}
