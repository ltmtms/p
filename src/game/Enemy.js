import * as THREE from "three";
import { COLORS, flatMat } from "./materials.js";

export function createBandit() {
  const root = new THREE.Group();
  const bodyMat = flatMat(COLORS.enemyRobe);
  const skinMat = flatMat(COLORS.skin);
  const hairMat = flatMat(COLORS.hair);
  const bladeMat = flatMat(0x889098, { metalness: 0.7, roughness: 0.35 });

  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.3), bodyMat);
  legs.position.y = 0.35;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.35), bodyMat);
  torso.position.y = 0.95;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), skinMat);
  head.position.y = 1.55;
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 6), hairMat);
  hair.position.set(0, 1.62, -0.02);
  hair.scale.y = 0.8;

  const arm = new THREE.Group();
  const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), bodyMat);
  armMesh.position.y = -0.15;
  arm.position.set(0.42, 1.15, 0);
  const dao = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.14), bladeMat);
  dao.position.set(0.05, -0.7, 0);
  arm.add(armMesh, dao);
  root.add(legs, torso, head, hair, arm);

  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return { root, arm, height: 1.7 };
}

export class BanditAI {
  constructor(mesh, position, patrolCenter) {
    this.mesh = mesh;
    this.root = mesh.root;
    this.root.position.copy(position);
    this.patrolCenter = patrolCenter.clone();
    this.hp = 40;
    this.maxHp = 40;
    this.alive = true;
    this.state = "patrol";
    this.timer = Math.random() * 2;
    this.speed = 3.2;
    this.aggroRange = 12;
    this.attackRange = 1.8;
    this.attackCooldown = 0;
    this.patrolAngle = Math.random() * Math.PI * 2;
    this.hitFlash = 0;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    this.hitFlash = 0.15;
    this.state = "chase";
    if (this.hp <= 0) {
      this.alive = false;
      this.root.visible = false;
    }
  }

  update(dt, playerPos) {
    if (!this.alive) return { attacked: false };

    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.timer -= dt;

    const pos = this.root.position;
    const toPlayer = playerPos.clone().sub(pos);
    toPlayer.y = 0;
    const dist = toPlayer.length();

    let attacked = false;

    if (dist < this.aggroRange) {
      this.state = dist < this.attackRange ? "attack" : "chase";
    } else if (this.state !== "patrol") {
      this.state = "patrol";
    }

    if (this.state === "patrol") {
      this.patrolAngle += dt * 0.6;
      const target = this.patrolCenter.clone().add(
        new THREE.Vector3(Math.cos(this.patrolAngle) * 4, 0, Math.sin(this.patrolAngle) * 4)
      );
      const dir = target.sub(pos);
      dir.y = 0;
      if (dir.lengthSq() > 0.1) {
        dir.normalize();
        pos.addScaledVector(dir, this.speed * 0.55 * dt);
        this.root.rotation.y = Math.atan2(-dir.x, -dir.z);
      }
    } else if (this.state === "chase") {
      if (dist > 0.5) {
        const dir = toPlayer.normalize();
        pos.addScaledVector(dir, this.speed * dt);
        this.root.rotation.y = Math.atan2(-dir.x, -dir.z);
      }
    } else if (this.state === "attack") {
      this.root.rotation.y = Math.atan2(-toPlayer.x, -toPlayer.z);
      this.mesh.arm.rotation.x = Math.sin(performance.now() * 0.02) * 0.8;
      if (this.attackCooldown <= 0) {
        attacked = true;
        this.attackCooldown = 1.2;
      }
    }

    // Bob
    const t = performance.now() * 0.012;
    this.root.position.y = Math.abs(Math.sin(t)) * 0.03;

    return { attacked, damage: 12 };
  }
}
