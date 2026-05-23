import { useState } from 'react';
import { Search, Receipt, Calendar, Banknote, CreditCard, Smartphone, BookOpen } from 'lucide-react';
import Header from '../Layout/Header';
import { getBills } from '../../store/store';
import { formatCurrency } from '../../utils/gst';
import { Bill } from '../../types';
import { format } from 'date-fns';

const PAYMENT_ICONS = {
  cash: Banknote,
  card: CreditCard,
  upi: Smartphone,
  credit: BookOpen,
};

export default function BillHistory() {
  const [bills] = useState<Bill[]>(getBills().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  const [search, setSearch] = useState('');
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  const filtered = bills.filter(b =>
    b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.customerName.toLowerCase().includes(search.toLowerCase()) ||
    b.customerPhone.includes(search)
  );

  const totalRevenue = filtered.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.grandTotal, 0);

  return (
    <div>
      <Header title="Bill History" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by bill #, customer..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-80"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <span className="text-sm text-gray-500">Total Bills</span>
            <span className="text-2xl font-bold mt-1">{filtered.length}</span>
          </div>
          <div className="stat-card">
            <span className="text-sm text-gray-500">Revenue</span>
            <span className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="stat-card">
            <span className="text-sm text-gray-500">Avg. Bill Value</span>
            <span className="text-2xl font-bold mt-1">
              {formatCurrency(filtered.length > 0 ? totalRevenue / filtered.length : 0)}
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No bills yet</h3>
            <p className="text-sm text-gray-400">Bills created from Quick Billing will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(bill => {
              const PaymentIcon = PAYMENT_ICONS[bill.paymentMode];
              const isExpanded = expandedBill === bill.id;
              return (
                <div key={bill.id} className="card p-0 overflow-hidden">
                  <button
                    onClick={() => setExpandedBill(isExpanded ? null : bill.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{bill.billNumber}</p>
                        <p className="text-xs text-gray-400">{bill.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(bill.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <PaymentIcon className="w-3 h-3" />
                        {bill.paymentMode.toUpperCase()}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        bill.status === 'completed' ? 'bg-green-100 text-green-700' :
                        bill.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {bill.status}
                      </span>
                      <span className="font-bold text-lg">{formatCurrency(bill.grandTotal)}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 border-t border-gray-100">
                      <table className="w-full text-sm mt-3">
                        <thead className="text-xs text-gray-500 uppercase">
                          <tr>
                            <th className="text-left py-1">Item</th>
                            <th className="text-center py-1">Qty</th>
                            <th className="text-right py-1">Price</th>
                            <th className="text-right py-1">GST</th>
                            <th className="text-right py-1">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {bill.items.map(item => (
                            <tr key={item.id}>
                              <td className="py-1.5">{item.productName}</td>
                              <td className="py-1.5 text-center">{item.quantity}</td>
                              <td className="py-1.5 text-right">{formatCurrency(item.sellingPrice)}</td>
                              <td className="py-1.5 text-right">{item.gstRate}%</td>
                              <td className="py-1.5 text-right font-medium">{formatCurrency(item.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-2 pt-2 border-t text-sm flex justify-end gap-6">
                        <span className="text-gray-500">Tax: {formatCurrency(bill.totalTax)}</span>
                        <span className="font-bold">Total: {formatCurrency(bill.grandTotal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
