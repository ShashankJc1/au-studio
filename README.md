# AU Studio website

Static website for AU Studio, an interior design and build studio. Plain HTML, CSS and JavaScript, with GSAP (ScrollTrigger, Flip) and Lenis vendored in `assets/vendor/`.

**Live:** https://shashankjc1.github.io/au-studio/

## Pages
- `index.html`: home
- `studio.html`: about the studio, values and process
- `services.html`: services, ways to work together, FAQ
- `projects.html`: filterable portfolio (14 projects)
- `projects/<slug>.html`: one page per project, with a full-screen photo viewer
- `contact.html`: consultation form and contact details
- `careers.html`: open roles
- `404.html`

## How the site is built
The pages are generated. The generator lives outside this repo, in the project's shared files (`au-studio/_build/`):
- `projects.json`: project names, categories, copy and photo list
- `images.py`: resizes the portfolio photos into `assets/img/work/` (800, 1600 and 2400px JPEGs)
- `build.py`: writes every HTML page and `sitemap.xml`

Edit `assets/css/site.css` and `assets/js/site.js` directly; they are not generated.

## Before launch
- Home, Studio and Careers photography is from Unsplash as a placeholder.
- Contact details, figures, testimonials and some project names are sample copy.
- Connect the enquiry forms to a form service (e.g. Web3Forms or Formspree) in `assets/js/site.js`.
