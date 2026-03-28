'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllInvoices, getAllProducts, getTodayDate } from '@/lib/db';
import { Invoice, Product } from '@/lib/db';
import { formatCurrency, getTodayDate as getTodayDateUtil } from '@/lib/utils';
import { TrendingUp, FileText, Package, DollarSign } from 'lucide-react';
import FloatingActionButton from '@/components/FloatingActionButton';

export default function Dashboard() {
  const [totalSales, setTotalSales] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [topProducts, setTopProducts] = useState<(Product & { sold: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const invoices = await getAllInvoices();
      const products = await getAllProducts();

      // Calculate today's sales
      const today = getTodayDateUtil();
      const todayInvoices = invoices.filter(
        (inv) => inv.date >= today && inv.date < today + 'T23:59:59'
      );

      const totalSalesAmount = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
      setTotalSales(totalSalesAmount);
      setInvoiceCount(todayInvoices.length);

      // Calculate top products
      const productSales: { [key: number]: number } = {};
      invoices.forEach((inv) => {
        inv.items.forEach((item) => {
          productSales[item.productId] = (productSales[item.productId] || 0) + item.quantite;
        });
      });

      const topProductsList = products
        .map((p) => ({
          ...p,
          sold: productSales[p.id || 0] || 0,
        }))
        .filter((p) => p.sold > 0)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      setTopProducts(topProductsList);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Total Sales */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Ventes du jour</p>
              <p className="text-4xl font-bold">{formatCurrency(totalSales)}</p>
            </div>
            <DollarSign size={48} className="opacity-30" />
          </div>
        </div>

        {/* Invoice Count */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">Factures du jour</p>
              <p className="text-4xl font-bold">{invoiceCount}</p>
            </div>
            <FileText size={48} className="opacity-30" />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={24} className="text-blue-600" />
          Produits les plus vendus
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : topProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Aucune vente aujourd'hui</div>
        ) : (
          <div className="space-y-2">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{product.nom}</p>
                  <p className="text-sm text-gray-500">{product.reference}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{product.sold}</p>
                  <p className="text-xs text-gray-500">unités</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/factures/nouvelle"
          className="btn btn-primary justify-center py-4"
        >
          <FileText size={20} />
          <span>Nouvelle facture</span>
        </Link>
        <Link
          href="/produits"
          className="btn btn-secondary justify-center py-4"
        >
          <Package size={20} />
          <span>Produits</span>
        </Link>
      </div>

      <FloatingActionButton href="/factures/nouvelle" />
    </div>
  );
}
