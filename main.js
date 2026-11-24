import { loadLanguage, projectPage, projects, saveLanguage, translatePage, translations } from "./content.js";
import { experience, experienceMarkup } from "./experience.js";
import { setupMission } from "./game/mission.js?v=interiors";
import { createLookInput } from "./game/look-input.js?v=campaign";
import { levels, loadCampaign, stations as destinations } from "./game/campaign.js?v=levels";
import { campaignText } from "./game/campaign-text.js?v=soundtrack";
import { setupDevices } from "./game/devices.js?v=interiors";
import { createDistrictSound } from "./game/sound.js?v=soundtrack";
import { bindTouchControls } from "./game/touch-input.js";
import { setupSettingsMenu } from "./game/settings-menu.js";
import { archiveProjects, renderArchiveCards } from "./project-archive.js";
import { mountContactFooter } from "./site-footer.js";
import { mountSiteHeader } from "./site-header.js?v=section-links";

mountContactFooter();
const updateHeaderLinks = mountSiteHeader();
const get = (id) => document.getElementById(id);
const projectById = new Map(projects.map((project) => [project.id, project]));
const ambacar = experience.find((entry) => entry.id === "ambacar");
const game = get("game");
const viewport = get("viewport");
const cameraTransition = get("camera-transition");
const entry = get("enter");
const loading = get("loading");
const cameraButton = get("camera-button");
const mapButton = get("map-button");
const settingsButton = get("settings-button");
const mapDialog = get("map-dialog");
const projectDialog = get("project-dialog");
const missionDialog = get("mission-dialog");
const deviceDialog = get("device-dialog");
const desktopDialog = get("device-desktop-dialog");
const settingsDialog = get("campaign-settings");
const worldDialogs = [mapDialog, projectDialog, missionDialog, deviceDialog, desktopDialog, settingsDialog];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const mobile = matchMedia("(pointer: coarse)");
const mouse = matchMedia("(any-pointer: fine)");
const moveKeys = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);
const arrows = { ArrowUp: "KeyW", ArrowDown: "KeyS" };
let language = loadLanguage();
let world;
let inGame = false;
let opening = false;
let openingRequest = 0;
let detailId = null;
let target = { next: "zeus" };
let combatStatus;
let phase = "explore";
let devicePending;
let queuedSignal;
let visibleSignal;
let signalTimer;
let loadStage = 0;
let thirdPerson = false;
let touchMode = mobile.matches;
const campaign = loadCampaign({
  getItem: key => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value)
});
const sound = createDistrictSound();
const scoreChapters = { zeus: "workshop", rgb: "plaza", talkapp: "talkapp", traffic: "traffic",
  expense: "asotema", supply: "asotema", supervisor: "return", power: "generator" };
let scoreScene = "workshop";
const preferences = { sensitivity: 1, volume: .55, music: .65, left: false, mute: false };
try {
  const saved = JSON.parse(localStorage.getItem("district-input"));
  if (Number.isFinite(saved?.sensitivity)) preferences.sensitivity = Math.max(.45, Math.min(2.15, saved.sensitivity));
  if (Number.isFinite(saved?.volume)) preferences.volume = Math.max(0, Math.min(1, saved.volume));
  if (Number.isFinite(saved?.music)) preferences.music = Math.max(0, Math.min(1, saved.music));
  preferences.left = saved?.left === true;
  preferences.mute = saved?.mute === true;
} catch {}

const lookInput = createLookInput(viewport, {
  active: inputActive,
  canCapture: () => mouse.matches && !touchMode && inputActive(),
  touchSide: event => (event.clientX >= viewport.clientWidth * .42) !== preferences.left,
  look: (x, y, touch) => world?.lookBy(x * (touch ? preferences.sensitivity : 1), y * (touch ? preferences.sensitivity : 1)),
  fire: () => world?.fire(),
  lockChanged: locked => { game.dataset.pointerLocked = String(locked); }
});
const touchInput = bindTouchControls(get("touch-controls"), {
  active: inputActive,
  move: (x, y) => world?.setTouch(x, y),
  look: (x, y) => world?.lookBy(x * preferences.sensitivity, y * preferences.sensitivity),
  fire: held => world?.holdFire(held),
  single: () => world?.fire(),
  charge: (held, cancel) => world?.charge(held, cancel)
});

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
function copy() { return campaignText[language]; }

