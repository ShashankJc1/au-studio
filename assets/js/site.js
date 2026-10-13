/* AU Studio — v3 interactions. GSAP + ScrollTrigger and Lenis when available;
   the page stays complete and usable without them. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var G = !!(window.gsap && window.ScrollTrigger) && !reduce;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var ss = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  if (G) gsap.registerPlugin(ScrollTrigger);

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

  /* Intro curtain (first visit per session) then hero entrance */
  var intro = $(".intro");
  function heroIn() {
    if (!G) return;
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".slide.active .ph img, .slide:first-child .ph img", { scale: 1.25, duration: 2.4, ease: "power3.out" }, 0)
      .from(".hero h1 .ln > span", { yPercent: 110, duration: 1.4, stagger: 0.07 }, 0.25)
      .from(".hero [data-fade]", { y: 24, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.6)
      .from(".header .bar > *", { y: -20, opacity: 0, duration: 1.2, stagger: 0.08 }, 0.5);
  }
  if (intro) {
    if (reduce || !G || ss.get("au3")) { intro.remove(); heroIn(); }
    else {
      ss.set("au3", "1");
      gsap.timeline()
        .from(".intro-word span", { yPercent: 100, opacity: 0, duration: 1, stagger: 0.05, ease: "expo.out" })
        .to(".intro-line i", { scaleX: 1, duration: 1, ease: "power2.inOut" }, 0.2)
        .to(".intro-word span", { yPercent: -100, opacity: 0, duration: 0.6, stagger: 0.03, ease: "expo.in" }, "+=0.15")
        .to(intro, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut", onComplete: function () { intro.remove(); } }, "-=0.2")
        .add(heroIn, "-=0.75");
    }
  } else heroIn();

  /* Header: solid after hero, hides on scroll down */
  var header = $(".header"), lastY = 0, hero = $(".hero");
  function onScroll(y) {
    var limit = hero ? hero.offsetHeight - 90 : 10;
    header.classList.toggle("solid", y > limit || !hero);
    if (!document.body.classList.contains("menu-open")) header.classList.toggle("hide", y > lastY && y > limit + 200);
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

  /* Hero slideshow */
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

  /* Cursor */
  if (fine && !reduce) {
    var c = document.createElement("div"); c.className = "cursor"; c.innerHTML = "<b></b>"; document.body.appendChild(c);
    var mx = -100, my = -100, cx = -100, cy = -100;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; document.body.classList.add("cursor-on"); }, { passive: true });
    document.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-on"); });
    (function loop() { cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2; c.style.transform = "translate(" + cx + "px," + cy + "px)"; requestAnimationFrame(loop); })();
    document.addEventListener("mouseover", function (e) {
      var l = e.target.closest("[data-cursor]");
      if (l) { c.className = "cursor big"; $("b", c).textContent = l.dataset.cursor; return; }
      c.className = e.target.closest("a, button, input, select, label") ? "cursor link" : "cursor";
    });
  }

  if (G) {
    /* Text reveals */
    $$("[data-lines]:not(.hero h1)").forEach(function (el) {
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
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%" } });
      tl.fromTo(el, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut" });
      if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2.2, ease: "expo.out" }, 0.2);
    });
    /* Parallax */
    $$("[data-parallax]").forEach(function (el) {
      var amt = parseFloat(el.dataset.parallax) || 10;
      gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
    });
    /* Hero image drifts as you scroll away */
    if (hero) gsap.to(".slides", { yPercent: 18, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    /* Counters */
    $$("[data-count]").forEach(function (el) {
      var end = parseFloat(el.dataset.count), suf = el.dataset.suffix || "", o = { v: 0 };
      gsap.to(o, { v: end, duration: 2.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString("en-IN") + suf; } });
    });
    /* Pinned horizontal projects */
    var pj = $(".projects");
    if (pj) gsap.matchMedia().add("(min-width: 900px)", function () {
      pj.classList.add("pinned");
      var track = $(".pj-track", pj), bar = $(".pj-progress i", pj);
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tw = gsap.to(track, { x: function () { return -dist(); }, ease: "none", scrollTrigger: { trigger: pj, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: function (s) { if (bar) bar.style.transform = "scaleX(" + s.progress + ")"; } } });
      return function () { pj.classList.remove("pinned"); tw.kill(); gsap.set(track, { x: 0 }); };
    });
  }

  /* Testimonials */
  var voices = $$(".voice"), vi = 0, vt;
  function showVoice(n) { vi = (n + voices.length) % voices.length; voices.forEach(function (v, i) { v.classList.toggle("on", i === vi); }); var c2 = $(".voice-count"); if (c2) c2.textContent = "0" + (vi + 1) + " / 0" + voices.length; clearTimeout(vt); if (!reduce) vt = setTimeout(function () { showVoice(vi + 1); }, 7000); }
  if (voices.length) {
    $("[data-v='prev']").addEventListener("click", function () { showVoice(vi - 1); });
    $("[data-v='next']").addEventListener("click", function () { showVoice(vi + 1); });
    showVoice(0);
  }

  /* Enquiry form (no backend yet: connect to a form service here) */
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
      if (!ok) return;
      var name = (form.elements.name.value || "").trim().split(" ")[0].replace(/[<>&"]/g, "");
      $$(".field, button[type='submit']", form).forEach(function (x) { x.hidden = true; });
      var d = document.createElement("div"); d.className = "done"; d.setAttribute("role", "status");
      d.innerHTML = "<h3>Thank you, " + name + ".</h3><p class='muted'>A designer will call you within one working day to arrange your consultation.</p>";
      form.appendChild(d);
    });
    form.addEventListener("input", function (e) { var f = e.target.closest(".field.invalid"); if (f) { f.classList.remove("invalid"); $(".err", f).textContent = ""; } });
  });

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  window.addEventListener("load", function () { if (G) ScrollTrigger.refresh(); });
})();
