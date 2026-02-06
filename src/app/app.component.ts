import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdMobService } from './ads/admob.service';
import { AudioService } from './audio/audio.service';
import { PurchaseService } from './monetization/purchase.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    template: '<router-outlet></router-outlet>',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly preventDefaultHandler = (event: Event): void => {
    event.preventDefault();
  };

  constructor(
    private readonly ads: AdMobService,
    private readonly audio: AudioService,
    private readonly purchases: PurchaseService
  ) {}

  ngOnInit(): void {
    document.addEventListener('contextmenu', this.preventDefaultHandler);
    document.addEventListener('dragstart', this.preventDefaultHandler);
    document.addEventListener('selectstart', this.preventDefaultHandler);
    this.ads.init();
    void this.purchases.init();
    void this.ads.init();
    this.audio.startMusicIfEnabled();
  }

  ngOnDestroy(): void {
    document.removeEventListener('contextmenu', this.preventDefaultHandler);
    document.removeEventListener('dragstart', this.preventDefaultHandler);
    document.removeEventListener('selectstart', this.preventDefaultHandler);
  }
}
