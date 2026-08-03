document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const groupToggles = document.querySelectorAll(".nav-group-toggle");

const closeGroups = (exception = null) => {
  groupToggles.forEach((toggle) => {
    if (toggle === exception) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.closest(".nav-group")?.classList.remove("open");
  });
};

const setMenu = (open) => {
  if (!menu || !menuToggle || !header) return;

  menu.classList.toggle("is-open", open);
  header.classList.toggle("menu-active", open);
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  if (!open) closeGroups();
};

groupToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const opening = toggle.getAttribute("aria-expanded") !== "true";
    closeGroups(toggle);
    toggle.setAttribute("aria-expanded", String(opening));
    toggle.closest(".nav-group")?.classList.toggle("open", opening);
  });
});

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeGroups();
  setMenu(false);
  menuToggle?.focus();
});

document.addEventListener("click", (event) => {
  if (event.target instanceof Node && !event.target.closest?.(".nav-group")) {
    closeGroups();
  }
});

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("is-scrolled", window.scrollY > 24),
  { passive: true },
);

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

