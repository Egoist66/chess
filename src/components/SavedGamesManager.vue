<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ mode === 'save' ? '💾 Сохранить игру' : '📂 Загрузить игру' }}</h2>
        <button class="close-button" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <!-- Режим сохранения -->
        <div v-if="mode === 'save'" class="save-section">
          <div class="input-group">
            <label for="game-name">Название партии:</label>
            <input
              id="game-name"
              v-model="newGameName"
              type="text"
              placeholder="Например: Партия от 21.11.2024"
              class="game-input"
              @keyup.enter="saveNewGame"
            />
          </div>
          <button class="action-button save-button" @click="saveNewGame" :disabled="!newGameName.trim()">
            Сохранить
          </button>
        </div>

        <!-- Режим загрузки -->
        <div v-if="mode === 'load'" class="load-section">
          <div v-if="savedGamesList.length === 0" class="empty-state">
            <p>Нет сохраненных партий</p>
          </div>

          <div v-else class="games-list">
            <div
              v-for="game in sortedGames"
              :key="game.id"
              class="game-item"
              :class="{ 'selected': selectedGameId === game.id }"
            >
              <div class="game-info" @click="selectGame(game.id)">
                <div class="game-name">{{ game.name }}</div>
                <div class="game-details">
                  <span class="game-date">{{ formatDate(game.timestamp) }}</span>
                  <span class="game-moves">Ходов: {{ game.data.moveHistory.length }}</span>
                  <span class="game-turn">Ход: {{ game.data.currentTurn === 'white' ? 'Белые' : 'Черные' }}</span>
                </div>
              </div>
              <button class="delete-button" @click="deleteGame(game.id)" title="Удалить">
                🗑️
              </button>
            </div>
          </div>

          <div v-if="selectedGameId" class="action-buttons">
            <button class="action-button load-button" @click="loadSelectedGame">
              Загрузить выбранную партию
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { SavedGame } from '@/game/Game';

interface SavedGameItem {
  id: string;
  name: string;
  timestamp: number;
  data: SavedGame;
}

interface Props {
  isOpen: boolean;
  mode: 'save' | 'load';
  currentGameState?: SavedGame;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', name: string): void;
  (e: 'load', gameData: SavedGame): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const STORAGE_KEY = 'chess-saved-games-list';

const newGameName = ref('');
const selectedGameId = ref<string | null>(null);
const savedGamesList = ref<SavedGameItem[]>([]);

// Загружаем список игр при открытии
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadGamesList();
    if (props.mode === 'save') {
      newGameName.value = `Партия от ${new Date().toLocaleDateString('ru-RU')}`;
    }
  }
});

const sortedGames = computed(() => {
  return [...savedGamesList.value].sort((a, b) => b.timestamp - a.timestamp);
});

const loadGamesList = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      savedGamesList.value = JSON.parse(stored);
    } else {
      savedGamesList.value = [];
    }
  } catch (error) {
    console.error('Error loading games list:', error);
    savedGamesList.value = [];
  }
};

const saveGamesList = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGamesList.value));
  } catch (error) {
    console.error('Error saving games list:', error);
  }
};

const saveNewGame = () => {
  if (!newGameName.value.trim() || !props.currentGameState) return;

  const newGame: SavedGameItem = {
    id: generateId(),
    name: newGameName.value.trim(),
    timestamp: Date.now(),
    data: props.currentGameState
  };

  savedGamesList.value.push(newGame);
  saveGamesList();

  emit('save', newGame.name);
  closeModal();
};

const selectGame = (id: string) => {
  selectedGameId.value = id;
};

const loadSelectedGame = () => {
  if (!selectedGameId.value) return;

  const game = savedGamesList.value.find(g => g.id === selectedGameId.value);
  if (game) {
    emit('load', game.data);
    closeModal();
  }
};

const deleteGame = (id: string) => {
  if (confirm('Вы уверены, что хотите удалить эту сохраненную партию?')) {
    savedGamesList.value = savedGamesList.value.filter(g => g.id !== id);
    saveGamesList();
    if (selectedGameId.value === id) {
      selectedGameId.value = null;
    }
  }
};

const closeModal = () => {
  newGameName.value = '';
  selectedGameId.value = null;
  emit('close');
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const generateId = (): string => {
  return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #f5f0e8;
  border: 3px solid #5d4a37;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 1.5rem;
  background: #5d4a37;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 13px 13px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.save-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  color: #3d2817;
}

.game-input {
  padding: 0.8rem;
  border: 2px solid #d4c4a8;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #3d2817;
  transition: border-color 0.2s ease;
}

.game-input:focus {
  outline: none;
  border-color: #8b6f47;
}

.load-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #7a6c5d;
  font-style: italic;
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.games-list::-webkit-scrollbar {
  width: 8px;
}

.games-list::-webkit-scrollbar-track {
  background: #e8dcc4;
  border-radius: 4px;
}

.games-list::-webkit-scrollbar-thumb {
  background: #8b6f47;
  border-radius: 4px;
}

.games-list::-webkit-scrollbar-thumb:hover {
  background: #6b5a47;
}

.game-item {
  display: flex;
  background: white;
  border: 2px solid #d4c4a8;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.game-item:hover {
  border-color: #8b6f47;
  transform: translateX(4px);
}

.game-item.selected {
  border-color: #5d4a37;
  background: #fef9f3;
  box-shadow: 0 2px 8px rgba(93, 74, 55, 0.3);
}

.game-info {
  flex: 1;
  padding: 1rem;
}

.game-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3d2817;
  margin-bottom: 0.5rem;
}

.game-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: #7a6c5d;
}

.game-date {
  font-weight: 500;
}

.delete-button {
  background: #c1440e;
  border: none;
  color: white;
  padding: 0 1rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
}

.delete-button:hover {
  background: #a03a0c;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.action-button {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-button:active:not(:disabled) {
  transform: translateY(0);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-button {
  background: #6b8e23;
}

.load-button {
  background: #cd853f;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .game-details {
    flex-direction: column;
    gap: 0.3rem;
  }

  .action-button {
    font-size: 1rem;
    padding: 0.8rem 1.2rem;
  }
}
</style>

