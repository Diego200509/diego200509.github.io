import * as THREE from "../vendor/three.module.min.js";

const EYE_HEIGHT = 1.68;

export function createPlayerCamera(camera, positionAllowed) {
  const position = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const shoulder = new THREE.Vector3();
  const arm = new THREE.Vector3();
  const focus = new THREE.Vector3();
  let thirdPerson = false;

  return {
    position,
    get thirdPerson() { return thirdPerson; },
    toggle() {
      thirdPerson = !thirdPerson;
      return thirdPerson;
    },
    update(yaw, pitch) {
      if (!thirdPerson) {
        camera.position.copy(position).y = EYE_HEIGHT;
        camera.rotation.set(pitch, yaw, 0);
      } else {
        forward.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
        shoulder.set(Math.cos(yaw), 0, -Math.sin(yaw));
        arm.copy(forward).multiplyScalar(-4.15).addScaledVector(shoulder, 0.98);
        arm.y = THREE.MathUtils.clamp(arm.y + 0.82, 0.35, 3.2);
        let available = 1;
        for (let step = 1; step <= 14; step++) {
          const t = step / 14;
          if (positionAllowed(position.x + arm.x * t, position.z + arm.z * t)) continue;
          available = (step - 1) / 14;
          break;
        }
        camera.position.copy(position).addScaledVector(arm, available);
        camera.position.y += EYE_HEIGHT;
        focus.copy(position).addScaledVector(forward, 8.5).y += EYE_HEIGHT;
        camera.lookAt(focus);
      }
      camera.updateMatrixWorld();
    }
  };
}
