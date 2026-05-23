import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Header from '../Layout/Header';
import { getProductById, saveProduct, getIndustrySettings } from '../../store/store';
import { GST_RATES, UNITS, Product, GSTRate } from '../../types';
import { getIndustryConfig } from '../../config/industries';
import { generateBarcode } from '../../utils/barcode';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const existing = id ? getProductById(id) : undefined;
  const industrySettings = getIndustrySettings();
  const industryConfig = getIndustryConfig(industrySettings.selectedIndustry);

  const allFields = [...industryConfig.customFields, ...industrySettings.customFields];

  const [form, setForm] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: existing?.name || '',
    barcode: existing?.barcode || '',
    sku: existing?.sku || '',
    hsnCode: existing?.hsnCode || '',
    description: existing?.description || '',
    category: existing?.category || industrySettings.categories[0] || 'General',
    unit: existing?.unit || industryConfig.defaultUnit,
    mrp: existing?.mrp || 0,
    sellingPrice: existing?.sellingPrice || 0,
    purchasePrice: existing?.purchasePrice || 0,
    gstRate: existing?.gstRate || industryConfig.defaultGstRate,
    stock: existing?.stock || 0,
    lowStockAlert: existing?.lowStockAlert || 10,
    customFields: existing?.customFields || {},
    isActive: existing?.isActive ?? true,
  });

  const [error, setError] = useState('');

  const handleChange = (key: keyof typeof form, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCustomField = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      customFields: { ...prev.customFields, [key]: value },
    }));
  };

  const handleGenerateBarcode = () => {
    setForm(prev => ({ ...prev, barcode: generateBarcode() }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (form.sellingPrice <= 0) {
      setError('Selling price must be greater than 0.');
      return;
    }

    const now = new Date().toISOString();
    const product: Product = {
      id: existing?.id || uuidv4(),
      ...form,
      name: form.name.trim(),
      barcode: form.barcode.trim() || generateBarcode(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    saveProduct(product);
    navigate('/products');
  };

  return (
    <div>
      <Header title={existing ? 'Edit Product' : 'Add Product'} />
      <div className="p-6">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label-field">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="input-field"
                  placeholder="Enter product name"
                  autoFocus
                />
              </div>

              <div>
                <label className="label-field">Barcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={e => handleChange('barcode', e.target.value)}
                    className="input-field"
                    placeholder="Scan or enter barcode"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="btn-secondary text-xs whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="label-field">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={e => handleChange('sku', e.target.value)}
                  className="input-field"
                  placeholder="Stock Keeping Unit"
                />
              </div>

              <div>
                <label className="label-field">HSN Code</label>
                <div>
                  <input
                    type="text"
                    value={form.hsnCode}
                    onChange={e => handleChange('hsnCode', e.target.value)}
                    className="input-field"
                    placeholder="HSN/SAC Code"
                    list="hsn-codes"
                  />
                  {industryConfig.commonHsnCodes.length > 0 && (
                    <datalist id="hsn-codes">
                      {industryConfig.commonHsnCodes.map(h => (
                        <option key={h.code} value={h.code}>{h.description}</option>
                      ))}
                    </datalist>
                  )}
                </div>
              </div>

              <div>
                <label className="label-field">Category</label>
                <select
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="select-field"
                >
                  {industrySettings.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Unit</label>
                <select
                  value={form.unit}
                  onChange={e => handleChange('unit', e.target.value)}
                  className="select-field"
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">GST Rate (%)</label>
                <select
                  value={form.gstRate}
                  onChange={e => handleChange('gstRate', Number(e.target.value) as GSTRate)}
                  className="select-field"
                >
                  {GST_RATES.map(rate => (
                    <option key={rate} value={rate}>{rate}%</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="label-field">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Product description (optional)"
                />
              </div>
            </div>
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Pricing & Stock</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label-field">MRP (&#8377;)</label>
                <input
                  type="number"
                  value={form.mrp || ''}
                  onChange={e => handleChange('mrp', Number(e.target.value))}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label-field">Selling Price (&#8377;) *</label>
                <input
                  type="number"
                  value={form.sellingPrice || ''}
                  onChange={e => handleChange('sellingPrice', Number(e.target.value))}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label-field">Purchase Price (&#8377;)</label>
                <input
                  type="number"
                  value={form.purchasePrice || ''}
                  onChange={e => handleChange('purchasePrice', Number(e.target.value))}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label-field">Current Stock</label>
                <input
                  type="number"
                  value={form.stock || ''}
                  onChange={e => handleChange('stock', Number(e.target.value))}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="label-field">Low Stock Alert</label>
                <input
                  type="number"
                  value={form.lowStockAlert || ''}
                  onChange={e => handleChange('lowStockAlert', Number(e.target.value))}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
          </div>

          {allFields.length > 0 && (
            <div className="card mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {industryConfig.name} Fields
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {allFields.map(field => (
                  <div key={field.key}>
                    <label className="label-field">
                      {field.label} {field.required && '*'}
                    </label>
                    {field.type === 'select' && field.options ? (
                      <select
                        value={form.customFields[field.key] || ''}
                        onChange={e => handleCustomField(field.key, e.target.value)}
                        className="select-field"
                      >
                        <option value="">Select...</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                        value={form.customFields[field.key] || ''}
                        onChange={e => handleCustomField(field.key, e.target.value)}
                        className="input-field"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {existing ? 'Update Product' : 'Save Product'}
            </button>
            <button type="button" onClick={() => navigate('/products')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
