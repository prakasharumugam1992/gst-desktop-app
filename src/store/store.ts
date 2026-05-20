import { BusinessProfile, Party, Invoice } from '../types';

const STORAGE_KEYS = {
  BUSINESS: 'gst_app_business',
  PARTIES: 'gst_app_parties',
  INVOICES: 'gst_app_invoices',
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
