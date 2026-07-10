"use client";

import { useState, useCallback, useRef } from "react";
import type { Part, AlibabaSupplier } from "@/types/part";

type SortKey = "price" | "stock" | "leadTime";

function formatPrice(price: number | null, currency = "USD"): string {
  if (price === null) return "—";
  const digits = price < 0.01 ? 4 : price < 1 ? 3 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: 4,
  }).format(price);
}

function LeadText({ days }: { days: number | null }) {
  if (days === null) return <span>—</span>;
  if (days === 0) return <span>Ships today</span>;
  return <span>{days}d lead time</span>;
}

// ── Accordion row — distributor part ─────────────────────────────────────────

function PartRow({ part }: { part: Part }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border-t border-slate-100 transition-all duration-200 ${
        open
          ? "border-l-[3px] border-l-indigo-600 bg-white"
          : "border-l-[3px] border-l-transparent hover:bg-slate-50/50 cursor-pointer"
      }`}
      onClick={() => !open && setOpen(true)}
    >
      {/* Row header */}
      <div
        className="flex items-start justify-between gap-10 px-8 py-5 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div
          className={`flex-1 min-w-0 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-50"
          }`}
        >
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-mono text-[15px] font-semibold text-slate-900 tracking-tight">
              {part.mpn}
            </span>
            <span className="text-sm text-slate-400">{part.manufacturer}</span>
          </div>
          <p className="text-sm text-slate-500 truncate">{part.description}</p>
        </div>

        <div
          className={`text-right shrink-0 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-50"
          }`}
        >
          <div className="flex items-baseline justify-end gap-1.5 mb-1">
            <span className="text-xs text-slate-400">{part.distributor}</span>
          </div>
          <div className="text-[17px] font-semibold text-slate-900 leading-tight">
            {formatPrice(part.unitPrice, part.currency)}
            <span className="text-sm font-normal text-slate-400">/ea</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {part.stockQty === 0 ? (
              "Out of stock"
            ) : part.stockQty >= 1000 ? (
              `${(part.stockQty / 1000).toFixed(0)}k in stock`
            ) : (
              `${part.stockQty.toLocaleString()} in stock`
            )}{" "}
            · <LeadText days={part.leadTimeDays} />
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="px-8 pb-7 pt-0" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-wrap gap-10 mb-6">
            {part.priceBreaks.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Volume pricing
                </p>
                <div className="flex gap-2 flex-wrap">
                  {part.priceBreaks.map((pb) => (
                    <div
                      key={pb.quantity}
                      className="border border-slate-200 rounded-lg px-3 py-2.5 min-w-[68px] text-center"
                    >
                      <div className="text-xs text-slate-400 mb-1">
                        {pb.quantity.toLocaleString()}+
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {formatPrice(pb.unitPrice, pb.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                SKU
              </p>
              <span className="font-mono text-sm text-slate-700">{part.distributorSku}</span>
            </div>

            {(part.datasheetUrl || part.distributorUrl) && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Links
                </p>
                <div className="flex gap-5">
                  {part.datasheetUrl && (
                    <a
                      href={part.datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                      Datasheet →
                    </a>
                  )}
                  {part.distributorUrl && (
                    <a
                      href={part.distributorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                      {part.distributor} →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => alert(`Added ${part.mpn} from ${part.distributor} to order`)}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Add to order
          </button>
        </div>
      )}
    </div>
  );
}

// ── Accordion row — Alibaba supplier ─────────────────────────────────────────

function AlibabaRow({ supplier }: { supplier: AlibabaSupplier }) {
  const [open, setOpen] = useState(false);

  const priceStr =
    supplier.priceMin === supplier.priceMax
      ? `$${supplier.priceMin.toFixed(3)}`
      : `$${supplier.priceMin.toFixed(3)}–$${supplier.priceMax.toFixed(3)}`;
  const leadStr =
    supplier.leadTimeMin === supplier.leadTimeMax
      ? `${supplier.leadTimeMin} days`
      : `${supplier.leadTimeMin}–${supplier.leadTimeMax} days`;

  return (
    <div
      className={`border-t border-slate-100 transition-all duration-200 ${
        open
          ? "border-l-[3px] border-l-indigo-600 bg-white"
          : "border-l-[3px] border-l-transparent hover:bg-slate-50/50 cursor-pointer"
      }`}
      onClick={() => !open && setOpen(true)}
    >
      <div
        className="flex items-start justify-between gap-10 px-8 py-5 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div
          className={`flex-1 min-w-0 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-50"
          }`}
        >
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-[15px] font-semibold text-slate-900 truncate">
              {supplier.supplierName}
            </span>
          </div>
          <p className="text-sm text-slate-500 truncate">{supplier.productTitle}</p>
        </div>

        <div
          className={`text-right shrink-0 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-50"
          }`}
        >
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-xs text-slate-400">Alibaba</span>
            <span className="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 leading-none">
              Indicative
            </span>
          </div>
          <div className="text-[17px] font-semibold text-slate-900 leading-tight">
            {priceStr}
            <span className="text-sm font-normal text-slate-400">/ea</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            MOQ {supplier.moq.toLocaleString()} · {leadStr}
          </div>
        </div>
      </div>

      {open && (
        <div className="px-8 pb-7 pt-0" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-wrap gap-10 mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Price range
              </p>
              <div className="text-sm font-semibold text-slate-900">{priceStr}/ea</div>
              <div className="text-xs text-slate-400 mt-1">Confirm with supplier before ordering</div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Min. order qty
              </p>
              <div className="text-sm text-slate-700">{supplier.moq.toLocaleString()} units</div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Est. lead time
              </p>
              <div className="text-sm text-slate-700">{leadStr}</div>
            </div>
            {supplier.supplierRating && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Supplier rating
                </p>
                <div className="text-sm text-slate-700">{supplier.supplierRating} / 5.0</div>
              </div>
            )}
          </div>

          <a
            href={supplier.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Send RFQ to supplier →
          </a>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [suppliers, setSuppliers] = useState<AlibabaSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [dataSource, setDataSource] = useState<"nexar" | "mock" | "cache" | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const [partsRes, alibabaRes] = await Promise.allSettled([
        fetch(`/api/search?q=${encodeURIComponent(q.trim())}`),
        fetch(`/api/alibaba?q=${encodeURIComponent(q.trim())}`),
      ]);

      if (partsRes.status === "fulfilled") {
        const data = await partsRes.value.json();
        if (!partsRes.value.ok) throw new Error(data.error ?? "Search failed");
        setParts(data.parts ?? []);
        setDataSource(data.source ?? null);
      }

      if (alibabaRes.status === "fulfilled") {
        const data = await alibabaRes.value.json();
        setSuppliers(data.suppliers ?? []);
      }
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

  const sortedParts = [...parts]
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

  const totalResults = sortedParts.length + suppliers.length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero + search */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8 py-14">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-4">
            Parts catalog
          </p>
          <h1 className="text-[40px] font-bold text-slate-900 tracking-tight leading-[1.15] mb-3">
            Find parts instantly
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-xl leading-relaxed">
            Real-time pricing and lead times from DigiKey, Mouser, Arrow, and 40+ distributors.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                width="16" height="16" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Part number or keyword — LM358, M3 screw, 10k resistor"
                className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </form>
        </div>
      </div>

      {/* Results area */}
      <main className="max-w-5xl mx-auto px-8 py-10">

        {/* Filters */}
        {searched && !loading && (
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-5">
              <span className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">{totalResults}</span>{" "}
                {totalResults === 1 ? "result" : "results"}
                {dataSource === "mock" && (
                  <span className="ml-2 text-xs font-semibold text-slate-400">Demo data</span>
                )}
                {dataSource === "cache" && (
                  <span className="ml-2 text-xs font-semibold text-indigo-500">Cached</span>
                )}
              </span>
              <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                In stock only
              </label>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-slate-400 mr-1">Sort</span>
              {(["price", "stock", "leadTime"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSortKey(key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                    sortKey === key
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                      : "border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700"
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-t border-slate-100 first:border-t-0 px-8 py-5 flex justify-between gap-8">
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-52 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-80 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="space-y-2.5 shrink-0 text-right">
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse ml-auto" />
                  <div className="h-3 w-36 bg-slate-100 rounded animate-pulse ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Accordion list */}
        {!loading && totalResults > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {sortedParts.map((part, i) => (
              <PartRow
                key={`${part.mpn}-${part.distributor}-${part.distributorSku}-${i}`}
                part={part}
              />
            ))}
            {suppliers.map((s, i) => (
              <AlibabaRow key={i} supplier={s} />
            ))}
            <div className="border-t border-slate-100" />
          </div>
        )}

        {/* No results */}
        {!loading && searched && totalResults === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-base font-semibold text-slate-700 mb-1">
              No parts found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm text-slate-400 mb-6">This part may not be in the catalog.</p>
            <button className="px-5 py-2.5 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
              Generate RFQ →
            </button>
          </div>
        )}

        {/* Empty state */}
        {!searched && (
          <div className="text-center py-24">
            <p className="text-sm text-slate-400">
              Search for a part number or keyword to see real-time pricing from 40+ distributors.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
