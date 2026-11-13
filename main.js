import { loadLanguage, projects, saveLanguage, translatePage, translations } from "./content.js";

const get = (id) => document.getElementById(id);
const projectById = new Map(projects.map((project) => [project.id, project]));
const game = get("game");
const viewport = get("viewport");
const entry = get("enter");
const loading = get("loading");
const mapDialog = get("map-dialog");
const projectDialog = get("project-dialog");
const mobile = matchMedia("(pointer: coarse)");
const moveKeys = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);
const arrows = { ArrowUp: "KeyW", ArrowDown: "KeyS" };
let language = loadLanguage();
let world;
let inGame = false;
let opening = false;
let openingRequest = 0;
let detailId = null;
let target = { stop: null, prism: null, restored: false };
let soundContext;

function loadProgress() {
  try {
    const value = JSON.parse(localStorage.getItem("district-progress"));
    return {
      visited: new Set(Array.isArray(value?.visited) ? value.visited.filter(id => projectById.has(id)) : []),
      prisms: new Set(Array.isArray(value?.prisms) ? value.prisms.filter(index => [0, 1, 2].includes(index)) : [])
    };
  } catch { return { visited: new Set(), prisms: new Set() }; }
}

const progress = loadProgress();

function storeProgress() {
  try {
    localStorage.setItem("district-progress", JSON.stringify({ visited: [...progress.visited], prisms: [...progress.prisms] }));
  } catch {}
}

function words() { return translations[language]; }

function renderCards() {
  const template = (project) => {
    const card = document.createElement("button");
    const copy = project[language];
    card.type = "button";
    card.className = "project-card";
    card.dataset.project = project.id;
    card.style.setProperty("--accent", project.accent);
    card.innerHTML = `<span class="project-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${project.icon}</svg></span>
      <span class="project-copy"><small>${copy.kind}</small><strong>${project.name[language]}</strong><span>${copy.short}</span><span class="project-link">${words().detail}</span></span>`;
    card.addEventListener("click", () => openProject(project.id));
    return card;
  };
  get("project-grid").replaceChildren(...projects.map(template));
}

function renderDetail() {
  if (!detailId) return;
  const project = projectById.get(detailId);
  const copy = project[language];
  get("detail-type").textContent = copy.kind;
  get("detail-title").textContent = project.name[language];
  get("detail-content").innerHTML = `<section><h3>${words().problem}</h3><p>${copy.problem}</p></section>
    <section><h3>${words().solution}</h3><p>${copy.solution}</p></section>
    <p class="stack">${(language === "en" && project.stackEn) || project.stack}</p>`;
  get("detail-link").href = project.repo;
}

function openProject(id) {
  detailId = id;
  if (inGame) {
    progress.visited.add(id);
    storeProgress();
    renderProgress();
    world.pause(true);
  }
  renderDetail();
  projectDialog.showModal();
}

function renderProgress() {
  get("visited").textContent = words().visited(progress.visited.size);
}

function renderMap() {
  const createDestination = (project) => {
    const button = document.createElement("button");
    const label = document.createElement("span");
    const subtitle = document.createElement("small");
    const status = document.createElement("small");
    button.type = "button";
    button.dataset.destination = project.id;
    label.textContent = project[language].location;
    subtitle.textContent = project.name[language];
    status.textContent = progress.visited.has(project.id) ? words().seen : words().unseen;
    button.append(label, subtitle, status);
    button.addEventListener("click", () => {
      mapDialog.close();
      world.moveTo(project.id);
      focusWorld();
    });
    return button;
  };
  const plaza = document.createElement("span");
  plaza.className = "map-plaza";
  plaza.textContent = words().plaza;
  get("map-list").replaceChildren(createDestination(projectById.get("rgb")), createDestination(projectById.get("asotema")), plaza,
    createDestination(projectById.get("edurural")), createDestination(projectById.get("traffic")));
}

function renderTarget() {
  const { stop, prism, restored } = target;
  const action = get("interact");
  const objective = get("objective");
  action.hidden = !stop;
  action.textContent = words().interact;
  if (!stop) {
    objective.textContent = words().explore;
    return;
  }
  const name = projectById.get(stop).name[language];
  if (stop === "rgb" && !restored) {
    objective.textContent = prism === null
      ? `${words().lab} · ${progress.prisms.size}/3`
      : `${words().aimed} ${words()[["red", "green", "blue"][prism]]} · ${progress.prisms.size}/3`;
    action.textContent = words().nextPrism;
    return;
  }
  objective.textContent = stop === "rgb" ? words().labDone : `${name} · ${words().use}`;
  action.textContent = words().detail;
}

