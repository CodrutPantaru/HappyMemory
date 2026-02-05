import { Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  constructor(
    private readonly ads: AdMobService,
    private readonly audio: AudioService,
    private readonly purchases: PurchaseService
  ) {}

  ngOnInit(): void {
    void this.purchases.init();
    void this.ads.init();
    this.audio.startMusicIfEnabled();
  }
}
