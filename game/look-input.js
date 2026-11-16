export function createLookInput(viewport, { active, canCapture, touchSide, look, fire, lockChanged }) {
  let touch = null;
  let mousePoint = null;
  let wantsCapture = false;
  let denied = false;
  const locked = () => document.pointerLockElement === viewport;

  function rejected() {
    wantsCapture = false;
    denied = true;
  }

  function capture() {
    if (denied || !canCapture() || locked() || !viewport.requestPointerLock) return false;
    wantsCapture = true;
    try {
      viewport.requestPointerLock()?.catch(rejected);
      return true;
    } catch {
      rejected();
      return true;
    }
  }

  function clear() {
    if (touch && viewport.hasPointerCapture(touch.id)) viewport.releasePointerCapture(touch.id);
    touch = null;
    mousePoint = null;
  }

  function release() {
    wantsCapture = false;
    clear();
    if (locked()) document.exitPointerLock();
  }

  document.addEventListener("pointerlockchange", () => {
    if (locked() && (!wantsCapture || !canCapture())) {
      release();
      return;
    }
    clear();
    lockChanged(locked());
  });
  document.addEventListener("pointerlockerror", rejected);

  viewport.addEventListener("mousemove", event => {
    if (locked() && active()) look(event.movementX, event.movementY, false);
  });
  viewport.addEventListener("pointermove", event => {
    if (locked() || !active()) return;
    if (event.pointerType === "mouse") {
      const x = mousePoint ? event.clientX - mousePoint.x : 0;
      const y = mousePoint ? event.clientY - mousePoint.y : 0;
      mousePoint = { x: event.clientX, y: event.clientY };
      look(x, y, false);
    } else if (touch?.id === event.pointerId) {
      look(event.clientX - touch.x, event.clientY - touch.y, true);
      touch.x = event.clientX;
      touch.y = event.clientY;
    }
  });
  viewport.addEventListener("pointerdown", event => {
    if (!active() || event.button !== 0) return;
    if (event.pointerType === "mouse") {
      if (locked() || !capture()) fire();
    } else if (!touch && touchSide(event)) {
      event.preventDefault();
      viewport.setPointerCapture(event.pointerId);
      touch = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }
  });
  viewport.addEventListener("pointerleave", () => { mousePoint = null; });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    viewport.addEventListener(type, event => {
      if (touch?.id === event.pointerId) touch = null;
    });
  }

  return { capture, clear, release };
}
