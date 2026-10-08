import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { Scissors, ClipboardList, BarChart3, Users, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  onLogoutOrSwitch: () => void;
  orderCount: number;
  onOpenOrder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogoutOrSwitch,
  orderCount,
  onOpenOrder,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* ZONE 1: BRAND ZONE */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-neutral-950 shadow-md shadow-amber-950/30 group-hover:scale-105 transition-transform">
                <Scissors className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-lg text-neutral-100 group-hover:text-amber-400 transition-colors">
                  ROYAL CLASSIC
                </span>
                <span className="text-[10px] tracking-widest text-neutral-400 uppercase font-medium">
                  Barbershop CRM & POS
                </span>
              </div>
            </button>
          </div>

          {/* ZONE 2: 3 BOARDS NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/90 p-1.5 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('auth')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'auth'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Tablero 1: Roles & CRM</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Tablero 2: Catálogo & Orden de Pedido</span>
              {orderCount > 0 && (
                <span className="bg-amber-500 text-neutral-950 font-bold px-1.5 py-0.2 rounded-full text-[10px] tabular-nums">
                  {orderCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Tablero 3: Analítica & Informes</span>
            </button>
          </nav>

          {/* ZONE 3: ACTIVE SESSION & ACTIONS */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Order trigger button */}
            <button
              onClick={onOpenOrder}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 text-neutral-200 hover:text-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Ver Orden de Pedido / Turno de Servicio"
            >
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium hidden sm:inline">Orden de Pedido</span>
              {orderCount > 0 ? (
                <span className="ml-1 bg-amber-500 text-neutral-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center tabular-nums shadow-sm animate-pulse">
                  {orderCount}
                </span>
              ) : (
                <span className="text-[11px] text-neutral-500 hidden sm:inline tabular-nums">0</span>
              )}
            </button>

            {/* User Profile Capsule */}
            <div className="flex items-center gap-2.5 pl-2 py-1 pr-1 bg-neutral-900/80 border border-neutral-800 rounded-xl">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover border border-neutral-700"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-neutral-900 ${
                    currentUser.role === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  title={currentUser.role === 'admin' ? 'Administrador' : 'Cliente'}
                />
              </div>

              <div className="hidden lg:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-neutral-200 truncate max-w-[130px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {currentUser.role === 'admin' ? 'Admin' : 'Cliente'}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 truncate max-w-[140px]">
                  {currentUser.email}
                </span>
              </div>

              {/* Quick switch button */}
              <button
                onClick={onLogoutOrSwitch}
                className="p-2 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title="Cambiar de Perfil / Iniciar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-neutral-900 no-scrollbar">
          <button
            onClick={() => setActiveTab('auth')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === 'auth'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 bg-neutral-900 border border-neutral-800'
            }`}
          >
            Tablero 1: Roles & CRM
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 bg-neutral-900 border border-neutral-800'
            }`}
          >
            Tablero 2: Orden ({orderCount})
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 bg-neutral-900 border border-neutral-800'
            }`}
          >
            Tablero 3: Analítica
          </button>
        </div>
      </div>
    </header>
  );
};
