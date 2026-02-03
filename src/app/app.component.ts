import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdMobService } from './ads/admob.service';
import { GoogleAuthService } from './auth/google-auth.service';

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
    private readonly auth: GoogleAuthService
  ) {}

  ngOnInit(): void {
    this.ads.init();
    this.auth.init();
  }
}
