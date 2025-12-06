# CRM Freelance - Product Requirements Document

**Auteur :** Jean-Claude  
**Date :** 2025-12-05  
**Version :** 1.0

---

## Executive Summary

Le **CRM Freelance** est déjà un outil complet de gestion des clients, opportunités et tickets, pensé pour un freelance ou une petite agence. Ce PRD décrit un **incrément majeur** centré sur trois axes :

1. **Intégration Stripe pour les paiements**  
2. **Portail client simplifié** (consultation + paiements + tickets)  
3. **Inbox email intégrée** (centralisation des échanges dans le CRM)

L’objectif est de transformer le CRM d’un simple outil interne en une **plateforme relationnelle complète** couvrant la chaîne : prospection → vente → exécution → facturation → support.

### What Makes This Special

- **Orienté freelances / micro-agences** plutôt que gros CRM généralistes.
- **Chaîne complète** : de l’opportunité au paiement, avec un portail client.
- **Expérience unifiée** : emails, paiements, documents et tickets sont reliés au client et à l’opportunité.

---

## Project Classification

**Technical Type:** Web app (Next.js, PostgreSQL, Stripe, email integration)  
**Domain:** CRM / Billing / Customer Portal  
**Complexity:** Moyenne → Élevée (intégrations externes + portail public)

Le projet est un **brownfield** : base existante stable (auth, CRUD, kanban, dashboard), sur laquelle on ajoute des capacités de paiement, d’exposition client et d’intégration email.

---

## Success Criteria

- **Adoption**
  - ≥ 70 % des opportunités marquées comme « gagnées » génèrent un **lien de paiement Stripe** depuis le CRM.
  - ≥ 50 % des clients actifs utilisent au moins une fois le **portail client** (consultation, paiement, ticket).

- **Efficacité**
  - Diminuer d’au moins **50 %** le temps nécessaire pour **encaisser un paiement** après la signature.
  - Diminuer d’au moins **30 %** le temps passé à chercher l’historique des échanges (grâce à l’inbox intégrée).

- **Qualité de service**
  - Réduction des **impayés / retards** : voir une baisse des factures en retard grâce aux relances et aux liens de paiement intégrés.
  - Retour utilisateur positif sur la **simplicité pour le client final** (feedback qualitatif).

### Business Metrics

- **Taux de conversion opportunité → paiement** (avant / après).
- **Délai moyen entre « gagné » et paiement reçu**.
- **Nombre de paiements traités via Stripe**.
- **Utilisation du portail client** (visites, actions, tickets créés).

---

## Product Scope

### MVP - Minimum Viable Product

**Objectif MVP :** Couvrir un premier flux bout-en-bout pour un freelance solo.

- **Stripe (MVP)**
  - Lier le CRM à un compte Stripe via clés API.
  - Depuis une opportunité marquée « gagnée », générer un **lien de paiement** (Stripe Payment Link ou Checkout Session) avec :
    - Montant = `montantEstime`
    - Devise = `EUR`
    - Référence = ID opportunité + client
  - Stocker l’URL de paiement et le statut (en attente / payé).
  - Mettre à jour automatiquement le statut de paiement lorsque Stripe notifie (webhook simple).

- **Portail client (MVP)**
  - URL unique par client (ex : `/portail/[token]`) basée sur un **token sécurisé** non authentifié.
  - Page affichant :
    - Nom du client.
    - Liste des opportunités gagnées **avec paiement en attente ou payé**.
    - Bouton « Payer » renvoyant vers le lien Stripe.
  - Bloc « Créer un ticket » minimal (sujet + description) qui crée un ticket rattaché au client.

- **Inbox email (MVP)**
  - Adresse technique (ex : `inbox+{idClient}@domaine`) **simulée dans un premier temps** par un champ texte « ajouter un email / note externe » sur la fiche client.
  - Tous les « emails » saisis dans cette zone sont stockés comme **événements timeline** typés `email_client`.
  - Préparer le modèle de données et les écrans pour accueillir ensuite une vraie intégration IMAP/API.

### Growth Features (Post-MVP)

- Portail client
  - Authentification client (email + code magique) au lieu de token anonyme.
  - Historique complet des tickets et opportunités.
  - Espace documents (devis, factures, contrats).

- Stripe
  - Paiements récurrents (abonnements, maintenance).
  - Paiements multi-devises.

- Inbox email
  - Intégration réelle avec Gmail / Outlook (IMAP ou API provider).
  - Règles automatiques : email → ticket ou opportunité selon sujet.

### Vision (Future)

- **Système complet de facturation** (génération de facture PDF, numérotation légale, TVA, etc.).
- **Automatisation intelligente** : suggestions de relance, détection de churn, scoring opportunités.
- **Mode agence** avancé : multi-utilisateurs, portails multi-clients, rapports consolidés.

---

## Innovation & Novel Patterns

- **Chaîne complète intégrée** de la vente au paiement dans un outil léger pour freelances.
- **Portail client transparent** qui donne de la visibilité sans surcharger le freelance.
- **Inbox unifiée** qui connecte les échanges écrits au modèle CRM existant (clients, opportunités, tickets).

Validation progressive par **incréments** : MVP Stripe + mini-portail → extension portail → intégrations email complètes.

---

## Web App Specific Requirements

### API Specification (haut niveau)

Nouvelles routes (schéma indicatif) :

- `POST /api/paiements/stripe/session`
  - Entrée : `{ opportuniteId }`
  - Sortie : `{ urlPaiement, statutPaiementInitial }`

- `POST /api/webhooks/stripe`
  - Entrée : payload Stripe (`checkout.session.completed`, etc.)
  - Logique : retrouver l’opportunité liée, marquer le paiement comme `payé`.