const workshopMission = setupMission(missionDialog, () => language, {
  onFailed: campaign.failZeus,
  onComplete() {
    world.complete("zeus");
    return campaign.state.emitter;
  },
  onProject: () => openProject(ambacar.id)
});
const devices = setupDevices(deviceDialog, desktopDialog, () => language, campaign, (id, data) => world.complete(id, data), openProject);
const settingsMenu = setupSettingsMenu(settingsDialog, () => language, campaign);

function markVisit(id) {
  if (progress.visited.has(id)) return;
  progress.visited.add(id);
  storeProgress();
}

function renderCards() {
  for (const project of projects) {
    const copy = project[language];
    get(project.id + "-details").href = projectPage(project, language);
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
    markVisit(id);
    pauseWorld("project");
  }
  renderDetail();
  projectDialog.showModal();
}

function levelName(id) {
  return id === "return" ? copy().returnLevel : projectById.get(id)?.name[language] ?? "Ambacar";
}

function renderLevel() {
  const text = copy();
  get("campaign-level").textContent = campaign.done("power") ? text.campaignComplete :
    `${text.level(campaign.level, levels.length)} · ${levelName(campaign.state.station)}`;
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
    subtitle.textContent = levelName(id);
    const allowed = campaign.travelAllowed(id);
    const station = campaign.state.station === "return" ? "ambacar" : campaign.state.station;
    const goal = station === id && !campaign.done("power");
    const visited = campaign.state.reached.includes(id) || progress.visited.has(id);
    status.textContent = [goal && copy().current, allowed ? (visited ? words().seen : words().unseen) : copy().onFoot].filter(Boolean).join(" · ");
    button.disabled = !allowed;
    if (goal) button.setAttribute("aria-current", "location");
    button.append(label, subtitle, status);
    button.addEventListener("click", () => {
      world.moveTo(id);
      mapDialog.close();
    });
    return button;
  };
  const plaza = document.createElement("span");
  plaza.className = "map-plaza";
  plaza.textContent = words().plaza;
  const buttons = destinations.filter(campaign.unlocked).map(createDestination);
  get("map-list").replaceChildren(plaza, ...buttons);
  get("map-hint").textContent = copy().mapHint;
}

function renderTarget() {
  const { action, next, prisms, phone } = target;
  const text = copy();
  get("objective").textContent = next === "rgb" ? `${text.objectives.rgb} · ${prisms}/3` : text.objectives[next ?? "free"];
  get("interact").hidden = !action;
  get("interact").disabled = action === "lockedDoor";
  get("interact-label").textContent = text.actions[action] ?? "";
  get("phone-button").hidden = !phone || !inputActive();
}

function renderCombat() {
  if (!combatStatus) return;
  const { health, ammo, ammoLimit, reloading, charging, charged, attackWarning, exposed, aim, enemy, sprinting, crouching, damage } = combatStatus;
  const text = copy();
  get("campaign-hud").hidden = !inGame || phase === "wake" || !campaign.state.emitter;
  get("health").value = health;
  get("health-value").textContent = health;
  get("health").textContent = health;
  const charge = reloading ? text.reloading : charging ? `${text.charging}${charged ? " ✓" : "…"}` : `${text.charge} ${ammo}/${ammoLimit}`;
  get("emitter-status").textContent = charge + (sprinting ? ` · ${text.sprint}` : "");
  const warning = attackWarning ? text.signals.danger : exposed ? text.signals.exposed : health < 30 ? text.low : "";
  if (get("combat-status").textContent !== warning) get("combat-status").textContent = warning;
  get("touch-crouch").setAttribute("aria-pressed", String(crouching));
  game.dataset.aim = aim;
  get("enemy-vitals").hidden = !enemy;
  if (enemy) {
    get("enemy-name").textContent = text.enemies[enemy.id];
    get("enemy-health-value").textContent = `${enemy.hp}/${enemy.max}`;
    const meter = get("enemy-health");
    meter.max = enemy.max;
    meter.value = enemy.hp;
  }
  const indicator = get("damage-indicator");
  indicator.hidden = damage === null || phase !== "explore";
  if (!indicator.hidden) {
    indicator.dataset.direction = reducedMotion.matches ? "steady" : ["front", "right", "back", "left"][damage];
    indicator.textContent = `${["▲", "▶", "▼", "◀"][damage]} ${text.from} ${text.damage[damage]}`;
  }
}

function renderSignal() {
  const signal = get("campaign-signal");
  const title = get("campaign-signal-level");
  const text = copy();
  const { id, level } = visibleSignal ?? {};
  signal.hidden = !id || (!inGame && !opening);
  title.hidden = !level;
  title.textContent = level ? `${text.levelUnlocked(level)} · ${levelName(levels[level - 1])}` : "";
  get("campaign-signal-text").textContent = text.signals[id] ?? "";
}

