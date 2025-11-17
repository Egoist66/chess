export class SoundManager {
  private sounds: Map<string, HTMLAudioElement>;
  private enabled: boolean;

  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.loadSounds();
  }

  private loadSounds(): void {
    // Создаем звуки с помощью Web Audio API
    this.createBeepSound('move', 440, 0.1); // Обычный ход
    this.createBeepSound('capture', 330, 0.15); // Взятие фигуры
    this.createBeepSound('check', 880, 0.2); // Шах
    this.createBeepSound('castle', 550, 0.12); // Рокировка
  }

  private createBeepSound(name: string, frequency: number, duration: number): void {
    // Создаем простой звуковой сигнал
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    // Создаем аудио элемент для воспроизведения
    const audio = new Audio();
    
    // Сохраняем параметры для последующего воспроизведения
    (audio as any)._frequency = frequency;
    (audio as any)._duration = duration;
    
    this.sounds.set(name, audio);
  }

  playSound(soundName: string): void {
    if (!this.enabled) return;

    try {
      const audio = this.sounds.get(soundName);
      if (audio) {
        // Создаем новый AudioContext для каждого воспроизведения
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const frequency = (audio as any)._frequency || 440;
        const duration = (audio as any)._duration || 0.1;

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  playMove(): void {
    this.playSound('move');
  }

  playCapture(): void {
    this.playSound('capture');
  }

  playCheck(): void {
    this.playSound('check');
  }

  playCastle(): void {
    this.playSound('castle');
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();

