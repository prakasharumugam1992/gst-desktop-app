import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, IndianRupee, Download } from 'lucide-react';
import Header from '../Layout/Header';
import { getInvoices } from '../../store/store';
import { formatCurrency } from '../../utils/gst';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { downloadInvoicesCSV, downloadReportCSV } from '../../utils/export';

type ReportType = 'sales' | 'purchase' | 'gst' | 'party';

export default function Reports() {
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [startDate, setStartDate] = useState(
    format(startOfMonth(subMonths(new Date(), 2)), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  const allInvoices = getInvoices();
  const filteredInvoices = useMemo(
    () => allInvoices.filter(inv => {
      const date = new Date(inv.invoiceDate);
      return date >= new Date(startDate) && date <= new Date(endDate) && inv.status !== 'cancelled';
    }),
    [allInvoices, startDate, endDate]
  );

  const salesInvoices = filteredInvoices.filter(i => i.type === 'sales');
  const purchaseInvoices = filteredInvoices.filter(i => i.type === 'purchase');

  const totalSales = salesInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalPurchases = purchaseInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalSalesTax = salesInvoices.reduce((s, i) => s + i.totalTax, 0);
  const totalPurchaseTax = purchaseInvoices.reduce((s, i) => s + i.totalTax, 0);

  const handleDownload = () => {
    if (activeReport === 'sales') {
      downloadInvoicesCSV(salesInvoices);
    } else if (activeReport === 'purchase') {
      downloadInvoicesCSV(purchaseInvoices);
    } else if (activeReport === 'gst') {
      downloadReportCSV(
        'GST Monthly Report',
        ['Month', 'Sales', 'Purchases', 'Net', 'Total Tax'],
        monthlyBreakdown.map(row => ({
          label: format(new Date(row.month + '-01'), 'MMMM yyyy'),
          values: [
            String(row.sales),
            String(row.purchases),
            String(row.sales - row.purchases),
            String(row.tax),
          ],
        }))
      );
    } else {
      downloadReportCSV(
        'Party-wise Report',
        ['Party Name', 'Type', 'Invoices', 'Total Amount', 'Total Tax'],
        partyReport.map(row => ({
          label: `"${row.name}"`,
          values: [
            row.type === 'sales' ? 'Customer' : 'Supplier',
            String(row.invoiceCount),
            String(row.totalAmount),
            String(row.totalTax),
          ],
        }))
      );
    }
  };

  const reportTabs: { key: ReportType; label: string }[] = [
    { key: 'sales', label: 'Sales Report' },
    { key: 'purchase', label: 'Purchase Report' },
    { key: 'gst', label: 'GST Report' },
    { key: 'party', label: 'Party-wise Report' },
  ];

  const partyReport = useMemo(() => {
    const partyMap: Record<string, {
      name: string;
      type: string;
      invoiceCount: number;
      totalAmount: number;
      totalTax: number;
    }> = {};

    filteredInvoices.forEach(inv => {
      if (!partyMap[inv.partyId]) {
        partyMap[inv.partyId] = {
          name: inv.partyName,
          type: inv.type,
          invoiceCount: 0,
          totalAmount: 0,
          totalTax: 0,
        };
      }
      partyMap[inv.partyId].invoiceCount++;
      partyMap[inv.partyId].totalAmount += inv.grandTotal;
      partyMap[inv.partyId].totalTax += inv.totalTax;
    });

    return Object.values(partyMap).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredInvoices]);

  const monthlyBreakdown = useMemo(() => {
    const monthMap: Record<string, { sales: number; purchases: number; tax: number }> = {};

    filteredInvoices.forEach(inv => {
      const key = format(new Date(inv.invoiceDate), 'yyyy-MM');
      if (!monthMap[key]) {
        monthMap[key] = { sales: 0, purchases: 0, tax: 0 };
      }
      if (inv.type === 'sales') {
        monthMap[key].sales += inv.grandTotal;
      } else {
        monthMap[key].purchases += inv.grandTotal;
      }
      monthMap[key].tax += inv.totalTax;
    });

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  }, [filteredInvoices]);

  return (
    <div>
      <Header title="Reports" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {reportTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveReport(tab.key)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  activeReport === tab.key ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="input-field w-auto text-sm"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="input-field w-auto text-sm"
            />
            <button
              onClick={() => handleDownload()}
              className="btn-secondary flex items-center gap-2 text-sm"
              title="Download report"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-500">Total Sales</span>
            </div>
            <span className="text-xl font-bold">{formatCurrency(totalSales)}</span>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-500">Total Purchases</span>
            </div>
            <span className="text-xl font-bold">{formatCurrency(totalPurchases)}</span>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-500">Net Revenue</span>
            </div>
            <span className="text-xl font-bold">{formatCurrency(totalSales - totalPurchases)}</span>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-500">Total GST</span>
            </div>
            <span className="text-xl font-bold">{formatCurrency(totalSalesTax + totalPurchaseTax)}</span>
          </div>
        </div>

        {activeReport === 'sales' && (
          <InvoiceReport invoices={salesInvoices} title="Sales Report" />
        )}

        {activeReport === 'purchase' && (
          <InvoiceReport invoices={purchaseInvoices} title="Purchase Report" />
        )}

        {activeReport === 'gst' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Monthly GST Breakdown</h3>
            {monthlyBreakdown.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No data for this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="px-3 py-2 text-left">Month</th>
                    <th className="px-3 py-2 text-right">Sales</th>
                    <th className="px-3 py-2 text-right">Purchases</th>
                    <th className="px-3 py-2 text-right">Net</th>
                    <th className="px-3 py-2 text-right">Total Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlyBreakdown.map(row => (
                    <tr key={row.month} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">
                        {format(new Date(row.month + '-01'), 'MMMM yyyy')}
                      </td>
                      <td className="px-3 py-2 text-right text-green-600">{formatCurrency(row.sales)}</td>
                      <td className="px-3 py-2 text-right text-red-600">{formatCurrency(row.purchases)}</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {formatCurrency(row.sales - row.purchases)}
                      </td>
                      <td className="px-3 py-2 text-right">{formatCurrency(row.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeReport === 'party' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Party-wise Summary</h3>
            {partyReport.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No data for this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="px-3 py-2 text-left">Party Name</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2 text-right">Invoices</th>
                    <th className="px-3 py-2 text-right">Total Amount</th>
                    <th className="px-3 py-2 text-right">Total Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partyReport.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{row.name}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          row.type === 'sales' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {row.type === 'sales' ? 'Customer' : 'Supplier'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">{row.invoiceCount}</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(row.totalAmount)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(row.totalTax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceReport({ invoices, title }: { invoices: ReturnType<typeof getInvoices>; title: string }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {invoices.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No invoices for this period.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="px-3 py-2 text-left">Invoice #</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Party</th>
              <th className="px-3 py-2 text-right">Taxable</th>
              <th className="px-3 py-2 text-right">CGST</th>
              <th className="px-3 py-2 text-right">SGST</th>
              <th className="px-3 py-2 text-right">IGST</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{inv.invoiceNumber}</td>
                <td className="px-3 py-2">{format(new Date(inv.invoiceDate), 'dd/MM/yyyy')}</td>
                <td className="px-3 py-2">{inv.partyName}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(inv.subtotal)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(inv.totalCgst)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(inv.totalSgst)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(inv.totalIgst)}</td>
                <td className="px-3 py-2 text-right font-semibold">{formatCurrency(inv.grandTotal)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-3 py-2" colSpan={3}>Total</td>
              <td className="px-3 py-2 text-right">{formatCurrency(invoices.reduce((s, i) => s + i.subtotal, 0))}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(invoices.reduce((s, i) => s + i.totalCgst, 0))}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(invoices.reduce((s, i) => s + i.totalSgst, 0))}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(invoices.reduce((s, i) => s + i.totalIgst, 0))}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(invoices.reduce((s, i) => s + i.grandTotal, 0))}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
