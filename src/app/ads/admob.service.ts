import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize, MaxAdContentRating } from '@capacitor-community/admob';

const BANNER_AD_ID = 'ca-app-pub-2750823075008793/3635713707';

@Injectable({ providedIn: 'root' })
export class AdMobService {
  private initialized = false;

  async init(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.initialized) {
      return;
    }

    this.initialized = true;

    try {
      await AdMob.initialize({
        initializeForTesting: true,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
        maxAdContentRating: MaxAdContentRating.General
      });

      await AdMob.showBanner({
        adId: BANNER_AD_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER
      });
    } catch {
      // ignore ad initialization errors
    }
  }
}
