# Blog

Personal blog built with [Astro](https://astro.build) and the [UINUX Blog Theme](https://astro.build/themes/details/uinux-blog/), deployed on [Cloudflare Pages](https://pages.cloudflare.com).

## Setup

```sh
bun install
bunx lefthook install
```

## Development

```sh
bun run dev
```

The site will be available at `http://localhost:4321`.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Build static site to `dist/` |
| `bun run preview` | Preview the build locally |
| `bun run lint` | Run Biome linter |
| `bun run lint:fix` | Run Biome linter with auto-fix |
| `bun run format` | Format files with Biome |

## Adding a Post

Create a new `.md` or `.mdx` file in `src/content/posts/`:

```md
---
title: "Post Title"
description: "A short summary for listings and meta tags"
date: 2026-01-01
---

Post content goes here.
```

The filename becomes the URL slug (e.g., `my-post.md` -> `/posts/my-post`).

Drafts are managed via git branches -- write on a branch, merge to `main` to publish.

## CI/CD

Pushes to `main` trigger a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs lint and build. Deployment to Cloudflare Pages via Wrangler is configured but currently disabled in the workflow.
