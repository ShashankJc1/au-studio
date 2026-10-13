/* AU Studio — v3 interactions. GSAP + ScrollTrigger and Lenis when available;
   every page stays complete and usable without them. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var G = !!(window.gsap && window.ScrollTrigger) && !reduce;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var ss = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  if (G) gsap.registerPlugin(ScrollTrigger);
  if (G && window.Flip) gsap.registerPlugin(Flip);

  /* Images: drop any photo that fails so the warm frame shows instead */
  $$(".ph img").forEach(function (img) {
    var bad = function () { img.style.visibility = "hidden"; };
    if (img.complete && img.naturalWidth === 0 && img.src) bad();
    img.addEventListener("error", bad);
  });

  /* Smooth scroll */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    if (G) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href"); if (id.length < 2) return; var t = $(id); if (!t) return;
      e.preventDefault(); closeMenu();
      if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.6 }); else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* Page curtain: lifts on arrival, drops before leaving for another page */
  var curtain = $(".curtain");
  function lift() {
    if (!curtain) return;
    if (!G) { curtain.classList.add("gone"); return; }
    gsap.fromTo(curtain, { clipPath: "inset(0% 0 0% 0)" }, { clipPath: "inset(0% 0 100% 0)", duration: 1.05, ease: "expo.inOut", onComplete: function () { curtain.classList.add("gone"); } });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || !curtain || !G || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download") || /^(mailto|tel|https?:\/\/wa\.me)/.test(a.getAttribute("href"))) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault(); closeMenu();
    curtain.classList.remove("gone"); curtain.style.animation = "none";
    gsap.fromTo(curtain, { clipPath: "inset(100% 0 0% 0)" }, { clipPath: "inset(0% 0 0% 0)", duration: 0.75, ease: "expo.inOut", onComplete: function () { location.href = url.href; } });
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted && curtain) { gsap && gsap.set(curtain, { clipPath: "inset(0% 0 100% 0)" }); curtain.classList.add("gone"); } });

  /* Split [data-lines] text into masked words for reveal */
  $$("[data-lines]").forEach(function (el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(" ")); return; }
            var o = document.createElement("span"); o.className = "ln"; o.style.display = "inline-block";
            var i = document.createElement("span"); i.textContent = w; o.appendChild(i); f.appendChild(o);
          });
          n.replaceWith(f);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    })(el);
  });

  /* Entrances */
  var hero = $(".hero"), cover = $(".cover"), top = hero || cover;
  function pageIn() {
    if (!G) return;
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    if (hero) tl.from(".slide:first-child .ph img", { scale: 1.25, duration: 2.4, ease: "power3.out" }, 0);
    if (cover) tl.from(".cover > .ph img", { scale: 1.2, duration: 2.4, ease: "power3.out" }, 0);
    tl.from(".page-in .ln > span", { yPercent: 110, duration: 1.4, stagger: 0.06 }, 0.25)
      .from(".page-in [data-fade]", { y: 24, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.55)
      .from(".header .bar > *", { y: -20, opacity: 0, duration: 1.2, stagger: 0.08 }, 0.45);
  }
  var intro = $(".intro");
  if (intro) {
    if (reduce || !G || ss.get("au3")) { intro.remove(); lift(); pageIn(); }
    else {
      ss.set("au3", "1"); if (curtain) curtain.classList.add("gone");
      gsap.timeline()
        .from(".intro-word span", { yPercent: 100, opacity: 0, duration: 1, stagger: 0.05, ease: "expo.out" })
        .to(".intro-line i", { scaleX: 1, duration: 1, ease: "power2.inOut" }, 0.2)
        .to(".intro-word span", { yPercent: -100, opacity: 0, duration: 0.6, stagger: 0.03, ease: "expo.in" }, "+=0.15")
        .to(intro, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut", onComplete: function () { intro.remove(); } }, "-=0.2")
        .add(pageIn, "-=0.75");
    }
  } else { lift(); pageIn(); }

  /* Header: transparent over a photo, solid elsewhere; hides on scroll down */
  var header = $(".header"), lastY = 0;
  function onScroll(y) {
    var limit = top ? top.offsetHeight - 90 : -1;
    header.classList.toggle("solid", y > limit);
    if (!document.body.classList.contains("menu-open")) header.classList.toggle("hide", y > lastY && y > Math.max(limit, 0) + 200);
    lastY = y;
  }
  if (lenis) lenis.on("scroll", function (l) { onScroll(l.scroll); }); else window.addEventListener("scroll", function () { onScroll(window.scrollY); }, { passive: true });
  onScroll(window.scrollY);

  /* Mobile menu */
  var mb = $(".menu-btn");
  function closeMenu() { if (!document.body.classList.contains("menu-open")) return; document.body.classList.remove("menu-open"); mb.setAttribute("aria-expanded", "false"); $("b", mb).textContent = "Menu"; if (lenis) lenis.start(); }
  if (mb) mb.addEventListener("click", function () {
    if (document.body.classList.contains("menu-open")) return closeMenu();
    document.body.classList.add("menu-open"); mb.setAttribute("aria-expanded", "true"); $("b", mb).textContent = "Close"; if (lenis) lenis.stop();
    if (G) gsap.from(".menu ol li", { yPercent: 80, opacity: 0, duration: 1, stagger: 0.06, ease: "expo.out", delay: 0.35 });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* Hero slideshow (home) */
  var slides = $$(".slide"), dots = $$(".dots button"), cap = $(".hero-caption"), cnt = $(".counter b"), cur = 0, timer;
  function go(n) {
    if (!slides.length || n === cur) return;
    var prev = slides[cur], next = slides[n]; cur = n;
    dots.forEach(function (d, i) { d.setAttribute("aria-current", i === n ? "true" : "false"); var bar = $("i", d); if (bar) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; } });
    if (cap) cap.innerHTML = "<b>" + next.dataset.title + "</b>" + next.dataset.place;
    if (cnt) cnt.textContent = "0" + (n + 1);
    slides.forEach(function (s) { s.classList.toggle("active", s === next); s.style.zIndex = s === next ? 2 : s === prev ? 1 : 0; });
    next.style.visibility = "visible";
    if (G) {
      gsap.fromTo(next, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "expo.inOut", onComplete: function () { prev.style.visibility = "hidden"; } });
      gsap.fromTo($(".ph img", next), { scale: 1.25 }, { scale: 1.05, duration: 7.5, ease: "power2.out" });
      gsap.to($(".ph img", prev), { scale: 1.12, duration: 1.5, ease: "expo.inOut" });
    } else prev.style.visibility = "hidden";
    schedule();
  }
  function schedule() { clearTimeout(timer); if (!reduce) timer = setTimeout(function () { go((cur + 1) % slides.length); }, 6500); }
  dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); }); });
  if (slides.length) { slides[0].classList.add("active"); schedule(); }

  if (G) {
    /* Text reveals */
    $$("[data-lines]").forEach(function (el) {
      if (el.closest(".page-in")) return;
      gsap.from($$(".ln > span", el), { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.035, scrollTrigger: { trigger: el, start: "top 86%" } });
    });
    $$("[data-up]").forEach(function (el) {
      gsap.from(el, { y: 40, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
    });
    $$("[data-stagger]").forEach(function (w) {
      gsap.from(w.children, { y: 50, opacity: 0, duration: 1.3, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: w, start: "top 85%" } });
    });
    /* Image curtain reveal + inner zoom-out */
    $$("[data-clip]").forEach(function (el) {
      var img = $("img", el);
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%" } });
      tl.fromTo(el, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut" });
      if (img && !img.hasAttribute("data-inpar")) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2.2, ease: "expo.out" }, 0.2);
    });
    /* Parallax: whole element, or the photo inside its frame */
    $$("[data-parallax]").forEach(function (el) {
      var amt = parseFloat(el.dataset.parallax) || 10;
      gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-inpar]").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    });
    /* Photo drifts as you scroll away from a full-height hero */
    if (hero) gsap.to(".slides", { yPercent: 18, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    if (cover) gsap.to(".cover > .ph", { yPercent: 16, ease: "none", scrollTrigger: { trigger: cover, start: "top top", end: "bottom top", scrub: true } });
    /* Counters */
    $$("[data-count]").forEach(function (el) {
      var end = parseFloat(el.dataset.count), suf = el.dataset.suffix || "", o = { v: 0 };
      gsap.to(o, { v: end, duration: 2.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString("en-IN") + suf; } });
    });
  }

  /* Portfolio filters (re-flows the grid with Flip when available) */
  var grid = $(".work-grid");
  if (grid) {
    var cards = $$(".work", grid), btns = $$(".filters button");
    var pattern = ["l", "s", "s", "l", "f"];
    function sizeUp() { var i = 0; cards.forEach(function (c) { if (!c.hidden) c.dataset.size = pattern[i++ % pattern.length]; }); }
    function apply(f, animate) {
      var state = animate && G && window.Flip ? Flip.getState(cards) : null;
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.filter === f ? "true" : "false"); });
      cards.forEach(function (c) { c.hidden = !(f === "all" || c.dataset.type === f); });
      sizeUp();
      if (state) Flip.from(state, { duration: 0.9, ease: "expo.inOut", absolute: true, scale: false, onEnter: function (el) { return gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }); }, onLeave: function (el) { return gsap.to(el, { opacity: 0, duration: 0.4 }); }, onComplete: function () { ScrollTrigger.refresh(); } });
      else if (G) ScrollTrigger.refresh();
    }
    btns.forEach(function (b) { b.addEventListener("click", function () {
      apply(b.dataset.filter, true);
      try { history.replaceState(null, "", b.dataset.filter === "all" ? location.pathname : "?type=" + b.dataset.filter); } catch (e) {}
    }); });
    var q = new URLSearchParams(location.search).get("type");
    if (q && btns.some(function (b) { return b.dataset.filter === q; })) apply(q, false);
  }

  /* Lightbox for project galleries */
  var shots = $$("[data-shot]");
  if (shots.length) {
    var lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Project photos");
    lb.innerHTML = '<div class="lb-top"><span class="count"></span><button type="button" data-lb="close" aria-label="Close">✕</button></div><div class="lb-stage"><img alt=""></div><div class="lb-bot"><button type="button" data-lb="prev" aria-label="Previous photo">←</button><p class="cap"></p><button type="button" data-lb="next" aria-label="Next photo">→</button></div>';
    document.body.appendChild(lb);
    var lbImg = $(".lb-stage img", lb), li = 0, opener = null;
    function show(n) {
      li = (n + shots.length) % shots.length; var s = shots[li];
      $(".count", lb).textContent = String(li + 1).padStart(2, "0") + " / " + String(shots.length).padStart(2, "0");
      $(".cap", lb).textContent = s.dataset.cap || "";
      lbImg.alt = s.dataset.cap || "";
      if (G) gsap.fromTo(lbImg, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" });
      lbImg.src = s.dataset.shot;
    }
    function open(n, from) { opener = from; show(n); lb.classList.add("on"); if (lenis) lenis.stop(); document.documentElement.style.overflow = "hidden"; $("[data-lb='close']", lb).focus(); }
    function shut() { lb.classList.remove("on"); if (lenis) lenis.start(); document.documentElement.style.overflow = ""; if (opener) opener.focus(); }
    shots.forEach(function (s, i) { s.addEventListener("click", function () { open(i, s); }); });
    lb.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lb]"); if (b) { var a = b.dataset.lb; if (a === "close") shut(); else show(li + (a === "next" ? 1 : -1)); return; }
      if (e.target === lb || e.target.classList.contains("lb-stage")) shut();
    });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") shut(); else if (e.key === "ArrowRight") show(li + 1); else if (e.key === "ArrowLeft") show(li - 1);
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(li + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* Testimonials */
  var voices = $$(".voice"), vi = 0, vt;
  function showVoice(n) { vi = (n + voices.length) % voices.length; voices.forEach(function (v, i) { v.classList.toggle("on", i === vi); }); var c2 = $(".voice-count"); if (c2) c2.textContent = "0" + (vi + 1) + " / 0" + voices.length; clearTimeout(vt); if (!reduce) vt = setTimeout(function () { showVoice(vi + 1); }, 7000); }
  if (voices.length) {
    $("[data-v='prev']").addEventListener("click", function () { showVoice(vi - 1); });
    $("[data-v='next']").addEventListener("click", function () { showVoice(vi + 1); });
    showVoice(0);
  }

  /* Enquiry forms (no backend yet: connect to a form service here) */
  $$("form[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var ok = true;
      $$("[required]", form).forEach(function (inp) {
        var f = inp.closest(".field"), er = $(".err", f), v = (inp.value || "").trim(), m = "";
        if (!v) m = "Please fill this in.";
        else if (inp.type === "tel" && v.replace(/\D/g, "").length < 10) m = "Enter a 10-digit phone number.";
        else if (inp.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) m = "Enter an email like name@example.com.";
        f.classList.toggle("invalid", !!m); er.textContent = m; if (m) ok = false;
      });
      if (!ok) { var first = $(".field.invalid input, .field.invalid select", form); if (first) first.focus(); return; }
      var name = (form.elements.name.value || "").trim().split(" ")[0].replace(/[<>&"]/g, "");
      $$(".field, .pills-wrap, button[type='submit']", form).forEach(function (x) { x.hidden = true; });
      var d = document.createElement("div"); d.className = "done"; d.setAttribute("role", "status");
      d.innerHTML = "<h3>Thank you, " + name + ".</h3><p class='muted'>A designer will call you within one working day to arrange your consultation.</p>";
      form.appendChild(d);
    });
    form.addEventListener("input", function (e) { var f = e.target.closest(".field.invalid"); if (f) { f.classList.remove("invalid"); $(".err", f).textContent = ""; } });
  });

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  window.addEventListener("load", function () { if (G) ScrollTrigger.refresh(); });
})();
