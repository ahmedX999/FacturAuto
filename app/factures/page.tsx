'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllInvoices, getClient, Invoice } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, Eye, Share2, Download, Trash2 } from 'lucide-react';
import FloatingActionButton from '@/components/FloatingActionButton';

export default function Invoices() {
  const [invoices, setInvoices] = useState<
    (Invoice & { clientName?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    const invs = await getAllInvoices();
    const enriched = await Promise.all(
      invs.map(async (inv) => {
        const client = await getClient(inv.clientId);
        return {
          ...inv,
          clientName: client?.nom,
        };
      })
    );
    setInvoices(enriched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Factures</h1>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Aucune facture créée</p>
          <Link
            href="/factures/nouvelle"
            className="btn btn-primary justify-center"
          >
            Créer une facture
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {invoice.numero_facture}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {invoice.clientName}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    invoice.statut === 'payée'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {invoice.statut === 'payée' ? 'Payée' : 'Non payée'}
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  {formatDate(invoice.date)}
                </span>
                <span className="font-bold text-lg text-blue-600">
                  {formatCurrency(invoice.total)}
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/factures/${invoice.id}`}
                  className="flex-1 btn btn-secondary btn-sm justify-center gap-1"
                >
                  <Eye size={16} />
                  Voir
                </Link>
                <button
                  className="btn btn-secondary btn-sm"
                  title="Télécharger PDF"
                >
                  <Download size={16} />
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  title="Partager"
                >
                  <Share2 size={16} />
                </button>
                <button
                  className="btn btn-secondary btn-sm text-red-600"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FloatingActionButton href="/factures/nouvelle" />
    </div>
  );
}
