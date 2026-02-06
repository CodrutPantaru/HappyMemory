import { CategoryId } from '../game/models';

export type ProductId =
  | 'pack_letters'
  | 'pack_numbers'
  | 'pack_hospital'
  | 'pack_utility_cars'
  | 'remove_ads'
  | 'bundle_all_access';

export interface CategoryPack {
  category: CategoryId;
  productId: ProductId | null;
  isFree: boolean;
  priceLabel: string;
}

export interface PremiumProduct {
  id: ProductId;
  priceLabel: string;
}

export const CATEGORY_PACKS: CategoryPack[] = [
  { category: 'animals', productId: null, isFree: true, priceLabel: 'Free' },
  { category: 'letters', productId: null, isFree: true, priceLabel: 'Free' },
  { category: 'numbers', productId: null, isFree: true, priceLabel: 'Free' },
  { category: 'hospital', productId: null, isFree: true, priceLabel: 'Free' },
  { category: 'utility-cars', productId: null, isFree: true, priceLabel: 'Free' }
];

export const PREMIUM_PRODUCTS: PremiumProduct[] = [
  { id: 'pack_letters', priceLabel: 'EUR 2.99' },
  { id: 'pack_numbers', priceLabel: 'EUR 2.99' },
  { id: 'pack_hospital', priceLabel: 'EUR 3.99' },
  { id: 'pack_utility_cars', priceLabel: 'EUR 3.99' },
  { id: 'remove_ads', priceLabel: 'EUR 1.99' },
  { id: 'bundle_all_access', priceLabel: 'EUR 7.99' }
];

export const FREE_CATEGORY: CategoryId =
  CATEGORY_PACKS.find((pack) => pack.isFree)?.category ?? 'animals';

const animalsPack = CATEGORY_PACKS.find((pack) => pack.category === 'animals');
const lettersPack = CATEGORY_PACKS.find((pack) => pack.category === 'letters');
const numbersPack = CATEGORY_PACKS.find((pack) => pack.category === 'numbers');
const hospitalPack = CATEGORY_PACKS.find((pack) => pack.category === 'hospital');
const utilityCarsPack = CATEGORY_PACKS.find((pack) => pack.category === 'utility-cars');

if (!animalsPack || !lettersPack || !numbersPack || !hospitalPack || !utilityCarsPack) {
  throw new Error('Category pack catalog is incomplete.');
}

export const PREMIUM_CATEGORY_BY_ID: Record<CategoryId, CategoryPack> = {
  animals: animalsPack,
  letters: lettersPack,
  numbers: numbersPack,
  hospital: hospitalPack,
  'utility-cars': utilityCarsPack
};
