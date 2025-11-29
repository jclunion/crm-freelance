# Guide UX Design - CRM Freelance

Ce document décrit les choix de design et les conventions UX utilisées dans l'application.

---

## 1. Système Typographique

### Polices utilisées

L'application utilise **3 polices** selon les bonnes pratiques UX :

| Police | Usage | Variable CSS |
|--------|-------|--------------|
| **Plus Jakarta Sans** | Titres, headers, éléments d'impact | `--font-display` |
| **Inter** | Corps de texte, UI générale | `--font-sans` |
| **JetBrains Mono** | Données, chiffres, montants, codes | `--font-mono` |

### Hiérarchie des tailles

| Élément | Taille | Poids | Classe Tailwind |
|---------|--------|-------|-----------------|
| `h1` | 32px (2rem) | 700 | `text-3xl font-bold` |
| `h2` | 22px (1.375rem) | 600 | `text-xl font-semibold` |
| `h3` | 19px (1.1875rem) | 600 | `text-lg font-semibold` |
| `h4` | 16px (1rem) | 600 | `text-base font-semibold` |
| `p` | 14px (0.875rem) | 400 | `text-sm` |
| `button` | 14px (0.875rem) | 500 | `text-sm font-medium` |
| `small` | 12px (0.75rem) | 400 | `text-xs` |

### Classes utilitaires

```css
/* Titres avec police Display */
.font-display { font-family: var(--font-display); }

/* Corps de texte avec Inter */
.font-sans { font-family: var(--font-sans); }

/* Données numériques avec JetBrains Mono */
.font-mono { font-family: var(--font-mono); }

/* Montants et prix */
.montant { 
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

/* KPIs et statistiques */
.stat-value {
  font-family: var(--font-mono);
  font-weight: 500;
}
```

### Optimisations typographiques

- **Antialiasing** : `-webkit-font-smoothing: antialiased`
- **Letter-spacing négatif** sur les titres : `-0.025em`
- **Line-height** optimisé : `1.2` (titres), `1.6` (texte)
- **Font-feature-settings** : `'cv02', 'cv03', 'cv04', 'cv11'`

---

## 2. Palette de Couleurs

### Mode Clair (Light)

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--background` | `#ffffff` | Fond principal |
| `--foreground` | `#212529` | Texte principal |
| `--muted` | `#6c757d` | Texte secondaire |
| `--border` | `#dee2e6` | Bordures, séparateurs |
| `--primary` | `#6366f1` | Actions principales, liens |
| `--primary-foreground` | `#ffffff` | Texte sur fond primary |
| `--destructive` | `#dc3545` | Actions dangereuses |
| `--success` | `#28a745` | Succès, validation |
| `--warning` | `#ffc107` | Avertissements |
| `--card` | `#f8f9fa` | Fond des cartes |
| `--card-hover` | `#e9ecef` | Hover sur cartes |

### Mode Sombre (Dark)

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--background` | `#1f1f1f` | Fond principal |
| `--foreground` | `#e0e0e0` | Texte principal |
| `--muted` | `#9e9e9e` | Texte secondaire |
| `--border` | `#3d3d3d` | Bordures, séparateurs |
| `--primary` | `#818cf8` | Actions principales |
| `--primary-foreground` | `#1f1f1f` | Texte sur fond primary |
| `--destructive` | `#e74c3c` | Actions dangereuses |
| `--success` | `#27ae60` | Succès, validation |
| `--warning` | `#f39c12` | Avertissements |
| `--card` | `#2d2d2d` | Fond des cartes |
| `--card-hover` | `#383838` | Hover sur cartes |

### Utilisation des couleurs

```jsx
// Fond et texte
<div className="bg-[var(--background)] text-[var(--foreground)]">

// Texte secondaire
<span className="text-[var(--muted)]">

// Bouton principal
<button className="bg-[var(--primary)] text-[var(--primary-foreground)]">

// Bordures
<div className="border border-[var(--border)]">

// Cartes
<div className="bg-[var(--card)] hover:bg-[var(--card-hover)]">
```

---

## 3. Composants UI

### Boutons

