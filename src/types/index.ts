export type UserRole = 'admin' | 'cliente';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  memberSince: string;
}

export type HaircutCategory = 'Fade' | 'Clásico' | 'Moderno' | 'Texturizado' | 'Largo';

export interface Haircut {
  id: string;
  name: string;
  description: string;
  price: number;
  category: HaircutCategory;
  imageUrl: string;
  durationMinutes: number;
  popular?: boolean;
  tags?: string[];
}

export type ServiceOptionKey =
  | 'corte'
  | 'barba'
  | 'shampoo'
  | 'mascarilla'
  | 'combo_corte_shampoo'
  | 'combo_corte_barba'
  | 'combo_corte_barba_shampoo';

export interface OrderItem {
  id: string; // e.g. `${haircut.id}-${serviceOption}`
  haircut: Haircut;
  serviceOption: ServiceOptionKey;
  serviceOptionLabel: string;
  unitPrice: number;
  durationMinutes: number;
  quantity: number;
  isCombo?: boolean;
}

// Keep CartItem for backward compatibility
export type CartItem = OrderItem;

export type PaymentMethod = 'Efectivo' | 'Tarjeta Débito/Crédito' | 'Transferencia Nequi/PSE';

export type TransactionStatus = 'Completado' | 'En proceso' | 'Pendiente';

export interface SaleTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  haircutNames: string[];
  haircutIds: string[];
  date: string; // ISO string or YYYY-MM-DD
  formattedDate: string;
  timestamp: number;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  barber: string;
  status: TransactionStatus;
}

export type ActiveTab = 'auth' | 'catalog' | 'dashboard';
