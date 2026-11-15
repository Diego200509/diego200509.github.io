import { loadLanguage, projects, saveLanguage, translatePage, translations } from "./content.js";
import { experience, experienceMarkup } from "./experience.js";
import { setupMission } from "./game/mission.js";
import { archiveProjects, renderArchiveCards } from "./project-archive.js";
import { mountContactFooter } from "./site-footer.js";

mountContactFooter();
const get = (id) => document.getElementById(id);
const projectById = new Map(projects.map((project) => [project.id, project]));
const ambacar = experience.find((entry) => entry.id === "ambacar");
const destinations = ["rgb", "asotema", "talkapp", "ambacar", "traffic"];
const game = get("game");
const viewport = get("viewport");
const entry = get("enter");
const loading = get("loading");
const cameraButton = get("camera-button");
const mapButton = get("map-button");
const helpButton = get("help-button");
const mapDialog = get("map-dialog");
const projectDialog = get("project-dialog");
const missionDialog = get("mission-dialog");
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
let loadStage = 0;
let thirdPerson = false;
let showControls = false;

function loadProgress() {
  try {
    const value = JSON.parse(localStorage.getItem("district-progress"));
    return {
      visited: new Set(Array.isArray(value?.visited) ? value.visited.filter(id => destinations.includes(id)) : []),
      prisms: new Set(Array.isArray(value?.prisms) ? value.prisms.filter(index => [0, 1, 2].includes(index)) : []),
      workshop: value?.workshop === true
    };
  } catch { return { visited: new Set(), prisms: new Set(), workshop: false }; }
}

const progress = loadProgress();

function storeProgress() {
  try {
    localStorage.setItem("district-progress", JSON.stringify({
      visited: [...progress.visited], prisms: [...progress.prisms], workshop: progress.workshop
    }));
  } catch {}
}

function words() { return translations[language]; }

const workshopMission = setupMission(missionDialog, () => language, () => {
  progress.workshop = true;
  progress.visited.add(ambacar.id);
  storeProgress();
  world.completeMission();
  renderProgress();
  renderTarget();
}, () => openProject(ambacar.id));

function renderCards() {
  for (const project of projects) {
    const copy = project[language];
    get(project.id + "-title").textContent = project.name[language];
    get(project.id + "-kind").textContent = copy.kind;
    get(project.id + "-description").textContent = copy.short;
  }
  renderArchiveCards(get("more-project-grid"), language, archiveProjects.slice(0, 4), "h4");
}

function renderDetail() {
  if (!detailId) return;
  const link = get("detail-link");
  if (detailId === ambacar.id) {
    link.hidden = false;
    get("detail-type").textContent = words().experience;
    get("detail-title").textContent = "Ambacar S.A.";
    get("detail-content").innerHTML = `<article class="experience-details">${experienceMarkup(ambacar, language)}</article>`;
    link.href = "./cv.html?lang=" + language + "#cv-experience";
    link.removeAttribute("target");
    link.textContent = words().readCv;
    return;
  }
  const project = projectById.get(detailId);
  const copy = project[language];
  const demoNote = !inGame && words()[project.demoNote];
  const features = copy.features ? `<section>
      <h3>${words().projectFeatures}</h3>
      <ul>${copy.features.map(feature => `<li>${feature}</li>`).join("")}</ul>
    </section>` : "";
  get("detail-type").textContent = copy.kind;
  get("detail-title").textContent = project.name[language];
  get("detail-content").innerHTML = `<section><h3>${words().problem}</h3><p>${copy.problem}</p></section>
    <section><h3>${words().solution}</h3><p>${copy.solution}</p></section>
    ${features}
    ${demoNote ? `<p>${demoNote}</p>` : ""}
    <p class="stack">${(language === "en" && project.stackEn) || project.stack}</p>`;
  link.hidden = !project.repo;
  if (project.repo) {
    link.href = project.repo;
    link.target = "_blank";
    link.textContent = words().source;
  } else {
    link.removeAttribute("href");
  }
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
  get("visited").textContent = words().visited(progress.visited.size, destinations.length);
}

