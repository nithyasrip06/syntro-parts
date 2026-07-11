"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_BOM_PARTS, type BOMPart } from "@/lib/mockReviewData";
import type { Part } from "@/types/part";

type Phase = "intro" | "review" | "done";
type SortKey = "price" | "leadTime";
type Outcome =
  | { kind: "matched"; partId: string; match: Part }
  | { kind: "skipped"; partId: string };

const TRANSITION = {
  duration: 0.75,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  const digits = price < 0.01 ? 4 : price < 1 ? 3 : 2;
  return `$${price.toFixed(digits)}`;
}

function leadLabel(days: number | null): string {
  if (days === null) return "—";
  if (days === 0) return "Ships today";
  if (days === 1) return "Ships tomorrow";
  return `${days}-day lead`;
}

function getBadge(match: Part, allMatches: Part[]): string | null {
  const lowestPrice = Math.min(...allMatches.map((m) => m.unitPrice ?? Infinity));
  const lowestLead = Math.min(...allMatches.map((m) => m.leadTimeDays ?? Infinity));
  if (match.unitPrice !== null && match.unitPrice === lowestPrice) return "Best price";
  if (match.leadTimeDays !== null && match.leadTimeDays === lowestLead) return "Fastest";
  return null;
}

// ── Animated checkbox ─────────────────────────────────────────────────────────

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 shrink-0"
      style={
        checked
          ? { backgroundColor: "var(--text)", borderColor: "var(--text)" }
          : { backgroundColor: "transparent", borderColor: "#d1d5db" }
      }
    >
      <AnimatePresence>
        {checked && (
          <motion.svg
            key="check"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
          >
            <path
              d="M1 4l3 3 5-6"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Intro screen ──────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      <div className="text-center max-w-lg px-6">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-5"
          style={{ color: "var(--accent-pink)" }}
        >
          BOM analysis complete
        </p>
        <h1
          className="text-5xl font-bold tracking-tight leading-[1.1] mb-4"
          style={{ color: "var(--text)" }}
        >
          {MOCK_BOM_PARTS.length} parts,<br />ready to match
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed mb-10">
          Review distributor options for each line item and select the best match. Unmatched parts are flagged for RFQ.
        </p>
        <motion.button
          onClick={onStart}
          whileHover={{ opacity: 0.88 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.12 }}
          className="px-8 py-3.5 text-sm font-semibold text-white rounded-xl"
          style={{ background: "var(--text)" }}
        >
          Start review →
        </motion.button>
      </div>
    </div>
  );
}

// ── Match card ─────────────────────────────────────────────────────────────────

function MatchCard({
  match,
  allMatches,
  selected,
  pending,
  onSelect,
}: {
  match: Part;
  allMatches: Part[];
  selected: boolean;
  pending: boolean;
  onSelect: () => void;
}) {
  const badge = getBadge(match, allMatches);
  const volumeBreaks = match.priceBreaks.slice(1, 3);

  return (
    <motion.div whileHover={!selected && !pending ? { y: -2 } : {}}>
      <button
        onClick={onSelect}
        disabled={pending}
        className="w-full text-left p-5 rounded-2xl"
        style={{
          backgroundColor: selected ? "var(--accent-pink-light)" : "#fff",
          border: `2px solid ${selected ? "var(--accent-pink-border)" : "#e5e7eb"}`,
          transition: "background-color 0.15s ease, border-color 0.15s ease",
          boxShadow: selected ? "none" : undefined,
        }}
      >
        {/* Top row: badge + checkbox */}
        <div className="flex items-center justify-between mb-3">
          {badge ? (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "var(--accent-pink-light)",
                color: "var(--accent-pink)",
              }}
            >
              {badge}
            </span>
          ) : (
            <span />
          )}
          <Checkbox checked={selected} />
        </div>

        {/* Distributor */}
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          {match.distributor}
        </p>

        {/* Price */}
        <div className="mb-1">
          <span
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {formatPrice(match.unitPrice)}
          </span>
          <span className="text-sm text-slate-400 ml-1">/ea</span>
        </div>

        {/* Volume breaks */}
        {volumeBreaks.length > 0 && (
          <p className="text-xs text-slate-400 mb-3">
            {volumeBreaks
              .map((pb) => `${pb.quantity.toLocaleString()}+: ${formatPrice(pb.unitPrice)}`)
              .join(" · ")}
          </p>
        )}

        {/* Stock / lead time */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
          <span>
            {match.stockQty === 0
              ? "Out of stock"
              : match.stockQty >= 1000
              ? `${(match.stockQty / 1000).toFixed(0)}k in stock`
              : `${match.stockQty.toLocaleString()} in stock`}
          </span>
          <span className="text-slate-200">·</span>
          <span>{leadLabel(match.leadTimeDays)}</span>
        </div>
      </button>
    </motion.div>
  );
}

