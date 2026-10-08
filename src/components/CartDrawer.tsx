import React, { useState } from 'react';
import { OrderItem, UserProfile, PaymentMethod, SaleTransaction, ServiceOptionKey } from '../types';
import { formatCurrency } from '../utils/storage';
import { BARBERS_LIST } from '../data/initialData';
import { SERVICE_OPTIONS } from '../data/serviceOptions';
import confetti from 'canvas-confetti';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ClipboardList,
  Calendar,
  Clock,
  User,
  CreditCard,
  DollarSign,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Scissors,
  FileCheck,
  Tag,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: OrderItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onChangeItemOption?: (id: string, newOption: ServiceOptionKey) => void;
  currentUser: UserProfile;
  onCompleteSale: (transaction: SaleTransaction) => void;
  onNavigateToDashboard: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onChangeItemOption,
  currentUser,
  onCompleteSale,
  onNavigateToDashboard,
}) => {
  const [selectedBarber, setSelectedBarber] = useState(BARBERS_LIST[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tarjeta Débito/Crédito');
  const [customerName, setCustomerName] = useState(currentUser.name);
  const [customerEmail, setCustomerEmail] = useState(currentUser.email);
  const [customerPhone, setCustomerPhone] = useState('+57 310 456 7890');
  const [serviceNotes, setServiceNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return today;
  });
  const [appointmentTime, setAppointmentTime] = useState('11:00 AM');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<SaleTransaction | null>(null);

  if (!isOpen && !isSuccessModalOpen) return null;

  const subtotal = cart.reduce(
    (acc, item) => acc + (item.unitPrice || item.haircut.price) * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.1); // 10% tarifa de insumos / servicio
  const total = subtotal + tax;

  const totalEstimatedMinutes = cart.reduce(
    (acc, item) => acc + (item.durationMinutes || item.haircut.durationMinutes) * item.quantity,
    0
  );

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}, ${appointmentTime}`;

    // Flatten names and IDs with service option label
    const haircutNames: string[] = [];
    const haircutIds: string[] = [];
    cart.forEach((item) => {
      const displayName = `${item.haircut.name} [${item.serviceOptionLabel || 'Corte'}]`;
      for (let i = 0; i < item.quantity; i++) {
        haircutNames.push(displayName);
        haircutIds.push(item.haircut.id);
      }
    });

    const newTransaction: SaleTransaction = {
      id: orderId,
      customerName: customerName.trim() || currentUser.name,
      customerEmail: customerEmail.trim() || currentUser.email,
      customerPhone: customerPhone.trim(),
      haircutNames,
      haircutIds,
      date: appointmentDate,
      formattedDate,
      timestamp: Date.now(),
      subtotal,
      tax,
      total,
      paymentMethod,
      barber: selectedBarber,
      status: 'Completado',
    };

    onCompleteSale(newTransaction);
    setLastCompletedTransaction(newTransaction);
    onClearCart();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff'],
      });
    } catch {
      // Confetti fallback
    }

    setIsSuccessModalOpen(true);
  };

  return (
    <>
      {/* Side Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Container */}
      {isOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-100">Orden de Pedido de Servicio</h3>
                <p className="text-[11px] text-neutral-400">
                  {cart.length} {cart.length === 1 ? 'ítem en la orden' : 'ítems en la orden'} · ~{totalEstimatedMinutes} min de atención
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
                  <Scissors className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-neutral-200 mb-1">Orden de Pedido Vacía</h4>
                <p className="text-xs text-neutral-400 max-w-xs mb-6">
                  Selecciona cualquier corte del catálogo y escoge entre servicios individuales o combos promocionales.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Ver Catálogo de Servicios
                </button>
              </div>
            ) : (
              <>
                {/* List of services in order */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 pb-1 border-b border-neutral-800/80">
                    <span>Servicios Solicitados en la Orden</span>
                    <button
                      onClick={onClearCart}
                      className="text-neutral-500 hover:text-rose-400 text-[11px] transition-colors cursor-pointer"
                    >
                      Limpiar Orden
                    </button>
                  </div>

                  {cart.map((item) => {
                    const itemId = item.id || `${item.haircut.id}-${item.serviceOption || 'corte'}`;
                    const price = item.unitPrice || item.haircut.price;
                    const duration = item.durationMinutes || item.haircut.durationMinutes;

                    return (
                      <div
                        key={itemId}
                        className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <img
                            src={item.haircut.imageUrl}
                            alt={item.haircut.name}
                            className="w-12 h-12 rounded-lg object-cover border border-neutral-700/80 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-neutral-100 truncate">
                              {item.haircut.name}
                            </h5>

                            {/* Service Option Tag */}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  item.isCombo || item.serviceOption?.startsWith('combo')
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                                }`}
                              >
                                {item.serviceOptionLabel || 'Corte de cabello'}
                              </span>
                              <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 text-neutral-500" />
                                {duration} min
                              </span>
                            </div>

                            <p className="text-[11px] text-amber-400 font-semibold tabular-nums mt-1 font-mono">
                              {formatCurrency(price)} c/u
                            </p>
                          </div>

                          {/* Remove item */}
                          <button
                            onClick={() => onRemoveItem(itemId)}
                            className="text-neutral-500 hover:text-rose-400 p-1 transition-colors cursor-pointer shrink-0"
                            title="Quitar de la orden"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Inline selector to switch option right here if desired */}
                        {onChangeItemOption && (
                          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between gap-2">
                            <div className="relative flex-1">
                              <select
                                value={item.serviceOption || 'corte'}
                                onChange={(e) =>
                                  onChangeItemOption(itemId, e.target.value as ServiceOptionKey)
                                }
                                className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-300 font-medium outline-none cursor-pointer appearance-none pr-6"
                              >
                                <optgroup label="Servicios Individuales">
                                  <option value="corte">✂️ Corte de cabello</option>
                                  <option value="barba">🧔 Barba ($18.000)</option>
                                  <option value="shampoo">🧴 Shampoo ($12.000)</option>
                                  <option value="mascarilla">🧖 Mascarilla ($15.000)</option>
                                </optgroup>
                                <optgroup label="Combos">
                                  <option value="combo_corte_shampoo">✂️🧴 Corte + shampoo</option>
                                  <option value="combo_corte_barba">✂️🧔 Corte + barba</option>
                                  <option value="combo_corte_barba_shampoo">✂️🧔🧴 Corte + barba + shampoo</option>
                                </optgroup>
                              </select>
                              <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Quantity buttons */}
                            <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 shrink-0">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(itemId, -1)}
                                className="w-4 h-4 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                                title="Disminuir"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-neutral-100 px-1 tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(itemId, 1)}
                                className="w-4 h-4 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                                title="Añadir"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Execution Form in the Barbershop */}
                <form id="order-form" onSubmit={handleExecuteOrder} className="space-y-4 pt-2">
                  <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-amber-400" />
                    <span>Datos de Ejecución en Barbería</span>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> Nombre del Cliente / Titular del Turno
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nombre del cliente"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 outline-none"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Smartphone className="w-3 h-3" /> Teléfono / WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+57 300 000 0000"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 outline-none"
                    />
                  </div>

                  {/* Barber Assignment */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Scissors className="w-3 h-3" /> Barbero Asignado a la Orden
                    </label>
                    <select
                      value={selectedBarber}
                      onChange={(e) => setSelectedBarber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 outline-none"
                    >
                      {BARBERS_LIST.map((barber) => (
                        <option key={barber} value={barber}>
                          {barber}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Time slot */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Fecha del Turno
                      </label>
                      <input
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Hora de Inicio
                      </label>
                      <select
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 outline-none"
                      >
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:30 PM">03:30 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="06:30 PM">06:30 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Special notes */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Indicaciones Especiales del Corte (Opcional)
                    </label>
                    <input
                      type="text"
                      value={serviceNotes}
                      onChange={(e) => setServiceNotes(e.target.value)}
                      placeholder="ej: Fade medio, definir cejas con navaja"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-100 outline-none"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-neutral-400">Método de Liquidación / Pago</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Tarjeta Débito/Crédito', 'Transferencia Nequi/PSE', 'Efectivo'] as PaymentMethod[]).map(
                        (method) => (
                          <button
                            type="button"
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`p-2 rounded-lg text-[10px] font-semibold border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                              paymentMethod === method
                                ? 'bg-amber-500/10 border-amber-500/60 text-amber-300'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            {method === 'Tarjeta Débito/Crédito' && <CreditCard className="w-3.5 h-3.5" />}
                            {method === 'Transferencia Nequi/PSE' && <Smartphone className="w-3.5 h-3.5" />}
                            {method === 'Efectivo' && <DollarSign className="w-3.5 h-3.5" />}
                            <span className="truncate w-full">{method.split(' ')[0]}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Footer Calculations & Action Button */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-800 bg-neutral-900/90 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Subtotal Servicios</span>
                  <span className="font-semibold text-neutral-200 tabular-nums">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Insumos / Servicio (10%)</span>
                  <span className="font-semibold text-neutral-200 tabular-nums">
                    {formatCurrency(tax)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-neutral-100 pt-2 border-t border-neutral-800">
                  <span>Total Orden de Pedido</span>
                  <span className="text-amber-400 tabular-nums font-mono">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="order-form"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Procesar y Ejecutar Orden en Barbería</span>
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Confirmation Order Execution Ticket Modal */}
      {isSuccessModalOpen && lastCompletedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                ¡Orden de Pedido Ejecutada!
              </span>
              <h3 className="text-xl font-bold text-neutral-100">Orden Procesada en Barbería</h3>
              <p className="text-xs text-neutral-400">
                La orden de servicio ha sido enviada a sala de corte y registrada en el{' '}
                <strong className="text-amber-400">Tablero 3 de Analítica</strong>.
              </p>
            </div>

            {/* Service Order Sheet */}
            <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800/90 font-mono text-xs space-y-2">
              <div className="flex justify-between pb-2 border-b border-neutral-800 text-neutral-400">
                <span>No. Orden de Pedido:</span>
                <span className="text-amber-400 font-bold">{lastCompletedTransaction.id}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Cliente Titular:</span>
                <span>{lastCompletedTransaction.customerName}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Servicios:</span>
                <span className="text-right truncate max-w-[210px]">
                  {lastCompletedTransaction.haircutNames.join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Barbero Asignado:</span>
                <span>{lastCompletedTransaction.barber}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Fecha / Turno:</span>
                <span>{lastCompletedTransaction.formattedDate}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Liquidación:</span>
                <span>{lastCompletedTransaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span className="text-neutral-500">Estado Orden:</span>
                <span className="text-emerald-400 font-bold">✓ Procesada / Ejecutada</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm font-bold text-neutral-100">
                <span>Total Facturado:</span>
                <span className="text-amber-400 font-mono">
                  {formatCurrency(lastCompletedTransaction.total)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Nueva Orden de Pedido
              </button>
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onClose();
                  onNavigateToDashboard();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Ver en Tablero 3</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