function render() {
  translatePage(language);
  document.querySelector(".brand").setAttribute("aria-label", words().home);
  get("cv-link").href = "./cv.html?lang=" + language;
  get("game-language").textContent = language === "es" ? "EN" : "ES";
  get("game-language").setAttribute("aria-label", words().switchLanguage);
  viewport.setAttribute("aria-label", words().focusGame);
  get("controls-text").textContent = mobile.matches ? words().touchControls : words().controls;
  get("game-error").textContent = words().gameError;
  renderCards();
  renderProgress();
  renderTarget();
  if (mapDialog.open) renderMap();
  if (projectDialog.open) renderDetail();
  world?.setLabels(Object.fromEntries(projects.map((project) => [project.id, project.name[language]])));
}

function changeLanguage(next) {
  language = next;
  saveLanguage(language);
  render();
}

function focusWorld() {
  viewport.focus({ preventScroll: true });
}

function playPrism(index) {
  if (!soundContext || soundContext.state !== "running") return;
  const time = soundContext.currentTime;
  const oscillator = soundContext.createOscillator();
  const gain = soundContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime([440, 554, 659][index], time);
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.exponentialRampToValueAtTime(0.075, time + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  oscillator.connect(gain).connect(soundContext.destination);
  oscillator.start();
  oscillator.stop(time + 0.33);
}

async function enterGame() {
  if (inGame || opening) return;
  opening = true;
  const request = ++openingRequest;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (Audio) {
      soundContext ??= new Audio();
      soundContext.resume().catch(() => {});
    }
  } catch {}

  get("game-error").hidden = true;
  game.hidden = false;
  loading.hidden = false;
  get("game-bottom").hidden = true;
  get("main").inert = true;
  get("top").inert = true;
  document.body.classList.add("playing");
  get("exit").focus();
  try {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (request !== openingRequest) return;
    if (!world) {
      const { createWorld } = await import("./world.js");
      if (request !== openingRequest) return;
      world = createWorld(viewport, {
        onTarget(state) {
          target = state;
          renderTarget();
        },
        onProject: openProject,
        onPrism(index) {
          progress.prisms.add(index);
          storeProgress();
          playPrism(index);
          renderTarget();
        }
      });
    }
    if (request !== openingRequest) return;
    inGame = true;
    world.start(progress.prisms);
    render();
    loading.hidden = true;
    get("game-bottom").hidden = false;
    focusWorld();
  } catch (error) {
    if (request !== openingRequest) return;
    console.warn("Distrito Cero could not start its 3D view", error);
    exitGame();
    get("game-error").hidden = false;
  } finally {
    if (request === openingRequest) opening = false;
  }
}

function exitGame() {
  openingRequest++;
  inGame = false;
  opening = false;
  world?.stop();
  game.hidden = true;
  get("main").inert = false;
  get("top").inert = false;
  document.body.classList.remove("playing");
  entry.focus({ preventScroll: true });
}

function anyDialogOpen() { return mapDialog.open || projectDialog.open; }

for (const button of document.querySelectorAll("[data-lang]")) {
  button.addEventListener("click", () => changeLanguage(button.dataset.lang));
}
entry.addEventListener("click", enterGame);
get("exit").addEventListener("click", exitGame);
get("game-language").addEventListener("click", () => changeLanguage(language === "es" ? "en" : "es"));
get("map-button").addEventListener("click", () => {
  if (!inGame) return;
  renderMap();
  world.pause(true);
  mapDialog.showModal();
});
get("interact").addEventListener("click", () => {
  world?.interact();
  if (!anyDialogOpen()) focusWorld();
});
for (const dialog of [mapDialog, projectDialog]) {
  dialog.addEventListener("close", () => {
    if (!inGame) return;
    world.pause(false);
    focusWorld();
  });
}
window.addEventListener("keydown", (event) => {
  if (!inGame || anyDialogOpen() || event.ctrlKey || event.metaKey || event.altKey) return;
  const code = moveKeys.has(event.code) ? event.code : arrows[event.code];
  if (code) {
    event.preventDefault();
    world.setMove(code, true);
  } else if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
    event.preventDefault();
    world.look(event.code === "ArrowLeft" ? 0.075 : -0.075);
  } else if (event.code === "KeyE" && !event.repeat) {
    world.interact();
  } else if (event.code === "Escape" && !event.repeat) {
    exitGame();
  }
});
window.addEventListener("keyup", (event) => world?.setMove(arrows[event.code] || event.code, false));
window.addEventListener("blur", () => {
  for (const key of moveKeys) world?.setMove(key, false);
});
for (const control of document.querySelectorAll("[data-move]")) {
  control.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    control.setPointerCapture(event.pointerId);
    world?.setMove(control.dataset.move, true);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    control.addEventListener(type, () => world?.setMove(control.dataset.move, false));
  }
}
mobile.addEventListener("change", () => {
  get("controls-text").textContent = mobile.matches ? words().touchControls : words().controls;
});

viewport.tabIndex = 0;
render();
entry.disabled = false;
