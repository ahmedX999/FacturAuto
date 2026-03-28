'use client';

import { useEffect, useState } from 'react';
import { getAllClients, Client } from '@/lib/db';
import { useNotification } from '@/lib/store';
import { Search, Edit2, Trash2, Phone, MapPin } from 'lucide-react';
import ClientForm from '@/components/ClientForm';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const { show: showNotification } = useNotification();

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery]);

  async function loadClients() {
    const cls = await getAllClients();
    setClients(cls);
    setLoading(false);
  }

  function filterClients() {
    let filtered = [...clients];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nom.toLowerCase().includes(query) ||
          c.telephone.includes(query)
      );
    }

    setFilteredClients(filtered);
  }

  function handleEdit(client: Client) {
    setEditingClient(client);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingClient(null);
    loadClients();
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Clients</h1>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher par nom ou téléphone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Clients List */}
      {showForm ? (
        <ClientForm
          client={editingClient || undefined}
          onClose={handleFormClose}
        />
      ) : (
        <>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun client trouvé
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClients.map((client) => (
                <div key={client.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {client.nom}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} />
                          <a href={`tel:${client.telephone}`}>
                            {client.telephone}
                          </a>
                        </div>
                        {client.adresse && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} />
                            <span>{client.adresse}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Êtes-vous sûr de vouloir supprimer "${client.nom}"?`
                            )
                          ) {
                            loadClients();
                            showNotification('Client supprimé', 'success');
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!showForm && (
        <button
          onClick={() => {
            setEditingClient(null);
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
