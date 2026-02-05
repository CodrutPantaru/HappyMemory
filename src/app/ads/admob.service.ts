import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize, MaxAdContentRating } from '@capacitor-community/admob';
import { Subscription } from 'rxjs';
import { PurchaseService } from '../monetization/purchase.service';

const BANNER_AD_ID = 'ca-app-pub-2750823075008793/3635713707';

@Injectable({ providedIn: 'root' })
export class AdMobService {
  private initialized = false;
  private bannerVisible = false;
  private purchaseSubscription?: Subscription;

  constructor(private readonly purchases: PurchaseService) {}

  async init(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await this.purchases.init();

    if (!this.initialized) {
      this.initialized = true;
      try {
        await AdMob.initialize({
          initializeForTesting: true,
          tagForChildDirectedTreatment: true,
          tagForUnderAgeOfConsent: true,
          maxAdContentRating: MaxAdContentRating.General
        });
      } catch {
        // ignore ad initialization errors
        return;
      }
    }

    await this.syncBannerVisibility();

    if (!this.purchaseSubscription) {
      this.purchaseSubscription = this.purchases.state$.subscribe(() => {
        void this.syncBannerVisibility();
      });
    }
  }

  private async syncBannerVisibility(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      if (this.purchases.shouldShowAds()) {
        if (!this.bannerVisible) {
          await AdMob.showBanner({
            adId: BANNER_AD_ID,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER
          });
          this.bannerVisible = true;
        }
        return;
      }

      if (this.bannerVisible) {
        await AdMob.removeBanner();
        this.bannerVisible = false;
      }
    } catch {
      // ignore banner visibility errors
    }
  }
}
