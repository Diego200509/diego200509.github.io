export function bindTouchControls(root, actions) {
  const active = new Map();
  const joystick = root.querySelector("#joystick");
  const thumb = joystick.firstElementChild;

  function bind(control, { down, move, end, keyboard }) {
    control.addEventListener("pointerdown", event => {
      if (!actions.active() || control.hidden || active.has(control) || event.button !== 0) return;
      event.preventDefault();
      control.setPointerCapture(event.pointerId);
      active.set(control, event.pointerId);
      down(event);
    });
    control.addEventListener("pointermove", event => {
      if (active.get(control) === event.pointerId) move?.(event);
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      control.addEventListener(type, event => {
        if (active.get(control) !== event.pointerId) return;
        active.delete(control);
        end(type !== "pointerup");
      });
    }
    if (keyboard) control.addEventListener("click", event => {
      if (event.detail === 0 && actions.active()) keyboard();
    });
  }

  function moveStick(event) {
    const rect = joystick.getBoundingClientRect();
    const radius = rect.width * .34;
    const x = (event.clientX - rect.left - rect.width / 2) / radius;
    const y = (rect.top + rect.height / 2 - event.clientY) / radius;
    const distance = Math.hypot(x, y);
    const edge = Math.min(1, distance);
    const movement = distance > .13 ? ((edge - .13) / .87) / distance : 0;
    const scale = distance ? Math.min(1, 1 / distance) * radius : 0;
    thumb.style.transform = `translate(${x * scale}px, ${-y * scale}px)`;
    actions.move(x * movement, y * movement);
  }

  function stopStick() {
    thumb.style.transform = "";
    actions.move(0, 0);
  }

  bind(joystick, { down: moveStick, move: moveStick, end: stopStick });
  let fireX = 0;
  let fireY = 0;
  bind(root.querySelector("#touch-fire"), {
    down(event) {
      fireX = event.clientX;
      fireY = event.clientY;
      actions.fire(true);
    },
    move(event) {
      actions.look(event.clientX - fireX, event.clientY - fireY);
      fireX = event.clientX;
      fireY = event.clientY;
    },
    end: () => actions.fire(false),
    keyboard: actions.single
  });
  bind(root.querySelector("#touch-charge"), {
    down: () => actions.charge(true),
    end: cancel => actions.charge(false, cancel)
  });

  return {
    clear() {
      for (const [control, id] of active) {
        active.delete(control);
        if (control.hasPointerCapture(id)) control.releasePointerCapture(id);
      }
      stopStick();
      actions.fire(false);
      actions.charge(false, true);
    }
  };
}
