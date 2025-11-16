<template>
  <div class="chess-container">
    <GameSettings
      :board-size="boardSize"
      :show-coordinates="showCoordinates"
      :show-move-hints="showMoveHints"
      :highlight-last-move="highlightLastMove"
      @update:board-size="boardSize = $event"
      @update:show-coordinates="showCoordinates = $event"
      @update:show-move-hints="showMoveHints = $event"
      @update:highlight-last-move="highlightLastMove = $event"
    />

    <div class="game-info">
      <div class="turn-indicator">
        <h2>{{ currentTurnText }}</h2>
        <div class="status" :class="statusClass">{{ statusText }}</div>
      </div>
      <button class="reset-button" @click="resetGame">Новая игра</button>
    </div>

    <div class="game-layout">
      <div class="captured-pieces captured-black">
        <h3>Взятые белые:</h3>
        <div class="pieces-list">
          <span v-for="(piece, index) in capturedPieces.white" :key="index" class="captured-piece">
            {{ piece.getSymbol() }}
          </span>
        </div>
      </div>

      <div class="board-wrapper">
        <div v-if="showCoordinates" class="coordinates coordinates-left">
          <div v-for="i in 8" :key="i" class="coordinate">{{ 9 - i }}</div>
        </div>
        
        <div class="board-container">
          <div class="chess-board" :style="{ '--square-size': boardSize + 'px' }">
            <div v-for="row in 8" :key="row" class="board-row">
              <ChessSquare
                v-for="col in 8"
                :key="`${row - 1}-${col - 1}`"
                :piece="board[row - 1][col - 1]"
                :row="row - 1"
                :col="col - 1"
                :is-selected="isSquareSelected(row - 1, col - 1)"
                :is-valid-move="showMoveHints && isSquareValidMove(row - 1, col - 1)"
                :is-last-move="highlightLastMove && isSquareLastMove(row - 1, col - 1)"
                :is-in-check="isSquareInCheck(row - 1, col - 1)"
                @click="handleSquareClick"
                @drag-start="handleDragStart"
                @drop="handleDrop"
              />
            </div>
          </div>
          
          <div v-if="showCoordinates" class="coordinates coordinates-bottom">
            <div v-for="i in 8" :key="i" class="coordinate">{{ String.fromCharCode(96 + i) }}</div>
          </div>
        </div>

        <div v-if="showCoordinates" class="coordinates coordinates-right">
          <div v-for="i in 8" :key="i" class="coordinate">{{ 9 - i }}</div>
        </div>
      </div>

      <div class="captured-pieces captured-white">
        <h3>Взятые черные:</h3>
        <div class="pieces-list">
          <span v-for="(piece, index) in capturedPieces.black" :key="index" class="captured-piece">
            {{ piece.getSymbol() }}
          </span>
        </div>
      </div>
    </div>

    <MoveHistory :moves="moveHistory" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ChessSquare from './ChessSquare.vue';
import GameSettings from './GameSettings.vue';
import MoveHistory from './MoveHistory.vue';
import { Game } from '@/game/Game';
import { Piece, Position } from '@/types';

const game = ref<Game>(new Game());
const board = ref<(Piece | null)[][]>(game.value.getBoard());
const selectedSquare = ref<Position | null>(null);
const validMoves = ref<Position[]>([]);
const lastMove = ref<{ from: Position; to: Position } | null>(null);

// Settings
const boardSize = ref(80);
const showCoordinates = ref(true);
const showMoveHints = ref(true);
const highlightLastMove = ref(true);

const moveHistory = computed(() => game.value.getMoveHistory());

const currentTurnText = computed(() => {
  return game.value.getCurrentTurn() === 'white' ? 'Ход белых' : 'Ход черных';
});

const statusText = computed(() => {
  const status = game.value.getStatus();
  switch (status) {
    case 'check':
      return 'Шах!';
    case 'checkmate':
      return `Мат! ${game.value.getCurrentTurn() === 'white' ? 'Черные' : 'Белые'} победили!`;
    case 'stalemate':
      return 'Пат!';
    default:
      return '';
  }
});

const statusClass = computed(() => {
  const status = game.value.getStatus();
  return {
    'status-check': status === 'check',
    'status-checkmate': status === 'checkmate',
    'status-stalemate': status === 'stalemate'
  };
});

const capturedPieces = computed(() => game.value.getCapturedPieces());

const isSquareSelected = (row: number, col: number): boolean => {
  return selectedSquare.value !== null &&
    selectedSquare.value.row === row &&
    selectedSquare.value.col === col;
};

