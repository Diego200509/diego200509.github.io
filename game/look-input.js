export function createLookInput(viewport, { active, canCapture, look, click, lockChanged }) {
  let touch = null;
  let mousePoint = null;
  let wantsCapture = false;
  const locked = () => document.pointerLockElement === viewport;

  function capture() {
    if (!canCapture() || locked() || !viewport.requestPointerLock) return;
    wantsCapture = true;
    try {
      viewport.requestPointerLock()?.catch(() => { wantsCapture = false; });
    } catch {
      wantsCapture = false;
    }
  }

  function release() {
    wantsCapture = false;
    touch = null;
    mousePoint = null;
    if (locked()) document.exitPointerLock();
  }

  document.addEventListener("pointerlockchange", () => {
    if (locked() && (!wantsCapture || !canCapture())) {
      release();
      return;
    }
    touch = null;
    mousePoint = null;
    lockChanged(locked());
  });
  document.addEventListener("pointerlockerror", () => {
    wantsCapture = false;
  });

  viewport.addEventListener("mousemove", event => {
    if (locked() && active()) look(event.movementX, event.movementY);
  });
  viewport.addEventListener("pointermove", event => {
    if (locked() || !active()) return;
    if (event.pointerType === "mouse") {
      const x = mousePoint ? event.clientX - mousePoint.x : event.movementX;
      const y = mousePoint ? event.clientY - mousePoint.y : event.movementY;
      mousePoint = { x: event.clientX, y: event.clientY };
      look(x || 0, y || 0);
      return;
    }
    if (touch?.id !== event.pointerId) return;
    const x = event.clientX - touch.x;
    const y = event.clientY - touch.y;
    touch = { ...touch, x: event.clientX, y: event.clientY, distance: touch.distance + Math.abs(x) + Math.abs(y) };
    look(x, y);
  });

  viewport.addEventListener("pointerdown", event => {
    if (!active() || event.pointerType === "mouse" || touch || event.button !== 0) return;
    viewport.setPointerCapture(event.pointerId);
    touch = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
  });
  viewport.addEventListener("pointerleave", () => { mousePoint = null; });
  viewport.addEventListener("pointerup", event => {
    if (touch?.id !== event.pointerId) return;
    const tapped = touch.distance < 7;
    touch = null;
    if (tapped && active()) click();
  });
  viewport.addEventListener("lostpointercapture", event => {
    if (touch?.id === event.pointerId) touch = null;
  });
  viewport.addEventListener("click", event => {
    if (!active() || event.detail === 0 || event.pointerType === "touch" || event.pointerType === "pen") return;
    click();
    capture();
  });

  return { capture, release };
}
