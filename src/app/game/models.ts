export type CategoryId = 'animals' | 'letters' | 'numbers' | 'hospital' | 'utility-cars';

export type MatchSize = 2 | 3 | 4;

export interface GridOption {
  id: string;
  cards: number;
  label: string;
}

export interface MatchOption {
  size: MatchSize;
  cards: number;
  rows: number;
  cols: number;
  label: string;
}

const GRID_CARD_COUNTS: Record<MatchSize, number[]> = {
  2: [8, 12, 16, 20],
  3: [9, 12, 15, 18],
  4: [8, 12, 16, 20]
};

const DEFAULT_GRID_CARDS: Record<MatchSize, number> = {
  2: 16,
  3: 12,
  4: 16
};

export const MATCH_SIZES: MatchSize[] = [2, 3, 4];

export const defaultGridIdForSize = (size: MatchSize): string => {
  return String(DEFAULT_GRID_CARDS[size]);
};

export const buildGridOptions = (size: MatchSize): GridOption[] => {
  return GRID_CARD_COUNTS[size].map((cards) => ({
    id: String(cards),
    cards,
    label: String(cards)
  }));
};

export const normalizeGridIdForSize = (size: MatchSize, rawId: string | null | undefined): string => {
  const validIds = new Set(buildGridOptions(size).map((option) => option.id));
  if (!rawId) {
    return defaultGridIdForSize(size);
  }

  const parsedCards = parseGridCards(rawId);
  if (parsedCards !== null) {
    const normalized = String(parsedCards);
    if (validIds.has(normalized)) {
      return normalized;
    }
  }

  return defaultGridIdForSize(size);
};

export const resolveBoardDimensions = (
  totalCards: number,
  viewportWidth?: number,
  viewportHeight?: number
): { rows: number; cols: number } => {
  const hasViewport =
    Boolean(viewportWidth) &&
    Boolean(viewportHeight) &&
    (viewportWidth as number) > 0 &&
    (viewportHeight as number) > 0;

  const targetRatio = hasViewport ? (viewportWidth as number) / (viewportHeight as number) : 1;
  const preferWide = hasViewport ? (viewportWidth as number) >= (viewportHeight as number) : undefined;

  let bestRows = 1;
  let bestCols = totalCards;
  let bestScore = Number.POSITIVE_INFINITY;
  let bestSquareDelta = Number.POSITIVE_INFINITY;

  for (let rows = 1; rows <= Math.sqrt(totalCards); rows += 1) {
    if (totalCards % rows !== 0) {
      continue;
    }

    const cols = totalCards / rows;
    const candidates: Array<{ rows: number; cols: number }> = [
      { rows, cols },
      { rows: cols, cols: rows }
    ];

    for (const candidate of candidates) {
      const ratio = candidate.cols / candidate.rows;
      let score = Math.abs(ratio - targetRatio);
      const squareDelta = Math.abs(candidate.cols - candidate.rows);

      // Force orientation-aware layouts:
      // - wide screens -> more columns than rows
      // - tall screens -> more rows than columns
      if (preferWide === true && candidate.cols < candidate.rows) {
        score += 1000;
      }
      if (preferWide === false && candidate.rows < candidate.cols) {
        score += 1000;
      }

      if (score < bestScore || (score === bestScore && squareDelta < bestSquareDelta)) {
        bestRows = candidate.rows;
        bestCols = candidate.cols;
        bestScore = score;
        bestSquareDelta = squareDelta;
      }
    }
  }

  return { rows: bestRows, cols: bestCols };
};

const parseGridCards = (rawId: string): number | null => {
  const trimmed = rawId.trim();
  if (/^\d+$/.test(trimmed)) {
    const value = Number(trimmed);
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  const legacyMatch = /^(\d+)x(\d+)$/i.exec(trimmed);
  if (!legacyMatch) {
    return null;
  }

  const rows = Number(legacyMatch[1]);
  const cols = Number(legacyMatch[2]);
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows <= 0 || cols <= 0) {
    return null;
  }
  return rows * cols;
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

