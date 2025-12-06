# Inventaire des Composants - CRM Freelance

## Vue d'ensemble

L'application utilise **React 18** avec le pattern Server/Client Components de Next.js 14.

---

## Structure des composants

```
components/
├── clients/              # Composants métier Clients
├── contacts/             # Composants métier Contacts
├── filtres/              # Filtres avancés
├── layout/               # Structure de page
├── opportunites/         # Composants métier Opportunités
├── providers/            # Context providers
├── theme/                # Gestion du thème
├── tickets/              # Composants métier Tickets
└── ui/                   # Composants UI génériques
```

---

## Composants Layout

### Sidebar

**Fichier:** `components/layout/Sidebar.tsx`
**Type:** Client Component

Barre de navigation latérale principale.

**Fonctionnalités:**
- Logo et titre
- Toggle thème
- Bouton recherche globale (Cmd+K)
- Navigation principale (Dashboard, Clients, Opportunités, Tickets)
- Infos utilisateur connecté
- Bouton déconnexion

**Props:** Aucune

**Dépendances:**
- `next/link`
- `next/navigation`
- `next-auth/react`
- `lucide-react`
- `ThemeToggle`
- `BoutonRechercheGlobale`

---

### PageHeader

**Fichier:** `components/layout/PageHeader.tsx`
**Type:** Client Component

En-tête de page avec titre et actions.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `titre` | string | Titre de la page |
| `sousTitre?` | string | Sous-titre optionnel |
| `actions?` | ReactNode | Boutons d'action |

---

## Composants UI

### Toast / ToastProvider

**Fichier:** `components/ui/Toast.tsx`
**Type:** Client Component

Système de notifications toast.

**Types de toast:**
- `success` - Vert, 5s
- `error` - Rouge, 8s
- `warning` - Jaune, 6s
- `info` - Bleu, 5s

**Hook:** `useToast()`

```typescript
const toast = useToast();
toast.success('Titre', 'Message');
toast.error('Erreur', 'Description');
```

**Composants exportés:**
- `ToastProvider` - Provider à placer dans layout
- `useToast` - Hook pour déclencher les toasts

---

### RechercheGlobale / BoutonRechercheGlobale

**Fichier:** `components/ui/RechercheGlobale.tsx`
**Type:** Client Component

Recherche globale avec raccourci Cmd+K.

**Fonctionnalités:**
- Raccourci clavier Ctrl+K / Cmd+K
- Recherche dans Clients, Opportunités, Tickets
- Navigation clavier (↑↓ Enter Escape)
- Résultats avec icônes et badges

**Composants exportés:**
- `RechercheGlobale` - Modale de recherche
- `BoutonRechercheGlobale` - Bouton pour ouvrir

---

### BoutonExportCSV

**Fichier:** `components/ui/BoutonExportCSV.tsx`
**Type:** Client Component

Bouton d'export CSV.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `donnees` | any[] | Données à exporter |
| `nomFichier` | string | Nom du fichier |
| `colonnes` | ColonneExport[] | Configuration colonnes |

---

## Composants Clients

### ModaleNouveauClient

**Fichier:** `components/clients/ModaleNouveauClient.tsx`
**Type:** Client Component

Modale de création de client.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `ouverte` | boolean | État d'ouverture |
| `onFermer` | () => void | Callback fermeture |

**Champs:**
- Nom (requis)
- Type de client (select)
- Email principal
- Téléphone principal
- Statut (prospect/client)
- Note interne

---

### ModaleEditionClient

**Fichier:** `components/clients/ModaleEditionClient.tsx`
**Type:** Client Component

Modale d'édition de client.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `ouverte` | boolean | État d'ouverture |
| `onFermer` | () => void | Callback fermeture |
| `client` | ClientComplet | Client à éditer |

---

## Composants Contacts

### ModaleContact

**Fichier:** `components/contacts/ModaleContact.tsx`
**Type:** Client Component

Modale création/édition de contact.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `ouverte` | boolean | État d'ouverture |
| `onFermer` | () => void | Callback fermeture |
| `clientId` | string | ID du client parent |
| `contact?` | Contact | Contact à éditer (optionnel) |

---

## Composants Opportunités

### ModaleNouvelleOpportunite

**Fichier:** `components/opportunites/ModaleNouvelleOpportunite.tsx`
**Type:** Client Component

