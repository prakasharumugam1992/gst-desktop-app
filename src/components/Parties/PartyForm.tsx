import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Save, ArrowLeft } from 'lucide-react';
import Header from '../Layout/Header';
import { Party, INDIAN_STATES } from '../../types';
import { getPartyById, saveParty } from '../../store/store';
import { validateGSTIN } from '../../utils/gst';

export default function PartyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [party, setParty] = useState<Party>({
    id: uuidv4(),
    name: '',
    gstin: '',
    pan: '',
    type: 'customer',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    stateCode: '',
    pincode: '',
    balance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      const existing = getPartyById(id);
      if (existing) {
        setParty(existing);
      }
    }
  }, [id]);

  const handleChange = (field: keyof Party, value: string | number) => {
    setParty(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleStateChange = (stateName: string) => {
    const state = INDIAN_STATES.find(s => s.name === stateName);
    setParty(prev => ({
      ...prev,
      state: stateName,
      stateCode: state?.code || '',
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!party.name.trim()) newErrors.name = 'Party name is required';
    if (party.gstin && !validateGSTIN(party.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    saveParty({
      ...party,
      updatedAt: new Date().toISOString(),
    });
    navigate('/parties');
  };

  return (
    <div>
      <Header title={isEdit ? 'Edit Party' : 'Add New Party'} />
      <div className="p-6 max-w-3xl">
        <button
          onClick={() => navigate('/parties')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Parties
        </button>

        <div className="card">
          <div className="mb-6">
            <label className="label-field">Party Type</label>
            <div className="flex gap-4">
              {(['customer', 'supplier'] as const).map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="partyType"
                    value={type}
                    checked={party.type === type}
                    onChange={e => handleChange('type', e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-field">Party Name *</label>
              <input
                type="text"
                value={party.name}
                onChange={e => handleChange('name', e.target.value)}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter party name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label-field">GSTIN</label>
              <input
                type="text"
                value={party.gstin}
                onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
                className={`input-field ${errors.gstin ? 'border-red-500' : ''}`}
                placeholder="e.g., 27AAPFU0939F1ZV"
                maxLength={15}
              />
              {errors.gstin && <p className="text-xs text-red-500 mt-1">{errors.gstin}</p>}
            </div>

            <div>
              <label className="label-field">PAN</label>
              <input
                type="text"
                value={party.pan}
                onChange={e => handleChange('pan', e.target.value.toUpperCase())}
                className="input-field"
                placeholder="e.g., AAPFU0939F"
                maxLength={10}
              />
            </div>

            <div>
              <label className="label-field">Phone</label>
              <input
                type="tel"
                value={party.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="input-field"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="label-field">Email</label>
              <input
                type="email"
                value={party.email}
                onChange={e => handleChange('email', e.target.value)}
                className="input-field"
                placeholder="Enter email"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label-field">Address</label>
              <textarea
                value={party.address}
                onChange={e => handleChange('address', e.target.value)}
                className="input-field"
                rows={2}
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="label-field">City</label>
              <input
                type="text"
                value={party.city}
                onChange={e => handleChange('city', e.target.value)}
                className="input-field"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="label-field">State</label>
              <select
                value={party.state}
                onChange={e => handleStateChange(e.target.value)}
                className="select-field"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => (
                  <option key={s.code} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">Pincode</label>
              <input
                type="text"
                value={party.pincode}
                onChange={e => handleChange('pincode', e.target.value)}
                className="input-field"
                placeholder="Enter pincode"
                maxLength={6}
              />
            </div>

            <div>
              <label className="label-field">Opening Balance</label>
              <input
                type="number"
                value={party.balance}
                onChange={e => handleChange('balance', parseFloat(e.target.value) || 0)}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isEdit ? 'Update Party' : 'Save Party'}
            </button>
            <button onClick={() => navigate('/parties')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
