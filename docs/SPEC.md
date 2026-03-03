# Blog Specification

## Overview

A personal blog built with Astro using the UINUX Blog theme. The site is a calm, writing-first static blog optimized for long-form posts, deployed to Cloudflare Pages.

**Repository:** `git@github.com:bstrong/blog.git`

## Technology Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Framework | Astro (static output) | Via UINUX Blog theme |
| Theme | [Get-UINUX/uinux-blog](https://github.com/Get-UINUX/uinux-blog) | Cloned as project base, not installed as dependency |
| Package manager | bun | Used for all install/script/CI operations. Not officially tier-1 for Astro; accept compatibility risk. |
| Linting/formatting | Biome | Covers .ts, .js, .json. Does not lint inside .astro files. |
| Git hooks | Lefthook | Pre-commit hook runs Biome check |
| CI/CD | GitHub Actions + Wrangler | Single workflow: lint, build, deploy |
| Hosting | Cloudflare Pages | Static site deployment via Wrangler |
| Analytics | Cloudflare Web Analytics | Server-side, no JS snippet required |
| OG images | astro-og-canvas | Build-time PNG generation per post |

## Content Model

### Blog Posts

Posts live in `src/content/posts/` as `.md` or `.mdx` files.

**Frontmatter schema (unchanged from theme):**

```yaml
---
title: string       # Post heading
description: string # Summary text for listings and meta tags
date: YYYY-MM-DD    # Publication date
---
```

No tags, categories, or draft field. The schema stays minimal.

**Draft workflow:** Drafts are managed via git branches. Write a post on a branch; merge to `main` when ready to publish. A template draft post exists on a dedicated branch (e.g., `draft/template`) for reference, never merged to main.

### Draft Template Post

A reference post on the `draft/template` branch demonstrating:
- Correct frontmatter format
- Markdown patterns used in the theme (headings, code blocks, links, images)
- Expected file naming convention (kebab-case slug, e.g., `my-first-post.md`)

## Site Structure

### Pages

| Route | Source | Description |
|-------|--------|-------------|
| `/` | `src/pages/index.astro` | Homepage: bio teaser + post list |
| `/about` | `src/pages/about.astro` | Full bio page |
| `/posts/[slug]` | `src/pages/posts/[...slug].astro` | Individual post pages |
| `/rss.xml` | `src/pages/rss.xml.ts` | RSS feed |

**Removed from theme:** `/search` and `search-index.json.ts` are deleted.

### Homepage (`/`)

The homepage has two sections:

1. **Bio teaser** — A short 2-3 sentence introduction at the top of the page, followed by a link to `/about` (e.g., "Read more about me"). Content:

   > I'm a software developer in Austin, TX. I've worked across mobile, WebRTC and live streaming, and a variety of other things along the way.

2. **Post list** — Chronological list of published posts (title, date, description), identical to the current theme homepage.

**Empty state:** When no posts exist, the post list section displays a brief message (e.g., "Posts coming soon.") rather than rendering an empty container.

### About Page (`/about`)

Full bio expanding on the homepage teaser. Content covers:
- Professional background (mobile development, WebRTC, live streaming)
- Location (Austin, TX)
- Other relevant experience and interests

This is a static `.astro` page, not a content collection entry.

### Nav Component

Modify `src/components/Nav.astro` to include:

| Element | Type | Target |
|---------|------|--------|
| Site title | Text link | `/` |
| Home | Text link | `/` |
| About | Text link | `/about` |
| GitHub | Inline SVG icon | `https://github.com/bstrong` |
| LinkedIn | Inline SVG icon | `https://www.linkedin.com/in/strongben/` |

The Search link is removed from the nav.

Social icons are small inline SVGs (GitHub octocat, LinkedIn logo) placed after the text navigation links. Icons open in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).

## Site Identity

| Property | Value |
|----------|-------|
| Site title | Full name (displayed in nav and metadata) |
| Site description | Used in RSS feed, OG tags, and meta description |
| Site URL | Custom domain (configured in astro.config and Cloudflare Pages) |

## Styling

All theme defaults are preserved:

- **Light mode only** — No dark mode toggle or dark theme CSS
- **Body font:** Newsreader (serif)
- **Heading font:** Inter (sans-serif)
- **Content width:** 640px max
- **Design tokens:** Defined in `src/styles/global.css`

No custom CSS beyond what's needed for the bio teaser section and social icon sizing/alignment in the nav.

## OG Image Generation

Use `astro-og-canvas` to generate Open Graph PNG images at build time.

**Configuration:**
- Generate one OG image per post using the post's `title` and `date`
- Generate a default OG image for the homepage and about page using the site title
- Template: text on a simple background consistent with the site's typography choices
- Images served from a generated route (e.g., `/og/[slug].png`)

**Integration with existing SEO:** The theme already includes OG meta tags in the Layout component. Update the `og:image` meta tag to reference the generated image URL.

## RSS Feed

Keep the existing RSS feed at `/rss.xml`. Configure with:
- Site title and description
- Full site URL (custom domain)
- Post title, description, date, and permalink for each published post

## Linting and Formatting

