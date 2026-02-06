import { Component, OnInit } from '@angular/core';

import { RouterModule, ActivatedRoute } from '@angular/router';
import { CardComponent } from './card.component';
import {
  Card,
  CategoryId,
  MatchOption,
  MatchSize,
  SymbolItem,
  GridOption,
  buildGridOptions,
  defaultGridIdForSize,
  MATCH_SIZES
} from './models';
import { I18nService } from '../i18n/i18n.service';
import { AudioService } from '../audio/audio.service';
import { PurchaseService } from '../monetization/purchase.service';
import { PREMIUM_CATEGORY_BY_ID } from '../monetization/pack-catalog';
import { GameHistoryService } from '../history/game-history.service';

interface ConfettiPiece {
  left: number;
  size: number;
  hue: number;
  delay: number;
  duration: number;
  rotate: number;
}

@Component({
    selector: 'app-game',
    standalone: true,
    imports: [RouterModule, CardComponent],
    templateUrl: './game.component.html',
    styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
  title = 'Memory Game';

  readonly matchSizes = MATCH_SIZES;

  readonly categories: Array<{ id: CategoryId; labelKey: string; emoji: string }> = [
    { id: 'animals', labelKey: 'category.animals', emoji: '🐾' },
    { id: 'letters', labelKey: 'category.letters', emoji: '🔤' },
    { id: 'numbers', labelKey: 'category.numbers', emoji: '🔢' },
    { id: 'hospital', labelKey: 'category.hospital', emoji: '🏥' },
    { id: 'utility-cars', labelKey: 'category.utilityCars', emoji: '🚚' }
  ];

  readonly symbolsByCategory: Record<CategoryId, SymbolItem[]> = {
    animals: [
      { value: 'cat', display: 'Pisica', imageUrl: 'assets/cards/animals/cat.webp' },
      { value: 'dog', display: 'Catel', imageUrl: 'assets/cards/animals/dog.webp' },
      { value: 'chicken', display: 'Gaina', imageUrl: 'assets/cards/animals/chicken.webp' },
      { value: 'cow', display: 'Vaca', imageUrl: 'assets/cards/animals/cow.webp' },
      { value: 'pig', display: 'Purcel', imageUrl: 'assets/cards/animals/pig.webp' },
      { value: 'elephant', display: 'Elefant', imageUrl: 'assets/cards/animals/elephant.webp' },
      { value: 'monkey', display: 'Maimuta', imageUrl: 'assets/cards/animals/monkey.webp' },
      { value: 'frog', display: 'Broasca', imageUrl: 'assets/cards/animals/frog.webp' }
    ],
    letters: Array.from('ABCDEFGH').map((letter) => ({
      value: letter,
      display: letter,
      imageUrl: `assets/cards/letters/${letter}.webp`
    })),
    numbers: Array.from({ length: 10 }, (_, index) => {
      const value = String(index);
      return { value, display: value, imageUrl: `assets/cards/numbers/${value}.webp` };
    }),
    hospital: Array.from({ length: 12 }, (_, index) => ({
      value: `hospital_${index + 1}`,
      display: `H${index + 1}`,
      imageUrl: 'assets/cards/hospital-sprites/hospital-sprite.webp',
      spriteIndex: index,
      spriteColumns: 3,
      spriteRows: 4
    })),
    'utility-cars': [
      { value: 'ambulance', display: 'Ambulance', imageUrl: 'assets/cards/utility-cars/Ambulance.webp' },
      { value: 'excavator', display: 'Excavator', imageUrl: 'assets/cards/utility-cars/excavator.webp' },
      { value: 'firetruck', display: 'Firetruck', imageUrl: 'assets/cards/utility-cars/firetruck.webp' },
      { value: 'garbage_truck', display: 'Garbage Truck', imageUrl: 'assets/cards/utility-cars/garbage-truck.webp' },
      { value: 'ice_cream_truck', display: 'Ice Cream Truck', imageUrl: 'assets/cards/utility-cars/ice-cream-truck.webp' },
      { value: 'police', display: 'Police', imageUrl: 'assets/cards/utility-cars/police.webp' },
      { value: 'race_car', display: 'Race Car', imageUrl: 'assets/cards/utility-cars/race-car.webp' },
      { value: 'school_bus', display: 'School Bus', imageUrl: 'assets/cards/utility-cars/school-bus.webp' },
      { value: 'taxi', display: 'Taxi', imageUrl: 'assets/cards/utility-cars/taxi.webp' },
      { value: 'tractor', display: 'Tractor', imageUrl: 'assets/cards/utility-cars/tractor.webp' },
      { value: 'truck', display: 'Truck', imageUrl: 'assets/cards/utility-cars/truck.webp' }
    ]
  };

  stage: 'select' | 'play' = 'select';
  selectedCategories: CategoryId[] = ['animals'];
  selectedCategory: CategoryId = 'animals';
  selectedMatchSize: MatchSize = 2;
  selectedGridId = defaultGridIdForSize(2);
  soundOn = true;
  musicOn = true;

  cards: Card[] = [];
  revealedCards: Card[] = [];
  lockBoard = false;
  moves = 0;
  matchesFound = 0;
  totalMatches = 0;
  isWin = false;
  confettiPieces: ConfettiPiece[] = [];

  private flipBackTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly route: ActivatedRoute,
    public readonly i18n: I18nService,
    private readonly audio: AudioService,
    private readonly purchases: PurchaseService,
    private readonly history: GameHistoryService
  ) {}

  ngOnInit(): void {
    void this.purchases.init();
    const categoryParam = this.route.snapshot.queryParamMap.get('category');
    const categoriesParam = this.route.snapshot.queryParamMap.get('categories');
    const sizeParam = this.route.snapshot.queryParamMap.get('size');
    const rowsParam = this.route.snapshot.queryParamMap.get('rows');
    const colsParam = this.route.snapshot.queryParamMap.get('cols');
    const soundParam = this.route.snapshot.queryParamMap.get('sound');
    const musicParam = this.route.snapshot.queryParamMap.get('music');

    if (categoriesParam) {
      const parsed = categoriesParam
        .split(',')
        .map((item) => item.trim())
        .filter(
          (item): item is CategoryId =>
            item === 'animals' ||
            item === 'letters' ||
            item === 'numbers' ||
            item === 'hospital' ||
            item === 'utility-cars'
        );
      if (parsed.length) {
        this.selectedCategories = parsed;
      }
    }

    if (
      categoryParam === 'animals' ||
      categoryParam === 'letters' ||
      categoryParam === 'numbers' ||
      categoryParam === 'hospital' ||
      categoryParam === 'utility-cars'
    ) {
      this.selectedCategory = categoryParam;
      if (!this.selectedCategories.includes(categoryParam)) {
        this.selectedCategories = [categoryParam];
      }
    }

    const unlocked = this.selectedCategories.filter((category) => this.purchases.isCategoryUnlocked(category));
    this.selectedCategories = unlocked.length ? unlocked : [this.purchases.getFallbackCategory()];
    this.selectedCategory = this.selectedCategories[0];

    if (soundParam !== null) {
      this.soundOn = soundParam !== 'false';
    }
    if (musicParam !== null) {
      this.musicOn = musicParam !== 'false';
    }

    if (sizeParam === '2' || sizeParam === '3' || sizeParam === '4') {
      this.selectedMatchSize = Number(sizeParam) as MatchSize;
      this.selectedGridId = defaultGridIdForSize(this.selectedMatchSize);
    }

    const rows = rowsParam ? Number(rowsParam) : null;
    const cols = colsParam ? Number(colsParam) : null;
    if (rows && cols && Number.isInteger(rows) && Number.isInteger(cols)) {
      this.selectedGridId = `${rows}x${cols}`;
    }

    if (!this.gridOptions.some((option) => option.id === this.selectedGridId)) {
      this.selectedGridId = defaultGridIdForSize(this.selectedMatchSize);
      if (!this.gridOptions.some((option) => option.id === this.selectedGridId)) {
        this.selectedGridId = this.gridOptions[0]?.id ?? this.selectedGridId;
      }
    }

    this.loadAudioSettings();

    if (categoryParam || categoriesParam || sizeParam || (rows && cols)) {
      this.startGame();
    }
  }

  get gridOptions(): GridOption[] {
    return buildGridOptions(this.selectedMatchSize);
  }

  get currentGrid(): GridOption {
    return this.gridOptions.find((option) => option.id === this.selectedGridId) ?? this.gridOptions[0];
  }

  get currentOption(): MatchOption {
    const grid = this.currentGrid;
    return {
      size: this.selectedMatchSize,
      rows: grid.rows,
      cols: grid.cols,
      label: grid.label
    };
  }

  get gridTemplate(): string {
    return `repeat(${this.currentOption.cols}, minmax(0, 1fr))`;
  }

  get backCardUrl(): string {
    switch (this.selectedCategory) {
      case 'numbers':
        return 'assets/cards/numbers/back-card.webp';
      case 'letters':
        return 'assets/cards/letters/back-card.webp';
      case 'utility-cars':
        return 'assets/cards/utility-cars/back-card.webp';
      case 'hospital':
        return 'assets/cards/hospital-sprites/back-card.webp';
      default:
        return 'assets/cards/animals/back-card.webp';
    }
  }

  get selectedCategoryLabel(): string {
    const labels = this.selectedCategories
      .map((category) => this.categories.find((item) => item.id === category))
      .filter((item): item is { id: CategoryId; labelKey: string; emoji: string } => Boolean(item))
      .map((item) => this.i18n.t(item.labelKey));
    return labels.join(', ');
  }

  get progressPercent(): number {
    if (this.totalMatches === 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.matchesFound / this.totalMatches) * 100));
  }

  selectCategory(category: CategoryId): void {
    if (!this.purchases.isCategoryUnlocked(category)) {
      return;
    }
    this.selectedCategories = [category];
    this.selectedCategory = category;
    this.audio.playButton();
    this.startGame();
  }

  setMatchSize(size: MatchSize): void {
    this.selectedMatchSize = size;
    this.audio.playButton();
    if (!this.gridOptions.some((option) => option.id === this.selectedGridId)) {
      this.selectedGridId = defaultGridIdForSize(size);
      if (!this.gridOptions.some((option) => option.id === this.selectedGridId)) {
        this.selectedGridId = this.gridOptions[0]?.id ?? this.selectedGridId;
      }
    }
  }

  setGrid(id: string): void {
    this.selectedGridId = id;
    this.audio.playButton();
  }

  playAgain(): void {
    this.audio.playButton();
    this.startGame();
  }

  onBack(): void {
    this.audio.playButton();
  }

  toggleSound(): void {
    this.soundOn = !this.soundOn;
    this.persistAudioSettings();
    this.audio.updateSettings(this.soundOn, this.musicOn);
    this.audio.playButton();
  }

  toggleMusic(): void {
    this.musicOn = !this.musicOn;
    this.persistAudioSettings();
    this.audio.updateSettings(this.soundOn, this.musicOn);
    this.audio.playButton();
    if (this.musicOn) {
      this.audio.startMusicIfEnabled();
    }
  }

  startGame(): void {
    if (this.flipBackTimeout) {
      clearTimeout(this.flipBackTimeout);
    }

    this.stage = 'play';
    const { rows, cols, size } = this.currentOption;
    const totalCards = rows * cols;
    const uniqueNeeded = totalCards / size;

    if (!Number.isInteger(uniqueNeeded)) {
      throw new Error('Configuratie invalida: numarul de carti nu se potriveste cu matchSize.');
    }

    const combinedPool = this.selectedCategories.flatMap((category) => this.symbolsByCategory[category]);
    const symbols = this.pickSymbols(combinedPool, uniqueNeeded);
    const deck: Card[] = [];
    let idCounter = 1;

    symbols.forEach((symbol) => {
      for (let i = 0; i < size; i += 1) {
        deck.push({
          id: idCounter,
          value: symbol.value,
          display: symbol.display,
          imageUrl: symbol.imageUrl,
          spriteIndex: symbol.spriteIndex,
          spriteColumns: symbol.spriteColumns,
          spriteRows: symbol.spriteRows,
          state: 'hidden'
        });
        idCounter += 1;
      }
    });

    this.cards = this.shuffle(deck);
    this.revealedCards = [];
    this.lockBoard = false;
    this.moves = 0;
    this.matchesFound = 0;
    this.totalMatches = uniqueNeeded;
    this.isWin = false;
    this.confettiPieces = [];
  }

  resetGame(): void {
    this.startGame();
  }

  reveal(card: Card): void {
    if (this.lockBoard || card.state !== 'hidden') {
      return;
    }

    card.state = 'revealed';
    this.audio.playFlip();
    this.revealedCards.push(card);

    if (this.revealedCards.length === this.currentOption.size) {
      this.moves += 1;
      this.evaluateMatch();
    }
  }

  trackCard(_: number, card: Card): number {
    return card.id;
  }

  isCategoryUnlocked(category: CategoryId): boolean {
    return this.purchases.isCategoryUnlocked(category);
  }

  categoryPrice(category: CategoryId): string | null {
    const pack = PREMIUM_CATEGORY_BY_ID[category];
    return pack && !pack.isFree ? pack.priceLabel : null;
  }

  private evaluateMatch(): void {
    this.lockBoard = true;
    const [first, ...rest] = this.revealedCards;
    const isMatch = rest.every((card) => card.value === first.value);

    if (isMatch) {
      this.revealedCards.forEach((card) => {
        card.state = 'matched';
      });
      this.matchesFound += 1;
      this.revealedCards = [];
      this.lockBoard = false;
      this.audio.playMatchSound(first.value);
      this.isWin = this.matchesFound === this.totalMatches;
      if (this.isWin) {
        this.history.recordGame({
          categories: this.selectedCategories,
          matchSize: this.selectedMatchSize,
          gridId: this.currentGrid.id,
          moves: this.moves,
          totalMatches: this.totalMatches
        });
        this.confettiPieces = this.createConfetti();
        this.audio.playVictory();
      }
      return;
    }

    this.flipBackTimeout = setTimeout(() => {
      this.revealedCards.forEach((card) => {
        card.state = 'hidden';
      });
      this.revealedCards = [];
      this.lockBoard = false;
      this.audio.playFlip();
    }, 800);
  }

  private pickSymbols(pool: SymbolItem[], count: number): SymbolItem[] {
    if (count <= pool.length) {
      const shuffled = this.shuffle([...pool]);
      return shuffled.slice(0, count);
    }

    const result: SymbolItem[] = [];
    while (result.length < count) {
      const shuffled = this.shuffle([...pool]);
      for (const symbol of shuffled) {
        result.push(symbol);
        if (result.length === count) {
          break;
        }
      }
    }
    return result;
  }

  private shuffle<T>(items: T[]): T[] {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private createConfetti(count = 100): ConfettiPiece[] {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < count; i += 1) {
      pieces.push({
        left: Math.random() * 100,
        size: 6 + Math.random() * 6,
        hue: Math.floor(Math.random() * 360),
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.6,
        rotate: Math.random() * 360
      });
    }
    return pieces;
  }

  private loadAudioSettings(): void {
    try {
      const raw = localStorage.getItem('memory-game-settings-v1');
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const storedSound = parsed['soundOn'];
      const storedMusic = parsed['musicOn'];
      if (typeof storedSound === 'boolean') {
        this.soundOn = storedSound;
      }
      if (typeof storedMusic === 'boolean') {
        this.musicOn = storedMusic;
      }
      this.audio.updateSettings(this.soundOn, this.musicOn);
      if (this.musicOn) {
        this.audio.startMusicIfEnabled();
      }
    } catch {
      // ignore
    }
  }

  private persistAudioSettings(): void {
    try {
      const raw = localStorage.getItem('memory-game-settings-v1');
      const base = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      base['soundOn'] = this.soundOn;
      base['musicOn'] = this.musicOn;
      localStorage.setItem('memory-game-settings-v1', JSON.stringify(base));
    } catch {
      // ignore
    }
  }
}
