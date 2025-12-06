# CRM Freelance - Documentation Index

**Version:** 0.2.0
**Type de projet:** Application Web Full-Stack
**Dernière mise à jour:** 2025-12-06

---

## 📋 Vue d'ensemble

CRM Freelance est une application de gestion de la relation client (CRM) et de support unifiés, conçue pour les freelances et agences numériques. Elle permet de gérer les clients, contacts, opportunités commerciales, tickets de support, paiements Stripe et portail client dans une interface moderne et intuitive.

### Liens rapides

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | Architecture technique détaillée |
| [Modèle de données](./data-models.md) | Schéma Prisma et relations |
| [API Reference](./api-contracts.md) | Endpoints REST documentés |
| [Composants UI](./component-inventory.md) | Inventaire des composants React |
| [Guide UX Design](./UX-DESIGN.md) | Système de design et conventions |
| [Guide de développement](./development-guide.md) | Setup et commandes |

---

## 🏗️ Stack Technique

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 14.2+ | Framework React (App Router) |
| **React** | 18.3+ | Bibliothèque UI |
| **TypeScript** | 5.4+ | Typage statique |
| **Tailwind CSS** | 3.4+ | Styling utilitaire |
| **TanStack Query** | 5.40+ | Gestion état serveur |
| **Lucide React** | 0.378+ | Icônes |
| **dnd-kit** | 6.3+ | Drag & drop |

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js API Routes** | 14.2+ | Endpoints REST |
| **Prisma** | 5.14+ | ORM |
| **PostgreSQL** | - | Base de données |
| **NextAuth.js** | 4.24+ | Authentification |
| **bcryptjs** | 2.4+ | Hash mots de passe |
| **Zod** | 3.23+ | Validation |
| **Stripe** | 17+ | Paiements en ligne |

---

## 📁 Structure du Projet

```
crm/
├── app/                          # Pages Next.js (App Router)
│   ├── (dashboard)/              # Routes authentifiées avec sidebar
│   │   ├── clients/              # Liste + fiche client [id]
│   │   ├── opportunites/         # Pipeline Kanban
│   │   ├── tickets/              # Liste + fiche ticket [id]
│   │   ├── layout.tsx            # Layout avec Sidebar
│   │   └── page.tsx              # Dashboard
│   ├── api/                      # Routes API REST
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── clients/              # CRUD clients + portail + emails
│   │   ├── contacts/             # CRUD contacts
│   │   ├── dashboard/            # Stats dashboard
│   │   ├── opportunites/         # CRUD opportunités
│   │   ├── paiements/            # Sessions Stripe
│   │   ├── portail/              # API portail client (public)
│   │   ├── tickets/              # CRUD tickets
│   │   └── webhooks/             # Webhooks Stripe
│   ├── auth/                     # Pages authentification
│   │   ├── connexion/            # Login
│   │   └── inscription/          # Register
│   ├── portail/                  # Portail client (public)
│   │   └── [token]/              # Page portail avec auth email
│   ├── globals.css               # Styles globaux + animations
│   └── layout.tsx                # Layout racine + providers
├── components/                   # Composants React
│   ├── clients/                  # Modales client
│   ├── contacts/                 # Modales contact
│   ├── emails/                   # Modales email (inbox)
│   ├── filtres/                  # Panneau filtres avancés
│   ├── layout/                   # Sidebar, PageHeader
│   ├── opportunites/             # Modales + KanbanBoard + Paiement
│   ├── providers/                # QueryProvider, SessionProvider
│   ├── theme/                    # ThemeProvider, ThemeToggle
│   ├── tickets/                  # Modales ticket
│   └── ui/                       # Toast, RechercheGlobale, ExportCSV
├── lib/                          # Utilitaires
│   ├── api.ts                    # Fonctions fetch API
│   ├── auth.ts                   # Config NextAuth
│   ├── export-csv.ts             # Export CSV
│   ├── hooks.ts                  # Hooks React Query
│   ├── integrations/             # Intégrations tierces
│   │   └── stripe.ts             # Configuration Stripe
│   ├── portail.ts                # Utilitaires portail client
│   ├── prisma.ts                 # Client Prisma singleton
│   ├── utils.ts                  # Helpers (dates, montants)
│   └── validateurs.ts            # Schémas Zod
├── prisma/
│   └── schema.prisma             # Modèle de données
├── types/                        # Types TypeScript
│   ├── dto.ts                    # Interfaces DTO
│   ├── models.ts                 # Interfaces modèles
│   └── next-auth.d.ts            # Extension types NextAuth
├── docs/                         # Documentation
│   └── UX-DESIGN.md              # Guide UX complet
└── middleware.ts                 # Protection des routes
```

---

## 🔐 Authentification

