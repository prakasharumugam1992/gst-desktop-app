import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit, Users, Phone, MapPin } from 'lucide-react';
import Header from '../Layout/Header';
import { getParties, deleteParty } from '../../store/store';
import { formatCurrency } from '../../utils/gst';
import { Party } from '../../types';

export default function PartyList() {
  const navigate = useNavigate();
  const [parties, setParties] = useState<Party[]>(getParties());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'customer' | 'supplier'>('all');

  const filtered = parties.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.gstin.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      deleteParty(id);
      setParties(getParties());
    }
  };

  return (
    <div>
      <Header title="Parties" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search parties..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-72"
              />
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(['all', 'customer', 'supplier'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    filter === f ? 'bg-white shadow-sm font-medium' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}s
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => navigate('/parties/new')} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Party
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No parties found</h3>
            <p className="text-sm text-gray-400 mb-4">Add your customers and suppliers to get started.</p>
            <button onClick={() => navigate('/parties/new')} className="btn-primary">
              Add Your First Party
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(party => (
              <div key={party.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      party.type === 'customer' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {party.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{party.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        party.type === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {party.type === 'customer' ? 'Customer' : 'Supplier'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/parties/edit/${party.id}`)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(party.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {party.gstin && (
                  <p className="text-xs text-gray-500 mb-2">GSTIN: {party.gstin}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  {party.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {party.phone}
                    </span>
                  )}
                  {party.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {party.city}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Balance</span>
                  <span className={`font-semibold ${party.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(party.balance))}
                    {party.balance < 0 ? ' Dr' : ' Cr'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
