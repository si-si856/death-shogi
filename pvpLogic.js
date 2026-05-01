function createPVPGame() {
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
        return;
      }

      updateStatus();
    }, 1000);
  }

  function updateStatus() {
    let text =
      currentPlayer === "player"
        ? `🔵 プレイヤー1（${timer}秒）`
        : `🔴 プレイヤー2（${timer}秒）`;

    if (isCheck(board, currentPlayer)) {
      text = "🚨 王手！\n" + text;
    }

    statusText.innerText = text;
  }

  function handleClick(x, y) {
    const cell = board[y][x];

    // ===== 駒選択 =====
    if (cell && cell.owner === currentPlayer) {

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

    if (checkWin(captured)) return;

    selected = null;
    validMoves = [];
    allowedPieceType = null; // ⭐ここ重要

    switchTurn();
    startTimer();
    render();

    if (isCheck(board, currentPlayer)) {
      showToast(toast, "🚨 王手です！", true);
    }
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
      gameMode: "pvp",
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
    },

    destroy() {
      clearInterval(timerInterval);
    },

    // ⭐ AIから呼ぶ
    setAllowedPiece(pieceType) {
      allowedPieceType = pieceType;
    }
  };
}