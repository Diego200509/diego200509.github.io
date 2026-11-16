const groups = {
  movement: ["move", "look", "sprint", "crouch"],
  combat: ["fire", "reload", "scan", "charge"],
  world: ["interact", "camera", "map", "phone"]
};
const keys = {
  move: [["W", "A", "S", "D"], ["↑", "↓"]], look: [["mouse"], ["←", "→"]],
  sprint: [["Shift"]], crouch: [["Ctrl"], ["C"]],
  fire: [["leftClick"]], reload: [["R"]], scan: [["Q"]], charge: [["X"]],
  interact: [["E"]], camera: [["V"], ["Ctrl", "+", "wheel"]], map: [["M"]], phone: [["T"]]
};
const unlocks = { scan: "talkapp", charge: "traffic" };
const text = {
  es: {
    general: "General", controls: "Controles", input: "Tipo de control", keyboard: "Teclado y ratón", touch: "Pantalla táctil",
    movement: "Movimiento", combat: "Combate", world: "Distrito", or: "o",
    actions: {
      move: "Moverse", look: "Mirar", sprint: "Correr", crouch: "Agacharse", fire: "Disparar",
      reload: "Recargar", scan: "Escáner", charge: "Pulso cargado", interact: "Interactuar",
      camera: "Cambiar cámara", map: "Abrir mapa", phone: "Abrir celular"
    },
    devices: { mouse: "Ratón", leftClick: "Clic izquierdo", wheel: "Rueda" },
    touchBindings: {
      move: "Joystick", look: "Desliza en el lado opuesto al joystick", sprint: "Lleva el joystick al borde superior",
      crouch: "Toca Agacharse", fire: "Toca Disparar o arrástralo para apuntar", reload: "Toca Recargar",
      scan: "Toca Escanear", charge: "Mantén Cargar y suelta", interact: "Toca la acción que aparece",
      camera: "Cámara", map: "Mapa", phone: "Celular"
    },
    notes: { sprint: "Mantén mientras avanzas", crouch: "Mantén Ctrl o alterna con C", charge: "Mantén y suelta", phone: "Desde TalkApp, en zonas seguras" },
    unlock: { emitter: "Completa ZEUS para obtener el emisor.", talkapp: "Se desbloquea en TalkApp", traffic: "Se desbloquea en Semáforo IA" },
    cursor: "Libera el cursor. Pulsa en la escena para volver a capturarlo."
  },
  en: {
    general: "General", controls: "Controls", input: "Input type", keyboard: "Keyboard and mouse", touch: "Touchscreen",
    movement: "Movement", combat: "Combat", world: "District", or: "or",
    actions: {
      move: "Move", look: "Look", sprint: "Sprint", crouch: "Crouch", fire: "Fire",
      reload: "Reload", scan: "Scan", charge: "Charged pulse", interact: "Interact",
      camera: "Change camera", map: "Open map", phone: "Open phone"
    },
    devices: { mouse: "Mouse", leftClick: "Left click", wheel: "Scroll wheel" },
    touchBindings: {
      move: "Joystick", look: "Drag on the side opposite the joystick", sprint: "Push the joystick to its top edge",
      crouch: "Tap Crouch", fire: "Tap Fire or drag it to aim", reload: "Tap Reload",
      scan: "Tap Scan", charge: "Hold Charge and release", interact: "Tap the action that appears",
      camera: "Camera", map: "Map", phone: "Phone"
    },
    notes: { sprint: "Hold while moving forward", crouch: "Hold Ctrl or toggle with C", charge: "Hold and release", phone: "From TalkApp onward, in safe areas" },
    unlock: { emitter: "Complete ZEUS to get the emitter.", talkapp: "Unlocks in TalkApp", traffic: "Unlocks at the AI Traffic Light" },
    cursor: "Releases the pointer. Click the scene to capture it again."
  }
};

export function setupSettingsMenu(dialog, getLanguage, campaign) {
  const tabs = [...dialog.querySelectorAll('[role="tab"]')];
  const inputs = [...dialog.querySelectorAll("[data-control-input]")];
  const guide = dialog.querySelector("#controls-guide");
  let input = "keyboard";

  function selectTab(selected) {
    for (const tab of tabs) {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
    }
  }

  function renderGuide() {
    const copy = text[getLanguage()];
    const keyboard = input === "keyboard";
    function renderGroup([name, actions]) {
      const rows = actions.map(id => {
        const binding = keyboard ? keys[id].map(group =>
          `<span class="control-keys">${group.map(key =>
            key === "+" ? "<span>+</span>" : `<kbd>${copy.devices[key] ?? key}</kbd>`).join(" ")}</span>`
        ).join(` <span class="control-alternative">${copy.or}</span> `) :
          `<span class="control-gesture">${copy.touchBindings[id]}</span>`;
        const locked = unlocks[id] && !campaign.done(unlocks[id]) ? copy.unlock[unlocks[id]] : "";
        const note = keyboard || id === "phone" ? copy.notes[id] : "";
        return `<div class="control-row">
          <dt>${copy.actions[id]}</dt>
          <dd><div class="control-binding">${binding}</div>
            ${note ? `<small>${note}</small>` : ""}
            ${locked ? `<small class="control-unlock">${locked}</small>` : ""}
          </dd>
        </div>`;
      }).join("");
      return `<section class="control-group"><h3>${copy[name]}</h3>
        ${name === "combat" && !campaign.state.emitter ? `<p class="control-unlock">${copy.unlock.emitter}</p>` : ""}
        <dl>${rows}</dl></section>`;
    }
    guide.innerHTML = `<div class="control-grid">${Object.entries(groups).map(renderGroup).join("")}</div>
      ${keyboard ? `<p class="control-cursor"><kbd>Esc</kbd> <span>${copy.cursor}</span></p>` : ""}`;
    for (const button of inputs) button.setAttribute("aria-pressed", String(button.dataset.controlInput === input));
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", event => {
      const destinations = { ArrowLeft: (index + tabs.length - 1) % tabs.length, ArrowRight: (index + 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      const next = tabs[destinations[event.key]];
      if (!next) return;
      event.preventDefault();
      selectTab(next);
      next.focus();
    });
  });
  for (const button of inputs) button.addEventListener("click", () => {
    input = button.dataset.controlInput;
    renderGuide();
  });

  return {
    render() {
      const copy = text[getLanguage()];
      for (const tab of tabs) tab.textContent = copy[tab.dataset.settingsTab];
      for (const button of inputs) button.textContent = copy[button.dataset.controlInput];
      dialog.querySelector(".control-inputs").setAttribute("aria-label", copy.input);
      renderGuide();
    },
    open(touch) {
      input = touch ? "touch" : "keyboard";
      selectTab(tabs[0]);
      renderGuide();
      dialog.showModal();
      tabs[0].focus({ preventScroll: true });
    }
  };
}
