# Modèle de Données - CRM Freelance

## Vue d'ensemble

Le modèle de données est défini avec **Prisma ORM** et utilise **PostgreSQL** comme base de données.

---

## Diagramme Entité-Relation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   USER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ id            String    @id @default(cuid())                        │    │
│  │ email         String    @unique                                     │    │
│  │ motDePasse    String?   (bcrypt hash)                               │    │
│  │ nomAffiche    String?                                               │    │
│  │ role          String    @default("freelance_solo")                  │    │
│  │ fuseauHoraire String    @default("Europe/Paris")                    │    │
│  │ langueInterface String  @default("fr")                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│         │                    │                         │                     │
│         │ 1:N                │ 1:N                     │ 1:N                 │
│         ▼                    ▼                         ▼                     │
│    ┌─────────┐         ┌───────────┐            ┌──────────┐                │
│    │ Client  │         │Opportunite│            │  Ticket  │                │
│    │(proprio)│         │ (proprio) │            │ (assigné)│                │
│    └─────────┘         └───────────┘            └──────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENT                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ id                 String    @id @default(cuid())                   │    │
│  │ nom                String                                           │    │
│  │ typeClient         String    (freelance|agence|entreprise|part.)    │    │
│  │ emailPrincipal     String?                                          │    │
│  │ telephonePrincipal String?                                          │    │
│  │ statutClient       String    @default("prospect")                   │    │
│  │ noteInterne        String?                                          │    │
│  │ proprietaireId     String    → User                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│         │              │                │                │                   │
│         │ 1:N          │ 1:N            │ 1:N            │ 1:N              │
│         ▼              ▼                ▼                ▼                   │
│    ┌─────────┐   ┌───────────┐   ┌──────────┐   ┌────────────────┐         │
│    │ Contact │   │Opportunite│   │  Ticket  │   │EvenementTimeline│        │
│    └─────────┘   └───────────┘   └──────────┘   └────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Entités détaillées

### User (Utilisateur)

Table: `users`

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Identifiant unique |
| `email` | String | UNIQUE | Email de connexion |
| `emailVerified` | DateTime? | - | Date vérification email |
| `motDePasse` | String? | - | Hash bcrypt |
| `nomAffiche` | String? | - | Nom affiché |
| `image` | String? | - | URL avatar |
| `role` | String | default("freelance_solo") | Rôle utilisateur |
| `fuseauHoraire` | String | default("Europe/Paris") | Timezone |
| `langueInterface` | String | default("fr") | Langue UI |
| `dateCreation` | DateTime | default(now()) | Date création |
| `dateMiseAJour` | DateTime | @updatedAt | Date MAJ |

**Rôles possibles:**
- `freelance_solo` - Freelance individuel
- `membre_agence` - Membre d'une agence
- `admin` - Administrateur

**Relations:**
- `accounts[]` → Account (NextAuth)
- `sessions[]` → Session (NextAuth)
- `clients[]` → Client (propriétaire)
- `opportunites[]` → Opportunite (propriétaire)
- `ticketsAssignes[]` → Ticket (assigné)

---

### Client

Table: `clients`

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Identifiant unique |
| `nom` | String | NOT NULL | Nom du client |
| `typeClient` | String | NOT NULL | Type de client |
| `emailPrincipal` | String? | - | Email principal |
| `telephonePrincipal` | String? | - | Téléphone principal |
| `statutClient` | String | default("prospect") | Statut |
| `noteInterne` | String? | - | Notes internes |
| `tokenPortail` | String? | UNIQUE | Token d'accès au portail client |
| `proprietaireId` | String | FK → User | Propriétaire |
| `dateCreation` | DateTime | default(now()) | Date création |
| `dateMiseAJour` | DateTime | @updatedAt | Date MAJ |

**Types de client:**
- `freelance` - Freelance
- `agence` - Agence
- `entreprise` - Entreprise
- `particulier` - Particulier

**Statuts:**
- `prospect` - Prospect
- `client` - Client actif

**Relations:**
- `proprietaire` → User
- `contacts[]` → Contact
- `opportunites[]` → Opportunite
- `tickets[]` → Ticket
- `evenements[]` → EvenementTimeline

---

### Contact

Table: `contacts`

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Identifiant unique |
| `clientId` | String | FK → Client | Client associé |
| `prenom` | String | NOT NULL | Prénom |
| `nom` | String | NOT NULL | Nom |
| `email` | String | NOT NULL | Email |
| `telephone` | String? | - | Téléphone |
| `role` | String? | - | Rôle/fonction |

**Relations:**
- `client` → Client (onDelete: Cascade)

---

### Opportunite

Table: `opportunites`

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Identifiant unique |
| `clientId` | String | FK → Client | Client associé |
| `titre` | String | NOT NULL | Titre de l'opportunité |
| `descriptionCourte` | String? | - | Description |
| `montantEstime` | Float? | - | Montant estimé |
| `devise` | String | default("EUR") | Devise |
| `probabilite` | Int? | 0-100 | Probabilité de gain |
| `dateCloturePrevue` | DateTime? | - | Date clôture prévue |
| `etapePipeline` | String | default("lead") | Étape pipeline |
| `raisonPerdu` | String? | - | Raison si perdu |
| `statutPaiement` | String | default("en_attente") | Statut paiement Stripe |
| `urlPaiement` | String? | - | URL Stripe Checkout |
| `stripeSessionId` | String? | - | ID session Stripe |
| `proprietaireId` | String | FK → User | Propriétaire |
| `dateCreation` | DateTime | default(now()) | Date création |
| `dateMiseAJour` | DateTime | @updatedAt | Date MAJ |

