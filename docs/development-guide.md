# Guide de Développement - CRM Freelance

## Prérequis

| Outil | Version | Description |
|-------|---------|-------------|
| **Node.js** | 18+ | Runtime JavaScript |
| **npm** | 9+ | Gestionnaire de paquets |
| **PostgreSQL** | 14+ | Base de données |

---

## Installation

### 1. Cloner le projet

```bash
cd brain/crm
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

Copier le fichier d'exemple :

```bash
cp .env.example .env
```

Éditer `.env` :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/crm_freelance?schema=public"

# NextAuth (obligatoire)
NEXTAUTH_SECRET="une-chaine-secrete-aleatoire-longue-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer le schéma
npm run db:push
```

### 5. Lancer le serveur

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (hot reload) |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:push` | Applique le schéma à la BDD |
| `npm run db:studio` | Interface Prisma Studio |

---

## Structure du projet

```
crm/
├── app/                  # Pages et API (Next.js App Router)
│   ├── api/              # Routes API REST
│   ├── auth/             # Pages authentification
│   ├── clients/          # Pages clients
│   ├── opportunites/     # Page opportunités
│   ├── tickets/          # Pages tickets
│   ├── globals.css       # Styles globaux
│   ├── layout.tsx        # Layout racine
│   └── page.tsx          # Dashboard
├── components/           # Composants React
├── lib/                  # Utilitaires et hooks
├── prisma/               # Schéma base de données
├── types/                # Types TypeScript
└── docs/                 # Documentation
```

---

## Conventions de code

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| **Fichiers composants** | PascalCase | `ModaleNouveauClient.tsx` |
| **Fichiers utilitaires** | camelCase | `validateurs.ts` |
| **Variables** | camelCase | `montantEstime` |
| **Constantes** | SCREAMING_SNAKE | `ETAPES_PIPELINE` |
| **Types/Interfaces** | PascalCase | `ClientComplet` |
| **Fonctions** | camelCase | `recupererClients` |

### Structure des composants

```typescript
'use client'; // Si nécessaire

import { useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface MonComposantProps {
  prop1: string;
  prop2?: number;
}

export function MonComposant({ prop1, prop2 }: MonComposantProps) {
  const [etat, setEtat] = useState('');
  const toast = useToast();

  const gererAction = () => {
    // ...
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Imports

Ordre des imports :
1. React / Next.js
2. Bibliothèques externes
3. Composants internes
4. Hooks / Utilitaires
5. Types

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { ModaleNouveauClient } from '@/components/clients/ModaleNouveauClient';
import { useClients } from '@/lib/hooks';
import type { Client } from '@/lib/api';
```

---

## Ajouter une fonctionnalité

### 1. Nouvelle entité

1. **Schéma Prisma** (`prisma/schema.prisma`)
   ```prisma
   model NouvelleEntite {
     id    String @id @default(cuid())
     nom   String
     // ...
   }
   ```

2. **Générer le client**
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. **Types** (`types/models.ts`)
   ```typescript
   export interface NouvelleEntite {
     id: string;
     nom: string;
   }
   ```

4. **API** (`app/api/nouvelle-entite/route.ts`)
   ```typescript
   export async function GET() { ... }
   export async function POST() { ... }
   ```

5. **Hooks** (`lib/hooks.ts`)
   ```typescript
   export function useNouvelleEntite() {
     return useQuery({ ... });
   }
   ```

6. **Composants** (`components/nouvelle-entite/`)

7. **Page** (`app/nouvelle-entite/page.tsx`)

### 2. Nouveau composant UI

1. Créer le fichier dans `components/ui/`
2. Exporter depuis le fichier
3. Documenter les props avec TypeScript
4. Ajouter les animations si nécessaire

### 3. Nouvelle route API

```typescript
// app/api/ma-route/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const data = await prisma.maTable.findMany({
      where: { proprietaireId: session.user.id },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

---

## Debugging

### Prisma Studio

Interface visuelle pour explorer la base de données :

```bash
npm run db:studio
```

Ouvre [http://localhost:5555](http://localhost:5555)

### React Query DevTools

Ajouter dans `QueryProvider.tsx` :

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Dans le provider
<ReactQueryDevtools initialIsOpen={false} />
```

### Logs API

Les erreurs sont loguées dans la console serveur Next.js.

---

## Tests

### Structure recommandée

```
__tests__/
├── components/
├── api/
└── lib/
```

### Outils recommandés

- **Jest** - Test runner
- **React Testing Library** - Tests composants
- **MSW** - Mock API

---

## Déploiement

### Variables d'environnement production

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL production |
| `NEXTAUTH_SECRET` | Secret JWT (générer avec `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL de l'application |

### Build

```bash
npm run build
```

### Plateformes recommandées

| Plateforme | Usage |
|------------|-------|
| **Vercel** | Hébergement Next.js |
| **Railway** | PostgreSQL + Next.js |
| **Supabase** | PostgreSQL managé |
| **Neon** | PostgreSQL serverless |

---

## Ressources

### Documentation

- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

### Fichiers de référence

| Fichier | Contenu |
|---------|---------|
| `lib/api.ts` | Fonctions fetch API |
| `lib/hooks.ts` | Hooks React Query |
| `lib/validateurs.ts` | Schémas Zod |
| `lib/utils.ts` | Helpers (dates, montants) |
| `app/globals.css` | Variables CSS, animations |
