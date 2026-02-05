import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AudioService } from '../audio/audio.service';
import {
  CategoryId,
  MatchSize,
  defaultGridIdForSize
} from '../game/models';
import { I18nService } from '../i18n/i18n.service';
import { PREMIUM_CATEGORY_BY_ID, ProductId } from '../monetization/pack-catalog';
import { PurchaseService } from '../monetization/purchase.service';
import { CommonModule } from '@angular/common';

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
  selector: 'app-pack-config',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './pack-config.component.html',
  styleUrl: './pack-config.component.scss'
})
export class PackConfigComponent implements OnInit {
  readonly categories: Array<{ id: CategoryId; labelKey: string; imageUrl: string }> = [
    { id: 'animals', labelKey: 'category.animals', imageUrl: 'assets/cards/animals/cat.webp' },
    { id: 'letters', labelKey: 'category.letters', imageUrl: 'assets/cards/letters/A.webp' },
    { id: 'numbers', labelKey: 'category.numbers', imageUrl: 'assets/cards/numbers/1.webp' },
    { id: 'hospital', labelKey: 'category.hospital', imageUrl: 'assets/cards/hospital-sprites/hospital-thumb.png' }
  ];

  selectedCategories: CategoryId[] = ['animals'];
  selectedMatchSize: MatchSize = 2;
  selectedGridId = defaultGridIdForSize(2);
  soundOn = true;
  musicOn = true;

  isPurchaseBusy = false;

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
    }

    const unlocked = this.selectedCategories.filter((category) => this.isCategoryUnlocked(category));
    this.selectedCategories = unlocked.length ? unlocked : [this.purchases.getFallbackCategory()];
  }

  get availableCategories(): Array<{ id: CategoryId; labelKey: string; imageUrl: string }> {
    return this.categories.filter((category) => this.isCategoryUnlocked(category.id));
  }

  get premiumCategories(): Array<{ id: CategoryId; labelKey: string; imageUrl: string }> {
    return this.categories.filter((category) => !this.isCategoryUnlocked(category.id));
  }

  setCategory(category: CategoryId): void {
    this.audio.playButton();
    if (!this.isCategoryUnlocked(category)) {
      return;
    }
    if (this.selectedCategories.includes(category)) {
      if (this.selectedCategories.length > 1) {
        this.selectedCategories = this.selectedCategories.filter((item) => item !== category);
      }
    } else {
      this.selectedCategories = [...this.selectedCategories, category];
    }
    this.persistSettings();
  }

  saveAndBack(): void {
    const unlocked = this.selectedCategories.filter((category) => this.isCategoryUnlocked(category));
    this.selectedCategories = unlocked.length ? unlocked : [this.purchases.getFallbackCategory()];
    this.persistSettings();
    this.audio.playButton();
    void this.router.navigate(['/']);
  }

  backToMenu(): void {
    this.audio.playButton();
    void this.router.navigate(['/']);
  }

  isCategoryUnlocked(category: CategoryId): boolean {
    return this.purchases.isCategoryUnlocked(category);
  }

  categoryPrice(category: CategoryId): string | null {
    const pack = PREMIUM_CATEGORY_BY_ID[category];
    return pack && !pack.isFree ? pack.priceLabel : null;
  }

  async buyCategory(category: CategoryId): Promise<void> {
    const productId = PREMIUM_CATEGORY_BY_ID[category].productId as ProductId | null;
    if (!productId) {
      return;
    }
    if (this.isPurchaseBusy) {
      return;
    }
    this.isPurchaseBusy = true;
    try {
      await this.purchases.purchase(productId);
      if (this.isCategoryUnlocked(category) && !this.selectedCategories.includes(category)) {
        this.selectedCategories = [...this.selectedCategories, category];
      }
      this.persistSettings();
    } finally {
      this.isPurchaseBusy = false;
    }
  }

  restorePurchases(): void {
    this.purchases.restorePurchases();
    for (const category of this.categories.map((item) => item.id)) {
      if (this.isCategoryUnlocked(category) && !this.selectedCategories.includes(category)) {
        this.selectedCategories = [...this.selectedCategories, category];
      }
    }
    this.persistSettings();
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
      const soundOn = parsed.soundOn;
      const musicOn = typeof parsed.musicOn === 'boolean' ? parsed.musicOn : true;
      const matchSize = parsed.matchSize ?? 2;
      const gridId = parsed.gridId ?? parsed.difficulty ?? defaultGridIdForSize(matchSize as MatchSize);

      if (!category || typeof soundOn !== 'boolean') {
        return null;
      }

      return {
        category,
        categories:
          parsed.categories?.filter((item): item is CategoryId => this.isKnownCategory(item)) ?? undefined,
        matchSize: (matchSize === 2 || matchSize === 3 || matchSize === 4 ? matchSize : 2) as MatchSize,
        gridId,
        soundOn,
        musicOn
      };
    } catch {
      return null;
    }
  }

  isCategorySelected(category: CategoryId): boolean {
    return this.selectedCategories.includes(category);
  }

  private isKnownCategory(value: unknown): value is CategoryId {
    return value === 'animals' || value === 'letters' || value === 'numbers' || value === 'hospital';
  }
}
