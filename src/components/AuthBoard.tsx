import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_USERS } from '../data/initialData';
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  CheckCircle2,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Scissors,
  DollarSign,
  Trash2,
  Edit3,
  ClipboardList,
  Clock,
  Calendar,
  AlertCircle,
  Unlock,
  Check
} from 'lucide-react';

interface AuthBoardProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onNavigateToCatalog: () => void;
}

export const AuthBoard: React.FC<AuthBoardProps> = ({
  currentUser,
  onSelectUser,
  onNavigateToCatalog,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [optionalClientName, setOptionalClientName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleQuickLogin = (role: UserRole) => {
    const user = DEFAULT_USERS[role];
    onSelectUser(user);
    setSuccessNotice(
      role === 'admin'
        ? 'Has iniciado sesión como Administrador (alejandro123).'
        : 'Has ingresado como Cliente sin requerimiento de credenciales.'
    );
    setErrorMessage('');
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const handleClientFreeEntry = (customName?: string) => {
    const finalName = customName?.trim() || 'Cliente Invitado';
    const clientUser: UserProfile = {
      id: `usr-client-${Date.now()}`,
      name: finalName,
      email: `${finalName.toLowerCase().replace(/\s+/g, '.') || 'cliente'}@barberia.com`,
      role: 'cliente',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      phone: '+57 312 987 6543',
      memberSince: 'Acceso Libre',
    };
    onSelectUser(clientUser);
    setSuccessNotice(`¡Bienvenido ${finalName}! Has ingresado con acceso libre de cliente.`);
    setErrorMessage('');
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const handleAdminManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUser = usernameInput.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMessage('Por favor ingresa usuario y contraseña de Administrador.');
      return;
    }

    // Credentials: alejandro123 / 12345
    if (
      (trimmedUser === 'alejandro123' || trimmedUser === 'alejandro123@barberia.com') &&
      trimmedPass === '12345'
    ) {
      onSelectUser(DEFAULT_USERS.admin);
      setSuccessNotice('Acceso Concedido: Perfil Administrador autenticado correctamente.');
      setUsernameInput('');
      setPasswordInput('');
      setTimeout(() => setSuccessNotice(''), 4000);
      return;
    }

    // Fallback for legacy admin credentials or error
    if (trimmedUser === 'admin@barberia.com' && trimmedPass === 'admin123') {
      onSelectUser(DEFAULT_USERS.admin);
      setSuccessNotice('Acceso Concedido: Perfil Administrador autenticado.');
      setUsernameInput('');
      setPasswordInput('');
      setTimeout(() => setSuccessNotice(''), 4000);
      return;
    }

    setErrorMessage('Credenciales incorrectas. Para Administrador usa: usuario alejandro123 | contraseña 12345');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase">
          <KeyRound className="w-4 h-4" />
          <span>Tablero 1: Gestión de Identidad & Accesos</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-100">
          Autenticación y Roles de Barbería
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base max-w-3xl">
          Ingresa como <strong>Administrador</strong> con credenciales seguras (<code className="text-amber-400 font-mono">alejandro123</code> / <code className="text-amber-400 font-mono">12345</code>),
          o ingresa directamente como <strong>Cliente</strong> con <strong>acceso libre</strong> sin usuario ni contraseña.
        </p>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={onNavigateToCatalog}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>Ir al Catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Session Status Bar */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-neutral-700 shadow-lg shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl font-bold text-neutral-100">{currentUser.name}</h3>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {currentUser.role === 'admin' ? '🛡️ Perfil Administrador' : '👤 Perfil Cliente / Comprador (Libre)'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  {currentUser.email}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  {currentUser.memberSince}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sesión Activa
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleQuickLogin(currentUser.role === 'admin' ? 'cliente' : 'admin')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Alternar a {currentUser.role === 'admin' ? 'Cliente' : 'Administrador'}</span>
            </button>
            <button
              onClick={onNavigateToCatalog}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors flex items-center gap-2 shadow-md shadow-amber-950/40 cursor-pointer"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Permissions Pill row */}
        <div className="mt-5 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 font-medium">Permisos activos de tu sesión:</span>
          {currentUser.role === 'admin' ? (
            <>
              <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                ✓ Crear nuevos cortes
              </span>
              <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                ✓ Modificar precios e imágenes
              </span>
              <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                ✓ Eliminar referencias
              </span>
              <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                ✓ Exportar reportes en Excel y PDF
              </span>
            </>
          ) : (
            <>
              <span className="px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                ✓ Acceso sin contraseña
              </span>
              <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                ✓ Visualización catálogo
              </span>
              <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                ✓ Configurar orden de pedido
              </span>
              <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                ✓ Procesar y ejecutar orden en sala
              </span>
              <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-800 line-through">
                ✗ Edición o borrado de productos (Solo Admin)
              </span>
            </>
          )}
        </div>
      </div>

      {/* QUICK PRESET SELECTOR (Two main testing cards) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100">
            Selector de Perfiles
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm">
            Ingreso con credenciales para Administrador o acceso inmediato sin credenciales para Cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Perfil Administrador */}
          <div
            className={`rounded-2xl p-6 border transition-all relative flex flex-col justify-between ${
              currentUser.role === 'admin'
                ? 'bg-gradient-to-b from-neutral-900 to-amber-950/20 border-amber-500/60 ring-2 ring-amber-500/20'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Control Total (Protegido)
                </span>
              </div>

              <h3 className="text-lg font-bold text-neutral-100">1. Perfil Administrador</h3>
              <p className="text-xs text-neutral-400 mt-1 mb-4">
                Acceso restringido para el dueño o gerente con credenciales exclusivas asignadas.
              </p>

              {/* Credentials box: alejandro123 / 12345 */}
              <div className="bg-neutral-950/80 rounded-xl p-3.5 border border-neutral-800 space-y-2 font-mono text-xs mb-5">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-neutral-500 flex items-center gap-1.5 font-sans text-xs">
                    <User className="w-3.5 h-3.5 text-neutral-400" /> Usuario:
                  </span>
                  <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    alejandro123
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-neutral-500 flex items-center gap-1.5 font-sans text-xs">
                    <Lock className="w-3.5 h-3.5 text-neutral-400" /> Contraseña:
                  </span>
                  <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    12345
                  </span>
                </div>
              </div>

              {/* Permissions list */}
              <div className="space-y-2 mb-6 text-xs text-neutral-300">
                <div className="flex items-start gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Cargar nuevos cortes de cabello al catálogo</span>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Editar nombre, precio, descripción e imagen de cualquier producto</span>
                </div>
                <div className="flex items-start gap-2">
                  <Trash2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Eliminar cortes existentes del catálogo</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Descargar analítica completa en Excel (.xlsx) y PDF</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleQuickLogin('admin')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                currentUser.role === 'admin'
                  ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-md shadow-amber-950/50'
                  : 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-neutral-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{currentUser.role === 'admin' ? 'Perfil Activo Actualmente' : 'Ingresar como Administrador'}</span>
            </button>
          </div>

          {/* Card 2: Perfil Comprador / Cliente (SIN USUARIO NI CONTRASEÑA) */}
          <div
            className={`rounded-2xl p-6 border transition-all relative flex flex-col justify-between ${
              currentUser.role === 'cliente'
                ? 'bg-gradient-to-b from-neutral-900 to-emerald-950/20 border-emerald-500/60 ring-2 ring-emerald-500/20'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Unlock className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Acceso Libre (Sin Contraseña)
                </span>
              </div>

              <h3 className="text-lg font-bold text-neutral-100">2. Perfil Comprador / Cliente</h3>
              <p className="text-xs text-neutral-400 mt-1 mb-4">
                Acceso público inmediato para clientes. <strong>No requiere ingresar usuario ni contraseña</strong> para comprar o reservar.
              </p>

              {/* Free Access Notice Banner */}
              <div className="bg-emerald-950/40 rounded-xl p-3.5 border border-emerald-800/80 space-y-1.5 text-xs mb-5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sin requerimiento de usuario ni contraseña</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Cualquier cliente puede ingresar al catálogo con un solo clic, añadir servicios a su orden de pedido y procesar su ejecución en la barbería.
                </p>
              </div>

              {/* Permissions list */}
              <div className="space-y-2 mb-6 text-xs text-neutral-300">
                <div className="flex items-start gap-2">
                  <Scissors className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Vista de solo lectura del catálogo de 10 cortes</span>
                </div>
                <div className="flex items-start gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Configurar y armar orden de pedido de servicios</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Seleccionar barbero preferido y horario de atención</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Procesar y ejecutar la orden en barbería con registro en analítica</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleQuickLogin('cliente')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                currentUser.role === 'cliente'
                  ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-md shadow-emerald-950/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{currentUser.role === 'cliente' ? 'Perfil Activo Actualmente' : 'Entrar como Cliente (Acceso Libre Inmediato)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MANUAL LOGIN SECTION (Admin with Credentials / Client Instant Access) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        
        {/* Box 1: Iniciar Sesión como Administrador */}
        <div className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 text-neutral-100 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3>Ingreso Manual de Administrador</h3>
          </div>
          <p className="text-xs text-neutral-400">
            Ingresa las credenciales autorizadas (<code className="text-amber-400">alejandro123</code> / <code className="text-amber-400">12345</code>) para obtener permisos de edición.
          </p>

          <form onSubmit={handleAdminManualLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-400" /> Usuario Administrador
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="alejandro123"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-400" /> Contraseña
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="12345"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setUsernameInput('alejandro123');
                  setPasswordInput('12345');
                }}
                className="text-[11px] text-amber-400/90 hover:text-amber-300 underline cursor-pointer"
              >
                Autocompletar alejandro123
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Validar e Ingresar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Box 2: Acceso Libre de Cliente */}
        <div className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-100 font-bold text-base">
              <Unlock className="w-5 h-5 text-emerald-400" />
              <h3>Acceso Libre de Cliente (Sin Contraseña)</h3>
            </div>
            <p className="text-xs text-neutral-400">
              No necesitas crear una cuenta ni recordar contraseñas. Puedes ingresar inmediatamente o indicar un nombre para tu reserva si lo deseas.
            </p>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-400" /> Nombre del Cliente (Opcional)
              </label>
              <input
                type="text"
                value={optionalClientName}
                onChange={(e) => setOptionalClientName(e.target.value)}
                placeholder="ej: Santiago Ramírez (o déjalo en blanco)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">
              ✓ Sin contraseñas requeridas
            </span>
            <button
              type="button"
              onClick={() => handleClientFreeEntry(optionalClientName)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <span>Entrar como Cliente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
