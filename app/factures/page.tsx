'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllInvoices, getClient, deleteInvoice, Invoice } from '@/lib/db';
import { formatCurrency, formatDate, generatePDF, generatePNG, downloadFile, shareViaWhatsApp } from '@/lib/utils';
import { useNotification } from '@/lib/store';
import { FileText, Eye, Share2, Download, Trash2 } from 'lucide-react';
import FloatingActionButton from '@/components/FloatingActionButton';

export default function Invoices() {
  const [invoices, setInvoices] = useState<
    (Invoice & { clientName?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showDownloadOptions, setShowDownloadOptions] = useState<number | null>(null);
  const { show: showNotification } = useNotification();

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDownloadOptions(null);
    };

    if (showDownloadOptions !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDownloadOptions]);

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

  async function handleDownload(invoice: Invoice & { clientName?: string }, format: 'pdf' | 'png') {
    try {
      const client = await getClient(invoice.clientId);
      const settings = await import('@/lib/db').then(m => m.getSettings());

      // Enrich items with product information
      const enrichedItems = await Promise.all(
        invoice.items.map(async (item) => ({
          ...item,
          product: await import('@/lib/db').then(m => m.getProduct(item.productId)),
        }))
      );

      if (!client || !settings) {
        showNotification('Données manquantes', 'error');
        return;
      }

      let blob: Blob;
      if (format === 'pdf') {
        blob = await generatePDF(invoice, client, enrichedItems, settings);
      } else {
        blob = await generatePNG(invoice, client, enrichedItems, settings);
      }

      downloadFile(blob, `${invoice.numero_facture}.${format}`);
      showNotification(`${format.toUpperCase()} téléchargé`, 'success');
      setShowDownloadOptions(null);
    } catch (error) {
      console.error('Download error:', error);
      showNotification('Erreur lors du téléchargement', 'error');
    }
  }

  async function handleShare(invoice: Invoice & { clientName?: string }) {
    try {
      const client = await getClient(invoice.clientId);
      const settings = await import('@/lib/db').then(m => m.getSettings());

      // Enrich items with product information
      const enrichedItems = await Promise.all(
        invoice.items.map(async (item) => ({
          ...item,
          product: await import('@/lib/db').then(m => m.getProduct(item.productId)),
        }))
      );

      if (!client || !settings) {
        showNotification('Données manquantes', 'error');
        return;
      }

      const pngBlob = await generatePNG(invoice, client, enrichedItems, settings);
      const file = new File([pngBlob], `${invoice.numero_facture}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Facture ${invoice.numero_facture}`,
          text: `Facture ${invoice.numero_facture} - ${client.nom}`,
          files: [file],
        });
      } else {
        // Fallback to WhatsApp with text
        const message = `Facture #${invoice.numero_facture}\nTotal: ${formatCurrency(invoice.total)}\nDate: ${formatDate(invoice.date)}`;
        shareViaWhatsApp(message);
      }
      showNotification('Partage initié', 'success');
    } catch (error) {
      console.error('Sharing error:', error);
      showNotification('Erreur lors du partage', 'error');
    }
  }

  async function handleDelete(invoice: Invoice & { clientName?: string }) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la facture "${invoice.numero_facture}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await deleteInvoice(invoice.id || 0);
      setInvoices(invoices.filter(inv => inv.id !== invoice.id));
      showNotification('Facture supprimée', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
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
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDownloadOptions(showDownloadOptions === invoice.id ? null : (invoice.id || null));
                    }}
                    className="btn btn-secondary btn-sm"
                    title="Télécharger"
                  >
                    <Download size={16} />
                  </button>
                  {showDownloadOptions === invoice.id && (
                    <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-32">
                      <button
                        onClick={() => handleDownload(invoice, 'pdf')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        Télécharger PDF
                      </button>
                      <button
                        onClick={() => handleDownload(invoice, 'png')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        Télécharger PNG
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleShare(invoice)}
                  className="btn btn-secondary btn-sm"
                  title="Partager"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(invoice)}
                  className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50"
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