function showSignal(id, level) {
  clearTimeout(signalTimer);
  visibleSignal = { id, level };
  renderSignal();
  signalTimer = setTimeout(() => {
    visibleSignal = undefined;
    renderSignal();
  }, id === "wake" ? 3300 : 5600);
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
  const active = inputActive();
  get("touch-controls").hidden = !touchMode || !active;
  game.dataset.touch = String(touchMode);
  game.dataset.left = String(preferences.left);
  get("touch-fire").hidden = !campaign.state.emitter;
  get("touch-reload").hidden = !campaign.state.emitter;
  get("touch-scan").hidden = !campaign.done("talkapp");
  get("touch-charge").hidden = !campaign.done("traffic");
  get("game-bottom").hidden = !active;
  get("campaign-intro").hidden = !inGame || phase !== "wake";
  settingsButton.disabled = !active;
  mapButton.disabled = !active;
  get("phone-button").hidden = !target.phone || !active;
}

function renderSettings() {
  const text = copy();
  for (const [id, key] of Object.entries({
    "health-label": "life", "phone-button": "phone", "settings-title": "settings", "settings-button-label": "settings",
    "sensitivity-label": "sensitivity",
    "left-hand-label": "leftHand", "volume-label": "volume", "music-label": "music", "mute-label": "mute", "campaign-restart": "restart",
    "restart-copy": "restartConfirm", "restart-yes": "restart", "restart-no": "cancel", "intro-title": "intro",
    "intro-skip": "skip", "touch-fire": "fire", "touch-crouch": "crouch", "touch-reload": "reload",
    "touch-scan": "scan", "touch-charge": "pulse"
  })) get(id).textContent = text[key];
  settingsButton.setAttribute("aria-label", text.settings);
  settingsButton.title = text.settings;
  get("joystick").setAttribute("aria-label", text.move);
  get("game-sensitivity").value = preferences.sensitivity;
  get("game-volume").value = preferences.volume;
  get("game-music").value = preferences.music;
  get("game-left-hand").checked = preferences.left;
  get("game-mute").checked = preferences.mute;
  applySoundSettings();
  settingsMenu.render();
}

function renderEntry() {
  entry.querySelector("[data-t=enter]").textContent = campaign.state.awakened ? copy().continue : words().enter;
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
  updateHeaderLinks(language);
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
  renderLevel();
  renderCamera();
  renderTarget();
  renderCombat();
  renderSignal();
  renderEntry();
  renderSettings();
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

function clearWorldInput() {
  lookInput.clear();
  touchInput.clear();
  world?.clearInput();
}

function syncWorldSound() {
  const audible = inGame && !document.hidden;
  const ducked = !["explore", "wake", "finish"].includes(phase) || anyDialogOpen();
  if (!ducked) {
    scoreScene = phase === "wake" ? "wake" : phase === "finish" ? "finale" : scoreChapters[campaign.next()] ?? "restored";
  }
  sound.ambience(audible ? (ducked ? .006 : .029) : 0);
  if (!audible || preferences.mute || !preferences.volume || !preferences.music) {
    sound.music(null);
    return;
  }
  sound.music({ scene: scoreScene, threat: phase === "explore" ? combatStatus?.threat ?? 0 : 0, ducked });
}

function applySoundSettings() {
  sound.level(preferences.mute ? 0 : preferences.volume);
  sound.musicLevel(preferences.music);
  syncWorldSound();
}

function pauseWorld(kind, id) {
  cancelCameraTransition();
  lookInput.release();
  clearWorldInput();
  return world.pause(kind, id);
}

function cancelCameraTransition() {
  for (const animation of cameraTransition.getAnimations()) animation.cancel();
}

function resumeWorld() {
  if (!inGame || anyDialogOpen() || devicePending || phase === "wake") return;
  const duration = reducedMotion.matches ? 0 : 260;
  fadeScene("teleport", duration);
  world.resume(duration);
  if (queuedSignal) {
    showSignal(queuedSignal.id, queuedSignal.level);
    sound.cue("relay");
    queuedSignal = undefined;
  }
  focusWorld();
}

function fadeScene(kind, duration = 300) {
  cancelCameraTransition();
  if (!duration || reducedMotion.matches) return;
  const frames = kind === "device" ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: .94 }, { opacity: 0 }];
  cameraTransition.animate(frames, { duration, easing: "ease-out", fill: kind === "device" ? "forwards" : "none" });
}

