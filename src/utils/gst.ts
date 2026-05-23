import { InvoiceItem, Invoice, GSTSummary } from '../types';

export function calculateItemTax(
  item: Omit<InvoiceItem, 'taxableAmount' | 'cgstAmount' | 'sgstAmount' | 'igstAmount' | 'totalAmount'>,
  isInterState: boolean
): InvoiceItem {
  const grossAmount = item.quantity * item.rate;
  const discountAmount = (grossAmount * item.discount) / 100;
  const taxableAmount = grossAmount - discountAmount;

  const totalGst = (taxableAmount * item.gstRate) / 100;

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isInterState) {
    igstAmount = totalGst;
  } else {
    cgstAmount = totalGst / 2;
    sgstAmount = totalGst / 2;
  }

  const totalAmount = taxableAmount + totalGst;

  return {
    ...item,
    taxableAmount: roundToTwo(taxableAmount),
    cgstAmount: roundToTwo(cgstAmount),
    sgstAmount: roundToTwo(sgstAmount),
    igstAmount: roundToTwo(igstAmount),
    totalAmount: roundToTwo(totalAmount),
  };
}

export function calculateInvoiceTotals(
  items: InvoiceItem[]
): Pick<Invoice, 'subtotal' | 'totalCgst' | 'totalSgst' | 'totalIgst' | 'totalTax' | 'totalAmount' | 'roundOff' | 'grandTotal'> {
  const subtotal = items.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalCgst = items.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSgst = items.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIgst = items.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;
  const totalAmount = subtotal + totalTax;
  const grandTotal = Math.round(totalAmount);
  const roundOff = grandTotal - totalAmount;

  return {
    subtotal: roundToTwo(subtotal),
    totalCgst: roundToTwo(totalCgst),
    totalSgst: roundToTwo(totalSgst),
    totalIgst: roundToTwo(totalIgst),
    totalTax: roundToTwo(totalTax),
    totalAmount: roundToTwo(totalAmount),
    roundOff: roundToTwo(roundOff),
    grandTotal,
  };
}

export function calculateGSTSummary(invoices: Invoice[]): GSTSummary {
  const salesInvoices = invoices.filter(inv => inv.type === 'sales' && inv.status !== 'cancelled');
  const purchaseInvoices = invoices.filter(inv => inv.type === 'purchase' && inv.status !== 'cancelled');

  const totalSales = salesInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);

  const totalCgstCollected = salesInvoices.reduce((sum, inv) => sum + inv.totalCgst, 0);
  const totalSgstCollected = salesInvoices.reduce((sum, inv) => sum + inv.totalSgst, 0);
  const totalIgstCollected = salesInvoices.reduce((sum, inv) => sum + inv.totalIgst, 0);

  const totalCgstPaid = purchaseInvoices.reduce((sum, inv) => sum + inv.totalCgst, 0);
  const totalSgstPaid = purchaseInvoices.reduce((sum, inv) => sum + inv.totalSgst, 0);
  const totalIgstPaid = purchaseInvoices.reduce((sum, inv) => sum + inv.totalIgst, 0);

  const netCgstLiability = Math.max(0, totalCgstCollected - totalCgstPaid);
  const netSgstLiability = Math.max(0, totalSgstCollected - totalSgstPaid);
  const netIgstLiability = Math.max(0, totalIgstCollected - totalIgstPaid);

  return {
    totalSales: roundToTwo(totalSales),
    totalPurchases: roundToTwo(totalPurchases),
    totalCgstCollected: roundToTwo(totalCgstCollected),
    totalSgstCollected: roundToTwo(totalSgstCollected),
    totalIgstCollected: roundToTwo(totalIgstCollected),
    totalCgstPaid: roundToTwo(totalCgstPaid),
    totalSgstPaid: roundToTwo(totalSgstPaid),
    totalIgstPaid: roundToTwo(totalIgstPaid),
    netCgstLiability: roundToTwo(netCgstLiability),
    netSgstLiability: roundToTwo(netSgstLiability),
    netIgstLiability: roundToTwo(netIgstLiability),
    totalLiability: roundToTwo(netCgstLiability + netSgstLiability + netIgstLiability),
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function validateGSTIN(gstin: string): boolean {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

export function getStateFromGSTIN(gstin: string): string {
  return gstin.substring(0, 2);
}

export function generateInvoiceNumber(type: 'sales' | 'purchase', count: number): string {
  const prefix = type === 'sales' ? 'INV' : 'PUR';
  const year = new Date().getFullYear();
  const nextMonth = new Date().getMonth() + 1;
  const fy = nextMonth >= 4 ? `${year}-${(year + 1) % 100}` : `${year - 1}-${year % 100}`;
  return `${prefix}/${fy}/${String(count + 1).padStart(4, '0')}`;
}

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
