# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

There is no test suite configured.

## Architecture Overview

This is a Next.js 15 (App Router) SaaS application for local SEO and AEO analysis. It uses React 19 Server Components, Supabase for auth and database, and deploys to Vercel.

### Three user flows

1. **Public signup** — `app/page.tsx` → `/verify-email` → `/auth/callback` → `/dashboard`
2. **User dashboard** — `app/dashboard/page.tsx` loads 32 SEO/AEO analysis modules on demand
3. **Admin dashboard** — `app/admin/page.tsx` is password-gated (separate from Supabase auth)

### Key subsystems

**Auth (two-tier):**
- User auth: Supabase SSR — `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `middleware.ts` guards `/dashboard`
- Admin auth: password-only via `POST /api/admin-auth` with `x-admin-password` header; no Supabase session involved

**Supabase admin client (`lib/supabase/admin.ts`):**
Uses a JS `Proxy` for lazy initialization to prevent build-time errors on Vercel when `SUPABASE_SERVICE_ROLE_KEY` isn't available at `next build` (collect-static phase). The real client is created on first use, not at import time.

**32-module system (`modules/`):**
Each module is a JSX file handling a distinct SEO/AEO capability (heading audits, keyword analysis, competitor intelligence, GBP optimization, citation submission, etc.). All are registered in `modules/registry.js` with nav group, id, label, and color. The dashboard (`app/dashboard/page.tsx`) imports all 32 via `next/dynamic()` to keep Vercel bundle sizes manageable.

**WordPress integration (`app/api/wp/`):**
Four endpoints — `test`, `snapshot`, `apply-fix`, `restore`. Snapshots are always created before applying a fix; the restore endpoint rolls back using the stored `page_snapshots` Supabase record. Uses WP REST API with Basic Auth (app passwords).

**Hosting detection (`app/api/detect-hosting/`):**
Fingerprints the target server by inspecting HTTP response headers for provider-specific keys (Kinsta, WP Engine, SiteGround, Vercel, Cloudflare, AWS CloudFront, etc.).

### Database (Supabase / PostgreSQL)

Main tables:
- `profiles` — user business data (website, city, industry, wp_url, wp_credentials)
- `audits` — per-module execution records (user_id, module_id, module_status)
- `page_snapshots` — WordPress page backups (original_content, fixed_content, status) — required before any fix is applied

### Environment variables

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, lazy-loaded) |
| `ADMIN_PASSWORD` | Super-admin password for `/api/admin-*` routes |
| `ANTHROPIC_API_KEY` | Claude API key for AI features |

### Middleware (`middleware.ts`)

Uses the Supabase SSR `createServerClient` with `getAll`/`setAll` cookie pattern. Guards `/dashboard`; skips `/api/*`, static assets, and images. Unauthenticated users are redirected to `/login`.

### Styling

Dark theme with CSS variables throughout `globals.css`. Color palette: deep blue `#0B0E16` background, teal `#10D9A0` accent, slate `#F1F5F9` text. No Tailwind — uses CSS modules and custom properties.

---

# LOCALSEOAEOPRO.COM — MASTER DESIGN SYSTEM

## Project Purpose

LocalSEOAEOPro is the authority platform.

The visitor already suspects there is a visibility problem. The objective is to demonstrate expertise, credibility, depth of knowledge, and strategic capability.

The site must feel like an elite consulting firm combined with a premium SaaS platform.

## Critical Positioning (Never Violate)

- LocalSEOAEOPro FIXES problems that PingClose finds.
- Never reveal proprietary implementation, internal systems, or exact execution process.
- Teach what matters and why. Never explain how the engine works.
- The visitor should leave thinking: "These people understand local search, SEO, AEO, and Google Business Profiles at a level most agencies never reach."

## Above-The-Fold Rules (Non-Negotiable)

NEVER place above the fold:
- Images of any kind
- Videos
- Stock photography
- Decorative graphics
- Image sliders
- Background videos

The first screen must establish authority immediately and contain:
- Authority headline
- Proof indicators
- Outcome-focused messaging
- Primary CTA
- Secondary CTA

## Font Size Rule (Non-Negotiable)

No font on any page shall ever be smaller than 16px. No exceptions.
- Body text: 17–18px
- Labels, captions, helper text: 16px minimum
- Headings: 22px+

## Performance Targets (Non-Negotiable)

- Lighthouse 95+ desktop and mobile
- LCP under 1.5 seconds
- Core Web Vitals all green
- Target: under 1 second on mobile 4G
- Performance is non-negotiable — never sacrifice it for visual effects

## Information Architecture

Every page must follow this structure:
1. Search Visibility Problem
2. Business Impact
3. Evidence
4. Strategic Insight
5. Competitive Advantage
6. Recommended Action
7. Call To Action

Remove any content that does not support this flow.

## Conversion Optimization

Every section must answer one of:
- Why do rankings matter?
- Why does local visibility matter?
- Why does authority matter?
- Why are competitors winning?
- Why should action be taken now?

Every page must contain:
- Primary CTA
- Secondary CTA
- Proof indicators
- Trust indicators

## Visual Design System

Design inspiration: Stripe, Notion, Vercel

The site must feel: Expert · Analytical · Technical · Professional · Data-driven

Avoid: agency clichés, generic SEO language, excessive visual effects

No section may be text-only. Preferred visual assets:
- Ranking Graphs
- Local Pack Diagrams
- GMB Scorecards
- Entity Relationship Maps
- Competitive Gap Analysis
- Search Journey Visualizations
- Authority Indicators

Visuals must communicate expertise — never decorate.

## Motion (Emil Kowalski Standard)

Allowed:
- Graph animations
- Counter animations
- Hover interactions
- Progressive disclosure

Never use:
- Decorative movement
- Distracting effects

Motion must support understanding.

## Polish Checklist (Run Before Every Final Output)

Review and improve:
- Typography hierarchy
- White space
- Alignment
- Layout consistency
- Visual hierarchy
- CTA positioning

Refine until the page feels premium.

## Executive Design Critic (Run Before Approval)

Ask before finalizing any page:
- How would Stripe improve this?
- How would Notion improve this?
- How would Vercel improve this?

Revise accordingly.

## Messaging Strategy

Teach the visitor what matters. Do not reveal proprietary implementation.

Show:
- What matters
- Why it matters
- Business impact

Never show:
- Exact execution process
- Internal systems
- Proprietary frameworks

## Module System Rules

- All prompts go in /prompts as .txt files — never hardcoded in module files
- SUPABASE_SERVICE_ROLE_KEY is server-only, never client-side
- Parallel subagents via Promise.all() — never sequential awaits
- PowerShell syntax for all terminal commands

## Primary Conversion Goal

The visitor must think:
"These people understand local search, SEO, AEO, and Google Business Profiles at a level most agencies never reach."

- Primary CTA: **Schedule Strategy Session**
- Secondary CTA: **Request Competitive Analysis**

## Revenue Context (Internal Reference)

- Month 1 per client: $495 cleanup + $299 managed = $794
- Months 2–12: $299/month × 11 = $3,289
- Total Year 1 per client: $4,083
- White label: partners sell at $795+, pay us $199/$299
