let video;
let canvas;
let ctx;

// ===== カメラ初期化 =====
function initCamera() {
  const container = document.getElementById("cameraContainer");

  video = document.createElement("video");
  video.autoplay = true;

  container.appendChild(video);

  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("カメラ取得エラー:", err);
    });
}

// ===== カウントダウン撮影（5秒）=====
function captureWithCountdown(currentPlayer) {
  let count = 5;

  function tick() {
    document.getElementById("status").innerText = `撮影まで ${count}秒`;

    if (count === 0) {
      const img = capturePlayerArea(currentPlayer);
      console.log("取得画像:", img);

      // ⭐ AIに送る
      analyzePose(img).then(piece => {
        if (!piece) {
          console.log("AI判定失敗");
          return;
        }

        console.log("AI結果:", piece);

        document.getElementById("status").innerText =
          `認識結果: ${piece}`;

        // ⭐ ゲームに反映（ここが本命）
        if (window.game && typeof game.applyAIMove === "function") {
          game.applyAIMove(piece);
        }
      });

      return;
    }

    count--;
    setTimeout(tick, 1000);
  }

  tick();
}

// ===== 領域切り出し =====
function capturePlayerArea(currentPlayer) {
  const width = video.videoWidth;
  const height = video.videoHeight;

  // 🔥 カメラ未準備対策
  if (!width || !height) {
    console.warn("カメラ未準備");
    return null;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(video, 0, 0);

  const cropCanvas = document.createElement("canvas");
  const cropCtx = cropCanvas.getContext("2d");

  cropCanvas.width = width / 2;
  cropCanvas.height = height;

  if (currentPlayer === "player") {
    // 右側
    cropCtx.drawImage(
      canvas,
      width / 2, 0,
      width / 2, height,
      0, 0,
      width / 2, height
    );
  } else {
    // 左側
    cropCtx.drawImage(
      canvas,
      0, 0,
      width / 2, height,
      0, 0,
      width / 2, height
    );
  }

  return cropCanvas.toDataURL("image/png");
}