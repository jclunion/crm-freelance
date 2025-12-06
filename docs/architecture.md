# Architecture - CRM Freelance

## Vue d'ensemble

CRM Freelance suit une architecture **monolithique modulaire** basée sur Next.js 14+ avec App Router. L'application combine frontend et backend dans un seul déploiement.

---

## Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────────┤
│  React 18 + Next.js App Router                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Pages     │  │ Components  │  │   Hooks     │                 │
│  │  (app/)     │  │(components/)│  │ (lib/hooks) │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                         │
│         └────────────────┼────────────────┘                         │
│                          ▼                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              TanStack Query (React Query)                    │   │
│  │              - Cache                                         │   │
│  │              - Mutations optimistes                          │   │
│  │              - Refetch automatique                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP (fetch)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVER (Next.js)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Middleware (middleware.ts)                │   │
│  │                    - Protection des routes                   │   │
│  │                    - Redirection auth                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│                                    ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    API Routes (app/api/)                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│  │  │ clients  │ │ contacts │ │opportun. │ │ tickets  │       │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │   │
│  │       └────────────┼────────────┼────────────┘              │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│                                    ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Validation (Zod)                          │   │
│  │                    lib/validateurs.ts                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│                                    ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM                                │   │
│  │                    lib/prisma.ts                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  users   │ │ clients  │ │ contacts │ │opportun. │ │ tickets  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Couches applicatives

### 1. Couche Présentation (Frontend)

**Responsabilités:**
- Rendu des interfaces utilisateur
- Gestion de l'état local (useState, useReducer)
- Gestion de l'état serveur (React Query)
- Routing (Next.js App Router)

**Technologies:**
- React 18 avec Server Components
- Tailwind CSS pour le styling
- Lucide React pour les icônes
- dnd-kit pour le drag & drop

**Structure:**
```
app/
├── page.tsx              # Dashboard (Server Component)
├── layout.tsx            # Layout racine + Providers
├── clients/
│   ├── page.tsx          # Liste clients
│   └── [id]/page.tsx     # Fiche client
├── opportunites/
│   └── page.tsx          # Pipeline Kanban
└── tickets/
    ├── page.tsx          # Liste tickets
    └── [id]/page.tsx     # Fiche ticket
```

### 2. Couche Composants

**Organisation:**
```
components/
├── layout/               # Composants de structure
│   ├── Sidebar.tsx       # Navigation principale
│   └── PageHeader.tsx    # En-tête de page
├── ui/                   # Composants génériques
│   ├── Toast.tsx         # Notifications
│   ├── RechercheGlobale.tsx  # Cmd+K
│   └── BoutonExportCSV.tsx   # Export
├── clients/              # Composants métier
├── opportunites/
├── tickets/
└── providers/            # Context providers
```

### 3. Couche API (Backend)

**Pattern:** REST API avec Next.js Route Handlers

**Structure:**
```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts  # NextAuth endpoints
│   └── inscription/route.ts    # Inscription
├── clients/
│   ├── route.ts                # GET (liste), POST (création)
│   └── [id]/route.ts           # GET, PUT, DELETE
├── contacts/
├── opportunites/
├── tickets/
└── dashboard/
    └── route.ts                # GET (statistiques)
```

**Exemple de route:**
```typescript
// app/api/clients/route.ts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  
  const clients = await prisma.client.findMany({
    where: { proprietaireId: session.user.id },
    include: { _count: { select: { opportunites: true, tickets: true } } }
  });
  
  return NextResponse.json(clients);
}
```

### 4. Couche Données

**ORM:** Prisma

**Singleton pattern:**
```typescript
// lib/prisma.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## Patterns architecturaux

### 1. Server Components vs Client Components

| Type | Usage | Marqueur |
|------|-------|----------|
| **Server Component** | Pages, layouts, fetch initial | (défaut) |
| **Client Component** | Interactivité, hooks, events | `'use client'` |

### 2. Data Fetching

**Côté serveur (Server Components):**
```typescript
// Fetch direct dans le composant
async function ClientsPage() {
  const clients = await prisma.client.findMany();
  return <ClientsList clients={clients} />;
}
```

**Côté client (React Query):**
```typescript
// lib/hooks.ts
export function useClients(params?: ClientsParams) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => recupererClients(params),
  });
}
```

### 3. Mutations optimistes

```typescript
// Exemple: Kanban drag & drop
const mutation = useMutation({
  mutationFn: mettreAJourOpportunite,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['opportunites']);
    const previous = queryClient.getQueryData(['opportunites']);
    queryClient.setQueryData(['opportunites'], (old) => /* update optimiste */);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['opportunites'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['opportunites']);
  },
});
```

### 4. Validation

**Schémas Zod:**
```typescript
// lib/validateurs.ts
export const schemaClient = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  typeClient: z.enum(['freelance', 'agence', 'entreprise', 'particulier']),
  emailPrincipal: z.string().email().optional().or(z.literal('')),
  // ...
});
```

---

## Authentification

### Flow

```
1. User → /auth/connexion
2. Submit credentials
3. NextAuth → Verify (bcrypt)
4. Create JWT session
5. Redirect → Dashboard
6. Middleware → Check session on each request
```

### Configuration

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        // Vérification email + bcrypt
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => { /* ... */ },
    session: async ({ session, token }) => { /* ... */ },
  },
};
```

---

## Gestion d'état

### État global

| Type | Solution | Usage |
|------|----------|-------|
| **État serveur** | React Query | Données API |
| **État UI** | useState/useReducer | Modales, filtres |
| **Thème** | Context + localStorage | Mode sombre |
| **Session** | NextAuth | Authentification |

### Providers

```typescript
// app/layout.tsx
<ThemeProvider>
  <SessionProvider>
    <QueryProvider>
      <ToastProvider>
        {children}
        <RechercheGlobale />
      </ToastProvider>
    </QueryProvider>
  </SessionProvider>
</ThemeProvider>
```

---

## Sécurité

### Mesures implémentées

| Mesure | Implémentation |
|--------|----------------|
| **Auth** | NextAuth + JWT |
| **Hash passwords** | bcryptjs |
| **Route protection** | Middleware |
| **API protection** | Session check |
| **Validation** | Zod schemas |
| **CSRF** | NextAuth built-in |

### Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/connexion', request.url));
  }
  
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}
```

---

## Performance

### Optimisations

| Technique | Implémentation |
|-----------|----------------|
| **Code splitting** | Next.js automatique |
| **Image optimization** | next/image |
| **Font optimization** | next/font/google |
| **Caching** | React Query (staleTime) |
| **Optimistic updates** | Mutations React Query |
| **Lazy loading** | Dynamic imports |

### React Query config

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,      // 30 secondes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
```

---

## Déploiement

### Environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL |
| `NEXTAUTH_SECRET` | Secret JWT (32+ chars) |
| `NEXTAUTH_URL` | URL de l'application |

### Build

```bash
npm run build
# → prisma generate + next build
```

### Plateformes recommandées

- **Vercel** (recommandé pour Next.js)
- **Railway** (PostgreSQL inclus)
- **Supabase** (PostgreSQL + Auth optionnel)
