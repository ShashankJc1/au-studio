#!/usr/bin/env python3
"""Assemble AU Studio pages from _build/pages/*.html fragments.

Each fragment starts with a metadata comment:
    <!-- title: About | desc: ... | nav: about -->
The shared <head>, header and footer below are wrapped around it and the
result is written to the site root (one level up). Edit the fragments or the
shared parts here, then run:  python3 _build/build.py
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = pathlib.Path(__file__).resolve().parent / "pages"

SITE_URL = "https://shashankjc1.github.io/au-studio"  # change when the custom domain is live

# ---- Studio details: change once here ------------------------------------
STUDIO = {
    "phone": "+91 98765 43210",
    "phone_href": "+919876543210",
    "phone2": "+91 80 4000 0000",
    "phone2_href": "+918040000000",
    "email": "hello@austudio.in",
    "whatsapp": "919876543210",
    "address": "2nd Floor, 14 Lavelle Road, Bengaluru 560001",
    "maps": "https://maps.google.com/?q=AU+Studio+Bengaluru",
    "hours": "Mon to Sat, 10:00 to 19:00",
}

NAV = [("index", "Home"), ("about", "About"), ("services", "Services"),
       ("portfolio", "Portfolio"), ("contact", "Contact"), ("careers", "Careers")]

ICONS = {
    "instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    "facebook": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-2.8 0-4 1.8-4 4.5V11H7v4h3v9h4v-9h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"/></svg>',
    "linkedin": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4v12H4zM6 3a2 2 0 110 4 2 2 0 010-4zm5 6h3.8v1.7c.6-1 1.9-2 3.9-2 4 0 4.3 2.6 4.3 6V21h-4v-5.5c0-1.4 0-3.1-1.9-3.1s-2.1 1.5-2.1 3V21h-4z"/></svg>',
    "youtube": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 8.2a3 3 0 00-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 002 8.2 31 31 0 001.6 12 31 31 0 002 15.8a3 3 0 002.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 002.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15V9l5.2 3z"/></svg>',
    "pinterest": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.5 2.1-4.5 4.4 0 .9.3 1.8.8 2.3l.1.4-.3 1.1c0 .2-.2.2-.4.1-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1 0-2-.5-2.4-1.2l-.6 2.5c-.2.9-.9 2.1-1.3 2.8A10 10 0 1012 2z"/></svg>',
    "whatsapp": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>',
}

def socials():
    links = [("instagram", "https://instagram.com/"), ("facebook", "https://facebook.com/"),
             ("linkedin", "https://linkedin.com/"), ("pinterest", "https://pinterest.com/"),
             ("youtube", "https://youtube.com/")]
    return '<div class="socials">' + "".join(
        f'<a href="{u}" target="_blank" rel="noopener" aria-label="AU Studio on {n.title()}">{ICONS[n]}</a>' for n, u in links) + "</div>"

LOGO = '<svg class="logo-mark" viewBox="0 0 38 46" aria-hidden="true"><path d="M2 45V20a17 17 0 0134 0v25"/><text x="19" y="37" text-anchor="middle">AU</text></svg>'
LIBS = """<script src="assets/vendor/gsap.min.js" defer></script>
<script src="assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="assets/vendor/Flip.min.js" defer></script>
<script src="assets/vendor/lenis.min.js" defer></script>"""

def head(title, desc):
    full = "AU Studio | Interior Design & Build Studio" if title == "Home" else f"{title} | AU Studio"
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{full}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#18211E">
<meta property="og:type" content="website">
<meta property="og:title" content="{full}">
<meta property="og:description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2318211E'/%3E%3Cpath d='M14 56V30a18 18 0 0136 0v26' fill='none' stroke='%23D4AC64' stroke-width='3'/%3E%3Ctext x='32' y='48' font-family='Georgia' font-size='17' fill='%23E9EAE5' text-anchor='middle'%3EAU%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/css/style.css">
{LIBS}
<script src="assets/js/scenes.js" defer></script>
<script src="assets/js/main.js" defer></script>
</head>
<body>"""

