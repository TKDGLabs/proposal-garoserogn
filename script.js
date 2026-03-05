document.body.classList.add("has-js");

const progressBar = document.getElementById("progressBar");
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".top-nav__menu a")];
const sideContainer =
  document.getElementById("sideNav") || document.getElementById("sideRail");
const navToggle = document.getElementById("navToggle");
const topMenu = document.getElementById("topMenu");
const revealBlocks = [...document.querySelectorAll(".reveal")];
const prefersReduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const navMap = new Map(navLinks.map((link) => [link.hash.replace("#", ""), link]));
const sideDots = [];

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

if (!prefersReduceMotion) {
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
