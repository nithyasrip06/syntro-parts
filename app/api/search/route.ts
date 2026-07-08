import { NextRequest, NextResponse } from "next/server";
import { searchNexar } from "@/lib/nexar";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  try {
    const parts = await searchNexar(query, 30);
    return NextResponse.json({ parts, query });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
