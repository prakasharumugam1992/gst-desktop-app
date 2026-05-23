import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Building2, Download } from 'lucide-react';
import Header from '../Layout/Header';
import { getInvoiceById, getBusinessProfile } from '../../store/store';
import { formatCurrency } from '../../utils/gst';
import { format } from 'date-fns';
import { downloadInvoiceAsText } from '../../utils/export';

export default function InvoiceView() {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const invoice = id ? getInvoiceById(id) : undefined;
  const business = getBusinessProfile();

  if (!invoice) {
    return (
      <div>
        <Header title="Invoice Not Found" />
        <div className="p-6 text-center">
          <p className="text-gray-500">Invoice not found.</p>
          <button onClick={() => navigate(-1)} className="btn-primary mt-4">Go Back</button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Header title={`Invoice ${invoice.invoiceNumber}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/invoices/${type}`)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => downloadInvoiceAsText(invoice, business)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm">
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <div className="card max-w-4xl mx-auto print:shadow-none print:border-none" id="invoice-print">
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-primary-600">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-primary-800">
                  {business?.businessName || 'Your Business'}
                </h2>
              </div>
              {business && (
                <div className="text-sm text-gray-600 space-y-0.5">
                  {business.address && <p>{business.address}</p>}
                  <p>{[business.city, business.state, business.pincode].filter(Boolean).join(', ')}</p>
                  {business.phone && <p>Phone: {business.phone}</p>}
                  {business.email && <p>Email: {business.email}</p>}
                  <p className="font-medium">GSTIN: {business.gstin}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                {invoice.type === 'sales' ? 'TAX INVOICE' : 'PURCHASE INVOICE'}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}</p>
                <p><span className="font-medium">Date:</span> {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}</p>
                <p><span className="font-medium">Due Date:</span> {format(new Date(invoice.dueDate), 'dd MMM yyyy')}</p>
              </div>
              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                invoice.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-500 mb-2">
              {invoice.type === 'sales' ? 'Bill To' : 'Bill From'}
            </h4>
            <p className="font-semibold text-gray-800">{invoice.partyName}</p>
            {invoice.partyGstin && <p className="text-sm text-gray-600">GSTIN: {invoice.partyGstin}</p>}
            <p className="text-sm text-gray-600">Place of Supply: {invoice.placeOfSupply}</p>
          </div>

          <table className="w-full mb-6 text-sm">
            <thead>
              <tr className="bg-primary-50 text-primary-800">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2">HSN</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Taxable</th>
                <th className="px-3 py-2 text-right">GST %</th>
                {invoice.isInterState ? (
                  <th className="px-3 py-2 text-right">IGST</th>
                ) : (
                  <>
                    <th className="px-3 py-2 text-right">CGST</th>
                    <th className="px-3 py-2 text-right">SGST</th>
                  </>
                )}
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium">{item.description}</td>
                  <td className="px-3 py-2 text-center">{item.hsnCode || '-'}</td>
                  <td className="px-3 py-2 text-right">{item.quantity} {item.unit}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.rate)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.taxableAmount)}</td>
                  <td className="px-3 py-2 text-right">{item.gstRate}%</td>
                  {invoice.isInterState ? (
                    <td className="px-3 py-2 text-right">{formatCurrency(item.igstAmount)}</td>
                  ) : (
                    <>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.cgstAmount)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.sgstAmount)}</td>
                    </>
                  )}
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.isInterState ? (
                <div className="flex justify-between">
                  <span className="text-gray-500">IGST</span>
                  <span>{formatCurrency(invoice.totalIgst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CGST</span>
                    <span>{formatCurrency(invoice.totalCgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">SGST</span>
                    <span>{formatCurrency(invoice.totalSgst)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Round Off</span>
                <span>{formatCurrency(invoice.roundOff)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total</span>
                <span className="text-primary-600">{formatCurrency(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          {business?.bankName && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Bank Details</h4>
              <div className="text-sm text-gray-700 space-y-0.5">
                <p>Bank: {business.bankName}</p>
                <p>A/C No: {business.accountNumber}</p>
                <p>IFSC: {business.ifscCode}</p>
              </div>
            </div>
          )}

          {invoice.notes && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-1">Notes / Terms</h4>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          <div className="text-center text-xs text-gray-400 pt-4 border-t">
            Generated by GST Filing App
          </div>
        </div>
      </div>
    </div>
  );
}
