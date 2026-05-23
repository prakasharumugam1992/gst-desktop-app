import { BusinessProfile, Party, Invoice, User, Product, Bill, IndustrySettings } from '../types';

const STORAGE_KEYS = {
  BUSINESS: 'gst_app_business',
  PARTIES: 'gst_app_parties',
  INVOICES: 'gst_app_invoices',
  USERS: 'gst_app_users',
  CURRENT_USER: 'gst_app_current_user',
  PRODUCTS: 'gst_app_products',
  BILLS: 'gst_app_bills',
  INDUSTRY_SETTINGS: 'gst_app_industry_settings',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getBusinessProfile(): BusinessProfile | null {
  return getItem<BusinessProfile | null>(STORAGE_KEYS.BUSINESS, null);
}

export function saveBusinessProfile(profile: BusinessProfile): void {
  setItem(STORAGE_KEYS.BUSINESS, profile);
}

export function getParties(): Party[] {
  return getItem<Party[]>(STORAGE_KEYS.PARTIES, []);
}

export function saveParty(party: Party): void {
  const parties = getParties();
  const index = parties.findIndex(p => p.id === party.id);
  if (index >= 0) {
    parties[index] = party;
  } else {
    parties.push(party);
  }
  setItem(STORAGE_KEYS.PARTIES, parties);
}

export function deleteParty(id: string): void {
  const parties = getParties().filter(p => p.id !== id);
  setItem(STORAGE_KEYS.PARTIES, parties);
}

export function getPartyById(id: string): Party | undefined {
  return getParties().find(p => p.id === id);
}

export function getInvoices(): Invoice[] {
  return getItem<Invoice[]>(STORAGE_KEYS.INVOICES, []);
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  const index = invoices.findIndex(i => i.id === invoice.id);
  if (index >= 0) {
    invoices[index] = invoice;
  } else {
    invoices.push(invoice);
  }
  setItem(STORAGE_KEYS.INVOICES, invoices);
}

export function deleteInvoice(id: string): void {
  const invoices = getInvoices().filter(i => i.id !== id);
  setItem(STORAGE_KEYS.INVOICES, invoices);
}

export function getInvoiceById(id: string): Invoice | undefined {
  return getInvoices().find(i => i.id === id);
}

export function getInvoicesByParty(partyId: string): Invoice[] {
  return getInvoices().filter(i => i.partyId === partyId);
}

export function getInvoicesByType(type: 'sales' | 'purchase'): Invoice[] {
  return getInvoices().filter(i => i.type === type);
}

export function getInvoicesByDateRange(startDate: string, endDate: string): Invoice[] {
  return getInvoices().filter(i => {
    const date = new Date(i.invoiceDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });
}

export function getNextInvoiceCount(type: 'sales' | 'purchase'): number {
  return getInvoicesByType(type).length;
}

export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, []);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function registerUser(user: User): { success: boolean; error?: string } {
  const existing = getUserByEmail(user.email);
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }
  const users = getUsers();
  users.push(user);
  setItem(STORAGE_KEYS.USERS, users);
  return { success: true };
}

export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const user = getUserByEmail(email);
  if (!user) {
    return { success: false, error: 'No account found with this email.' };
  }
  if (user.password !== password) {
    return { success: false, error: 'Incorrect password.' };
  }
  setItem(STORAGE_KEYS.CURRENT_USER, user);
  return { success: true, user };
}

export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ---- Products ----

export function getProducts(): Product[] {
  return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
}

export function saveProduct(product: Product): void {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  setItem(STORAGE_KEYS.PRODUCTS, products);
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter(p => p.id !== id);
  setItem(STORAGE_KEYS.PRODUCTS, products);
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find(p => p.id === id);
}

export function getProductByBarcode(barcode: string): Product | undefined {
  return getProducts().find(p => p.barcode === barcode && p.isActive);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return getProducts().filter(p =>
    p.isActive && (
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  );
}

// ---- Bills ----

export function getBills(): Bill[] {
  return getItem<Bill[]>(STORAGE_KEYS.BILLS, []);
}

export function saveBill(bill: Bill): void {
  const bills = getBills();
  const index = bills.findIndex(b => b.id === bill.id);
  if (index >= 0) {
    bills[index] = bill;
  } else {
    bills.push(bill);
  }
  setItem(STORAGE_KEYS.BILLS, bills);
}

export function getBillById(id: string): Bill | undefined {
  return getBills().find(b => b.id === id);
}

export function getNextBillNumber(): string {
  const bills = getBills();
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const todayBills = bills.filter(b => b.billNumber.startsWith(`BILL/${dateStr}`));
  return `BILL/${dateStr}/${String(todayBills.length + 1).padStart(4, '0')}`;
}

// ---- Industry Settings ----

export function getIndustrySettings(): IndustrySettings {
  return getItem<IndustrySettings>(STORAGE_KEYS.INDUSTRY_SETTINGS, {
    selectedIndustry: 'retail',
    customFields: [],
    categories: ['General'],
  });
}

export function saveIndustrySettings(settings: IndustrySettings): void {
  setItem(STORAGE_KEYS.INDUSTRY_SETTINGS, settings);
}
