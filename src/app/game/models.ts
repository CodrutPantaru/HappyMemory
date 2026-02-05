export type CategoryId = 'animals' | 'letters' | 'numbers' | 'hospital';

export type MatchSize = 2 | 3 | 4;

export interface GridOption {
  id: string;
  rows: number;
  cols: number;
  label: string;
}

export interface MatchOption {
  size: MatchSize;
  rows: number;
  cols: number;
  label: string;
}

const GRID_MULTIPLIERS = [1, 2, 3] as const;

export const MATCH_SIZES: MatchSize[] = [2, 3, 4];

export const defaultGridIdForSize = (size: MatchSize): string => {
  const preferred = `${size * 2}x${size * 2}`;
  return preferred;
};

export const buildGridOptions = (size: MatchSize): GridOption[] => {
  const options: GridOption[] = [];
  for (const rowMultiplier of GRID_MULTIPLIERS) {
    for (const colMultiplier of GRID_MULTIPLIERS) {
      if (rowMultiplier > colMultiplier) {
        continue;
      }
      const rows = size * rowMultiplier;
      const cols = size * colMultiplier;
      const id = `${rows}x${cols}`;
      options.push({ id, rows, cols, label: `${rows}x${cols}` });
    }
  }
  return options;
};

export interface SymbolItem {
  value: string;
  display: string;
  imageUrl?: string;
  spriteIndex?: number;
  spriteColumns?: number;
  spriteRows?: number;
}

export type CardState = 'hidden' | 'revealed' | 'matched';

export interface Card {
  id: number;
  value: string;
  display: string;
  imageUrl?: string;
  spriteIndex?: number;
  spriteColumns?: number;
  spriteRows?: number;
  state: CardState;
}

