'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  href: string;
  tooltip?: string;
}

export default function FloatingActionButton({
  href,
  tooltip = 'Nouvelle facture',
}: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      className="fixed bottom-24 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl active:scale-95 z-40"
      title={tooltip}
    >
      <Plus size={28} />
    </Link>
  );
}
