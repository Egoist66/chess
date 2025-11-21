<template>
  <div class="settings-panel" :class="{ 'collapsed': isCollapsed }">
    <button class="toggle-button" @click="togglePanel">
      <span class="icon">{{ isCollapsed ? '⚙️' : '✕' }}</span>
    </button>
    
    <div v-if="!isCollapsed" class="settings-content">
      <h3>⚙️ Настройки</h3>
      
      <div class="setting-group">
        <label class="setting-label">
          <span class="label-text">Размер доски:</span>
          <div class="slider-container">
            <input 
              type="range" 
              v-model.number="localBoardSize" 
              min="50" 
              max="100" 
              step="5"
              @input="updateBoardSize"
              class="slider"
            />
            <span class="slider-value">{{ localBoardSize }}px</span>
          </div>
        </label>
      </div>

      <div class="setting-group">
        <label class="setting-label">
          <input 
            type="checkbox" 
            v-model="localShowCoordinates"
            @change="updateShowCoordinates"
            class="checkbox"
          />
          <span class="label-text">Показывать координаты</span>
        </label>
      </div>

      <div class="setting-group">
        <label class="setting-label">
          <input 
            type="checkbox" 
            v-model="localShowMoveHints"
            @change="updateShowMoveHints"
            class="checkbox"
          />
          <span class="label-text">Подсветка возможных ходов</span>
        </label>
      </div>

      <div class="setting-group">
        <label class="setting-label">
          <input 
            type="checkbox" 
            v-model="localHighlightLastMove"
            @change="updateHighlightLastMove"
            class="checkbox"
          />
          <span class="label-text">Подсветка последнего хода</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  boardSize: number;
  showCoordinates: boolean;
  showMoveHints: boolean;
  highlightLastMove: boolean;
}

interface Emits {
  (e: 'update:boardSize', value: number): void;
  (e: 'update:showCoordinates', value: boolean): void;
  (e: 'update:showMoveHints', value: boolean): void;
  (e: 'update:highlightLastMove', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isCollapsed = ref(true);
const localBoardSize = ref(props.boardSize);
const localShowCoordinates = ref(props.showCoordinates);
const localShowMoveHints = ref(props.showMoveHints);
const localHighlightLastMove = ref(props.highlightLastMove);

watch(() => props.boardSize, (newVal) => {
  localBoardSize.value = newVal;
});

watch(() => props.showCoordinates, (newVal) => {
  localShowCoordinates.value = newVal;
});

watch(() => props.showMoveHints, (newVal) => {
  localShowMoveHints.value = newVal;
});

watch(() => props.highlightLastMove, (newVal) => {
  localHighlightLastMove.value = newVal;
});

const togglePanel = () => {
  isCollapsed.value = !isCollapsed.value;
};

const updateBoardSize = () => {
  emit('update:boardSize', localBoardSize.value);
};

const updateShowCoordinates = () => {
  emit('update:showCoordinates', localShowCoordinates.value);
};

const updateShowMoveHints = () => {
  emit('update:showMoveHints', localShowMoveHints.value);
};

const updateHighlightLastMove = () => {
  emit('update:highlightLastMove', localHighlightLastMove.value);
};
</script>

<style scoped>
.settings-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #f5f0e8;
  border: 2px solid #d4c4a8;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: all 0.3s ease;
  max-width: 320px;
}

.settings-panel.collapsed {
  width: 60px;
  height: 60px;
}

.toggle-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border: none;
  background: #5d4a37;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(93, 74, 55, 0.3);
  z-index: 10;
}

.toggle-button:hover {
  transform: scale(1.1) rotate(90deg);
  background: #6b5a47;
  box-shadow: 0 6px 16px rgba(93, 74, 55, 0.5);
}

.settings-content {
  padding: 1.5rem;
  padding-top: 3rem;
}

.settings-content h3 {
  margin: 0 0 1.5rem 0;
  color: #3d2817;
  font-size: 1.4rem;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
}

.label-text {
  font-size: 1rem;
  color: #3d2817;
  font-weight: 500;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #8b6f47;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 3px solid #8b6f47;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(139, 111, 71, 0.4);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 3px solid #8b6f47;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(139, 111, 71, 0.4);
}

.slider-value {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
  color: #5d4a37;
}

.checkbox {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
  cursor: pointer;
  accent-color: #8b6f47;
}

.setting-label:has(.checkbox) {
  flex-direction: row;
  align-items: center;
}

.setting-label:has(.checkbox) .label-text {
  order: 2;
}

.setting-label:has(.checkbox) .checkbox {
  order: 1;
}

@media (max-width: 768px) {
  .settings-panel {
    top: 10px;
    right: 10px;
  }

  .settings-content {
    padding: 1rem;
    padding-top: 2.5rem;
  }
}
</style>

