document.body.classList.add("has-js");

const progressBar = document.getElementById("progressBar");
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".top-nav__menu a")];
const sideContainer =
  document.getElementById("sideNav") || document.getElementById("sideRail");
const navToggle = document.getElementById("navToggle");
const topMenu = document.getElementById("topMenu");
const revealBlocks = [...document.querySelectorAll(".reveal")];
const countTargets = [...document.querySelectorAll("[data-count-to]")];
const prefersReduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const navMap = new Map(navLinks.map((link) => [link.hash.replace("#", ""), link]));
const sideDots = [];

function seedMotionItems(container, selector, startDelay = 0, step = 70, max = 10) {
  if (!container) return;
  let nodes = [];
  try {
    nodes = [...container.querySelectorAll(selector)];
  } catch (_error) {
    const direct = selector.replace(/^:scope\s*>\s*/, "").trim();
    nodes = [...container.children].filter((child) => {
      if (!(child instanceof Element)) return false;
      if (!direct || direct === "*") return true;
      return child.matches(direct);
    });
  }
  nodes.slice(0, max).forEach((node, idx) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.dataset.motionSeeded === "true") return;
    node.dataset.motionSeeded = "true";
    node.classList.add("motion-item");
    node.style.setProperty("--motion-delay", `${startDelay + idx * step}ms`);
  });
}

function seedMotionByContainer(
  containerSelector,
  itemSelector = ":scope > *",
  startDelay = 90,
  step = 70,
  max = 10
) {
  document.querySelectorAll(containerSelector).forEach((container) => {
    seedMotionItems(container, itemSelector, startDelay, step, max);
  });
}

function getSectionLabel(section) {
  return (
    section.dataset.nav ||
    section.dataset.title ||
    section.dataset.mark ||
    section.id
  );
}

if (sideContainer) {
  const dotClass = sideContainer.classList.contains("side-rail")
    ? "side-rail__dot"
    : "side-nav__dot";

  sections.forEach((section) => {
    const dot = document.createElement("button");
    const label = getSectionLabel(section);
    dot.type = "button";
    dot.className = dotClass;
    dot.dataset.label = label;
    dot.setAttribute("aria-label", `${label} 섹션 이동`);
    dot.addEventListener("click", () => {
      section.scrollIntoView({
        behavior: prefersReduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
    sideContainer.appendChild(dot);
    sideDots.push(dot);
  });
}

if (sections.length) {
  sections.forEach((section) => {
    seedMotionItems(section, ":scope > *", 30, 90, 8);
  });

  seedMotionByContainer(".hero-copy", ":scope > *", 80, 72, 8);
  seedMotionByContainer(".hero-proof", ":scope > *", 150, 56, 8);
  seedMotionByContainer(".hero-stats", ":scope > .hero-stat", 185, 72, 8);

  seedMotionByContainer(
    ".ab-grid, .track-grid, .identity-grid, .step-grid, .cat-grid, .compare-grid, .impact-grid, .timeline, .timeline-row, .mini-grid, .offer-ops, .offer-length, .kpi-row",
    ":scope > *",
    90,
    66,
    12
  );
  seedMotionByContainer(".offer-mix__list", ":scope > li", 120, 54, 8);
}

function closeMobileMenu() {
  if (!topMenu || !navToggle) return;
  topMenu.classList.remove("is-open");
  navToggle.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "메뉴 열기");
}

function toggleMobileMenu() {
  if (!topMenu || !navToggle) return;
  const next = !topMenu.classList.contains("is-open");
  topMenu.classList.toggle("is-open", next);
  navToggle.classList.toggle("is-open", next);
  navToggle.setAttribute("aria-expanded", next ? "true" : "false");
  navToggle.setAttribute("aria-label", next ? "메뉴 닫기" : "메뉴 열기");
}

if (navToggle && topMenu) {
  navToggle.addEventListener("click", toggleMobileMenu);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 760) closeMobileMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 760) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!topMenu.contains(target) && !navToggle.contains(target)) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMobileMenu();
  });
}

function syncActiveState(sectionId) {
  navLinks.forEach((link) => link.classList.remove("is-active"));
  const activeNav = navMap.get(sectionId);
  if (activeNav) activeNav.classList.add("is-active");

  if (!sideDots.length) return;
  sideDots.forEach((dot) => dot.classList.remove("is-active"));
  const idx = sections.findIndex((section) => section.id === sectionId);
  if (idx >= 0 && sideDots[idx]) {
    sideDots[idx].classList.add("is-active");
  }
}

if (revealBlocks.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      }
    },
    { threshold: 0.16 }
  );

  revealBlocks.forEach((item) => revealObserver.observe(item));
}

if (sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        syncActiveState(entry.target.id);
      });
    },
    { threshold: 0.35, rootMargin: "-15% 0px -45% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));
  syncActiveState(sections[0].id);
}

function updateProgress() {
  if (!progressBar) return;
  const doc = document.documentElement;
  const maxScrollable = doc.scrollHeight - doc.clientHeight;
  const ratio = maxScrollable > 0 ? (doc.scrollTop / maxScrollable) * 100 : 0;
  progressBar.style.width = `${Math.max(0, Math.min(100, ratio))}%`;
}

document.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

function formatCountValue(value, decimals = 0) {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(value);
}

function renderCount(target, value) {
  const to = Number(target.dataset.countTo);
  const decimals = Number(
    target.dataset.countDecimals ?? (Number.isInteger(to) ? 0 : 1)
  );
  const prefix = target.dataset.countPrefix ?? "";
  const suffix = target.dataset.countSuffix ?? "";
  const rounded =
    decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value);
  target.textContent = `${prefix}${formatCountValue(rounded, decimals)}${suffix}`;
}

function animateCount(target) {
  if (target.dataset.countStarted === "true") return;
  target.dataset.countStarted = "true";

  const to = Number(target.dataset.countTo);
  if (!Number.isFinite(to)) return;

  const from = Number(target.dataset.countFrom ?? 0);
  const duration = Math.max(300, Number(target.dataset.countDuration ?? 900));

  if (prefersReduceMotion) {
    renderCount(target, to);
    target.classList.add("is-counted");
    return;
  }

  const startTime = performance.now();
  const distance = to - from;
  const easeOutCubic = (t) => 1 - (1 - t) ** 3;

  const tick = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(progress);
    renderCount(target, from + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      renderCount(target, to);
      target.classList.add("is-counted");
    }
  };

  requestAnimationFrame(tick);
}

if (countTargets.length) {
  if (prefersReduceMotion) {
    countTargets.forEach((target) => animateCount(target));
  } else {
    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.45, rootMargin: "0px 0px -10% 0px" }
    );

    countTargets.forEach((target) => countObserver.observe(target));
  }
}

if (!prefersReduceMotion && canHover) {
  const hero = document.getElementById("hero");
  const headline = document.querySelector(".hero__headline");

  if (hero && headline) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      headline.style.transform = `translateY(${y * -8}px) rotateX(${y * 3}deg) rotateY(${x * -5}deg)`;
    });

    hero.addEventListener("pointerleave", () => {
      headline.style.transform = "";
    });
  }
}