### Biome

**Config file:** `biome.json` at project root.

**Scope:** All `.ts`, `.js`, and `.json` files. Biome does not process `.astro` files.

**Rules:** Use Biome's recommended defaults. Configure:
- Formatter: indent with tabs or spaces (match theme's existing style)
- Linter: recommended rule set
- Organize imports: enabled

**Scripts in `package.json`:**
```json
{
  "lint": "biome check .",
  "lint:fix": "biome check --write .",
  "format": "biome format --write ."
}
```

### Lefthook

**Config file:** `lefthook.yml` at project root.

**Pre-commit hook:** Runs `biome check --staged` (or equivalent) on staged files only, so commits are fast regardless of project size.

**Installation:** `bun add --dev @biomejs/biome lefthook` then `bunx lefthook install`.

## CI/CD

### GitHub Actions — Single Workflow

**File:** `.github/workflows/ci.yml`

**Trigger:** Push to `main` branch only.

**Jobs (sequential steps in one job):**

1. **Checkout** — Clone the repository
2. **Setup bun** — Install bun (pinned version via `oven-sh/setup-bun`)
3. **Install dependencies** — `bun install --frozen-lockfile`
4. **Lint** — `bun run lint` (Biome check). Fails the workflow on lint errors.
5. **Build** — `bun run build` (Astro static build). Output in `dist/`.
6. **Deploy** — `npx wrangler pages deploy dist/ --project-name=<project>` using `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets.

**Required GitHub Secrets:**

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |

### Cloudflare Pages Project

- **Build output directory:** `dist/`
- **Framework preset:** None (build happens in GitHub Actions, not Cloudflare's build system)
- **Custom domain:** Configured in Cloudflare Pages dashboard. Requires a CNAME record from the external DNS provider pointing to `<project>.pages.dev`.

## Analytics

Cloudflare Web Analytics enabled via the Cloudflare dashboard on the Pages project. No code changes required — analytics data is collected at the edge from server-side request data.

## Directory Structure (Final)

```
blog/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Lint + build + deploy workflow
├── docs/
│   └── SPEC.md                     # This file
├── public/                         # Static assets (favicon, etc.)
├── src/
│   ├── components/
│   │   ├── Layout.astro            # Page framework + metadata + fonts
│   │   ├── Nav.astro               # Navigation (modified: +social icons, -search)
│   │   ├── Footer.astro            # Footer
│   │   ├── Heading.astro           # Typographic hierarchy
│   │   ├── Article.astro           # Post container with metadata
│   │   └── Prose.astro             # Markdown styling
│   ├── content/
│   │   ├── config.ts               # Content collection schema
│   │   └── posts/                  # Blog post markdown files
│   ├── pages/
│   │   ├── index.astro             # Homepage (modified: +bio teaser, +empty state)
│   │   ├── about.astro             # About page (full bio)
│   │   ├── rss.xml.ts              # RSS feed
│   │   ├── og/[...slug].png.ts     # Generated OG images (new)
│   │   └── posts/[...slug].astro   # Dynamic post routes
│   └── styles/
│       └── global.css              # Design variables + base styles
├── biome.json                      # Biome config
├── lefthook.yml                    # Git hooks config
├── astro.config.mjs                # Astro configuration
├── package.json                    # Dependencies and scripts
├── bun.lockb                       # Bun lockfile
└── tsconfig.json                   # TypeScript config
```

**Removed from theme:**
- `src/pages/search.astro`
- `src/pages/search-index.json.ts`

**Added:**
- `.github/workflows/ci.yml`
- `biome.json`
- `lefthook.yml`
- `src/pages/og/[...slug].png.ts` (OG image generation route)
- `docs/SPEC.md`

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dark mode | Light only | Matches theme philosophy; avoids custom CSS/JS overhead |
| Social link placement | Nav header | Visible on every page without cluttering the bio |
| Social link style | Inline SVG icons | Recognizable, compact, no external dependency |
| Homepage layout | Bio teaser above post list | Posts remain the focus; bio provides context |
| About page | Separate full page linked from homepage | Avoids content duplication; single source of truth for bio |
| Content types | Posts only | YAGNI; can add collections later if needed |
| Post metadata | Title + description + date only | Theme default; minimal maintenance |
| Draft mechanism | Git branches | No schema changes; natural git workflow |
| Search | Removed | Low value for a new blog with few posts |
| Linter/formatter | Biome | Single tool, fast, minimal config |
| Lint enforcement | Pre-commit hook + CI | Catches issues locally and enforces remotely |
| Git hooks | Lefthook | Single binary, bun-friendly, simple YAML config |
| Deploy method | GitHub Actions + Wrangler | Full control over bun build environment |
| Deploy trigger | Push to main | Simple; single committer doesn't need PR previews |
| OG images | astro-og-canvas | Astro-native, no sharp dependency, bun-compatible |
| RSS | Kept | Free at build time; meaningful distribution channel |
| Analytics | Cloudflare Web Analytics | Already in CF ecosystem; no JS snippet; privacy-respecting |
| Package manager | Bun everywhere | Accepted compatibility risk with Astro |
