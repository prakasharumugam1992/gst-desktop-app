import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  FileText,
  ShoppingCart,
  Users,
  AlertCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import Header from '../Layout/Header';
import { getInvoices, getParties, getBusinessProfile } from '../../store/store';
import { calculateGSTSummary, formatCurrency } from '../../utils/gst';

export default function Dashboard() {
  const navigate = useNavigate();
  const invoices = getInvoices();
  const parties = getParties();
  const business = getBusinessProfile();
  const summary = calculateGSTSummary(invoices);

  const salesInvoices = invoices.filter(i => i.type === 'sales');
  const purchaseInvoices = invoices.filter(i => i.type === 'purchase');
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const quickActions = [
    { label: 'New Sale Invoice', icon: Plus, color: 'bg-blue-500', onClick: () => navigate('/invoices/sales/new') },
    { label: 'New Purchase', icon: ShoppingCart, color: 'bg-green-500', onClick: () => navigate('/invoices/purchase/new') },
    { label: 'Add Party', icon: Users, color: 'bg-purple-500', onClick: () => navigate('/parties/new') },
    { label: 'GST Returns', icon: FileText, color: 'bg-orange-500', onClick: () => navigate('/returns') },
  ];

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {!business && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Business profile not set up</p>
              <p className="text-xs text-amber-600">Set up your business profile with GSTIN to start creating invoices.</p>
            </div>
            <button onClick={() => navigate('/business')} className="btn-primary text-sm">
              Set Up Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Total Sales</span>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalSales)}</p>
            <p className="text-xs text-gray-500 mt-1">{salesInvoices.length} invoices</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Total Purchases</span>
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalPurchases)}</p>
            <p className="text-xs text-gray-500 mt-1">{purchaseInvoices.length} invoices</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">GST Liability</span>
              <div className="p-2 bg-amber-100 rounded-lg">
                <IndianRupee className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalLiability)}</p>
            <p className="text-xs text-gray-500 mt-1">Net payable</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Total Parties</span>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{parties.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {parties.filter(p => p.type === 'customer').length} customers, {parties.filter(p => p.type === 'supplier').length} suppliers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Invoices</h3>
              <button
                onClick={() => navigate('/invoices/sales')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No invoices yet. Create your first invoice!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3">Party</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{invoice.partyName}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              invoice.type === 'sales'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {invoice.type === 'sales' ? 'Sale' : 'Purchase'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{formatCurrency(invoice.grandTotal)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : invoice.status === 'sent'
                                ? 'bg-blue-100 text-blue-700'
                                : invoice.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all"
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-3">GST Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">CGST Collected</span>
                  <span className="font-medium text-green-600">{formatCurrency(summary.totalCgstCollected)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SGST Collected</span>
                  <span className="font-medium text-green-600">{formatCurrency(summary.totalSgstCollected)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IGST Collected</span>
                  <span className="font-medium text-green-600">{formatCurrency(summary.totalIgstCollected)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">CGST ITC</span>
                  <span className="font-medium text-red-600">-{formatCurrency(summary.totalCgstPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SGST ITC</span>
                  <span className="font-medium text-red-600">-{formatCurrency(summary.totalSgstPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IGST ITC</span>
                  <span className="font-medium text-red-600">-{formatCurrency(summary.totalIgstPaid)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Net Liability</span>
                  <span className="text-primary-600">{formatCurrency(summary.totalLiability)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
