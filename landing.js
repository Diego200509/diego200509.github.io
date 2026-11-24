const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const wideLayout = matchMedia("(min-width: 761px)");
const header = document.querySelector("#top");
const main = document.querySelector("#main");
const navigation = [...header.querySelectorAll("nav a[href^='#']")]
  .map(link => ({ link, section: document.querySelector(link.hash) }));
const portrait = document.querySelector(".portrait-frame");
const revealItems = [...document.querySelectorAll("#main [data-reveal]")];
const chapters = [...document.querySelectorAll(".landing-chapter")];
const chapterAnimations = new Set();
const easing = "cubic-bezier(.22,1,.36,1)";
let highlightedChapter = null;

function reveal(target) {
  if (reducedMotion.matches || target.contains(document.activeElement)) return;
  const mode = target.dataset.reveal;
  const items = mode === "sequence" ? [...target.children] : [target];
  const origin = mode === "from-left" && wideLayout.matches ? "-20px 0" : "0 16px";
  items.forEach((item, index) => {
    const animation = item.animate(
      [
        { opacity: .4, translate: origin },
        { opacity: 1, translate: "0 0" }
      ],
      { duration: 620, delay: Math.min(index, 3) * 78, easing, fill: "backwards" }
    );
    chapterAnimations.add(animation);
    const forget = () => chapterAnimations.delete(animation);
    animation.addEventListener("finish", forget, { once: true });
    animation.addEventListener("cancel", forget, { once: true });
  });
}

if ("IntersectionObserver" in window && "animate" in Element.prototype) {
  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      reveal(target);
    }
  }, { rootMargin: "0px 0px -6% 0px" });

  for (const item of revealItems) {
    if (item.getBoundingClientRect().top > innerHeight * .83) observer.observe(item);
  }
}

main.addEventListener("focusin", (event) => {
  for (const animation of chapterAnimations) {
    if (animation.effect.target.contains(event.target)) animation.finish();
  }
});

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
reducedMotion.addEventListener("change", () => {
  resetPortrait();
  if (reducedMotion.matches) {
    for (const animation of chapterAnimations) animation.cancel();
  }
  queueNavigationUpdate();
});

let scrollFrame = 0;
let activeLink = null;

function showDestination() {
  const destination = chapters.find(chapter => "#" + chapter.id === location.hash);
  if (highlightedChapter === destination) return;
  highlightedChapter?.classList.remove("chapter-linked");
  highlightedChapter = destination;
  destination?.classList.add("chapter-linked");
}

function updateNavigation() {
  scrollFrame = 0;
  if (document.body.classList.contains("playing")) return;
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, scrollY / scrollRange));
  const headerBox = header.getBoundingClientRect();
  const marker = headerBox.bottom + Math.min(180, innerHeight * .28);
  const start = innerHeight * .94;
  const atBottom = scrollRange - scrollY < 3 && scrollY > 0;
  let next = null;
  let linkedAtBottom = null;
  for (const { link, section } of navigation) {
    const top = section.getBoundingClientRect().top;
    if (top <= marker) next = link;
    if (atBottom && link.hash === location.hash && top >= headerBox.bottom) linkedAtBottom = link;
  }
  const arrivals = chapters.map((chapter) => {
    const pageTop = chapter.getBoundingClientRect().top + scrollY;
    const beginsAt = pageTop - start;
    const endsAt = Math.min(scrollRange, pageTop - marker);
    const fraction = (scrollY - beginsAt) / Math.max(1, endsAt - beginsAt);
    const arrival = reducedMotion.matches ? 1 : Math.min(1, Math.max(0, fraction));
    return { chapter, arrival };
  });
  header.style.setProperty("--read-progress", progress);
  for (const { chapter, arrival } of arrivals) {
    chapter.style.setProperty("--chapter-arrival", arrival.toFixed(3));
  }
  if (atBottom) next = linkedAtBottom ?? navigation.at(-1)?.link;
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
window.addEventListener("hashchange", () => {
  showDestination();
  queueNavigationUpdate();
});
showDestination();
if ("ResizeObserver" in window) {
  const observer = new ResizeObserver(queueNavigationUpdate);
  observer.observe(main);
  observer.observe(header);
}
document.fonts?.ready.then(queueNavigationUpdate);
queueNavigationUpdate();
