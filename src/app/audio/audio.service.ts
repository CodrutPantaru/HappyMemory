import { Injectable } from '@angular/core';

type CardSoundKey = 'cat' | 'chicken' | 'cow' | 'dog' | 'elephant' | 'monkey' | 'pig' | 'rabbit' | 'frog' ;

type EffectKey = 'button' | 'flip' | 'victory';

interface StoredSettings {
  soundOn: boolean;
  musicOn: boolean;
}

const SETTINGS_KEY = 'memory-game-settings-v1';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private soundOn = true;
  private musicOn = true;
  private musicStarted = false;
  private musicIndex = 0;

  private readonly soundMap: Record<CardSoundKey, string> = {
    cat: 'assets/sounds/animals/cat.mp3',
    chicken: 'assets/sounds/animals/chicken.mp3',
    cow: 'assets/sounds/animals/cow.mp3',
    dog: 'assets/sounds/animals/dog.mp3',
    elephant: 'assets/sounds/animals/elephant.mp3',
    monkey: 'assets/sounds/animals/monkey.mp3',
    pig: 'assets/sounds/animals/pig.mp3',
    rabbit: 'assets/sounds/animals/rabbit.mp3',
    frog: 'assets/sounds/animals/frog.mp3'
  };

  private readonly effectMap: Record<EffectKey, string> = {
    button: 'assets/sounds/button-press.mp3',
    flip: 'assets/sounds/card-flip.mp3',
    victory: 'assets/sounds/victory.mp3'
  };

  private readonly musicPlaylist = [
    'assets/sounds/background-music/1.mp3',
    'assets/sounds/background-music/2.mp3',
    'assets/sounds/background-music/3.mp3'
  ];

  private readonly musicAudio = new Audio();

  constructor() {
    this.loadSettings();
    this.musicAudio.addEventListener('ended', () => {
      if (this.musicOn) {
        this.playNextTrack();
      }
    });
  }

  updateSettings(soundOn: boolean, musicOn: boolean): void {
    this.soundOn = soundOn;
    this.musicOn = musicOn;

    if (!this.musicOn) {
      this.musicAudio.pause();
      return;
    }

    if (this.musicStarted) {
      this.musicAudio.play().catch(() => undefined);
    }
  }

  startMusicIfEnabled(): void {
    if (!this.musicOn || this.musicStarted) {
      return;
    }

    this.musicStarted = true;
    this.musicAudio.src = this.musicPlaylist[this.musicIndex];
    this.musicAudio.loop = false;
    this.musicAudio.volume = 0.5;
    this.musicAudio.play().catch(() => {
      this.musicStarted = false;
    });
  }

  playMatchSound(value: string): void {
    if (!this.soundOn) {
      return;
    }

    const key = value as CardSoundKey;
    const src = this.soundMap[key];
    if (!src) {
      return;
    }

    this.playEffect(src, 0.9);
  }

  playButton(): void {
    if (!this.soundOn) {
      return;
    }
    this.playEffect(this.effectMap.button, 0.6);
  }

  playFlip(): void {
    if (!this.soundOn) {
      return;
    }
    this.playEffect(this.effectMap.flip, 0.7);
  }

  playVictory(): void {
    if (!this.soundOn) {
      return;
    }
    this.playEffect(this.effectMap.victory, 0.85);
  }

  private playNextTrack(): void {
    this.musicIndex = (this.musicIndex + 1) % this.musicPlaylist.length;
    this.musicAudio.src = this.musicPlaylist[this.musicIndex];
    this.musicAudio.play().catch(() => undefined);
  }

  private playEffect(src: string, volume: number): void {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => undefined);
  }

  private loadSettings(): void {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as StoredSettings;
      if (typeof parsed.soundOn === 'boolean') {
        this.soundOn = parsed.soundOn;
      }
      if (typeof parsed.musicOn === 'boolean') {
        this.musicOn = parsed.musicOn;
      }
    } catch {
      // ignore
    }
  }
}
