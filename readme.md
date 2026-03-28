# Facturation Auto - PWA pour Gestion de Factures d'Auto-Pièces

Application Progressive Web App (PWA) complète et fonctionnelle pour la gestion des factures d'un auto-pièces.

## ✨ Features

- ✅ **Tableau de bord:** Affiche les ventes du jour, le nombre de factures et les produits les plus vendus
- ✅ **Gestion des produits:** CRUD complet, recherche par nom/référence, filtre par catégorie
- ✅ **Gestion des clients:** CRUD complet avec recherche rapide
- ✅ **Création de factures:** Flux complet avec sélection client, ajout de produits, gestion des quantités
- ✅ **Génération de PDF:** Factures professionnelles avec en-tête, détails client, tableau des articles et totaux
- ✅ **Sauvegarde/Restauration:** Export/import des données en JSON
- ✅ **PWA Complète:** Fonctionne hors ligne, installable sur iPhone/Android
- ✅ **Interface 100% Française:** Toute l'interface en français
- ✅ **Base de données locale:** IndexedDB pour un stockage persistant

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 16+ et npm/yarn

### Installation
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'app sera disponible sur `http://localhost:3000`

### Build et Production
```bash
# Créer une build de production
npm run build

# Démarrer le serveur de production
npm start
```

## 📱 Installation sur iPhone

1. Ouvrir l'app dans Safari
2. Cliquer sur le bouton de partage (carré avec flèche)
3. Sélectionner "Sur l'écran d'accueil"
4. Confirmer

L'app fonctionne entièrement hors ligne une fois installée!

## 📁 Structure du Projet

```
inv/
├── app/                          # App Router (Next.js)
│   ├── layout.tsx               # Layout principal avec PWA setup
│   ├── page.tsx                 # Redirection vers dashboard
│   ├── globals.css              # Styles globaux Tailwind
│   ├── dashboard/               # Tableau de bord
│   ├── produits/                # Gestion des produits
│   ├── clients/                 # Gestion des clients
│   ├── factures/                # Liste des factures
│   │   ├── nouvelle/            # Création de facture
│   │   └── [id]/                # Détail de facture
│   └── parametres/              # Paramètres et sauvegarde
├── components/                   # Composants réutilisables
│   ├── BottomNavigation.tsx     # Barre de navigation inférieure
│   ├── FloatingActionButton.tsx # Bouton flottant
│   ├── Notification.tsx         # Notifications toast
│   ├── ProductForm.tsx          # Formulaire produit modal
│   ├── ProductList.tsx          # Liste des produits
│   └── ClientForm.tsx           # Formulaire client modal
├── lib/                          # Code métier
│   ├── db.ts                    # Setup Dexie.js et opérations CRUD
│   ├── store.ts                 # Zustand stores (formulaires, notifications)
│   └── utils.ts                 # Utilitaires (PDF, formatting, partage)
├── public/
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service worker
│   └── icons/                   # Icônes des apps
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

## 🗄️ Schéma de Base de Données

L'app utilise **IndexedDB via Dexie.js** avec ces stores:

```typescript
// Products
{
  id, nom, reference, categorie, prix, stock
}

// Clients
{
  id, nom, telephone, adresse
}

// Invoices
{
  id, numero_facture, date, clientId, items[], 
  subtotal, tva, total, statut
}