def header(active):
    cur = ' aria-current="page"'
    items = "".join(
        f'<li><a href="{k}.html"{cur if k == active else ""}>{label}</a></li>' for k, label in NAV)
    menu = "".join(
        f'<li><a href="{k}.html"><small>0{i+1}</small>{label}</a></li>' for i, (k, label) in enumerate(NAV))
    s = STUDIO
    return f"""
<a class="skip" href="#main">Skip to content</a>
<div class="loader" aria-hidden="true">
  <svg viewBox="0 0 88 110"><path d="M4 108V48a40 40 0 0180 0v60"/><text class="lt" x="44" y="88" text-anchor="middle">AU</text></svg>
  <span class="cap">AU Studio · Interior design &amp; build</span>
  <span class="pct">00</span>
</div>
<div class="curtain" aria-hidden="true"></div>
<header class="site-header">
  <nav class="nav wrap" aria-label="Main">
    <a class="logo" href="index.html" aria-label="AU Studio home">{LOGO}<span class="logo-text">AU Studio<small>Interior design</small></span></a>
    <ul class="nav-links">{items}</ul>
    <div class="nav-right">
      <a class="btn magnetic" href="contact.html#quote"><span class="dot"></span>Free consultation</a>
      <button class="menu-btn" aria-controls="menu" aria-expanded="false"><b>Menu</b><i></i></button>
    </div>
  </nav>
</header>
<div class="menu" id="menu">
  <ol>{menu}</ol>
  <div class="menu-foot"><span>{s['phone']}</span><span>{s['email']}</span><span>{s['hours']}</span></div>
</div>
<main id="main">"""

def footer():
    s = STUDIO
    return f"""</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-top">
      <div>
        <a class="logo" href="index.html" aria-label="AU Studio home" style="margin-bottom:22px">{LOGO}<span class="logo-text">AU Studio<small style="color:var(--deep-muted)">Interior design</small></span></a>
        <p style="color:var(--deep-muted)">Design and build studio for homes, hospitality, retail and workplaces.</p>
        <form class="news" novalidate aria-label="Newsletter"><input id="news-email" type="email" placeholder="Your email for our monthly letter" aria-label="Email address"><button type="submit">Subscribe</button></form>
        <p class="news-msg" role="status"></p>
      </div>
      <div>
        <h4>Studio</h4>
        <ul><li><a href="about.html">About</a></li><li><a href="services.html">Services</a></li><li><a href="portfolio.html">Portfolio</a></li><li><a href="careers.html">Careers</a></li><li><a href="contact.html">Contact</a></li></ul>
      </div>
      <div>
        <h4>Spaces</h4>
        <ul><li><a href="portfolio.html#home">Homes</a></li><li><a href="portfolio.html#salon">Salons &amp; spas</a></li><li><a href="portfolio.html#cafe">Cafés &amp; restaurants</a></li><li><a href="portfolio.html#office">Offices</a></li><li><a href="portfolio.html#clinic">Clinics</a></li></ul>
      </div>
      <div>
        <h4>Visit</h4>
        <ul><li>{s['address']}</li><li><a href="tel:{s['phone_href']}">{s['phone']}</a></li><li><a href="mailto:{s['email']}">{s['email']}</a></li><li>{s['hours']}</li></ul>
        <div style="margin-top:18px">{socials()}</div>
      </div>
    </div>
    <p class="foot-word" aria-hidden="true">AU Studio</p>
    <div class="foot-bottom">
      <span>© <span data-year>2026</span> AU Studio. All rights reserved.</span>
      <span><a href="contact.html">Privacy</a> · <a href="sitemap.xml">Sitemap</a></span>
    </div>
  </div>
</footer>
<a class="wa-float" href="https://wa.me/{s['whatsapp']}" target="_blank" rel="noopener" aria-label="Chat with AU Studio on WhatsApp">{ICONS['whatsapp']}<span>Chat with us</span></a>
</body>
</html>
"""

def render(text):
    for k, v in STUDIO.items():
        text = text.replace("{{" + k + "}}", v)
    return text.replace("{{socials}}", socials())

def main():
    urls = []
    for frag in sorted(PAGES.glob("*.html")):
        raw = frag.read_text()
        m = re.match(r"<!--\s*(.*?)\s*-->\s*", raw, re.S)
        meta = dict(p.split(":", 1) for p in m.group(1).split("|"))
        meta = {k.strip(): v.strip() for k, v in meta.items()}
        body = render(raw[m.end():])
        page = head(meta["title"], meta["desc"]) + header(meta.get("nav", frag.stem)) + body + footer()
        (ROOT / frag.name).write_text(page)
        if frag.stem != "404": urls.append(frag.name)
        print("built", frag.name)
    sm = "".join(f"  <url><loc>{SITE_URL}/{u}</loc></url>\n" for u in urls)
    (ROOT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{sm}</urlset>\n')

if __name__ == "__main__":
    main()
