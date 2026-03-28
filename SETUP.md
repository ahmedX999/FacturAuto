# INSTALLATION ET DÉMARRAGE RAPIDE

## 1. Installation

```bash
# Copier le dossier du projet
cd inv

# Installer les dépendances
npm install
```

## 2. Démarrage en développement

```bash
npm run dev
```

Ouvrir http://localhost:3000 dans votre navigateur.

## 3. Structure des fichiers créés

La structure complète a été générée avec:
- ✅ Configuration Next.js (tsconfig.json, next.config.js)
- ✅ Setup Tailwind CSS (tailwind.config.ts, globals.css)
- ✅ Base de données Dexie.js (lib/db.ts)
- ✅ State management Zustand (lib/store.ts)
- ✅ Utilitaires (lib/utils.ts)
- ✅ Tous les pages de l'app (app/dashboard, app/produits, etc.)
- ✅ Composants réutilisables (components/)
- ✅ PWA setup (public/manifest.json, public/sw.js)

## 4. Premières étapes

1. **Tableau de bord** → Voir les ventes du jour
2. **Produits** → Ajouter quelques produits de test (stocks)
3. **Clients** → Ajouter quelques clients de test
4. **Nouvelle facture** → Créer une facture de test
5. **Paramètres** → Configurer le nom du magasin

## 5. Test hors ligne

1. Ouvrir DevTools (F12)
2. Aller à Application → Service Workers
3. Cocher "Offline"
4. Tester la navigation dans l'app
5. Les données restent accessibles!

## 6. Installation sur iPhone

1. Ouvrir Safari à http://localhost:3000 (ou URL publique)
2. Cliquer partage (carré + flèche)
3. "Sur l'écran d'accueil"
4. Confirmer

L'app fonctionne maintenant hors ligne!

## 7. Build pour production

```bash
npm run build
npm start
```

## 📱 Notes importantes

- **Données:** Tout est stocké localement (IndexedDB)
- **Pas de serveur:** L'app fonctionne entièrement hors ligne
- **Sauvegarde:** Paramètres → Exporter les données
- **Restauration:** Paramètres → Importer les données

## 🚨 Troubleshooting

### Port 3000 déjà utilisé?
```bash
npm run dev -- -p 3001
```

### Module not found error?
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
```

### Erreur sur Dexie/IndexedDB?
- Vérifier que le navigateur supporte IndexedDB
- Essayer Chrome/Firefox/Safari récents
- Éviter le mode privé (IndexedDB limité)

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Dexie.js](https://dexie.org)
- [Zustand](https://github.com/pmndrs/zustand)
- [jsPDF](https://github.com/parallax/jsPDF)

## ✅ Prêts pour la production?

Avant de déployer:
1. [ ] Tester sur un vrai iPhone
2. [ ] Vérifier les performances (Lighthouse)
3. [ ] Tester l'export/import de données
4. [ ] Vérifier tout hors ligne
5. [ ] Tests des PDF
6. [ ] Test du partage WhatsApp

---

**Support:** Tous les commentaires du code sont en anglais pour développement futur.  
**Interface:** 100% en français pour l'utilisateur.
