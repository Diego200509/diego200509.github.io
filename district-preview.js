import { translations } from "./content.js";

const opening = document.querySelector("#district-opening");
const openingVideo = document.querySelector("#opening-video");
const skip = document.querySelector("#opening-skip");
const openingSound = document.querySelector("#opening-sound");
const trailer = document.querySelector("#district-trailer");
const trailerToggle = document.querySelector("#trailer-toggle");
const trailerError = document.querySelector("#trailer-error");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const openingKey = "district-opening-seen";
const openingVersion = "4";
const trailerSource = "./assets/distrito-trailer.mp4?v=district-media";
const openingStallTimeout = 7000;

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
  let timeout;
  let lastTime = 0;

  function waitForPlayback() {
    clearTimeout(timeout);
    timeout = setTimeout(() => dismiss(true), openingStallTimeout);
  }

  function updateSoundLabel() {
    const key = openingVideo.muted ? "enableOpeningSound" : "disableOpeningSound";
    openingSound.dataset.t = key;
    openingSound.textContent = translations[document.documentElement.lang][key];
  }

  async function playOpening() {
    try {
      await openingVideo.play();
    } catch (error) {
      if (listeners.signal.aborted) return;
      if (error.name !== "NotAllowedError") return dismiss(true);
      openingVideo.muted = true;
      try { await openingVideo.play(); } catch { dismiss(true); }
    }
  }

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

  openingVideo.addEventListener("playing", () => {
    if (document.hidden || !atTop()) return dismiss();
    opening.dataset.playing = "";
    updateSoundLabel();
    openingSound.hidden = false;
    waitForPlayback();
  }, { ...options, once: true });
  openingVideo.addEventListener("timeupdate", () => {
    const { currentTime, duration } = openingVideo;
    if (currentTime <= lastTime || !Number.isFinite(duration) || duration <= 0) return;
    lastTime = currentTime;
    opening.style.setProperty("--opening-progress", Math.min(1, currentTime / duration));
    waitForPlayback();
  }, options);
  openingVideo.addEventListener("ended", () => dismiss(true), options);
  openingVideo.addEventListener("error", () => dismiss(true), options);
  openingVideo.addEventListener("volumechange", updateSoundLabel, options);
  openingSound.addEventListener("click", async () => {
    openingVideo.muted = !openingVideo.muted;
    try { await openingVideo.play(); } catch { openingVideo.muted = true; }
  }, options);
  skip.addEventListener("click", dismiss, options);
  window.addEventListener("focusin", (event) => {
    if (!opening.contains(event.target)) dismiss();
  }, options);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismiss();
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

  rememberOpening();
  opening.hidden = false;
  openingVideo.src = trailerSource;
  waitForPlayback();
  playOpening();
}

function toggleTrailer(show) {
  const key = show ? "hideTrailer" : "showTrailer";
  trailerToggle.dataset.t = key;
  trailerToggle.textContent = translations[document.documentElement.lang][key];
  trailerToggle.setAttribute("aria-expanded", String(show));
  trailerError.hidden = true;
  trailer.hidden = !show;
  if (show) {
    trailer.poster = "./assets/distrito-trailer.webp?v=district-media";
    trailer.src = trailerSource;
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
