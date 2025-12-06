# Architecture de solution - Incrément "Paiements + Portail client + Inbox"

## 1. Vue d’ensemble

Cet incrément étend l’architecture monolithique Next.js existante avec trois capacités :

1. **Stripe** : génération et suivi de paiements depuis les opportunités.
2. **Portail client** : exposition sécurisée en lecture + création de tickets.
3. **Inbox email (MVP)** : centralisation des échanges sous forme d’événements timeline.

L’architecture reste **monolithique modulaire** : on ajoute des modules et routes à l’app Next.js sans créer de microservice séparé.

---

## 2. Diagramme haut niveau (nouveaux flux)

```
CLIENT FREELANCE (back-office)                    CLIENT FINAL (portail)
┌───────────────────────────────┐                 ┌───────────────────────────────┐
│  app/ (Next.js + React)       │                 │  Portail client (Next.js)     │
│  Opportunités, Tickets, etc.  │                 │  /portail/[token]             │
└──────────────┬────────────────┘                 └──────────────┬────────────────┘
               │ HTTP (fetch)                                     │ HTTP (fetch)
               ▼                                                   ▼
        ┌───────────────────────────────┐                   ┌───────────────────────┐
        │  API interne (app/api/*)     │                   │  API portail          │
        │  - /api/opportunites         │                   │  - /api/portail/[t]   │
        │  - /api/tickets              │                   │  - /api/portail/[t]/… │
        │  - /api/paiements/stripe/*   │                   └───────────┬───────────┘
        └──────────────┬────────────────┘                               │
                       │                                                │
                       ▼                                                │
        ┌───────────────────────────────┐                               │
        │  Intégration Stripe           │◀─────────────┐                │
        │  - Création session           │              │ Webhook HTTPS  │
        │  - Webhook                    │──────────────┘                │
        └──────────────┬────────────────┘                               │
                       │                                                │
                       ▼                                                ▼
                ┌───────────────────────────────────────────────┐
                │            Prisma / PostgreSQL                │
                │  - Opportunite (paiement*, urlPaiement*)     │
                │  - Client (tokenPortail*)                    │
                │  - Ticket                                    │
                │  - EvenementTimeline (type email_client)     │
                └───────────────────────────────────────────────┘
```

---

## 3. Modèle de données (extensions Prisma)

> NB : noms de champs indicatifs, à ajuster dans `prisma/schema.prisma`.

### 3.1. Opportunite

Ajouts :

```prisma
model Opportunite {
  id                String   @id @default(cuid())
  // ... existant

  // Paiement lié à l'opportunité (MVP simple, un seul paiement)
  statutPaiement    String   @default("en_attente") // en_attente, paye
  urlPaiement       String?  // URL Stripe Checkout / Payment Link
  stripeSessionId   String?  // Id session Stripe pour rapprochement webhook
}
```

### 3.2. Client

Ajouts :

```prisma
model Client {
  id            String   @id @default(cuid())
  // ... existant

  tokenPortail  String?  // Token d'accès au portail client
}
```

### 3.3. EvenementTimeline

Réutilisation du modèle existant avec un nouveau type d’événement :

```prisma
model EvenementTimeline {
  id               String   @id @default(cuid())
  clientId         String
  client           Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)

  typeEvenement    String   // + "email_client" pour l'inbox MVP
  referenceId      String?  // id d'opportunité / ticket si applicable
  descriptionTexte String

  dateEvenement    DateTime @default(now())
  auteurId         String?  // id utilisateur interne optionnel
}
```

---

## 4. Intégration Stripe

### 4.1. Configuration

- Variables d’environnement (dans `.env`) :
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Nouveau module `lib/integrations/stripe.ts` (ou similaire) pour encapsuler :
  - création de session de paiement,
  - vérification des webhooks,
  - mapping entre Stripe et Opportunite.

### 4.2. Routes API

#### 4.2.1. Création de session Stripe

- **Route** : `POST /api/paiements/stripe/session`
- **Auth** : utilisateur connecté (NextAuth) + propriétaire de l’opportunité.
- **Entrée** : `{ opportuniteId }`.
- **Étapes** :
  1. Vérifier la session utilisateur.
  2. Récupérer l’opportunité (et le client) via Prisma.
  3. Vérifier que l’opportunité est `gagne` (étape pipeline) et qu’un montant existe.
  4. Créer une **Checkout Session** Stripe (ou Payment Link) :
     - `amount = montantEstime * 100`
     - `currency = devise`
     - `metadata = { opportuniteId, clientId }`.
  5. Stocker `stripeSessionId` et `urlPaiement` sur l’opportunité.
  6. Retourner `{ urlPaiement, statutPaiementInitial: 'en_attente' }`.

#### 4.2.2. Webhook Stripe

- **Route** : `POST /api/webhooks/stripe`
- **Auth** : aucune (Stripe), mais **signature obligatoire**.
- **Étapes** :
  1. Lire le `raw body` (Next.js nécessite un handler spécifique pour conserver le corps brut).
  2. Vérifier la signature avec `STRIPE_WEBHOOK_SECRET`.
  3. Gérer au minimum l’événement `checkout.session.completed` :
     - Récupérer `stripeSessionId` ou `metadata.opportuniteId`.
     - Mettre à jour l’opportunité : `statutPaiement = 'paye'`.
  4. Optionnel : créer un `EvenementTimeline` type `paiement_recu` rattaché au client.

