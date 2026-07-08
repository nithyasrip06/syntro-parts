# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project does

Parts catalog search MVP for the Syntro procurement workflow. It sits between BOM parsing and RFQ generation: given parsed BOM line items, it searches live distributor catalogs (starting with Nexar/Octopart) and returns real pricing + lead times so users can select parts directly instead of waiting on supplier emails. If no catalog match is found, the existing RFQ flow handles it.

## Commands

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build (also type-checks)
npm run lint     # ESLint
```

There are no tests yet. TypeScript strictness is enforced — `npm run build` will catch type errors.

## Architecture

**Next.js 16 App Router** — this version has breaking changes from earlier Next.js. Read `node_modules/next/dist/docs/` before writing routing, data fetching, or caching code. Follow deprecation notices; don't assume patterns from older Next.js versions.

Planned structure (not yet built):
```
app/
  page.tsx                  ← search UI (main entry point)
  api/
    search/route.ts         ← cache check → Nexar fan-out → normalize → respond
    bom/route.ts            ← batch BOM handler (SSE streaming)
lib/
  nexar.ts                  ← Nexar GraphQL client (OAuth2 client credentials)
  supabase.ts               ← Supabase client (anon key for reads, service role for writes)
  normalize.ts              ← maps all API responses to shared Part schema
types/
  part.ts                   ← shared Part interface used across lib/ and app/
```

**Data flow:** Search query → check Supabase `parts_cache` table → on miss, call Nexar `supMultiMatch` GraphQL query (up to 100 parts/batch) → normalize response → write to cache → return to UI sorted by price or lead time.

**Supabase** is the cache layer. The `parts_cache` table stores normalized part data with a 24-hour `expires_at` TTL for pricing and a 2-hour TTL for stock. Use the service role key only in server-side API routes — never in client components.

**Nexar API** uses OAuth2 client credentials flow to get a bearer token, then GraphQL at `https://api.nexar.com/graphql`. The `supMultiMatch` query handles BOM batch lookups. Free tier: 1,000 matched parts/month.

## Environment variables

All keys live in `.env.local` (gitignored). Required:
```
NEXAR_CLIENT_ID
NEXAR_CLIENT_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Design

Match the Syntro brand (usesyntro.com): light mode, white/off-white background, blue/teal accents (`blue-600`), Inter-style sans-serif, `rounded-lg` buttons, `shadow-sm` cards, generous whitespace. No dark mode, no glassmorphism.

## Path alias

`@/` resolves to the project root (e.g. `@/lib/nexar`, `@/types/part`).
