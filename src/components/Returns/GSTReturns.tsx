import { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import Header from '../Layout/Header';
import { getInvoices } from '../../store/store';
import { calculateGSTSummary, formatCurrency } from '../../utils/gst';
import { Invoice } from '../../types';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { downloadGSTReturnCSV } from '../../utils/export';

export default function GSTReturns() {
  const [activeTab, setActiveTab] = useState<'gstr1' | 'gstr3b'>('gstr1');
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );

  const allInvoices = getInvoices();
  const monthStart = startOfMonth(new Date(selectedMonth + '-01'));
  const monthEnd = endOfMonth(new Date(selectedMonth + '-01'));

  const filteredInvoices = allInvoices.filter(inv => {
    const date = new Date(inv.invoiceDate);
    return date >= monthStart && date <= monthEnd && inv.status !== 'cancelled';
  });

  const salesInvoices = filteredInvoices.filter(i => i.type === 'sales');
  const purchaseInvoices = filteredInvoices.filter(i => i.type === 'purchase');
  const summary = calculateGSTSummary(filteredInvoices);

  const b2bInvoices = salesInvoices.filter(i => i.partyGstin);
  const b2cInvoices = salesInvoices.filter(i => !i.partyGstin);

  const gstRateWise = getGSTRateWiseSummary(salesInvoices);

  return (
    <div>
      <Header title="GST Returns" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('gstr1')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'gstr1' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
              }`}
            >
              GSTR-1 (Sales)
            </button>
            <button
              onClick={() => setActiveTab('gstr3b')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'gstr3b' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
              }`}
            >
              GSTR-3B (Summary)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="input-field w-auto"
            />
            <button
              onClick={() => downloadGSTReturnCSV(
                activeTab === 'gstr1' ? 'GSTR-1' : 'GSTR-3B',
                selectedMonth,
                activeTab === 'gstr1' ? salesInvoices : filteredInvoices,
              )}
              className="btn-secondary flex items-center gap-2 text-sm"
              title="Download GST Return"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {activeTab === 'gstr1' ? (
          <GSTR1View
            b2bInvoices={b2bInvoices}
            b2cInvoices={b2cInvoices}
            salesInvoices={salesInvoices}
            gstRateWise={gstRateWise}
            selectedMonth={selectedMonth}
          />
        ) : (
          <GSTR3BView
            summary={summary}
            salesInvoices={salesInvoices}
            purchaseInvoices={purchaseInvoices}
            selectedMonth={selectedMonth}
          />
        )}
      </div>
    </div>
  );
}

