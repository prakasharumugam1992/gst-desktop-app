import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, Trash2, Eye, FileText } from 'lucide-react';
import Header from '../Layout/Header';
import { getInvoicesByType, deleteInvoice } from '../../store/store';
import { formatCurrency } from '../../utils/gst';
import { Invoice } from '../../types';
import { format } from 'date-fns';

export default function InvoiceList() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: 'sales' | 'purchase' }>();
  const invoiceType = type || 'sales';
  const [invoices, setInvoices] = useState<Invoice[]>(getInvoicesByType(invoiceType));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.partyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      setInvoices(getInvoicesByType(invoiceType));
    }
  };

  const totalAmount = filtered.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalTax = filtered.reduce((sum, inv) => sum + inv.totalTax, 0);

  const title = invoiceType === 'sales' ? 'Sales Invoices' : 'Purchase Invoices';

  return (
    <div>
      <Header title={title} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search invoices..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-72"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="select-field w-auto"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={() => navigate(`/invoices/${invoiceType}/new`)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New {invoiceType === 'sales' ? 'Sale' : 'Purchase'} Invoice
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <span className="text-sm text-gray-500">Total Invoices</span>
            <span className="text-2xl font-bold mt-1">{filtered.length}</span>
          </div>
          <div className="stat-card">
            <span className="text-sm text-gray-500">Total Amount</span>
            <span className="text-2xl font-bold mt-1">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="stat-card">
            <span className="text-sm text-gray-500">Total GST</span>
            <span className="text-2xl font-bold mt-1">{formatCurrency(totalTax)}</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No invoices yet</h3>
            <p className="text-sm text-gray-400 mb-4">
              Create your first {invoiceType} invoice to get started.
            </p>
            <button
              onClick={() => navigate(`/invoices/${invoiceType}/new`)}
              className="btn-primary"
            >
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Party</th>
                  <th className="px-4 py-3">GSTIN</th>
                  <th className="px-4 py-3 text-right">Taxable</th>
                  <th className="px-4 py-3 text-right">Tax</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{invoice.partyName}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{invoice.partyGstin || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(invoice.subtotal)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(invoice.totalTax)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(invoice.grandTotal)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        invoice.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/invoices/${invoiceType}/view/${invoice.id}`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
