import { tonalTable } from "./rgb-tone.js";
import { newSimulation, step } from "./traffic-model.js";

const account = {
  es: {
    choices: [["deposit", "Aporte"], ["loan", "Préstamo"], ["payment", "Pago de cuota"]],
    deposit: ["Aporte registrado", "El saldo de ahorros del socio pasa de $100 a $120."],
    loan: ["Préstamo registrado", "Se genera un cronograma y se registra el movimiento contable.", [["Cuenta del socio", "$60", "—"], ["Cartera de préstamos", "—", "$60"]]],
    payment: ["Cuota registrada", "La parte de capital y el interés se registran por separado.", [["Cuenta del socio", "—", "$21"], ["ASOTEMA · interés", "$1", "—"], ["Cartera · capital", "$20", "—"]]],
    columns: ["Cuenta", "Debe", "Haber"], controls: "Operación de ejemplo"
  },
  en: {
    choices: [["deposit", "Contribution"], ["loan", "Loan"], ["payment", "Installment"]],
    deposit: ["Contribution recorded", "The member’s savings balance rises from $100 to $120."],
    loan: ["Loan recorded", "The system creates a payment schedule and posts the ledger entries.", [["Member account", "$60", "—"], ["Loan portfolio", "—", "$60"]]],
    payment: ["Installment recorded", "Principal and interest are posted separately.", [["Member account", "—", "$21"], ["ASOTEMA · interest", "$1", "—"], ["Portfolio · principal", "$20", "—"]]],
    columns: ["Account", "Debit", "Credit"], controls: "Example transaction"
  }
};

const messages = {
  es: {
    choices: [["message", "Mensaje"], ["call", "Videollamada"]], controls: "Flujo de TalkApp",
    message: [["Remitente", "Envía un mensaje desde Next.js."], ["Servidor", "Valida la conversación y guarda el mensaje en MongoDB."], ["Destinatario", "Recibe el mensaje por Socket.IO."]],
    call: [["Primer usuario", "Envía una oferta para iniciar la llamada."], ["Socket.IO", "Intercambia oferta, respuesta y candidatos de conexión."], ["WebRTC", "Transporta audio y video entre los dos usuarios."]]
  },
  en: {
    choices: [["message", "Message"], ["call", "Video call"]], controls: "TalkApp flow",
    message: [["Sender", "Sends a message from the Next.js interface."], ["Server", "Validates the conversation and saves the message to MongoDB."], ["Recipient", "Receives the message over Socket.IO."]],
    call: [["First user", "Sends an offer to start the call."], ["Socket.IO", "Exchanges the offer, answer, and connection candidates."], ["WebRTC", "Carries audio and video between both users."]]
  }
};

const traffic = {
  es: {
    choices: [["normal", "Demanda base"], ["heavy", "Más tráfico N–S"]], controls: "Demanda de tráfico",
    fixed: "Tiempo fijo", adaptive: "Adaptativo", average: "Vehículos en cola por paso (promedio)", last: "Vehículos en cola al final"
  },
  en: {
    choices: [["normal", "Base demand"], ["heavy", "More N–S traffic"]], controls: "Traffic demand",
    fixed: "Fixed timing", adaptive: "Adaptive", average: "Queued vehicles per step (average)", last: "Vehicles still queued at the end"
  }
};

const rgb = {
  es: {
    choices: [["red", "Rojo"], ["green", "Verde"], ["blue", "Azul"]], controls: "Canal de color",
    before: "Original", after: "Ajuste", contrast: "Contraste del canal", histogram: "Histograma de intensidad del canal",
    sample: "Frutas de varios colores en cestas", result: "Imagen con el contraste del canal ajustado", error: "La imagen de la demostración no pudo cargar."
  },
  en: {
    choices: [["red", "Red"], ["green", "Green"], ["blue", "Blue"]], controls: "Color channel",
    before: "Original", after: "Adjusted", contrast: "Channel contrast", histogram: "Channel intensity histogram",
    sample: "Baskets of colorful fruit", result: "Image with adjusted channel contrast", error: "The demo image could not load."
  }
};

function choicesMarkup(labels, selected) {
  return `<div class="case-options" role="group" aria-label="${labels.controls}">${labels.choices.map(([id, label]) =>
    `<button type="button" data-demo-choice="${id}" aria-pressed="${id === selected}">${label}</button>`).join("")}</div>`;
}

function handleChoices(container, select) {
  const buttons = [...container.querySelectorAll("[data-demo-choice]")];
  for (const button of buttons) {
    button.addEventListener("click", () => {
      for (const item of buttons) item.setAttribute("aria-pressed", String(item === button));
      select(button.dataset.demoChoice);
    });
  }
}

function renderChoices(container, labels, state, initial, markup) {
  state.choice ??= initial;
  container.innerHTML = `${choicesMarkup(labels, state.choice)}<div class="case-demo-result" aria-live="polite"></div>`;
  const result = container.querySelector(".case-demo-result");
  function render(choice) {
    state.choice = choice;
    result.innerHTML = markup(choice);
  }
  handleChoices(container, render);
  render(state.choice);
}