// Settings
{
  id, nomMagasin, adresse, telephone, tauxTVA, lastInvoiceNumber
}
```

## 🎯 Pages et Fonctionnalités

### `/dashboard` - Tableau de bord
- Affiche les ventes totales du jour
- Nombre de factures du jour
- Top 5 produits les plus vendus
- Raccourcis vers fonctionnalités principales

### `/produits` - Gestion des produits
- Liste de tous les produits avec stock
- Recherche par nom/référence
- Filtre par catégorie (Moteur, Freinage, Suspension, Électrique, Autre)
- CRUD: Créer, modifier, supprimer
- Affichage du stock disponible

### `/clients` - Gestion des clients
- Liste de tous les clients
- Recherche par nom/téléphone
- CRUD: Créer, modifier, supprimer
- Stockage du nom, téléphone et adresse

### `/factures` - Liste des factures
- Affiche toutes les factures
- Statut (Payée/Non payée)
- Lien pour voir les détails
- Options: Télécharger PDF, Partager, Supprimer

### `/factures/nouvelle` - Créer une facture
1. Sélectionner un client
2. Rechercher et ajouter des produits
3. Gérer les quantités
4. Calcul automatique: Sous-total → TVA → Total
5. Créer la facture
6. Le stock se décrémente automatiquement

### `/factures/[id]` - Détail de facture
- Affiche tous les détails de la facture
- Tableau des articles avec prix
- Récapitulatif des totaux
- Actions: Télécharger PDF, Partager WhatsApp, Marquer comme payée

### `/parametres` - Paramètres
- Configurer le nom du magasin, adresse, téléphone
- Taux TVA configurable
- Export des données (JSON)
- Import de sauvegarde précédente

## 🔄 Flux de la Facture

1. **Sélection du client** - Choisir/rechercher un client
2. **Ajout de produits** - Ajouter produits avec quantités (max = stock disponible)
3. **Validation du stock** - Les articles avec 0 stock ne peuvent pas être vendus
4. **Calcul auto** - Sous-total × TVA (%) = Total
5. **Génération du numéro** - Auto: `FACT-YYYY-0001`, `FACT-YYYY-0002`, etc.
6. **Création** - Les stocks se décrémentent automatiquement
7. **PDF** - Facture professionnelle générée instantanément
8. **Partage** - Possibilité de partager via WhatsApp

## 💾 Sauvegarde et Restauration

### Export des données
- Page Paramètres → "Exporter les données"
- Crée un fichier JSON avec tous les produits, clients, factures
- Nommé: `facturation-backup-YYYY-MM-DD.json`

### Import des données
- Page Paramètres → "Importer les données"
- Sélectionner un fichier JSON précédent
- ⚠️ Remplace TOUTES les données actuelles

## 🌍 PWA - Fonctionnement Hors Ligne

### Service Worker
- Cache les assets (CSS, JS, images)
- Permet une utilisation complète hors ligne
- Synchronisation au retour de la connexion

### Stockage Local
- IndexedDB stocke toutes les données localement
- Aucun serveur backend required
- Les données persistent après reload

### Installation
- Sur mobile: "Ajouter à l'écran d'accueil"
- Accès rapide comme une app native
- Works on iOS, Android, et navigateurs

## 🎨 Interface et Designer

### Couleurs
- **Primaire:** Bleu (#2563EB)
- **Secondaire:** Gris (#D1D5DB)
- **Succès:** Vert (#16A34A)
- **Erreur:** Rouge (#DC2626)
- **Attention:** Jaune (#CA8A04)

### Composants
- **Bottom Navigation:** Navigation mobile au bas de l'écran
- **Floating Action Button:** Bouton "+" pour nouvelle facture
- **Modals:** Formulaires produit/client en popup
- **Cards:** Disposition des informations
- **Toast Notifications:** Notifications temporaires

## 🔧 Technologies Utilisées

- **Framework:** Next.js 14 avec App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + PostCSS
- **State Management:** Zustand
- **Database:** Dexie.js (IndexedDB wrapper)
- **PDF Generation:** jsPDF + html2canvas
- **Icons:** Lucide React
- **PWA:** Service Worker + manifest.json

## 📝 Variables d'Environnement

Créer un fichier `.env.local` (optionnel - pas requis):
```
# Pas de variables d'environnement requises pour le fonctionnement
# L'app fonctionne entièrement en local
```

## 🐛 Troubleshooting

### Service Worker ne s'installe pas
```bash
# Vérifier la console du navigateur (F12)
# Essayer Ctrl+Shift+Delete pour vider le cache
```

### Les données ne persistent pas
- Vérifier que IndexedDB est activé dans le navigateur
- Essayer en mode navigation privée? (IndexedDB limité)
- Supprimer et réinstaller l'app

### PDF ne se génère pas
- Assurez-vous que `html2canvas` et `jspdf` sont installés
- Vérifier la console pour les erreurs

## 📱 Compatibilité

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (iPhone/iPad)
- ✅ Edge 90+
- ✅ Samsung Internet 14+

## 📋 Checklist de Déploiement

- [ ] Test sur iPhone
- [ ] Test en offline
- [ ] Vérifier PDF generation
- [ ] Tester export/import données
- [ ] Vérifier la performance
- [ ] Test des formulaires
- [ ] Test du partage WhatsApp
- [ ] Vérifier la langue (100% français)

## 🚀 Améliorations Futures

- Dark mode
- Scanner de codes-barres
- Multi-devises
- Graphiques d'analytics
- Signature client
- Paiement en ligne intégré

## 📄 License

Ce projet est fourni tel quel. Libre d'utilisation.

---

**Version:** 1.0.0  
**Dernière mise à jour:** Mars 2026  
**Langue:** Français 🇫🇷  
**Type:** Progressive Web App (PWA)