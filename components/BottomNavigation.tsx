'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Package, Users, Settings, Plus } from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Spacer for fixed nav */}
      <div className="h-20" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center h-20 max-w-screen-sm mx-auto">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive('/dashboard')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Accueil</span>
          </Link>

          <Link
            href="/factures"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive('/factures') || isActive('/factures/nouvelle')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText size={24} />
            <span className="text-xs mt-1">Factures</span>
          </Link>

          <Link
            href="/produits"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive('/produits')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package size={24} />
            <span className="text-xs mt-1">Produits</span>
          </Link>

          <Link
            href="/clients"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive('/clients')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users size={24} />
            <span className="text-xs mt-1">Clients</span>
          </Link>

          <Link
            href="/parametres"
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive('/parametres')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings size={24} />
            <span className="text-xs mt-1">Réglages</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
