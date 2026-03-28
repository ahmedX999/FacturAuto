'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getInvoice,
  getClient,
  getProduct,
  updateInvoice,
  getSettings,
  Invoice,
  Client,
  Product,
  Settings,
  InvoiceItem,
} from '@/lib/db';
import {
  formatCurrency,
  formatDate,
  generatePDF,
  downloadFile,
  shareViaWhatsApp,
} from '@/lib/utils';
import { useNotification } from '@/lib/store';
import { ArrowLeft, Download, Share2, CheckCircle2 } from 'lucide-react';

export default function InvoiceDetail() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id ? parseInt(params.id as string, 10) : 0;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [items, setItems] = useState<(InvoiceItem & { product?: Product })[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const { show: showNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, [invoiceId]);

  async function loadData() {
    try {
      const inv = await getInvoice(invoiceId);
      const stngs = await getSettings();

      if (!inv) {
        showNotification('Facture non trouvée', 'error');
        router.push('/factures');
        return;
      }

      const cl = await getClient(inv.clientId);
      const itemsWithProducts = await Promise.all(
        inv.items.map(async (item) => ({
          ...item,
          product: await getProduct(item.productId),
        }))
      );

      setInvoice(inv);
      setClient(cl || null);
      setItems(itemsWithProducts);
      setSettings(stngs || null);
    } catch (error) {
      showNotification('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    if (!invoice || !client || !settings) return;

    try {
      const pdfBlob = await generatePDF(invoice, client, items, settings);
      downloadFile(pdfBlob, `${invoice.numero_facture}.pdf`);
      showNotification('PDF téléchargé', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showNotification('Erreur lors de la génération du PDF', 'error');
    }
  }

  async function handleMarkAsPaid() {
    if (!invoice) return;

    setMarking(true);
    try {
      await updateInvoice(invoice.id || 0, {
        statut: 'payée',
      });
      setInvoice({ ...invoice, statut: 'payée' });
      showNotification('Facture marquée comme payée', 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour', 'error');
    } finally {
      setMarking(false);
    }
  }

  function handleShareOnWhatsApp() {
    const message = `Facture #${invoice?.numero_facture}
Total: ${formatCurrency(invoice?.total || 0)}
Date: ${formatDate(invoice?.date || new Date().toISOString())}`;

    shareViaWhatsApp(message);
  }

  if (loading) {
    return (
      <div className="p-4 text-center py-8 text-gray-500">
        Chargement...
      </div>
    );
  }

  if (!invoice || !client) {
    return (
      <div className="p-4 text-center py-8 text-gray-500">
        Facture non trouvée
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {invoice.numero_facture}
        </h1>
      </div>

      {/* Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Statut</p>
            <p className="text-lg font-bold">
              {invoice.statut === 'payée' ? 'Payée ✓' : 'Non payée'}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full font-medium ${
              invoice.statut === 'payée'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {invoice.statut === 'payée' ? 'Payée' : 'En attente'}
          </span>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="card">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Date</p>
            <p className="font-medium">{formatDate(invoice.date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Client</p>
            <p className="font-medium">{client.nom}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Téléphone</p>
            <a href={`tel:${client.telephone}`} className="text-blue-600 underline">
              {client.telephone}
            </a>
          </div>
          {client.adresse && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Adresse</p>
              <p className="font-medium text-sm">{client.adresse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="card">
        <h3 className="font-bold mb-3">Articles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-2">Produit</th>
                <th className="text-center py-2 px-2">Qté</th>
                <th className="text-right py-2 px-2">Prix</th>
                <th className="text-right py-2 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 px-2 font-medium">
                    {item.product?.nom || 'Produit supprimé'}
                  </td>
                  <td className="py-2 px-2 text-center">{item.quantite}</td>
                  <td className="py-2 px-2 text-right">
                    {formatCurrency(item.prix_unitaire)}
                  </td>
                  <td className="py-2 px-2 text-right font-medium">
                    {formatCurrency(item.quantite * item.prix_unitaire)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="card bg-blue-50 border-2 border-blue-200">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Sous-total:</span>
            <span className="font-medium">
              {formatCurrency(invoice.subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">
              TVA incluant (20%):
            </span>
            <span className="font-medium">{formatCurrency(invoice.total * 0.2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-blue-200 pt-2">
            <span>Total:</span>
            <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="btn btn-secondary flex-1 justify-center gap-2"
          >
            <Download size={20} />
            Télécharger PDF
          </button>
          <button
            onClick={handleShareOnWhatsApp}
            className="btn btn-secondary flex-1 justify-center gap-2"
          >
            <Share2 size={20} />
            WhatsApp
          </button>
        </div>

        {invoice.statut !== 'payée' && (
          <button
            onClick={handleMarkAsPaid}
            className="btn btn-primary w-full justify-center gap-2"
            disabled={marking}
          >
            <CheckCircle2 size={20} />
            {marking ? 'Mise à jour...' : 'Marquer comme payée'}
          </button>
        )}
      </div>
    </div>
  );
}
