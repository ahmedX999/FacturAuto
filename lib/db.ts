import Dexie, { Table } from 'dexie';

export interface Product {
  id?: number;
  nom: string;
  reference: string;
  categorie: 'Moteur' | 'Freinage' | 'Suspension' | 'Électrique' | 'Autre';
  prix: number;
  stock: number;
}

export interface Client {
  id?: number;
  nom: string;
  telephone: string;
  adresse?: string;
}

export interface InvoiceItem {
  id?: number;
  invoiceId: number;
  productId: number;
  quantite: number;
  prix_unitaire: number;
}

export interface Invoice {
  id?: number;
  numero_facture: string;
  date: string;
  clientId: number;
  items: InvoiceItem[];
  subtotal: number;
  tva: number;
  total: number;
  statut: 'payée' | 'non payée';
}

export interface Settings {
  id?: number;
  nomMagasin: string;
  adresse: string;
  telephone: string;
  tauxTVA: number;
  lastInvoiceNumber: number;
}

export class FacturationDB extends Dexie {
  products!: Table<Product>;
  clients!: Table<Client>;
  invoices!: Table<Invoice>;
  settings!: Table<Settings>;

  constructor() {
    super('FacturationDB');
    this.version(1).stores({
      products: '++id, reference, categorie',
      clients: '++id, nom',
      invoices: '++id, numero_facture, date, clientId',
      settings: '++id',
    });
  }
}

export const db = new FacturationDB();

// Initialize default settings
export async function initializeSettings() {
  const count = await db.settings.count();
  if (count === 0) {
    await db.settings.add({
      nomMagasin: 'Mon Auto-Pièces',
      adresse: 'Adresse du magasin',
      telephone: '+33 1 23 45 67 89',
      tauxTVA: 20,
      lastInvoiceNumber: 0,
    });
  }
}

// CRUD Operations para Products
export async function addProduct(product: Omit<Product, 'id'>) {
  return await db.products.add(product as Product);
}

export async function updateProduct(id: number, product: Partial<Product>) {
  return await db.products.update(id, product);
}

export async function deleteProduct(id: number) {
  return await db.products.delete(id);
}

export async function getProduct(id: number) {
  return await db.products.get(id);
}

export async function getAllProducts() {
  return await db.products.toArray();
}

export async function searchProducts(query: string) {
  return await db.products
    .where('reference')
    .startsWithIgnoreCase(query)
    .toArray();
}

export async function getProductsByCategory(categorie: string) {
  return await db.products.where('categorie').equals(categorie).toArray();
}

// CRUD Operations for Clients
export async function addClient(client: Omit<Client, 'id'>) {
  return await db.clients.add(client as Client);
}

export async function updateClient(id: number, client: Partial<Client>) {
  return await db.clients.update(id, client);
}

export async function deleteClient(id: number) {
  return await db.clients.delete(id);
}

export async function getClient(id: number) {
  return await db.clients.get(id);
}

export async function getAllClients() {
  return await db.clients.toArray();
}

export async function searchClients(query: string) {
  return await db.clients
    .where('nom')
    .startsWithIgnoreCase(query)
    .toArray();
}

// CRUD Operations for Invoices
export async function addInvoice(invoice: Omit<Invoice, 'id'>) {
  const id = await db.invoices.add(invoice as Invoice);
  
  // Decrease stock for each item
  for (const item of invoice.items) {
    const product = await db.products.get(item.productId);
    if (product) {
      await db.products.update(item.productId, {
        stock: product.stock - item.quantite,
      });
    }
  }
  
  return id;
}

export async function updateInvoice(id: number, invoice: Partial<Invoice>) {
  return await db.invoices.update(id, invoice);
}

export async function deleteInvoice(id: number) {
  return await db.invoices.delete(id);
}

export async function getInvoice(id: number) {
  return await db.invoices.get(id);
}

export async function getAllInvoices() {
  return await db.invoices.toArray();
}

export async function getInvoicesByClient(clientId: number) {
  return await db.invoices.where('clientId').equals(clientId).toArray();
}

export async function getInvoicesByDate(date: string) {
  return await db.invoices.where('date').equals(date).toArray();
}

// Invoice numbering
export async function generateInvoiceNumber(): Promise<string> {
  const settings = await db.settings.toArray();
  if (settings.length === 0) {
    await initializeSettings();
  }
  
  const setting = settings[0];
  const newNumber = (setting.lastInvoiceNumber || 0) + 1;
  await db.settings.update(setting.id!, {
    lastInvoiceNumber: newNumber,
  });
  
  const year = new Date().getFullYear();
  return `FACT-${year}-${String(newNumber).padStart(4, '0')}`;
}

// Settings
export async function getSettings() {
  const settings = await db.settings.toArray();
  if (settings.length === 0) {
    await initializeSettings();
    return await db.settings.toArray();
  }
  return settings[0];
}

export async function updateSettings(settings: Partial<Settings>) {
  const allSettings = await db.settings.toArray();
  if (allSettings.length === 0) {
    await initializeSettings();
  }
  const id = allSettings[0]?.id || 1;
  return await db.settings.update(id, settings);
}

// Backup & Restore
export async function exportData() {
  const products = await db.products.toArray();
  const clients = await db.clients.toArray();
  const invoices = await db.invoices.toArray();
  const settings = await db.settings.toArray();

  return {
    version: 1,
    exportDate: new Date().toISOString(),
    data: {
      products,
      clients,
      invoices,
      settings,
    },
  };
}

export async function importData(backup: any) {
  try {
    // Clear existing data
    await db.products.clear();
    await db.clients.clear();
    await db.invoices.clear();
    await db.settings.clear();

    // Import new data
    if (backup.data.products?.length > 0) {
      await db.products.bulkAdd(backup.data.products);
    }
    if (backup.data.clients?.length > 0) {
      await db.clients.bulkAdd(backup.data.clients);
    }
    if (backup.data.invoices?.length > 0) {
      await db.invoices.bulkAdd(backup.data.invoices);
    }
    if (backup.data.settings?.length > 0) {
      await db.settings.bulkAdd(backup.data.settings);
    } else {
      await initializeSettings();
    }

    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}
