const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector("#top");
const navigation = [...header.querySelectorAll("nav a[href^='#']")]
  .map(link => ({ link, section: document.querySelector(link.hash) }));
const portrait = document.querySelector(".portrait-frame");
const revealItems = [...document.querySelectorAll("#main [data-reveal]")];

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (!reducedMotion.matches && !target.contains(document.activeElement)) {
        target.animate(
          [{ opacity: .48, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 520, easing: "cubic-bezier(.21,.72,.32,1)" }
        );
      }
    }
  }, { rootMargin: "0px 0px -7% 0px", threshold: .08 });

  for (const item of revealItems) {
    if (item.getBoundingClientRect().top > innerHeight * .83) observer.observe(item);
  }
}

let pointerFrame = 0;
let offsetX = 0;
let offsetY = 0;

function resetPortrait() {
  cancelAnimationFrame(pointerFrame);
  pointerFrame = 0;
  portrait.style.removeProperty("--portrait-x");
  portrait.style.removeProperty("--portrait-y");
  portrait.classList.remove("portrait-active");
}

portrait.addEventListener("pointermove", (event) => {
  if (reducedMotion.matches || event.pointerType !== "mouse") return;
  const bounds = portrait.getBoundingClientRect();
  offsetX = (event.clientX - bounds.left) / bounds.width - .5;
  offsetY = (event.clientY - bounds.top) / bounds.height - .5;
  if (pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0;
    portrait.classList.add("portrait-active");
    portrait.style.setProperty("--portrait-x", offsetX);
    portrait.style.setProperty("--portrait-y", offsetY);
  });
});

portrait.addEventListener("pointerleave", resetPortrait);
reducedMotion.addEventListener("change", resetPortrait);

let scrollFrame = 0;
let activeLink = null;

function updateNavigation() {
  scrollFrame = 0;
  if (document.body.classList.contains("playing")) return;
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  header.style.setProperty("--read-progress", Math.min(1, Math.max(0, scrollY / scrollRange)));
  const marker = header.getBoundingClientRect().bottom + Math.min(180, innerHeight * .28);
  let next = null;
  for (const { link, section } of navigation) {
    if (section.getBoundingClientRect().top <= marker) next = link;
  }
  if (scrollRange - scrollY < 3 && scrollY > 0) next = navigation.at(-1).link;
  if (next === activeLink) return;
  activeLink?.removeAttribute("aria-current");
  next?.setAttribute("aria-current", "location");
  activeLink = next;
}

function queueNavigationUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateNavigation);
}

window.addEventListener("scroll", queueNavigationUpdate, { passive: true });
window.addEventListener("resize", queueNavigationUpdate);
window.addEventListener("hashchange", queueNavigationUpdate);
document.fonts?.ready.then(queueNavigationUpdate);
queueNavigationUpdate();
