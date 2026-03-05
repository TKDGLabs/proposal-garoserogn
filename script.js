document.body.classList.add("has-js");

const progressBar = document.getElementById("progressBar");
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".top-nav__menu a")];
const sideNav = document.getElementById("sideNav");
const navToggle = document.getElementById("navToggle");
const topMenu = document.getElementById("topMenu");
const revealBlocks = [...document.querySelectorAll(".reveal")];
const prefersReduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const navMap = new Map(navLinks.map((link) => [link.hash.replace("#", ""), link]));
const sideDots = [];

if (sideNav) {
  sections.forEach((section) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "side-nav__dot";
    dot.dataset.title = section.dataset.title || section.id;
    dot.setAttribute("aria-label", section.dataset.title || section.id);
    dot.addEventListener("click", () => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    sideNav.appendChild(dot);
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

  if (sideDots.length) {
    sideDots.forEach((dot) => dot.classList.remove("is-active"));
    const idx = sections.findIndex((section) => section.id === sectionId);
    if (idx >= 0 && sideDots[idx]) {
      sideDots[idx].classList.add("is-active");
    }
  }
}

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

if (revealBlocks.length) {
  revealBlocks.forEach((item) => revealObserver.observe(item));
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      syncActiveState(entry.target.id);
    });
  },
  { threshold: 0.35, rootMargin: "-15% 0px -45% 0px" }
);

if (sections.length) {
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
