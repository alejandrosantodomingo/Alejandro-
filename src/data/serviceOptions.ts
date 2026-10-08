import { Haircut, ServiceOptionKey } from '../types';

export interface ServiceOptionDefinition {
  key: ServiceOptionKey;
  label: string;
  category: 'individual' | 'combo';
  description: string;
  getPrice: (basePrice: number) => number;
  getDuration: (baseDuration: number) => number;
  badge?: string;
  iconType: 'corte' | 'barba' | 'shampoo' | 'mascarilla' | 'combo';
}

export const SERVICE_OPTIONS: ServiceOptionDefinition[] = [
  // OPCIONES INDIVIDUALES
  {
    key: 'corte',
    label: 'Corte de cabello',
    category: 'individual',
    description: 'Corte de cabello personalizado con técnica de tijera o máquina y acabado profesional.',
    getPrice: (basePrice) => basePrice,
    getDuration: (baseDuration) => baseDuration,
    iconType: 'corte',
  },
  {
    key: 'barba',
    label: 'Barba',
    category: 'individual',
    description: 'Perfilado y arreglo de barba con toalla caliente, navaja desechable y bálsamo hidratante.',
    getPrice: () => 18000,
    getDuration: () => 25,
    iconType: 'barba',
  },
  {
    key: 'shampoo',
    label: 'Shampoo',
    category: 'individual',
    description: 'Lavado capilar profundo con shampoo exfoliante premium y masaje capilar estimulante.',
    getPrice: () => 12000,
    getDuration: () => 15,
    iconType: 'shampoo',
  },
  {
    key: 'mascarilla',
    label: 'Mascarilla',
    category: 'individual',
    description: 'Mascarilla facial purificante de carbón activado para puntos negros o mascarilla capilar nutritiva.',
    getPrice: () => 15000,
    getDuration: () => 20,
    iconType: 'mascarilla',
  },

  // OPCIONES EN COMBO
  {
    key: 'combo_corte_shampoo',
    label: 'Corte + shampoo',
    category: 'combo',
    description: 'Corte de autor más lavado capilar completo con shampoo premium y masaje refrescante.',
    getPrice: (basePrice) => basePrice + 8000, // Ahorro de $4.000 vs individual
    getDuration: (baseDuration) => baseDuration + 10,
    badge: 'Ahorro $4.000',
    iconType: 'combo',
  },
  {
    key: 'combo_corte_barba',
    label: 'Corte + barba',
    category: 'combo',
    description: 'Corte de cabello y ritual completo de barba con toalla caliente, perfilado y aceites.',
    getPrice: (basePrice) => basePrice + 14000, // Ahorro de $4.000 vs individual
    getDuration: (baseDuration) => baseDuration + 20,
    badge: 'Popular',
    iconType: 'combo',
  },
  {
    key: 'combo_corte_barba_shampoo',
    label: 'Corte + barba + shampoo',
    category: 'combo',
    description: 'La experiencia completa: corte de cabello, ritual de barba con toalla caliente y lavado con shampoo.',
    getPrice: (basePrice) => basePrice + 20000, // Ahorro de $10.000 vs individuales
    getDuration: (baseDuration) => baseDuration + 30,
    badge: 'Super Combo',
    iconType: 'combo',
  },
];

export function getServiceOptionByKey(key: ServiceOptionKey): ServiceOptionDefinition {
  const found = SERVICE_OPTIONS.find((opt) => opt.key === key);
  return found || SERVICE_OPTIONS[0];
}

export function computeServiceDetails(haircut: Haircut, optionKey: ServiceOptionKey) {
  const def = getServiceOptionByKey(optionKey);
  const price = def.getPrice(haircut.price);
  const duration = def.getDuration(haircut.durationMinutes);
  return {
    key: def.key,
    label: def.label,
    category: def.category,
    price,
    duration,
    description: def.description,
    badge: def.badge,
    fullName: `${haircut.name} (${def.label})`,
  };
}
