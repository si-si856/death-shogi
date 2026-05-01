function createNPCGame() {
  const boardElement = document.getElementById("board");
  const statusText = document.getElementById("status");
  const toast = document.getElementById("toast");

  let board = [];
  let currentPlayer = "player";
  let selected = null;
  let validMoves = [];
  let timer = 30;
  let timerInterval = null;

  // ⭐ AI制限
  let allowedPieceType = null;

  function switchTurn() {
    currentPlayer = currentPlayer === "player" ? "enemy" : "player";
  }

  function startTimer() {
    clearInterval(timerInterval);
    timer = 30;

    timerInterval = setInterval(() => {
      timer--;

      if (timer <= 0) {
        clearInterval(timerInterval);

        selected = null;
        validMoves = [];
        allowedPieceType = null; // ⭐リセット

        showToast(toast, "⏰ 時間切れ！ターン交代", true);

        switchTurn();
        startTimer();
        render();

        if (currentPlayer === "enemy") {
          setTimeout(npcMove, 500);
        }

        return;
      }

      updateStatus();
    }, 1000);
  }

  function updateStatus() {
    let text =
      currentPlayer === "player"
        ? `🟢 あなた（${timer}秒）`
        : `🤖 相手（${timer}秒）`;

    if (isCheck(board, currentPlayer)) {
      text = "🚨 王手！\n" + text;
    }

    statusText.innerText = text;
  }

  function handleClick(x, y) {
    if (currentPlayer !== "player") return;

    const cell = board[y][x];

    // ===== 駒選択 =====
    if (cell && cell.owner === "player") {

      // ⭐ AI制限（ここが本命）
      if (allowedPieceType && cell.type !== allowedPieceType) {
        showToast(toast, "この駒は選べません", true);
        return;
      }

      selected = { x, y };
      validMoves = getValidMoves(board, cell, x, y);
      render();
      return;
    }

    if (!selected) return;

    const isValid = validMoves.some((m) => m.x === x && m.y === y);
    if (!isValid) return;

    const movingPiece = board[selected.y][selected.x];
    const captured = board[y][x];

    board[y][x] = movingPiece;
    board[selected.y][selected.x] = null;

    if (isCheck(board, "enemy")) {
      showToast(toast, "🔥 相手に王手！", true);
    }

    if (checkWin(captured)) return;

    selected = null;
    validMoves = [];
    allowedPieceType = null; // ⭐ここも重要

    switchTurn();
    startTimer();
    render();

    if (currentPlayer === "enemy") {
      setTimeout(npcMove, 500);
    }
  }

  function npcMove() {
    const moves = [];

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const cell = board[y][x];
        if (cell && cell.owner === "enemy") {
          getValidMoves(board, cell, x, y).forEach((m) => {
            moves.push({ from: { x, y }, to: m });
          });
        }
      }
    }

    if (moves.length === 0) return;

    const move = moves[Math.floor(Math.random() * moves.length)];

    const movingPiece = board[move.from.y][move.from.x];
    const captured = board[move.to.y][move.to.x];

    board[move.to.y][move.to.x] = movingPiece;
    board[move.from.y][move.from.x] = null;

    if (isCheck(board, "player")) {
      showToast(toast, "⚠️ あなたは王手されています！", true);
    }

    if (checkWin(captured)) return;

    switchTurn();
    startTimer();
    render();
  }

  function render() {
    renderBoard({
      boardElement,
      board,
      selected,
      validMoves,
      currentPlayer,
      statusText,
      timer,
      gameMode: "npc",
      handleCellClick: handleClick
    });
  }

  return {
    start() {
      board = createInitialBoard();
      currentPlayer = "player";
      selected = null;
      validMoves = [];
      allowedPieceType = null;

      startTimer();
      render();

      if (currentPlayer === "enemy") {
        setTimeout(npcMove, 500);
      }
    },

    destroy() {
      clearInterval(timerInterval);
    },

    // ⭐ AIから呼ばれる
    setAllowedPiece(pieceType) {
      allowedPieceType = pieceType;
    }
  };
}