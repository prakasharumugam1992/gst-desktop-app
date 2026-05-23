import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit2, Package, AlertTriangle, Barcode } from 'lucide-react';
import Header from '../Layout/Header';
import { getProducts, deleteProduct, getIndustrySettings } from '../../store/store';
import { formatCurrency } from '../../utils/gst';
import { Product } from '../../types';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const industrySettings = getIndustrySettings();

  const categories = ['all', ...industrySettings.categories];

  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeProducts = filtered.filter(p => p.isActive);
  const lowStockCount = activeProducts.filter(p => p.stock <= p.lowStockAlert).length;
  const totalValue = activeProducts.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      setProducts(getProducts());
    }
  };

  return (
    <div>
      <Header title="Product Catalog" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, barcode, SKU..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-80"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="select-field w-auto"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => navigate('/products/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <span className="text-sm text-gray-500">Total Products</span>
            <span className="text-2xl font-bold mt-1">{activeProducts.length}</span>
          </div>
          <div className="stat-card">
            <span className="text-sm text-gray-500">Stock Value</span>
            <span className="text-2xl font-bold mt-1">{formatCurrency(totalValue)}</span>
          </div>
          <div className="stat-card">
            <span className="text-sm text-gray-500">Categories</span>
            <span className="text-2xl font-bold mt-1">{industrySettings.categories.length}</span>
          </div>
          <div className="stat-card">
            <span className="text-sm text-gray-500">Low Stock</span>
            <span className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {lowStockCount}
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No products yet</h3>
            <p className="text-sm text-gray-400 mb-4">
              Add products to your catalog to start billing.
            </p>
            <button onClick={() => navigate('/products/new')} className="btn-primary">
              Add Product
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Barcode</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">MRP</th>
                  <th className="px-4 py-3 text-right">Selling Price</th>
                  <th className="px-4 py-3 text-center">GST</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(product => (
                  <tr key={product.id} className={`hover:bg-gray-50 ${!product.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs font-mono text-gray-600">
                        <Barcode className="w-3 h-3" />
                        {product.barcode || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(product.mrp)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(product.sellingPrice)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                        {product.gstRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 ${
                        product.stock <= product.lowStockAlert ? 'text-red-600' : 'text-gray-800'
                      }`}>
                        {product.stock <= product.lowStockAlert && (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
