/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, Haircut, SaleTransaction, UserProfile, OrderItem, ServiceOptionKey } from './types';
import { computeServiceDetails } from './data/serviceOptions';
import {
  getStoredHaircuts,
  saveStoredHaircuts,
  getStoredSales,
  saveStoredSales,
  getStoredUser,
  saveStoredUser,
  getStoredCart,
  saveStoredCart,
  resetAllDataToDefault,
} from './utils/storage';
import { INITIAL_HAIRCUTS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { AuthBoard } from './components/AuthBoard';
import { CatalogBoard } from './components/CatalogBoard';
import { DashboardBoard } from './components/DashboardBoard';
import { CartDrawer } from './components/CartDrawer';
import { Scissors, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getStoredUser());
  const [haircuts, setHaircuts] = useState<Haircut[]>(() => getStoredHaircuts());
  const [sales, setSales] = useState<SaleTransaction[]>(() => getStoredSales());
  const [cart, setCart] = useState<OrderItem[]>(() => getStoredCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    saveStoredUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStoredHaircuts(haircuts);
  }, [haircuts]);

  useEffect(() => {
    saveStoredSales(sales);
  }, [sales]);

  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  // Order operations with service options & combos
  const handleAddToCart = (
    haircut: Haircut,
    optionKey: ServiceOptionKey = 'corte',
    quantity: number = 1
  ) => {
    const details = computeServiceDetails(haircut, optionKey);
    const itemId = `${haircut.id}-${optionKey}`;

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === itemId || (item.haircut.id === haircut.id && item.serviceOption === optionKey)
      );
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const newItem: OrderItem = {
        id: itemId,
        haircut,
        serviceOption: optionKey,
        serviceOptionLabel: details.label,
        unitPrice: details.price,
        durationMinutes: details.duration,
        quantity,
        isCombo: details.category === 'combo',
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId || item.haircut.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId && item.haircut.id !== itemId));
  };

  const handleChangeItemOption = (itemId: string, newOption: ServiceOptionKey) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId || item.haircut.id === itemId) {
          const details = computeServiceDetails(item.haircut, newOption);
          return {
            ...item,
            id: `${item.haircut.id}-${newOption}`,
            serviceOption: newOption,
            serviceOptionLabel: details.label,
            unitPrice: details.price,
            durationMinutes: details.duration,
            isCombo: details.category === 'combo',
          };
        }
        return item;
      })
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Checkout completion -> updates sales in realtime!
  const handleCompleteSale = (transaction: SaleTransaction) => {
    setSales((prev) => [transaction, ...prev]);
  };

  // Catalog management (Admin)
  const handleSaveHaircut = (savedCut: Haircut) => {
    setHaircuts((prev) => {
      const idx = prev.findIndex((c) => c.id === savedCut.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedCut;
        return updated;
      }
      return [savedCut, ...prev];
    });
  };

  const handleDeleteHaircut = (id: string) => {
    setHaircuts((prev) => prev.filter((c) => c.id !== id));
    // Also remove from cart if present
    setCart((prev) => prev.filter((item) => item.haircut.id !== id));
  };

  const handleResetCatalog = () => {
    if (window.confirm('¿Deseas restablecer el catálogo a los 10 cortes de cabello originales?')) {
      setHaircuts(INITIAL_HAIRCUTS);
      saveStoredHaircuts(INITIAL_HAIRCUTS);
    }
  };

  const totalOrderCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      
      {/* Universal Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogoutOrSwitch={() => setActiveTab('auth')}
        orderCount={totalOrderCount}
        onOpenOrder={() => setIsCartOpen(true)}
      />

      {/* Main Boards Viewport */}
      <main className="flex-1 pb-16">
        {activeTab === 'auth' && (
          <AuthBoard
            currentUser={currentUser}
            onSelectUser={(user) => setCurrentUser(user)}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogBoard
            haircuts={haircuts}
            currentUser={currentUser}
            orderItems={cart}
            onAddToOrder={handleAddToCart}
            onSaveHaircut={handleSaveHaircut}
            onDeleteHaircut={handleDeleteHaircut}
            onResetCatalog={handleResetCatalog}
            onOpenOrder={() => setIsCartOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardBoard
            sales={sales}
            haircuts={haircuts}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}
      </main>

      {/* Interactive Service Order Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onChangeItemOption={handleChangeItemOption}
        currentUser={currentUser}
        onCompleteSale={handleCompleteSale}
        onNavigateToDashboard={() => setActiveTab('dashboard')}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Scissors className="w-3 h-3" />
            </div>
            <span className="font-semibold text-neutral-300">Barbería Royal Classic</span>
            <span>· Sistema de Ventas & CRM Comercial</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Perfil activo: <strong className="text-neutral-300">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})</span>
            <button
              onClick={() => setActiveTab('auth')}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Cambiar de Perfil
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
