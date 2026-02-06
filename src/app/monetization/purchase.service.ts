import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CategoryId } from '../game/models';
import { FREE_CATEGORY, PREMIUM_CATEGORY_BY_ID, ProductId } from './pack-catalog';

interface PurchaseState {
  ownedProducts: ProductId[];
}

const PURCHASES_KEY = 'memory-game-purchases-v1';
const BUNDLE_PRODUCT: ProductId = 'bundle_all_access';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly stateSubject = new BehaviorSubject<PurchaseState>({ ownedProducts: [] });
  readonly state$ = this.stateSubject.asObservable();

  async init(): Promise<void> {
    this.restoreFromStorage();
  }

  restorePurchases(): void {
    this.restoreFromStorage();
  }

  get ownedProducts(): ProductId[] {
    return this.stateSubject.value.ownedProducts;
  }

  isOwned(productId: ProductId): boolean {
    return this.ownedProducts.includes(productId) || this.ownedProducts.includes(BUNDLE_PRODUCT);
  }

  isCategoryUnlocked(category: CategoryId): boolean {
    const pack = PREMIUM_CATEGORY_BY_ID[category];
    if (!pack || pack.isFree || !pack.productId) {
      return true;
    }
    return this.isOwned(pack.productId);
  }

  getFallbackCategory(): CategoryId {
    return FREE_CATEGORY;
  }

  shouldShowAds(): boolean {
    return !this.isOwned('remove_ads');
  }

  async purchase(productId: ProductId): Promise<boolean> {
    const next = new Set(this.ownedProducts);
    next.add(productId);
    if (productId === BUNDLE_PRODUCT) {
      next.add('pack_letters');
      next.add('pack_numbers');
      next.add('pack_hospital');
      next.add('pack_utility_cars');
      next.add('remove_ads');
    }
    this.setOwnedProducts([...next]);
    return true;
  }

  private restoreFromStorage(): void {
    try {
      const raw = localStorage.getItem(PURCHASES_KEY);
      if (!raw) {
        this.setOwnedProducts([]);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<PurchaseState>;
      const ownedProducts = Array.isArray(parsed.ownedProducts)
        ? parsed.ownedProducts.filter(this.isKnownProduct)
        : [];
      this.setOwnedProducts(ownedProducts);
    } catch {
      this.setOwnedProducts([]);
    }
  }

  private setOwnedProducts(ownedProducts: ProductId[]): void {
    const nextState: PurchaseState = { ownedProducts: Array.from(new Set(ownedProducts)) };
    this.stateSubject.next(nextState);
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(nextState));
  }

  private readonly isKnownProduct = (id: unknown): id is ProductId => {
    return (
      id === 'pack_letters' ||
      id === 'pack_numbers' ||
      id === 'pack_hospital' ||
      id === 'pack_utility_cars' ||
      id === 'remove_ads' ||
      id === BUNDLE_PRODUCT
    );
  };
}
