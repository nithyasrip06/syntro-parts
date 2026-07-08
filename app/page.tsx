"use client";

import { useState, useCallback, useRef } from "react";
import type { Part } from "@/types/part";

type SortKey = "price" | "stock" | "leadTime";

function formatPrice(price: number | null, currency: string): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(price);
}

function LeadTimeBadge({ days }: { days: number | null }) {
  if (days === null)
    return <span className="text-zinc-400 text-sm">—</span>;
  if (days <= 2)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        {days === 0 ? "In stock" : `${days}d`}
      </span>
    );
  if (days <= 14)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        {days}d
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
      {days}d
    </span>
  );
}

function StockDisplay({ qty }: { qty: number }) {
  if (qty === 0)
    return <span className="text-red-500 text-sm font-medium">Out of stock</span>;
  if (qty >= 1000)
    return <span className="text-zinc-700 text-sm">{(qty / 1000).toFixed(1)}k</span>;
  return <span className="text-zinc-700 text-sm">{qty.toLocaleString()}</span>;
}

function PartRow({ part }: { part: Part }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="py-3.5 px-4">
          <div className="font-mono text-sm font-medium text-zinc-900">{part.mpn}</div>
          <div className="text-xs text-zinc-500 mt-0.5 max-w-xs truncate">{part.description}</div>
        </td>
        <td className="py-3.5 px-4 text-sm text-zinc-700">{part.manufacturer}</td>
        <td className="py-3.5 px-4">
          <span className="inline-flex items-center gap-1 text-sm text-zinc-700">
            {part.distributor}
          </span>
        </td>
        <td className="py-3.5 px-4 text-sm font-medium text-zinc-900">
          {formatPrice(part.unitPrice, part.currency)}
          {part.unitPrice !== null && (
            <span className="text-xs text-zinc-400 font-normal">/ea</span>
          )}
        </td>
        <td className="py-3.5 px-4">
          <StockDisplay qty={part.stockQty} />
        </td>
        <td className="py-3.5 px-4">
          <LeadTimeBadge days={part.leadTimeDays} />
        </td>
        <td className="py-3.5 px-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert(`Added ${part.mpn} from ${part.distributor} to order`);
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Add
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-zinc-50 border-b border-zinc-100">
          <td colSpan={7} className="px-4 py-4">
            <div className="flex flex-wrap gap-8">
              {part.priceBreaks.length > 1 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                    Quantity price breaks
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {part.priceBreaks.map((pb) => (
                      <div
                        key={pb.quantity}
                        className="text-sm bg-white border border-zinc-200 rounded-lg px-3 py-2"
                      >
                        <span className="text-zinc-500">{pb.quantity.toLocaleString()}+</span>
                        <span className="ml-2 font-medium text-zinc-900">
                          {formatPrice(pb.unitPrice, pb.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                  SKU
                </p>
                <p className="font-mono text-sm text-zinc-700">{part.distributorSku}</p>
              </div>
              <div className="flex gap-3 items-end">
                {part.datasheetUrl && (
                  <a
                    href={part.datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Datasheet →
                  </a>
                )}
                {part.distributorUrl && (
                  <a
                    href={part.distributorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View on {part.distributor} →
                  </a>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [inStockOnly, setInStockOnly] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setParts(data.parts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setParts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(query);
  };

  const sorted = [...parts]
    .filter((p) => !inStockOnly || p.stockQty > 0)
    .sort((a, b) => {
      if (sortKey === "price") {
        if (a.unitPrice === null) return 1;
        if (b.unitPrice === null) return -1;
        return a.unitPrice - b.unitPrice;
      }
      if (sortKey === "stock") return b.stockQty - a.stockQty;
      if (sortKey === "leadTime") {
        if (a.leadTimeDays === null) return 1;
        if (b.leadTimeDays === null) return -1;
        return a.leadTimeDays - b.leadTimeDays;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-zinc-900">Syntro</span>
            <span className="text-zinc-300">|</span>
            <span className="text-sm text-zinc-500">Parts Search</span>
          </div>
          <span className="text-xs text-zinc-400">Powered by Nexar / Octopart</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 mb-1">Find parts instantly</h1>
          <p className="text-zinc-500 text-sm">
            Search across 40+ distributors including DigiKey, Mouser, and Arrow. Compare pricing and
            lead times without emailing suppliers.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search by part number or keyword — e.g. LM358, M3 screw, 10k resistor"
                className="w-full pl-10 pr-4 py-3 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="px-5 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        {/* Filters & sort */}
        {searched && !loading && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">
                {sorted.length} {sorted.length === 1 ? "result" : "results"}
                {inStockOnly ? " (in stock)" : ""}
              </span>
              <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                In stock only
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Sort by</span>
              {(["price", "stock", "leadTime"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSortKey(key)}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                    sortKey === key
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {key === "price" ? "Price" : key === "stock" ? "Stock" : "Lead time"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-zinc-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results table */}
        {!loading && sorted.length > 0 && (
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Part / Description
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Manufacturer
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Distributor
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Unit price
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Stock
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Lead time
                  </th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((part, i) => (
                  <PartRow key={`${part.mpn}-${part.distributor}-${part.distributorSku}-${i}`} part={part} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No results */}
        {!loading && searched && sorted.length === 0 && !error && (
          <div className="text-center py-16 border border-zinc-200 rounded-xl">
            <p className="text-zinc-500 text-sm mb-1">No parts found for &quot;{query}&quot;</p>
            <p className="text-zinc-400 text-xs mb-4">
              This part may not be in the catalog. Generate an RFQ to request quotes from suppliers.
            </p>
            <button className="px-4 py-2 text-sm font-medium border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Generate RFQ →
            </button>
          </div>
        )}

        {/* Empty state */}
        {!searched && (
          <div className="text-center py-16 text-zinc-400 text-sm">
            Search for a part number or keyword to see real-time pricing from 40+ distributors.
          </div>
        )}
      </main>
    </div>
  );
}
