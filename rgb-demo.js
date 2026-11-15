import { tonalTable } from "./rgb-tone.js";

const original = document.querySelector("#rgb-original");
const result = document.querySelector("#rgb-result");
const preview = original.parentElement;
const split = document.querySelector("#rgb-split");
const controls = document.querySelector("#rgb-channels");
const settings = document.querySelector("#rgb-settings");
const tones = document.querySelector("#rgb-tones");
const settingsResult = document.querySelector("#rgb-settings-result");
const channels = [...tones.querySelectorAll(".rgb-tone")].map((row) => ({
  toggle: controls.querySelector(`[data-channel="${row.dataset.channel}"] input`),
  tone: row.querySelector('input[type="range"]'),
  output: row.querySelector("output")
}));

document.querySelector("#rgb-settings-button").addEventListener("click", () => {
  settings.showModal();
  if (preview.classList.contains("rgb-ready")) {
    settingsResult.getContext("2d")?.drawImage(result, 0, 0);
  }
});

function setComparison() {
  const originalShare = split.valueAsNumber;
  preview.style.setProperty("--rgb-split", originalShare + "%");
  preview.dataset.comparison = originalShare === 0 ? "result" : originalShare === 100 ? "original" : "split";
}

function showError() {
  document.querySelector("#rgb-error").hidden = false;
}

function initialize() {
  try {
    const context = result.getContext("2d");
    context.drawImage(original, 0, 0, result.width, result.height);
    const { data: source } = context.getImageData(0, 0, result.width, result.height);
    const reconstruction = context.createImageData(result.width, result.height);
    const settingsContext = settingsResult.getContext("2d");
    let pendingFrame = 0;

    function render() {
      pendingFrame = 0;
      const [red, green, blue] = channels.map(({ toggle, tone }) => tonalTable(toggle.checked, tone.valueAsNumber));
      const pixels = reconstruction.data;
      for (let i = 0; i < source.length; i += 4) {
        pixels[i] = red[source[i]];
        pixels[i + 1] = green[source[i + 1]];
        pixels[i + 2] = blue[source[i + 2]];
        pixels[i + 3] = source[i + 3];
      }
      context.putImageData(reconstruction, 0, 0);
      if (settings.open) settingsContext?.putImageData(reconstruction, 0, 0);
    }

    function updateChannels() {
      for (const { toggle, tone, output } of channels) {
        tone.disabled = !toggle.checked;
        output.value = tone.value + "%";
      }
      if (!pendingFrame) pendingFrame = requestAnimationFrame(render);
    }

    controls.addEventListener("input", updateChannels);
    tones.addEventListener("input", updateChannels);
    split.addEventListener("input", setComparison);
    document.querySelector("#rgb-reset").addEventListener("click", () => {
      for (const { toggle, tone } of channels) {
        toggle.checked = true;
        tone.value = 100;
      }
      split.value = 50;
      setComparison();
      updateChannels();
    });

    render();
    setComparison();
    preview.classList.add("rgb-ready");
    settingsResult.hidden = false;
    controls.disabled = false;
    tones.disabled = false;
    split.disabled = false;
  } catch {
    showError();
  }
}

if (original.complete) {
  if (original.naturalWidth) initialize();
  else showError();
} else {
  original.addEventListener("load", initialize, { once: true });
  original.addEventListener("error", showError, { once: true });
}