Modale de création d'opportunité.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `ouverte` | boolean | État d'ouverture |
| `onFermer` | () => void | Callback fermeture |
| `clientIdPreselectionne?` | string | Client pré-sélectionné |

---

### ModaleEditionOpportunite

**Fichier:** `components/opportunites/ModaleEditionOpportunite.tsx`
**Type:** Client Component

Modale d'édition d'opportunité.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `ouverte` | boolean | État d'ouverture |
| `onFermer` | () => void | Callback fermeture |
| `opportunite` | Opportunite \| null | Opportunité à éditer |

**Actions:**
- Modification des champs
- Suppression (avec confirmation)

---

### KanbanBoard

**Fichier:** `components/opportunites/KanbanBoard.tsx`
**Type:** Client Component

Tableau Kanban avec drag & drop.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `opportunites` | Opportunite[] | Liste des opportunités |
| `onDrop` | (id, etape) => void | Callback changement étape |
| `onEdit` | (opp) => void | Callback édition |

**Fonctionnalités:**
- Colonnes par étape du pipeline
- Drag & drop avec dnd-kit
- Mise à jour optimiste
- Total par colonne

---

## Composants Tickets

### ModaleNouveauTicket

**Fichier:** `components/tickets/ModaleNouveauTicket.tsx`
**Type:** Client Component

Modale de création de ticket.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `ouverte` | boolean | État d'ouverture |
| `onFermer` | () => void | Callback fermeture |
| `clientIdPreselectionne?` | string | Client pré-sélectionné |

---

### ModaleEditionTicket

**Fichier:** `components/tickets/ModaleEditionTicket.tsx`
**Type:** Client Component

Modale d'édition de ticket.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `ouverte` | boolean | État d'ouverture |
| `onFermer` | () => void | Callback fermeture |
| `ticket` | Ticket \| null | Ticket à éditer |

---

## Composants Filtres

### PanneauFiltres

**Fichier:** `components/filtres/PanneauFiltres.tsx`
**Type:** Client Component

Panneau de filtres avancés collapsible.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `ouvert` | boolean | État d'ouverture |
| `filtres` | FiltresState | État des filtres |
| `onChangeFiltres` | (filtres) => void | Callback changement |
| `onReinitialiser` | () => void | Callback reset |
| `options` | FiltresOptions | Options disponibles |

---

## Composants Providers

### QueryProvider

**Fichier:** `components/providers/QueryProvider.tsx`
**Type:** Client Component

Provider React Query.

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true,
    },
  },
});
```

---

### SessionProvider

**Fichier:** `components/providers/SessionProvider.tsx`
**Type:** Client Component

Provider NextAuth (wrapper).

---

## Composants Theme

### ThemeProvider

**Fichier:** `components/theme/ThemeProvider.tsx`
**Type:** Client Component

Provider de thème (clair/sombre/système).

**Fonctionnalités:**
- Détection préférence système
- Persistance localStorage
- Classe CSS sur `<html>`

---

### ThemeToggle

**Fichier:** `components/theme/ThemeToggle.tsx`
**Type:** Client Component

Bouton toggle de thème.

**États:**
- ☀️ Light
- 🌙 Dark
- 💻 System

---

## Patterns utilisés

### 1. Modales avec animation

```typescript
if (!ouverte) return null;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="modal-overlay absolute inset-0 bg-black/50" onClick={onFermer} />
    <div className="modal-content relative z-10 ...">
      {/* Contenu */}
    </div>
  </div>
);
```

### 2. Formulaires avec React Hook Form + Zod

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});
```

### 3. Mutations avec toast

```typescript
const mutation = useMutation({
  mutationFn: creerClient,
  onSuccess: () => {
    toast.success('Client créé');
    onFermer();
  },
  onError: () => {
    toast.error('Erreur');
  },
});
```

### 4. Sélecteur de colonnes

```typescript
interface ColonneConfig {
  id: string;
  label: string;
  visible: boolean;
  obligatoire?: boolean;
}

const [colonnes, setColonnes] = useState<ColonneConfig[]>(colonnesDefaut);
```

---

## Classes CSS communes

| Classe | Usage |
|--------|-------|
| `hover-lift` | Effet élévation au hover |
| `modal-overlay` | Overlay modale avec fade |
| `modal-content` | Contenu modale avec scale |
| `animate-slide-up` | Animation apparition |
| `card-stagger` | Animation cascade |
