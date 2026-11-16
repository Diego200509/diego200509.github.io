import { newSimulation, step } from "../traffic-model.js";
import { campaignText } from "./campaign-text.js";
import { muralCells, muralColors } from "./mural.js";

const trafficPreset = () => ({ ...newSimulation(), queues: [12, 3] });
const roundLength = 12;
const queueLimit = 6;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, handler, primary = false) {
  const node = element("button", text, `button ${primary ? "primary" : "secondary"}`);
  node.type = "button";
  node.addEventListener("click", handler);
  return node;
}

function actionRow(...children) {
  const row = element("div", "", "device-actions");
  row.append(...children);
  return row;
}

export function setupDevices(dialog, getLanguage, campaign, onComplete, onProject) {
  const body = dialog.querySelector("#device-body");
  let stopTrial = () => {};
  let currentId;
  let title;

  function render() {
    const copy = campaignText[getLanguage()];
    const id = currentId;
    const result = id === "asotema" ? "expense" : id;
    const saved = campaign.done(result);
    dialog.dataset.device = id;
    dialog.querySelector("h2").textContent = title;
    dialog.querySelector("#device-close").textContent = copy.close;
    const status = element("p", "", "device-status");
    status.setAttribute("role", "status");
    const project = button(copy.project, () => {
      dialog.close();
      onProject(id);
    });
    project.hidden = !saved;

    function finish(data, message) {
      if (!campaign.done(result)) onComplete(result, data);
      project.hidden = !campaign.done(result);
      status.textContent = message;
    }

    stopTrial();
    stopTrial = () => {};
    body.replaceChildren();
    if (id === "rgb") {
      const levels = saved ? [...campaign.state.mural] : [100, 100, 100];
      const pixels = copy.comparison.map(label => {
        const figure = element("figure");
        const canvas = element("canvas");
        canvas.width = 240;
        canvas.height = 120;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", label);
        figure.append(canvas, element("figcaption", label));
        return { figure, context: canvas.getContext("2d") };
      });
      const gallery = element("div", "", "device-comparison");
      gallery.append(...pixels.map(pixel => pixel.figure));
      const controls = element("fieldset", "", "device-sliders");
      controls.append(element("legend", copy.rgbHint));
      const sliders = copy.channels.map((name, index) => {
        const label = element("label", name);
        const slider = element("input");
        slider.type = "range";
        slider.min = 0;
        slider.max = 200;
        slider.step = 5;
        slider.value = levels[index];
        const value = element("output");
        label.append(slider, value);
        controls.append(label);
        slider.addEventListener("input", () => {
          levels[index] = Number(slider.value);
          update();
        });
        return { slider, value };
      });
      const apply = button(copy.rgbApply, () => {
        if (levels.every(level => level > 120)) finish(levels, copy.rgbDone);
      }, true);
      const reset = button(copy.reset, () => {
        sliders.forEach(({ slider }, index) => { slider.value = levels[index] = 100; });
        update();
      });

      function update() {
        const colors = muralColors(levels);
        const pending = [];
        sliders.forEach(({ value }, index) => {
          value.textContent = `${levels[index]}%`;
          if (levels[index] <= 120) pending.push(copy.channels[index]);
        });
        for (const { col, row, band, shade } of muralCells) {
          const grayscale = `rgb(${shade} ${shade} ${shade})`;
          pixels[0].context.fillStyle = grayscale;
          pixels[1].context.fillStyle = levels[band] > 120 ? `rgb(${colors[band].join(" ")})` : grayscale;
          for (const { context } of pixels) context.fillRect(col * 20, (5 - row) * 20, 19, 19);
        }
        apply.disabled = pending.length > 0;
        status.textContent = pending.length ? `${copy.missing} · ${pending.join(", ")}` : saved ? copy.saved : "";
      }

      body.append(gallery, controls, status, actionRow(apply, reset, project));
      update();
    } else if (id === "talkapp") {
      const chat = element("div", "", "device-chat");
      chat.setAttribute("aria-live", "polite");
      const direct = button(copy.direct, () => showChat(false));
      const group = button(copy.group, () => showChat(true));
      const join = button(copy.talkJoin, () => {
        finish(undefined, copy.saved);
        showChat(true);
        project.focus();
      }, true);

      function showChat(showGroup) {
        const messages = showGroup ? [copy.talkGroup] : [copy.talkDirect];
        if (campaign.done("talkapp")) messages.push(copy.talkCalibrate);
        if (campaign.done("supply")) messages.push(copy.talkSupply);
        if (campaign.done("power")) messages.push(copy.talkPower);
        direct.setAttribute("aria-pressed", String(!showGroup));
        group.setAttribute("aria-pressed", String(showGroup));
        join.hidden = !showGroup || campaign.done("talkapp");
        chat.replaceChildren(...messages.map(message => element("p", message)));
      }

      body.append(actionRow(direct, group), chat, status, actionRow(join, project));
      showChat(false);
    } else if (id === "traffic") {
      let timer;
      let comparison = [null, null];
      let simulation = trafficPreset();
      let selected = 0;
      const roads = element("div", "", "device-roads");
      const lanes = copy.queues.map(name => {
        const road = element("div");
        const label = element("strong", name);
        const queue = element("meter");
        queue.min = 0;
        queue.max = 24;
        queue.setAttribute("aria-label", name);
        const signal = element("span");
        road.append(label, queue, signal);
        roads.append(road);
        return { queue, signal };
      });
      const trial = element("p", "", "device-trial");
      const modes = copy.modes.map((mode, index) => button(mode, () => run(index)));
      const selection = element("label", copy.trafficSelection, "device-mode-label");
      const setting = element("select");
      setting.append(...copy.modes.map((mode, index) => new Option(mode, index)));
      selection.append(setting);
      setting.addEventListener("change", () => {
        selected = Number(setting.value);
        update();
      });
      const apply = button(copy.trafficApply, () => {
        if (comparison.every(total => total !== null) && comparison[selected] <= queueLimit) finish(undefined, copy.trafficDone);
      }, true);
      const reset = button(copy.reset, () => {
        stopTrial();
        comparison = [null, null];
        simulation = trafficPreset();
        update();
      });

      stopTrial = () => {
        clearInterval(timer);
        timer = undefined;
      };

      function update() {
        lanes.forEach(({ queue, signal }, index) => {
          queue.value = simulation.queues[index];
          const green = simulation.green === index && !simulation.clearing;
          signal.dataset.green = String(green);
          signal.textContent = `${green ? copy.green : copy.red} · ${queue.value}`;
        });
        trial.textContent = `${simulation.tick}/${roundLength} · ` + copy.modes.map((mode, index) => `${mode} ${comparison[index] ?? "–"}`).join(" · ");
        modes.forEach(mode => { mode.disabled = timer !== undefined; });
        const compared = comparison.every(total => total !== null);
        const ready = timer === undefined && compared && comparison[selected] <= queueLimit;
        selection.hidden = !compared;
        setting.disabled = timer !== undefined;
        setting.value = selected;
        apply.disabled = !ready;
        status.textContent = saved ? copy.saved : ready ? "" : copy.noTrafficResult;
      }

      function run(index) {
        selected = index;
        simulation = trafficPreset();
        timer = setInterval(() => {
          step(simulation, index === 1, false);
          if (simulation.tick === roundLength) {
            comparison[index] = simulation.queues[0] + simulation.queues[1];
            stopTrial();
          }
          update();
        }, 175);
        update();
      }

      update();
      body.append(element("p", copy.trafficHint), roads, trial, actionRow(...modes, reset), selection, status, actionRow(apply, project));
    } else {
      const balance = element("strong", saved ? "USD 105" : "USD 150");
      const movement = element("strong", saved ? "−USD 45" : "—");
      const accounting = element("dl", "", "device-ledger");
      for (const [name, value] of [[copy.balance, balance], [copy.movement, movement]]) {
        const row = element("div");
        const detail = element("dd");
        detail.append(value);
        row.append(element("dt", name), detail);
        accounting.append(row);
      }
      const submit = button(copy.expenseSubmit, () => {
        finish(undefined, copy.expenseDone);
        balance.textContent = "USD 105";
        movement.textContent = "−USD 45";
        submit.hidden = true;
        project.focus();
      }, true);
      submit.hidden = saved;
      if (saved) status.textContent = copy.expenseDone;
      body.append(element("p", copy.expenseHint), accounting, status, actionRow(submit, project));
    }
  }

  dialog.addEventListener("close", () => {
    if (!dialog.open) stopTrial();
  });

  return {
    open(id, label) {
      currentId = id;
      title = label;
      render();
      dialog.showModal();
    }
  };
}