**Étapes du pipeline:**
- `lead` - Lead
- `qualifie` - Qualifié
- `proposition_envoyee` - Proposition envoyée
- `negociation` - Négociation
- `gagne` - Gagné ✓
- `perdu` - Perdu ✗

**Statuts de paiement:**
- `en_attente` - En attente de paiement
- `paye` - Payé

**Relations:**
- `client` → Client (onDelete: Cascade)
- `proprietaire` → User

---

### Ticket

Table: `tickets`

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Identifiant unique |
| `clientId` | String | FK → Client | Client associé |
| `sujet` | String | NOT NULL | Sujet du ticket |
| `description` | String | NOT NULL | Description |
| `typeTicket` | String | NOT NULL | Type de ticket |
| `priorite` | String | default("normale") | Priorité |
| `statutTicket` | String | default("nouveau") | Statut |
| `assigneId` | String? | FK → User | Utilisateur assigné |
| `dateCreation` | DateTime | default(now()) | Date création |
| `dateMiseAJour` | DateTime | @updatedAt | Date MAJ |
| `dateResolution` | DateTime? | - | Date résolution |

**Types de ticket:**
- `bug` - Bug
- `question` - Question
- `demande_evolution` - Demande d'évolution

**Priorités:**
- `basse` - Basse
- `normale` - Normale
- `haute` - Haute

**Statuts:**
- `nouveau` - Nouveau
- `en_cours` - En cours
- `resolu` - Résolu

**Relations:**
- `client` → Client (onDelete: Cascade)
- `assigne` → User (optionnel)

---

### EvenementTimeline

Table: `evenements_timeline`

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Identifiant unique |
| `clientId` | String | FK → Client | Client associé |
| `typeEvenement` | String | NOT NULL | Type d'événement |
| `referenceId` | String? | - | ID référence (opp/ticket) |
| `descriptionTexte` | String | NOT NULL | Description |
| `dateEvenement` | DateTime | default(now()) | Date événement |
| `auteurId` | String? | - | ID auteur |

**Types d'événement:**
- `opportunite_creee` - Opportunité créée
- `opportunite_etape_changee` - Étape changée
- `ticket_cree` - Ticket créé
- `ticket_statut_change` - Statut ticket changé
- `note_client` - Note ajoutée
- `email_client` - Email consigné (inbox)
- `paiement_recu` - Paiement Stripe reçu

**Relations:**
- `client` → Client (onDelete: Cascade)

---

## Modèles NextAuth

### Account

Table: `accounts`

Stocke les comptes OAuth liés (non utilisé actuellement, credentials only).

### Session

Table: `sessions`

Stocke les sessions utilisateur (JWT strategy, non utilisé en DB).

### VerificationToken

Table: `verification_tokens`

Tokens de vérification email (non utilisé actuellement).

---

## Index et contraintes

### Index uniques

| Table | Champs | Description |
|-------|--------|-------------|
| `users` | `email` | Email unique |
| `accounts` | `provider, providerAccountId` | Compte OAuth unique |
| `sessions` | `sessionToken` | Token session unique |
| `verification_tokens` | `identifier, token` | Token vérification unique |

### Clés étrangères avec cascade

| Table | Champ | Référence | On Delete |
|-------|-------|-----------|-----------|
| `clients` | `proprietaireId` | `users.id` | - |
| `contacts` | `clientId` | `clients.id` | CASCADE |
| `opportunites` | `clientId` | `clients.id` | CASCADE |
| `tickets` | `clientId` | `clients.id` | CASCADE |
| `evenements_timeline` | `clientId` | `clients.id` | CASCADE |

---

## Requêtes courantes

### Clients avec statistiques

```typescript
const clients = await prisma.client.findMany({
  where: { proprietaireId: userId },
  include: {
    _count: {
      select: {
        contacts: true,
        opportunites: true,
        tickets: true,
      },
    },
  },
});
```

### Opportunités par étape

```typescript
const opportunites = await prisma.opportunite.findMany({
  where: { proprietaireId: userId },
  include: { client: true },
  orderBy: { dateCreation: 'desc' },
});

// Grouper par étape
const parEtape = opportunites.reduce((acc, opp) => {
  acc[opp.etapePipeline] = acc[opp.etapePipeline] || [];
  acc[opp.etapePipeline].push(opp);
  return acc;
}, {});
```

### Dashboard stats

```typescript
const [clients, opportunites, tickets] = await Promise.all([
  prisma.client.count({ where: { proprietaireId: userId } }),
  prisma.opportunite.findMany({ where: { proprietaireId: userId } }),
  prisma.ticket.count({ where: { client: { proprietaireId: userId } } }),
]);

const caEstime = opportunites
  .filter(o => !['gagne', 'perdu'].includes(o.etapePipeline))
  .reduce((sum, o) => sum + (o.montantEstime || 0), 0);
```

---

## Migration

### Commandes Prisma

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer le schéma (dev)
npm run db:push

# Interface visuelle
npm run db:studio
```

### Fichier schema.prisma

Localisation: `prisma/schema.prisma`
