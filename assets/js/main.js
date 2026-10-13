/* AU Studio — v2 interactions.
   Uses GSAP + ScrollTrigger (+ Flip) and Lenis when they load; every feature
   degrades to a usable static page without them. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger) && !reduce;
  var store = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  if (hasGsap) { gsap.registerPlugin(ScrollTrigger); if (window.Flip) gsap.registerPlugin(Flip); root.classList.add("js-motion"); }
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else { (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0); }
  }
  function scrollTo(target) { if (lenis) lenis.scrollTo(target, { offset: -90 }); else if (target.scrollIntoView) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) { var id = a.getAttribute("href"); if (id.length < 2) return; var t = $(id); if (t) { e.preventDefault(); scrollTo(t); } });
  });

  /* ---------- Loader (first visit in a session only) ---------- */
  var loader = $(".loader");
  function intro() { if (hasGsap) heroIntro(); }
  if (loader) {
    if (reduce || store.get("au-seen")) { loader.remove(); intro(); }
    else {
      store.set("au-seen", "1");
      var pct = $(".pct", loader), t0 = performance.now(), dur = 1300;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        pct.textContent = String(Math.round(100 * (1 - Math.pow(1 - p, 3)))).padStart(2, "0");
        if (p < 1) requestAnimationFrame(tick);
        else { loader.classList.add("done"); intro(); setTimeout(function () { loader.remove(); }, 1000); }
      })(t0);
    }
  } else intro();

  /* ---------- Page curtain ---------- */
  var curtain = $(".curtain");
  if (curtain && !reduce) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a"); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var href = a.getAttribute("href") || "";
      if (a.target || /^(https?:|mailto:|tel:|#)/.test(href) || !/\.html|^\.\/?$/.test(href)) return;
      if (a.closest(".menu")) closeMenu();
      e.preventDefault(); curtain.classList.add("in");
      setTimeout(function () { window.location.href = a.href; }, 520);
    });
    window.addEventListener("pageshow", function () { curtain.classList.remove("in"); });
  }

  /* ---------- Header + menu ---------- */
  var header = $(".site-header"), lastY = 0;
  function onScroll(y) {
    if (!header) return;
    header.classList.toggle("scrolled", y > 10);
    if (!document.body.classList.contains("menu-open")) header.classList.toggle("hide", y > lastY && y > 400);
    lastY = y;
  }
  if (lenis) lenis.on("scroll", function (l) { onScroll(l.scroll); });
  else window.addEventListener("scroll", function () { onScroll(window.scrollY); }, { passive: true });
  onScroll(window.scrollY);

  var menuBtn = $(".menu-btn");
  function closeMenu() { document.body.classList.remove("menu-open"); if (menuBtn) { menuBtn.setAttribute("aria-expanded", "false"); $("b", menuBtn).textContent = "Menu"; } if (lenis) lenis.start(); }
  if (menuBtn) menuBtn.addEventListener("click", function () {
    var open = !document.body.classList.contains("menu-open");
    if (!open) return closeMenu();
    document.body.classList.add("menu-open"); menuBtn.setAttribute("aria-expanded", "true"); $("b", menuBtn).textContent = "Close";
    if (lenis) lenis.stop();
    if (hasGsap) gsap.from(".menu ol li", { yPercent: 60, opacity: 0, stagger: 0.06, duration: 0.8, ease: "expo.out", delay: 0.15 });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- Custom cursor ---------- */
  if (fine && !reduce) {
    var dot = document.createElement("div"), ring = document.createElement("div");
    dot.className = "cursor"; ring.className = "cursor-ring"; document.body.append(dot, ring);
    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; root.classList.add("has-cursor"); document.body.classList.add("has-cursor"); }, { passive: true });
    document.addEventListener("mouseleave", function () { document.body.classList.remove("has-cursor"); });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function (e) {
      var lab = e.target.closest("[data-cursor]");
      if (lab) { ring.className = "cursor-ring label"; ring.textContent = lab.dataset.cursor; return; }
      ring.textContent = "";
      ring.className = e.target.closest("a, button, label, input, select, textarea, summary") ? "cursor-ring hover" : "cursor-ring";
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduce) $$(".magnetic").forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = "translate(" + x * 0.25 + "px," + y * 0.35 + "px)";
    });
    el.addEventListener("mouseleave", function () { el.style.transition = "transform .6s cubic-bezier(.2,.7,.1,1)"; el.style.transform = ""; setTimeout(function () { el.style.transition = ""; }, 600); });
  });

  /* ---------- Split headings into masked words ---------- */
  $$("[data-split]").forEach(function (el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var m = document.createElement("span"); m.className = "split-line"; m.style.display = "inline-block";
            var s = document.createElement("span"); s.textContent = part; m.appendChild(s); frag.appendChild(m);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
  });

  function heroIntro() {
    var h = $("[data-split='hero']");
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    if (h) tl.from($$(".split-line > span", h), { yPercent: 110, rotate: 4, duration: 1.3, stagger: 0.06 });
    tl.from("[data-intro]", { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, "-=1");
    var stage = $(".stage");
    if (stage) tl.from(stage, { clipPath: "inset(18% 8% 0% 8% round 22px)", duration: 1.6, ease: "expo.inOut" }, "-=1.2")
      .from($$(".stage .layer"), { y: 60, opacity: 0, duration: 1.2, stagger: 0.08 }, "-=1");
  }

  if (hasGsap) {
    /* Headings split on other pages / sections */
    $$("[data-split]:not([data-split='hero'])").forEach(function (el) {
      gsap.from($$(".split-line > span", el), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.04, scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    /* Generic reveals */
    $$("[data-reveal]").forEach(function (el) {
      gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
    });
    $$("[data-stagger]").forEach(function (wrap) {
      gsap.from(wrap.children, { y: 50, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: wrap, start: "top 88%" } });
    });
    /* Image parallax */
    $$(".px > .scene").forEach(function (el) {
      gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: el.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    });
    /* Scroll parallax on hero stage */
    if ($(".stage")) gsap.to(".stage svg", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".stage", start: "top top+=100", end: "bottom top", scrub: true } });
  }

  /* ---------- Statement word highlight ---------- */
  $$(".statement").forEach(function (el) {
    el.innerHTML = el.innerHTML.replace(/(<[^>]+>)|([^\s<]+)/g, function (m, tag, word) { return tag ? tag : '<span class="w">' + word + "</span>"; });
    if (hasGsap) gsap.to($$(".w", el), { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
  });

  /* ---------- Counters ---------- */
  function fmt(n) { return Math.round(n).toLocaleString("en-IN"); }
  $$("[data-count]").forEach(function (el) {
    var end = parseFloat(el.dataset.count), suf = el.dataset.suffix || "";
    if (!hasGsap) { el.textContent = fmt(end) + suf; return; }
    var o = { v: 0 };
    gsap.to(o, { v: end, duration: 2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: function () { el.textContent = fmt(o.v) + suf; } });
  });

  /* ---------- Velocity marquee ---------- */
  $$(".marquee-track").forEach(function (track) {
    if (!hasGsap) return;
    var x = 0, dir = -1, speed = 0.6, half = 0;
    var measure = function () { half = track.scrollWidth / 2; }; measure(); window.addEventListener("resize", measure);
    var boost = 0;
    ScrollTrigger.create({ onUpdate: function (self) { dir = self.direction === 1 ? -1 : 1; boost = Math.min(18, Math.abs(self.getVelocity()) / 120); } });
    gsap.ticker.add(function () {
      boost *= 0.92; x += dir * (speed + boost);
      if (x <= -half) x += half; if (x > 0) x -= half;
      track.style.transform = "translate3d(" + x + "px,0,0)";
    });
  });

  /* ---------- Hero stage: style switcher + mouse parallax ---------- */
  var STYLES = {
    japandi: { name: "Japandi calm", note: "Pale oak, lime plaster and linen, with nothing extra.", v: { wall: "#DCD6CB", wall2: "#CFC7B9", floor: "#B89C7C", wood: "#9A7B5A", fabric: "#F1ECE3", accent: "#5E6B55", dark: "#2E2A25", glass: "#EEF0EA", sky: "#F4E8D2", rug: "#E7DFD1", art: "#6F7E66", leaf: "#6C7F5F" } },
    midcentury: { name: "Mid-century warmth", note: "Teak, mustard and olive, with tapered legs.", v: { wall: "#E4D6BE", wall2: "#D7C5A6", floor: "#8C5E3C", wood: "#7A4A2A", fabric: "#D9A441", accent: "#4D5B34", dark: "#2B2119", glass: "#F2EAD9", sky: "#F6D9A5", rug: "#C9B48C", art: "#C2552E", leaf: "#556B37" } },
    coastal: { name: "Coastal light", note: "Chalk white, washed blue and rattan.", v: { wall: "#E3EAEC", wall2: "#D2DEE2", floor: "#C9B79C", wood: "#B49470", fabric: "#F7F7F3", accent: "#4F7A93", dark: "#26343C", glass: "#F3F8FA", sky: "#CFE6F2", rug: "#E6ECEE", art: "#6E9CB3", leaf: "#6F8F72" } },
    deco: { name: "Art deco evening", note: "Deep green, velvet and brass in the evening.", v: { wall: "#203B33", wall2: "#1A3029", floor: "#3D2A22", wood: "#5B3A26", fabric: "#B5763E", accent: "#D4AC64", dark: "#0F1A16", glass: "#40564F", sky: "#E8B86A", rug: "#6B2F2B", art: "#D4AC64", leaf: "#3F6A50" } },
    industrial: { name: "Soft industrial", note: "Micro-cement, blackened steel and cognac leather.", v: { wall: "#B9BAB5", wall2: "#A9AAA4", floor: "#7F7B74", wood: "#6E4D35", fabric: "#9A5B34", accent: "#1F2321", dark: "#1A1C1B", glass: "#DCE0DE", sky: "#EFE6D6", rug: "#5B5E5A", art: "#C9A05A", leaf: "#556A50" } }
  };
  var stage = $(".stage");
  if (stage) {
    var note = $(".styler-note b"), noteP = $(".styler-note p"), sw = $$(".swatches i");
    var apply = function (key) {
      var s = STYLES[key]; if (!s) return;
      Object.keys(s.v).forEach(function (k) { stage.style.setProperty("--r-" + k, s.v[k]); });
      if (note) note.textContent = s.name; if (noteP) noteP.textContent = s.note;
      ["wall", "fabric", "wood", "accent", "art"].forEach(function (k, i) { if (sw[i]) sw[i].style.background = s.v[k]; });
      $$(".styler-panel button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.style === key ? "true" : "false"); });
    };
    $$(".styler-panel button").forEach(function (b) { b.addEventListener("click", function () { apply(b.dataset.style); auto = false; }); });
    apply("japandi");
    var keys = Object.keys(STYLES), idx = 0, auto = true;
    var cycle = setInterval(function () { if (!auto || document.hidden) return; idx = (idx + 1) % keys.length; apply(keys[idx]); }, 4200);
    stage.addEventListener("mouseenter", function () { auto = false; });
    if (reduce) { clearInterval(cycle); }
    if (fine && !reduce) {
      var layers = $$(".layer", stage), tx = 0, ty = 0, cx = 0, cy = 0;
      stage.addEventListener("mousemove", function (e) { var r = stage.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; });
      stage.addEventListener("mouseleave", function () { tx = 0; ty = 0; });
      (function loop() {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        layers.forEach(function (l) { var d = parseFloat(l.dataset.depth || 0); l.setAttribute("transform", "translate(" + (-cx * d) + " " + (-cy * d * 0.5) + ")"); });
        requestAnimationFrame(loop);
      })();
    }
  }

  /* ---------- Horizontal project reel ---------- */
  var reel = $(".reel");
  if (reel && hasGsap) {
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", function () {
      reel.classList.add("pinned");
      var track = $(".reel-track", reel), bar = $(".reel-progress i", reel);
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tw = gsap.to(track, { x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: reel, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true,
          onUpdate: function (self) { if (bar) bar.style.transform = "scaleX(" + self.progress + ")"; } } });
      return function () { reel.classList.remove("pinned"); tw.kill(); gsap.set(track, { x: 0 }); };
    });
  }

  /* ---------- Service list hover preview ---------- */
  var list = $(".svc-list");
  if (list && fine && window.AUScenes) {
    var pv = document.createElement("div"); pv.className = "hover-preview"; pv.innerHTML = '<div class="scene"></div>'; document.body.appendChild(pv);
    var pScene = $(".scene", pv), px = 0, py = 0, qx = 0, qy = 0, live = false;
    list.addEventListener("mousemove", function (e) { px = e.clientX; py = e.clientY; });
    $$(".svc-item", list).forEach(function (it) {
      it.addEventListener("mouseenter", function () {
        pScene.innerHTML = ""; pScene.dataset.scene = it.dataset.pscene; pScene.dataset.tone = it.dataset.ptone; AUScenes.draw(pv); pv.classList.add("on");
        if (!live) { live = true; qx = px; qy = py; }
      });
    });
    list.addEventListener("mouseleave", function () { pv.classList.remove("on"); });
    (function loop() { qx += (px - qx) * 0.14; qy += (py - qy) * 0.14; pv.style.left = qx + 40 + "px"; pv.style.top = qy + "px"; requestAnimationFrame(loop); })();
  }

  /* ---------- Before / after ---------- */
  $$(".ba").forEach(function (ba) {
    var r = $("input", ba);
    var set = function (v) { ba.style.setProperty("--pos", v + "%"); };
    r.addEventListener("input", function () { set(r.value); });
    set(r.value);
    if (hasGsap) {
      var o = { v: 85 };
      gsap.to(o, { v: 50, duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: ba, start: "top 70%" }, onUpdate: function () { if (!ba.dataset.touched) { r.value = o.v; set(o.v); } } });
      r.addEventListener("pointerdown", function () { ba.dataset.touched = "1"; });
    }
  });

  /* ---------- Warranty ring ---------- */
  $$(".ring .fg").forEach(function (c) {
    var len = 2 * Math.PI * 48; c.style.strokeDasharray = len; c.style.strokeDashoffset = hasGsap ? len : 0;
    if (hasGsap) gsap.to(c, { strokeDashoffset: 0, duration: 2, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 85%" } });
  });

  /* ---------- Process cards: scale back as the next one stacks ---------- */
  if (hasGsap) {
    var pcs = $$(".pcard");
    pcs.forEach(function (card, i) {
      if (i === pcs.length - 1) return;
      gsap.to(card, { scale: 0.94, opacity: 0.55, ease: "none", scrollTrigger: { trigger: pcs[i + 1], start: "top bottom-=100", end: "top 140px", scrub: true } });
    });
  }

  /* ---------- Cost estimator ---------- */
  var est = $("#estimator");
  if (est) {
    var RATES = { home: 1450, kitchen: 2400, salon: 1900, cafe: 2200, office: 1600, clinic: 1800 };
    var FINISH = { essential: 0.8, premium: 1, luxe: 1.55 };
    var SPLIT = { home: [44, 22, 18, 16], kitchen: [64, 8, 16, 12], salon: [34, 18, 30, 18], cafe: [32, 22, 28, 18], office: [36, 20, 26, 18], clinic: [30, 24, 28, 18] };
    var area = $("#e-area", est), areaOut = $("#e-area-out", est);
    var total = $("#e-total"), rate = $("#e-rate"), weeks = $("#e-weeks"), design = $("#e-design"), bars = $$(".bar-split i");
    var lakh = function (n) { return n >= 1e7 ? "₹" + (n / 1e7).toFixed(2) + " Cr" : "₹" + (n / 1e5).toFixed(1) + " L"; };
    var shown = 0;
    var calc = function () {
      var a = +area.value, type = $("input[name='e-type']:checked", est).value, fin = $("input[name='e-finish']:checked", est).value;
      areaOut.textContent = a.toLocaleString("en-IN") + " sq.ft";
      area.style.setProperty("--fill", ((a - area.min) / (area.max - area.min) * 100) + "%");
      var r = RATES[type] * FINISH[fin], mid = a * r;
      var lo = mid * 0.9, hi = mid * 1.12;
      var target = mid;
      if (hasGsap) { var o = { v: shown }; gsap.to(o, { v: target, duration: 0.6, ease: "power3.out", onUpdate: function () { shown = o.v; total.textContent = lakh(o.v * 0.9) + " to " + lakh(o.v * 1.12); } }); }
      else total.textContent = lakh(lo) + " to " + lakh(hi);
      rate.textContent = "₹" + Math.round(r).toLocaleString("en-IN") + " / sq.ft";
      weeks.textContent = Math.round(Math.min(20, Math.max(4, 3 + a / 220 + (fin === "luxe" ? 3 : 0)))) + " weeks";
      design.textContent = a <= 600 ? "1 week" : a <= 2000 ? "2 to 3 weeks" : "3 to 5 weeks";
      SPLIT[type].forEach(function (p, i) { if (bars[i]) bars[i].style.flexGrow = p; });
    };
    est.addEventListener("input", calc); calc();
  }

  /* ---------- Testimonials drag + buttons ---------- */
  $$(".quotes").forEach(function (q) {
    var down = false, sx = 0, sl = 0;
    q.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; sx = e.clientX; sl = q.scrollLeft; q.classList.add("dragging"); });
    window.addEventListener("pointermove", function (e) { if (down) q.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener("pointerup", function () { down = false; q.classList.remove("dragging"); });
    var step = function () { var c = q.querySelector(".quote"); return c ? c.getBoundingClientRect().width + 18 : 400; };
    var prev = $("[data-q='prev']"), next = $("[data-q='next']");
    if (prev) prev.addEventListener("click", function () { q.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { q.scrollBy({ left: step(), behavior: "smooth" }); });
  });

  /* ---------- Portfolio filter (Flip) + lightbox ---------- */
  var filterBar = $(".filters");
  if (filterBar) {
    var cards = $$(".pf-grid .pf-card");
    var applyFilter = function (cat) {
      var state = hasGsap && window.Flip ? Flip.getState(cards) : null;
      $$("button", filterBar).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.filter === cat ? "true" : "false"); });
      cards.forEach(function (c) { c.classList.toggle("hide", !(cat === "all" || c.dataset.cat === cat)); });
      if (state) Flip.from(state, { duration: 0.7, ease: "expo.inOut", scale: true, absolute: true, onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }); }, onLeave: function (els) { return gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.4 }); }, onComplete: function () { ScrollTrigger.refresh(); } });
    };
    filterBar.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) applyFilter(b.dataset.filter); });
    var counts = {}; cards.forEach(function (c) { counts[c.dataset.cat] = (counts[c.dataset.cat] || 0) + 1; });
    $$("button", filterBar).forEach(function (b) { var n = b.dataset.filter === "all" ? cards.length : counts[b.dataset.filter] || 0; b.insertAdjacentHTML("beforeend", "<sup>" + n + "</sup>"); });
    var initial = (location.hash || "").slice(1);
    if (initial && $('[data-filter="' + initial + '"]', filterBar)) applyFilter(initial);
  }
  var lb = $("dialog.lightbox");
  if (lb) {
    var lbCards = $$(".pf-grid .pf-card"), cur = 0;
    var show = function (i) {
      var vis = lbCards.filter(function (c) { return !c.classList.contains("hide"); });
      cur = (i + vis.length) % vis.length; var card = vis[cur];
      var sc = $(".scene", lb); sc.innerHTML = ""; sc.dataset.scene = card.dataset.scene; sc.dataset.tone = card.dataset.tone;
      if (window.AUScenes) AUScenes.draw(lb);
      $("[data-lb='title']", lb).textContent = card.dataset.title;
      $("[data-lb='specs']", lb).innerHTML = $(".specs", card).innerHTML;
      $("[data-lb='brief']", lb).textContent = card.dataset.brief;
      $("[data-lb='materials']", lb).textContent = card.dataset.materials;
      $("[data-lb='count']", lb).textContent = (cur + 1) + " / " + vis.length;
    };
    lbCards.forEach(function (card) {
      card.addEventListener("click", function () {
        var vis = lbCards.filter(function (c) { return !c.classList.contains("hide"); });
        show(vis.indexOf(card)); if (lb.showModal) lb.showModal(); else lb.setAttribute("open", ""); if (lenis) lenis.stop();
      });
    });
    lb.addEventListener("close", function () { if (lenis) lenis.start(); });
    $(".lb-close", lb).addEventListener("click", function () { lb.close(); });
    $("[data-lb='prev']", lb).addEventListener("click", function () { show(cur - 1); });
    $("[data-lb='next']", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") show(cur + 1); if (e.key === "ArrowLeft") show(cur - 1); });
  }

  /* ---------- Forms ---------- */
  $$("form[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", form).forEach(function (input) {
        var field = input.closest(".field"), err = field && $(".err", field), msg = "", v = (input.value || "").trim();
        if (!v) msg = "Please fill this in.";
        else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Enter an email like name@example.com.";
        else if (input.type === "tel" && v.replace(/\D/g, "").length < 10) msg = "Enter a 10-digit phone number.";
        if (field) field.classList.toggle("invalid", !!msg); if (err) err.textContent = msg; if (msg) ok = false;
      });
      if (!ok) { var first = $(".invalid input, .invalid select, .invalid textarea", form); if (first) first.focus(); return; }
      /* No backend yet: send the data to a form service here (e.g. Web3Forms, Formspree). */
      var name = ((form.elements.name || {}).value || "there").split(" ")[0].replace(/[<>&"]/g, "");
      $$(".field, button[type='submit'], .form-note", form).forEach(function (el) { el.hidden = true; });
      var done = document.createElement("div"); done.className = "form-done"; done.setAttribute("role", "status");
      done.innerHTML = "<h3>Thank you, " + name + ".</h3><p>" + (form.dataset.done || "A designer will call you within one working day to set up your free consultation.") + "</p>";
      form.appendChild(done);
      if (hasGsap) gsap.from(done, { y: 20, opacity: 0, duration: 0.8, ease: "expo.out" });
    });
    form.addEventListener("input", function (e) { var f = e.target.closest(".field.invalid"); if (f) { f.classList.remove("invalid"); var er = $(".err", f); if (er) er.textContent = ""; } });
  });
  $$(".news").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault(); var i = $("input", f), msg = f.nextElementSibling;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())) { msg.textContent = "Enter a valid email address."; return; }
      msg.textContent = "You're on the list. Expect one short letter a month."; i.value = "";
    });
  });

  /* ---------- Copy buttons ---------- */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault(); var label = btn.textContent;
      var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = label; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(btn.dataset.copy).then(done, function () {});
    });
  });

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  window.addEventListener("load", function () { if (hasGsap) ScrollTrigger.refresh(); });
})();