function renderAccount(container, language, state) {
  const labels = account[language];
  renderChoices(container, labels, state, "loan", choice => {
    const [title, description, rows] = labels[choice];
    const evidence = rows ? `<table class="case-ledger">
      <thead><tr>${labels.columns.map(label => `<th scope="col">${label}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(([name, debit, credit]) => `<tr><th scope="row">${name}</th><td>${debit}</td><td>${credit}</td></tr>`).join("")}</tbody>
    </table>` : `<div class="case-account-total"><span>$100</span><span aria-hidden="true">→</span><strong>$120</strong></div>`;
    return `<h3>${title}</h3><p>${description}</p>${evidence}`;
  });
}

function renderMessages(container, language, state) {
  const labels = messages[language];
  renderChoices(container, labels, state, "message", choice => `<ol class="case-demo-flow">${labels[choice].map(([title, description]) =>
    `<li><strong>${title}</strong><p>${description}</p></li>`).join("")}</ol>`);
}

function measureTraffic(adaptive, heavy) {
  const simulation = newSimulation();
  let total = 0;
  let last = 0;
  for (let cycle = 0; cycle < 24; cycle++) {
    step(simulation, adaptive, heavy);
    last = simulation.queues[0] + simulation.queues[1];
    total += last;
  }
  return { average: total / 24, last };
}

function renderTraffic(container, language, state) {
  const labels = traffic[language];
  const format = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });
  const scenarios = Object.fromEntries(labels.choices.map(([key]) => [key, [
    measureTraffic(false, key === "heavy"), measureTraffic(true, key === "heavy")
  ]]));
  const max = Math.max(1, ...Object.values(scenarios).flat().map(item => item.average));
  renderChoices(container, labels, state, "heavy", choice => {
    return `<p class="case-chart-label">${labels.average}</p><dl class="case-chart">${scenarios[choice].map(({ average, last }, index) =>
      `<div><dt>${index === 0 ? labels.fixed : labels.adaptive}</dt><dd><strong>${format.format(average)}</strong>
        <span class="case-bar-track" aria-hidden="true"><span style="width:${average / max * 100}%"></span></span>
        <small>${labels.last} · ${format.format(last)}</small></dd></div>`).join("")}</dl>`;
  });
}

function paintHistograms(canvas, original, adjusted, originalColor, adjustedColor) {
  const context = canvas.getContext("2d");
  const peak = Math.max(1, ...original, ...adjusted);
  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  context.lineWidth = 2;
  for (const [histogram, color] of [[original, originalColor], [adjusted, adjustedColor]]) {
    context.strokeStyle = color;
    context.beginPath();
    histogram.forEach((count, bin) => {
      const x = bin / 255 * (width - 2) + 1;
      const y = height - 3 - count / peak * (height - 7);
      if (bin === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  }
}

function renderRgb(container, language, state) {
  const labels = rgb[language];
  state.choice ??= "red";
  state.contrast ??= 145;
  container.innerHTML = `${choicesMarkup(labels, state.choice)}
    <div class="case-rgb-pair">
      <figure><img src="./assets/rgb-frutas.webp" width="440" height="330" alt="${labels.sample}"><figcaption>${labels.before}</figcaption></figure>
      <figure><canvas width="440" height="330" role="img" aria-label="${labels.result}" hidden></canvas><figcaption>${labels.after}</figcaption></figure>
    </div>
    <label class="case-range" for="case-contrast"><span>${labels.contrast}</span><output for="case-contrast">${state.contrast}%</output>
      <input id="case-contrast" type="range" min="0" max="200" value="${state.contrast}" disabled></label>
    <div class="case-histogram" hidden>
      <canvas width="520" height="92" role="img" aria-label="${labels.histogram}"></canvas>
      <div class="case-histogram-axis"><span>0</span><span>255</span></div>
      <div class="case-histogram-legend"><span>${labels.before}</span><span>${labels.after}</span></div>
    </div>
    <p class="case-demo-error" role="status" hidden>${labels.error}</p>`;

  const image = container.querySelector("img");
  const output = container.querySelector("output");
  const contrast = container.querySelector("input");
  const result = container.querySelector(".case-rgb-pair canvas");
  const histogram = container.querySelector(".case-histogram");
  const plot = histogram.querySelector("canvas");
  const context = result.getContext("2d", { willReadFrequently: true });
  const colors = getComputedStyle(container);
  let source;
  let reconstruction;
  let frame;

  function draw() {
    frame = null;
    const index = labels.choices.findIndex(([key]) => key === state.choice);
    const table = tonalTable(true, state.contrast);
    const before = new Uint32Array(256);
    const after = new Uint32Array(256);
    const pixels = reconstruction.data;
    pixels.set(source.data);
    for (let i = index; i < pixels.length; i += 4) {
      const value = pixels[i];
      before[value]++;
      pixels[i] = table[value];
      after[pixels[i]]++;
    }
    context.putImageData(reconstruction, 0, 0);
    const channel = colors.getPropertyValue("--rgb-" + state.choice).trim();
    histogram.style.setProperty("--plot-channel", channel);
    paintHistograms(plot, before, after, colors.getPropertyValue("--muted").trim(), channel);
  }

  function queueDraw() {
    if (source && frame == null) frame = requestAnimationFrame(draw);
  }

  handleChoices(container, choice => {
    state.choice = choice;
    queueDraw();
  });
  contrast.addEventListener("input", () => {
    state.contrast = contrast.valueAsNumber;
    output.value = `${state.contrast}%`;
    queueDraw();
  });
  image.decode().then(() => {
    context.drawImage(image, 0, 0, result.width, result.height);
    source = context.getImageData(0, 0, result.width, result.height);
    reconstruction = context.createImageData(result.width, result.height);
    draw();
    result.hidden = false;
    histogram.hidden = false;
    contrast.disabled = false;
  }).catch(() => { container.querySelector(".case-demo-error").hidden = false; });
}

export const caseDemos = { asotema: renderAccount, talkapp: renderMessages, traffic: renderTraffic, rgb: renderRgb };
