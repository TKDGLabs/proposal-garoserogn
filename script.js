document.body.classList.add("has-js");

const progressBar = document.getElementById("progressBar");
const sections = [...document.querySelectorAll("section[id]")];
const navLinks = [...document.querySelectorAll(".top-nav__menu a")];
const sideNav = document.getElementById("sideNav");
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
