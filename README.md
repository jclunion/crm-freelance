# CRM Freelance

**CRM + Support unifiés pour freelances et agences numériques.**

## Stack technique

| Catégorie | Technologies |
|-----------|--------------|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, CSS Variables (thème clair/sombre) |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Auth** | NextAuth.js v4, bcryptjs (hash mot de passe) |
| **Base de données** | PostgreSQL (Supabase, Neon, ou local) |
| **State** | React Query (TanStack Query) |
| **Paiements** | Stripe (Checkout Sessions, Webhooks) |
| **Déploiement** | Vercel |

## Installation

### 1. Cloner et installer les dépendances

```bash
cd crm
npm install
```

### 2. Configurer les variables d'environnement

Copier le fichier `.env.example` en `.env` :

```bash
cp .env.example .env
```

Éditer `.env` avec tes valeurs :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/crm_freelance?schema=public"

# NextAuth (obligatoire)
NEXTAUTH_SECRET="une-chaine-secrete-aleatoire-longue-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (optionnel - pour les paiements)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Initialiser la base de données

```bash
npm run db:generate   # Génère le client Prisma
npm run db:push       # Applique le schéma à la BDD
```

### 4. Lancer le serveur

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

### 5. Créer un compte

1. Aller sur `/auth/inscription`
2. Créer un compte avec email/mot de passe
3. Se connecter sur `/auth/connexion`

## Structure du projet

```
crm/
├── app/                          # Pages Next.js (App Router)
│   ├── (dashboard)/              # Routes authentifiées avec sidebar
│   │   ├── clients/              # Liste + fiche client [id]
│   │   ├── opportunites/         # Pipeline Kanban
│   │   └── tickets/              # Liste + fiche ticket [id]
│   ├── api/                      # Routes API
│   │   ├── auth/                 # NextAuth + inscription
│   │   ├── clients/              # CRUD clients + portail + emails
│   │   ├── contacts/             # CRUD contacts
│   │   ├── opportunites/         # CRUD opportunités
│   │   ├── paiements/            # Sessions Stripe
│   │   ├── portail/              # API portail client (public)
│   │   ├── documents/            # CRUD documents liés aux opportunités
│   │   ├── upload/               # Upload de fichiers (documents projets)
│   │   ├── tickets/              # CRUD tickets
│   │   └── webhooks/             # Webhooks Stripe
│   ├── auth/                     # Pages authentification
│   │   ├── connexion/            # Login
│   │   └── inscription/          # Register
│   └── portail/                  # Portail client (public)
├── components/                   # Composants React
│   ├── clients/                  # Modales client (fiche 360° + infos entreprise)
│   ├── contacts/                 # Modales contact
│   ├── emails/                   # Modales email (inbox)
│   ├── filtres/                  # Panneau filtres avancés
│   ├── layout/                   # Sidebar, PageHeader
│   ├── opportunites/             # Modales opportunité, KanbanBoard, Paiement, GestionDocuments
│   ├── providers/                # QueryProvider, SessionProvider
│   ├── theme/                    # ThemeProvider, ThemeToggle
│   ├── tickets/                  # Modales ticket
│   └── ui/                       # Toast, RechercheGlobale, BoutonExportCSV
├── lib/                          # Utilitaires
│   ├── api.ts                    # Fonctions fetch API
│   ├── auth.ts                   # Config NextAuth
│   ├── hooks.ts                  # Hooks React Query
│   ├── integrations/             # Intégrations tierces
│   │   └── stripe.ts             # Configuration Stripe
│   ├── portail.ts                # Utilitaires portail client
│   ├── prisma.ts                 # Client Prisma
│   ├── utils.ts                  # Helpers (dates, montants)
│   └── validateurs.ts            # Schémas Zod
├── prisma/
│   └── schema.prisma             # Modèle de données
├── types/
│   ├── dto.ts                    # Interfaces DTO
│   ├── models.ts                 # Interfaces modèles
│   └── next-auth.d.ts            # Types NextAuth étendus
└── middleware.ts                 # Protection des routes
```

## Fonctionnalités

### Authentification
- ✅ Inscription avec email/mot de passe
- ✅ Connexion sécurisée (bcrypt)
- ✅ Session JWT persistante
- ✅ Protection des routes (middleware)
- ✅ Déconnexion

### Gestion des clients
- ✅ Liste avec recherche et filtres avancés
- ✅ Fiche client 360° (contacts, opportunités, tickets, timeline)
- ✅ Création, édition, suppression
- ✅ Filtres par statut, type, date de création
- ✅ **Portail client** avec authentification par email
- ✅ Informations d’entreprise sur la fiche client (raison sociale, site, adresse, SIRET, TVA, secteur, taille)

### Gestion des contacts
- ✅ Ajout de contacts à un client
- ✅ Édition et suppression
- ✅ Contact principal identifié

### Pipeline d'opportunités
- ✅ Vue Kanban par étape (Lead → Gagné)
- ✅ **Drag & drop** fluide avec mise à jour optimiste
- ✅ Vue liste alternative avec colonnes configurables
- ✅ Filtres par client, montant, dates
- ✅ Calcul du total par colonne
- ✅ **Paiements Stripe** (génération lien, statut, webhooks)
- ✅ **Documents liés aux opportunités** (contrats, devis, factures, autres)

### Gestion des documents
- ✅ Upload de fichiers locaux (PDF, Word, Excel, images) via `/api/upload`
- ✅ Association des documents aux opportunités (modèle `Document`)
- ✅ Gestion des documents dans le dashboard (composant `GestionDocuments`)
- ✅ Contrôle de la visibilité sur le portail client (`visiblePortail`)

