import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Card } from './models';

@Component({
    selector: 'app-card',
    imports: [],
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
          <img class="card-image back" [src]="backImageUrl" alt="Back card" />
        </div>
        <div class="card-face card-back">
          @if (card.imageUrl) {
            <img class="card-image" [src]="card.imageUrl" [alt]="card.display" />
          } @else {
            {{ card.display }}
          }
        </div>
      </div>
    </button>
    `,
    styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input({ required: true }) card!: Card;
  @Input({ required: true }) backImageUrl!: string;
  @Input() disabled = false;
  @Output() reveal = new EventEmitter<Card>();

  handleClick(): void {
    if (this.card) {
      this.reveal.emit(this.card);
    }
  }
}
