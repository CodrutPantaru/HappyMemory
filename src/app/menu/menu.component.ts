import { Component, OnInit } from '@angular/core';

import { RouterModule, Router } from '@angular/router';
import { CategoryId, MatchSize, GridOption, buildGridOptions, defaultGridIdForSize } from '../game/models';
import { I18nService, LanguageCode } from '../i18n/i18n.service';
import { AudioService } from '../audio/audio.service';

interface StoredSettings {
  category: CategoryId;
  matchSize: MatchSize;
  gridId: string;
  soundOn: boolean;
  musicOn: boolean;
}

const SETTINGS_KEY = 'memory-game-settings-v1';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  readonly categories: Array<{ id: CategoryId; labelKey: string; emoji: string }> = [
    { id: 'animals', labelKey: 'category.animals', emoji: '🐾' },
    { id: 'letters', labelKey: 'category.letters', emoji: '🔤' },
    { id: 'numbers', labelKey: 'category.numbers', emoji: '🔢' }
  ];

  readonly matchSizes: MatchSize[] = [2, 3, 4];

  readonly languages: Array<{ id: LanguageCode; label: string }> = [
    { id: 'ro', label: 'Romana' },
    { id: 'en', label: 'English' },
    { id: 'fr', label: 'Francais' },
    { id: 'es', label: 'Espanol' },
    { id: 'de', label: 'Deutsch' }
  ];

  selectedCategory: CategoryId = 'animals';
  selectedMatchSize: MatchSize = 2;
  selectedGridId = defaultGridIdForSize(2);
  gridOptions: GridOption[] = buildGridOptions(2);
  soundOn = true;
  musicOn = true;
  isSettingsOpen = false;
  openLanguage = false;
  isLanguageClosing = false;

  constructor(
    public readonly i18n: I18nService,
    private readonly audio: AudioService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const stored = this.readSettings();
    if (stored) {
      this.selectedCategory = stored.category;
      this.selectedMatchSize = stored.matchSize;
      this.selectedGridId = stored.gridId;
      this.soundOn = stored.soundOn;
      this.musicOn = stored.musicOn;
      this.audio.updateSettings(this.soundOn, this.musicOn);
    }

    this.gridOptions = buildGridOptions(this.selectedMatchSize);
    if (!this.gridOptions.some((option) => option.id === this.selectedGridId)) {
      this.selectedGridId = defaultGridIdForSize(this.selectedMatchSize);
      if (!this.gridOptions.some((option) => option.id === this.selectedGridId)) {
        this.selectedGridId = this.gridOptions[0]?.id ?? this.selectedGridId;
      }
    }

  }

  get lastSettingsLabel(): string {
    const category = this.categories.find((item) => item.id === this.selectedCategory);
    const categoryLabel = category ? this.i18n.t(category.labelKey) : '';
    const matchLabel = this.matchSizeLabel(this.selectedMatchSize);
    const gridLabel = this.currentGrid.label;
    return `${categoryLabel} • ${matchLabel} • ${gridLabel}`.trim();
  }

  get currentGrid(): GridOption {
    return this.gridOptions.find((option) => option.id === this.selectedGridId) ?? this.gridOptions[0];
  }

  setLanguage(code: LanguageCode): void {
    this.i18n.setLanguage(code);
  }

  openLanguageModal(): void {
    this.audio.playButton();
    this.isLanguageClosing = false;
    this.openLanguage = true;
  }

  closeLanguageModal(): void {
    if (!this.openLanguage || this.isLanguageClosing) {
      return;
    }
    this.audio.playButton();
    this.isLanguageClosing = true;
    setTimeout(() => {
      this.openLanguage = false;
      this.isLanguageClosing = false;
    }, 160);
  }

  startGame(): void {
    this.audio.playButton();
    this.audio.startMusicIfEnabled();
    this.router.navigate(['/game'], {
      queryParams: {
        category: this.selectedCategory,
        size: this.selectedMatchSize,
        rows: this.currentGrid.rows,
        cols: this.currentGrid.cols,
        sound: this.soundOn,
        music: this.musicOn
      }
    });
  }

  openSettings(): void {
    this.audio.playButton();
    this.isSettingsOpen = true;
  }

  closeSettings(): void {
    this.audio.playButton();
    this.isSettingsOpen = false;
  }

  setCategory(category: CategoryId): void {
    this.audio.playButton();
    this.selectedCategory = category;
  }

  setMatchSize(size: MatchSize): void {
    this.audio.playButton();
    this.selectedMatchSize = size;
    this.gridOptions = buildGridOptions(size);
    if (!this.gridOptions.some((option) => option.id === this.selectedGridId)) {
      this.selectedGridId = defaultGridIdForSize(size);
      if (!this.gridOptions.some((option) => option.id === this.selectedGridId)) {
        this.selectedGridId = this.gridOptions[0]?.id ?? this.selectedGridId;
      }
    }
  }

  setGrid(id: string): void {
    this.audio.playButton();
    this.selectedGridId = id;
  }

  toggleSound(): void {
    this.soundOn = !this.soundOn;
    this.persistSettings();
    this.audio.updateSettings(this.soundOn, this.musicOn);
    this.audio.playButton();
  }

  toggleMusic(): void {
    this.musicOn = !this.musicOn;
    this.persistSettings();
    this.audio.updateSettings(this.soundOn, this.musicOn);
    this.audio.playButton();
    if (this.musicOn) {
      this.audio.startMusicIfEnabled();
    }
  }

  saveSettings(): void {
    this.persistSettings();
    this.closeSettings();
    this.audio.updateSettings(this.soundOn, this.musicOn);
  }

  private persistSettings(): void {
    const settings: StoredSettings = {
      category: this.selectedCategory,
      matchSize: this.selectedMatchSize,
      gridId: this.selectedGridId,
      soundOn: this.soundOn,
      musicOn: this.musicOn
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  private readSettings(): StoredSettings | null {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Partial<StoredSettings> & { difficulty?: string };
      const category = parsed.category ?? 'animals';
      const soundOn = parsed.soundOn;
      const musicOn = typeof parsed.musicOn === 'boolean' ? parsed.musicOn : true;
      const matchSize = parsed.matchSize ?? 2;
      const gridId = parsed.gridId ?? parsed.difficulty ?? defaultGridIdForSize(matchSize as MatchSize);

      if (!category || typeof soundOn !== 'boolean') {
        return null;
      }

      return {
        category,
        matchSize: (matchSize === 2 || matchSize === 3 || matchSize === 4 ? matchSize : 2) as MatchSize,
        gridId,
        soundOn,
        musicOn
      };
    } catch {
      return null;
    }
  }

  matchSizeLabel(size: MatchSize): string {
    return this.i18n.t('settings.matchCount', { count: size });
  }

  get currentLanguageFlag(): string {
    return this.languageFlag(this.i18n.language);
  }

  languageFlag(code: LanguageCode): string {
    switch (code) {
      case 'ro':
        return '🇷🇴';
      case 'en':
        return '🇬🇧';
      case 'fr':
        return '🇫🇷';
      case 'es':
        return '🇪🇸';
      case 'de':
        return '🇩🇪';
      default:
        return '🌍';
    }
  }
}
