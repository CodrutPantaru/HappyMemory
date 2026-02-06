import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AudioService } from '../audio/audio.service';
import { CategoryId, MatchSize, GridOption, buildGridOptions, defaultGridIdForSize } from '../game/models';
import { I18nService, LanguageCode } from '../i18n/i18n.service';
import { PurchaseService } from '../monetization/purchase.service';

interface StoredSettings {
  category: CategoryId;
  categories?: CategoryId[];
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
  readonly categories: Array<{ id: CategoryId; labelKey: string; imageUrl: string }> = [
    { id: 'animals', labelKey: 'category.animals', imageUrl: 'assets/cards/animals/cat.webp' },
    { id: 'letters', labelKey: 'category.letters', imageUrl: 'assets/cards/letters/A.webp' },
    { id: 'numbers', labelKey: 'category.numbers', imageUrl: 'assets/cards/numbers/1.webp' },
    { id: 'hospital', labelKey: 'category.hospital', imageUrl: 'assets/cards/hospital-sprites/thumb.webp' },
    { id: 'utility-cars', labelKey: 'category.utilityCars', imageUrl: 'assets/cards/utility-cars/taxi.webp' }
  ];

  readonly matchSizes: MatchSize[] = [2, 3, 4];

  readonly languages: Array<{ id: LanguageCode; label: string }> = [
    { id: 'ro', label: 'Romana' },
    { id: 'en', label: 'English' },
    { id: 'fr', label: 'Francais' },
    { id: 'es', label: 'Espanol' },
    { id: 'de', label: 'Deutsch' }
  ];

  selectedCategories: CategoryId[] = ['animals'];
  selectedMatchSize: MatchSize = 2;
  selectedGridId = defaultGridIdForSize(2);
  soundOn = true;
  musicOn = true;
  openLanguage = false;
  isLanguageClosing = false;
  isDifficultyOpen = false;

  constructor(
    public readonly i18n: I18nService,
    private readonly audio: AudioService,
    private readonly purchases: PurchaseService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    void this.purchases.init();

    const stored = this.readSettings();
    if (stored) {
      this.selectedCategories =
        stored.categories?.filter((category) => this.isKnownCategory(category)) ??
        [stored.category ?? 'animals'];
      this.selectedMatchSize = stored.matchSize;
      this.selectedGridId = stored.gridId;
      this.soundOn = stored.soundOn;
      this.musicOn = stored.musicOn;
      this.audio.updateSettings(this.soundOn, this.musicOn);
    }

    const unlocked = this.selectedCategories.filter((category) => this.purchases.isCategoryUnlocked(category));
    this.selectedCategories = unlocked.length ? unlocked : [this.purchases.getFallbackCategory()];

    const validGrids = buildGridOptions(this.selectedMatchSize).map((option) => option.id);
    if (!validGrids.includes(this.selectedGridId)) {
      this.selectedGridId = defaultGridIdForSize(this.selectedMatchSize);
    }

    this.persistSettings();
  }

  get activeCategory() {
    return this.categories.find((item) => item.id === this.selectedCategories[0]) ?? this.categories[0];
  }

  get activePacksLabel(): string {
    return this.selectedCategories
      .map((category) => this.categories.find((item) => item.id === category))
      .filter((item): item is { id: CategoryId; labelKey: string; imageUrl: string } => Boolean(item))
      .map((item) => this.i18n.t(item.labelKey))
      .join(', ');
  }

  get difficultyLabel(): string {
    return `${this.matchSizeLabel(this.selectedMatchSize)} | ${this.currentGrid.id}`;
  }

  get gridOptions(): GridOption[] {
    return buildGridOptions(this.selectedMatchSize);
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
    const safeCategories = this.selectedCategories.filter((category) =>
      this.purchases.isCategoryUnlocked(category)
    );
    const categories = safeCategories.length ? safeCategories : [this.purchases.getFallbackCategory()];

    this.router.navigate(['/game'], {
      queryParams: {
        category: categories[0],
        categories: categories.join(','),
        size: this.selectedMatchSize,
        rows: this.currentGrid.rows,
        cols: this.currentGrid.cols,
        sound: this.soundOn,
        music: this.musicOn
      }
    });
  }

  goToPackConfig(): void {
    this.audio.playButton();
    this.router.navigate(['/configure-pack']);
  }

  goToHistory(): void {
    this.audio.playButton();
    this.router.navigate(['/history']);
  }

  openDifficultyModal(): void {
    this.audio.playButton();
    this.isDifficultyOpen = true;
  }

  closeDifficultyModal(): void {
    this.audio.playButton();
    this.isDifficultyOpen = false;
  }

  setMatchSize(size: MatchSize): void {
    this.audio.playButton();
    this.selectedMatchSize = size;
    this.selectedGridId = defaultGridIdForSize(size);
    this.persistSettings();
  }

  setGrid(id: string): void {
    this.audio.playButton();
    this.selectedGridId = id;
    this.persistSettings();
  }

  saveDifficulty(): void {
    this.persistSettings();
    this.closeDifficultyModal();
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

  matchSizeLabel(size: MatchSize): string {
    return this.i18n.t('settings.matchCount', { count: size });
  }

  private get currentGrid(): GridOption {
    const grids = buildGridOptions(this.selectedMatchSize);
    return grids.find((item) => item.id === this.selectedGridId) ?? grids[0];
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

  private persistSettings(): void {
    const settings: StoredSettings = {
      category: this.selectedCategories[0] ?? this.purchases.getFallbackCategory(),
      categories: this.selectedCategories,
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
      const categories = parsed.categories?.filter((item): item is CategoryId => this.isKnownCategory(item));
      const soundOn = parsed.soundOn;
      const musicOn = typeof parsed.musicOn === 'boolean' ? parsed.musicOn : true;
      const matchSize = parsed.matchSize ?? 2;
      const gridId = parsed.gridId ?? parsed.difficulty ?? defaultGridIdForSize(matchSize as MatchSize);

      if (!category || typeof soundOn !== 'boolean') {
        return null;
      }

      return {
        category,
        categories,
        matchSize: (matchSize === 2 || matchSize === 3 || matchSize === 4 ? matchSize : 2) as MatchSize,
        gridId,
        soundOn,
        musicOn
      };
    } catch {
      return null;
    }
  }

  private isKnownCategory(value: unknown): value is CategoryId {
    return (
      value === 'animals' ||
      value === 'letters' ||
      value === 'numbers' ||
      value === 'hospital' ||
      value === 'utility-cars'
    );
  }
}
