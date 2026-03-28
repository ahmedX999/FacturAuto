import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice, InvoiceItem, Product, Client, Settings } from './db';

export async function generatePDF(
  invoice: Invoice,
  client: Client,
  items: (InvoiceItem & { product?: Product })[],
  settings: Settings
): Promise<Blob> {
  // Generate PNG first and embed it into PDF for identical visual fidelity
  const pngBlob = await generatePNG(invoice, client, items, settings);

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert PNG to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(pngBlob);
  });

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  const imgWidthMm = pageWidth - margin * 2;
  const aspectRatio = img.width / img.height;
  let imgHeightMm = imgWidthMm / aspectRatio;

  if (imgHeightMm > pageHeight - margin * 2) {
    imgHeightMm = pageHeight - margin * 2;
  }

  const x = (pageWidth - imgWidthMm) / 2;
  const y = (pageHeight - imgHeightMm) / 2;

  doc.addImage(dataUrl, 'PNG', x, y, imgWidthMm, imgHeightMm);

  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
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

export async function generatePNG(
  invoice: Invoice,
  client: Client,
  items: (InvoiceItem & { product?: Product })[],
  settings: Settings
): Promise<Blob> {
  // Create a temporary div to render the invoice
  const invoiceElement = document.createElement('div');
  invoiceElement.style.width = '800px';
  invoiceElement.style.padding = '40px';
  invoiceElement.style.backgroundColor = 'white';
  invoiceElement.style.fontFamily = 'Arial, sans-serif';
  invoiceElement.style.color = '#333';
  invoiceElement.style.position = 'absolute';
  invoiceElement.style.left = '-9999px';
  invoiceElement.style.top = '-9999px';

  // Header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '30px';
  header.style.borderBottom = '2px solid #333';
  header.style.paddingBottom = '20px';

  const storeName = document.createElement('h1');
  storeName.textContent = settings.nomMagasin;
  storeName.style.fontSize = '28px';
  storeName.style.fontWeight = 'bold';
  storeName.style.margin = '0 0 10px 0';

  const storeAddress = document.createElement('p');
  storeAddress.textContent = settings.adresse;
  storeAddress.style.margin = '5px 0';

  const storePhone = document.createElement('p');
  storePhone.textContent = settings.telephone;
  storePhone.style.margin = '5px 0';

  header.appendChild(storeName);
  header.appendChild(storeAddress);
  header.appendChild(storePhone);

  // Invoice info
  const invoiceInfo = document.createElement('div');
  invoiceInfo.style.display = 'flex';
  invoiceInfo.style.justifyContent = 'space-between';
  invoiceInfo.style.marginBottom = '30px';

  const leftInfo = document.createElement('div');
  const invoiceTitle = document.createElement('h2');
  invoiceTitle.textContent = 'FACTURE';
  invoiceTitle.style.fontSize = '24px';
  invoiceTitle.style.fontWeight = 'bold';
  invoiceTitle.style.margin = '0 0 10px 0';

  const invoiceNumber = document.createElement('p');
  invoiceNumber.textContent = `Numéro: ${invoice.numero_facture}`;

  leftInfo.appendChild(invoiceTitle);
  leftInfo.appendChild(invoiceNumber);

  const rightInfo = document.createElement('div');
  rightInfo.style.textAlign = 'right';
  const invoiceDate = document.createElement('p');
  invoiceDate.textContent = `Date: ${formatDate(invoice.date)}`;

  rightInfo.appendChild(invoiceDate);

  invoiceInfo.appendChild(leftInfo);
  invoiceInfo.appendChild(rightInfo);

  // Client info
  const clientInfo = document.createElement('div');
  clientInfo.style.marginBottom = '30px';

  const clientTitle = document.createElement('h3');
  clientTitle.textContent = 'Client';
  clientTitle.style.fontSize = '18px';
  clientTitle.style.fontWeight = 'bold';
  clientTitle.style.margin = '0 0 10px 0';

  const clientName = document.createElement('p');
  clientName.textContent = client.nom;
  clientName.style.margin = '5px 0';

  const clientPhone = document.createElement('p');
  clientPhone.textContent = `Téléphone: ${client.telephone}`;
  clientPhone.style.margin = '5px 0';

  if (client.adresse) {
    const clientAddress = document.createElement('p');
    clientAddress.textContent = `Adresse: ${client.adresse}`;
    clientAddress.style.margin = '5px 0';
    clientInfo.appendChild(clientAddress);
  }

  clientInfo.appendChild(clientTitle);
  clientInfo.appendChild(clientName);
  clientInfo.appendChild(clientPhone);

  // Items table
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginBottom = '30px';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.backgroundColor = '#f5f5f5';

  const headers = ['Produit', 'Qté', 'Prix', 'Total'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.padding = '10px';
    th.style.border = '1px solid #ddd';
    th.style.textAlign = 'left';
    if (headerText === 'Prix' || headerText === 'Total') {
      th.style.textAlign = 'right';
    }
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  items.forEach(item => {
    const row = document.createElement('tr');

    const productCell = document.createElement('td');
    productCell.textContent = item.product?.nom || 'Produit supprimé';
    productCell.style.padding = '10px';
    productCell.style.border = '1px solid #ddd';

    const qtyCell = document.createElement('td');
    qtyCell.textContent = item.quantite.toString();
    qtyCell.style.padding = '10px';
    qtyCell.style.border = '1px solid #ddd';
    qtyCell.style.textAlign = 'center';

    const priceCell = document.createElement('td');
    priceCell.textContent = formatCurrency(item.prix_unitaire);
    priceCell.style.padding = '10px';
    priceCell.style.border = '1px solid #ddd';
    priceCell.style.textAlign = 'right';

    const totalCell = document.createElement('td');
    totalCell.textContent = formatCurrency(item.quantite * item.prix_unitaire);
    totalCell.style.padding = '10px';
    totalCell.style.border = '1px solid #ddd';
    totalCell.style.textAlign = 'right';

    row.appendChild(productCell);
    row.appendChild(qtyCell);
    row.appendChild(priceCell);
    row.appendChild(totalCell);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  // Totals
  const totals = document.createElement('div');
  totals.style.textAlign = 'right';
  totals.style.marginTop = '20px';

  const subtotal = document.createElement('p');
  subtotal.textContent = `Sous-total: ${formatCurrency(invoice.subtotal)}`;
  subtotal.style.margin = '5px 0';

  const tva = document.createElement('p');
  tva.textContent = `TVA incluant (20%): ${formatCurrency(invoice.total * 0.2)}`;
  tva.style.margin = '5px 0';

  const total = document.createElement('p');
  total.textContent = `Total: ${formatCurrency(invoice.total)}`;
  total.style.fontSize = '18px';
  total.style.fontWeight = 'bold';
  total.style.margin = '10px 0 0 0';

  totals.appendChild(subtotal);
  totals.appendChild(tva);
  totals.appendChild(total);

  // Assemble the invoice
  invoiceElement.appendChild(header);
  invoiceElement.appendChild(invoiceInfo);
  invoiceElement.appendChild(clientInfo);
  invoiceElement.appendChild(table);
  invoiceElement.appendChild(totals);

  document.body.appendChild(invoiceElement);

  try {
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    document.body.removeChild(invoiceElement);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  } catch (error) {
    document.body.removeChild(invoiceElement);
    throw error;
  }
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
