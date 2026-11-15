import * as THREE from "../vendor/three.module.min.js";

export function createAvatar(scene) {
  const body = new THREE.Group();
  body.name = "Diego";
  body.visible = false;
  scene.add(body);

  const skin = "#ba8869";
  const hair = "#201a19";
  const jacket = "#24262d";
  const shirt = "#ede8dc";
  const trousers = "#2c2e35";
  const shoes = "#252225";
  const materials = new Map();

  function part(parent, geometry, color, x = 0, y = 0, z = 0, smooth = false) {
    const key = color + smooth;
    if (!materials.has(key)) {
      materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .86, flatShading: !smooth }));
    }
    const mesh = new THREE.Mesh(geometry, materials.get(key));
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  const oval = new THREE.IcosahedronGeometry(1, 1);
  function shape(parent, x, y, z, width, height, depth, color, smooth = false) {
    const mesh = part(parent, oval, color, x, y, z, smooth);
    mesh.scale.set(width, height, depth);
    return mesh;
  }

  function contour(parent, rings, color, sides = 18, smooth = true) {
    const vertices = [];
    const indices = [];
    rings.forEach(([y, width, front, back, z = 0], ring) => {
      for (let i = 0; i < sides; i++) {
        const angle = i / sides * 2 * Math.PI;
        const depth = Math.cos(angle);
        vertices.push(Math.sin(angle) * width, y, z - depth * (depth > 0 ? front : back));
        if (ring === 0) continue;
        const low = (ring - 1) * sides;
        const high = ring * sides;
        const next = (i + 1) % sides;
        indices.push(low + i, high + i, low + next, low + next, high + i, high + next);
      }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return part(parent, geometry, color, 0, 0, 0, smooth);
  }

  function seam(parent, points, radius, color) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    return part(parent, new THREE.TubeGeometry(curve, 7, radius, 5), color, 0, 0, 0, true);
  }

  function collar(parent, side) {
    const vertices = [
      side * .016, 1.416, -.15, side * .069, 1.452, -.118,
      side * .105, 1.366, -.157, side * .043, 1.309, -.171
    ];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(side > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]);
    geometry.computeVertexNormals();
    return part(parent, geometry, shirt);
  }

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.48, 24), new THREE.MeshBasicMaterial({
    color: "#483429", transparent: true, opacity: 0.26, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1
  }));
  shadow.position.y = 0.045;
  shadow.rotation.x = -Math.PI / 2;
  body.add(shadow);

  const torso = new THREE.Group();
  body.add(torso);
  contour(torso, [
    [.84, .004, .004, .004], [.86, .223, .126, .124], [1.08, .22, .149, .135],
    [1.34, .274, .159, .143], [1.43, .243, .126, .122], [1.50, .094, .071, .076]
  ], jacket, 12);
  shape(torso, 0, 1.49, 0, .107, .147, .096, skin, true);
  shape(torso, 0, 1.352, -.147, .105, .083, .024, shirt);
  for (const side of [-1, 1]) {
    collar(torso, side);
    seam(torso, [[side * .112, 1.44, -.115], [side * .153, 1.33, -.147], [side * .062, 1.115, -.152]], .013, "#42444a");
  }
  shape(torso, 0, 1.325, -.162, .042, .045, .025, "#25282a");
  shape(torso, 0, 1.227, -.16, .031, .10, .018, "#303337");
  shape(torso, 0, 1.07, -.155, .013, .013, .011, "#515057");

  const head = new THREE.Group();
  head.position.set(0, 1.69, 0);
  torso.add(head);
  contour(head, [
    [-.255, .012, .058, .05, -.044], [-.227, .106, .159, .096, -.027],
    [-.159, .151, .197, .137, -.014], [-.083, .187, .214, .173], [-.007, .205, .222, .193],
    [.077, .202, .207, .201], [.151, .192, .188, .187], [.208, .141, .146, .145], [.244, .007, .007, .007]
  ], skin, 24);
  contour(head, [
    [.041, .19, .138, .182, .055], [.117, .217, .17, .191, .038],
    [.201, .221, .197, .204, .015], [.258, .177, .168, .176, .011], [.296, .092, .087, .091], [.309, .005, .005, .005]
  ], hair, 20);

  const curls = [
    [-.163, .167, -.133, .076, .071, .07], [-.113, .153, -.177, .065, .071, .063],
    [-.047, .157, -.191, .069, .078, .051], [.016, .201, -.165, .074, .079, .063],
    [.073, .174, -.187, .065, .071, .062], [.137, .158, -.167, .066, .076, .062],
    [.18, .17, -.105, .058, .075, .073], [-.167, .222, -.073, .076, .072, .082],
    [-.092, .252, -.107, .083, .071, .085], [-.018, .272, -.067, .086, .079, .087],
    [.07, .265, -.072, .088, .085, .083], [.141, .241, -.023, .077, .079, .087],
    [.179, .212, .084, .056, .077, .078], [-.173, .198, .077, .061, .075, .08]
  ];
  curls.forEach((curl, index) => {
    const tuft = shape(head, ...curl, index % 3 === 0 ? "#2b2421" : hair);
    tuft.rotation.z = .4 * Math.sin(index * 1.9);
  });

  for (const side of [-1, 1]) {
    shape(head, side * .206, -.028, -.009, .035, .066, .038, skin, true);
    shape(head, side * .224, -.027, -.032, .013, .036, .013, "#a16b55", true);
    shape(head, side * .195, .079, -.048, .035, .076, .071, hair);
    const eye = shape(head, side * .082, .018, -.208, .044, .016, .009, "#e0cabc", true);
    eye.rotation.y = -side * .29;
    shape(head, side * .079, .019, -.216, .015, .015, .007, "#34251f", true);
    shape(head, side * .078, .02, -.222, .006, .008, .003, "#1b1716", true);
    seam(head, [[side * .038, .02, -.215], [side * .077, .033, -.219], [side * .122, .023, -.194]], .0035, "#775143");
    seam(head, [[side * .041, .061, -.21], [side * .084, .069, -.199], [side * .13, .057, -.174]], .0074, "#392923");
  }
  shape(head, 0, -.018, -.216, .026, .052, .024, skin, true);
  shape(head, 0, -.058, -.234, .045, .028, .027, skin, true);
  for (const side of [-1, 1]) shape(head, side * .025, -.073, -.243, .01, .005, .005, "#885848", true);
  shape(head, 0, -.133, -.206, .055, .018, .011, "#a36b58", true);
  seam(head, [[-.055, -.129, -.197], [-.022, -.128, -.219], [.012, -.129, -.219], [.052, -.13, -.198]], .004, "#704939");

  const limbs = [-1, 1].map((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * .31, 1.39, 0);
    torso.add(arm);
    contour(arm, [[-.42, .055, .061, .055], [-.26, .063, .069, .065], [-.04, .081, .085, .085], [.046, .031, .04, .04]], jacket, 10);
    shape(arm, 0, -.414, 0, .055, .016, .059, shirt);
    shape(arm, 0, -.465, 0, .057, .074, .053, skin, true);
    const leg = new THREE.Group();
    leg.position.set(side * 0.143, 0.87, 0);
    body.add(leg);
    contour(leg, [[-.425, .088, .085, .085], [-.24, .100, .106, .104], [0, .112, .116, .112]], trousers, 10);
    const knee = new THREE.Group();
    knee.position.y = -.38;
    leg.add(knee);
    contour(knee, [[-.35, .074, .078, .079], [-.06, .084, .084, .086], [.03, .088, .082, .086]], trousers, 10);
    shape(knee, 0, -.392, -.046, .103, .080, .16, shoes);
    return { arm, leg, knee, side };
  });

  let phase = 0;
  let stride = 0;
  let idle = 0;
  return {
    body,
    update(dt, moving, reduceMotion) {
      idle += dt;
      stride = THREE.MathUtils.damp(stride, moving ? 1 : 0, 13, dt);
      phase += dt * (6 + 5 * stride);
      const amount = reduceMotion ? .43 : 1;
      const breath = reduceMotion ? 0 : Math.sin(idle * 2.2) * .013 * (1 - stride);
      torso.position.y = breath + Math.abs(Math.sin(phase)) * .065 * stride * amount;
      torso.rotation.set(-.085 * stride, Math.sin(phase) * .15 * stride * amount, Math.cos(phase) * .047 * stride * amount);
      head.rotation.y = -torso.rotation.y * .54;
      head.rotation.z = breath * 1.5;
      for (const { arm, leg, knee, side } of limbs) {
        const cycle = Math.sin(phase) * side;
        const swing = cycle * stride * amount;
        arm.rotation.set(-.68 * swing + breath, 0, side * (.075 + .055 * stride));
        leg.rotation.x = .68 * swing;
        knee.rotation.x = -.82 * Math.max(0, -cycle) * stride * amount;
      }
    }
  };
}
