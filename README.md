# AU Studio website

Static, responsive website for AU Studio, an interior design and build studio. Plain HTML, CSS and JavaScript, with GSAP, ScrollTrigger, Flip and Lenis vendored in `assets/vendor/` (no build tools or CDN needed at runtime).

**Live:** https://shashankjc1.github.io/au-studio/

## Pages
Home, About, Services, Portfolio, Contact, Careers, plus a 404 page.

Interactive features: style switcher on the hero room, mouse-parallax, pinned horizontal project reel, service hover previews, before/after slider, cost estimator, stacking process cards, portfolio filter with animated layout and project pop-ups, page transitions, custom cursor and smooth scrolling. Motion is turned off for visitors who ask their system for reduced motion.

## Editing
- Page content: `_build/pages/*.html`
- Shared header, footer, contact details (`STUDIO`) and site URL (`SITE_URL`): `_build/build.py`
- Styles: `assets/css/style.css` · Behaviour: `assets/js/main.js` · Illustrations: `assets/js/scenes.js`

After editing, regenerate the pages and sitemap:

```
python3 _build/build.py
```

## Before launch
- Replace sample contact details, stats, testimonials, team and project names.
- Replace the drawn illustrations (`<div class="scene" data-scene=...>`) with real project photos (`<img>`).
- Connect the forms to a form service (e.g. Web3Forms or Formspree) in `assets/js/main.js`.
- Custom domain: add a `CNAME` file containing the domain, point the domain's DNS to GitHub Pages, and update `SITE_URL`.
