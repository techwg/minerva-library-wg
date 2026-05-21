import { NextRequest, NextResponse } from "next/server";
import { BOOKS } from "@/data/books";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const personaId = searchParams.get("personaId");
  const status = searchParams.get("status");

  let books = BOOKS;
  if (personaId) books = books.filter((b) => b.personaId === personaId);
  if (status) books = books.filter((b) => b.status === status);

  return NextResponse.json(books);
}
