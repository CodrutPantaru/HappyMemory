import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoryId } from '../game/models';
import { I18nService } from '../i18n/i18n.service';
import { GameHistoryEntry, GameHistoryService } from './game-history.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  readonly categoryLabelKey: Record<CategoryId, string> = {
    animals: 'category.animals',
    letters: 'category.letters',
    numbers: 'category.numbers',
    hospital: 'category.hospital',
    'utility-cars': 'category.utilityCars'
  };

  topScore: number | null = null;
  recentGames: GameHistoryEntry[] = [];

  constructor(
    public readonly i18n: I18nService,
    private readonly history: GameHistoryService
  ) {}

  ngOnInit(): void {
    const snapshot = this.history.getSnapshot();
    this.topScore = snapshot.topScore;
    this.recentGames = snapshot.recentGames;
  }

  matchSizeLabel(size: 2 | 3 | 4): string {
    return this.i18n.t('settings.matchCount', { count: size });
  }

  historyCategoryLabel(entry: GameHistoryEntry): string {
    return entry.categories
      .map((category) => this.i18n.t(this.categoryLabelKey[category]))
      .join(', ');
  }

  historyPlayedAt(entry: GameHistoryEntry): string {
    return new Intl.DateTimeFormat(this.i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(entry.playedAt));
  }
}
