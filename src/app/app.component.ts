import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdMobService } from './ads/admob.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: '<router-outlet></router-outlet>',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private readonly ads: AdMobService) {}

  ngOnInit(): void {
    this.ads.init();
  }
}
