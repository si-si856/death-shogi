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

  if (mode === "pvp") {
    game = createPVPGame();
  } else {
    game = createNPCGame();
  }

  game.start();
}

// ===== 戻る =====
function backToMenu() {
  if (game) game.destroy();

  document.getElementById("menu").style.display = "block";
  document.getElementById("board").style.display = "none";
  document.getElementById("backBtn").style.display = "none";

  document.getElementById("topPlayerLabel").style.display = "none";
  document.getElementById("bottomPlayerLabel").style.display = "none";

  document.getElementById("status").innerText = "モードを選択してください";
}

// ===== カメラ =====
window.onload = () => {
  initCamera();
};

// ===== テスト =====
function testCapture(side) {
  captureWithCountdown(side);
}