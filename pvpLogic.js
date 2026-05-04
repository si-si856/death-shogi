function createPVPGame() {
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

  function passTurn() {
    selected = null;
    validMoves = [];
    allowedPieceType = null;
    switchTurn();
    render();

    if (isCheck(board, currentPlayer)) {
      showToast(toast, "🚨 王手です！", true);
    }
  }

  function hasPiece(pieceType) {
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const cell = board[y][x];
        if (cell && cell.owner === currentPlayer && cell.type === pieceType) {
          return true;
        }
      }
    }
    return false;
  }

  function updateStatus() {
    let text =
      currentPlayer === "player"
        ? `🔵 プレイヤー1のターン`
        : `🔴 プレイヤー2のターン`;

    if (isCheck(board, currentPlayer)) {
      text = "🚨 王手！\n" + text;
    }

    statusText.innerText = text;
  }

  function handleClick(x, y) {
    const cell = board[y][x];

    if (!allowedPieceType) {
      showToast(toast, "先に撮影してください", true);
      return;
    }

    if (cell && cell.owner === currentPlayer) {
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

    // 成り（歩・銀のみ）
    if (
      movingPiece &&
      !movingPiece.promoted &&
      (movingPiece.type === "歩" || movingPiece.type === "銀") &&
      ((movingPiece.owner === "player" && y === 0) ||
        (movingPiece.owner === "enemy" && y === 4))
    ) {
      movingPiece.promoted = true;
    }

    if (checkWin(captured)) return;

    selected = null;
    validMoves = [];
    allowedPieceType = null;

    switchTurn();
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
      gameMode: "pvp",
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
    },

    destroy() {},

    getCurrentPlayer() {
      return currentPlayer;
    },

    setAllowedPiece(pieceType) {
      allowedPieceType = pieceType;
    },

    hasPiece(pieceType) {
      return hasPiece(pieceType);
    },

    passTurn() {
      passTurn();
    },

    render() {
      render();
    }
  };
}