| Type | Classes | Usage |
|------|---------|-------|
| **Primary** | `bg-[var(--primary)] text-[var(--primary-foreground)]` | Action principale |
| **Secondary** | `bg-[var(--border)] text-[var(--foreground)]` | Action secondaire |
| **Destructive** | `bg-[var(--destructive)] text-white` | Suppression |
| **Ghost** | `hover:bg-[var(--border)]` | Actions discrètes |

```jsx
// Bouton principal
<button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90">
  Action
</button>

// Bouton secondaire
<button className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]">
  Annuler
</button>
```

### Inputs

```jsx
<input
  type="text"
  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
  placeholder="Placeholder..."
/>
```

### Cartes

```jsx
<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:bg-[var(--card-hover)] hover-lift">
  {/* Contenu */}
</div>
```

### Badges / Tags

```jsx
// Badge statut
<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
  Actif
</span>

// Badge priorité haute
<span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
  Haute
</span>
```

---

## 4. Animations & Transitions

### Animations disponibles

| Classe | Animation | Durée | Usage |
|--------|-----------|-------|-------|
| `animate-fade-in` | Fondu | 0.2s | Apparition d'éléments |
| `animate-slide-up` | Glissement ↑ | 0.3s | Toasts, cartes |
| `animate-slide-down` | Glissement ↓ | 0.3s | Dropdowns, menus |
| `animate-scale-in` | Zoom | 0.2s | Modales |
| `animate-shake` | Secousse | 0.5s | Erreurs |

### Effets hover

| Classe | Effet | Usage |
|--------|-------|-------|
| `hover-lift` | Élévation + ombre | Cartes cliquables |
| `hover-glow` | Halo lumineux | Éléments importants |
| `transition-smooth` | Transition fluide | Tous éléments |

```jsx
// Carte avec effet lift
<div className="hover-lift cursor-pointer rounded-lg border p-4">

// Bouton avec glow
<button className="hover-glow rounded-lg bg-[var(--primary)] px-4 py-2">
```

### Modales

```jsx
// Overlay avec fondu
<div className="modal-overlay fixed inset-0 bg-black/50">

// Contenu avec scale
<div className="modal-content rounded-lg bg-[var(--background)]">
```

### Stagger effect (apparition en cascade)

```jsx
<div className="card-stagger">Carte 1</div>  {/* delay: 0ms */}
<div className="card-stagger">Carte 2</div>  {/* delay: 50ms */}
<div className="card-stagger">Carte 3</div>  {/* delay: 100ms */}
```

---

## 5. Layout & Espacement

### Grille de base

- **Unité de base** : 4px
- **Espacements** : 4, 8, 12, 16, 24, 32, 48, 64px

### Structure des pages

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (256px fixe)  │  Main Content (flex-1)    │
│                        │                            │
│  - Logo + Theme        │  ┌──────────────────────┐ │
│  - Recherche globale   │  │  Header de page      │ │
│  - Navigation          │  │  (titre + actions)   │ │
│  - User info           │  ├──────────────────────┤ │
│                        │  │  Barre Display       │ │
│                        │  │  (recherche, filtres)│ │
│                        │  ├──────────────────────┤ │
│                        │  │  Contenu principal   │ │
│                        │  │  (liste, kanban...)  │ │
│                        │  └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Padding standard

| Zone | Padding |
|------|---------|
| Page | `p-6` (24px) |
| Carte | `p-4` (16px) |
| Bouton | `px-4 py-2` |
| Input | `px-3 py-2` |
| Badge | `px-2 py-0.5` |

---

## 6. Notifications Toast

### Types disponibles

| Type | Couleur | Durée | Usage |
|------|---------|-------|-------|
| `success` | Vert | 5s | Action réussie |
| `error` | Rouge | 8s | Erreur |
| `warning` | Jaune | 6s | Avertissement |
| `info` | Bleu | 5s | Information |

### Utilisation

```jsx
import { useToast } from '@/components/ui/Toast';

function MonComposant() {
  const toast = useToast();

  const handleAction = () => {
    toast.success('Titre', 'Message de succès');
    toast.error('Erreur', 'Description de l\'erreur');
    toast.warning('Attention', 'Message d\'avertissement');
    toast.info('Info', 'Message informatif');
  };
}
```

