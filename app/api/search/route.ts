import { NextRequest, NextResponse } from "next/server";
import { searchNexar } from "@/lib/nexar";
import { getMockResults } from "@/lib/mockData";

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  if (USE_MOCK) {
    const parts = getMockResults(query);
    return NextResponse.json({ parts, query, source: "mock" });
  }

  try {
    const parts = await searchNexar(query, 30);
    return NextResponse.json({ parts, query, source: "nexar" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Graceful fallback to mock when Nexar quota is exhausted
    if (message.includes("part limit") || message.includes("exceeded")) {
      const parts = getMockResults(query);
      return NextResponse.json({ parts, query, source: "mock" });
    }
    console.error("[search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
