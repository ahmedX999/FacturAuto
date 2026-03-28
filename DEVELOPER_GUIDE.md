# 👨‍💻 Guide Développeur - Facturation Auto PWA

## 📚 Architecture de l'Application

### Couches

```
├── UI Layer (TSX Components)
├── State Management (Zustand)
├── Business Logic (lib/utils.ts)
└── Data Layer (lib/db.ts - Dexie.js)
```

## 🗂️ Structure des Types

### Product
```typescript
interface Product {
  id?: number;
  nom: string;
  reference: string; // SKU
  categorie: 'Moteur' | 'Freinage' | 'Suspension' | 'Électrique' | 'Autre';
  prix: number;
  stock: number;
}
```

### Client
```typescript
interface Client {
  id?: number;
  nom: string;
  telephone: string;
  adresse?: string;
}
```

### Invoice
```typescript
interface Invoice {
  id?: number;
  numero_facture: string;
  date: string;
  clientId: number;
  items: InvoiceItem[];
  subtotal: number;
  tva: number;
  total: number;
  statut: 'payée' | 'non payée';
}
```

### InvoiceItem
```typescript
interface InvoiceItem {
  id?: number;
  invoiceId: number;
  productId: number;
  quantite: number;
  prix_unitaire: number;
}
```

### Settings
```typescript
interface Settings {
  id?: number;
  nomMagasin: string;
  adresse: string;
  telephone: string;
  tauxTVA: number;
  lastInvoiceNumber: number;
}
```

## 🔄 Opérations CRUD - Équivalents SQL

### Products
```typescript
// CREATE
await addProduct({ nom, reference, categorie, prix, stock });

// READ
const p = await getProduct(id);
const all = await getAllProducts();
const search = await searchProducts('query');
const bycat = await getProductsByCategory('Moteur');

// UPDATE
await updateProduct(id, { nom: 'Nouveau nom' });

// DELETE
await deleteProduct(id);
```

### Clients
```typescript
// CREATE
await addClient({ nom, telephone, adresse });

// READ
const c = await getClient(id);
const all = await getAllClients();
const search = await searchClients('query');

// UPDATE
await updateClient(id, { nom: 'Nouveau nom' });

// DELETE
await deleteClient(id);
```

### Invoices
```typescript
// CREATE (auto-décrémente le stock!)
await addInvoice({ numero_facture, date, clientId, items, ... });

// READ
const inv = await getInvoice(id);
const all = await getAllInvoices();
const byClient = await getInvoicesByClient(clientId);
const byDate = await getInvoicesByDate('2026-03-28');

// UPDATE
await updateInvoice(id, { statut: 'payée' });

// DELETE
await deleteInvoice(id);
```

### Settings
```typescript
const settings = await getSettings();
await updateSettings({ tauxTVA: 25 });
```

## 🎣 Hooks Zustand

### useInvoiceForm
```typescript
const {
  clientId,           // ID du client sélectionné
  items,             // Tableau des articles
  setClientId,       // Définir le client
  addItem,           // Ajouter un article
  removeItem,        // Supprimer un article (par index)
  updateItemQuantity, // Changer la quantité
  clearForm,         // Réinitialiser le formulaire
} = useInvoiceForm();
```

### useSearch
```typescript
const {
  searchQuery,      // Chaîne de recherche
  setSearchQuery,   // Définir la recherche
  clearSearch,      // Réinitialiser
} = useSearch();
```

### useNotification
```typescript
const {
  message,          // Message affiché
  type,             // 'success' | 'error' | 'info'
  show,             // show(message, type)
  hide,             // Masquer
} = useNotification();

// Usage
show('Produit créé!', 'success');
show('Erreur!', 'error');
show('Information', 'info');
```

## 🛠️ Fonctions Utilitaires

### generatePDF
```typescript
// Génère un Blob PDF
const pdfBlob = await generatePDF(
  invoice,    // Données facture
  client,     // Données client
  items,      // Articles avec produits
  settings    // Paramètres du magasin
);

// Utilisation
downloadFile(pdfBlob, 'facture.pdf');
```

### Formatage
```typescript
formatCurrency(100.50);  // "100,50 MAD"
formatDate('2026-03-28'); // "28/03/2026"
getTodayDate();           // "2026-03-28"
```

### Téléchargement
```typescript
const blob = new Blob([data], { type: 'application/json' });
downloadFile(blob, 'backup.json');
```

### Partage
```typescript
shareViaWhatsApp('Bonjour, voici ma facture!');
// Ouvre WhatsApp avec le message pré-rempli
```

