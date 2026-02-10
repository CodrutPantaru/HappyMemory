import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Card } from './models';

@Component({
    selector: 'app-card',
    standalone: true,
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
          @if (hasSprite) {
            <div
              class="card-sprite"
              [style.backgroundImage]="'url(' + card.imageUrl + ')'"
              [style.backgroundPosition]="spritePosition"
              [style.backgroundSize]="spriteSize"
            ></div>
          } @else if (card.imageUrl) {
            <img class="card-image" [src]="card.imageUrl" [alt]="card.display" [class.animal-image]="card.imageUrl.includes('/animals/')"/>
          } @else {
            {{ card.display }}
          }
        </div>
      </div>
    </button>
    `,
    styleUrl: './card.component.scss'
})
export class CardComponent{
  @Input({ required: true }) card!: Card;
  @Input({ required: true }) backImageUrl!: string;
  @Input() disabled = false;
  @Output() reveal = new EventEmitter<Card>();

  handleClick(): void {
    if (this.card) {
      this.reveal.emit(this.card);
    }
  }

  get hasSprite(): boolean {
    return (
      typeof this.card.spriteIndex === 'number' &&
      typeof this.card.spriteColumns === 'number' &&
      typeof this.card.spriteRows === 'number' &&
      !!this.card.imageUrl
    );
  }

  get spritePosition(): string {
    if (!this.hasSprite) {
      return '0% 0%';
    }
    const index = this.card.spriteIndex as number;
    const positions = [
      '15% 17%', '51% 17%', '85% 17%',
      '15% 39%', '51% 39%', '85% 39%',
      '15% 61%', '51% 61%', '88% 61%',
      '15% 83%', '51% 83%', '87% 83%'
    ];
    return positions[index] || positions[0];
}

  get spriteSize(): string {
    return '400% 600%';
  }
}
