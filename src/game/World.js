import * as THREE from "three";
import { COLORS, flatMat } from "./materials.js";

function makeTree(x, z, scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 1.6 * scale, 6),
    flatMat(COLORS.bark)
  );
  trunk.position.y = 0.8 * scale;
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(1.1 * scale, 8, 6),
    flatMat(COLORS.pine)
  );
  canopy.position.y = 2.1 * scale;
  canopy.scale.y = 0.85;
  g.add(trunk, canopy);
  g.position.set(x, 0, z);
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

function makeBamboo(x, z) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const h = 2.5 + Math.random() * 1.5;
    const stalk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, h, 5),
      flatMat(COLORS.bamboo)
    );
    stalk.position.set((Math.random() - 0.5) * 0.4, h / 2, (Math.random() - 0.5) * 0.4);
    stalk.castShadow = true;
    g.add(stalk);
  }
  g.position.set(x, 0, z);
  return g;
}

function makeRock(x, z, s = 1) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.6 * s, 0),
    flatMat(COLORS.stone, { roughness: 0.95 })
  );
  rock.position.set(x, 0.3 * s, z);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

function makeTemple(x, z) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.4, 5),
    flatMat(COLORS.stone)
  );
  base.position.y = 0.2;

  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 2.2, 3.5),
    flatMat(0xc4b090, { roughness: 0.8 })
  );
  hall.position.y = 1.4;

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.6, 1.6, 4),
    flatMat(COLORS.roof, { roughness: 0.7 })
  );
  roof.position.y = 3.2;
  roof.rotation.y = Math.PI / 4;

  const pillarMat = flatMat(0x8b2e2e);
  for (const px of [-1.6, 1.6]) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 2.2, 8),
      pillarMat
    );
    pillar.position.set(px, 1.3, 1.9);
    g.add(pillar);
  }

  const lantern = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 6),
    new THREE.MeshStandardMaterial({
      color: COLORS.lantern,
      emissive: COLORS.lantern,
      emissiveIntensity: 0.8,
      roughness: 0.4,
    })
  );
  lantern.position.set(0, 2.4, 2.1);

  g.add(base, hall, roof, lantern);
  g.position.set(x, 0, z);
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return { group: g, interactPos: new THREE.Vector3(x, 0, z + 3.5) };
}

function makePagoda(x, z) {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const w = 2.2 - i * 0.35;
    const tier = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.9, w),
      flatMat(0xb8a888)
    );
    tier.position.y = 0.5 + i * 1.1;
    const eaves = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.6, 0.12, w + 0.6),
      flatMat(COLORS.roof)
    );
    eaves.position.y = 0.95 + i * 1.1;
    g.add(tier, eaves);
  }
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 8), flatMat(COLORS.gold));
  tip.position.y = 5.2;
  g.add(tip);
  g.position.set(x, 0, z);
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

export function createWorld(scene) {
  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120, 40, 40),
    flatMat(0x3a5a3e, { roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  // Gentle height variation
  const pos = ground.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    if (Math.hypot(x, y) < 55) {
      pos.setZ(i, Math.sin(x * 0.15) * Math.cos(y * 0.12) * 0.35);
    }
  }
  ground.geometry.computeVertexNormals();
  scene.add(ground);

  // Path
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 68),
    flatMat(COLORS.path, { roughness: 1 })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.04, -10);
  path.receiveShadow = true;
  scene.add(path);

  // Pond
  const pond = new THREE.Mesh(
    new THREE.CircleGeometry(5, 24),
    new THREE.MeshStandardMaterial({
      color: COLORS.water,
      roughness: 0.15,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    })
  );
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(-14, 0.05, 8);
  scene.add(pond);

  const trees = [];
  const rng = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < 55; i++) {
    let x = rng(-50, 50);
    let z = rng(-50, 50);
    if (Math.hypot(x, z) < 8) continue;
    if (Math.abs(x) < 3 && z > -40 && z < 30) continue;
    const t = makeTree(x, z, rng(0.7, 1.4));
    scene.add(t);
    trees.push(t);
  }

  for (let i = 0; i < 40; i++) {
    scene.add(makeBamboo(rng(-45, 45), rng(-45, 45)));
  }

  for (let i = 0; i < 20; i++) {
    scene.add(makeRock(rng(-48, 48), rng(-48, 48), rng(0.5, 1.8)));
  }

  // Mountain ridges (far)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const dist = 58;
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(8 + Math.random() * 6, 14 + Math.random() * 10, 5),
      flatMat(0x1e3028, { roughness: 1 })
    );
    m.position.set(Math.cos(angle) * dist, 4, Math.sin(angle) * dist);
    m.receiveShadow = true;
    scene.add(m);
  }

  const temple = makeTemple(0, -28);
  scene.add(temple.group);
  scene.add(makePagoda(22, -18));

  // Soft mist sprites (circular alpha, not square points)
  const mistCanvas = document.createElement("canvas");
  mistCanvas.width = 64;
  mistCanvas.height = 64;
  const mctx = mistCanvas.getContext("2d");
  const grad = mctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, "rgba(200,220,210,0.55)");
  grad.addColorStop(0.45, "rgba(170,195,185,0.2)");
  grad.addColorStop(1, "rgba(170,195,185,0)");
  mctx.fillStyle = grad;
  mctx.fillRect(0, 0, 64, 64);
  const mistTex = new THREE.CanvasTexture(mistCanvas);
  const mistCount = 50;
  const mistGeo = new THREE.BufferGeometry();
  const mistPos = new Float32Array(mistCount * 3);
  for (let i = 0; i < mistCount; i++) {
    mistPos[i * 3] = rng(-40, 40);
    mistPos[i * 3 + 1] = rng(1.2, 5);
    mistPos[i * 3 + 2] = rng(-40, 40);
  }
  mistGeo.setAttribute("position", new THREE.BufferAttribute(mistPos, 3));
  const mist = new THREE.Points(
    mistGeo,
    new THREE.PointsMaterial({
      map: mistTex,
      color: 0xc8d8d0,
      size: 4.5,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  scene.add(mist);

  // Collectibles & interactables placed later by Game
  return {
    bounds: { minX: -48, maxX: 48, minZ: -48, maxZ: 48 },
    temple,
    mist,
    spawn: new THREE.Vector3(0, 0, 8),
  };
}

export function createCollectible(type, position) {
  const g = new THREE.Group();
  g.userData = { type, collected: false };

  if (type === "scroll") {
    const scroll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.7, 10),
      flatMat(COLORS.scroll, { roughness: 0.6 })
    );
    scroll.rotation.z = Math.PI / 2;
    const glow = new THREE.PointLight(0xc9a24d, 0.8, 4);
    g.add(scroll, glow);
  } else if (type === "herb") {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 6),
      flatMat(COLORS.herb, { roughness: 0.5 })
    );
    leaf.scale.y = 0.5;
    const glow = new THREE.PointLight(0x5cb85c, 0.5, 3);
    g.add(leaf, glow);
  } else if (type === "wine") {
    const jar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 0.5, 10),
      flatMat(0x6b3a2a, { roughness: 0.55 })
    );
    jar.position.y = 0.25;
    const glow = new THREE.PointLight(0xc47a3a, 0.6, 3);
    g.add(jar, glow);
  }

  g.position.copy(position);
  g.position.y = 0.6;
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return g;
}
