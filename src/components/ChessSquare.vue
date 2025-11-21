<template>
  <div
    :class="['chess-square', squareColor, { 
      'selected': isSelected,
      'valid-move': isValidMove,
      'last-move': isLastMove,
      'in-check': isInCheck
    }]"
    @click="handleClick"
    @dragover.prevent
    @drop="handleDrop"
  >
    <div
      v-if="piece"
      class="piece"
      :class="{ 'dragging': isDragging }"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
    >
      {{ piece.getSymbol() }}
    </div>
    <div v-if="isValidMove" class="move-indicator"></div>
  </div>
</template>

<script setup lang="ts">
import { Piece } from '@/types';

interface Props {
  piece: Piece | null;
  row: number;
  col: number;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
}

interface Emits {
  (e: 'click', row: number, col: number): void;
  (e: 'dragStart', row: number, col: number): void;
  (e: 'drop', row: number, col: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isDragging = ref(false);

const squareColor = computed(() => {
  return (props.row + props.col) % 2 === 0 ? 'light' : 'dark';
});

const handleClick = () => {
  emit('click', props.row, props.col);
};

const handleDragStart = (e: DragEvent) => {
  if (!props.piece) return;
  isDragging.value = true;
  emit('dragStart', props.row, props.col);
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${props.row},${props.col}`);
  }
};

const handleDragEnd = () => {
  isDragging.value = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  emit('drop', props.row, props.col);
};
</script>

<script lang="ts">
import { ref, computed } from 'vue';
export default { name: 'ChessSquare' };
</script>

<style scoped>
.chess-square {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chess-square.light {
  background-color: #f0d9b5;
}

.chess-square.dark {
  background-color: #b58863;
}

.chess-square.selected {
  background-color: #7fa650 !important;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
}

.chess-square.valid-move {
  background-color: #9cb770 !important;
}

.chess-square.valid-move:hover {
  background-color: #8ca660 !important;
}

.chess-square.last-move {
  background-color: #cdd26a !important;
}

.chess-square.in-check {
  background-color: #ff6b6b !important;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.piece {
  font-size: 4rem;
  user-select: none;
  cursor: grab;
  transition: transform 0.2s ease, filter 0.2s ease;
  filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.3));
  text-shadow: 
    1px 1px 1px rgba(255, 255, 255, 0.2),
    -1px -1px 1px rgba(0, 0, 0, 0.15);
}

.piece:hover {
  transform: scale(1.1) translateY(-1px);
  filter: drop-shadow(3px 3px 4px rgba(0, 0, 0, 0.4));
}

.piece:active {
  cursor: grabbing;
  transform: scale(1.05);
}

.piece.dragging {
  opacity: 0.5;
  filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.5));
}

.move-indicator {
  position: absolute;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.chess-square.valid-move .piece ~ .move-indicator {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: transparent;
  border: 4px solid rgba(0, 0, 0, 0.2);
}
</style>

