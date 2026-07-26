# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Bijan Parvin, built as a single-page application with Next.js 13 (App Router), Tailwind CSS, and TypeScript. Deployed on Vercel at https://bijan-parvin-portfolio-fe.vercel.app/.

## Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build (postbuild auto-generates sitemap)
npm run start        # Start production server
npm run lint         # ESLint check
npm run format       # ESLint --fix + Prettier for JSON/YAML
npm run check-types  # TypeScript type checking (tsc --noEmit)
```

Package manager: yarn (1.22.22, specified in `packageManager` field) or npm. Node.js 20.11.0 required.

## Architecture

**Single-page composition** — `app/page.tsx` renders all sections sequentially: Intro, About, Experience, Skills, Projects, FunProjects, Contact. There are no other routes.

**Data layer** — All portfolio content (experiences, projects, skills, nav links) lives in `lib/data.ts` as typed `as const` arrays. Components are purely presentational.

**State management** — Two React Context providers wrap the app in `app/layout.tsx`:

- `ThemeContextProvider` — dark/light mode toggle, persisted to localStorage
- `ActiveSectionContextProvider` — tracks which section is in viewport for nav highlighting

**Scroll-aware navigation** — The `useSectionInView` hook (`lib/hooks.ts`) uses `react-intersection-observer` to detect which section is visible and updates the active section context. A 1-second debounce after manual nav clicks prevents observer conflicts.

**Type system** — `SectionName` type (`lib/types.ts`) is derived from the `links` array in `lib/data.ts`, keeping nav links and section types in sync automatically.

**Server action** — `actions/sendEmail.ts` handles the contact form via Resend API. Requires `RESEND_API_KEY` env var.

**Styling** — Tailwind CSS with custom colors defined in `tailwind.config.js`: `viridianGreen`, `yankeesBlue`, `policeBlue`, `tan`. Dark mode uses `class` strategy.

**Animations** — Framer Motion for entrance animations, scroll-progress effects, and hover interactions on project cards.

## ESLint Configuration

Extends `airbnb-base` + `airbnb-typescript` + `next/core-web-vitals` + Prettier. Key plugins:

- `simple-import-sort` — enforced import/export ordering
- `unused-imports` — auto-removes unused imports
- `tailwindcss` — class ordering (custom classnames allowed)
- `@typescript-eslint/consistent-type-imports` — enforces `import type` usage

## Environment Variables

- `RESEND_API_KEY` — required for contact form email sending (server-side only)
- Google Analytics ID is hardcoded in `app/layout.tsx` (`G-056KJYPZ0M`)
