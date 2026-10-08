import { Haircut, SaleTransaction, UserProfile, OrderItem, CartItem } from '../types';
import { INITIAL_HAIRCUTS, INITIAL_SALES, DEFAULT_USERS } from '../data/initialData';

const STORAGE_KEYS = {
  HAIRCUTS: 'royal_barber_haircuts_v1',
  SALES: 'royal_barber_sales_v1',
  CURRENT_USER: 'royal_barber_current_user_v1',
  CART: 'royal_barber_cart_v1',
};

export function getStoredHaircuts(): Haircut[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HAIRCUTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HAIRCUTS, JSON.stringify(INITIAL_HAIRCUTS));
      return INITIAL_HAIRCUTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_HAIRCUTS;
  } catch {
    return INITIAL_HAIRCUTS;
  }
}

export function saveStoredHaircuts(haircuts: Haircut[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HAIRCUTS, JSON.stringify(haircuts));
  } catch (err) {
    console.error('Error saving haircuts to storage', err);
  }
}

export function getStoredSales(): SaleTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
      return INITIAL_SALES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SALES;
  } catch {
    return INITIAL_SALES;
  }
}

export function saveStoredSales(sales: SaleTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  } catch (err) {
    console.error('Error saving sales to storage', err);
  }
}

export function getStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS.admin));
      return DEFAULT_USERS.admin;
    }
    const parsed = JSON.parse(raw);
    if (parsed.role === 'admin' && parsed.email === 'admin@barberia.com') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS.admin));
      return DEFAULT_USERS.admin;
    }
    return parsed;
  } catch {
    return DEFAULT_USERS.admin;
  }
}

export function saveStoredUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (err) {
    console.error('Error saving user to storage', err);
  }
}

export function getStoredCart(): OrderItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: any) => ({
      id: item.id || `${item.haircut?.id || 'cut'}-${item.serviceOption || 'corte'}`,
      haircut: item.haircut,
      serviceOption: item.serviceOption || 'corte',
      serviceOptionLabel: item.serviceOptionLabel || 'Corte de cabello',
      unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : (item.haircut?.price || 35000),
      durationMinutes: typeof item.durationMinutes === 'number' ? item.durationMinutes : (item.haircut?.durationMinutes || 40),
      quantity: item.quantity || 1,
      isCombo: !!item.isCombo,
    }));
  } catch {
    return [];
  }
}

export function saveStoredCart(cart: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (err) {
    console.error('Error saving cart to storage', err);
  }
}

export function resetAllDataToDefault(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HAIRCUTS, JSON.stringify(INITIAL_HAIRCUTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS.admin));
    localStorage.removeItem(STORAGE_KEYS.CART);
  } catch (err) {
    console.error('Error resetting data', err);
  }
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}
