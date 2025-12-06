# CRM Freelance – Epics & User Stories

Incrément : **Paiements + Portail client + Inbox**  
Référence : `docs/prd.md`, `docs/solution-architecture.md`

---

## Epic 1 – Intégration Stripe (paiement des opportunités)

### Objectif
Permettre au freelance de générer un lien de paiement Stripe depuis une opportunité gagnée et de suivre le statut du paiement dans le CRM.

### US-STRIPE-1 – Configuration Stripe
**En tant que** freelance  
**Je veux** renseigner mes clés Stripe (test / production)  
**Afin de** connecter mon CRM à mon compte de paiement.

**Critères d’acceptation**
- Un écran de paramètres permet de saisir `STRIPE_SECRET_KEY` et éventuellement un mode test/production.
- Les clés ne sont jamais exposées côté client.
- Un message d’erreur clair apparaît si la clé est invalide (test basique de connexion ou simple validation de format).

---

### US-STRIPE-2 – Générer un lien de paiement depuis une opportunité gagnée
**En tant que** freelance  
**Je veux** cliquer sur un bouton "Générer lien de paiement" sur une opportunité gagnée  
**Afin de** envoyer facilement un lien de paiement au client.

**Critères d’acceptation**
- Le bouton est visible uniquement si :
  - l’opportunité est à l’étape `gagne`,
  - `montantEstime` est renseigné.
- Le clic appelle l’API `/api/paiements/stripe/session` avec `opportuniteId`.
- En cas de succès, l’URL Stripe est stockée sur l’opportunité et un toast de succès s’affiche.
- En cas d’erreur (configuration manquante, API Stripe KO), un toast d’erreur s’affiche.

---

### US-STRIPE-3 – Stocker et afficher le statut de paiement
**En tant que** freelance  
**Je veux** voir pour chaque opportunité si le paiement est en attente ou payé  
**Afin de** suivre rapidement l’encaissement.

**Critères d’acceptation**
- Le modèle `Opportunite` contient `statutPaiement` (`en_attente` / `paye`) et `urlPaiement`.
- La liste des opportunités affiche un badge `Payé` / `En attente`.
- Sur la fiche d’une opportunité, l’URL de paiement est visible et copiée facilement.

---

### US-STRIPE-4 – Traiter les webhooks Stripe
**En tant que** système  
**Je veux** mettre à jour automatiquement le statut de paiement lors de la confirmation Stripe  
**Afin de** ne pas avoir à le faire manuellement.

**Critères d’acceptation**
- Une route `POST /api/webhooks/stripe` reçoit les évènements Stripe.
- La signature est vérifiée avec `STRIPE_WEBHOOK_SECRET`.
- Sur `checkout.session.completed`, l’opportunité correspondante est retrouvée (via `stripeSessionId` ou metadata) et `statutPaiement` passe à `paye`.
- Un événement timeline peut être ajouté (`paiement_recu`).

---

### US-STRIPE-5 – Feedback utilisateur
**En tant que** freelance  
**Je veux** avoir des feedbacks clairs sur la génération du lien et la réception du paiement  
**Afin de** comprendre ce qui se passe sans aller dans Stripe.

**Critères d’acceptation**
- Toast succès / erreur sur la génération du lien.
- Quand un paiement est marqué `paye`, l’interface reflète l’état sans rechargement complet (refetch opportunités).

---

## Epic 2 – Portail client (MVP)

### Objectif
Offrir au client final un portail minimal pour consulter ses prestations payables et créer des tickets, sans compte utilisateur complexe.

### US-PORTAIL-1 – Générer un lien portail pour un client
**En tant que** freelance  
**Je veux** générer un lien d’accès au portail pour un client  
**Afin de** lui donner un point d’entrée unique.

**Critères d’acceptation**
- Sur la fiche client, un bouton "Générer lien portail" permet :
  - de créer ou régénérer `tokenPortail` (chaîne longue et aléatoire),
  - d’afficher l’URL complète (copiable) : `/portail/[token]`.
- Régénérer le token invalide l’ancien lien.

---

### US-PORTAIL-2 – Consulter le portail avec un token
**En tant que** client  
**Je veux** ouvrir le portail via un lien sécurisé  
**Afin de** voir mes prestations et paiements.

**Critères d’acceptation**
- La page `app/portail/[token]` charge les données via `GET /api/portail/[token]`.
- Si le token est invalide ou expiré : message d’erreur et aucune donnée affichée.
- Les données visibles sont limitées : nom du client, liste d’opportunités gagnées (montant, statutPaiement, éventuellement description courte), quelques infos de contact.

---

### US-PORTAIL-3 – Payer via le portail
**En tant que** client  
**Je veux** voir quels paiements sont en attente et accéder rapidement au lien de paiement  
**Afin de** régler ma prestation sans friction.

**Critères d’acceptation**
- Les opportunités avec `statutPaiement = 'en_attente'` sont clairement identifiées.
- Un bouton "Payer" renvoie vers `urlPaiement` (Stripe Checkout / Payment Link).
- Après paiement, un rafraîchissement du portail affiche le statut `Payé` (une fois le webhook traité).

