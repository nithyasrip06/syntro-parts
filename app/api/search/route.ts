import { NextRequest, NextResponse } from "next/server";
import { searchNexar } from "@/lib/nexar";
import { searchMcMaster } from "@/lib/mcmaster";
import { getMockResults } from "@/lib/mockData";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Part } from "@/types/part";

function rowToPart(row: Record<string, unknown>): Part {
  return {
    mpn: row.mpn as string,
    manufacturer: row.manufacturer as string,
    manufacturerUrl: null, // not stored in cache schema
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

function mergeParts(parts: Part[]): Part[] {
  const seen = new Set<string>();
  return parts
    .filter(p => {
      const key = `${p.distributor}:${p.distributorSku}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const pa = a.unitPrice ?? Infinity;
      const pb = b.unitPrice ?? Infinity;
      if (pa !== pb) return pa - pb;
      const la = a.leadTimeDays ?? Infinity;
      const lb = b.leadTimeDays ?? Infinity;
      return la - lb;
    })
    .slice(0, 10);
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  // 1. Check Supabase cache (Nexar results only — McMaster mock doesn't need caching)
  const { data: cached } = await supabase
    .from("parts_cache")
    .select("*")
    .ilike("search_term", `%${query.toLowerCase()}%`)
    .gt("expires_at", new Date().toISOString())
    .gt("stock_qty", 0)
    .order("unit_price", { ascending: true });

  if (cached && cached.length > 0) {
    const mcmasterParts = await searchMcMaster(query);
    const merged = mergeParts([...cached.map(rowToPart), ...mcmasterParts]);
    return NextResponse.json({ parts: merged, query, source: "cache" });
  }

  // 2. Fan out to Nexar + McMaster-Carr in parallel
  const [nexarResult, mcmasterResult] = await Promise.allSettled([
    searchNexar(query, 20),
    searchMcMaster(query),
  ]);

  const nexarParts = nexarResult.status === "fulfilled" ? nexarResult.value : [];
  const mcmasterParts = mcmasterResult.status === "fulfilled" ? mcmasterResult.value : [];

  // Log Nexar errors but don't fail if McMaster filled in
  if (nexarResult.status === "rejected") {
    const message = nexarResult.reason instanceof Error
      ? nexarResult.reason.message
      : String(nexarResult.reason);

    // Fall back to mock data on quota exhaustion
    if (message.includes("part limit") || message.includes("exceeded")) {
      const mockParts = getMockResults(query);
      const merged = mergeParts([...mockParts, ...mcmasterParts]);
      return NextResponse.json({ parts: merged, query, source: "mock" });
    }

    console.error("[search/nexar]", nexarResult.reason);
  }

  // Cache only Nexar results (non-blocking)
  if (nexarParts.length > 0) {
    supabaseAdmin
      .from("parts_cache")
      .upsert(nexarParts.map(p => partToRow(p, query)), {
        onConflict: "mpn,distributor,distributor_sku",
        ignoreDuplicates: false,
      })
      .then(({ error }) => {
        if (error) console.error("[cache write]", error.message);
      });
  }

  const merged = mergeParts([...nexarParts, ...mcmasterParts]);
  return NextResponse.json({ parts: merged, query, source: "nexar+mcmaster" });
}
