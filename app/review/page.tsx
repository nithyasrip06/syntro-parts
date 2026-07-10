"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_BOM_PARTS, type BOMPart } from "@/lib/mockReviewData";
import type { Part } from "@/types/part";

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "intro" | "review" | "done";
type SortKey = "price" | "leadTime";
type Outcome =
  | { kind: "matched"; partId: string; match: Part }
  | { kind: "skipped"; partId: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Pill positions for intro — spread around edges, center kept clear ─────────

const PILL_LAYOUT: { x: number; y: number; dur: number; delay: number }[] = [
  { x: 6,  y: 14, dur: 5.2, delay: 0    },
  { x: 82, y: 10, dur: 4.8, delay: 0.7  },
  { x: 4,  y: 52, dur: 6.1, delay: 1.3  },
  { x: 88, y: 48, dur: 5.5, delay: 0.4  },
  { x: 8,  y: 82, dur: 4.6, delay: 1.9  },
  { x: 80, y: 80, dur: 5.8, delay: 0.9  },
  { x: 38, y: 6,  dur: 5.0, delay: 2.1  },
  { x: 56, y: 88, dur: 4.9, delay: 1.5  },
  { x: 24, y: 72, dur: 5.6, delay: 0.2  },
  { x: 70, y: 22, dur: 4.7, delay: 1.1  },
  { x: 18, y: 30, dur: 5.3, delay: 2.4  },
  { x: 76, y: 64, dur: 6.0, delay: 0.6  },
];

// ── Intro screen ──────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Floating part name pills */}
      {MOCK_BOM_PARTS.map((part, i) => {
        const pos = PILL_LAYOUT[i] ?? { x: 50, y: 50, dur: 5, delay: 0 };
        return (
          <motion.div
            key={part.id}
            className="absolute select-none pointer-events-none"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.45, 0.25, 0.5, 0.25],
              y: [0, -14, 0, 9, 0],
              x: [0, 5, -3, 4, 0],
            }}
            transition={{
              opacity: { duration: pos.dur, repeat: Infinity, ease: "easeInOut", delay: pos.delay },
              y:       { duration: pos.dur, repeat: Infinity, ease: "easeInOut", delay: pos.delay },
              x:       { duration: pos.dur * 1.3, repeat: Infinity, ease: "easeInOut", delay: pos.delay },
            }}
          >
            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-500 shadow-sm whitespace-nowrap">
              {part.name}
            </div>
          </motion.div>
        );
      })}

      {/* Center content */}
      <motion.div
        className="relative z-10 text-center max-w-lg px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-5">
          BOM analysis complete
        </p>
        <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-4">
          {MOCK_BOM_PARTS.length} parts,<br />ready to match
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed mb-10">
          Review distributor options for each line item and select the best match. Unmatched parts are flagged for RFQ.
        </p>
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="px-8 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm"
        >
          Start review →
        </motion.button>
      </motion.div>
    </div>
  );
}

// ── Match card ─────────────────────────────────────────────────────────────────

