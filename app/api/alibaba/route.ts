import { NextRequest, NextResponse } from "next/server";
import { searchAlibaba } from "@/lib/alibaba";
import { getMockAlibabaResults } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  if (!process.env.APIFY_API_TOKEN) {
    return NextResponse.json({
      suppliers: getMockAlibabaResults(query),
      query,
      source: "mock",
    });
  }

  try {
    const suppliers = await searchAlibaba(query);
    return NextResponse.json({ suppliers, query, source: "apify" });
  } catch (err) {
    console.error("[alibaba]", err);
    // Always fall back to mock so the UI section still renders during demo
    return NextResponse.json({
      suppliers: getMockAlibabaResults(query),
      query,
      source: "mock",
    });
  }
}
