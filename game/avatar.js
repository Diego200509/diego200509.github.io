import * as THREE from "../vendor/three.module.min.js";

export function createAvatar(scene) {
  const body = new THREE.Group();
  body.name = "Diego";
  body.visible = false;
  scene.add(body);

  const skin = "#ad7657";
  const hair = "#282123";
  const jacket = "#263747";
  const shirt = "#ede8dc";
  const shoes = "#262329";

  function part(parent, geometry, color, x, y, z) {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.84, flatShading: true }));
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function block(parent, x, y, z, width, height, depth, color) {
    return part(parent, new THREE.BoxGeometry(width, height, depth), color, x, y, z);
  }

  function shape(parent, x, y, z, width, height, depth, color) {
    const mesh = part(parent, new THREE.IcosahedronGeometry(1, 1), color, x, y, z);
    mesh.scale.set(width, height, depth);
    return mesh;
  }

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.48, 24), new THREE.MeshBasicMaterial({
    color: "#483429", transparent: true, opacity: 0.26, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1
  }));
  shadow.position.y = 0.045;
  shadow.rotation.x = -Math.PI / 2;
  body.add(shadow);

  const torso = new THREE.Group();
  body.add(torso);
  const coat = block(torso, 0, 1.16, 0, 0.54, 0.64, 0.32, jacket);
  coat.rotation.z = -0.02;
  block(torso, 0, 1.3, -0.17, 0.29, 0.37, 0.05, shirt);
  block(torso, 0, 1.3, -0.2, 0.08, 0.29, 0.03, "#304b51");
  block(torso, 0, 1.48, 0, 0.16, 0.19, 0.16, skin);

  const head = new THREE.Group();
  head.position.set(0, 1.69, 0);
  torso.add(head);
  shape(head, 0, 0, 0, 0.235, 0.27, 0.218, skin);
  shape(head, 0, 0.153, 0.039, 0.245, 0.176, 0.22, hair);
  for (let i = 0; i < 7; i++) {
    shape(head, (i - 3) * 0.061, 0.174 + Math.sin(i * 1.8) * 0.032, -0.115, 0.079, 0.089, 0.079, hair);
  }
  for (const side of [-1, 1]) {
    shape(head, side * 0.223, -0.008, -0.004, 0.047, 0.068, 0.044, skin);
    block(head, side * 0.085, 0.012, -0.204, 0.031, 0.024, 0.015, hair);
    block(head, side * 0.085, 0.064, -0.198, 0.062, 0.017, 0.014, hair);
  }
  shape(head, 0, -0.033, -0.199, 0.044, 0.065, 0.061, skin);

  const limbs = [-1, 1].map((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.34, 1.39, 0);
    torso.add(arm);
    block(arm, 0, -0.19, 0, 0.15, 0.46, 0.17, jacket);
    shape(arm, 0, -0.46, 0, 0.08, 0.105, 0.086, skin);
    const leg = new THREE.Group();
    leg.position.set(side * 0.143, 0.87, 0);
    torso.add(leg);
    block(leg, 0, -0.375, 0, 0.216, 0.71, 0.231, "#364453");
    block(leg, 0, -0.755, -0.058, 0.23, 0.15, 0.335, shoes);
    return { arm, leg };
  });

  let phase = 0;
  let stride = 0;
  return {
    body,
    update(dt, moving, reduceMotion) {
      if (reduceMotion) return;
      phase += dt * 11;
      stride = THREE.MathUtils.damp(stride, moving ? 1 : 0, 13, dt);
      torso.position.y = Math.abs(Math.sin(phase)) * 0.035 * stride;
      for (const [i, { arm, leg }] of limbs.entries()) {
        const swing = Math.sin(phase + i * Math.PI) * stride;
        arm.rotation.x = swing * -0.43;
        leg.rotation.x = swing * 0.54;
      }
    }
  };
}