---

### US-PORTAIL-4 – Créer un ticket depuis le portail
**En tant que** client  
**Je veux** pouvoir créer un ticket de support depuis le portail  
**Afin de** signaler un problème ou une demande d’évolution.

**Critères d’acceptation**
- Un formulaire minimal (sujet + description) est présent sur le portail.
- L’appel `POST /api/portail/[token]/tickets` :
  - vérifie le token,
  - crée un ticket rattaché au client,
  - retourne un message de confirmation.
- Le ticket est visible dans la liste interne des tickets du back-office.

---

### US-PORTAIL-5 – Aspect responsive et simple
**En tant que** client  
**Je veux** un portail simple, lisible sur mobile  
**Afin de** pouvoir payer et créer un ticket depuis n’importe quel appareil.

**Critères d’acceptation**
- Layout propre sur mobile (pile verticale, boutons suffisamment larges).
- Textes en français clair, sans jargon technique.

---

## Epic 3 – Inbox email (MVP back-office)

### Objectif
Centraliser les échanges email sous forme d’entrées dans la timeline client, sans encore intégrer un fournisseur email externe.

### US-INBOX-1 – Voir une section « Emails / échanges » sur la fiche client
**En tant que** freelance  
**Je veux** voir une section dédiée aux emails et échanges  
**Afin de** regrouper les conversations importantes.

**Critères d’acceptation**
- La fiche client affiche un bloc "Emails / échanges".
- Ce bloc contient :
  - la liste des événements `email_client` (avec date, auteur, sens entrant/sortant),
  - un formulaire pour ajouter un nouvel échange.

---

### US-INBOX-2 – Ajouter manuellement un email dans l’historique
**En tant que** freelance  
**Je veux** saisir manuellement un échange email important  
**Afin de** garder une trace dans le CRM.

**Critères d’acceptation**
- Le formulaire comprend au minimum :
  - expéditeur / destinataire (texte libre),
  - sujet,
  - contenu ou résumé.
- Soumettre le formulaire crée un `EvenementTimeline` avec `typeEvenement = 'email_client'` et un `descriptionTexte` formaté.
- L’événement apparaît immédiatement dans la timeline du client.

---

### US-INBOX-3 – Afficher les emails dans la timeline globale
**En tant que** freelance  
**Je veux** voir les emails aux côtés des opportunités, tickets et autres événements  
**Afin de** avoir une vision 360° de la relation client.

**Critères d’acceptation**
- La timeline du client contient les `email_client` intercalés chronologiquement avec les autres événements.
- Un pictogramme ou style distinct permet d’identifier visuellement les emails.

---

### US-INBOX-4 – Préparer l’intégration email future
**En tant que** développeur  
**Je veux** structurer les données d’email dès maintenant  
**Afin de** pouvoir brancher plus tard une vraie intégration (IMAP/API) sans tout casser.

**Critères d’acceptation**
- Le schéma stocke les infos email dans un format extensible (texte structuré ou champ JSON sérialisé si nécessaire).
- La couche UI et API n’encode pas d’hypothèse forte sur la provenance des emails (manuel aujourd’hui, externe demain).

---

## Epic 4 – Transversal & Technique

### US-TECH-1 – Migrations Prisma
**En tant que** développeur  
**Je veux** étendre le schéma Prisma pour les champs de paiement, portail et inbox  
**Afin de** supporter les nouvelles fonctionnalités.

**Critères d’acceptation**
- `Opportunite` : champs `statutPaiement`, `urlPaiement`, `stripeSessionId` ajoutés.
- `Client` : champ `tokenPortail` ajouté.
- `EvenementTimeline` : usage confirmé pour `email_client` (et éventuellement `paiement_recu`).
- Les migrations se lancent avec `npm run db:push` en local.

---

### US-TECH-2 – Intégration Stripe encapsulée
**En tant que** développeur  
**Je veux** encapsuler la logique Stripe dans un module dédié  
**Afin de** éviter la duplication et faciliter les évolutions.

**Critères d’acceptation**
- Un module `lib/integrations/stripe.ts` (ou équivalent) expose des fonctions claires :
  - `creerSessionPaiement(opportunite)`
  - `verifierWebhookSignature(request)`
  - `traiterEvenementStripe(event)`
- Les routes API Stripe utilisent ce module au lieu de parler directement à l’API.

---

### US-TECH-3 – Sécurité & tests de base
**En tant que** développeur  
**Je veux** garantir une configuration sécurisée minimale  
**Afin de** ne pas exposer de données sensibles.

**Critères d’acceptation**
- Les variables d’environnement nécessaires sont documentées dans `README.md` / `docs/development-guide.md`.
- Les routes publiques (`/portail`, `/api/webhooks/stripe`) ne révèlent aucune information si appelées avec des données invalides.
- Des tests manuels ou automatisés valident au moins :
  - un paiement test qui passe de `en_attente` à `paye`,
  - un accès portail valide vs invalide,
  - la création d’un ticket via le portail.