function openDevice(id) {
  if (!inputActive()) return;
  markVisit(id);
  campaign.recordDemo(id);
  const delay = pauseWorld("device", id);
  const show = () => {
    devicePending = undefined;
    if (!inGame || world.phase !== "device") return;
    if (id === "ambacar") workshopMission.open(campaign.state.emitter);
    else devices.open(id, projectById.get(id).name[language]);
    cancelCameraTransition();
  };
  if (delay) devicePending = setTimeout(show, delay);
  else show();
}

async function enterGame() {
  if (inGame || opening) return;
  opening = true;
  const request = ++openingRequest;
  sound.start();

  get("game-error").hidden = true;
  game.hidden = false;
  game.setAttribute("aria-busy", "true");
  loading.hidden = false;
  setLoadStage(0);
  mapButton.disabled = true;
  cameraButton.disabled = true;
  renderControls();
  get("game-bottom").hidden = true;
  get("main").inert = true;
  get("top").inert = true;
  get("contact").inert = true;
  document.body.classList.add("playing");
  get("exit").focus();
  try {
    await nextPaint();
    if (request !== openingRequest) return;
    if (!world) {
      const { createWorld } = await import("./game/world.js?v=soundtrack");
      if (request !== openingRequest) return;
      setLoadStage(1);
      await nextPaint();
      if (request !== openingRequest) return;
      world = createWorld(viewport, campaign, {
        onTarget(state) {
          target = state;
          renderTarget();
        },
        onDevice: openDevice,
        onVisit: markVisit,
        onPhase(next) {
          phase = next;
          game.dataset.phase = next;
          if (next !== "explore" && next !== "wake") clearWorldInput();
          if (next === "explore" && document.activeElement === get("intro-skip")) focusWorld();
          syncWorldSound();
          renderControls();
          renderCombat();
        },
        onStatus(state) {
          const threatChanged = combatStatus?.threat !== state.threat;
          combatStatus = state;
          if (threatChanged) syncWorldSound();
          renderCombat();
        },
        onSignal: showSignal,
        onSound: sound.cue,
        onTransition: fadeScene,
        onResult(id, cue, level) {
          if (id === "zeus") {
            progress.workshop = true;
            storeProgress();
          }
          if (cue) {
            if (anyDialogOpen()) queuedSignal = { id: cue, level };
            else {
              showSignal(cue, level);
              sound.cue("relay");
            }
          }
          if (id !== "power") syncWorldSound();
          renderLevel();
          renderControls();
          renderEntry();
        },
        onCamera(enabled) {
          thirdPerson = enabled;
          renderCamera();
        },
        onPrism(index) {
          progress.prisms.add(index);
          storeProgress();
          sound.cue(`prism${index}`);
        }
      });
    }
    setLoadStage(2);
    await nextPaint();
    if (request !== openingRequest) return;
    updateDistrictLabels();
    await world.prepare();
    if (request !== openingRequest) return;
    world.start();
    setLoadStage(3);
    await nextPaint();
    if (request !== openingRequest) return;
    inGame = true;
    loading.hidden = true;
    game.removeAttribute("aria-busy");
    cameraButton.disabled = false;
    renderControls();
    renderTarget();
    renderCombat();
    syncWorldSound();
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
  clearTimeout(devicePending);
  devicePending = undefined;
  queuedSignal = undefined;
  clearTimeout(signalTimer);
  visibleSignal = undefined;
  cancelCameraTransition();
  lookInput.release();
  clearWorldInput();
  syncWorldSound();
  for (const dialog of worldDialogs) if (dialog.open) dialog.close();
  world?.stop();
  game.removeAttribute("aria-busy");
  game.hidden = true;
  get("main").inert = false;
  get("top").inert = false;
  get("contact").inert = false;
  document.body.classList.remove("playing");
  renderEntry();
  entry.focus({ preventScroll: true });
}

function anyDialogOpen() { return worldDialogs.some(dialog => dialog.open); }
function inputActive() { return inGame && phase === "explore" && !anyDialogOpen() && !devicePending && !document.hidden; }

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
get("exit").addEventListener("click", exitGame);
get("game-language").addEventListener("click", () => changeLanguage(language === "es" ? "en" : "es"));
cameraButton.addEventListener("click", () => {
  world?.toggleCamera();
});
viewport.addEventListener("wheel", (event) => {
  if (!inGame || anyDialogOpen() || !event.ctrlKey || !event.deltaY) return;
  event.preventDefault();
  // Match the direction of zooming away from or toward the player.
  if ((event.deltaY > 0) !== thirdPerson) world.toggleCamera();
}, { passive: false });
function showMap() {
  if (!inputActive()) return;
  renderMap();
  pauseWorld("map");
  mapDialog.showModal();
}
mapButton.addEventListener("click", showMap);
get("interact").addEventListener("click", () => {
  world?.interact();
  if (inputActive()) focusWorld();
});
get("phone-button").addEventListener("click", () => world?.phone());
get("intro-skip").addEventListener("click", () => world?.skipWake());
get("touch-crouch").addEventListener("click", () => world?.crouch());
get("touch-reload").addEventListener("click", () => world?.reload());
get("touch-scan").addEventListener("click", () => world?.scan());
get("touch-charge").addEventListener("keydown", event => {
  if (event.code === "Space" && !event.repeat && inputActive()) world?.charge(true);
});
get("touch-charge").addEventListener("keyup", event => {
  if (event.code === "Space" && inputActive()) world?.charge(false);
});
settingsButton.addEventListener("click", () => {
  if (!inputActive()) return;
  pauseWorld("settings");
  confirmRestart(false);
  settingsMenu.open(touchMode);
});

function confirmRestart(visible) {
  get("restart-confirm").hidden = !visible;
  get("campaign-restart").setAttribute("aria-expanded", String(visible));
  if (visible) get("restart-no").focus();
}

get("campaign-restart").addEventListener("click", () => confirmRestart(true));
get("restart-no").addEventListener("click", () => {
  confirmRestart(false);
  get("campaign-restart").focus();
});
get("restart-yes").addEventListener("click", () => {
  campaign.reset();
  renderLevel();
  settingsDialog.close();
  queuedSignal = undefined;
  world.stop();
  world.start();
  renderEntry();
  fadeScene("teleport");
  focusWorld();
});

for (const [id, key] of [["game-sensitivity", "sensitivity"], ["game-volume", "volume"], ["game-music", "music"], ["game-left-hand", "left"], ["game-mute", "mute"]]) {
  get(id).addEventListener("input", ({ target: input }) => {
    preferences[key] = input.type === "checkbox" ? input.checked : Number(input.value);
    try { localStorage.setItem("district-input", JSON.stringify(preferences)); } catch {}
    applySoundSettings();
    renderControls();
  });
}
for (const dialog of worldDialogs) dialog.addEventListener("close", resumeWorld);
window.addEventListener("keydown", (event) => {
  const { code } = event;
  if (opening && code === "Escape") {
    exitGame();
    return;
  }
  if (code === "KeyV" && inGame && phase === "wake" && !event.repeat) {
    world.toggleCamera();
    return;
  }
  if (!inputActive() || event.metaKey || event.altKey) return;
  const movement = moveKeys.has(code) ? code : arrows[code];
  if (movement || code.startsWith("Control") || code.startsWith("Shift")) {
    event.preventDefault();
    world.setMove(movement || code, true);
  } else if (code === "ArrowLeft" || code === "ArrowRight") {
    event.preventDefault();
    world.lookBy(code === "ArrowLeft" ? -24 : 24, 0);
  } else if (!event.repeat && !event.ctrlKey) {
    const actions = {
      KeyC: world.crouch, KeyR: world.reload, KeyQ: world.scan, KeyX: () => world.charge(true), KeyT: world.phone,
      KeyE: world.interact, KeyV: world.toggleCamera, KeyM: showMap, Escape: lookInput.release
    };
    if (actions[code]) {
      event.preventDefault();
      actions[code]();
    }
  }
});
window.addEventListener("keyup", ({ code }) => {
  world?.setMove(arrows[code] || code, false);
  if (code === "KeyX") world?.charge(false);
});
window.addEventListener("blur", clearWorldInput);
window.addEventListener("orientationchange", clearWorldInput);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    lookInput.release();
    clearWorldInput();
  } else if (inGame) {
    sound.start();
  }
  syncWorldSound();
  renderControls();
});
document.addEventListener("pointerdown", event => {
  const touch = event.pointerType === "touch" || event.pointerType === "pen";
  if (touchMode === touch) return;
  clearWorldInput();
  if (touch) lookInput.release();
  touchMode = touch;
  renderControls();
}, true);
mobile.addEventListener("change", event => {
  clearWorldInput();
  touchMode = event.matches;
  renderControls();
});

viewport.tabIndex = 0;
render();
entry.disabled = false;
