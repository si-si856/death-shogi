const SIZE = 5;

// ===== 初期盤面 =====
function createInitialBoard() {
  return [
    [
      { type: "飛", owner: "enemy" },
      { type: "角", owner: "enemy" },
      { type: "銀", owner: "enemy" },
      { type: "金", owner: "enemy" },
      { type: "玉", owner: "enemy" }
    ],
    [null, null, null, null, { type: "歩", owner: "enemy" }],
    [null, null, null, null, null],
    [{ type: "歩", owner: "player" }, null, null, null, null],
    [
      { type: "王", owner: "player" },
      { type: "金", owner: "player" },
      { type: "銀", owner: "player" },
      { type: "角", owner: "player" },
      { type: "飛", owner: "player" }
    ]
  ];
}

// ===== 🔥 AI用：駒検索（追加）=====
function findPieceByType(board, type, owner) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = board[y][x];
      if (cell && cell.type === type && cell.owner === owner) {
        return { x, y };
      }
    }
  }
  return null;
}

// ===== トースト =====
function showToast(toast, message, isDanger = false) {
  if (!toast) return;

  toast.innerText = message;
  toast.classList.add("show");
  toast.style.background = isDanger ? "#d9534f" : "#2f8f9d";

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

// ===== 王検出 =====
function findKing(board, owner) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = board[y][x];
      if (
        cell &&
        cell.owner === owner &&
        (cell.type === "王" || cell.type === "玉")
      ) {
        return { x, y };
      }
    }
  }
  return null;
}

// ===== 王手判定 =====
function isCheck(board, targetOwner) {
  const kingPos = findKing(board, targetOwner);
  if (!kingPos) return false;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = board[y][x];
      if (cell && cell.owner !== targetOwner) {
        const moves = getValidMoves(board, cell, x, y);
        if (moves.some((m) => m.x === kingPos.x && m.y === kingPos.y)) {
          return true;
        }
      }
    }
  }

  return false;
}

// ===== 駒の動き =====
function getValidMoves(board, pieceObj, x, y) {
  const piece = pieceObj.type;
  const moves = [];
  const direction = pieceObj.owner === "player" ? -1 : 1;

  const inBounds = (nx, ny) =>
    nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE;

  const addMove = (nx, ny) => {
    if (!inBounds(nx, ny)) return;
    const target = board[ny][nx];
    if (target && target.owner === pieceObj.owner) return;
    moves.push({ x: nx, y: ny });
  };

  if (piece === "歩") addMove(x, y + direction);

  if (piece === "王" || piece === "玉") {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx || dy) addMove(x + dx, y + dy);
      }
    }
  }

  if (piece === "金") {
    [[0, direction],[1,0],[-1,0],[0,-direction],[1, direction],[-1, direction]]
      .forEach(([dx,dy]) => addMove(x+dx, y+dy));
  }

  if (piece === "銀") {
    [[0, direction],[1, direction],[-1, direction],[1,-direction],[-1,-direction]]
      .forEach(([dx,dy]) => addMove(x+dx, y+dy));
  }

  if (piece === "桂") {
    addMove(x+1, y+direction*2);
    addMove(x-1, y+direction*2);
  }

  if (piece === "飛") {
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
      let nx = x + dx;
      let ny = y + dy;
      while (inBounds(nx, ny)) {
        const target = board[ny][nx];
        if (target && target.owner === pieceObj.owner) break;
        moves.push({ x: nx, y: ny });
        if (target) break;
        nx += dx;
        ny += dy;
      }
    });
  }

  if (piece === "角") {
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dx,dy]) => {
      let nx = x + dx;
      let ny = y + dy;
      while (inBounds(nx, ny)) {
        const target = board[ny][nx];
        if (target && target.owner === pieceObj.owner) break;
        moves.push({ x: nx, y: ny });
        if (target) break;
        nx += dx;
        ny += dy;
      }
    });
  }

  return moves;
}

// ===== 描画 =====
function renderBoard(state) {
  const {
    boardElement,
    board,
    selected,
    validMoves,
    currentPlayer,
    statusText,
    timer,
    gameMode
  } = state;

  boardElement.innerHTML = "";

  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      const div = document.createElement("div");
      div.className = "cell";

      if (cell) {
        div.innerText = cell.type;
        if (cell.owner === "enemy") {
          div.classList.add("enemy");
          div.style.transform = "rotate(180deg)";
        }
      }

      if (selected && selected.x === x && selected.y === y) {
        div.style.outline = "3px solid blue";
      } else if (validMoves.some(m => m.x === x && m.y === y)) {
        div.style.outline = "3px solid red";
      } else {
        div.style.outline = "none";
      }

      div.onclick = () => state.handleCellClick(x, y);
      boardElement.appendChild(div);
    });
  });

  const topLabel = document.getElementById("topPlayerLabel");
  const bottomLabel = document.getElementById("bottomPlayerLabel");
  const topName = document.getElementById("topName");
  const bottomName = document.getElementById("bottomName");

  if (topName && bottomName) {
    if (gameMode === "pvp") {
      topName.innerText = "プレイヤー2";
      bottomName.innerText = "プレイヤー1";
    } else {
      topName.innerText = "相手";
      bottomName.innerText = "あなた";
    }
  }

  if (topLabel && bottomLabel) {
    if (currentPlayer === "enemy") {
      topLabel.style.border = "3px solid red";
      bottomLabel.style.border = "none";
    } else {
      bottomLabel.style.border = "3px solid blue";
      topLabel.style.border = "none";
    }
  }

  let text = "";

  if (gameMode === "pvp") {
    text =
      currentPlayer === "player"
        ? `プレイヤー1のターン（${timer}秒）`
        : `プレイヤー2のターン（${timer}秒）`;
  } else {
    text =
      currentPlayer === "player"
        ? `あなたのターン（${timer}秒）`
        : `相手のターン（${timer}秒）`;
  }

  if (isCheck(board, currentPlayer)) {
    text = "🚨 王手！\n" + text;
  }

  statusText.innerText = text;
}

// ===== 勝敗 =====
function checkWin(captured) {
  if (!captured) return false;

  if (captured.type === "王") {
    alert("💀 PLAYER側の王が取られました");
    return true;
  }

  if (captured.type === "玉") {
    alert("🎉 ENEMY側の玉が取られました");
    return true;
  }

  return false;
}