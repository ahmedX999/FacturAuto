'use client';

import './globals.css';
import { useEffect } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import Notification from '@/components/Notification';
import { initializeSettings } from '@/lib/db';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize database
    initializeSettings();

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    }
  }, []);

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="PWA pour gestion de factures d'auto-pièces" />
        <meta name="theme-color" content="#000000" />

        {/* iOS specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Facturation Auto" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <title>Facturation Auto - PWA</title>
      </head>
      <body className="bg-gray-50 max-w-screen-sm mx-auto">
        <BottomNavigation />
        <Notification />
        <main className="pb-20">{children}</main>
      </body>
    </html>
  );
}
