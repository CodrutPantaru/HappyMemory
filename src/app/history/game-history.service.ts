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

export interface RecordGameInput {
  categories: CategoryId[];
  matchSize: MatchSize;
  gridId: string;
  moves: number;
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
    if (input.moves <= 0 || input.totalMatches <= 0 || input.categories.length === 0) {
      return;
    }

    const entry: GameHistoryEntry = {
      id: this.createId(),
      playedAt: Date.now(),
      categories: [...input.categories],
      matchSize: input.matchSize,
      gridId: input.gridId,
      moves: input.moves,
      totalMatches: input.totalMatches,
      score: this.computeScore(input.moves, input.totalMatches)
    };

    const store = this.readStore();
    store.recentGames = [entry, ...store.recentGames].slice(0, MAX_RECENT_GAMES);
    this.writeStore(store);
  }

  private computeScore(moves: number, totalMatches: number): number {
    const perfectMoves = totalMatches;
    const efficiency = perfectMoves / moves;
    const base = totalMatches * 100;
    return Math.max(100, Math.round(base * efficiency));
  }

  private readStore(): GameHistoryStore {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) {
        return { recentGames: [] };
      }

      const parsed = JSON.parse(raw) as Partial<GameHistoryStore>;
      if (!Array.isArray(parsed.recentGames)) {
        return { recentGames: [] };
      }

      return {
        recentGames: parsed.recentGames.filter((item): item is GameHistoryEntry => {
          return (
            Boolean(item) &&
            typeof item.id === 'string' &&
            typeof item.playedAt === 'number' &&
            Array.isArray(item.categories) &&
            (item.matchSize === 2 || item.matchSize === 3 || item.matchSize === 4) &&
            typeof item.gridId === 'string' &&
            typeof item.moves === 'number' &&
            typeof item.totalMatches === 'number' &&
            typeof item.score === 'number'
          );
        })
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
}
