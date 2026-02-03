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
    { id: 'numbers', labelKey: 'category.numbers', emoji: '🔢' }
  ];

  readonly symbolsByCategory: Record<CategoryId, SymbolItem[]> = {
    animals: [
      { value: 'cat', display: 'Pisica', imageUrl: 'assets/cards/animals/cat.png' },
      { value: 'dog', display: 'Catel', imageUrl: 'assets/cards/animals/dog.png' },
      { value: 'chicken', display: 'Gaina', imageUrl: 'assets/cards/animals/chicken.png' },
      { value: 'cow', display: 'Vaca', imageUrl: 'assets/cards/animals/cow.png' },
      { value: 'pig', display: 'Purcel', imageUrl: 'assets/cards/animals/pig.png' },
      { value: 'elephant', display: 'Elefant', imageUrl: 'assets/cards/animals/elephant.png' },
      { value: 'monkey', display: 'Maimuta', imageUrl: 'assets/cards/animals/monkey.png' },
      { value: 'frog', display: 'Broasca', imageUrl: 'assets/cards/animals/frog.png' }
    ],
    letters: Array.from('ABCDEFGH').map((letter) => ({
      value: letter,
      display: letter,
      imageUrl: `assets/cards/letters/${letter}.png`
    })),
    numbers: Array.from({ length: 10 }, (_, index) => {
      const value = String(index);
      return { value, display: value, imageUrl: `assets/cards/numbers/${value}.png` };
    })
  };

  stage: 'select' | 'play' = 'select';
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
    private readonly audio: AudioService
  ) {}

  ngOnInit(): void {
    const categoryParam = this.route.snapshot.queryParamMap.get('category');
    const sizeParam = this.route.snapshot.queryParamMap.get('size');
    const rowsParam = this.route.snapshot.queryParamMap.get('rows');
    const colsParam = this.route.snapshot.queryParamMap.get('cols');
    const soundParam = this.route.snapshot.queryParamMap.get('sound');
    const musicParam = this.route.snapshot.queryParamMap.get('music');

    if (categoryParam === 'animals' || categoryParam === 'letters' || categoryParam === 'numbers') {
      this.selectedCategory = categoryParam;
    }

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

    if (categoryParam || sizeParam || (rows && cols)) {
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
        return 'assets/cards/numbers/back-card.png';
      case 'letters':
        return 'assets/cards/letters/back-card.png';
      default:
        return 'assets/cards/animals/back-card.png';
    }
  }

  get selectedCategoryLabel(): string {
    const category = this.categories.find((item) => item.id === this.selectedCategory);
    return category ? this.i18n.t(category.labelKey) : '';
  }

  get progressPercent(): number {
    if (this.totalMatches === 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.matchesFound / this.totalMatches) * 100));
  }

  selectCategory(category: CategoryId): void {
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

    const symbols = this.pickSymbols(this.symbolsByCategory[this.selectedCategory], uniqueNeeded);
    const deck: Card[] = [];
    let idCounter = 1;

    symbols.forEach((symbol) => {
      for (let i = 0; i < size; i += 1) {
        deck.push({
          id: idCounter,
          value: symbol.value,
          display: symbol.display,
          imageUrl: symbol.imageUrl,
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
