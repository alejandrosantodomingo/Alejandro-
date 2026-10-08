import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { SaleTransaction } from '../types';
import { formatCurrency } from './storage';

export function exportSalesToExcel(sales: SaleTransaction[]): void {
  const rows = sales.map((sale) => ({
    'ID Transacción': sale.id,
    'Fecha / Hora': sale.formattedDate || sale.date,
    'Cliente': sale.customerName,
    'Email': sale.customerEmail,
    'Teléfono': sale.customerPhone || 'N/A',
    'Cortes Seleccionados': sale.haircutNames.join(', '),
    'Barbero Asignado': sale.barber,
    'Método de Pago': sale.paymentMethod,
    'Subtotal': sale.subtotal,
    'Servicio / Impuesto': sale.tax,
    'Total Pagado': sale.total,
    'Estado': sale.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 16 }, // ID
    { wch: 20 }, // Fecha
    { wch: 22 }, // Cliente
    { wch: 24 }, // Email
    { wch: 16 }, // Tel
    { wch: 32 }, // Cortes
    { wch: 24 }, // Barbero
    { wch: 22 }, // Pago
    { wch: 12 }, // Subtotal
    { wch: 14 }, // Impuesto
    { wch: 14 }, // Total
    { wch: 14 }, // Estado
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registro de Ventas');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Reporte_Ventas_Barberia_Royal_${today}.xlsx`);
}

export interface KpiSummary {
  totalCuts: number;
  totalCustomers: number;
  totalRevenue: number;
  avgTicket: number;
}

export function exportSalesToPDF(sales: SaleTransaction[], kpis: KpiSummary): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Dark header background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent line
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(1.2);
  doc.line(0, 42, pageWidth, 42);

  // Title & subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('BARBERÍA ROYAL CLASSIC', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('INFORME EJECUTIVO DE VENTAS, SERVICIOS Y ANALÍTICA', 14, 26);
  doc.text(`Generado el: ${today} | Total Registros: ${sales.length}`, 14, 33);

  // Status Badge / Right Text
  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text('SISTEMA CRM & POS OFICIAL', pageWidth - 14, 20, { align: 'right' });
  doc.setTextColor(148, 163, 184);
  doc.text('Versión Certificada', pageWidth - 14, 27, { align: 'right' });

  // KPIs Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('RESUMEN DE INDICADORES CLAVE (KPIs)', 14, 52);

  // 4 KPI boxes
  const cardY = 56;
  const cardW = (pageWidth - 28 - 9) / 4;
  const cardH = 22;

  const kpiData = [
    { label: 'Cortes Totales', val: kpis.totalCuts.toString() },
    { label: 'Clientes Atendidos', val: kpis.totalCustomers.toString() },
    { label: 'Ingresos Totales', val: formatCurrency(kpis.totalRevenue) },
    { label: 'Promedio x Cliente', val: formatCurrency(kpis.avgTicket) },
  ];

  kpiData.forEach((kpi, idx) => {
    const cardX = 14 + idx * (cardW + 3);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(kpi.label, cardX + 3, cardY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(kpi.val, cardX + 3, cardY + 16);
  });

  // Table Title
  let currentY = 88;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('DETALLE HISTÓRICO DE TRANSACCIONES', 14, currentY);

  currentY += 5;

  // Table Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(14, currentY, pageWidth - 28, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  const colX = {
    id: 16,
    date: 38,
    customer: 66,
    cuts: 104,
    barber: 140,
    amount: 172,
    status: pageWidth - 16,
  };

  doc.text('ID', colX.id, currentY + 5);
  doc.text('FECHA', colX.date, currentY + 5);
  doc.text('CLIENTE', colX.customer, currentY + 5);
  doc.text('CORTES', colX.cuts, currentY + 5);
  doc.text('BARBERO', colX.barber, currentY + 5);
  doc.text('TOTAL', colX.amount, currentY + 5);
  doc.text('ESTADO', colX.status, currentY + 5, { align: 'right' });

  currentY += 8;

  // Table Rows (paginate if needed)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  sales.slice(0, 24).forEach((sale, index) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;

      // Repeat Table Header on next page
      doc.setFillColor(30, 41, 59);
      doc.rect(14, currentY, pageWidth - 28, 7.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('ID', colX.id, currentY + 5);
      doc.text('FECHA', colX.date, currentY + 5);
      doc.text('CLIENTE', colX.customer, currentY + 5);
      doc.text('CORTES', colX.cuts, currentY + 5);
      doc.text('BARBERO', colX.barber, currentY + 5);
      doc.text('TOTAL', colX.amount, currentY + 5);
      doc.text('ESTADO', colX.status, currentY + 5, { align: 'right' });
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, pageWidth - 28, 6.5, 'F');
    }

    doc.setTextColor(30, 41, 59);
    doc.text(sale.id, colX.id, currentY + 4.5);
    doc.text(sale.formattedDate.slice(0, 11), colX.date, currentY + 4.5);

    // Truncate customer name if needed
    const clientName = sale.customerName.length > 20 ? sale.customerName.slice(0, 18) + '...' : sale.customerName;
    doc.text(clientName, colX.customer, currentY + 4.5);

    // Cuts summary
    const cutName = sale.haircutNames.join(', ');
    const cutDisplay = cutName.length > 20 ? cutName.slice(0, 18) + '..' : cutName;
    doc.text(cutDisplay, colX.cuts, currentY + 4.5);

    // Barber
    const barberShort = sale.barber.split('"')[1] || sale.barber.slice(0, 14);
    doc.text(barberShort, colX.barber, currentY + 4.5);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(sale.total), colX.amount, currentY + 4.5);
    doc.setFont('helvetica', 'normal');

    // Status
    doc.setTextColor(16, 128, 67); // green
    doc.text(sale.status, colX.status, currentY + 4.5, { align: 'right' });

    currentY += 6.5;
  });

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Barbería Royal Classic • Sistema de Ventas y CRM Comercial • Documento confidencial de uso administrativo',
    pageWidth / 2,
    288,
    { align: 'center' }
  );

  const fileDate = new Date().toISOString().slice(0, 10);
  doc.save(`Reporte_Ventas_Barberia_Royal_${fileDate}.pdf`);
}
