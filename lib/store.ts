import { create } from 'zustand';
import { Product, Client, Invoice, InvoiceItem } from './db';

interface InvoiceFormState {
  clientId: number | null;
  items: (InvoiceItem & { nomProduit?: string; prix_unitaire?: number })[];
  setClientId: (id: number) => void;
  addItem: (item: InvoiceItem & { nomProduit?: string; prix_unitaire?: number }) => void;
  removeItem: (index: number) => void;
  updateItemQuantity: (index: number, quantity: number) => void;
  clearForm: () => void;
}

export const useInvoiceForm = create<InvoiceFormState>((set) => ({
  clientId: null,
  items: [],
  setClientId: (id) => set({ clientId: id }),
  addItem: (item) =>
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.productId === item.productId
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex].quantite += item.quantite;
        return { items: newItems };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (index) =>
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    })),
  updateItemQuantity: (index, quantity) =>
    set((state) => {
      const newItems = [...state.items];
      newItems[index].quantite = quantity;
      return { items: newItems };
    }),
  clearForm: () => set({ clientId: null, items: [] }),
}));

interface SearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

export const useSearch = create<SearchState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchQuery: '' }),
}));

interface NotificationState {
  message: string | null;
  type: 'success' | 'error' | 'info';
  show: (message: string, type: 'success' | 'error' | 'info') => void;
  hide: () => void;
}

export const useNotification = create<NotificationState>((set) => ({
  message: null,
  type: 'info',
  show: (message, type) => {
    set({ message, type });
    setTimeout(() => set({ message: null }), 3000);
  },
  hide: () => set({ message: null }),
}));
