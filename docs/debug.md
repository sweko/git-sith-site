# DEBUG: A Novel in Code - Build Process

This folder contains the markdown source files for "DEBUG: A Novel in Code" - a tech thriller told through code.

## File Structure

- `content/debug/` - Markdown source files for each chapter
- `debug/` - Generated HTML files (created by build script)
- `scripts/build-debug.ts` - Build script that converts markdown to HTML

## Adding New Chapters

1. Create a new `.md` file in `content/debug/`
2. Add frontmatter at the top of the file:

```markdown
---
title: "Chapter Title"
chapter: "Chapter 1" # Optional: chapter designation
description: "Brief description for the table of contents"
order: 1 # Numerical order for sorting chapters
---

# Your Chapter Content Here
```

3. Run the build script: `npm run build:debug`

## Frontmatter Options

- `title` (required) - Chapter title, used for navigation and page title
- `chapter` (optional) - Chapter designation (e.g., "Chapter 1", "Prologue", "Epilogue")
- `description` (optional) - Brief description shown in table of contents
- `order` (optional) - Numerical order for sorting chapters (default: 0)

## Building

- Build DEBUG section only: `npm run build:debug`
- Build everything: `npm run build` (includes articles, AOC, DEBUG, and sitemap)

## Generated Files

The build script creates:
- `debug/index.html` - Table of contents page
- `debug/[slug].html` - Individual chapter pages (slug generated from title)

## Navigation

The DEBUG section is automatically included in the site navigation on all pages. Chapters include a "Back to Table of Contents" link in the footer.

## Styling

The DEBUG pages use the same CSS as articles (`/assets/css/main.css` and `/assets/css/article.css`), so they'll match the site's visual design automatically.