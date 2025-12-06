# CRM Freelance - Documentation Index

**Version:** 0.1.0
**Type de projet:** Application Web Full-Stack
**Dernière mise à jour:** 2025-12-04

---

## 📋 Vue d'ensemble

CRM Freelance est une application de gestion de la relation client (CRM) et de support unifiés, conçue pour les freelances et agences numériques. Elle permet de gérer les clients, contacts, opportunités commerciales et tickets de support dans une interface moderne et intuitive.

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

---

## 📁 Structure du Projet

```
crm/
├── app/                          # Pages Next.js (App Router)
│   ├── api/                      # Routes API REST
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── clients/              # CRUD clients
│   │   ├── contacts/             # CRUD contacts
│   │   ├── dashboard/            # Stats dashboard
│   │   ├── opportunites/         # CRUD opportunités
│   │   └── tickets/              # CRUD tickets
│   ├── auth/                     # Pages authentification
│   │   ├── connexion/            # Login
│   │   └── inscription/          # Register
│   ├── clients/                  # Liste + fiche client [id]
│   ├── opportunites/             # Pipeline Kanban
│   ├── tickets/                  # Liste + fiche ticket [id]
│   ├── globals.css               # Styles globaux + animations
│   ├── layout.tsx                # Layout racine + providers
│   └── page.tsx                  # Dashboard
├── components/                   # Composants React
│   ├── clients/                  # Modales client
│   ├── contacts/                 # Modales contact
│   ├── filtres/                  # Panneau filtres avancés
│   ├── layout/                   # Sidebar, PageHeader
│   ├── opportunites/             # Modales + KanbanBoard
│   ├── providers/                # QueryProvider, SessionProvider
│   ├── theme/                    # ThemeProvider, ThemeToggle
│   ├── tickets/                  # Modales ticket
│   └── ui/                       # Toast, RechercheGlobale, ExportCSV
├── lib/                          # Utilitaires
│   ├── api.ts                    # Fonctions fetch API
│   ├── auth.ts                   # Config NextAuth
│   ├── export-csv.ts             # Export CSV
│   ├── hooks.ts                  # Hooks React Query
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
| **EvenementTimeline** | Historique d'activité | ← Client |

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
# Éditer .env avec DATABASE_URL et NEXTAUTH_SECRET

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

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/POST | `/api/clients` | Liste/Création clients |
| GET/PUT/DELETE | `/api/clients/[id]` | CRUD client |
| GET/POST | `/api/contacts` | Liste/Création contacts |
| PUT/DELETE | `/api/contacts/[id]` | CRUD contact |
| GET/POST | `/api/opportunites` | Liste/Création opportunités |
| PUT/DELETE | `/api/opportunites/[id]` | CRUD opportunité |
| GET/POST | `/api/tickets` | Liste/Création tickets |
| GET/PUT/DELETE | `/api/tickets/[id]` | CRUD ticket |
| GET | `/api/dashboard` | Statistiques dashboard |

---

## 📚 Documentation associée

- [README.md](../README.md) - Documentation principale
- [UX-DESIGN.md](./UX-DESIGN.md) - Guide UX complet
- [LICENSE](../LICENSE) - Licence MIT