function renderMap() {
  const createDestination = (id) => {
    const project = projectById.get(id);
    const button = document.createElement("button");
    const label = document.createElement("span");
    const subtitle = document.createElement("small");
    const status = document.createElement("small");
    button.type = "button";
    button.dataset.destination = id;
    label.textContent = project?.[language].location ?? words().garage;
    subtitle.textContent = project?.name[language] ?? "Ambacar";
    status.textContent = progress.visited.has(id) ? words().seen : words().unseen;
    button.append(label, subtitle, status);
    button.addEventListener("click", () => {
      mapDialog.close();
      world.moveTo(id);
      focusWorld();
    });
    return button;
  };
  const plaza = document.createElement("span");
  plaza.className = "map-plaza";
  plaza.textContent = words().plaza;
  const buttons = destinations.map(createDestination);
  buttons.splice(2, 0, plaza);
  get("map-list").replaceChildren(...buttons);
}

function renderTarget() {
  const { stop, prism, restored, interaction } = target;
  const action = get("interact");
  const objective = get("objective");
  action.hidden = !stop;
  objective.hidden = !stop;
  action.textContent = words().interact;
  if (!stop) {
    objective.textContent = "";
    return;
  }
  if (stop === ambacar.id) {
    objective.textContent = interaction === "inside" ? words().workshopInside :
      progress.workshop ? words().workshopDone : `${words().garage} · Ambacar`;
    const prompts = { door: "workshopDoor", "door-open": "workshopEnter", terminal: "workshopTerminal" };
    action.hidden = interaction === "inside";
    if (!action.hidden) action.textContent = words()[prompts[interaction]];
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

function renderExperience() {
  const list = get("experience-list");
  const expanded = new Set([...list.querySelectorAll("details[open]")].map(details => details.closest("article").dataset.experience));
  list.innerHTML = experience.map((entry) =>
    `<article data-experience="${entry.id}">
      <div class="experience-icon" aria-hidden="true"><svg focusable="false"><use href="./assets/landing-icons.svg#${entry.icon}"></use></svg></div>
      ${experienceMarkup(entry, language, words().experienceDetails, expanded.has(entry.id))}
    </article>`).join("");
}

function renderCamera() {
  const mode = thirdPerson ? words().thirdPerson : words().firstPerson;
  cameraButton.setAttribute("aria-pressed", String(thirdPerson));
  cameraButton.setAttribute("aria-label", `${words().camera} · ${mode}`);
  get("camera-status").textContent = mode;
  game.dataset.camera = thirdPerson ? "third" : "first";
}

function renderControls() {
  helpButton.setAttribute("aria-expanded", String(showControls));
  get("controls-text").textContent = mobile.matches ? words().touchControls : words().controls;
  get("controls-text").hidden = !showControls;
  get("touch-controls").hidden = !mobile.matches || !showControls;
  game.dataset.touch = String(mobile.matches && showControls);
}

function setLoadStage(stage) {
  loadStage = stage;
  loading.dataset.phase = stage;
  get("loading-stage").textContent = words().loadingStages[stage];
  get("loading-progress").value = stage;
}

function nextPaint() {
  return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function updateDistrictLabels() {
  world?.setLabels({
    ...Object.fromEntries(projects.map((project) => [project.id, project.name[language]])),
    ambacar: words().garage
  });
}

function render() {
  translatePage(language);
  document.querySelector(".brand").setAttribute("aria-label", words().home);
  get("cv-link").href = "./cv.html?lang=" + language;
  get("archive-link").href = "./archive.html?lang=" + language;
  get("game-language").textContent = language === "es" ? "EN" : "ES";
  get("game-language").setAttribute("aria-label", words().switchLanguage);
  viewport.setAttribute("aria-label", words().focusGame);
  renderControls();
  get("game-error").textContent = words().gameError;
  renderCards();
  renderExperience();
  renderProgress();
  renderCamera();
  renderTarget();
  if (opening) setLoadStage(loadStage);
  if (mapDialog.open) renderMap();
  if (projectDialog.open) renderDetail();
  updateDistrictLabels();
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
  game.setAttribute("aria-busy", "true");
  loading.hidden = false;
  setLoadStage(0);
  mapButton.disabled = true;
  cameraButton.disabled = true;
  helpButton.disabled = true;
  showControls = mobile.matches;
  renderControls();
  get("game-bottom").hidden = true;
  get("main").inert = true;
  get("top").inert = true;
  document.body.classList.add("playing");
  get("exit").focus();
  try {
    await nextPaint();
    if (request !== openingRequest) return;
    if (!world) {
      const { createWorld } = await import("./game/world.js");
      if (request !== openingRequest) return;
      setLoadStage(1);
      await nextPaint();
      if (request !== openingRequest) return;
      world = createWorld(viewport, {
        onTarget(state) {
          target = state;
          renderTarget();
        },
        onProject: openProject,
        onMission() {
          world.pause(true);
          workshopMission.open(progress.workshop);
        },
        onCamera(enabled) {
          thirdPerson = enabled;
          renderCamera();
        },
        onPrism(index) {
          progress.prisms.add(index);
          storeProgress();
          playPrism(index);
          renderTarget();
        }
      });
    }
    setLoadStage(2);
    await nextPaint();
    if (request !== openingRequest) return;
    updateDistrictLabels();
    await world.prepare();
    if (request !== openingRequest) return;
    world.start(progress.prisms, progress.workshop);
    setLoadStage(3);
    await nextPaint();
    if (request !== openingRequest) return;
    inGame = true;
    loading.hidden = true;
    get("game-bottom").hidden = false;
    game.removeAttribute("aria-busy");
    cameraButton.disabled = false;
    mapButton.disabled = false;
    helpButton.disabled = false;
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
  game.removeAttribute("aria-busy");
  game.hidden = true;
  get("main").inert = false;
  get("top").inert = false;
  document.body.classList.remove("playing");
  entry.focus({ preventScroll: true });
}

function anyDialogOpen() { return mapDialog.open || projectDialog.open || missionDialog.open; }

for (const button of document.querySelectorAll("[data-lang]")) {
  button.addEventListener("click", () => changeLanguage(button.dataset.lang));
}
entry.addEventListener("click", enterGame);
get("featured-detail").addEventListener("click", () => openProject(ambacar.id));
const talkModes = document.querySelectorAll("[data-talk-mode]");
const talkChats = document.querySelectorAll("[data-talk-chat]");
for (const button of talkModes) {
  button.disabled = false;
  button.addEventListener("click", () => {
    for (const mode of talkModes) mode.setAttribute("aria-pressed", String(mode === button));
    for (const chat of talkChats) chat.hidden = chat.dataset.talkChat !== button.dataset.talkMode;
  });
}
for (const id of ["asotema", "talkapp", "traffic"]) {
  const details = get(id + "-details");
  details.disabled = false;
  details.addEventListener("click", () => openProject(id));
}
get("exit").addEventListener("click", exitGame);
get("game-language").addEventListener("click", () => changeLanguage(language === "es" ? "en" : "es"));
cameraButton.addEventListener("click", () => {
  world?.toggleCamera();
});
helpButton.addEventListener("click", () => {
  showControls = !showControls;
  if (!showControls) for (const key of moveKeys) world?.setMove(key, false);
  renderControls();
});
game.addEventListener("wheel", (event) => {
  if (!inGame || anyDialogOpen() || !event.ctrlKey || !event.deltaY) return;
  event.preventDefault();
  // Match the direction of zooming away from or toward the player.
  if ((event.deltaY > 0) !== thirdPerson) world.toggleCamera();
}, { passive: false });
mapButton.addEventListener("click", () => {
  if (!inGame) return;
  renderMap();
  world.pause(true);
  mapDialog.showModal();
});
get("interact").addEventListener("click", () => {
  world?.interact();
  if (!anyDialogOpen()) focusWorld();
});
for (const dialog of [mapDialog, projectDialog, missionDialog]) {
  dialog.addEventListener("close", () => {
    if (!inGame || anyDialogOpen()) return;
    world.pause(false);
    focusWorld();
  });
}
window.addEventListener("keydown", (event) => {
  if (opening && event.code === "Escape") {
    exitGame();
    return;
  }
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
  } else if (event.code === "KeyV" && !event.repeat) {
    world.toggleCamera();
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
mobile.addEventListener("change", renderControls);

viewport.tabIndex = 0;
render();
entry.disabled = false;