function MatchCard({
  match,
  selected,
  pending,
  onSelect,
}: {
  match: Part;
  selected: boolean;
  pending: boolean;
  onSelect: () => void;
}) {
  const volumeBreaks = match.priceBreaks.slice(1, 3);

  return (
    <motion.button
      onClick={onSelect}
      disabled={pending}
      whileHover={!selected && !pending ? { y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" } : {}}
      whileTap={!selected ? { scale: 0.99 } : {}}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className={`relative w-full text-left p-5 rounded-xl border-2 transition-colors duration-150 ${
        selected
          ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      {/* Selected checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute top-4 right-4 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center"
        >
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      )}

      {/* Distributor */}
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 pr-8">
        {match.distributor}
      </p>

      {/* Price */}
      <div className="mb-1">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">
          {formatPrice(match.unitPrice)}
        </span>
        <span className="text-sm text-slate-400 ml-1">/ea</span>
      </div>

      {/* Volume breaks */}
      {volumeBreaks.length > 0 && (
        <p className="text-xs text-slate-400 mb-3">
          {volumeBreaks.map((pb) => `${pb.quantity.toLocaleString()}+: ${formatPrice(pb.unitPrice)}`).join(" · ")}
        </p>
      )}

      {/* Stock / lead time */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
        <span>
          {match.stockQty === 0
            ? "Out of stock"
            : match.stockQty >= 1000
            ? `${(match.stockQty / 1000).toFixed(0)}k in stock`
            : `${match.stockQty.toLocaleString()} in stock`}
        </span>
        <span className="text-slate-300">·</span>
        <span>{leadLabel(match.leadTimeDays)}</span>
      </div>
    </motion.button>
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress */}
      <div className="flex items-center justify-between px-10 pt-8 pb-0">
        <div className="h-0.5 flex-1 bg-slate-100 rounded-full overflow-hidden mr-6">
          <motion.div
            className="h-full bg-indigo-600 rounded-full"
            initial={false}
            animate={{ width: `${((index) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-slate-400 shrink-0 tabular-nums">
          {index + 1} of {total}
        </span>
      </div>

      {/* Part info */}
      <div className="max-w-3xl w-full mx-auto px-10 pt-14 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            {part.specSummary}
          </p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            {part.name}
          </h2>
          <p className="text-sm text-slate-400">
            Qty needed:{" "}
            <span className="font-semibold text-slate-700">{part.qtyNeeded.toLocaleString()}</span>
          </p>
        </motion.div>
      </div>

      {/* Sort */}
      <div className="max-w-3xl w-full mx-auto px-10 pb-5 flex items-center gap-2">
        <span className="text-xs text-slate-400 mr-1">Sort</span>
        {(["price", "leadTime"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              sort === key
                ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
            }`}
          >
            {key === "price" ? "Price" : "Lead time"}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="max-w-3xl w-full mx-auto px-10 pb-8">
        <div className={`grid gap-3 ${sorted.length >= 3 ? "grid-cols-3" : sorted.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {sorted.map((match) => (
            <MatchCard
              key={match.distributorSku}
              match={match}
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
  const matched = outcomes.filter((o) => o.kind === "matched") as Extract<Outcome, { kind: "matched" }>[];
  const skipped = outcomes.filter((o) => o.kind === "skipped").length;

  return (
    <motion.div
      className="min-h-screen bg-white flex items-start justify-center pt-24 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-lg w-full">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-5">
          Review complete
        </p>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
          {matched.length} of {outcomes.length} matched
        </h2>
        <p className="text-lg text-slate-400 mb-10">
          {skipped > 0
            ? `${skipped} part${skipped > 1 ? "s" : ""} flagged for RFQ.`
            : "All parts matched."}
        </p>

        {/* Outcome list */}
        <div className="mb-10">
          {MOCK_BOM_PARTS.map((part, i) => {
            const outcome = outcomes[i];
            if (!outcome) return null;
            const isMatched = outcome.kind === "matched";
            const matchedOutcome = isMatched ? (outcome as Extract<Outcome, { kind: "matched" }>) : null;

            return (
              <motion.div
                key={part.id}
                className="flex items-center gap-3.5 py-3 border-b border-slate-100 last:border-0"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isMatched ? "bg-slate-900" : "bg-slate-200"
                  }`}
                />
                <span className="text-sm text-slate-700 flex-1 truncate">{part.name}</span>
                {isMatched && matchedOutcome ? (
                  <span className="text-xs text-slate-400 shrink-0">
                    {matchedOutcome.match.distributor} · {formatPrice(matchedOutcome.match.unitPrice)}/ea
                  </span>
                ) : (
                  <span className="text-xs text-slate-300 shrink-0">RFQ</span>
                )}
              </motion.div>
            );
          })}
        </div>

        <button className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm">
          Proceed with selections
        </button>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
    <AnimatePresence mode="wait">
      {phase === "intro" && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35 }}
        >
          <IntroScreen onStart={() => setPhase("review")} />
        </motion.div>
      )}

      {phase === "review" && currentPart && (
        <motion.div
          key={`review-${currentIndex}`}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <DoneScreen outcomes={outcomes} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
