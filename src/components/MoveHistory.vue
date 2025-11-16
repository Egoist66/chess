<template>
  <div class="move-history-panel" :class="{ 'collapsed': isCollapsed }">
    <div class="panel-header" @click="togglePanel">
      <h3>📜 История ходов</h3>
      <button class="collapse-button">{{ isCollapsed ? '▼' : '▲' }}</button>
    </div>
    
    <div v-if="!isCollapsed" class="moves-content">
      <div v-if="moves.length === 0" class="empty-state">
        <p>Ходов пока нет</p>
      </div>
      
      <div v-else class="moves-list">
        <div 
          v-for="(movePair, index) in movePairs" 
          :key="index" 
          class="move-pair"
        >
          <span class="move-number">{{ index + 1 }}.</span>
          <div class="move-item white-move">
            <span class="move-notation">{{ movePair.white }}</span>
          </div>
          <div v-if="movePair.black" class="move-item black-move">
            <span class="move-notation">{{ movePair.black }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Move } from '@/types';

interface Props {
  moves: Move[];
}

const props = defineProps<Props>();
const isCollapsed = ref(false);

const togglePanel = () => {
  isCollapsed.value = !isCollapsed.value;
};

const movePairs = computed(() => {
  const pairs: { white: string; black?: string }[] = [];
  
  for (let i = 0; i < props.moves.length; i += 2) {
    const whiteMove = props.moves[i];
    const blackMove = props.moves[i + 1];
    
    pairs.push({
      white: formatMove(whiteMove),
      black: blackMove ? formatMove(blackMove) : undefined
    });
  }
  
  return pairs;
});

const formatMove = (move: Move): string => {
  const fromCol = String.fromCharCode(97 + move.from.col);
  const fromRow = 8 - move.from.row;
  const toCol = String.fromCharCode(97 + move.to.col);
  const toRow = 8 - move.to.row;
  
  const capture = move.capturedPiece ? 'x' : '-';
  
  return `${fromCol}${fromRow}${capture}${toCol}${toRow}`;
};
</script>

<style scoped>
.move-history-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 320px;
}

.panel-header {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.panel-header:hover {
  background: linear-gradient(135deg, #7688eb 0%, #8555b3 100%);
}

.panel-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.collapse-button {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  transition: transform 0.3s ease;
}

.moves-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.moves-content::-webkit-scrollbar {
  width: 8px;
}

.moves-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.moves-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.moves-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5566d9 0%, #653991 100%);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #95a5a6;
  font-style: italic;
}

.moves-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.move-pair {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.move-pair:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.move-number {
  font-weight: bold;
  color: #667eea;
  min-width: 30px;
  font-size: 0.95rem;
}

.move-item {
  flex: 1;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s ease;
}

.white-move {
  background: white;
  color: #2c3e50;
  border: 2px solid #dee2e6;
}

.black-move {
  background: #2c3e50;
  color: white;
  border: 2px solid #2c3e50;
}

.move-notation {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .move-history-panel {
    max-width: 100%;
  }

  .moves-content {
    max-height: 250px;
  }

  .move-pair {
    font-size: 0.85rem;
  }

  .move-number {
    min-width: 25px;
  }
}
</style>