### 4.3. UI et flux côté back-office

- Dans la page Opportunités :
  - Lorsque `etapePipeline === 'gagne'` et qu’il y a un montant : afficher un bouton **« Générer lien de paiement »**.
  - Afficher l’état de paiement dans les colonnes (ex : badge `Payé` / `En attente`).
- Comportement :
  - Clic sur le bouton → appel `POST /api/paiements/stripe/session` → ouvert dans un nouvel onglet ou copier/coller du lien.
  - Utiliser les **toasts** existants pour feedback (succès/erreur).

---

## 5. Portail client

### 5.1. Génération du token portail

- Nouveau champ `Client.tokenPortail`.
- Helper côté serveur :
  - générer un token **long, aléatoire**, ex. `crypto.randomBytes(32).toString('hex')`.
  - stocker sur le client.
- UI back-office :
  - Sur la fiche client, bouton **« Générer lien portail »** affichant l’URL :
    - `/portail/${tokenPortail}`.

### 5.2. Routes Next.js

- **Page** : `app/portail/[token]/page.tsx` (Server Component + hydration client si besoin).
- **API** :
  - `GET /api/portail/[token]` :
    - Récupère le client par `tokenPortail`.
    - Retourne :
      - infos client minimales (nom, type),
      - opportunités gagnées avec paiement en attente ou payé (montant, statut, urlPaiement),
      - derniers tickets.
  - `POST /api/portail/[token]/tickets` :
    - Récupère le client par `tokenPortail`.
    - Crée un ticket avec `typeTicket = 'question'` par défaut, `statutTicket = 'nouveau'`.

### 5.3. Comportement et sécurité

- Le token :
  - ne doit **pas** être dérivable depuis l’ID client,
  - peut être régénéré, ce qui invalide l’ancien lien.
- Le portail n’affiche :
  - **que les données essentielles** (aucune info interne, pas d’autres clients).
- Aucun cookie de session NextAuth n’est utilisé côté portail (anonyme basé sur token).

### 5.4. UI Portail (MVP)

- Layout très simple :
  - Header avec nom du freelance / logo.
  - Section « Projets / Prestations » listant les opportunités payables :
    - titre, montant, statut paiement, bouton « Payer ».
  - Section « Support » avec formulaire *Créer un ticket*.

---

## 6. Inbox email (MVP)

### 6.1. Approche MVP

Plutôt que connecter immédiatement Gmail/Outlook, le MVP :

- ajoute une **section « Emails / échanges »** sur la fiche client,
- permet au freelance de **coller / résumer** les échanges email importants,
- enregistre ces entrées dans `EvenementTimeline` avec `typeEvenement = 'email_client'`.

### 6.2. Flux

- Côté UI (fiche client) :
  - Zone de formulaire :
    - expéditeur
    - sujet
    - corps du message (ou résumé)
  - Bouton « Ajouter dans l’historique ».
- Côté API :
  - `POST /api/clients/[id]/emails` (ou similaire) :
    - vérifie l’auth.
    - crée un `EvenementTimeline` avec un `descriptionTexte` structuré (ex. JSON sérialisé ou texte formaté).
- Côté affichage :
  - La timeline existante est étendue pour afficher les événements `email_client` avec un style différencié (icône d’enveloppe, par ex.).

### 6.3. Préparation intégration future

- Garder `descriptionTexte` assez générique pour pouvoir, plus tard, y stocker un ID de message IMAP/API.
- Option : ajouter un champ `metaJson` (String @db.Text) si besoin d’une structure plus riche.

---

## 7. Sécurité & contraintes

- **Stripe** :
  - toutes les clés et secrets en variables d’environnement.
  - webhooks vérifiés avec la signature.
- **Portail client** :
  - tokens suffisamment longs (> 64 caractères hexa),
  - aucune donnée sensible (notes internes, email privé du freelance) n’apparaît sur le portail.
- **Inbox** :
  - seules les personnes authentifiées peuvent écrire/voir les emails dans le back-office.

---

## 8. Points d’extension

- Ajout d’un module `lib/integrations/` pour centraliser :
  - Stripe aujourd’hui,
  - email providers, facturation, etc. demain.
- Possibilité future de séparer les routes « publiques » (portail, webhooks) dans un sous-arbre dédié (`app/(public)/...`) si besoin.

---

## 9. Résumé pour la mise en œuvre

1. **Prisma** :
   - étendre `Opportunite` (statutPaiement, urlPaiement, stripeSessionId),
   - étendre `Client` (tokenPortail),
   - valider l’utilisation d’`EvenementTimeline` pour `email_client`.

2. **API** :
   - créer `/api/paiements/stripe/session` et `/api/webhooks/stripe`,
   - créer `/api/portail/[token]` et `/api/portail/[token]/tickets`,
   - ajouter une route pour `emails` côté client si nécessaire.

3. **UI** :
   - bouton « Générer lien de paiement » et affichage statut paiement dans opportunités,
   - page `app/portail/[token]/page.tsx` simple et responsive,
   - section « Emails / échanges » sur la fiche client avec formulaire + timeline.

Cette architecture reste alignée avec l’existant et prépare proprement les futures évolutions (mode agence, email réel, facturation avancée).