interface RateWiseSummary {
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

function getGSTRateWiseSummary(invoices: Invoice[]): RateWiseSummary[] {
  const rateMap: Record<number, RateWiseSummary> = {};

  invoices.forEach(inv => {
    inv.items.forEach(item => {
      if (!rateMap[item.gstRate]) {
        rateMap[item.gstRate] = {
          rate: item.gstRate,
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: 0,
        };
      }
      rateMap[item.gstRate].taxableValue += item.taxableAmount;
      rateMap[item.gstRate].cgst += item.cgstAmount;
      rateMap[item.gstRate].sgst += item.sgstAmount;
      rateMap[item.gstRate].igst += item.igstAmount;
      rateMap[item.gstRate].total += item.totalAmount;
    });
  });

  return Object.values(rateMap).sort((a, b) => a.rate - b.rate);
}

function GSTR1View({
  b2bInvoices,
  b2cInvoices,
  salesInvoices,
  gstRateWise,
  selectedMonth,
}: {
  b2bInvoices: Invoice[];
  b2cInvoices: Invoice[];
  salesInvoices: Invoice[];
  gstRateWise: RateWiseSummary[];
  selectedMonth: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="text-sm text-gray-500">B2B Invoices</span>
          <span className="text-2xl font-bold mt-1">{b2bInvoices.length}</span>
          <span className="text-xs text-gray-400">
            {formatCurrency(b2bInvoices.reduce((s, i) => s + i.grandTotal, 0))}
          </span>
        </div>
        <div className="stat-card">
          <span className="text-sm text-gray-500">B2C Invoices</span>
          <span className="text-2xl font-bold mt-1">{b2cInvoices.length}</span>
          <span className="text-xs text-gray-400">
            {formatCurrency(b2cInvoices.reduce((s, i) => s + i.grandTotal, 0))}
          </span>
        </div>
        <div className="stat-card">
          <span className="text-sm text-gray-500">Total Sales</span>
          <span className="text-2xl font-bold mt-1">{salesInvoices.length}</span>
          <span className="text-xs text-gray-400">
            {formatCurrency(salesInvoices.reduce((s, i) => s + i.grandTotal, 0))}
          </span>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          B2B Invoices (Registered Dealers) - {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
        </h3>
        {b2bInvoices.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No B2B invoices for this period.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-3 py-2 text-left">Invoice #</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Party GSTIN</th>
                <th className="px-3 py-2 text-left">Party Name</th>
                <th className="px-3 py-2 text-right">Taxable Value</th>
                <th className="px-3 py-2 text-right">Tax Amount</th>
                <th className="px-3 py-2 text-right">Invoice Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {b2bInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{inv.invoiceNumber}</td>
                  <td className="px-3 py-2">{format(new Date(inv.invoiceDate), 'dd/MM/yyyy')}</td>
                  <td className="px-3 py-2 font-mono text-xs">{inv.partyGstin}</td>
                  <td className="px-3 py-2">{inv.partyName}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(inv.subtotal)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(inv.totalTax)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrency(inv.grandTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">GST Rate-wise Summary</h3>
        {gstRateWise.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No data available.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-3 py-2 text-left">GST Rate</th>
                <th className="px-3 py-2 text-right">Taxable Value</th>
                <th className="px-3 py-2 text-right">CGST</th>
                <th className="px-3 py-2 text-right">SGST</th>
                <th className="px-3 py-2 text-right">IGST</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gstRateWise.map(row => (
                <tr key={row.rate} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{row.rate}%</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.taxableValue)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.cgst)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.sgst)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(row.igst)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrency(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function GSTR3BView({
  summary,
  salesInvoices: _salesInvoices,
  purchaseInvoices: _purchaseInvoices,
  selectedMonth,
}: {
  summary: ReturnType<typeof calculateGSTSummary>;
  salesInvoices: Invoice[];
  purchaseInvoices: Invoice[];
  selectedMonth: string;
}) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          GSTR-3B Summary - {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
        </h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Outward Supplies (Sales)
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 text-gray-500 font-medium">Nature</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Taxable Value</th>
                    <th className="text-right py-2 text-gray-500 font-medium">IGST</th>
                    <th className="text-right py-2 text-gray-500 font-medium">CGST</th>
                    <th className="text-right py-2 text-gray-500 font-medium">SGST</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Total Outward Supplies</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(summary.totalSales)}</td>
                    <td className="py-2 text-right">{formatCurrency(summary.totalIgstCollected)}</td>
                    <td className="py-2 text-right">{formatCurrency(summary.totalCgstCollected)}</td>
                    <td className="py-2 text-right">{formatCurrency(summary.totalSgstCollected)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Inward Supplies (Purchases - ITC)
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 text-gray-500 font-medium">Nature</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Taxable Value</th>
                    <th className="text-right py-2 text-gray-500 font-medium">IGST</th>
                    <th className="text-right py-2 text-gray-500 font-medium">CGST</th>
                    <th className="text-right py-2 text-gray-500 font-medium">SGST</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Input Tax Credit (ITC)</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(summary.totalPurchases)}</td>
                    <td className="py-2 text-right">{formatCurrency(summary.totalIgstPaid)}</td>
                    <td className="py-2 text-right">{formatCurrency(summary.totalCgstPaid)}</td>
                    <td className="py-2 text-right">{formatCurrency(summary.totalSgstPaid)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Tax Liability (Net Payable)
            </h4>
            <div className="bg-red-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 text-gray-500 font-medium">Tax Head</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Tax Collected</th>
                    <th className="text-right py-2 text-gray-500 font-medium">ITC Available</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  <tr>
                    <td className="py-2 font-medium">IGST</td>
                    <td className="py-2 text-right">{formatCurrency(summary.totalIgstCollected)}</td>
                    <td className="py-2 text-right text-green-600">-{formatCurrency(summary.totalIgstPaid)}</td>
                    <td className="py-2 text-right font-semibold">{formatCurrency(summary.netIgstLiability)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">CGST</td>
                    <td className="py-2 text-right">{formatCurrency(summary.totalCgstCollected)}</td>
                    <td className="py-2 text-right text-green-600">-{formatCurrency(summary.totalCgstPaid)}</td>
                    <td className="py-2 text-right font-semibold">{formatCurrency(summary.netCgstLiability)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">SGST</td>
                    <td className="py-2 text-right">{formatCurrency(summary.totalSgstCollected)}</td>
                    <td className="py-2 text-right text-green-600">-{formatCurrency(summary.totalSgstPaid)}</td>
                    <td className="py-2 text-right font-semibold">{formatCurrency(summary.netSgstLiability)}</td>
                  </tr>
                  <tr className="font-bold text-base">
                    <td className="py-3">Total</td>
                    <td className="py-3 text-right">
                      {formatCurrency(summary.totalIgstCollected + summary.totalCgstCollected + summary.totalSgstCollected)}
                    </td>
                    <td className="py-3 text-right text-green-600">
                      -{formatCurrency(summary.totalIgstPaid + summary.totalCgstPaid + summary.totalSgstPaid)}
                    </td>
                    <td className="py-3 text-right text-red-700">{formatCurrency(summary.totalLiability)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
