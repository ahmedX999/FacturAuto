import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice, InvoiceItem, Product, Client, Settings } from './db';

export async function generatePDF(
  invoice: Invoice,
  client: Client,
  items: (InvoiceItem & { product?: Product })[],
  settings: Settings
): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let yPosition = margin;

  // Header - Store information
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.nomMagasin, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.adresse, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text(settings.telephone, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Invoice title and number
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Numéro: ${invoice.numero_facture}`, margin, yPosition);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, pageWidth / 2, yPosition);
  yPosition += 8;

  // Client information
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(client.nom, margin + 2, yPosition);
  yPosition += 5;
  doc.text(client.telephone, margin + 2, yPosition);
  if (client.adresse) {
    yPosition += 5;
    doc.text(client.adresse, margin + 2, yPosition);
  }
  yPosition += 10;

  // Table header
  const startY = yPosition;
  const colWidths = {
    produit: 70,
    qte: 20,
    prix: 30,
    total: 30,
  };

  doc.setFont('helvetica', 'bold');
  doc.setFillColor(200, 200, 200);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');

  doc.text('Produit', margin + 2, yPosition + 4);
  doc.text('Qté', margin + colWidths.produit + 2, yPosition + 4);
  doc.text('Prix', margin + colWidths.produit + colWidths.qte + 2, yPosition + 4);
  doc.text('Total', margin + colWidths.produit + colWidths.qte + colWidths.prix + 2, yPosition + 4);
  yPosition += 8;

  // Table rows
  doc.setFont('helvetica', 'normal');
  items.forEach((item) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }

    const itemTotal = item.quantite * item.prix_unitaire;
    doc.text(item.product?.nom || 'Produit', margin + 2, yPosition);
    doc.text(item.quantite.toString(), margin + colWidths.produit + 2, yPosition);
    doc.text(item.prix_unitaire.toFixed(2) + ' €', margin + colWidths.produit + colWidths.qte + 2, yPosition);
    doc.text(itemTotal.toFixed(2) + ' €', margin + colWidths.produit + colWidths.qte + colWidths.prix + 2, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Totals
  doc.setFont('helvetica', 'bold');
  const subtotal = invoice.subtotal;
  const tva = invoice.tva;
  const total = invoice.total;

  doc.text('Sous-total:', pageWidth - margin - 50, yPosition);
  doc.text(subtotal.toFixed(2) + ' €', pageWidth - margin - 15, yPosition, { align: 'right' });
  yPosition += 6;

  doc.text(`TVA (${settings.tauxTVA}%):`, pageWidth - margin - 50, yPosition);
  doc.text(tva.toFixed(2) + ' €', pageWidth - margin - 15, yPosition, { align: 'right' });
  yPosition += 6;

  doc.setFontSize(12);
  doc.setFillColor(240, 240, 240);
  doc.rect(pageWidth - margin - 50, yPosition - 4, 50, 8, 'F');
  doc.text('Total:', pageWidth - margin - 50, yPosition);
  doc.text(total.toFixed(2) + ' €', pageWidth - margin - 15, yPosition, { align: 'right' });

  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function shareViaWhatsApp(message: string) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
