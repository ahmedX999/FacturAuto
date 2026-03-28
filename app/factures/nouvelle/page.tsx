'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAllClients,
  getAllProducts,
  getProduct,
  addInvoice,
  generateInvoiceNumber,
  getSettings,
  Client,
  Product,
  Settings,
} from '@/lib/db';
import { useInvoiceForm, useNotification } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, Trash2, ChevronDown } from 'lucide-react';

export default function NewInvoice() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const { clientId, items, addItem, removeItem, updateItemQuantity, clearForm } =
    useInvoiceForm();
  const { show: showNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const cls = await getAllClients();
    const prds = await getAllProducts();
    const stngs = await getSettings();
    
    setClients(cls);
    setProducts(prds);
    setSettings(stngs || null);
  }

  function filteredProducts() {
    if (!searchProductQuery) return products;
    const query = searchProductQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.nom.toLowerCase().includes(query) ||
        p.reference.toLowerCase().includes(query)
    );
  }

  function handleAddItem() {
    if (!selectedProduct) {
      showNotification('Veuillez sélectionner un produit', 'error');
      return;
    }

    if (selectedProduct.stock <= 0) {
      showNotification('Stock insuffisant', 'error');
      return;
    }

    if (quantity <= 0 || quantity > selectedProduct.stock) {
      showNotification('Quantité invalide', 'error');
      return;
    }

    addItem({
      productId: selectedProduct.id || 0,
      quantite: quantity,
      prix_unitaire: selectedProduct.prix,
      nomProduit: selectedProduct.nom,
    });

    setSelectedProduct(null);
    setQuantity(1);
    setSearchProductQuery('');
    showNotification('Produit ajouté', 'success');
  }

  function calculateTotals() {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantite * item.prix_unitaire,
      0
    );
    const tva = 20;
    return {
      subtotal,
      tva,
      total: subtotal,
    };
  }

  async function handleCreateInvoice() {
    if (!selectedClient) {
      showNotification('Veuillez sélectionner un client', 'error');
      return;
    }

    if (items.length === 0) {
      showNotification('Veuillez ajouter des produits', 'error');
      return;
    }

    setLoading(true);

    try {
      const { subtotal, tva, total } = calculateTotals();
      const invoiceNumber = await generateInvoiceNumber();

      await addInvoice({
        numero_facture: invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        clientId: selectedClient.id || 0,
        items,
        subtotal,
        tva,
        total,
        statut: 'non payée',
      });

      clearForm();
      showNotification('Facture créée avec succès', 'success');
      router.push('/factures');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Erreur lors de la création', 'error');
    } finally {
      setLoading(false);
    }
  }

  const { subtotal, tva, total } = calculateTotals();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Nouvelle facture</h1>

      {/* Client Selection */}
      <div className="card">
        <label className="label">Client *</label>
        <div className="relative mb-2">
          <button
            onClick={() => setShowClientDropdown(!showClientDropdown)}
            className="input w-full text-left flex items-center justify-between pl-3"
          >
            <span>
              {selectedClient?.nom || 'Sélectionnez un client'}
            </span>
            <ChevronDown size={20} />
          </button>

          {showClientDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-40 max-h-48 overflow-y-auto">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setShowClientDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0"
                >
                  <div className="font-medium">{client.nom}</div>
                  <div className="text-sm text-gray-600">{client.telephone}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Selection */}
      <div className="card">
        <label className="label">Ajouter des produits</label>

        {/* Product Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchProductQuery}
            onChange={(e) => setSearchProductQuery(e.target.value)}
            onFocus={() => setShowProductDropdown(true)}
            className="input"
          />

          {showProductDropdown && filteredProducts().length > 0 && (
            <div className="absolute left-4 right-4 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-40 max-h-48 overflow-y-auto">
              {filteredProducts().map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowProductDropdown(false);
                    setSearchProductQuery('');
                  }}
                  disabled={product.stock <= 0}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-medium">{product.nom}</div>
                  <div className="text-sm text-gray-600">
                    {product.reference} • {formatCurrency(product.prix)} •
                    Stock: {product.stock}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Product */}
        {selectedProduct && (
          <div className="border-t pt-3 space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="font-bold">{selectedProduct.nom}</h3>
              <p className="text-sm text-gray-600">
                Prix: {formatCurrency(selectedProduct.prix)}
              </p>
              <p className="text-sm text-gray-600">
                Stock disponible: {selectedProduct.stock}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Quantité:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 text-center border-0 focus:ring-0"
                  min="1"
                  max={selectedProduct.stock}
                />
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(selectedProduct.stock, quantity + 1)
                    )
                  }
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddItem}
              className="btn btn-primary w-full justify-center"
            >
              Ajouter à la facture
            </button>
          </div>
        )}
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="card">
          <h3 className="font-bold mb-3">Produits ({items.length})</h3>
          <div className="space-y-2 border-t pt-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.nomProduit}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.prix_unitaire)} × {item.quantite} ={' '}
                    {formatCurrency(item.prix_unitaire * item.quantite)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateItemQuantity(
                          index,
                          Math.max(1, item.quantite - 1)
                        )
                      }
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantite}
                    </span>
                    <button
                      onClick={() =>
                        updateItemQuantity(index, item.quantite + 1)
                      }
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      {items.length > 0 && (
        <div className="card bg-blue-50 border-2 border-blue-200">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Sous-total:</span>
              <span className="font-medium">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-blue-200 pt-2">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => router.back()}
          className="btn btn-secondary flex-1 justify-center"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          onClick={handleCreateInvoice}
          className="btn btn-primary flex-1 justify-center"
          disabled={loading || items.length === 0 || !selectedClient}
        >
          {loading ? 'Création...' : 'Créer facture'}
        </button>
      </div>
    </div>
  );
}
