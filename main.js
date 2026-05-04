let gameMode = null;
let game = null;

// ===== ゲーム開始 =====
function startGame(mode) {
  gameMode = mode;

  document.getElementById("menu").style.display = "none";
  document.getElementById("board").style.display = "grid";
  document.getElementById("backBtn").style.display = "inline-block";

  document.getElementById("topPlayerLabel").style.display = "flex";
  document.getElementById("bottomPlayerLabel").style.display = "flex";

  const topName = document.getElementById("topName");
  const bottomName = document.getElementById("bottomName");

  if (mode === "pvp") {
    topName.innerText = "プレイヤー2";
    bottomName.innerText = "プレイヤー1";
  } else {
    topName.innerText = "相手";
    bottomName.innerText = "あなた";
  }

  // ===== ゲーム生成 =====
  if (mode === "pvp") {
    game = createPVPGame();
  } else {
    game = createNPCGame();
  }

  // ⭐🔥 ここが超重要（camera.jsと接続）
  window.game = game;

  game.start();

  updateCameraGuide();
}

// ===== 戻る =====
function backToMenu() {
  if (game) game.destroy();

  game = null;
  window.game = null; // ⭐ 念のためクリア
  gameMode = null;

  document.getElementById("menu").style.display = "block";
  document.getElementById("board").style.display = "none";
  document.getElementById("backBtn").style.display = "none";

  document.getElementById("topPlayerLabel").style.display = "none";
  document.getElementById("bottomPlayerLabel").style.display = "none";

  document.getElementById("status").innerText = "モードを選択してください";
}

// ===== カメラ初期化 =====
window.onload = () => {
  initCamera();
};

// ===== 撮影 =====
function captureCurrentPlayer() {
  if (!game) return;

  const current = game.getCurrentPlayer();

  // ===== NPCモード =====
  if (gameMode === "npc") {
    updateStatusGuide("あなたのターンです\n中央に立って撮影してください");
    captureWithCountdown("player");
    return;
  }

  // ===== PVPモード =====
  if (current === "player") {
    updateStatusGuide("プレイヤー1のターン\n左側に立ってください");
  } else {
    updateStatusGuide("プレイヤー2のターン\n右側に立ってください");
  }

  captureWithCountdown(current);
}

// ===== ステータス補助 =====
function updateStatusGuide(text) {
  const status = document.getElementById("status");
  status.innerText = text;
}

// ===== カメラガイド表示制御 =====
function updateCameraGuide() {
  const left = document.getElementById("leftGuide");
  const right = document.getElementById("rightGuide");

  if (!left || !right) return;

  left.style.borderColor = "red";
  right.style.borderColor = "red";
}