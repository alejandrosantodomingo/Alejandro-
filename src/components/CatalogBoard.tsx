import React, { useState } from 'react';
import { Haircut, UserProfile, OrderItem, ServiceOptionKey } from '../types';
import { formatCurrency } from '../utils/storage';
import { ImageWithFallback } from './ImageWithFallback';
import { HaircutModal } from './HaircutModal';
import { ServiceOrderModal } from './ServiceOrderModal';
import { SERVICE_OPTIONS, computeServiceDetails, getServiceOptionByKey } from '../data/serviceOptions';
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  ClipboardList,
  Search,
  Check,
  RotateCcw,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  Layers
} from 'lucide-react';

interface CatalogBoardProps {
  haircuts: Haircut[];
  currentUser: UserProfile;
  orderItems: OrderItem[];
  onAddToOrder: (haircut: Haircut, optionKey?: ServiceOptionKey, quantity?: number) => void;
  onSaveHaircut: (haircut: Haircut) => void;
  onDeleteHaircut: (id: string) => void;
  onResetCatalog: () => void;
  onOpenOrder: () => void;
}

export const CatalogBoard: React.FC<CatalogBoardProps> = ({
  haircuts,
  currentUser,
  orderItems,
  onAddToOrder,
  onSaveHaircut,
  onDeleteHaircut,
  onResetCatalog,
  onOpenOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isHaircutModalOpen, setIsHaircutModalOpen] = useState(false);
  const [haircutToEdit, setHaircutToEdit] = useState<Haircut | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Haircut | null>(null);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  // Service Order Configurator Modal state
  const [modalHaircut, setModalHaircut] = useState<Haircut | null>(null);
  const [modalInitialOption, setModalInitialOption] = useState<ServiceOptionKey>('corte');
  const [isServiceOrderModalOpen, setIsServiceOrderModalOpen] = useState(false);

  // Per-card selected option state (defaults to 'corte')
  const [cardSelectedOption, setCardSelectedOption] = useState<Record<string, ServiceOptionKey>>({});

  const categories = ['Todos', 'Fade', 'Clásico', 'Moderno', 'Texturizado', 'Largo'];

  const filteredHaircuts = haircuts.filter((cut) => {
    const matchesSearch =
      cut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cut.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Todos' || cut.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSelectedOptionForCut = (cutId: string): ServiceOptionKey => {
    return cardSelectedOption[cutId] || 'corte';
  };

  const handleCardOptionChange = (cutId: string, optionKey: ServiceOptionKey) => {
    setCardSelectedOption((prev) => ({
      ...prev,
      [cutId]: optionKey,
    }));
  };

  const handleGenerateDirectOrder = (haircut: Haircut) => {
    const optionKey = getSelectedOptionForCut(haircut.id);
    onAddToOrder(haircut, optionKey, 1);
    const animKey = `${haircut.id}-${optionKey}`;
    setAddedAnimationId(animKey);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1300);
  };

  const handleOpenConfigModal = (haircut: Haircut, optionKey?: ServiceOptionKey) => {
    setModalHaircut(haircut);
    setModalInitialOption(optionKey || getSelectedOptionForCut(haircut.id));
    setIsServiceOrderModalOpen(true);
  };

  const handleConfirmModalOrder = (
    haircut: Haircut,
    optionKey: ServiceOptionKey,
    quantity: number,
    openDrawer?: boolean
  ) => {
    onAddToOrder(haircut, optionKey, quantity);
    const animKey = `${haircut.id}-${optionKey}`;
    setAddedAnimationId(animKey);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1300);
    if (openDrawer) {
      onOpenOrder();
    }
  };

  const openCreateModal = () => {
    setHaircutToEdit(null);
    setIsHaircutModalOpen(true);
  };

  const openEditModal = (haircut: Haircut) => {
    setHaircutToEdit(haircut);
    setIsHaircutModalOpen(true);
  };

  const getOrderQuantity = (cutId: string) => {
    return orderItems
      .filter((item) => item.haircut.id === cutId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const totalServicesInOrder = orderItems.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Editorial Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase">
            <Scissors className="w-4 h-4" />
            <span>Tablero 2: Catálogo de Servicios & Orden de Pedido</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-100">
            Catálogo Comercial de Cortes
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl">
            Genera una orden de pedido para cada producto seleccionando entre servicios individuales (<strong>Corte, Barba, Shampoo, Mascarilla</strong>) o en combo (<strong>Corte + shampoo, Corte + barba, Corte + barba + shampoo</strong>).
          </p>
        </div>

        {/* Header Actions */}
        {currentUser.role === 'admin' ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onResetCatalog}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Restablecer los 10 cortes iniciales"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer 10 Cortes</span>
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cargar Nuevo Corte</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenOrder}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-100 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <span>Ver Orden de Pedido ({totalServicesInOrder})</span>
            </button>
          </div>
        )}
      </div>

      {/* Services and Combos Visual Guide Banner */}
      <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Opciones Disponibles para Cada Producto / Corte</span>
          </div>
          <span className="text-[11px] text-amber-400 font-mono hidden sm:inline">
            Personaliza en cada tarjeta o en el modal de orden
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Individual services badge strip */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scissors className="w-3 h-3 text-amber-400" />
              <span>Servicios Individuales:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-medium">
                ✂️ Corte de cabello
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-medium">
                🧔 Barba
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-medium">
                🧴 Shampoo
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-medium">
                🧖 Mascarilla
              </span>
            </div>
          </div>

          {/* Combos badge strip */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Opciones en Combo (Con Ahorro):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                ✂️🧴 Corte + shampoo
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                ✂️🧔 Corte + barba
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                ✂️🧔🧴 Corte + barba + shampoo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notice Bar */}
      {currentUser.role === 'admin' && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Modo Administrador Activo:</strong> Tienes permisos para editar precios, descripciones e imágenes, cargar nuevos productos o eliminar referencias.
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[11px] bg-amber-500/20 px-2 py-0.5 rounded">
            {haircuts.length} referencias registradas
          </span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar corte por estilo o técnica..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-neutral-900/90 rounded-xl border border-neutral-800 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid (10 Haircuts with options & combos) */}
      {filteredHaircuts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <Scissors className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-neutral-200">No se encontraron estilos</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No hay cortes de cabello que coincidan con &ldquo;{searchQuery}&rdquo; en la categoría {selectedCategory}.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todos');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredHaircuts.map((cut) => {
            const inOrderTotal = getOrderQuantity(cut.id);
            const selectedOptKey = getSelectedOptionForCut(cut.id);
            const serviceDetails = computeServiceDetails(cut, selectedOptKey);
            const isJustAdded = addedAnimationId === `${cut.id}-${selectedOptKey}`;

            return (
              <div
                key={cut.id}
                className="group rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-xl"
              >
                {/* Image Container with Fallback */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
                  <ImageWithFallback
                    src={cut.imageUrl}
                    alt={cut.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallbackTitle={cut.name}
                    fallbackCategory={cut.category}
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-90 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-950/80 text-amber-400 border border-neutral-800/80 backdrop-blur-sm">
                      {cut.category}
                    </span>

                    {cut.popular && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-neutral-950 flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" /> Popular
                      </span>
                    )}
                  </div>

                  {/* Duration pill at bottom left */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-neutral-300 font-medium">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>~{serviceDetails.duration} min estimado</span>
                  </div>

                  {/* In Order Indicator */}
                  {inOrderTotal > 0 && (
                    <div className="absolute bottom-2.5 right-3 text-[11px] font-bold bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" />
                      <span>{inOrderTotal} en orden</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* Name and description */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-neutral-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {cut.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleOpenConfigModal(cut)}
                        className="text-neutral-400 hover:text-amber-400 p-1 transition-colors cursor-pointer shrink-0"
                        title="Ver detalles de combos y opciones"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {cut.description}
                    </p>
                  </div>

                  {/* SERVICE OPTION SELECTOR (Individual vs Combo) */}
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-neutral-300 flex items-center gap-1">
                        <span>Modalidad de Orden:</span>
                      </span>
                      {serviceDetails.badge ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          {serviceDetails.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500">
                          {serviceDetails.category === 'combo' ? 'Paquete Promo' : 'Individual'}
                        </span>
                      )}
                    </div>

                    {/* Dropdown with all 7 options grouped by Individual & Combo */}
                    <div className="relative">
                      <select
                        value={selectedOptKey}
                        onChange={(e) =>
                          handleCardOptionChange(cut.id, e.target.value as ServiceOptionKey)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 text-xs text-neutral-100 font-medium outline-none cursor-pointer appearance-none pr-8"
                      >
                        <optgroup label="── SERVICIOS INDIVIDUALES ──">
                          <option value="corte">✂️ Corte de cabello ({formatCurrency(cut.price)})</option>
                          <option value="barba">🧔 Barba ({formatCurrency(18000)})</option>
                          <option value="shampoo">🧴 Shampoo ({formatCurrency(12000)})</option>
                          <option value="mascarilla">🧖 Mascarilla ({formatCurrency(15000)})</option>
                        </optgroup>
                        <optgroup label="── OPCIONES EN COMBO ──">
                          <option value="combo_corte_shampoo">
                            ✂️🧴 Corte + shampoo ({formatCurrency(cut.price + 8000)})
                          </option>
                          <option value="combo_corte_barba">
                            ✂️🧔 Corte + barba ({formatCurrency(cut.price + 14000)})
                          </option>
                          <option value="combo_corte_barba_shampoo">
                            ✂️🧔🧴 Corte + barba + shampoo ({formatCurrency(cut.price + 20000)})
                          </option>
                        </optgroup>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Quick helper note */}
                    <p className="text-[10px] text-neutral-400 truncate">
                      {serviceDetails.description}
                    </p>
                  </div>

                  {/* Price & Generate Order Button */}
                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">
                        Tarifa Orden
                      </span>
                      <span className="text-base font-extrabold text-amber-400 tabular-nums">
                        {formatCurrency(serviceDetails.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Detailed Configurator Modal trigger */}
                      <button
                        type="button"
                        onClick={() => handleOpenConfigModal(cut, selectedOptKey)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer border border-neutral-700/60"
                        title="Ver comparativa completa de combos"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {/* Direct Add / Generate Order */}
                      <button
                        onClick={() => handleGenerateDirectOrder(cut)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isJustAdded
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
                            : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-950/40 hover:scale-102'
                        }`}
                        title="Generar orden de pedido con esta opción"
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Generada!</span>
                          </>
                        ) : (
                          <>
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>Generar Orden</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  {currentUser.role === 'admin' && (
                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditModal(cut)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 border border-neutral-700/60 cursor-pointer"
                        title="Modificar precio, nombre o imagen"
                      >
                        <Edit2 className="w-3 h-3 text-amber-400" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => setItemToDelete(cut)}
                        className="py-1.5 px-2.5 rounded-lg bg-neutral-800 hover:bg-rose-950 hover:text-rose-300 text-neutral-400 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 border border-neutral-700/60 hover:border-rose-800 cursor-pointer"
                        title="Eliminar este corte del catálogo"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Add Haircut Button for Admin */}
      {currentUser.role === 'admin' && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs uppercase tracking-wider shadow-2xl shadow-amber-950/80 transition-all hover:scale-105 cursor-pointer border border-amber-300/40"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Cargar Nuevo Corte</span>
          </button>
        </div>
      )}

      {/* Haircut Edit/Add Modal */}
      <HaircutModal
        isOpen={isHaircutModalOpen}
        onClose={() => setIsHaircutModalOpen(false)}
        haircutToEdit={haircutToEdit}
        onSaveHaircut={onSaveHaircut}
      />

      {/* Service Order Options & Combos Modal */}
      <ServiceOrderModal
        isOpen={isServiceOrderModalOpen}
        onClose={() => setIsServiceOrderModalOpen(false)}
        haircut={modalHaircut}
        initialOption={modalInitialOption}
        onConfirmOrder={handleConfirmModalOrder}
      />

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-neutral-100">¿Eliminar del Catálogo?</h3>
              <p className="text-xs text-neutral-400">
                Estás a punto de eliminar <strong className="text-neutral-200">{itemToDelete.name}</strong>. Esta acción no se puede deshacer de forma automática.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteHaircut(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-md"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
