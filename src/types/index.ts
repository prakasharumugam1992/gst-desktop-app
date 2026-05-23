export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  businessName: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Party {
  id: string;
  name: string;
  gstin: string;
  pan: string;
  type: 'customer' | 'supplier';
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  type: 'sales' | 'purchase';
  partyId: string;
  partyName: string;
  partyGstin: string;
  placeOfSupply: string;
  isInterState: boolean;
  items: InvoiceItem[];
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  totalAmount: number;
  roundOff: number;
  grandTotal: number;
  notes: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface GSTSummary {
  totalSales: number;
  totalPurchases: number;
  totalCgstCollected: number;
  totalSgstCollected: number;
  totalIgstCollected: number;
  totalCgstPaid: number;
  totalSgstPaid: number;
  totalIgstPaid: number;
  netCgstLiability: number;
  netSgstLiability: number;
  netIgstLiability: number;
  totalLiability: number;
}

export type GSTRate = 0 | 0.25 | 3 | 5 | 12 | 18 | 28;

export const GST_RATES: GSTRate[] = [0, 0.25, 3, 5, 12, 18, 28];

export const INDIAN_STATES: { code: string; name: string }[] = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh (Old)' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
];

export const UNITS = [
  'NOS', 'PCS', 'KGS', 'GMS', 'LTR', 'MTR', 'SQM', 'CBM',
  'BOX', 'BAG', 'BTL', 'BDL', 'SET', 'PAC', 'DOZ', 'ROL',
  'TON', 'QTL', 'UNT',
];

export type IndustryType =
  | 'retail'
  | 'restaurant'
  | 'pharmacy'
  | 'electronics'
  | 'textiles'
  | 'grocery'
  | 'hardware'
  | 'automotive'
  | 'custom';

export interface CustomField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required?: boolean;
}

export interface IndustryConfig {
  id: IndustryType;
  name: string;
  description: string;
  icon: string;
  defaultUnit: string;
  defaultGstRate: GSTRate;
  customFields: CustomField[];
  commonHsnCodes: { code: string; description: string }[];
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  sku: string;
  hsnCode: string;
  description: string;
  category: string;
  unit: string;
  mrp: number;
  sellingPrice: number;
  purchasePrice: number;
  gstRate: GSTRate;
  stock: number;
  lowStockAlert: number;
  customFields: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  gstRate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  billDate: string;
  customerName: string;
  customerPhone: string;
  items: BillItem[];
  subtotal: number;
  totalDiscount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  grandTotal: number;
  roundOff: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'credit';
  isInterState: boolean;
  status: 'completed' | 'cancelled' | 'returned';
  createdAt: string;
}

export interface IndustrySettings {
  selectedIndustry: IndustryType;
  customFields: CustomField[];
  categories: string[];
}
