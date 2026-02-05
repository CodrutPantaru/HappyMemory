import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdMobService } from './ads/admob.service';
import { AudioService } from './audio/audio.service';

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
    private readonly audio: AudioService
  ) {}

  ngOnInit(): void {
    this.ads.init();
    this.audio.startMusicIfEnabled();
  }
}
