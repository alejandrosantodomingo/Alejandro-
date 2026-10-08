import React, { useState, useMemo } from 'react';
import { SaleTransaction, Haircut } from '../types';
import { formatCurrency } from '../utils/storage';
import { exportSalesToExcel, exportSalesToPDF, KpiSummary } from '../utils/exportUtils';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  Scissors,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Eye,
  RefreshCw,
  Printer
} from 'lucide-react';

interface DashboardBoardProps {
  sales: SaleTransaction[];
  haircuts: Haircut[];
  onNavigateToCatalog: () => void;
}

export const DashboardBoard: React.FC<DashboardBoardProps> = ({
  sales,
  haircuts,
  onNavigateToCatalog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | '7d' | '30d'>('all');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<SaleTransaction | null>(null);

  // Filter sales based on search, status, and date range
  const filteredSales = useMemo(() => {
    let list = [...sales];

    // Date range filter
    const now = Date.now();
    if (dateRangeFilter === '7d') {
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      list = list.filter((s) => s.timestamp >= sevenDaysAgo);
    } else if (dateRangeFilter === '30d') {
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      list = list.filter((s) => s.timestamp >= thirtyDaysAgo);
    }

    // Status filter
    if (statusFilter !== 'Todos') {
      list = list.filter((s) => s.status === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.customerEmail.toLowerCase().includes(q) ||
          s.haircutNames.some((name) => name.toLowerCase().includes(q)) ||
          s.barber.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [sales, dateRangeFilter, statusFilter, searchQuery]);

  // Compute 4 Top KPIs with safe data validation
  const kpis: KpiSummary = useMemo(() => {
    const totalCuts = filteredSales.reduce((sum, s) => sum + s.haircutNames.length, 0);
    const uniqueCustomers = new Set(filteredSales.map((s) => s.customerEmail.toLowerCase() || s.customerName.toLowerCase()));
    const totalCustomers = uniqueCustomers.size;
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const avgTicket = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

    return {
      totalCuts,
      totalCustomers,
      totalRevenue,
      avgTicket,
    };
  }, [filteredSales]);

  // 1. Data for Bar Chart: Top Cuts by Count
  const topCutsData = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    filteredSales.forEach((sale) => {
      sale.haircutNames.forEach((name) => {
        if (!counts[name]) {
          counts[name] = { count: 0, revenue: 0 };
        }
        counts[name].count += 1;
        // Estimate cut price or average
        const cut = haircuts.find((h) => h.name === name);
        counts[name].revenue += cut ? cut.price : 35000;
      });
    });

    const entries = Object.entries(counts).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    }));

    return entries.sort((a, b) => b.count - a.count).slice(0, 6);
  }, [filteredSales, haircuts]);

  // 2. Data for Line Chart: Sales trend over time
  const timelineData = useMemo(() => {
    const groupedByDay: Record<string, { date: string; displayDate: string; revenue: number; cuts: number }> = {};

    // Sort ascending for chronology
    const sortedAsc = [...filteredSales].sort((a, b) => a.timestamp - b.timestamp);

    sortedAsc.forEach((sale) => {
      const dayKey = sale.date || new Date(sale.timestamp).toISOString().slice(0, 10);
      if (!groupedByDay[dayKey]) {
        const d = new Date(dayKey + 'T12:00:00');
        groupedByDay[dayKey] = {
          date: dayKey,
          displayDate: isNaN(d.getTime())
            ? dayKey
            : d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
          revenue: 0,
          cuts: 0,
        };
      }
      groupedByDay[dayKey].revenue += sale.total;
      groupedByDay[dayKey].cuts += sale.haircutNames.length;
    });

    return Object.values(groupedByDay).slice(-10);
  }, [filteredSales]);

  // 3. Data for Donut/Pie Chart: Distribution by haircut category
  const categoryDistribution = useMemo(() => {
    const catCounts: Record<string, number> = {
      Fade: 0,
      Clásico: 0,
      Moderno: 0,
      Texturizado: 0,
      Largo: 0,
    };

    filteredSales.forEach((sale) => {
      sale.haircutNames.forEach((name) => {
        const found = haircuts.find((h) => h.name === name);
        const cat = found ? found.category : 'Fade';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });
    });

    const totalCount = Object.values(catCounts).reduce((a, b) => a + b, 0);

    const colors: Record<string, string> = {
      Fade: '#f59e0b', // amber-500
      Clásico: '#38bdf8', // sky-400
      Moderno: '#a855f7', // purple-500
      Texturizado: '#10b981', // emerald-500
      Largo: '#f43f5e', // rose-500
    };

    return Object.entries(catCounts)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        category,
        count,
        percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
        color: colors[category] || '#94a3b8',
      }));
  }, [filteredSales, haircuts]);

  // Handle Excel Export
  const handleExportExcel = () => {
    exportSalesToExcel(filteredSales);
  };

  // Handle PDF Export
  const handleExportPDF = () => {
    exportSalesToPDF(filteredSales, kpis);
  };

  // Bar Chart calculations
  const maxBarCount = Math.max(...topCutsData.map((d) => d.count), 1);

  // Line chart calculations
  const maxTimelineRevenue = Math.max(...timelineData.map((d) => d.revenue), 100000);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase">
            <BarChart3 className="w-4 h-4" />
            <span>Tablero 3: Métricas & Business Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-100">
            Dashboard de Analítica e Informes
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl">
            Monitoreo en tiempo real de servicios prestados, volumen de ventas, clientes recurrentes y exportación de reportes contables oficiales.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
            title="Descargar libro de cálculo XLSX con todas las transacciones"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar a Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
            title="Descargar reporte corporativo imprimible en PDF con KPIs"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar a PDF</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Quick Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-2 text-xs text-neutral-300">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="font-semibold">Periodo de Análisis:</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-medium">
          <button
            onClick={() => setDateRangeFilter('7d')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              dateRangeFilter === '7d'
                ? 'bg-neutral-800 text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Últimos 7 días
          </button>
          <button
            onClick={() => setDateRangeFilter('30d')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              dateRangeFilter === '30d'
                ? 'bg-neutral-800 text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Últimos 30 días
          </button>
          <button
            onClick={() => setDateRangeFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              dateRangeFilter === 'all'
                ? 'bg-neutral-800 text-amber-400 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Histórico Total ({sales.length})
          </button>
        </div>
      </div>

      {/* 4 TOP KEY METRIC CARDS (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Total Cortes Realizados */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Total Cortes Realizados</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-100 tabular-nums">
              {kpis.totalCuts}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">+100%</span> en registros activos
            </p>
          </div>
        </div>

        {/* KPI 2: Total Clientes Atendidos */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Clientes Atendidos</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-100 tabular-nums">
              {kpis.totalCustomers}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              <span className="text-sky-400 font-medium">100%</span> índice de fidelidad
            </p>
          </div>
        </div>

        {/* KPI 3: Ingresos Totales Generados */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Ingresos Totales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums truncate">
              {formatCurrency(kpis.totalRevenue)}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Ventas brutas acumuladas
            </p>
          </div>
        </div>

        {/* KPI 4: Promedio de Venta por Cliente */}
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Promedio x Cliente (Ticket)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-100 tabular-nums truncate">
              {formatCurrency(kpis.avgTicket)}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
              Gasto medio por cliente atendido
            </p>
          </div>
        </div>

      </div>

      {/* 3 VISUAL CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: BAR CHART (Cortes más vendidos) */}
        <div className="lg:col-span-2 rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Cortes de Cabello Más Vendidos</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Volumen de servicios demandados clasificados por referencia
              </p>
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">Top 6 Estilos</span>
          </div>

          {topCutsData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-neutral-500">
              No hay ventas en este periodo.
            </div>
          ) : (
            <div className="space-y-3.5 pt-2">
              {topCutsData.map((item, idx) => {
                const percent = Math.round((item.count / maxBarCount) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate max-w-[280px]">
                        <span className="font-mono text-neutral-500 w-4">{idx + 1}.</span>
                        <span className="font-semibold text-neutral-200 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="text-neutral-400 font-mono text-[11px]">
                          {formatCurrency(item.revenue)}
                        </span>
                        <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[11px] tabular-nums">
                          {item.count} {item.count === 1 ? 'corte' : 'cortes'}
                        </span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 transition-all duration-700 ease-out shadow-sm"
                        style={{ width: `${Math.max(percent, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CHART 3: DONUT / PIE CHART (Distribución porcentual por categoría) */}
        <div className="lg:col-span-1 rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>Distribución por Estilo</span>
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Participación porcentual según categoría
            </p>
          </div>

          {/* SVG Donut */}
          <div className="relative flex items-center justify-center my-4">
            <svg width="180" height="180" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#262626"
                strokeWidth="14"
              />
              {(() => {
                let accumulatedPercent = 0;
                const circumference = 2 * Math.PI * 38; // ~238.76

                return categoryDistribution.map((cat) => {
                  const strokeDasharray = `${(cat.percent * circumference) / 100} ${circumference}`;
                  const strokeDashoffset = -((accumulatedPercent * circumference) / 100);
                  accumulatedPercent += cat.percent;

                  return (
                    <circle
                      key={cat.category}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth="14"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );
                });
              })()}
            </svg>

            {/* Inner text inside donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-extrabold text-neutral-100 tabular-nums">
                {kpis.totalCuts}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Cortes
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
            {categoryDistribution.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-neutral-300 font-medium">{cat.category}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                  <span>{cat.count} serv.</span>
                  <span className="font-bold text-neutral-200 tabular-nums">{cat.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CHART 2: LINE CHART (Tendencia de Ventas & Servicios en el Tiempo) */}
      <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Tendencia de Facturación y Servicios Prestados</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Evolución diaria de ventas ($) y volumen de clientes agendados
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-1 rounded-full bg-amber-400" /> Ingresos Diarios ($)
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-neutral-400" /> Cortes Realizados
            </span>
          </div>
        </div>

        {timelineData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-neutral-500">
            Sin datos temporales en el rango seleccionado.
          </div>
        ) : (
          <div className="pt-4">
            <div className="relative h-48 w-full">
              {/* Responsive SVG Line Chart */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="#262626" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="#262626" strokeDasharray="3 3" />
                <line x1="0" y1="160" x2="800" y2="160" stroke="#262626" strokeDasharray="3 3" />

                {/* Draw Area and Line Path */}
                {(() => {
                  const points = timelineData.map((d, index) => {
                    const x = timelineData.length > 1 ? (index / (timelineData.length - 1)) * 760 + 20 : 400;
                    const y = 170 - (d.revenue / maxTimelineRevenue) * 140;
                    return { x, y, data: d };
                  });

                  const pathD = points.reduce((acc, pt, idx) => {
                    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                  }, '');

                  const areaD = points.length > 0
                    ? `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`
                    : '';

                  return (
                    <>
                      <path d={areaD} fill="url(#revenueGradient)" />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((pt, i) => (
                        <g key={i}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4.5"
                            fill="#171717"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            className="hover:r-6 transition-all cursor-pointer"
                          />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono pt-3 border-t border-neutral-800">
              {timelineData.map((d, idx) => (
                <div key={idx} className="text-center">
                  <span>{d.displayDate}</span>
                  <div className="text-[10px] text-amber-400 font-bold tabular-nums">
                    {formatCurrency(d.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SALES HISTORY TABLE */}
      <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden shadow-xl space-y-4 p-6">
        
        {/* Table Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-neutral-100">
              Registro Histórico de Ventas y Citas
            </h3>
            <p className="text-xs text-neutral-400">
              Listado detallado de todas las transacciones procesadas con clientes, barberos y montos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, corte..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-neutral-200 outline-none"
              />
            </div>

            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 outline-none focus:border-amber-500"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Completado">Completado</option>
              <option value="En proceso">En proceso</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-950/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                <th className="py-3 px-4 font-bold">ID Transacción</th>
                <th className="py-3 px-4 font-bold">Fecha / Hora</th>
                <th className="py-3 px-4 font-bold">Cliente</th>
                <th className="py-3 px-4 font-bold">Corte Seleccionado</th>
                <th className="py-3 px-4 font-bold">Barbero</th>
                <th className="py-3 px-4 font-bold text-right">Monto Total</th>
                <th className="py-3 px-4 font-bold text-center">Estado</th>
                <th className="py-3 px-4 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500">
                    No se encontraron transacciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-neutral-800/40 transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {sale.id}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-neutral-300 font-mono text-[11px] whitespace-nowrap">
                      {sale.formattedDate || sale.date}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-100">{sale.customerName}</div>
                      <div className="text-[10px] text-neutral-500 truncate max-w-[150px]">
                        {sale.customerEmail}
                      </div>
                    </td>

                    {/* Cuts */}
                    <td className="py-3 px-4">
                      <div className="text-neutral-200 line-clamp-1">
                        {sale.haircutNames.join(', ')}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {sale.haircutNames.length} {sale.haircutNames.length === 1 ? 'corte' : 'cortes'}
                      </div>
                    </td>

                    {/* Barber */}
                    <td className="py-3 px-4 text-neutral-300 text-[11px] whitespace-nowrap">
                      {sale.barber.split('"')[1] || sale.barber}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-bold text-neutral-100 tabular-nums">
                      {formatCurrency(sale.total)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          sale.status === 'Completado'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {sale.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedSaleDetail(sale)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Ver detalle del ticket"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Summary Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-400 pt-2 gap-2">
          <span>
            Mostrando <strong>{filteredSales.length}</strong> de {sales.length} transacciones registradas
          </span>
          <div className="flex items-center gap-3">
            <span>
              Total facturado visible:{' '}
              <strong className="text-amber-400 font-bold tabular-nums">
                {formatCurrency(filteredSales.reduce((a, b) => a + b.total, 0))}
              </strong>
            </span>
          </div>
        </div>

      </div>

      {/* Sale Detail Receipt Modal */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-neutral-100">
                  Comprobante Oficial #{selectedSaleDetail.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 font-mono text-xs space-y-2">
              <div className="text-center pb-2 border-b border-neutral-800 text-neutral-400">
                <div className="font-bold text-neutral-200">BARBERÍA ROYAL CLASSIC</div>
                <div className="text-[10px]">NIT 900.832.144-1 · Medellín, Colombia</div>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-neutral-500">Fecha:</span>
                <span className="text-neutral-300">{selectedSaleDetail.formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Cliente:</span>
                <span className="text-neutral-300">{selectedSaleDetail.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Email:</span>
                <span className="text-neutral-300">{selectedSaleDetail.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Barbero:</span>
                <span className="text-neutral-300">{selectedSaleDetail.barber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Método Pago:</span>
                <span className="text-neutral-300">{selectedSaleDetail.paymentMethod}</span>
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-1">
                <div className="text-neutral-400 font-sans text-[11px] font-bold">
                  Servicios Incluidos:
                </div>
                {selectedSaleDetail.haircutNames.map((name, i) => (
                  <div key={i} className="flex justify-between text-neutral-300 text-[11px]">
                    <span>• {name}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedSaleDetail.subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Servicio / Impuesto:</span>
                  <span>{formatCurrency(selectedSaleDetail.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-amber-400 pt-1 border-t border-neutral-800">
                  <span>Total Facturado:</span>
                  <span>{formatCurrency(selectedSaleDetail.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