- `GET /api/portail/[token]`
  - Entrée : token client.
  - Sortie : données exposées au portail (client, opportunités payables, tickets récents).

- `POST /api/portail/[token]/tickets`
  - Entrée : `{ sujet, description }`.
  - Sortie : ticket créé rattaché au client.

### Authentication & Authorization

- Back-office CRM : inchangé (NextAuth + sessions JWT).
- Portail client (MVP) : **accès par token** non authentifié mais :
  - Token long, aléatoire, stocké côté client.
  - Possibilité de régénérer le token (l’ancien devient invalide).
- Webhooks Stripe :
  - Vérification de la signature Stripe (`STRIPE_WEBHOOK_SECRET`).

### Platform Support

- Web desktop et mobile via Next.js (responsive).  
- PWA envisagée mais hors scope MVP Stripe/portail/inbox.

---

## User Experience Principles

- **Simplicité pour le freelance** :
  - Un bouton « Générer lien de paiement » directement depuis l’opportunité.
  - Un indicateur clair « Payé / En attente » sans avoir à ouvrir Stripe.

- **Fluidité pour le client** :
  - Sur le portail : le client comprend immédiatement quoi payer et comment signaler un problème.
  - Aucun jargon technique, texte clair en français.

- **Cohérence UI** :
  - Réutilisation des composants existants (modales, toasts, typographie, couleurs).
  - Feedback visuel systématique (toasts succès/erreur, états de chargement).

### Key Interactions

1. Freelance marque une opportunité comme « gagnée » → bouton « Créer lien de paiement » apparaît.
2. Freelance envoie ce lien au client (email automatique ou copié-collé).
3. Le client ouvre le lien Stripe, paie → Stripe envoie un webhook → le CRM met à jour le statut.
4. Le client accède au portail via un lien sécurisé → voit les paiements à effectuer et peut ouvrir un ticket.

---

## Functional Requirements

### 1. Intégration Stripe

- **FR-STRIPE-1** : En tant que freelance, je peux **configurer les clés Stripe** (test/production) dans un écran de paramètres.
- **FR-STRIPE-2** : En tant que freelance, depuis une opportunité « gagnée », je peux cliquer sur **« Générer lien de paiement »**.
- **FR-STRIPE-3** : Le système crée une **session Stripe** (Payment Link / Checkout) avec montant et devise.
- **FR-STRIPE-4** : Le CRM **stocke l’URL de paiement** et l’associe à l’opportunité.
- **FR-STRIPE-5** : Lorsqu’un paiement est complété, Stripe appelle un **webhook** qui met à jour le statut de l’opportunité ou du paiement.
- **FR-STRIPE-6** : Le freelance voit dans la liste des opportunités si le **paiement est en attente ou payé**.

### 2. Portail Client (MVP)

- **FR-PORTAIL-1** : En tant que freelance, je peux **générer ou régénérer un token portail** pour un client.
- **FR-PORTAIL-2** : En tant que client, via l’URL portail, je vois :
  - mon nom / l’entreprise,
  - la liste des opportunités gagnées avec montant + statut de paiement.
- **FR-PORTAIL-3** : En tant que client, je peux cliquer sur un **bouton de paiement** qui m’emmène vers Stripe.
- **FR-PORTAIL-4** : En tant que client, je peux **créer un ticket** depuis le portail (sujet + description).
- **FR-PORTAIL-5** : Le ticket créé via le portail est **rattaché au bon client** et apparaît dans la liste interne des tickets.

### 3. Inbox Email (MVP fonctionnelle côté CRM)

- **FR-INBOX-1** : En tant que freelance, sur la fiche client, je vois une **section « Emails / échanges »**.
- **FR-INBOX-2** : Je peux **ajouter manuellement** un email reçu/envoyé (expéditeur, sujet, texte) qui sera stocké comme événement timeline.
- **FR-INBOX-3** : Chaque entrée est labellisée `email_client` et affiche la date, l’auteur et le sens (entrant / sortant).
- **FR-INBOX-4** : La timeline d’un client affiche **mélangés** : opportunités, tickets, événements, emails.
- **FR-INBOX-5** (préparation intégration réelle) : Le modèle de données et l’UI permettent d’étendre plus tard vers une vraie intégration IMAP/API sans casser la structure.

---

## Non-Functional Requirements

### Performance

- Charge modérée : requêtes Stripe et portail ne doivent pas dégrader le temps de réponse moyen du CRM.
- Webhook Stripe traité en **moins de quelques secondes** pour que l’état soit rapidement reflété.

### Security

- Les clés Stripe sont stockées de manière sécurisée (variables d’environnement, jamais en clair côté client).
- Les webhooks Stripe sont **signés** et validés côté serveur.
- Le token portail client est **long, aléatoire, opaque** et régénérable.
- Les données visibles sur le portail sont **strictement limitées** au nécessaire (aucune information interne sensible).

### Scalability

- L’architecture doit permettre, à terme, de gérer **plusieurs utilisateurs (mode agence)** sans refonte majeure.
- Les webhooks doivent supporter plusieurs comptes Stripe (un par utilisateur) dans une version future.

### Accessibility

- Portail client utilisable au clavier, contrastes lisibles, textes en français clair.

### Integration

- Utilisation de l’API Stripe officielle.
- Préparation (côté code) à des intégrations futures (Gmail/Outlook, outils de facturation) via une couche `lib/integrations/*`.

---

_Ce PRD capture l’essentiel de l’incrément « Paiements + Portail client + Inbox » pour CRM Freelance. Il servira de base à l’architecture et à la découpe en epics & stories._
