# NLE Best Deal — ajout de produits depuis iPhone

## Ce que le système fait
- `admin.html` : espace privé pour ajouter des produits depuis un téléphone.
- `supabase-config.js` : connexion entre le site et Supabase.
- `supabase-setup.sql` : crée la table produits, la sécurité et le stockage des photos.
- `index.html` : garde les produits actuels et récupère automatiquement les nouveaux produits publiés.

## Installation initiale (une seule fois)

### 1. Créer le projet Supabase
Depuis ton iPhone, ouvre le tableau de bord Supabase et crée un nouveau projet.

### 2. Créer ton compte administrateur
Dans **Authentication → Users**, crée ton compte avec ton email et un mot de passe fort.

Ensuite, dans **Authentication → Settings**, désactive les inscriptions publiques. Le compte que tu crées toi-même sera alors le seul compte autorisé à utiliser l'espace d'administration avec les règles fournies ici.

### 3. Exécuter le SQL
Dans **SQL Editor**, ouvre `supabase-setup.sql`, colle son contenu et exécute-le.

### 4. Récupérer les deux informations du projet
Dans les réglages/API de Supabase, récupère :
- l'URL du projet ;
- la **Publishable key** (ou l'ancienne clé `anon` si ton projet affiche encore cette appellation).

⚠️ Ne mets **jamais** une clé `service_role` dans le site.

### 5. Remplir `supabase-config.js`
Remplace seulement les deux valeurs :
```js
window.NLE_SUPABASE_CONFIG = {
  url: 'https://TON-PROJET.supabase.co',
  key: 'TA_PUBLISHABLE_KEY'
};
```

### 6. Envoyer 4 fichiers sur GitHub
À la racine de ton dépôt NLE Best Deal, mets :
- `index.html`
- `admin.html`
- `supabase-config.js`
- `supabase-setup.sql` (il peut rester dans le dépôt, mais ce fichier n'est pas nécessaire au fonctionnement du site)

### 7. Utilisation ensuite depuis l'iPhone
Ouvre :
`https://roodyjerry16-svg.github.io/NLE-Best-Deal/admin.html`

Connecte-toi → remplis le formulaire → choisis les photos → **Publier le produit**.

Le produit sera enregistré dans la base et apparaîtra automatiquement dans la boutique lors du prochain chargement du site.

## Important
Le système actuel ne supprime pas les 14 produits déjà présents dans `index.html`. Les nouveaux produits sont ajoutés en plus.

La boutique garde aussi la recherche, les catégories, WhatsApp et la fiche produit.
