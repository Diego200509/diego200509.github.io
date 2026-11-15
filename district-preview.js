import { translations } from "./content.js";

const opening = document.querySelector("#district-opening");
const openingVideo = document.querySelector("#opening-video");
const skip = document.querySelector("#opening-skip");
const trailer = document.querySelector("#district-trailer");
const trailerToggle = document.querySelector("#trailer-toggle");
const trailerError = document.querySelector("#trailer-error");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const openingKey = "district-opening-seen";
const openingVersion = "2";

function rememberOpening() {
  try { sessionStorage.setItem(openingKey, openingVersion); } catch {}
}

function startOpening() {
  const onHome = !location.hash || location.hash === "#inicio";
  const homeOffset = location.hash === "#inicio" ? document.querySelector("#top").offsetHeight : 0;
  const atTop = () => scrollY <= homeOffset + 16;
  if (!onHome || !atTop() || reducedMotion.matches || navigator.connection?.saveData) return;
  try {
    if (sessionStorage.getItem(openingKey) === openingVersion) return;
  } catch {}
  if (document.hidden) {
    document.addEventListener("visibilitychange", startOpening, { once: true });
    return;
  }

  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  let timeout = setTimeout(() => dismiss(true), 2200);

  function hide() {
    opening.hidden = true;
    openingVideo.removeAttribute("src");
    openingVideo.load();
  }

  function dismiss(fade = false) {
    if (listeners.signal.aborted) return;
    listeners.abort();
    clearTimeout(timeout);
    openingVideo.pause();
    if (opening.contains(document.activeElement)) {
      document.querySelector("#title").focus({ preventScroll: true });
    }
    if (fade === true && !opening.hidden && !reducedMotion.matches) {
      opening.dataset.closing = "";
      setTimeout(hide, 300);
    } else {
      hide();
    }
  }

  function skipOpening() {
    rememberOpening();
    dismiss();
  }

  openingVideo.addEventListener("playing", () => {
    if (document.hidden || !atTop()) return dismiss();
    clearTimeout(timeout);
    opening.dataset.playing = "";
    rememberOpening();
    timeout = setTimeout(() => dismiss(true), 2300);
  }, { ...options, once: true });
  openingVideo.addEventListener("ended", () => dismiss(true), options);
  skip.addEventListener("click", skipOpening, options);
  window.addEventListener("pointerdown", (event) => {
    if (!skip.contains(event.target)) dismiss();
  }, { ...options, capture: true });
  window.addEventListener("focusin", (event) => {
    if (!opening.contains(event.target)) dismiss();
  }, options);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") skipOpening();
  }, options);
  window.addEventListener("hashchange", dismiss, options);
  window.addEventListener("scroll", () => {
    if (!atTop()) dismiss();
  }, { ...options, passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) dismiss();
  }, options);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) dismiss();
  }, options);

  openingVideo.muted = true;
  opening.hidden = false;
  openingVideo.src = "./assets/distrito-intro.mp4";
  openingVideo.play().catch(() => {});
}

function toggleTrailer(show) {
  const key = show ? "hideTrailer" : "showTrailer";
  trailerToggle.dataset.t = key;
  trailerToggle.textContent = translations[document.documentElement.lang][key];
  trailerToggle.setAttribute("aria-expanded", String(show));
  trailerError.hidden = true;
  trailer.hidden = !show;
  if (show) {
    trailer.src = "./assets/distrito-trailer.mp4";
    trailer.play().catch(() => {});
  } else {
    trailer.pause();
    trailer.removeAttribute("src");
    trailer.load();
  }
}

function trailerIsOpen() {
  return trailerToggle.getAttribute("aria-expanded") === "true";
}

trailer.addEventListener("error", () => {
  if (!trailerIsOpen()) return;
  trailer.hidden = true;
  trailerError.hidden = false;
});
trailerToggle.addEventListener("click", () => toggleTrailer(!trailerIsOpen()));
trailerToggle.closest("figure").addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !trailerIsOpen()) return;
  toggleTrailer(false);
  trailerToggle.focus();
});
document.querySelector("#enter").addEventListener("click", () => {
  if (trailerIsOpen()) toggleTrailer(false);
});
trailerToggle.hidden = false;
startOpening();