### Position et animation

- **Position** : Bas droite (`bottom-0 right-0`)
- **Animation** : `animate-slide-up`
- **Empilage** : Vertical avec `gap-2`

---

## 7. Recherche Globale

### Raccourci clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+K` / `Cmd+K` | Ouvrir la recherche |
| `↑` `↓` | Naviguer dans les résultats |
| `Enter` | Sélectionner |
| `Escape` | Fermer |

### Comportement

- Recherche en temps réel (pas de debounce)
- Maximum 10 résultats affichés
- Recherche dans : Clients, Opportunités, Tickets
- Affichage du type avec icône et badge

---

## 8. Barre Display

Présente sur toutes les pages de liste (Clients, Opportunités, Tickets).

### Composants

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 Rechercher...  │ Filtres (3) │ Colonnes │ ☰ Liste │ ▦ Kanban │
└─────────────────────────────────────────────────────────────────┘
```

| Élément | Fonction |
|---------|----------|
| **Recherche** | Filtre instantané sur le nom/titre |
| **Filtres** | Toggle panneau filtres avancés |
| **Colonnes** | Dropdown sélection colonnes visibles |
| **Vue** | Toggle Liste / Kanban / Grille |

### Sélecteur de colonnes

- Colonnes obligatoires désactivées (grisées)
- Checkbox pour chaque colonne optionnelle
- Bouton "Réinitialiser" pour revenir aux défauts

---

## 9. Accessibilité

### Contrastes

- Ratio minimum : 4.5:1 (texte normal)
- Ratio minimum : 3:1 (texte large, icônes)

### Focus

```css
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}
```

### Attributs ARIA

```jsx
// Boutons avec icône seule
<button aria-label="Fermer">
  <X className="h-5 w-5" />
</button>

// Alertes
<div role="alert">Message d'erreur</div>

// Navigation
<nav aria-label="Navigation principale">
```

---

## 10. Responsive Design

### Breakpoints Tailwind

| Breakpoint | Largeur | Usage |
|------------|---------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablette |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |

### Adaptations

- **Sidebar** : Fixe sur desktop, drawer sur mobile (à implémenter)
- **Grilles** : `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Tableaux** : Scroll horizontal sur mobile

---

## 11. Icônes

### Bibliothèque

**Lucide React** - Icônes modernes et cohérentes.

### Tailles standard

| Contexte | Taille | Classe |
|----------|--------|--------|
| Bouton | 16px | `h-4 w-4` |
| Navigation | 20px | `h-5 w-5` |
| Header | 24px | `h-6 w-6` |
| Illustration | 48px | `h-12 w-12` |

### Icônes principales

| Icône | Usage |
|-------|-------|
| `LayoutDashboard` | Dashboard |
| `Users` | Clients |
| `Target` | Opportunités |
| `Ticket` | Tickets |
| `Search` | Recherche |
| `Filter` | Filtres |
| `Columns` | Colonnes |
| `Plus` | Ajouter |
| `X` | Fermer |
| `Check` | Valider |

---

## 12. Bonnes Pratiques

### Do ✅

- Utiliser les variables CSS pour les couleurs
- Respecter la hiérarchie typographique
- Ajouter des transitions sur les interactions
- Utiliser `font-mono` pour les données numériques
- Fournir un feedback visuel (toast) après chaque action

### Don't ❌

- Hardcoder des couleurs hex
- Mélanger les polices sans raison
- Omettre les états hover/focus
- Utiliser des animations trop longues (>0.3s)
- Afficher des données sans formatage

---

## Fichiers de référence

| Fichier | Contenu |
|---------|---------|
| `app/globals.css` | Variables CSS, animations, typographie |
| `tailwind.config.ts` | Configuration Tailwind, polices |
| `app/layout.tsx` | Import des polices Google |
| `components/ui/Toast.tsx` | Système de notifications |
| `components/ui/RechercheGlobale.tsx` | Recherche Cmd+K |
