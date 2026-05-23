import { useState } from 'react';
import {
  ShoppingBag, UtensilsCrossed, Pill, Monitor, Shirt, Apple, Wrench, Car, Settings,
  Check, Plus, X, Save,
} from 'lucide-react';
import Header from '../Layout/Header';
import { getIndustrySettings, saveIndustrySettings } from '../../store/store';
import { INDUSTRY_CONFIGS, getIndustryConfig } from '../../config/industries';
import { IndustryType, CustomField, IndustrySettings as IndustrySettingsType } from '../../types';

const ICON_MAP: Record<string, typeof ShoppingBag> = {
  ShoppingBag, UtensilsCrossed, Pill, Monitor, Shirt, Apple, Wrench, Car, Settings,
};

export default function IndustrySettingsPage() {
  const [settings, setSettings] = useState<IndustrySettingsType>(getIndustrySettings());
  const [newCategory, setNewCategory] = useState('');
  const [newField, setNewField] = useState<CustomField>({ key: '', label: '', type: 'text' });
  const [showAddField, setShowAddField] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentConfig = getIndustryConfig(settings.selectedIndustry);

  const handleSelectIndustry = (industryId: IndustryType) => {
    const config = getIndustryConfig(industryId);
    setSettings(prev => ({
      ...prev,
      selectedIndustry: industryId,
      customFields: industryId === 'custom' ? prev.customFields : [],
      categories: prev.categories.length > 1 ? prev.categories : config.commonHsnCodes.length > 0
        ? ['General', ...config.commonHsnCodes.map(h => h.description)]
        : ['General'],
    }));
  };

  const handleAddCategory = () => {
    const cat = newCategory.trim();
    if (cat && !settings.categories.includes(cat)) {
      setSettings(prev => ({
        ...prev,
        categories: [...prev.categories, cat],
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== cat),
    }));
  };

  const handleAddCustomField = () => {
    if (!newField.label.trim()) return;
    const key = newField.label.toLowerCase().replace(/\s+/g, '_');
    setSettings(prev => ({
      ...prev,
      customFields: [...prev.customFields, { ...newField, key, label: newField.label.trim() }],
    }));
    setNewField({ key: '', label: '', type: 'text' });
    setShowAddField(false);
  };

  const handleRemoveCustomField = (key: string) => {
    setSettings(prev => ({
      ...prev,
      customFields: prev.customFields.filter(f => f.key !== key),
    }));
  };

  const handleSave = () => {
    saveIndustrySettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <Header title="Industry Settings" />
      <div className="p-6 max-w-5xl">
        {/* Industry Selection */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Your Industry</h3>
          <p className="text-sm text-gray-500 mb-4">
            Choose your industry to get preconfigured fields, HSN codes, and categories.
            You can further customize after selection.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {INDUSTRY_CONFIGS.map(config => {
              const IconComponent = ICON_MAP[config.icon] || Settings;
              const isSelected = settings.selectedIndustry === config.id;
              return (
                <button
                  key={config.id}
                  onClick={() => handleSelectIndustry(config.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <IconComponent className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                  <p className="font-semibold text-sm">{config.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{config.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Industry-Specific Fields */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Fields for {currentConfig.name}
          </h3>

          {currentConfig.customFields.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Built-in Fields</h4>
              <div className="flex flex-wrap gap-2">
                {currentConfig.customFields.map(field => (
                  <span
                    key={field.key}
                    className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full"
                  >
                    {field.label}
                    <span className="text-primary-400">({field.type})</span>
                    {field.required && <span className="text-red-500">*</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Custom Fields</h4>
            {settings.customFields.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {settings.customFields.map(field => (
                  <span
                    key={field.key}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full"
                  >
                    {field.label} ({field.type})
                    <button
                      onClick={() => handleRemoveCustomField(field.key)}
                      className="ml-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-3">No custom fields added.</p>
            )}

            {showAddField ? (
              <div className="flex items-end gap-2 bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <label className="label-field">Field Name</label>
                  <input
                    type="text"
                    value={newField.label}
                    onChange={e => setNewField(prev => ({ ...prev, label: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Color, Batch No."
                    autoFocus
                  />
                </div>
                <div className="w-32">
                  <label className="label-field">Type</label>
                  <select
                    value={newField.type}
                    onChange={e => setNewField(prev => ({ ...prev, type: e.target.value as CustomField['type'] }))}
                    className="select-field"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Dropdown</option>
                  </select>
                </div>
                <button onClick={handleAddCustomField} className="btn-primary text-sm px-3">
                  Add
                </button>
                <button onClick={() => setShowAddField(false)} className="btn-secondary text-sm px-3">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddField(true)}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Custom Field
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Product Categories</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {settings.categories.map(cat => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full"
              >
                {cat}
                {settings.categories.length > 1 && (
                  <button
                    onClick={() => handleRemoveCategory(cat)}
                    className="ml-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              placeholder="New category name"
              className="input-field w-64"
            />
            <button onClick={handleAddCategory} className="btn-secondary text-sm">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Common HSN Codes */}
        {currentConfig.commonHsnCodes.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Common HSN Codes</h3>
            <div className="grid grid-cols-2 gap-2">
              {currentConfig.commonHsnCodes.map(hsn => (
                <div key={hsn.code} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <span className="font-mono text-sm text-primary-700 font-medium w-16">{hsn.code}</span>
                  <span className="text-sm text-gray-600">{hsn.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
