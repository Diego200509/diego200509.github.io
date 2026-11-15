const labels = {
  es: { leave: "Volver al taller", launch: "Abrir ZEUS", minimize: "Minimizar ZEUS", restore: "Restaurar tamaño de ZEUS", maximize: "Maximizar ZEUS", close: "Cerrar ZEUS" },
  en: { leave: "Back to workshop", launch: "Open ZEUS", minimize: "Minimize ZEUS", restore: "Restore ZEUS window size", maximize: "Maximize ZEUS", close: "Close ZEUS" }
};

function inside(value, extent, size) {
  return Math.max(size / 2, Math.min(extent - size / 2, value));
}

export function createDesktop(dialog, getLanguage) {
  const get = name => dialog.querySelector(`[data-desktop="${name}"]`);
  const space = get("space");
  const launcher = get("launch");
  const dock = get("dock");
  const appWindow = get("window");
  const titlebar = get("titlebar");
  const maximize = get("maximize");
  const clock = get("clock");
  const wide = matchMedia("(min-width: 681px)");
  let clockTimer;
  let drag = null;

  function updateClock(format) {
    const time = new Date();
    clock.textContent = format.format(time);
    clock.dateTime = time.toISOString();
  }

  function resetPosition() {
    appWindow.style.removeProperty("--window-x");
    appWindow.style.removeProperty("--window-y");
  }

  function positionWindow(x, y, area, box) {
    appWindow.style.setProperty("--window-x", `${inside(x, area.width, box.width)}px`);
    appWindow.style.setProperty("--window-y", `${inside(y, area.height, box.height)}px`);
  }

  function endDrag() {
    if (!drag) return;
    const { id } = drag;
    drag = null;
    appWindow.removeAttribute("data-dragging");
    if (titlebar.hasPointerCapture(id)) titlebar.releasePointerCapture(id);
  }

  function setMaximized(value) {
    appWindow.toggleAttribute("data-maximized", value);
    const copy = labels[getLanguage()];
    const label = value ? copy.restore : copy.maximize;
    maximize.setAttribute("aria-label", label);
    maximize.title = label;
    maximize.firstElementChild.textContent = value ? "❐" : "□";
  }

  function showWindow() {
    appWindow.hidden = false;
    dock.setAttribute("aria-expanded", "true");
    launcher.setAttribute("aria-expanded", "true");
    appWindow.querySelector("#mission-window-title").focus({ preventScroll: true });
  }

  function hideWindow(focus) {
    endDrag();
    appWindow.hidden = true;
    dock.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-expanded", "false");
    focus?.focus({ preventScroll: true });
  }

  launcher.addEventListener("click", showWindow);
  dock.addEventListener("click", () => {
    if (appWindow.hidden) showWindow();
    else hideWindow(dock);
  });
  get("minimize").addEventListener("click", () => hideWindow(dock));
  get("close").addEventListener("click", () => {
    hideWindow(launcher);
    setMaximized(false);
    resetPosition();
  });
  maximize.addEventListener("click", () => setMaximized(!appWindow.hasAttribute("data-maximized")));

  titlebar.addEventListener("pointerdown", event => {
    if (!wide.matches || event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("button") || appWindow.hasAttribute("data-maximized")) return;
    const area = space.getBoundingClientRect();
    const box = appWindow.getBoundingClientRect();
    drag = {
      id: event.pointerId,
      deltaX: event.clientX - (box.left + box.width / 2),
      deltaY: event.clientY - (box.top + box.height / 2),
      area,
      box
    };
    appWindow.setAttribute("data-dragging", "");
    titlebar.setPointerCapture(event.pointerId);
  });

  titlebar.addEventListener("pointermove", event => {
    if (drag?.id !== event.pointerId) return;
    const { area, box, deltaX, deltaY } = drag;
    positionWindow(event.clientX - area.left - deltaX, event.clientY - area.top - deltaY, area, box);
  });
  for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) titlebar.addEventListener(eventName, endDrag);

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      if (appWindow.hidden || appWindow.hasAttribute("data-maximized")) return;
      const x = parseFloat(appWindow.style.getPropertyValue("--window-x"));
      const y = parseFloat(appWindow.style.getPropertyValue("--window-y"));
      if (Number.isFinite(x) && Number.isFinite(y)) positionWindow(x, y, space.getBoundingClientRect(), appWindow.getBoundingClientRect());
    }).observe(appWindow);
  }

  window.addEventListener("resize", () => {
    if (!dialog.open) return;
    endDrag();
    resetPosition();
    if (!wide.matches) setMaximized(false);
  });

  dialog.addEventListener("cancel", event => {
    if (appWindow.hidden) return;
    event.preventDefault();
    hideWindow(dock);
  });
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    clearInterval(clockTimer);
    hideWindow();
  });

  return {
    open() {
      const language = getLanguage();
      const copy = labels[language];
      get("leave").textContent = copy.leave;
      for (const key of ["launch", "minimize", "close"]) {
        const button = get(key);
        button.setAttribute("aria-label", copy[key]);
        button.title = copy[key];
      }
      setMaximized(false);
      resetPosition();
      hideWindow();
      const format = new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" });
      updateClock(format);
      dialog.showModal();
      launcher.focus({ preventScroll: true });
      clearInterval(clockTimer);
      clockTimer = setInterval(() => updateClock(format), 15000);
    }
  };
}
