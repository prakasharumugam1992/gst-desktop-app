import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Save, ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react';
import Header from '../Layout/Header';
import { Invoice, InvoiceItem, GST_RATES, UNITS, INDIAN_STATES } from '../../types';
import { getParties, saveInvoice, getBusinessProfile, getNextInvoiceCount } from '../../store/store';
import { calculateItemTax, calculateInvoiceTotals, generateInvoiceNumber, formatCurrency } from '../../utils/gst';

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: 'sales' | 'purchase' }>();
  const invoiceType = type || 'sales';
  const business = getBusinessProfile();
  const parties = getParties().filter(p =>
    invoiceType === 'sales' ? p.type === 'customer' : p.type === 'supplier'
  );

  const [invoice, setInvoice] = useState<Invoice>({
    id: uuidv4(),
    invoiceNumber: generateInvoiceNumber(invoiceType, getNextInvoiceCount(invoiceType)),
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: invoiceType,
    partyId: '',
    partyName: '',
    partyGstin: '',
    placeOfSupply: business?.state || '',
    isInterState: false,
    items: [],
    subtotal: 0,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 0,
    totalTax: 0,
    totalAmount: 0,
    roundOff: 0,
    grandTotal: 0,
    notes: '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePartyChange = (partyId: string) => {
    const party = parties.find(p => p.id === partyId);
    if (party) {
      const isInterState = business?.stateCode !== party.stateCode && party.stateCode !== '';
      setInvoice(prev => ({
        ...prev,
        partyId: party.id,
        partyName: party.name,
        partyGstin: party.gstin,
        placeOfSupply: party.state,
        isInterState,
      }));
      recalculateItems(invoice.items, isInterState);
    }
  };

  const handlePlaceOfSupplyChange = (stateName: string) => {
    const state = INDIAN_STATES.find(s => s.name === stateName);
    const isInterState = business?.stateCode !== state?.code;
    setInvoice(prev => ({
      ...prev,
      placeOfSupply: stateName,
      isInterState,
    }));
    recalculateItems(invoice.items, isInterState);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: uuidv4(),
      description: '',
      hsnCode: '',
      quantity: 1,
      unit: 'NOS',
      rate: 0,
      discount: 0,
      taxableAmount: 0,
      gstRate: 18,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalAmount: 0,
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (itemId: string) => {
    const updatedItems = invoice.items.filter(i => i.id !== itemId);
    const totals = calculateInvoiceTotals(updatedItems);
    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
      ...totals,
    }));
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoice.items.map(item => {
      if (item.id !== itemId) return item;
      const updated = { ...item, [field]: value };
      return calculateItemTax(updated, invoice.isInterState);
    });
    const totals = calculateInvoiceTotals(updatedItems);
    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
      ...totals,
    }));
  };

  const recalculateItems = (items: InvoiceItem[], isInterState: boolean) => {
    const updatedItems = items.map(item => calculateItemTax(item, isInterState));
    const totals = calculateInvoiceTotals(updatedItems);
    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
      ...totals,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!invoice.partyId) newErrors.partyId = 'Please select a party';
    if (invoice.items.length === 0) newErrors.items = 'Add at least one item';
    if (invoice.items.some(i => !i.description.trim())) newErrors.itemDesc = 'All items must have a description';
    if (invoice.items.some(i => i.rate <= 0)) newErrors.itemRate = 'All items must have a rate > 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (status: Invoice['status'] = 'draft') => {
    if (!validate()) return;
    const updatedInvoice = {
      ...invoice,
      status,
      updatedAt: new Date().toISOString(),
    };
    saveInvoice(updatedInvoice);
    navigate(`/invoices/${invoiceType}`);
  };

  const title = invoiceType === 'sales' ? 'New Sales Invoice' : 'New Purchase Invoice';

  return (
    <div>
      <Header title={title} />
      <div className="p-6">
        <button
          onClick={() => navigate(`/invoices/${invoiceType}`)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {invoiceType === 'sales' ? 'Sales' : 'Purchase'} Invoices
        </button>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="label-field">Invoice Number</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={e => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Invoice Date</label>
                <input
                  type="date"
                  value={invoice.invoiceDate}
                  onChange={e => setInvoice(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={e => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Status</label>
                <select
                  value={invoice.status}
                  onChange={e => setInvoice(prev => ({ ...prev, status: e.target.value as Invoice['status'] }))}
                  className="select-field"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Party Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label-field">
                  {invoiceType === 'sales' ? 'Customer' : 'Supplier'} *
                </label>
                <select
                  value={invoice.partyId}
                  onChange={e => handlePartyChange(e.target.value)}
                  className={`select-field ${errors.partyId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Party</option>
                  {parties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.gstin ? `(${p.gstin})` : ''}</option>
                  ))}
                </select>
                {errors.partyId && <p className="text-xs text-red-500 mt-1">{errors.partyId}</p>}
              </div>
              <div>
                <label className="label-field">Place of Supply</label>
                <select
                  value={invoice.placeOfSupply}
                  onChange={e => handlePlaceOfSupplyChange(e.target.value)}
                  className="select-field"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  invoice.isInterState ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                  {invoice.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Items</h3>
              <button onClick={addItem} className="btn-primary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            {errors.itemDesc && <p className="text-xs text-red-500 mb-2">{errors.itemDesc}</p>}
            {errors.itemRate && <p className="text-xs text-red-500 mb-2">{errors.itemRate}</p>}

            {invoice.items.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <Calculator className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">No items added. Click "Add Item" to begin.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header">
                      <th className="px-2 py-2 text-left">Description</th>
                      <th className="px-2 py-2">HSN</th>
                      <th className="px-2 py-2">Qty</th>
                      <th className="px-2 py-2">Unit</th>
                      <th className="px-2 py-2">Rate</th>
                      <th className="px-2 py-2">Disc %</th>
                      <th className="px-2 py-2">GST %</th>
                      <th className="px-2 py-2">Taxable</th>
                      <th className="px-2 py-2">Tax</th>
                      <th className="px-2 py-2">Total</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoice.items.map(item => (
                      <tr key={item.id}>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={e => updateItem(item.id, 'description', e.target.value)}
                            className="input-field text-xs"
                            placeholder="Item name"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={item.hsnCode}
                            onChange={e => updateItem(item.id, 'hsnCode', e.target.value)}
                            className="input-field text-xs w-20"
                            placeholder="HSN"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="input-field text-xs w-16"
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={item.unit}
                            onChange={e => updateItem(item.id, 'unit', e.target.value)}
                            className="select-field text-xs w-20"
                          >
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="input-field text-xs w-24"
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={e => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="input-field text-xs w-16"
                            min="0"
                            max="100"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={item.gstRate}
                            onChange={e => updateItem(item.id, 'gstRate', parseFloat(e.target.value))}
                            className="select-field text-xs w-20"
                          >
                            {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2 text-right text-xs font-medium whitespace-nowrap">
                          {formatCurrency(item.taxableAmount)}
                        </td>
                        <td className="px-2 py-2 text-right text-xs whitespace-nowrap">
                          {invoice.isInterState
                            ? formatCurrency(item.igstAmount)
                            : formatCurrency(item.cgstAmount + item.sgstAmount)}
                        </td>
                        <td className="px-2 py-2 text-right text-xs font-semibold whitespace-nowrap">
                          {formatCurrency(item.totalAmount)}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {invoice.items.length > 0 && (
            <div className="card">
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.isInterState ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">IGST</span>
                      <span>{formatCurrency(invoice.totalIgst)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">CGST</span>
                        <span>{formatCurrency(invoice.totalCgst)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">SGST</span>
                        <span>{formatCurrency(invoice.totalSgst)}</span>
                      </div>
                    </>
                  )}
                  <hr />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Tax</span>
                    <span className="font-medium">{formatCurrency(invoice.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
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
            </div>
          )}

          <div className="card">
            <label className="label-field">Notes / Terms</label>
            <textarea
              value={invoice.notes}
              onChange={e => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
              className="input-field"
              rows={3}
              placeholder="Add any notes or terms & conditions..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => handleSave('draft')} className="btn-secondary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
            <button onClick={() => handleSave('sent')} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save & Send
            </button>
            <button onClick={() => navigate(`/invoices/${invoiceType}`)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
