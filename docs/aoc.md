# Advent Of Code — adding content

Add Markdown files to `content/aoc/` using the filename pattern `day-<DD>-<YYYY>.md` (e.g. `day-01-2025.md`).

Frontmatter supported:
- `title` — optional; otherwise first `#` heading is used
- `description` — optional; used for excerpts

Run the build:

```bash
npm run build:aoc
```

This will output a static `aoc/` folder with:
- `aoc/` (or `aoc/index.html`) — list of years (link-friendly as `/aoc/`)
- `aoc/<YYYY>/` (or `aoc/<YYYY>/index.html`) — list of days for that year (link-friendly as `/aoc/<YYYY>/`)
- `aoc/<YYYY>/<DD>.html` — generated HTML for that day
