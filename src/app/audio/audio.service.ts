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
    cat: 'assets/sounds/animals/cat.ogg',
    chicken: 'assets/sounds/animals/chicken.ogg',
    cow: 'assets/sounds/animals/cow.ogg',
    dog: 'assets/sounds/animals/dog.ogg',
    elephant: 'assets/sounds/animals/elephant.ogg',
    monkey: 'assets/sounds/animals/monkey.ogg',
    pig: 'assets/sounds/animals/pig.ogg',
    rabbit: 'assets/sounds/animals/rabbit.ogg',
    frog: 'assets/sounds/animals/frog.ogg'
  };

  private readonly effectMap: Record<EffectKey, string> = {
    button: 'assets/sounds/button-press.ogg',
    flip: 'assets/sounds/card-flip.ogg',
    victory: 'assets/sounds/victory.ogg'
  };

  private readonly musicPlaylist = [
    'assets/sounds/background-music/1.ogg',
    'assets/sounds/background-music/2.ogg',
    'assets/sounds/background-music/3.ogg'
  ];

  private readonly musicAudio = new Audio();

  constructor() {
    this.loadSettings();
    this.musicAudio.addEventListener('ended', () => {
      if (this.musicOn) {
        this.playNextTrack();
      }
    });
    this.bindAppVisibilityHandlers();
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

  private bindAppVisibilityHandlers(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.musicAudio.pause();
          return;
        }
        if (this.musicOn && this.musicStarted) {
          this.musicAudio.play().catch(() => undefined);
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('blur', () => {
        this.musicAudio.pause();
      });
      window.addEventListener('focus', () => {
        if (this.musicOn && this.musicStarted && !document?.hidden) {
          this.musicAudio.play().catch(() => undefined);
        }
      });
    }
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
