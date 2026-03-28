'use client';

import { Product } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { Edit2, Trash2 } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductList({
  products,
  onEdit,
  onDelete,
}: ProductListProps) {
  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div key={product.id} className="card flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{product.nom}</h3>
            <p className="text-sm text-gray-500">{product.reference}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-gray-600">{product.categorie}</span>
              <span
                className={`font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                Stock: {product.stock}
              </span>
            </div>
          </div>
          <div className="text-right ml-2">
            <p className="font-bold text-blue-600">
              {formatCurrency(product.prix)}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onEdit(product)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(product)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
