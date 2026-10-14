import * as THREE from "three";
import { createLinghuChong, PlayerController } from "./Player.js";
import { createWorld, createCollectible } from "./World.js";
import { createBandit, BanditAI } from "./Enemy.js";

const QUESTS = [
  {
    id: "scrolls",
    text: "尋找獨孤九劍殘篇（0/3）",
    doneText: "殘篇齊全，前往華山古廟求教",
  },
  {
    id: "temple",
    text: "前往華山古廟，拜見風清揚前輩",
    doneText: "得風清揚親傳，江湖之路更寬",
  },
];

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.running = false;
    this.clock = new THREE.Clock();
    this.bandits = [];
    this.collectibles = [];
    this.scrollsFound = 0;
    this.questIndex = 0;
    this.dialogueQueue = [];
    this.onDialogue = null;
    this.onToast = null;
    this.onHud = null;
    this.onVictory = null;
    this.onDefeat = null;
    this.templeTalked = false;
    this._slashFx = [];

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x6a8a88);
    this.scene.fog = new THREE.FogExp2(0x7a9a94, 0.018);

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this._setupLights();
    this.world = createWorld(this.scene);

    this.playerMesh = createLinghuChong();
    this.playerMesh.root.position.copy(this.world.spawn);
    this.scene.add(this.playerMesh.root);
    this.player = new PlayerController(this.playerMesh, this.camera);

    this._spawnContent();
    this._onResize = () => this.resize();
    window.addEventListener("resize", this._onResize);

    this._onClick = () => {
      if (!this.running) return;
      if (document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock();
      }
      this.tryAttack();
    };
    this.canvas.addEventListener("click", this._onClick);

    this._onKey = (e) => {
      if (!this.running) return;
      if (e.code === "KeyE") this.tryInteract();
    };
    window.addEventListener("keydown", this._onKey);
  }

  _setupLights() {
    const hemi = new THREE.HemisphereLight(0xb8d0c8, 0x2a3a28, 0.55);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffe2c0, 1.15);
    sun.position.set(30, 45, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x6a90a0, 0.35);
    fill.position.set(-20, 20, -30);
    this.scene.add(fill);
  }

  _spawnContent() {
    const scrollSpots = [
      new THREE.Vector3(-18, 0, -8),
      new THREE.Vector3(16, 0, 12),
      new THREE.Vector3(-8, 0, -38),
    ];
    scrollSpots.forEach((p) => {
      const c = createCollectible("scroll", p);
      this.scene.add(c);
      this.collectibles.push(c);
    });

    const herbs = [
      new THREE.Vector3(10, 0, 5),
      new THREE.Vector3(-22, 0, 15),
      new THREE.Vector3(5, 0, -15),
    ];
    herbs.forEach((p) => {
      const c = createCollectible("herb", p);
      this.scene.add(c);
      this.collectibles.push(c);
    });

    const wine = createCollectible("wine", new THREE.Vector3(8, 0, -22));
    this.scene.add(wine);
    this.collectibles.push(wine);

    const banditSpawns = [
      { pos: new THREE.Vector3(-12, 0, 0), center: new THREE.Vector3(-12, 0, 0) },
      { pos: new THREE.Vector3(14, 0, -5), center: new THREE.Vector3(14, 0, -5) },
      { pos: new THREE.Vector3(-5, 0, -20), center: new THREE.Vector3(-5, 0, -20) },
      { pos: new THREE.Vector3(20, 0, 8), center: new THREE.Vector3(20, 0, 8) },
      { pos: new THREE.Vector3(-25, 0, -15), center: new THREE.Vector3(-25, 0, -15) },
    ];
    banditSpawns.forEach(({ pos, center }) => {
      const mesh = createBandit();
      this.scene.add(mesh.root);
      this.bandits.push(new BanditAI(mesh, pos, center));
    });
  }

  start() {
    this.running = true;
    this.clock.start();
    this.toast("華山腳下，令狐沖仗劍而行");
    this.updateHud();
    this.canvas.requestPointerLock?.();
    this.loop();
  }

  restart() {
    // Reset player
    this.player.hp = 100;
    this.player.qi = 100;
    this.player.alive = true;
    this.playerMesh.root.position.copy(this.world.spawn);
    this.player.yaw = 0;
    this.scrollsFound = 0;
    this.questIndex = 0;
    this.templeTalked = false;

    this.collectibles.forEach((c) => {
      c.userData.collected = false;
      c.visible = true;
    });
    this.bandits.forEach((b, i) => {
      b.alive = true;
      b.hp = b.maxHp;
      b.root.visible = true;
      const spots = [
        [-12, 0],
        [14, -5],
        [-5, -20],
        [20, 8],
        [-25, -15],
      ];
      b.root.position.set(spots[i][0], 0, spots[i][1]);
    });

    this.running = true;
    this.updateHud();
    this.toast("重整旗鼓，再闖江湖");
  }

  toast(msg) {
    this.onToast?.(msg);
  }

  updateHud() {
    let questText = QUESTS[this.questIndex]?.text ?? "";
    if (this.questIndex === 0) {
      questText = `尋找獨孤九劍殘篇（${this.scrollsFound}/3）`;
    }
    this.onHud?.({
      hp: this.player.hp / this.player.maxHp,
      qi: this.player.qi / this.player.maxQi,
      quest: questText,
    });
  }

  tryAttack() {
    if (!this.player.startAttack()) return;
    this._spawnSlash();
  }

  _spawnSlash() {
    const geo = new THREE.RingGeometry(0.3, 1.4, 16, 1, 0, Math.PI * 0.7);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xdce8f0,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const slash = new THREE.Mesh(geo, mat);
    const yaw = this.player.yaw;
    const origin = this.playerMesh.root.position.clone();
    slash.position.set(
      origin.x - Math.sin(yaw) * 1.2,
      1.2,
      origin.z - Math.cos(yaw) * 1.2
    );
    slash.rotation.x = Math.PI / 2;
    slash.rotation.z = yaw;
    this.scene.add(slash);
    this._slashFx.push({ mesh: slash, life: 0.25 });
  }

  tryInteract() {
    const p = this.playerMesh.root.position;
    // Temple
    const templePos = this.world.temple.interactPos;
    if (p.distanceTo(templePos) < 3.5) {
      this.talkAtTemple();
      return;
    }
    // Nearby collectibles auto-picked in update, but E can force
    for (const c of this.collectibles) {
      if (c.userData.collected) continue;
      if (p.distanceTo(c.position) < 2.2) {
        this.collect(c);
        return;
      }
    }
    this.toast("附近無可互動之物");
  }

  talkAtTemple() {
    if (this.scrollsFound < 3) {
      this.showDialogue([
        {
          speaker: "風清揚",
          text: "令狐沖，獨孤九劍殘篇未齊，你劍招尚未圓融。先去山林尋找三卷殘篇吧。",
        },
      ]);
      return;
    }
    if (this.templeTalked) {
      this.toast("風清揚已傳授心得，不妨再逛逛華山");
      return;
    }
    this.templeTalked = true;
    this.questIndex = 1;
    this.showDialogue([
      {
        speaker: "風清揚",
        text: "好徒兒，殘篇已在你手。無招勝有招——記住，敵人意念一動，你便搶先出手。",
      },
      {
        speaker: "令狐沖",
        text: "多謝風前輩！弟子謹記。今日華山一遊，不枉此生。",
      },
    ], () => {
      this.questIndex = QUESTS.length;
      this.updateHud();
      this.onVictory?.(
        "獨孤九劍殘篇已齊，得風清揚點撥。令狐沖笑傲江湖，仗劍天涯。"
      );
      this.running = false;
      document.exitPointerLock?.();
    });
  }

  showDialogue(lines, onDone) {
    this.dialogueQueue = [...lines];
    this._dialogueDone = onDone;
    this._advanceDialogue();
  }

  _advanceDialogue() {
    if (this.dialogueQueue.length === 0) {
      this.onDialogue?.(null);
      this._dialogueDone?.();
      this._dialogueDone = null;
      return;
    }
    const line = this.dialogueQueue.shift();
    this.onDialogue?.(line);
  }

  nextDialogue() {
    this._advanceDialogue();
  }

  collect(item) {
    if (item.userData.collected) return;
    item.userData.collected = true;
    item.visible = false;
    const type = item.userData.type;
    if (type === "scroll") {
      this.scrollsFound += 1;
      this.toast(`獲得獨孤九劍殘篇（${this.scrollsFound}/3）`);
      if (this.scrollsFound >= 3) {
        this.questIndex = 1;
        this.toast("殘篇已齊！前往華山古廟拜見風清揚");
      }
    } else if (type === "herb") {
      this.player.heal(25);
      this.toast("採得靈芝，內力恢復");
    } else if (type === "wine") {
      this.player.qi = this.player.maxQi;
      this.toast("桃花酒入喉，真氣充盈！");
    }
    this.updateHud();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  loop = () => {
    if (!this.running && this.player.alive) {
      // still render title freeze? only animate when running
    }
    requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);

    // Always spin collectibles
    for (const c of this.collectibles) {
      if (!c.userData.collected) {
        c.rotation.y += dt * 1.5;
        c.position.y = 0.6 + Math.sin(performance.now() * 0.003 + c.position.x) * 0.15;
      }
    }

    // Mist drift
    if (this.world.mist) {
      this.world.mist.rotation.y += dt * 0.02;
    }

    // Slash FX
    for (let i = this._slashFx.length - 1; i >= 0; i--) {
      const fx = this._slashFx[i];
      fx.life -= dt;
      fx.mesh.material.opacity = Math.max(0, fx.life / 0.25);
      fx.mesh.scale.multiplyScalar(1 + dt * 4);
      if (fx.life <= 0) {
        this.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        fx.mesh.material.dispose();
        this._slashFx.splice(i, 1);
      }
    }

    if (this.running) {
      this.player.update(dt, this.world.bounds);

      // Pickup proximity
      const pp = this.playerMesh.root.position;
      for (const c of this.collectibles) {
        if (!c.userData.collected && pp.distanceTo(c.position) < 1.6) {
          this.collect(c);
        }
      }

      // Combat vs bandits
      const hit = this.player.getAttackHitbox();
      for (const b of this.bandits) {
        const result = b.update(dt, pp);
        if (result.attacked && b.root.position.distanceTo(pp) < 2.2) {
          if (this.player.takeDamage(result.damage)) {
            this.updateHud();
            this.toast("中刀！小心敵人");
            if (!this.player.alive) {
              this.running = false;
              document.exitPointerLock?.();
              this.onDefeat?.();
            }
          }
        }
        if (hit && b.alive) {
          const toE = b.root.position.clone().sub(hit.origin);
          toE.y = 0;
          const dist = toE.length();
          if (dist < hit.range) {
            const dir = toE.normalize();
            if (dir.dot(hit.forward) > 0.25) {
              b.takeDamage(22);
              if (!b.alive) this.toast("擊敗山賊！");
            }
          }
        }
      }

      this.updateHud();
    } else {
      // Idle camera sway on title
      if (!this.player.alive || this.questIndex >= QUESTS.length) {
        // keep last frame
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.running = false;
    window.removeEventListener("resize", this._onResize);
    this.canvas.removeEventListener("click", this._onClick);
    window.removeEventListener("keydown", this._onKey);
    this.player.dispose();
    this.renderer.dispose();
  }
}