### Portail client
- ✅ Header avec nom et logo du freelance / de l’agence (`logoUrl`)
- ✅ Vue projets / opportunités avec détails et section **Documents**
- ✅ Téléchargement / ouverture des documents visibles depuis le portail

### Tickets de support
- ✅ Liste avec filtres (statut, priorité, type, client)
- ✅ Vue Kanban par statut
- ✅ Colonnes configurables en vue liste
- ✅ Fiche ticket détaillée
- ✅ Changement de statut rapide
- ✅ Lien vers la fiche client

### Filtres avancés
- ✅ Panneau rétractable sur chaque liste
- ✅ Filtres par plage de dates
- ✅ Filtres par plage de montants
- ✅ Compteur de résultats
- ✅ Bouton de réinitialisation

### Inbox Email (Timeline)
- ✅ Consignation des emails envoyés/reçus
- ✅ Timeline enrichie avec badges colorés
- ✅ Édition et suppression des emails

## Exemples d’API (exploitation externe)

### Upload d’un document (`POST /api/upload`)

Exemple d’appel depuis un autre front (TypeScript) pour uploader un fichier et récupérer son URL publique :

```ts
async function uploaderDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include', // pour envoyer le cookie de session si besoin
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Erreur upload');
  }

  const data: { url: string; nom: string; taille: number; mimeType: string } = await response.json();
  return data.url; // URL publique à stocker dans ton propre système si nécessaire
}
```

### Création / liste de documents (`/api/documents`)

Récupérer les documents liés à une opportunité :

```ts
async function listerDocuments(opportuniteId: string) {
  const response = await fetch(`/api/documents?opportuniteId=${opportuniteId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des documents');
  }

  type Document = {
    id: string;
    nom: string;
    typeDocument: string;
    fichierUrl: string;
    visiblePortail: boolean;
  };

  const docs: Document[] = await response.json();
  return docs;
}
```

Créer un document (en réutilisant une URL de fichier déjà uploadée) :

```ts
async function creerDocument(opportuniteId: string, fichierUrl: string) {
  const body = {
    opportuniteId,
    nom: 'Contrat de prestation',
    typeDocument: 'contrat',
    fichierUrl,
    visiblePortail: true,
  };

  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création du document');
  }

  return response.json();
}
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:push` | Applique le schéma à la BDD |
| `npm run db:studio` | Interface Prisma Studio |

## Modèle de données

```
User (NextAuth)
├── Account (OAuth)
├── Session
└── clients[] ──────────┐
                        │
Client                  │
├── contacts[]          │
├── opportunites[]      │
├── tickets[]           │
└── evenements[]        │
                        │
Opportunite ◄───────────┤
├── client              │
└── proprietaire (User) │
                        │
Ticket ◄────────────────┤
├── client              │
└── assigne (User)      │
                        │
EvenementTimeline ◄─────┘
├── client
└── auteur (User)
```

### Dashboard dynamique
- ✅ Statistiques en temps réel (clients, opportunités, tickets, CA)
- ✅ CA estimé, pondéré et gagné
- ✅ Répartition du pipeline par étape
- ✅ Dernières opportunités, tickets et clients
- ✅ Rafraîchissement automatique (30s)

### Export CSV
- ✅ Export des clients filtrés
- ✅ Export des opportunités filtrées
- ✅ Export des tickets filtrés
- ✅ Format compatible Excel (UTF-8 BOM, séparateur ;)

### Mode sombre
- ✅ Thème clair / sombre / système
- ✅ Persistance du choix (localStorage)
- ✅ Détection automatique des préférences système
- ✅ Toggle accessible dans la sidebar

### Interface utilisateur
- ✅ **Barre Display** sur toutes les listes (recherche, filtres, colonnes, vue)
- ✅ **Notifications toast** (succès, erreur, warning, info)
- ✅ **Recherche globale** (`Ctrl+K` / `Cmd+K`)
- ✅ **Micro-animations** (modales, hover, transitions)
- ✅ Sélecteur de colonnes dynamique
- ✅ Toggle vue Liste / Kanban / Grille

### Raccourcis clavier
| Raccourci | Action |
|-----------|--------|
| `Ctrl+K` / `Cmd+K` | Recherche globale |
| `↑` `↓` | Naviguer dans les résultats |
| `Enter` | Sélectionner un résultat |
| `Escape` | Fermer la recherche |

## Prochaines fonctionnalités

- ⬜ Notifications email automatiques
- ⬜ Multi-utilisateurs (équipe)
- ⬜ Export PDF des fiches clients
- ⬜ Mode hors-ligne (PWA)
- ⬜ Intégration email (IMAP/SMTP)

## Licence MIT

Ce projet est sous licence **MIT** – une licence open source permissive.

### Résumé de la licence MIT

La licence MIT est l'une des licences open source les plus simples et permissives. Elle permet à quiconque de :

| ✅ Autorisé | ❌ Interdit |
|-------------|-------------|
| Utiliser le code librement | Tenir l'auteur responsable |
| Modifier le code | |
| Distribuer le code | |
| Utilisation commerciale | |
| Sous-licencier | |

### Conditions

- **Attribution** – Conserver le copyright et la notice de licence dans toutes les copies
- **Aucune garantie** – Le logiciel est fourni "tel quel"

### Projets utilisant MIT

jQuery, React, Vue.js, Angular, Symfony, Ruby on Rails, Node.js...

Voir le fichier [LICENSE](./LICENSE) pour le texte complet.
