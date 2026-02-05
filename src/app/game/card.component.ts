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
    // const cols = this.card.spriteColumns as number;
    // const rows = this.card.spriteRows as number;
    // const index = this.card.spriteIndex as number;
    // const col = index % cols;
    // const row = Math.floor(index / cols);
    // const x = cols > 1 ? (col / (cols - 1)) * 100 : 0;
    // const y = rows > 1 ? (row / (rows - 1)) * 100 : 0;
    // return `${x}% ${y}%`;
    const index = this.card.spriteIndex as number;
    switch (index) {
      case 0:
        return '15% 17%';
      default:
      return '51% 17%';
  }
}

  get spriteSize(): string {
    // if (!this.hasSprite) {
    //   return '100% 100%';
    // }
    // const cols = this.card.spriteColumns as number;
    // const rows = this.card.spriteRows as number;
    // return `${cols * 100}% ${rows * 100}%`;
    return '400% 600%';
  }
}
