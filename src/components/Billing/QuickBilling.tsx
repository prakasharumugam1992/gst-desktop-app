import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import {
  Barcode, Search, Plus, Minus, CreditCard, Banknote, Smartphone,
  BookOpen, ShoppingCart, Printer, X, Check,
} from 'lucide-react';
import Header from '../Layout/Header';
import {
  getProductByBarcode, searchProducts, saveBill, getNextBillNumber,
  getProducts, getBusinessProfile, saveProduct,
} from '../../store/store';
import { formatCurrency } from '../../utils/gst';
import { BillItem, Bill, Product } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { renderBarcodeSVG } from '../../utils/barcode';

export default function QuickBilling() {
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<Bill['paymentMode']>('cash');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastBill, setLastBill] = useState<Bill | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const business = getBusinessProfile();

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const addProductToBill = useCallback((product: Product, quantity = 1) => {
    setBillItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? recalcItem({ ...item, quantity: item.quantity + quantity })
            : item
        );
      }
      const newItem: BillItem = {
        id: uuidv4(),
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        hsnCode: product.hsnCode,
        quantity,
        unit: product.unit,
        mrp: product.mrp,
        sellingPrice: product.sellingPrice,
        discount: 0,
        gstRate: product.gstRate,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: 0,
      };
      return [...prev, recalcItem(newItem)];
    });
  }, []);

  const handleBarcodeScan = useCallback((code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const product = getProductByBarcode(trimmed);
    if (product) {
      addProductToBill(product);
      setBarcodeInput('');
    } else {
      setBarcodeInput('');
      alert(`Product not found for barcode: ${trimmed}`);
    }
  }, [addProductToBill]);

  const handleBarcodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBarcodeScan(barcodeInput);
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchResults(searchProducts(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const updateItemQuantity = (itemId: string, delta: number) => {
    setBillItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return recalcItem({ ...item, quantity: newQty });
      })
    );
  };

  const updateItemDiscount = (itemId: string, discount: number) => {
    setBillItems(prev =>
      prev.map(item =>
        item.id === itemId ? recalcItem({ ...item, discount }) : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setBillItems(prev => prev.filter(item => item.id !== itemId));
  };

  const subtotal = billItems.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalDiscount = billItems.reduce((sum, item) => {
    const gross = item.quantity * item.sellingPrice;
    return sum + (gross * item.discount) / 100;
  }, 0);
  const totalCgst = billItems.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSgst = billItems.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIgst = billItems.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;
  const grandTotal = Math.round(subtotal + totalTax);
  const roundOff = grandTotal - (subtotal + totalTax);

  const handleCompleteBill = () => {
    if (billItems.length === 0) return;

    const bill: Bill = {
      id: uuidv4(),
      billNumber: getNextBillNumber(),
      billDate: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      items: billItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      totalCgst: Math.round(totalCgst * 100) / 100,
      totalSgst: Math.round(totalSgst * 100) / 100,
      totalIgst: Math.round(totalIgst * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal,
      roundOff: Math.round(roundOff * 100) / 100,
      paymentMode,
      isInterState: false,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    saveBill(bill);

    const allProducts = getProducts();
    billItems.forEach(item => {
      const product = allProducts.find(p => p.id === item.productId);
      if (product) {
        saveProduct({ ...product, stock: Math.max(0, product.stock - item.quantity), updatedAt: new Date().toISOString() });
      }
    });

    setLastBill(bill);
    setShowSuccess(true);
    setBillItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setBarcodeInput('');

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePrintBill = () => {
    if (!lastBill) return;
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) return;

    const barcodeHtml = lastBill.billNumber
      ? renderBarcodeSVG(lastBill.billNumber.replace(/[^0-9A-Za-z]/g, ''), 250, 40)
      : '';

    w.document.write(`<!DOCTYPE html><html><head><title>Bill ${lastBill.billNumber}</title>
      <style>
        body{font-family:monospace;font-size:12px;max-width:300px;margin:0 auto;padding:10px}
        h2{text-align:center;margin:0}
        .center{text-align:center}
        .line{border-top:1px dashed #000;margin:8px 0}
        table{width:100%;border-collapse:collapse}
        td{padding:2px 0}
        .right{text-align:right}
        .bold{font-weight:bold}
        .barcode-container{text-align:center;margin:8px 0}
      </style></head><body>`);
    w.document.write(`<h2>${business?.businessName || 'GST Filing App'}</h2>`);
    if (business?.address) w.document.write(`<p class="center">${business.address}</p>`);
    if (business?.gstin) w.document.write(`<p class="center">GSTIN: ${business.gstin}</p>`);
    w.document.write(`<div class="line"></div>`);
    w.document.write(`<p>Bill #: ${lastBill.billNumber}</p>`);
    w.document.write(`<p>Date: ${new Date(lastBill.billDate).toLocaleString('en-IN')}</p>`);
    w.document.write(`<p>Customer: ${lastBill.customerName}</p>`);
    w.document.write(`<div class="line"></div>`);
    w.document.write(`<table><tr class="bold"><td>Item</td><td class="right">Qty</td><td class="right">Price</td><td class="right">Amount</td></tr>`);
    lastBill.items.forEach(item => {
      w.document.write(`<tr><td>${item.productName}</td><td class="right">${item.quantity}</td><td class="right">${item.sellingPrice.toFixed(2)}</td><td class="right">${item.totalAmount.toFixed(2)}</td></tr>`);
    });
    w.document.write(`</table><div class="line"></div>`);
    w.document.write(`<table>
      <tr><td>Subtotal</td><td class="right">${lastBill.subtotal.toFixed(2)}</td></tr>
      <tr><td>CGST</td><td class="right">${lastBill.totalCgst.toFixed(2)}</td></tr>
      <tr><td>SGST</td><td class="right">${lastBill.totalSgst.toFixed(2)}</td></tr>
      ${lastBill.totalIgst > 0 ? `<tr><td>IGST</td><td class="right">${lastBill.totalIgst.toFixed(2)}</td></tr>` : ''}
      <tr><td>Round Off</td><td class="right">${lastBill.roundOff.toFixed(2)}</td></tr>
      <tr class="bold"><td>TOTAL</td><td class="right">Rs. ${lastBill.grandTotal.toFixed(2)}</td></tr>
      <tr><td>Payment</td><td class="right">${lastBill.paymentMode.toUpperCase()}</td></tr>
    </table>`);
    if (barcodeHtml) {
      w.document.write(`<div class="barcode-container">${barcodeHtml}</div>`);
    }
    w.document.write(`<div class="line"></div><p class="center">Thank you! Visit Again.</p>`);
    w.document.write(`</body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div>
      <Header title="Quick Billing (POS)" />
      <div className="p-4 flex gap-4 h-[calc(100vh-4rem)]">
        {/* Left: Items & Scanner */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Barcode Scanner Input */}
          <div className="card mb-4 p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Barcode className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" />
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeKeyDown}
                  placeholder="Scan barcode or type barcode number and press Enter"
                  className="input-field pl-11 text-lg font-mono"
                  autoFocus
                />
              </div>
              <button
                onClick={() => { setShowSearch(!showSearch); setTimeout(() => searchRef.current?.focus(), 100); }}
                className="btn-secondary flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {showSearch && (
              <div className="mt-3 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products by name, SKU, category..."
                  className="input-field pl-10"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(product => (
                      <button
                        key={product.id}
                        onClick={() => {
                          addProductToBill(product);
                          setSearchQuery('');
                          setSearchResults([]);
                          barcodeRef.current?.focus();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-primary-50 flex justify-between items-center border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-400">
                            {product.barcode} | {product.category} | Stock: {product.stock}
                          </p>
                        </div>
                        <span className="font-semibold text-sm">{formatCurrency(product.sellingPrice)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bill Items Table */}
          <div className="card flex-1 overflow-auto p-0">
            {billItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="w-16 h-16 mb-3" />
                <p className="text-lg">No items added</p>
                <p className="text-sm">Scan a barcode or search for products</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="table-header sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="px-3 py-2 text-right">Disc %</th>
                    <th className="px-3 py-2 text-right">GST</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {billItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.barcode}</p>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateItemQuantity(item.id, -1)}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, 1)}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.sellingPrice)}</td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          value={item.discount || ''}
                          onChange={e => updateItemDiscount(item.id, Number(e.target.value))}
                          className="w-14 text-right border border-gray-200 rounded px-1 py-0.5 text-sm"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-xs">
                        <span className="bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded">{item.gstRate}%</span>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.totalAmount)}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeItem(item.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Bill Summary & Payment */}
        <div className="w-80 flex flex-col gap-4">
          {/* Customer Info */}
          <div className="card p-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Customer (Optional)</h4>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="input-field mb-2"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="Phone number"
              className="input-field"
            />
          </div>

          {/* Bill Summary */}
          <div className="card p-4 flex-1">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Bill Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Items</span>
                <span className="font-medium">{billItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Qty</span>
                <span className="font-medium">{billItems.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">CGST</span>
                <span>{formatCurrency(totalCgst)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SGST</span>
                <span>{formatCurrency(totalSgst)}</span>
              </div>
              {totalIgst > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">IGST</span>
                  <span>{formatCurrency(totalIgst)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400">
                <span>Round Off</span>
                <span>{roundOff >= 0 ? '+' : ''}{formatCurrency(roundOff)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-700">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Mode */}
          <div className="card p-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Payment Mode</h4>
            <div className="grid grid-cols-2 gap-2">
              {([
                { mode: 'cash' as const, icon: Banknote, label: 'Cash' },
                { mode: 'card' as const, icon: CreditCard, label: 'Card' },
                { mode: 'upi' as const, icon: Smartphone, label: 'UPI' },
                { mode: 'credit' as const, icon: BookOpen, label: 'Credit' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    paymentMode === mode
                      ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCompleteBill}
              disabled={billItems.length === 0}
              className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Complete Bill — {formatCurrency(grandTotal)}
            </button>
            {lastBill && (
              <button
                onClick={handlePrintBill}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Last Bill
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && lastBill && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-pulse z-50">
          <Check className="w-5 h-5" />
          <span>Bill {lastBill.billNumber} saved — {formatCurrency(lastBill.grandTotal)}</span>
        </div>
      )}
    </div>
  );
}

function recalcItem(item: BillItem): BillItem {
  const gross = item.quantity * item.sellingPrice;
  const discountAmt = (gross * item.discount) / 100;
  const taxableAmount = gross - discountAmt;
  const totalGst = (taxableAmount * item.gstRate) / 100;
  const cgstAmount = totalGst / 2;
  const sgstAmount = totalGst / 2;
  const igstAmount = 0;
  const totalAmount = taxableAmount + totalGst;

  return {
    ...item,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    igstAmount,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}
