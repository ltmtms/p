import { Game } from "./game/Game.js";

const canvas = document.getElementById("game-canvas");
const titleScreen = document.getElementById("title-screen");
const hud = document.getElementById("hud");
const dialogue = document.getElementById("dialogue");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueText = document.getElementById("dialogue-text");
const victory = document.getElementById("victory");
const victoryText = document.getElementById("victory-text");
const toastEl = document.getElementById("toast");
const hpFill = document.getElementById("hp-fill");
const qiFill = document.getElementById("qi-fill");
const questText = document.getElementById("quest-text");

const game = new Game(canvas);

let toastTimer = null;
game.onToast = (msg) => {
  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 2800);
};

game.onHud = ({ hp, qi, quest }) => {
  hpFill.style.transform = `scaleX(${Math.max(0, hp)})`;
  qiFill.style.transform = `scaleX(${Math.max(0, qi)})`;
  questText.textContent = quest;
};

game.onDialogue = (line) => {
  if (!line) {
    dialogue.classList.add("hidden");
    return;
  }
  dialogueSpeaker.textContent = line.speaker;
  dialogueText.textContent = line.text;
  dialogue.classList.remove("hidden");
  document.exitPointerLock?.();
};

game.onVictory = (msg) => {
  victoryText.textContent = msg;
  victory.classList.remove("hidden");
  hud.classList.add("hidden");
};

game.onDefeat = () => {
  victoryText.textContent = "令狐沖力有不逮，暫且退下……重整真氣，再戰江湖。";
  victory.classList.remove("hidden");
  hud.classList.add("hidden");
};

document.getElementById("btn-start").addEventListener("click", () => {
  titleScreen.classList.add("hidden");
  hud.classList.remove("hidden");
  game.start();
});

document.getElementById("btn-dialogue").addEventListener("click", () => {
  game.nextDialogue();
  if (game.running) {
    canvas.requestPointerLock?.();
  }
});

document.getElementById("btn-restart").addEventListener("click", () => {
  victory.classList.add("hidden");
  hud.classList.remove("hidden");
  game.restart();
  canvas.requestPointerLock?.();
});

// Title-screen ambient camera orbit until the player starts
let titleOrbit = true;
const orbit = () => {
  if (!titleOrbit) return;
  const t = performance.now() * 0.00015;
  game.camera.position.set(Math.sin(t) * 22, 9, Math.cos(t) * 22);
  game.camera.lookAt(0, 1.2, -8);
  if (game.world.mist) game.world.mist.rotation.y += 0.002;
  game.renderer.render(game.scene, game.camera);
  requestAnimationFrame(orbit);
};
orbit();

const originalStart = game.start.bind(game);
game.start = () => {
  titleOrbit = false;
  originalStart();
};
