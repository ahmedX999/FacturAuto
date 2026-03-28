'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addClient } from '@/lib/db';
import { useNotification } from '@/lib/store';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    adresse: '',
  });
  const [loading, setLoading] = useState(false);
  const { show: showNotification } = useNotification();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nom || !formData.telephone) {
      showNotification('Veuillez remplir les champs obligatoires', 'error');
      return;
    }

    setLoading(true);

    try {
      await addClient(formData);
      showNotification('Client créé avec succès', 'success');
      router.push('/clients');
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
        <Link
          href="/clients"
          className="btn btn-secondary"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nouveau client</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="label">Nom *</label>
          <input
            type="text"
            placeholder="Ex: Mostafa Ait Mohammed"
            value={formData.nom}
            onChange={(e) =>
              setFormData({ ...formData, nom: e.target.value })
            }
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Téléphone *</label>
          <input
            type="tel"
            placeholder="Ex: 06 12 34 56 78"
            value={formData.telephone}
            onChange={(e) =>
              setFormData({ ...formData, telephone: e.target.value })
            }
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Adresse</label>
          <textarea
            placeholder="Ex: 123 Rue de la Paix, Casablanca"
            value={formData.adresse}
            onChange={(e) =>
              setFormData({ ...formData, adresse: e.target.value })
            }
            className="input min-h-20 resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Link
            href="/clients"
            className="flex-1 btn btn-secondary justify-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="flex-1 btn btn-primary justify-center gap-2"
            disabled={loading}
          >
            <Save size={20} />
            {loading ? 'Création...' : 'Créer client'}
          </button>
        </div>
      </form>
    </div>
  );
}