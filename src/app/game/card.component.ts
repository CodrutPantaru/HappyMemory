import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from './models';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="card"
      [class.revealed]="card.state !== 'hidden'"
      [class.matched]="card.state === 'matched'"
      [disabled]="disabled || card.state === 'matched'"
      (click)="handleClick()"
      aria-label="card"
    >
      <div class="card-inner">
        <div class="card-face card-front">
          <img class="card-image back" src="assets/cards/animals/back-card.png" alt="Back card" />
        </div>
        <div class="card-face card-back">
          <ng-container *ngIf="card.imageUrl; else textContent">
            <img class="card-image" [src]="card.imageUrl" [alt]="card.display" />
          </ng-container>
          <ng-template #textContent>{{ card.display }}</ng-template>
        </div>
      </div>
    </button>
  `,
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input({ required: true }) card!: Card;
  @Input() disabled = false;
  @Output() reveal = new EventEmitter<Card>();

  handleClick(): void {
    if (this.card) {
      this.reveal.emit(this.card);
    }
  }
}
