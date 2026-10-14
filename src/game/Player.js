import * as THREE from "three";
import { COLORS, flatMat } from "./materials.js";

/** Procedural 令狐沖 — wandering Huashan disciple with green-tinged robe & sword */
export function createLinghuChong() {
  const root = new THREE.Group();
  root.name = "LinghuChong";

  const bodyMat = flatMat(COLORS.robe, { roughness: 0.75 });
  const accentMat = flatMat(0x2a5a3a, { roughness: 0.7 });
  const skinMat = flatMat(COLORS.skin, { roughness: 0.65 });
  const hairMat = flatMat(COLORS.hair, { roughness: 0.9 });
  const bootMat = flatMat(0x2a2218, { roughness: 0.9 });
  const swordMat = flatMat(COLORS.sword, { metalness: 0.85, roughness: 0.25 });
  const hiltMat = flatMat(0x3a2a18, { roughness: 0.7 });

  // Legs
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.28), bootMat);
  leftLeg.position.set(-0.16, 0.35, 0);
  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.16;
  root.add(leftLeg, rightLeg);

  // Torso / robe
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.4), bodyMat);
  torso.position.y = 1.05;
  root.add(torso);

  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.42), accentMat);
  sash.position.y = 0.78;
  root.add(sash);

  // Arms
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), bodyMat);
  leftArm.position.set(-0.48, 1.05, 0);
  const rightArm = new THREE.Group();
  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), bodyMat);
  rightArmMesh.position.y = -0.2;
  rightArm.position.set(0.48, 1.25, 0);
  rightArm.add(rightArmMesh);
  root.add(leftArm, rightArm);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), skinMat);
  head.position.y = 1.68;
  root.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), hairMat);
  hair.scale.set(1, 0.85, 1.05);
  hair.position.set(0, 1.78, -0.02);
  root.add(hair);

  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), hairMat);
  bun.position.set(0, 1.98, -0.05);
  root.add(bun);

  // Sword (right hand)
  const sword = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.12), swordMat);
  blade.position.y = 0.55;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 4), swordMat);
  tip.position.y = 1.2;
  tip.rotation.z = Math.PI;
  tip.rotation.y = Math.PI / 4;
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.18), hiltMat);
  guard.position.y = 0.02;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.28, 8), hiltMat);
  grip.position.y = -0.16;
  sword.add(blade, tip, guard, grip);
  sword.position.set(0.12, -0.55, 0.05);
  sword.rotation.z = -0.15;
  rightArm.add(sword);

  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return {
    root,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    sword,
    height: 1.9,
  };
}

export class PlayerController {
  constructor(player, camera) {
    this.player = player;
    this.camera = camera;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.keys = {};
    this.yaw = 0;
    this.pitch = 0.35;
    this.speed = 7;
    this.sprintMul = 1.7;
    this.hp = 100;
    this.maxHp = 100;
    this.qi = 100;
    this.maxQi = 100;
    this.attacking = false;
    this.attackTimer = 0;
    this.invuln = 0;
    this.alive = true;
    this.swordAngle = 0;

    this._onKeyDown = (e) => {
      this.keys[e.code] = true;
    };
    this._onKeyUp = (e) => {
      this.keys[e.code] = false;
    };
    this._onMouseMove = (e) => {
      if (document.pointerLockElement) {
        this.yaw -= e.movementX * 0.0025;
        this.pitch = THREE.MathUtils.clamp(
          this.pitch - e.movementY * 0.002,
          0.1,
          1.1
        );
      }
    };

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    window.addEventListener("mousemove", this._onMouseMove);
  }

  dispose() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    window.removeEventListener("mousemove", this._onMouseMove);
  }

  takeDamage(amount) {
    if (this.invuln > 0 || !this.alive) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invuln = 0.6;
    if (this.hp <= 0) {
      this.alive = false;
    }
    return true;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  startAttack() {
    if (this.attacking || !this.alive || this.qi < 8) return false;
    this.attacking = true;
    this.attackTimer = 0.35;
    this.qi = Math.max(0, this.qi - 8);
    return true;
  }

  getAttackHitbox() {
    if (!this.attacking || this.attackTimer > 0.28) return null;
    const origin = this.player.root.position.clone();
    origin.y += 1;
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    return { origin, forward, range: 2.4, radius: 1.1 };
  }

  update(dt, worldBounds) {
    if (!this.alive) return;

    this.invuln = Math.max(0, this.invuln - dt);
    this.qi = Math.min(this.maxQi, this.qi + dt * 12);

    if (this.attacking) {
      this.attackTimer -= dt;
      this.swordAngle = Math.sin((0.35 - this.attackTimer) / 0.35 * Math.PI) * 1.8;
      this.player.rightArm.rotation.x = -this.swordAngle * 0.6;
      this.player.rightArm.rotation.y = this.swordAngle * 0.5;
      if (this.attackTimer <= 0) {
        this.attacking = false;
        this.player.rightArm.rotation.set(0, 0, 0);
      }
    }

    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    this.direction.set(0, 0, 0);
    if (this.keys["KeyW"]) this.direction.add(forward);
    if (this.keys["KeyS"]) this.direction.sub(forward);
    if (this.keys["KeyA"]) this.direction.sub(right);
    if (this.keys["KeyD"]) this.direction.add(right);

    const moving = this.direction.lengthSq() > 0;
    if (moving) {
      this.direction.normalize();
      const sprint = this.keys["ShiftLeft"] || this.keys["ShiftRight"];
      const spd = this.speed * (sprint && this.qi > 5 ? this.sprintMul : 1);
      if (sprint && this.qi > 5) this.qi -= dt * 18;
      this.player.root.position.addScaledVector(this.direction, spd * dt);
      const faceYaw = Math.atan2(-this.direction.x, -this.direction.z);
      this.player.root.rotation.y = faceYaw;
    }

    // Walk bob
    const t = performance.now() * 0.01;
    if (moving) {
      this.player.leftLeg.rotation.x = Math.sin(t) * 0.55;
      this.player.rightLeg.rotation.x = Math.sin(t + Math.PI) * 0.55;
      this.player.leftArm.rotation.x = Math.sin(t + Math.PI) * 0.35;
      if (!this.attacking) {
        this.player.rightArm.rotation.x = Math.sin(t) * 0.25;
      }
    } else {
      this.player.leftLeg.rotation.x = 0;
      this.player.rightLeg.rotation.x = 0;
      this.player.leftArm.rotation.x = 0;
      if (!this.attacking) this.player.rightArm.rotation.x = 0;
    }

    // Clamp to world
    const p = this.player.root.position;
    p.x = THREE.MathUtils.clamp(p.x, worldBounds.minX, worldBounds.maxX);
    p.z = THREE.MathUtils.clamp(p.z, worldBounds.minZ, worldBounds.maxZ);
    p.y = 0;

    // Third-person camera
    const camOffset = new THREE.Vector3(
      Math.sin(this.yaw) * 7,
      2.2 + Math.sin(this.pitch) * 4,
      Math.cos(this.yaw) * 7
    );
    const target = p.clone().add(new THREE.Vector3(0, 1.4, 0));
    const desired = target.clone().add(camOffset);
    this.camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
    this.camera.lookAt(target);
  }
}
