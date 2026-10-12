import * as THREE from "three";

export const COLORS = {
  pine: 0x1a3a2a,
  moss: 0x2f6b4f,
  bark: 0x3a2a1c,
  stone: 0x5a5e58,
  roof: 0x6b2e2e,
  robe: 0xc9b48a,
  hair: 0x1a1410,
  skin: 0xd4b08c,
  sword: 0xb8c4cc,
  bamboo: 0x4a7a3a,
  path: 0x6a5a42,
  water: 0x2a4a52,
  lantern: 0xc47a3a,
  enemyRobe: 0x4a3030,
  scroll: 0xd4c4a0,
  herb: 0x5cb85c,
  gold: 0xc9a24d,
};

export function flatMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.85,
    metalness: opts.metalness ?? 0.05,
    ...opts,
  });
}
