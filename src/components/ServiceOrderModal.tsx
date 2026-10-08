import React, { useState, useEffect } from 'react';
import { Haircut, ServiceOptionKey } from '../types';
import { SERVICE_OPTIONS, computeServiceDetails, getServiceOptionByKey } from '../data/serviceOptions';
import { formatCurrency } from '../utils/storage';
import { ImageWithFallback } from './ImageWithFallback';
import {
  X,
  Check,
  Scissors,
  Sparkles,
  Clock,
  ClipboardList,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  Zap
} from 'lucide-react';

interface ServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  haircut: Haircut | null;
  initialOption?: ServiceOptionKey;
  onConfirmOrder: (haircut: Haircut, optionKey: ServiceOptionKey, quantity: number, openDrawer?: boolean) => void;
}

export const ServiceOrderModal: React.FC<ServiceOrderModalProps> = ({
  isOpen,
  onClose,
  haircut,
  initialOption = 'corte',
  onConfirmOrder,
}) => {
  const [selectedOption, setSelectedOption] = useState<ServiceOptionKey>(initialOption);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'combo'>('all');

  useEffect(() => {
    if (haircut) {
      setSelectedOption(initialOption || 'corte');
      setQuantity(1);
      setActiveTab('all');
    }
  }, [haircut, initialOption, isOpen]);

  if (!isOpen || !haircut) return null;

  const currentDetails = computeServiceDetails(haircut, selectedOption);
  const totalPrice = currentDetails.price * quantity;
  const totalDuration = currentDetails.duration * quantity;

  const individualOptions = SERVICE_OPTIONS.filter((opt) => opt.category === 'individual');
  const comboOptions = SERVICE_OPTIONS.filter((opt) => opt.category === 'combo');

  const handleAddAndClose = (openDrawer: boolean = false) => {
    onConfirmOrder(haircut, selectedOption, quantity, openDrawer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Generar Orden de Servicio / Pedido
              </h3>
              <p className="text-[11px] text-neutral-400">
                Elige entre servicio individual o paquete en combo para la barbería
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Haircut mini banner */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-neutral-800">
            <ImageWithFallback
              src={haircut.imageUrl}
              alt={haircut.name}
              className="w-full h-full object-cover"
              fallbackTitle={haircut.name}
              fallbackCategory={haircut.category}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {haircut.category}
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                Base corte: {formatCurrency(haircut.price)}
              </span>
            </div>
            <h4 className="text-sm font-bold text-neutral-100 truncate mt-0.5">
              {haircut.name}
            </h4>
            <p className="text-xs text-neutral-400 line-clamp-1">
              {haircut.description}
            </p>
          </div>
        </div>

        {/* Category Tabs: Todos / Individuales / Combos */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'all'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Todas las Opciones ({SERVICE_OPTIONS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'individual'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Servicios Individuales (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('combo')}
            className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 ${
              activeTab === 'combo'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Combos Especiales (3)</span>
          </button>
        </div>

        {/* Options list container */}
        <div className="space-y-4">
          
          {/* 1. SECCIÓN SERVICIOS INDIVIDUALES */}
          {(activeTab === 'all' || activeTab === 'individual') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>Servicios Individuales</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-normal">
                  Corte · Barba · Shampoo · Mascarilla
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {individualOptions.map((opt) => {
                  const isSelected = selectedOption === opt.key;
                  const price = opt.getPrice(haircut.price);
                  const duration = opt.getDuration(haircut.durationMinutes);

                  return (
                    <button
                      type="button"
                      key={opt.key}
                      onClick={() => setSelectedOption(opt.key)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/80 ring-1 ring-amber-500/40 text-neutral-100'
                          : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            {isSelected ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-neutral-700 shrink-0" />
                            )}
                            <span>{opt.label}</span>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/60 text-xs">
                        <span className="text-neutral-400 text-[11px] flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          {duration} min
                        </span>
                        <span className="font-extrabold text-amber-400 font-mono">
                          {formatCurrency(price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. SECCIÓN COMBOS ESPECIALES */}
          {(activeTab === 'all' || activeTab === 'combo') && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Opciones en Combo (Paquetes con Descuento)</span>
                </span>
                <span className="text-[10px] text-amber-400/80 font-normal">
                  Mejor tarifa por combinación
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {comboOptions.map((opt) => {
                  const isSelected = selectedOption === opt.key;
                  const price = opt.getPrice(haircut.price);
                  const duration = opt.getDuration(haircut.durationMinutes);

                  return (
                    <button
                      type="button"
                      key={opt.key}
                      onClick={() => setSelectedOption(opt.key)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500/15 via-amber-950/20 to-neutral-900 border-amber-500 ring-2 ring-amber-500/30'
                          : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-neutral-700 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-neutral-100">
                            {opt.label}
                          </span>
                        </div>

                        {opt.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-neutral-950 shadow-sm shrink-0">
                            {opt.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-neutral-400 mt-1 pl-6 leading-relaxed">
                        {opt.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 pl-6 text-xs">
                        <span className="text-neutral-400 text-[11px] flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-amber-400" />
                          ~{duration} min tiempo total de atención
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-amber-400 text-sm font-mono tabular-nums">
                            {formatCurrency(price)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Quantity selector & Live Total */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[11px] text-neutral-400 font-medium">Servicio Seleccionado:</span>
            <div className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
              <span className="text-amber-400">{currentDetails.label}</span>
              <span className="text-neutral-500">·</span>
              <span className="font-normal text-neutral-400">{haircut.name}</span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">
              Estimado: {totalDuration} min de sillón
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-5">
            {/* Quantity */}
            <div className="flex items-center gap-2 bg-neutral-900 px-2.5 py-1.5 rounded-lg border border-neutral-800">
              <span className="text-[11px] text-neutral-400 mr-1">Turnos:</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-5 h-5 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-neutral-100 px-1 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-5 h-5 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Total */}
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Total Orden</span>
              <span className="text-base font-extrabold text-amber-400 font-mono tabular-nums">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={() => handleAddAndClose(false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Añadir a la Orden</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddAndClose(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold text-neutral-950 bg-amber-500 hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/50 cursor-pointer"
          >
            <span>Añadir y Abrir Orden</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
