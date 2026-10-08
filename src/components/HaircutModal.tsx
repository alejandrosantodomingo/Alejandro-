import React, { useState, useEffect } from 'react';
import { Haircut, HaircutCategory } from '../types';
import { ImageWithFallback } from './ImageWithFallback';
import { X, Check, Image as ImageIcon, Scissors, DollarSign, Clock, Tag } from 'lucide-react';

interface HaircutModalProps {
  isOpen: boolean;
  onClose: () => void;
  haircutToEdit: Haircut | null;
  onSaveHaircut: (haircut: Haircut) => void;
}

const CATEGORIES: HaircutCategory[] = ['Fade', 'Clásico', 'Moderno', 'Texturizado', 'Largo'];

const PRESET_IMAGES = [
  {
    name: 'Fade Clásico',
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Buzz Cut',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Pompadour',
    url: 'https://images.unsplash.com/photo-1517832606589-715753d4f323?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Undercut',
    url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Crop Top',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Ejecutivo',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  },
];

export const HaircutModal: React.FC<HaircutModalProps> = ({
  isOpen,
  onClose,
  haircutToEdit,
  onSaveHaircut,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(35000);
  const [category, setCategory] = useState<HaircutCategory>('Fade');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [imageUrl, setImageUrl] = useState('');
  const [popular, setPopular] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (haircutToEdit) {
      setName(haircutToEdit.name);
      setDescription(haircutToEdit.description);
      setPrice(haircutToEdit.price);
      setCategory(haircutToEdit.category);
      setDurationMinutes(haircutToEdit.durationMinutes);
      setImageUrl(haircutToEdit.imageUrl);
      setPopular(!!haircutToEdit.popular);
    } else {
      setName('');
      setDescription('');
      setPrice(35000);
      setCategory('Fade');
      setDurationMinutes(45);
      setImageUrl('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80');
      setPopular(false);
    }
    setError('');
  }, [haircutToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del corte es obligatorio.');
      return;
    }
    if (price <= 0) {
      setError('El precio debe ser un número positivo.');
      return;
    }

    const saved: Haircut = {
      id: haircutToEdit ? haircutToEdit.id : `cut-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Servicio profesional de corte y estilizado con productos premium.',
      price: Number(price),
      category,
      durationMinutes: Number(durationMinutes) || 40,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
      popular,
      tags: haircutToEdit?.tags || [category, 'Barbería'],
    };

    onSaveHaircut(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                {haircutToEdit ? 'Editar Corte / Producto' : 'Cargar Nuevo Corte de Cabello'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {haircutToEdit ? 'Actualiza los datos e imagen del catálogo' : 'Ingresa una nueva referencia al catálogo comercial'}
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

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <span>Nombre del Estilo / Corte</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Fade Clásico (Low/Mid Fade)"
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 outline-none"
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-neutral-400" />
                <span>Categoría</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HaircutCategory)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Duración (min)</span>
              </label>
              <input
                type="number"
                min="15"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 outline-none tabular-nums"
              />
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
              <span>Precio ($ COP)</span>
            </label>
            <input
              type="number"
              min="5000"
              step="1000"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="35000"
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 outline-none tabular-nums"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-300">
              Descripción Corta
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla la técnica, tipo de degradado o estilo..."
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 outline-none resize-none"
            />
          </div>

          {/* Image URL & Preview */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>URL de Imagen del Corte</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-normal">
                Previsualización en tiempo real
              </span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 outline-none"
            />

            {/* Quick preset thumbnail pills */}
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500">O elige una foto sugerida:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => setImageUrl(preset.url)}
                    className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:text-amber-300 hover:bg-neutral-700 border border-neutral-700/60 cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live image preview card */}
            <div className="mt-2 h-32 rounded-xl overflow-hidden border border-neutral-800 relative bg-neutral-950">
              <ImageWithFallback
                src={imageUrl}
                alt={name || 'Corte'}
                className="w-full h-full object-cover"
                fallbackTitle={name || 'Vista Previa'}
                fallbackCategory={category}
              />
              <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-neutral-950/80 text-neutral-300 border border-neutral-800">
                Previsualización
              </span>
            </div>
          </div>

          {/* Popular toggle */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="w-4 h-4 rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-neutral-300">
              Marcar como <strong>Estilo Destacado / Más Solicitado</strong>
            </span>
          </label>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar en Catálogo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