- **Provider:** Credentials (email/mot de passe)
- **Session:** JWT
- **Hash:** bcryptjs
- **Protection:** Middleware Next.js

### Routes protégées

Toutes les routes sauf `/auth/*` nécessitent une authentification.

---

## 📊 Modèle de Données

### Entités principales

| Entité | Description | Relations |
|--------|-------------|-----------|
| **User** | Utilisateur authentifié | → Clients, Opportunités, Tickets |
| **Client** | Organisation ou personne | → Contacts, Opportunités, Tickets, Timeline |
| **Contact** | Personne chez un client | ← Client |
| **Opportunite** | Affaire commerciale | ← Client, User |
| **Ticket** | Demande de support | ← Client, User |
| **EvenementTimeline** | Historique d'activité (emails, paiements) | ← Client |

### Diagramme simplifié

```
User ─┬─→ Client ─┬─→ Contact
      │           ├─→ Opportunite
      │           ├─→ Ticket
      │           └─→ EvenementTimeline
      ├─→ Opportunite (propriétaire)
      └─→ Ticket (assigné)
```

---

## 🎨 Fonctionnalités UI

### Dashboard

- KPIs en temps réel
- Barre de progression pipeline
- Dernières opportunités/tickets/clients
- Rafraîchissement auto (30s)

### Listes (Clients, Opportunités, Tickets)

- **Barre Display** : recherche, filtres, colonnes, vues
- **Filtres avancés** : panneau collapsible
- **Sélecteur de colonnes** : personnalisation
- **Vues** : Liste / Kanban / Grille
- **Export CSV** : données filtrées

### Paiements Stripe

- **Génération de lien** : depuis la modale opportunité
- **Statut de paiement** : badges visuels (en attente, payé)
- **Webhooks** : mise à jour automatique après paiement
- **Redirection** : retour au CRM après paiement

### Portail Client

- **Accès sécurisé** : token unique + authentification par email
- **Vue projets** : liste des opportunités avec statut paiement
- **Vue tickets** : historique et création de tickets
- **Gestion** : génération/révocation du lien depuis la fiche client

### Inbox Email (Timeline)

- **Consignation** : emails envoyés/reçus
- **Timeline enrichie** : badges colorés par type d'événement
- **Édition** : modification et suppression des emails

### Interactions

- **Drag & drop** : Kanban avec mise à jour optimiste
- **Modales** : Création/édition avec animations
- **Toasts** : Notifications (succès, erreur, warning, info)
- **Recherche globale** : Ctrl+K / Cmd+K

### Thème

- Mode clair / sombre / système
- Variables CSS personnalisées
- Persistance localStorage

---

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Éditer .env avec :
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - STRIPE_SECRET_KEY (optionnel)
# - STRIPE_WEBHOOK_SECRET (optionnel)

# Base de données
npm run db:generate
npm run db:push

# Développement
npm run dev
```

---

## 📝 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm run db:generate` | Génère client Prisma |
| `npm run db:push` | Applique schéma à la BDD |
| `npm run db:studio` | Interface Prisma Studio |

---

## 🔗 Endpoints API

### CRUD Principal

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/POST | `/api/clients` | Liste/Création clients |
| GET/PATCH/DELETE | `/api/clients/[id]` | CRUD client |
| GET/POST | `/api/contacts` | Liste/Création contacts |
| PATCH/DELETE | `/api/contacts/[id]` | CRUD contact |
| GET/POST | `/api/opportunites` | Liste/Création opportunités |
| PATCH/DELETE | `/api/opportunites/[id]` | CRUD opportunité |
| GET/POST | `/api/tickets` | Liste/Création tickets |
| GET/PATCH/DELETE | `/api/tickets/[id]` | CRUD ticket |
| GET | `/api/dashboard` | Statistiques dashboard |

### Paiements Stripe

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/paiements/stripe/session` | Créer session Checkout |
| POST | `/api/webhooks/stripe` | Webhook événements Stripe |

### Portail Client

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST/DELETE | `/api/clients/[id]/portail` | Générer/Révoquer token portail |
| GET | `/api/portail/[token]` | Données client (public) |
| GET | `/api/portail/[token]/info` | Infos basiques pour auth |
| POST | `/api/portail/[token]/tickets` | Créer ticket depuis portail |

### Inbox Email

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/POST | `/api/clients/[id]/emails` | Liste/Création emails |
| PATCH/DELETE | `/api/clients/[id]/emails/[emailId]` | Modifier/Supprimer email |

---

## 📚 Documentation associée

- [README.md](../README.md) - Documentation principale
- [UX-DESIGN.md](./UX-DESIGN.md) - Guide UX complet
- [LICENSE](../LICENSE) - Licence MIT
