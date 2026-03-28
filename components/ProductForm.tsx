'use client';

import { useState } from 'react';
import { Product, addProduct, updateProduct, deleteProduct } from '@/lib/db';
import { useNotification } from '@/lib/store';
import { X, Trash2 } from 'lucide-react';

const CATEGORIES = ['Moteur', 'Freinage', 'Suspension', 'Électrique', 'Carrosserie', 'Transmission', 'Refroidissement', 'Accessoires', 'Autre'];

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    nom: product?.nom || '',
    reference: product?.reference || '',
    categorie: product?.categorie || 'Moteur',
    prix: product?.prix || 0,
    stock: product?.stock || 0,
  });
  const [loading, setLoading] = useState(false);
  const { show: showNotification } = useNotification();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.nom || !formData.reference) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }

    setLoading(true);

    try {
      if (product?.id) {
        await updateProduct(product.id, formData);
        showNotification('Produit mis à jour', 'success');
      } else {
        await addProduct(formData as Omit<Product, 'id'>);
        showNotification('Produit créé', 'success');
      }
      onClose();
    } catch (error) {
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!product?.id) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) return;

    setLoading(true);
    try {
      await deleteProduct(product.id);
      showNotification('Produit supprimé', 'success');
      onClose();
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card fixed inset-0 bg-gray-900 bg-opacity-50 flex items-end z-50 max-w-screen-sm mx-auto">
      <div className="bg-white w-full rounded-t-2xl p-4 animation-slideUp">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {product ? 'Modifier produit' : 'Nouveau produit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="label">Nom</label>
            <input
              type="text"
              placeholder="Ex: Filtre à air"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Référence (SKU)</label>
            <input
              type="text"
              placeholder="Ex: FA-2024-001"
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Catégorie</label>
            <select
              value={formData.categorie}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categorie: e.target.value as Product['categorie'],
                })
              }
              className="input"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prix (€)</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.prix}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prix: parseFloat(e.target.value) || 0,
                  })
                }
                className="input"
              />
            </div>

            <div>
              <label className="label">Stock</label>
              <input
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          {product && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-danger w-full flex justify-center gap-2"
              disabled={loading}
            >
              <Trash2 size={18} />
              Supprimer
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
