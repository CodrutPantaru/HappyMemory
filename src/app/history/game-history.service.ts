import { Injectable } from '@angular/core';
import { CategoryId, MatchSize } from '../game/models';

const HISTORY_KEY = 'memory-game-history-v1';
const MAX_RECENT_GAMES = 12;

export interface GameHistoryEntry {
  id: string;
  playedAt: number;
  categories: CategoryId[];
  matchSize: MatchSize;
  gridId: string;
  moves: number;
  durationSeconds: number;
  totalMatches: number;
  score: number;
}

export interface GameHistorySnapshot {
  topScore: number | null;
  recentGames: GameHistoryEntry[];
}

interface GameHistoryStore {
  recentGames: GameHistoryEntry[];
}

type StoredHistoryEntry = Omit<GameHistoryEntry, 'durationSeconds'> & { durationSeconds?: number };

export interface RecordGameInput {
  categories: CategoryId[];
  matchSize: MatchSize;
  gridId: string;
  moves: number;
  durationSeconds: number;
  totalMatches: number;
}

@Injectable({ providedIn: 'root' })
export class GameHistoryService {
  getSnapshot(): GameHistorySnapshot {
    const store = this.readStore();
    const topScore = store.recentGames.length
      ? Math.max(...store.recentGames.map((item) => item.score))
      : null;

    return {
      topScore,
      recentGames: store.recentGames
    };
  }

  recordGame(input: RecordGameInput): void {
    if (
      input.moves <= 0 ||
      input.totalMatches <= 0 ||
      input.durationSeconds < 0 ||
      input.categories.length === 0
    ) {
      return;
    }

    const entry: GameHistoryEntry = {
      id: this.createId(),
      playedAt: Date.now(),
      categories: [...input.categories],
      matchSize: input.matchSize,
      gridId: input.gridId,
      moves: input.moves,
      durationSeconds: Math.max(0, Math.floor(input.durationSeconds)),
      totalMatches: input.totalMatches,
      score: this.computeScore(input.moves, input.totalMatches, input.durationSeconds, input.matchSize)
    };

    const store = this.readStore();
    store.recentGames = [entry, ...store.recentGames].slice(0, MAX_RECENT_GAMES);
    this.writeStore(store);
  }

  private computeScore(
    moves: number,
    totalMatches: number,
    durationSeconds: number,
    matchSize: MatchSize
  ): number {
    const perfectMoves = totalMatches;
    const efficiency = perfectMoves / moves;
    const safeDuration = Math.max(1, Math.floor(durationSeconds));
    const parTimeSeconds = totalMatches * matchSize * 2;
    const speed = parTimeSeconds / safeDuration;
    const speedFactor = Math.min(1.5, Math.max(0.35, speed));
    const base = totalMatches * 100;
    return Math.max(100, Math.round(base * efficiency * speedFactor));
  }

  private readStore(): GameHistoryStore {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) {
        return { recentGames: [] };
      }

      const parsed = JSON.parse(raw) as { recentGames?: unknown };
      if (!Array.isArray(parsed.recentGames)) {
        return { recentGames: [] };
      }

      return {
        recentGames: parsed.recentGames
          .filter((item): item is StoredHistoryEntry => this.isStoredHistoryEntry(item))
          .map((item) => ({
            ...item,
            durationSeconds:
              typeof item.durationSeconds === 'number' ? Math.max(0, Math.floor(item.durationSeconds)) : 0
          }))
      };
    } catch {
      return { recentGames: [] };
    }
  }

  private writeStore(store: GameHistoryStore): void {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(store));
    } catch {
      // ignore storage errors
    }
  }

  private createId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private isStoredHistoryEntry(item: unknown): item is StoredHistoryEntry {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const entry = item as Partial<StoredHistoryEntry>;
    return (
      typeof entry.id === 'string' &&
      typeof entry.playedAt === 'number' &&
      Array.isArray(entry.categories) &&
      (entry.matchSize === 2 || entry.matchSize === 3 || entry.matchSize === 4) &&
      typeof entry.gridId === 'string' &&
      typeof entry.moves === 'number' &&
      typeof entry.totalMatches === 'number' &&
      typeof entry.score === 'number' &&
      (entry.durationSeconds === undefined || typeof entry.durationSeconds === 'number')
    );
  }
}