// ── Review screen ─────────────────────────────────────────────────────────────

function ReviewScreen({
  part,
  index,
  total,
  onMatch,
  onSkip,
}: {
  part: BOMPart;
  index: number;
  total: number;
  onMatch: (match: Part) => void;
  onSkip: () => void;
}) {
  const [sort, setSort] = useState<SortKey>("price");
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const sorted = [...part.matches].sort((a, b) => {
    if (sort === "price") {
      if (a.unitPrice === null) return 1;
      if (b.unitPrice === null) return -1;
      return a.unitPrice - b.unitPrice;
    }
    if (a.leadTimeDays === null) return 1;
    if (b.leadTimeDays === null) return -1;
    return a.leadTimeDays - b.leadTimeDays;
  });

  function handleSelect(match: Part) {
    if (pending) return;
    setSelectedSku(match.distributorSku);
    setPending(true);
    setTimeout(() => onMatch(match), 380);
  }

  const gridClass =
    sorted.length >= 3 ? "grid-cols-3" : sorted.length === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* Horizontal progress bar */}
      <div className="flex items-center gap-4 px-10 pt-8">
        <div className="h-0.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--accent-pink)" }}
            initial={false}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-slate-400 tabular-nums shrink-0">
          {index + 1} of {total}
        </span>
      </div>

      {/* Part info */}
      <div className="max-w-3xl w-full mx-auto px-10 pt-12 pb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          {part.specSummary}
        </p>
        <h2
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: "var(--text)" }}
        >
          {part.name}
        </h2>
        <p className="text-sm text-slate-400">
          Qty needed:{" "}
          <span className="font-semibold" style={{ color: "var(--text)" }}>
            {part.qtyNeeded.toLocaleString()}
          </span>
        </p>
      </div>

      {/* Sort pills */}
      <div className="max-w-3xl w-full mx-auto px-10 pb-5 flex items-center gap-2">
        <span className="text-xs text-slate-400 mr-1">Sort</span>
        {(["price", "leadTime"] as SortKey[]).map((key) => {
          const active = sort === key;
          return (
            <button
              key={key}
              onClick={() => setSort(key)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
              style={{
                borderColor: active ? "var(--text)" : "#e5e7eb",
                color: active ? "var(--text)" : "#9ca3af",
                background: active ? "#f9fafb" : "#fff",
              }}
            >
              {key === "price" ? "Price" : "Lead time"}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="max-w-3xl w-full mx-auto px-10 pb-8">
        <div className={`grid gap-3 ${gridClass}`}>
          {sorted.map((match) => (
            <MatchCard
              key={match.distributorSku}
              match={match}
              allMatches={part.matches}
              selected={selectedSku === match.distributorSku}
              pending={pending}
              onSelect={() => handleSelect(match)}
            />
          ))}
        </div>
      </div>

      {/* Skip */}
      <div className="max-w-3xl w-full mx-auto px-10 pb-14">
        <button
          onClick={onSkip}
          disabled={pending}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
        >
          Skip — flag for RFQ
        </button>
      </div>

    </div>
  );
}

// ── Done screen ───────────────────────────────────────────────────────────────

function DoneScreen({ outcomes }: { outcomes: Outcome[] }) {
  const matched = outcomes.filter((o) => o.kind === "matched") as Extract<
    Outcome,
    { kind: "matched" }
  >[];
  const skipped = outcomes.filter((o) => o.kind === "skipped").length;

  return (
    <div
      className="min-h-screen flex items-start justify-center pt-24 px-8"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-lg w-full">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-5"
          style={{ color: "var(--accent-pink)" }}
        >
          Review complete
        </p>
        <h2
          className="text-4xl font-bold tracking-tight mb-3"
          style={{ color: "var(--text)" }}
        >
          {matched.length} of {outcomes.length} matched
        </h2>
        <p className="text-lg text-slate-400 mb-10">
          {skipped > 0
            ? `${skipped} part${skipped > 1 ? "s" : ""} flagged for RFQ.`
            : "All parts matched."}
        </p>

        <div className="mb-10">
          {MOCK_BOM_PARTS.map((part, i) => {
            const outcome = outcomes[i];
            if (!outcome) return null;
            const isMatched = outcome.kind === "matched";
            const matchedOutcome = isMatched
              ? (outcome as Extract<Outcome, { kind: "matched" }>)
              : null;

            return (
              <motion.div
                key={part.id}
                className="flex items-center gap-3.5 py-3 border-b border-slate-100 last:border-0"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.22 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: isMatched ? "var(--accent-pink)" : "#e5e7eb",
                  }}
                />
                <span
                  className="text-sm flex-1 truncate"
                  style={{ color: "var(--text)" }}
                >
                  {part.name}
                </span>
                {isMatched && matchedOutcome ? (
                  <span className="text-xs text-slate-400 shrink-0">
                    {matchedOutcome.match.distributor} ·{" "}
                    {formatPrice(matchedOutcome.match.unitPrice)}/ea
                  </span>
                ) : (
                  <span className="text-xs text-slate-300 shrink-0">RFQ</span>
                )}
              </motion.div>
            );
          })}
        </div>

        <button
          className="px-6 py-3 text-sm font-semibold text-white rounded-xl"
          style={{ background: "var(--text)" }}
        >
          Proceed with selections
        </button>
      </div>
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  function handleMatch(match: Part) {
    const part = MOCK_BOM_PARTS[currentIndex];
    if (!part) return;
    setOutcomes((prev) => [...prev, { kind: "matched", partId: part.id, match }]);
    advance();
  }

  function handleSkip() {
    const part = MOCK_BOM_PARTS[currentIndex];
    if (!part) return;
    setOutcomes((prev) => [...prev, { kind: "skipped", partId: part.id }]);
    advance();
  }

  function advance() {
    if (currentIndex + 1 >= MOCK_BOM_PARTS.length) {
      setPhase("done");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  const currentPart = MOCK_BOM_PARTS[currentIndex];

  return (
    // relative + overflow-hidden so absolute children overlap during AnimatePresence
    <div
      className="relative overflow-hidden"
      style={{ minHeight: "100vh", background: "var(--bg)" }}
    >
      <AnimatePresence initial={false}>
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="absolute inset-0 overflow-y-auto"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={TRANSITION}
          >
            <IntroScreen onStart={() => setPhase("review")} />
          </motion.div>
        )}

        {phase === "review" && currentPart && (
          <motion.div
            key={`r${currentIndex}`}
            className="absolute inset-0 overflow-y-auto"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={TRANSITION}
          >
            <ReviewScreen
              part={currentPart}
              index={currentIndex}
              total={MOCK_BOM_PARTS.length}
              onMatch={handleMatch}
              onSkip={handleSkip}
            />
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            className="absolute inset-0 overflow-y-auto"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={TRANSITION}
          >
            <DoneScreen outcomes={outcomes} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
