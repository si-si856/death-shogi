function createNPCGame() {
  const boardElement = document.getElementById("board");
  const statusText = document.getElementById("status");
  const toast = document.getElementById("toast");

  let board = [];
  let currentPlayer = "player";
  let selected = null;
  let validMoves = [];

  let allowedPieceType = null;

  function switchTurn() {
    currentPlayer = currentPlayer === "player" ? "enemy" : "player";
  }

  function updateStatus() {
    let text =
      currentPlayer === "player"
        ? `🟢 あなたのターン`
        : `🤖 相手のターン`;

    if (isCheck(board, currentPlayer)) {
      text = "🚨 王手！\n" + text;
    }

    statusText.innerText = text;
  }

  function handleClick(x, y) {
    console.log("⑥ クリック時 allowed:", allowedPieceType);

    if (currentPlayer !== "player") return;

    if (!allowedPieceType) {
      showToast(toast, "先に撮影してください", true);
      return;
    }

    const cell = board[y][x];

    if (cell && cell.owner === "player") {
      if (cell.type !== allowedPieceType) {
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

    // ⭐ 成り（歩・銀のみ）
    if (
      movingPiece &&
      !movingPiece.promoted &&
      (movingPiece.type === "歩" || movingPiece.type === "銀") &&
      ((movingPiece.owner === "player" && y === 0) ||
        (movingPiece.owner === "enemy" && y === 4))
    ) {
      movingPiece.promoted = true;
    }

    if (isCheck(board, "enemy")) {
      showToast(toast, "🔥 相手に王手！", true);
    }

    if (checkWin(captured)) return;

    selected = null;
    validMoves = [];
    allowedPieceType = null;

    switchTurn();
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

    // ⭐ 成り（歩・銀のみ）
    if (
      movingPiece &&
      !movingPiece.promoted &&
      (movingPiece.type === "歩" || movingPiece.type === "銀") &&
      ((movingPiece.owner === "player" && move.to.y === 0) ||
        (movingPiece.owner === "enemy" && move.to.y === 4))
    ) {
      movingPiece.promoted = true;
    }

    if (isCheck(board, "player")) {
      showToast(toast, "⚠️ あなたは王手されています！", true);
    }

    if (checkWin(captured)) return;

    switchTurn();
    render();
  }

  function render() {
    console.log("⑤ render中 allowed:", allowedPieceType);

    renderBoard({
      boardElement,
      board,
      selected,
      validMoves,
      currentPlayer,
      statusText,
      gameMode: "npc",
      handleCellClick: handleClick,
      allowedPieceType
    });

    updateStatus();
  }

  return {
    start() {
      board = createInitialBoard();
      currentPlayer = "player";
      selected = null;
      validMoves = [];
      allowedPieceType = null;

      render();

      if (currentPlayer === "enemy") {
        setTimeout(npcMove, 500);
      }
    },

    destroy() {},

    getCurrentPlayer() {
      return currentPlayer;
    },

    // ⭐ デバッグログ追加
    setAllowedPiece(pieceType) {
      console.log("④ setAllowedPiece呼ばれた:", pieceType);
      allowedPieceType = pieceType;
    },

    render() {
      render();
    }
  };
}
