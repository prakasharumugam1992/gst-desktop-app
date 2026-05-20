import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Save, Building2 } from 'lucide-react';
import Header from '../Layout/Header';
import { BusinessProfile as BusinessProfileType, INDIAN_STATES } from '../../types';
import { getBusinessProfile, saveBusinessProfile } from '../../store/store';
import { validateGSTIN } from '../../utils/gst';

export default function BusinessProfile() {
  const [profile, setProfile] = useState<BusinessProfileType>({
    id: uuidv4(),
    businessName: '',
    gstin: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    stateCode: '',
    pincode: '',
    phone: '',
    email: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const existing = getBusinessProfile();
    if (existing) {
      setProfile(existing);
    }
  }, []);

  const handleChange = (field: keyof BusinessProfileType, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
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
    setProfile(prev => ({
      ...prev,
      state: stateName,
      stateCode: state?.code || '',
    }));
    setSaved(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!profile.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!profile.gstin.trim()) {
      newErrors.gstin = 'GSTIN is required';
    } else if (!validateGSTIN(profile.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format';
    }
    if (!profile.state) newErrors.state = 'State is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const updatedProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    saveBusinessProfile(updatedProfile);
    setProfile(updatedProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <Header title="Business Profile" />
      <div className="p-6 max-w-4xl">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Business Information</h3>
              <p className="text-sm text-gray-500">Configure your business details for GST invoicing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-field">Business Name *</label>
              <input
                type="text"
                value={profile.businessName}
                onChange={e => handleChange('businessName', e.target.value)}
                className={`input-field ${errors.businessName ? 'border-red-500' : ''}`}
                placeholder="Enter your business name"
              />
              {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>}
            </div>

            <div>
              <label className="label-field">GSTIN *</label>
              <input
                type="text"
                value={profile.gstin}
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
                value={profile.pan}
                onChange={e => handleChange('pan', e.target.value.toUpperCase())}
                className="input-field"
                placeholder="e.g., AAPFU0939F"
                maxLength={10}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label-field">Address</label>
              <textarea
                value={profile.address}
                onChange={e => handleChange('address', e.target.value)}
                className="input-field"
                rows={2}
                placeholder="Enter business address"
              />
            </div>

            <div>
              <label className="label-field">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={e => handleChange('city', e.target.value)}
                className="input-field"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="label-field">State *</label>
              <select
                value={profile.state}
                onChange={e => handleStateChange(e.target.value)}
                className={`select-field ${errors.state ? 'border-red-500' : ''}`}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => (
                  <option key={s.code} value={s.name}>{s.name}</option>
                ))}
              </select>
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="label-field">Pincode</label>
              <input
                type="text"
                value={profile.pincode}
                onChange={e => handleChange('pincode', e.target.value)}
                className="input-field"
                placeholder="Enter pincode"
                maxLength={6}
              />
            </div>

            <div>
              <label className="label-field">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="input-field"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="label-field">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => handleChange('email', e.target.value)}
                className="input-field"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h4 className="text-md font-semibold mb-4">Bank Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Bank Name</label>
                <input
                  type="text"
                  value={profile.bankName}
                  onChange={e => handleChange('bankName', e.target.value)}
                  className="input-field"
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <label className="label-field">Account Number</label>
                <input
                  type="text"
                  value={profile.accountNumber}
                  onChange={e => handleChange('accountNumber', e.target.value)}
                  className="input-field"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="label-field">IFSC Code</label>
                <input
                  type="text"
                  value={profile.ifscCode}
                  onChange={e => handleChange('ifscCode', e.target.value.toUpperCase())}
                  className="input-field"
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Profile
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">Profile saved successfully!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
