# API Reference - CRM Freelance

## Vue d'ensemble

L'API REST est implémentée via les **Next.js Route Handlers** (App Router).

**Base URL:** `/api`
**Authentification:** Session JWT (NextAuth)
**Format:** JSON

---

## Authentification

Toutes les routes (sauf `/api/auth/*`) nécessitent une session valide.

### Headers requis

```
Cookie: next-auth.session-token=<token>
Content-Type: application/json
```

### Réponse non autorisé

```json
{
  "error": "Non autorisé"
}
```
**Status:** 401

---

## Clients

### GET /api/clients

Liste les clients de l'utilisateur connecté.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `recherche` | string | Recherche par nom |
| `statutClient` | string | Filtre par statut (prospect, client) |
| `typeClient` | string | Filtre par type |

**Response 200:**

```json
[
  {
    "id": "clx123...",
    "nom": "Acme Corp",
    "typeClient": "entreprise",
    "emailPrincipal": "contact@acme.com",
    "telephonePrincipal": "+33 1 23 45 67 89",
    "statutClient": "client",
    "noteInterne": "Client premium",
    "proprietaireId": "clx456...",
    "dateCreation": "2024-01-15T10:30:00.000Z",
    "dateMiseAJour": "2024-03-20T14:45:00.000Z",
    "_count": {
      "contacts": 3,
      "opportunites": 2,
      "tickets": 5
    }
  }
]
```

---

### POST /api/clients

Crée un nouveau client.

**Request Body:**

