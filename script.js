(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, "0");

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const animate = hasGSAP && !reduce;

  let lenis = null;
  let projST = null; // projects section ની ScrollTrigger (nav click માટે જોઈએ)

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------- Text splitting ---------- */
  $$("[data-split]").forEach((el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.innerHTML = [...text].map((c) => `<span class="ch" aria-hidden="true">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });

  const aboutText = $(".about-text");
  aboutText.innerHTML = aboutText.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");

  /* ---------- Typewriter role ---------- */
  const roles = ["Software Developer", "Web Developer", "Problem Solver", "BCA Student"];
  const roleEl = $("#role");
  if (reduce) {
    roleEl.textContent = roles[0];
  } else {
    let r = 0, c = 0, deleting = false;
    const tick = () => {
      const word = roles[r];
      roleEl.textContent = word.slice(0, c);
      if (!deleting && c < word.length) { c++; setTimeout(tick, 90); }
      else if (!deleting) { deleting = true; setTimeout(tick, 1500); }
      else if (c > 0) { c--; setTimeout(tick, 45); }
      else { deleting = false; r = (r + 1) % roles.length; setTimeout(tick, 350); }
    };
    tick();
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  if (!reduce && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));

  /* ---------- Anchor links ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      setMenu(false);
      if (!lenis || id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (id === "#projects" && projST) lenis.scrollTo(projST.start, { duration: 1.4 });
      else lenis.scrollTo(target, { duration: 1.4 });
    });
  });

  /* ---------- Active nav link ---------- */
  const navLinks = $$("[data-nav]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navLinks.forEach((l) => l.classList.toggle("active", l.dataset.nav === en.target.id));
        }
      });
    }, { rootMargin: "-50% 0px -50% 0px" });
    ["about", "skills", "projects", "journey", "contact"].forEach((id) => io.observe($("#" + id)));
  }

  /* ---------- Back to top + copy email ---------- */
  const toTop = $("#toTop");
  window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 700), { passive: true });
  toTop.addEventListener("click", () => (lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: "smooth" })));

  const copyBtn = $("#copyEmail");
  copyBtn.addEventListener("click", async () => {
    const original = "Copy email";
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
      copyBtn.textContent = "Copied ✓";
    } catch (e) {
      copyBtn.textContent = copyBtn.dataset.email;
    }
    setTimeout(() => (copyBtn.textContent = original), 2000);
  });

  /* ---------- Pointer effects (spotlight, always on) ---------- */
  $$(".skill, .card").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
  const hero = $(".hero");
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--x", `${e.clientX - r.left}px`);
    hero.style.setProperty("--y", `${e.clientY - r.top}px`);
  });

  /* =====================================================
     Animations
     ===================================================== */
  const pre = $(".preloader");

  if (!animate) {
    // Fallback: animation વગર બધું સીધું દેખાડો
    pre.style.display = "none";
    $$(".about-text .w").forEach((w) => (w.style.opacity = 1));
    $$("[data-count]").forEach((n) => (n.textContent = n.dataset.count));
    $(".progress").style.display = "none";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Cursor, magnetic, tilt ---------- */
  if (finePointer) {
    root.classList.add("has-cursor");
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    const xd = gsap.quickTo(dot, "x", { duration: 0.1 });
    const yd = gsap.quickTo(dot, "y", { duration: 0.1 });
    const xr = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const yr = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("mousemove", (e) => { xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); });
    $$("a, button, .card, .skill").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });

    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.3 });
      });
      el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }));
    });

    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotationY: px * 10, rotationX: -py * 10, transformPerspective: 900, duration: 0.4, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.7, ease: "power3.out" }));
    });
  }

  /* ---------- Preloader + hero intro ---------- */
  gsap.set(".hero .ch", { yPercent: 115 });
  gsap.set(".hero .role-line", { opacity: 0, y: 30 });
  gsap.set(".hero .fade", { opacity: 0, y: 24 });

  const heroIntro = () => {
    gsap.timeline({ defaults: { ease: "power4.out" } })
      .to(".hero .ch", { yPercent: 0, duration: 1.1, stagger: 0.06 })
      .to(".hero .role-line", { opacity: 1, y: 0, duration: 0.9 }, "-=0.8")
      .to(".hero .fade", { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, "-=0.6");
  };

  if (lenis) lenis.stop(); else document.body.style.overflow = "hidden";
  const counter = { v: 0 };
  const plCount = $("#plCount");
  gsap.timeline({
    onComplete: () => {
      pre.style.display = "none";
      if (lenis) lenis.start(); else document.body.style.overflow = "";
    },
  })
    .to(counter, { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: () => (plCount.textContent = Math.round(counter.v)) })
    .to(".pl-bar span", { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0)
    .to(".pl-inner", { opacity: 0, y: -24, duration: 0.4 })
    .to(pre, { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
    .call(heroIntro, null, "-=0.5");

  /* ---------- Scroll progress ---------- */
  gsap.to(".progress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
  });

  /* ---------- Navbar hide on scroll down ---------- */
  const nav = $("#nav");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const open = document.body.classList.contains("menu-open");
      nav.classList.toggle("hide", !open && self.direction === 1 && self.scroll() > 240);
    },
  });

  /* ---------- Hero parallax ---------- */
  gsap.to(".b1", { yPercent: -60, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".b2", { yPercent: -30, xPercent: -20, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-inner", { opacity: 0, y: -80, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "75% top", scrub: true } });

  /* ---------- Marquee (scroll સાથે speed વધે) ---------- */
  const mq = $(".marquee-inner");
  mq.appendChild(mq.firstElementChild.cloneNode(true));
  const mqTween = gsap.to(mq, { xPercent: -50, repeat: -1, duration: 28, ease: "none" });
  ScrollTrigger.create({
    onUpdate: (self) => {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 220, 7);
      gsap.to(mqTween, {
        timeScale: boost, duration: 0.2, overwrite: true,
        onComplete: () => gsap.to(mqTween, { timeScale: 1, duration: 1.2 }),
      });
    },
  });

  /* ---------- About words + counters ---------- */
  gsap.to(".about-text .w", {
    opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: ".about", start: "top 65%", end: "bottom 80%", scrub: true },
  });

  $$("[data-count]").forEach((el) => {
    const target = +el.dataset.count;
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: () => gsap.to(obj, { v: target, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(obj.v)) }),
    });
  });
  gsap.from(".stat", {
    opacity: 0, y: 40, stagger: 0.12, duration: 0.8, ease: "power3.out",
    scrollTrigger: { trigger: ".stats", start: "top 90%" },
  });

  /* ---------- Headings ---------- */
  $$(".label, .title, .huge, .contact-sub").forEach((el) => {
    gsap.from(el, { opacity: 0, y: 40, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  /* ---------- Skills ---------- */
  ScrollTrigger.batch(".skill", {
    start: "top 92%",
    onEnter: (batch) => gsap.from(batch, { opacity: 0, y: 60, scale: 0.95, stagger: 0.1, duration: 0.8, ease: "power3.out" }),
  });

  /* ---------- Projects ---------- */
  const mm = gsap.matchMedia();
  const total = $$(".card").length;
  $("#projTotal").textContent = pad(total);

  mm.add("(min-width: 800px)", () => {
    const track = $(".h-track");
    const distance = () => track.scrollWidth - window.innerWidth;
    const fill = $(".proj-fill");
    const cur = $("#projCur");
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".projects",
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          fill.style.transform = `scaleX(${self.progress})`;
          cur.textContent = pad(Math.min(total, Math.floor(self.progress * total) + 1));
        },
      },
    });
    projST = tween.scrollTrigger;
    return () => { projST = null; };
  });

  mm.add("(max-width: 799px)", () => {
    $$(".card").forEach((card) => {
      gsap.from(card, { opacity: 0, y: 60, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 90%" } });
    });
  });

  /* ---------- Journey ---------- */
  gsap.to(".line-fill", {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 70%", scrub: true },
  });
  $$(".step").forEach((step) => {
    gsap.from(step, { opacity: 0, x: 40, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: step, start: "top 88%" } });
  });

  /* ---------- Contact ---------- */
  gsap.from(".contact-links .btn", {
    opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: "back.out(1.7)",
    scrollTrigger: { trigger: ".contact-links", start: "top 92%" },
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
