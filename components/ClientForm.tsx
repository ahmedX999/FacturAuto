'use client';

import { useState } from 'react';
import { Client, addClient, updateClient, deleteClient } from '@/lib/db';
import { useNotification } from '@/lib/store';
import { X, Trash2 } from 'lucide-react';

interface ClientFormProps {
  client?: Client;
  onClose: () => void;
}

export default function ClientForm({ client, onClose }: ClientFormProps) {
  const [formData, setFormData] = useState<Partial<Client>>({
    nom: client?.nom || '',
    telephone: client?.telephone || '',
    adresse: client?.adresse || '',
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
      if (client?.id) {
        await updateClient(client.id, formData);
        showNotification('Client mis à jour', 'success');
      } else {
        await addClient(formData as Omit<Client, 'id'>);
        showNotification('Client créé', 'success');
      }
      onClose();
    } catch (error) {
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!client?.id) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client?'))
      return;

    setLoading(true);
    try {
      await deleteClient(client.id);
      showNotification('Client supprimé', 'success');
      onClose();
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-end z-50 max-w-screen-sm mx-auto">
      <div className="bg-white w-full rounded-t-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {client ? 'Modifier client' : 'Nouveau client'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>

          <div>
            <label className="label">Téléphone *</label>
            <input
              type="tel"
              placeholder="Ex: 06 12 34 56 78"
              value={formData.telephone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telephone: e.target.value,
                })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Adresse (optionnel)</label>
            <textarea
              placeholder="Ex: 123 Rue Hamza 1 , Marrakech"
              value={formData.adresse}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  adresse: e.target.value,
                })
              }
              className="input"
              rows={3}
            />
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

          {client && (
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
