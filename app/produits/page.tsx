'use client';

import { useEffect, useState } from 'react';
import { getAllProducts, getProductsByCategory, Product } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { useNotification } from '@/lib/store';
import { Search, Edit2, Trash2 } from 'lucide-react';
import FloatingActionButton from '@/components/FloatingActionButton';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList';

const CATEGORIES = ['Moteur', 'Freinage', 'Suspension', 'Électrique', 'Carrosserie', 'Transmission', 'Refroidissement', 'Accessoires', 'Autre'];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { show: showNotification } = useNotification();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  async function loadProducts() {
    const prods = await getAllProducts();
    setProducts(prods);
    setLoading(false);
  }

  function filterProducts() {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categorie === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nom.toLowerCase().includes(query) ||
          p.reference.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setShowForm(true);
  }

  function handleDelete(product: Product) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.nom}"?`)) {
      // Delete will be called from ProductForm after edit
      loadProducts();
      showNotification('Produit supprimé', 'success');
    }
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Produits</h1>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher par nom ou référence..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === ''
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tous
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products List */}
      {showForm ? (
        <ProductForm
          product={editingProduct || undefined}
          onClose={handleFormClose}
        />
      ) : (
        <>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun produit trouvé
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="card flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{product.nom}</h3>
                    <p className="text-sm text-gray-500">{product.reference}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-gray-600">
                        {product.categorie}
                      </span>
                      <span
                        className={`font-medium ${
                          product.stock > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-blue-600">
                      {formatCurrency(product.prix)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <FloatingActionButton
        href="#"
        tooltip="Nouveau produit"
      />
      {!showForm && (
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="fixed bottom-24 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl active:scale-95 z-40"
        >
          <span className="text-2xl">+</span>
        </button>
      )}
    </div>
  );
}
