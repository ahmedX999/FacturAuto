'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addProduct } from '@/lib/db';
import { useNotification } from '@/lib/store';
import { ArrowLeft, Save } from 'lucide-react';

const CATEGORIES = [
  'Moteur',
  'Freinage',
  'Suspension',
  'Électrique',
  'Carrosserie',
  'Transmission',
  'Refroidissement',
  'Accessoires',
  'Autre',
] as const;

type Category = (typeof CATEGORIES)[number];

type FormData = {
  nom: string;
  reference: string;
  prix: string;
  stock: string;
  categorie: Category | '';
};

export default function NewProduct() {
  const router = useRouter();
  const { show: showNotification } = useNotification();

  const [formData, setFormData] = useState<FormData>({
    nom: '',
    reference: '',
    prix: '',
    stock: '',
    categorie: '',
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
    if (!formData.nom || !formData.reference || !formData.prix || !formData.stock) {
      showNotification('Veuillez remplir les champs obligatoires', 'error');
      return;
    }

    const prix = parseFloat(formData.prix);
    const stock = parseInt(formData.stock);

    if (isNaN(prix) || prix <= 0) {
      showNotification('Prix invalide', 'error');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      showNotification('Stock invalide', 'error');
      return;
    }

    // Ensure categorie is valid, default to 'Autre'
    const categorie: Category =
      CATEGORIES.includes(formData.categorie as Category) && formData.categorie
        ? (formData.categorie as Category)
        : 'Autre';

    setLoading(true);

    try {
      await addProduct({
        nom: formData.nom,
        reference: formData.reference,
        prix,
        stock,
        categorie,
      });
      showNotification('Produit créé avec succès', 'success');
      router.push('/produits');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Erreur lors de la création', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/produits" className="btn btn-secondary">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nouveau produit</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nom *</label>
            <input
              type="text"
              placeholder="Ex: Filtre à huile"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Référence *</label>
            <input
              type="text"
              placeholder="Ex: FH-12345"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Prix *</label>
            <input
              type="number"
              placeholder="Ex: 25.50"
              value={formData.prix}
              onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
              className="input"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label className="label">Stock *</label>
            <input
              type="number"
              placeholder="Ex: 10"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="input"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Catégorie</label>
          <select
            value={formData.categorie}
            onChange={(e) =>
              setFormData({ ...formData, categorie: e.target.value as Category })
            }
            className="input"
          >
            <option value="">Sélectionner une catégorie</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Link href="/produits" className="flex-1 btn btn-secondary justify-center">
            Annuler
          </Link>
          <button
            type="submit"
            className="flex-1 btn btn-primary justify-center gap-2"
            disabled={loading}
          >
            <Save size={20} />
            {loading ? 'Création...' : 'Créer produit'}
          </button>
        </div>
      </form>
    </div>
  );
}