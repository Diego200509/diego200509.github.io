import { translations } from "./content.js";

import { newSimulation, step } from "./traffic-model.js";

const directions = ["vertical", "horizontal"];
const intervalMs = 550;

const card = document.querySelector("#traffic-demo");
const modeButtons = [...card.querySelectorAll("[data-traffic-mode]")];
const demand = document.querySelector("#traffic-demand");
const play = document.querySelector("#traffic-play");
const playLabel = document.querySelector("#traffic-play-label");
const phaseText = [...document.querySelector("#traffic-phase").children];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const lanes = directions.map((direction) => {
  const queue = card.querySelector(".traffic-cars-" + direction);
  const cars = Array.from({ length: 5 }, (_, slot) => {
    const car = document.createElement("span");
    car.className = "traffic-car";
    car.style.setProperty("--slot", slot);
    queue.append(car);
    return car;
  });
  return {
    cars,
    light: card.querySelector(".traffic-light-" + direction),
    passing: card.querySelector(".traffic-passing-" + direction),
    counter: document.querySelector("#traffic-count-" + direction)
  };
});

let simulation = newSimulation();
let adaptive = false;
let moreTraffic = false;
let running = false;
let visible = !("IntersectionObserver" in window);
let timer = 0;

function render(passing = null) {
  const phase = simulation.clearing ? 2 : simulation.green;
  lanes.forEach(({ cars, light, counter }, index) => {
    const waiting = simulation.queues[index];
    counter.textContent = waiting;
    light.dataset.phase = index === phase ? "green" : "red";
    cars.forEach((car, slot) => { car.hidden = slot >= waiting; });
  });
  phaseText.forEach((part, index) => { part.hidden = index !== phase; });
  if (passing !== null && !reducedMotion.matches) {
    const distance = passing === 0 ? "0 68px" : "74px 0";
    lanes[passing].passing.animate(
      [{ opacity: 1, translate: "0 0" }, { opacity: 1, offset: .75 }, { opacity: 0, translate: distance }],
      { duration: 430, easing: "ease-in-out" }
    );
  }

  const key = running ? "trafficPause" : simulation.tick ? "trafficResume" : "trafficPlay";
  play.dataset.running = String(running);
  playLabel.dataset.t = key;
  playLabel.textContent = translations[document.documentElement.lang][key];
}

function syncTimer() {
  clearInterval(timer);
  if (running && visible && !document.hidden) {
    timer = setInterval(() => {
      if (document.body.classList.contains("playing") || document.querySelector("dialog[open]")) return;
      render(step(simulation, adaptive, moreTraffic));
    }, intervalMs);
  }
}

function restart() {
  simulation = newSimulation();
  running = true;
  render();
  syncTimer();
}

for (const button of modeButtons) {
  button.addEventListener("click", () => {
    const next = button.dataset.trafficMode === "adaptive";
    if (next === adaptive) return;
    adaptive = next;
    modeButtons.forEach((option) => option.setAttribute("aria-pressed", String(option === button)));
    restart();
  });
  button.disabled = false;
}

demand.addEventListener("click", () => {
  moreTraffic = !moreTraffic;
  demand.setAttribute("aria-pressed", String(moreTraffic));
  restart();
});
demand.disabled = false;

play.addEventListener("click", () => {
  running = !running;
  render();
  syncTimer();
});
play.disabled = false;

if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncTimer();
  }).observe(card);
}
document.addEventListener("visibilitychange", syncTimer);
render();
