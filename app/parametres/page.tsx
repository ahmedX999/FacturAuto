'use client';

import { useEffect, useState } from 'react';
import { getSettings, updateSettings, exportData, importData } from '@/lib/db';
import { Settings } from '@/lib/db';
import { useNotification } from '@/lib/store';
import { Download, Upload, Save } from 'lucide-react';
import { downloadFile } from '@/lib/utils';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [formData, setFormData] = useState<Partial<Settings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { show: showNotification } = useNotification();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const stngs = await getSettings();
    setSettings(stngs);
    setFormData(stngs);
    setLoading(false);
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await updateSettings(formData);
      showNotification('Paramètres sauvegardés', 'success');
    } catch (error) {
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleExportData() {
    try {
      const backup = await exportData();
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      downloadFile(
        blob,
        `facturation-backup-${new Date().toISOString().split('T')[0]}.json`
      );
      showNotification('Données exportées', 'success');
    } catch (error) {
      showNotification('Erreur lors de l\'export', 'error');
    }
  }

  async function handleImportData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const success = await importData(backup);
      
      if (success) {
        showNotification('Données restaurées avec succès', 'success');
        await loadSettings();
      } else {
        showNotification('Erreur lors de la restauration', 'error');
      }
    } catch (error) {
      showNotification('Fichier invalide', 'error');
    }

    e.target.value = '';
  }

  if (loading) {
    return (
      <div className="p-4 text-center py-8 text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>

      {/* Store Settings */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Informations du magasin</h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="label">Nom du magasin</label>
            <input
              type="text"
              value={formData.nomMagasin || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nomMagasin: e.target.value,
                })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Adresse</label>
            <input
              type="text"
              value={formData.adresse || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  adresse: e.target.value,
                })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Téléphone</label>
            <input
              type="tel"
              value={formData.telephone || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telephone: e.target.value,
                })
              }
              className="input"
            />
          </div>

          {/* TVA supprimée. Pas de configuration nécessaire. */}

          <button
            type="submit"
            className="btn btn-primary w-full justify-center gap-2"
            disabled={saving}
          >
            <Save size={20} />
            {saving ? 'Enregistrement...' : 'Enregistrer les changements'}
          </button>
        </form>
      </div>

      {/* Backup & Restore */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Sauvegarde et restauration</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Exportez vos données pour les sauvegarder, ou importez une sauvegarde
          précédente pour les restaurer.
        </p>

        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={handleExportData}
            className="btn btn-secondary flex-1 justify-center gap-2"
          >
            <Download size={20} />
            Exporter les données
          </button>

          <label className="btn btn-secondary flex-1 justify-center gap-2 cursor-pointer">
            <Upload size={20} />
            Importer les données
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ <strong>Attention:</strong> L'importation remplacera toutes vos données actuelles.
        </div>
      </div>

      {/* App Info */}
      <div className="card bg-gray-50">
        <h2 className="text-lg font-bold mb-3">À propos</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Application:</strong> Facturation Auto v1.0
          </p>
          <p>
            <strong>Type:</strong> Progressive Web App (PWA)
          </p>
          <p>
            <strong>Langue:</strong> Français 🇫🇷
          </p>
          <p>
            <strong>Stockage:</strong> Local (IndexedDB)
          </p>
          <p className="pt-2 text-xs text-gray-500">
            Cette application fonctionne entièrement hors ligne. Tous vos
            données sont stockées localement sur votre appareil.
          </p>
        </div>
      </div>
    </div>
  );
}
