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
  generatePNG,
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

  async function handleDownloadPNG() {
    if (!invoice || !client || !settings) return;

    try {
      const pngBlob = await generatePNG(invoice, client, items, settings);
      downloadFile(pngBlob, `${invoice.numero_facture}.png`);
      showNotification('Image PNG téléchargée', 'success');
    } catch (error) {
      console.error('PNG generation error:', error);
      showNotification('Erreur lors de la génération de l\'image', 'error');
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

  async function handleShareOnWhatsApp() {
    if (!invoice || !client || !settings) return;

    try {
      const pngBlob = await generatePNG(invoice, client, items, settings);
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
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 p-2"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 text-center flex-1">
          Facture {invoice.numero_facture}
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Status Badge */}
      <div className="flex justify-center">
        <span
          className={`px-6 py-2 rounded-full font-semibold text-sm ${
            invoice.statut === 'payée'
              ? 'bg-green-100 text-green-800 border-2 border-green-200'
              : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
          }`}
        >
          {invoice.statut === 'payée' ? '✓ Payée' : 'En attente de paiement'}
        </span>
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        {/* Date and Invoice Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Informations facture</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Numéro:</span> {invoice.numero_facture}</p>
              <p><span className="text-gray-600">Date:</span> {formatDate(invoice.date)}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Client</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{client.nom}</p>
              <a href={`tel:${client.telephone}`} className="text-blue-600 hover:underline">
                {client.telephone}
              </a>
              {client.adresse && <p className="text-gray-600">{client.adresse}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Articles commandés</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Produit</th>
                <th className="text-center py-3 px-6 font-semibold text-gray-900">Quantité</th>
                <th className="text-right py-3 px-6 font-semibold text-gray-900">Prix unitaire</th>
                <th className="text-right py-3 px-6 font-semibold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">
                      {item.product?.nom || 'Produit supprimé'}
                    </div>
                    {item.product?.reference && (
                      <div className="text-sm text-gray-500">Réf: {item.product.reference}</div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center font-medium">{item.quantite}</td>
                  <td className="py-4 px-6 text-right font-medium">
                    {formatCurrency(item.prix_unitaire)}
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900">
                    {formatCurrency(item.quantite * item.prix_unitaire)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">Récapitulatif</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">Sous-total:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(invoice.subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">
              TVA incluant (20%):
            </span>
            <span className="font-semibold text-gray-900">{formatCurrency(invoice.total * 0.2)}</span>
          </div>
          <div className="border-t-2 border-blue-300 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total à payer:</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadPDF}
            className="btn btn-secondary justify-center gap-2"
          >
            <Download size={20} />
            PDF
          </button>
          <button
            onClick={handleDownloadPNG}
            className="btn btn-secondary justify-center gap-2"
          >
            <Download size={20} />
            Image PNG
          </button>
        </div>

        <button
          onClick={handleShareOnWhatsApp}
          className="btn btn-secondary w-full justify-center gap-2"
        >
          <Share2 size={20} />
          Partager
        </button>

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