## 💾 Backup & Restore

### Export
```typescript
const backup = await exportData();
// Retourne:
// {
//   version: 1,
//   exportDate: '2026-03-28T10:00:00Z',
//   data: { products: [], clients: [], invoices: [], settings: [] }
// }

// Télécharger
downloadFile(JSON.stringify(backup), 'backup.json');
```

### Import
```typescript
const success = await importData(backupObject);
// Retourne: true/false
// Remplace TOUTES les données!
```

## 🎨 Composants Personnalisés

### BottomNavigation
```typescript
// Composant automatique - détecte la page active
// Affiche 5 icônes: Dashboard, Factures, Produits, Clients, Paramètres
```

### FloatingActionButton
```typescript
<FloatingActionButton 
  href="/factures/nouvelle" 
  tooltip="Nouvelle facture"
/>
```

### Notification
```typescript
// Utiliser useNotification().show()
const { show } = useNotification();
show('Succès!', 'success');
```

### ProductForm / ClientForm
```typescript
// Modals pour créer/éditer
<ProductForm 
  product={undefined}  // undefined = créer, sinon éditer
  onClose={handleClose}
/>
```

## 📱 Responsive Design

### Breakpoints (Tailwind)
```
sm: 640px    (mobile large)
md: 768px    (tablette)
lg: 1024px   (desktop)
```

### Structure mobile-first
```
- Page max-width: 640px (mobile screen)
- Padding: 16px (p-4)
- Bottom nav: 80px height
```

## 🔒 Stockage Sécurisé

### IndexedDB Structure
```
Database: FacturationDB
├── products (indexed: ++id, reference, categorie)
├── clients (indexed: ++id, nom)
├── invoices (indexed: ++id, numero_facture, date, clientId)
└── settings (indexed: ++id)
```

### Pas de Backend
- Aucun API call
- Pas d'authentification requise
- Données stockées LOCALEMENT
- Fonctionne complètement offline

## 🚀 Extensibilité

### Ajouter une nouvelle catégorie de produit

```typescript
// 1. Modifier l'interface Product
type ProductCategory = 'Moteur' | 'Freinage' | .. | 'MaCategorie';

interface Product {
  categorie: ProductCategory;
  ...
}

// 2. Ajouter à la list CATEGORIES
const CATEGORIES = ['Moteur', ..., 'Ma Catégorie'];

// Le reste fonctionne automatiquement!
```

### Ajouter un nouveau champ à une table

```typescript
// 1. Modifier l'interface
interface Product {
  ...
  couleur?: string;
}

// 2. Créer une migration
// Dexie gère automatiquement les versions!

// 3. Mettre à jour les formulaires
```

### Ajouter une nouvelle page

```typescript
// 1. Créer: app/nouveauge/page.tsx
// 2. Ajouter au layout si besoin de nav
// 3. Utiliser les hooks et composants existants
```

## 🐛 Debugging

### Console Logs
```typescript
// Tous les logs sont en anglais pour les développeurs
console.error('Error:', error);
console.log('Data:', data);
```

### IndexedDB Inspection
```
DevTools → Application → IndexedDB → FacturationDB
// Voir toutes les données
```

### Service Worker
```
DevTools → Application → Service Workers
// Voir le cache, offline mode
```

## 📊 Performance

### Code Splitting
```typescript
// Next.js app router gère automatiquement
// Chaque page est lazy-loaded
```

### Image Optimization
```typescript
// Pas d'images actuellement
// Conserver pour les futures amélioration
```

### Caching Strategy
```
Service Worker → Cache First (assets)
                → Network First (data)
```

## 🔐 Bonnes Pratiques

1. **TypeScript strict** - Toujours typé
2. **Composants petits** - Faciles à tester
3. **Pas de state globale** - Zustand local par besoin
4. **Commentaires en anglais** - Pour les developpeurs
5. **UI en français** - Pour les utilisateurs
6. **Erreurs gérées** - Notifications toast

## 🧪 Testing (future)

```typescript
// À ajouter: Jest + React Testing Library
// Exemple
test('Product can be created', async () => {
  await addProduct({ nom: 'Test', ... });
  const products = await getAllProducts();
  expect(products).toHaveLength(1);
});
```

## 📖 Ressources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Dexie.js API](https://dexie.org/docs/API-Reference)
- [Zustand](https://zustand.surge.sh/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

**Note:** Tous les noms de fonctions et variables sont en anglais.  
Tous les textes UI/UX sont en français.
