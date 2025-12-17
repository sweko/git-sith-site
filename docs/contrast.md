# Contrast test page

A simple interactive contrast checker is available at `dev/contrast.html`.

It:
- Loads the site styles (`/assets/css/main.css` and `/assets/css/article.css`) so results reflect actual site styles
- Renders sample elements (nav, article header, excerpt, code block)
- Checks contrast ratios for three themes: normal, light, dark
- Displays pass/fail using WCAG AA for normal text (4.5:1)

How to use:
1. Open `dev/contrast.html` in a browser (or serve the site and navigate to `/dev/contrast.html`).
2. Click `Run checks` to evaluate contrast across the themes. Results will be shown below with a pass/fail for each element.

Note: This is a client-side check that uses computed styles — it helps catch obvious issues but isn't a replacement for a full automated accessibility audit (e.g., pa11y, axe).