```json
{
  "nom": "Nouveau Client",
  "typeClient": "entreprise",
  "emailPrincipal": "contact@nouveau.com",
  "telephonePrincipal": "+33 1 00 00 00 00",
  "statutClient": "prospect",
  "noteInterne": "Notes optionnelles"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `nom` | string | ✓ | Nom du client |
| `typeClient` | enum | ✓ | freelance, agence, entreprise, particulier |
| `emailPrincipal` | string | - | Email principal |
| `telephonePrincipal` | string | - | Téléphone |
| `statutClient` | enum | - | prospect (défaut), client |
| `noteInterne` | string | - | Notes internes |

**Response 201:**

```json
{
  "id": "clx789...",
  "nom": "Nouveau Client",
  ...
}
```

---

### GET /api/clients/[id]

Récupère un client avec ses relations.

**Response 200:**

```json
{
  "id": "clx123...",
  "nom": "Acme Corp",
  "typeClient": "entreprise",
  "emailPrincipal": "contact@acme.com",
  "statutClient": "client",
  "contacts": [
    {
      "id": "clx...",
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean@acme.com",
      "telephone": "+33 6 00 00 00 00",
      "role": "Directeur"
    }
  ],
  "opportunites": [...],
  "tickets": [...],
  "evenements": [...]
}
```

---

### PUT /api/clients/[id]

Met à jour un client.

**Request Body:** (champs à modifier)

```json
{
  "nom": "Acme Corporation",
  "statutClient": "client"
}
```

**Response 200:** Client mis à jour

---

### DELETE /api/clients/[id]

Supprime un client et ses données associées (cascade).

**Response 200:**

```json
{
  "message": "Client supprimé"
}
```

---

## Contacts

### GET /api/contacts

Liste les contacts (filtrable par clientId).

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `clientId` | string | Filtre par client |

**Response 200:**

```json
[
  {
    "id": "clx...",
    "clientId": "clx123...",
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean@acme.com",
    "telephone": "+33 6 00 00 00 00",
    "role": "Directeur"
  }
]
```

---

### POST /api/contacts

Crée un nouveau contact.

**Request Body:**

```json
{
  "clientId": "clx123...",
  "prenom": "Marie",
  "nom": "Martin",
  "email": "marie@acme.com",
  "telephone": "+33 6 11 22 33 44",
  "role": "Responsable projet"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `clientId` | string | ✓ | ID du client |
| `prenom` | string | ✓ | Prénom |
| `nom` | string | ✓ | Nom |
| `email` | string | ✓ | Email |
| `telephone` | string | - | Téléphone |
| `role` | string | - | Rôle/fonction |

**Response 201:** Contact créé

---

### PUT /api/contacts/[id]

Met à jour un contact.

---

### DELETE /api/contacts/[id]

Supprime un contact.

---

## Opportunités

### GET /api/opportunites

Liste les opportunités de l'utilisateur.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `clientId` | string | Filtre par client |
| `etapePipeline` | string | Filtre par étape |
| `montantMin` | number | Montant minimum |
| `montantMax` | number | Montant maximum |
| `dateDebut` | string | Date création min (ISO) |
| `dateFin` | string | Date création max (ISO) |

**Response 200:**

```json
[
  {
    "id": "clx...",
    "clientId": "clx123...",
    "titre": "Refonte site web",
    "descriptionCourte": "Refonte complète du site corporate",
    "montantEstime": 15000,
    "devise": "EUR",
    "probabilite": 70,
    "dateCloturePrevue": "2024-06-30T00:00:00.000Z",
    "etapePipeline": "proposition_envoyee",
    "proprietaireId": "clx456...",
    "dateCreation": "2024-03-01T09:00:00.000Z",
    "client": {
      "id": "clx123...",
      "nom": "Acme Corp"
    }
  }
]
```

---

### POST /api/opportunites

Crée une nouvelle opportunité.

**Request Body:**

```json
{
  "clientId": "clx123...",
  "titre": "Nouvelle opportunité",
  "descriptionCourte": "Description",
  "montantEstime": 10000,
  "probabilite": 50,
  "dateCloturePrevue": "2024-12-31",
  "etapePipeline": "lead"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `clientId` | string | ✓ | ID du client |
| `titre` | string | ✓ | Titre |
| `descriptionCourte` | string | - | Description |
| `montantEstime` | number | - | Montant en EUR |
| `probabilite` | number | - | 0-100 |
| `dateCloturePrevue` | string | - | Date ISO |
| `etapePipeline` | enum | - | lead (défaut) |

**Response 201:** Opportunité créée

---

### PUT /api/opportunites/[id]

Met à jour une opportunité.

**Cas d'usage:** Drag & drop Kanban (changement d'étape)

```json
{
  "etapePipeline": "negociation"
}
```

---

### DELETE /api/opportunites/[id]

Supprime une opportunité.

---

## Tickets

### GET /api/tickets

Liste les tickets.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `clientId` | string | Filtre par client |
| `statutTicket` | string | nouveau, en_cours, resolu |
| `priorite` | string | basse, normale, haute |
| `typeTicket` | string | bug, question, demande_evolution |

**Response 200:**

```json
[
  {
    "id": "clx...",
    "clientId": "clx123...",
    "sujet": "Bug connexion",
    "description": "Impossible de se connecter...",
    "typeTicket": "bug",
    "priorite": "haute",
    "statutTicket": "en_cours",
    "assigneId": "clx456...",
    "dateCreation": "2024-03-15T11:00:00.000Z",
    "client": {
      "id": "clx123...",
      "nom": "Acme Corp"
    }
  }
]
```

---

### POST /api/tickets

Crée un nouveau ticket.

**Request Body:**

```json
{
  "clientId": "clx123...",
  "sujet": "Nouveau ticket",
  "description": "Description détaillée du problème",
  "typeTicket": "bug",
  "priorite": "normale"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `clientId` | string | ✓ | ID du client |
| `sujet` | string | ✓ | Sujet |
| `description` | string | ✓ | Description |
| `typeTicket` | enum | ✓ | bug, question, demande_evolution |
| `priorite` | enum | - | normale (défaut) |

**Response 201:** Ticket créé

---

### GET /api/tickets/[id]

Récupère un ticket avec son client.

---

### PUT /api/tickets/[id]

Met à jour un ticket.

```json
{
  "statutTicket": "resolu",
  "dateResolution": "2024-03-20T15:00:00.000Z"
}
```

---

### DELETE /api/tickets/[id]

Supprime un ticket.

---

## Dashboard

### GET /api/dashboard

Récupère les statistiques du dashboard.

**Response 200:**

```json
{
  "totalClients": 25,
  "totalOpportunites": 12,
  "totalTickets": 45,
  "ticketsOuverts": 8,
  "caEstime": 150000,
  "caPondere": 95000,
  "caGagne": 75000,
  "pipeline": {
    "lead": { "count": 3, "montant": 30000 },
    "qualifie": { "count": 2, "montant": 25000 },
    "proposition_envoyee": { "count": 4, "montant": 60000 },
    "negociation": { "count": 2, "montant": 35000 },
    "gagne": { "count": 5, "montant": 75000 },
    "perdu": { "count": 1, "montant": 10000 }
  },
  "dernieresOpportunites": [...],
  "derniersTickets": [...],
  "derniersClients": [...]
}
```

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Requête invalide (validation) |
| 401 | Non autorisé |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

### Format erreur

```json
{
  "error": "Message d'erreur",
  "details": [...] // Optionnel, erreurs de validation Zod
}
```

---

## Validation (Zod)

Les schémas de validation sont définis dans `lib/validateurs.ts`.

### Exemple: schemaClient

```typescript
export const schemaClient = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  typeClient: z.enum(['freelance', 'agence', 'entreprise', 'particulier']),
  emailPrincipal: z.string().email('Email invalide').optional().or(z.literal('')),
  telephonePrincipal: z.string().optional(),
  statutClient: z.enum(['prospect', 'client']).optional(),
  noteInterne: z.string().optional(),
});
```
