import { NextRequest, NextResponse } from "next/server";
import { searchNexar } from "@/lib/nexar";
import { getMockResults } from "@/lib/mockData";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Part } from "@/types/part";

function rowToPart(row: Record<string, unknown>): Part {
  return {
    mpn: row.mpn as string,
    manufacturer: row.manufacturer as string,
    description: row.description as string,
    distributor: row.distributor as string,
    distributorSku: row.distributor_sku as string,
    distributorUrl: row.distributor_url as string | null,
    unitPrice: row.unit_price as number | null,
    currency: (row.currency as string) ?? "USD",
    priceBreaks: (row.quantity_breaks as Part["priceBreaks"]) ?? [],
    stockQty: (row.stock_qty as number) ?? 0,
    leadTimeDays: row.lead_time_days as number | null,
    datasheetUrl: row.datasheet_url as string | null,
    category: row.category as string | null,
    source: "nexar",
  };
}

function partToRow(part: Part, searchTerm: string) {
  return {
    search_term: searchTerm.toLowerCase(),
    mpn: part.mpn,
    manufacturer: part.manufacturer,
    description: part.description,
    distributor: part.distributor,
    distributor_sku: part.distributorSku,
    distributor_url: part.distributorUrl,
    unit_price: part.unitPrice,
    currency: part.currency,
    quantity_breaks: part.priceBreaks,
    stock_qty: part.stockQty,
    lead_time_days: part.leadTimeDays,
    category: part.category,
    datasheet_url: part.datasheetUrl,
    source_api: part.source,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  // 1. Check Supabase cache
  const { data: cached } = await supabase
    .from("parts_cache")
    .select("*")
    .ilike("search_term", `%${query.toLowerCase()}%`)
    .gt("expires_at", new Date().toISOString())
    .order("unit_price", { ascending: true });

  if (cached && cached.length > 0) {
    return NextResponse.json({
      parts: cached.map(rowToPart),
      query,
      source: "cache",
    });
  }

  // 2. Try Nexar
  try {
    const parts = await searchNexar(query, 30);

    if (parts.length > 0) {
      // Write to cache (non-blocking)
      supabaseAdmin
        .from("parts_cache")
        .upsert(parts.map((p) => partToRow(p, query)), {
          onConflict: "mpn,distributor,distributor_sku",
          ignoreDuplicates: false,
        })
        .then(({ error }) => {
          if (error) console.error("[cache write]", error.message);
        });
    }

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