const isSquareValidMove = (row: number, col: number): boolean => {
  return validMoves.value.some(move => move.row === row && move.col === col);
};

const isSquareLastMove = (row: number, col: number): boolean => {
  if (!lastMove.value) return false;
  return (lastMove.value.from.row === row && lastMove.value.from.col === col) ||
    (lastMove.value.to.row === row && lastMove.value.to.col === col);
};

const isSquareInCheck = (row: number, col: number): boolean => {
  const piece = board.value[row][col];
  if (!piece || piece.type !== 'king') return false;
  
  // Простая проверка - король под шахом
  return game.value.getStatus() === 'check' && piece.color === game.value.getCurrentTurn();
};

const handleSquareClick = (row: number, col: number): void => {
  const clickedPiece = board.value[row][col];

  if (selectedSquare.value) {
    // Попытка сделать ход
    const moveSuccess = game.value.makeMove(selectedSquare.value, { row, col });
    
    if (moveSuccess) {
      lastMove.value = {
        from: { ...selectedSquare.value },
        to: { row, col }
      };
      selectedSquare.value = null;
      validMoves.value = [];
      board.value = game.value.getBoard();
    } else if (clickedPiece && clickedPiece.color === game.value.getCurrentTurn()) {
      // Выбор другой фигуры
      selectedSquare.value = { row, col };
      validMoves.value = game.value.getValidMovesForPiece({ row, col });
    } else {
      // Сброс выбора
      selectedSquare.value = null;
      validMoves.value = [];
    }
  } else if (clickedPiece && clickedPiece.color === game.value.getCurrentTurn()) {
    // Выбор фигуры
    selectedSquare.value = { row, col };
    validMoves.value = game.value.getValidMovesForPiece({ row, col });
  }
};

const handleDragStart = (row: number, col: number): void => {
  const piece = board.value[row][col];
  if (piece && piece.color === game.value.getCurrentTurn()) {
    selectedSquare.value = { row, col };
    validMoves.value = game.value.getValidMovesForPiece({ row, col });
  }
};

const handleDrop = (row: number, col: number): void => {
  if (!selectedSquare.value) return;

  const moveSuccess = game.value.makeMove(selectedSquare.value, { row, col });
  
  if (moveSuccess) {
    lastMove.value = {
      from: { ...selectedSquare.value },
      to: { row, col }
    };
  }

  selectedSquare.value = null;
  validMoves.value = [];
  board.value = game.value.getBoard();
};

const resetGame = (): void => {
  game.value.reset();
  board.value = game.value.getBoard();
  selectedSquare.value = null;
  validMoves.value = [];
  lastMove.value = null;
};

onMounted(() => {
  board.value = game.value.getBoard();
});
</script>

<style scoped>
.chess-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  min-height: 100vh;
  position: relative;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  gap: 2rem;
}

.turn-indicator {
  flex: 1;
}

.turn-indicator h2 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
}

.status {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.status-check {
  color: #ff6b6b;
  animation: pulse 1s infinite;
}

.status-checkmate {
  color: #ee5a6f;
  font-size: 1.8rem;
}

.status-stalemate {
  color: #95a5a6;
}

.reset-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.reset-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.reset-button:active {
  transform: translateY(0);
}

.game-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.captured-pieces {
  width: 150px;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.captured-pieces h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #2c3e50;
}

.pieces-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.captured-piece {
  font-size: 2rem;
  filter: grayscale(50%);
  opacity: 0.7;
}

.board-wrapper {
  display: flex;
  gap: 0.5rem;
}

.board-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chess-board {
  display: flex;
  flex-direction: column;
  border: 4px solid #2c3e50;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  background: white;
}

.board-row {
  display: flex;
}

.chess-board {
  --square-size: 80px;
}

.board-row > * {
  width: var(--square-size);
  height: var(--square-size);
}

.coordinates {
  display: flex;
  color: #2c3e50;
  font-weight: bold;
  font-size: 1rem;
}

.coordinates-left,
.coordinates-right {
  flex-direction: column;
  justify-content: space-around;
  padding: 4px 0;
}

.coordinates-bottom {
  justify-content: space-around;
  padding: 0 4px;
}

.coordinate {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--square-size, 80px);
  height: 20px;
}

.coordinates-left .coordinate,
.coordinates-right .coordinate {
  width: 20px;
  height: var(--square-size, 80px);
}

@media (max-width: 1200px) {
  .game-layout {
    flex-direction: column;
    align-items: center;
  }

  .captured-pieces {
    width: 100%;
    max-width: 640px;
  }

  .pieces-list {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .chess-board {
    --square-size: 60px;
  }

  .game-info {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

