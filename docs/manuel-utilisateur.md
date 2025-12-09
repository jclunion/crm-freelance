# Manuel Utilisateur - CRM Freelance

**Version 1.0 - Décembre 2025**

---

## Table des matières

1. [Introduction](#introduction)
2. [Premiers pas](#premiers-pas)
3. [Tableau de bord](#tableau-de-bord)
4. [Gestion des clients](#gestion-des-clients)
5. [Pipeline d'opportunités](#pipeline-dopportunités)
6. [Génération de devis et factures](#génération-de-devis-et-factures)
7. [Gestion des documents](#gestion-des-documents)
8. [Tickets de support](#tickets-de-support)
9. [Portail client](#portail-client)
10. [Paramètres](#paramètres)

---

## Introduction

CRM Freelance est une application de gestion de la relation client conçue spécifiquement pour les freelances et les petites agences numériques. Elle permet de centraliser la gestion des clients, des opportunités commerciales, des devis, des factures et du support client.

### Fonctionnalités principales

- **Gestion des clients** : Fiche client 360° avec contacts, historique et timeline
- **Pipeline commercial** : Suivi des opportunités en vue Kanban ou liste
- **Devis et factures PDF** : Génération automatique avec numérotation et TVA
- **Documents** : Stockage et partage de fichiers avec les clients
- **Support** : Système de tickets pour le suivi des demandes
- **Portail client** : Espace dédié pour vos clients

---

## Premiers pas

### Création de compte

1. Accédez à l'application sur votre navigateur
2. Cliquez sur **"Créer un compte"**
3. Renseignez votre email et un mot de passe sécurisé
4. Validez votre inscription

### Connexion

1. Accédez à la page de connexion
2. Entrez votre email et mot de passe
3. Cliquez sur **"Se connecter"**

### Configuration initiale

Avant de commencer, configurez vos informations d'entreprise dans **Paramètres** :

1. Cliquez sur **"Paramètres"** dans la barre latérale
2. Renseignez vos informations :
   - Raison sociale
   - Adresse complète
   - SIRET et numéro de TVA
   - Logo de votre entreprise
   - Coordonnées bancaires (IBAN/BIC)
   - Régime TVA (franchise ou assujetti)

---

## Tableau de bord

Le tableau de bord affiche une vue d'ensemble de votre activité :

### Statistiques affichées

- **Nombre de clients** : Total de vos clients actifs
- **Opportunités en cours** : Nombre d'opportunités dans le pipeline
- **Tickets ouverts** : Demandes de support en attente
- **Chiffre d'affaires** : Total des opportunités gagnées

### Graphiques

- Évolution du CA sur les derniers mois
- Répartition des opportunités par étape
- Tickets par priorité

---

## Gestion des clients

### Liste des clients

La page **Clients** affiche tous vos clients avec :

- Nom et raison sociale
- Email principal
- Statut (prospect, actif, inactif)
- Date de création

### Filtres disponibles

- **Recherche** : Par nom ou email
- **Statut** : Prospect, Actif, Inactif
- **Type** : Particulier, Entreprise
- **Date de création** : Période personnalisée

### Créer un client

1. Cliquez sur **"Nouveau client"**
2. Remplissez les informations :
   - Nom (obligatoire)
   - Email principal
   - Téléphone
   - Type (particulier/entreprise)
   - Statut
3. Cliquez sur **"Créer"**

### Fiche client 360°

En cliquant sur un client, vous accédez à sa fiche complète :

#### Onglet Informations
- Coordonnées complètes
- Informations d'entreprise (SIRET, TVA, secteur)
- Notes

#### Onglet Contacts
- Liste des contacts associés
- Contact principal identifié
- Ajout/modification de contacts

#### Onglet Opportunités
- Toutes les opportunités liées au client
- Montants et statuts
- Accès rapide à chaque opportunité

#### Onglet Tickets
- Historique des demandes de support
- Statuts et priorités

#### Onglet Timeline
- Historique chronologique des interactions
- Événements automatiques et manuels

---

## Pipeline d'opportunités

### Vue Kanban

La vue par défaut affiche vos opportunités en colonnes :

| Étape | Description |
|-------|-------------|
| **Lead** | Premier contact, opportunité identifiée |
| **Qualification** | Besoin qualifié, budget validé |
| **Proposition** | Devis envoyé |
| **Négociation** | Discussion en cours |
| **Gagné** | Affaire conclue |
| **Perdu** | Opportunité non concrétisée |

### Déplacer une opportunité

- **Glisser-déposer** : Faites glisser la carte vers une autre colonne
- **Édition** : Ouvrez la modale et changez l'étape

### Vue Liste

Cliquez sur l'icône liste pour afficher les opportunités en tableau avec colonnes triables.

### Créer une opportunité

1. Cliquez sur **"Nouvelle opportunité"**
2. Remplissez :
   - Titre (obligatoire)
   - Client associé
   - Montant estimé
   - Description
   - Étape initiale
3. Cliquez sur **"Créer"**

### Éditer une opportunité

Cliquez sur une opportunité pour ouvrir la modale d'édition :

- Modifier les informations
- Changer l'étape
- Gérer les documents
- Générer des devis/factures
- Créer un lien de paiement Stripe

---

## Génération de devis et factures

### Prérequis

Avant de générer des documents, configurez vos informations dans **Paramètres** :

- Raison sociale et adresse
- SIRET et numéro de TVA
- Logo (optionnel mais recommandé)
- Régime TVA
- Coordonnées bancaires (pour les factures)

### Générer un devis

1. Ouvrez une opportunité
2. Dans la section **"Génération PDF"**, cliquez sur **"Devis PDF"**
3. Le PDF est généré et téléchargé automatiquement

#### Contenu du devis

- En-tête avec votre logo et coordonnées
- Informations du client
- Numéro de devis (DEV-2025-0001)
- Date d'émission et validité (30 jours)
- Détails de la prestation
- Montant (avec ou sans TVA selon votre régime)
- Mentions légales

### Générer une facture

> **Important** : La facture n'est disponible que si l'opportunité est **gagnée** ET **payée**.

1. Ouvrez une opportunité gagnée et payée
2. Cliquez sur **"Facture PDF"**
3. Le PDF s'ouvre avec le tampon **"PAYÉ"**

#### Contenu de la facture

- Mêmes informations que le devis
- Numéro de facture (FAC-2025-0001)
- Tampon "PAYÉ" en vert
- Coordonnées bancaires (IBAN/BIC)
- Mentions légales sur les pénalités de retard

### Numérotation automatique

Les numéros sont générés automatiquement :

- **Devis** : DEV-AAAA-XXXX (ex: DEV-2025-0001)
- **Factures** : FAC-AAAA-XXXX (ex: FAC-2025-0001)

Les compteurs sont propres à chaque utilisateur et se réinitialisent chaque année.

### Gestion de la TVA

#### Franchise de TVA (micro-entrepreneur)

Si votre taux TVA est à 0% :
- Le montant affiché est le total
- Mention : "TVA non applicable, art. 293 B du CGI"

#### Assujetti à la TVA

Si votre taux TVA est > 0% (ex: 20%) :
- Montant HT
- TVA (20%)
- Total TTC

---

## Gestion des documents

### Types de documents

- **Contrat** : Contrats signés
- **Devis** : Propositions commerciales
- **Facture** : Factures émises
- **Autre** : Tout autre document

### Ajouter un document

1. Ouvrez une opportunité
2. Section **"Documents"**
3. Cliquez sur **"Ajouter un document"**
4. Sélectionnez un fichier (PDF, Word, Excel, images)
5. Choisissez le type et la visibilité

### Visibilité portail

Cochez **"Visible sur le portail"** pour que le client puisse voir et télécharger le document depuis son espace.

### Documents générés automatiquement

Les devis et factures PDF sont automatiquement ajoutés aux documents de l'opportunité.

---

## Tickets de support

### Liste des tickets

La page **Tickets** affiche toutes les demandes de support :

- Titre et description
- Client associé
- Statut (ouvert, en cours, résolu, fermé)
- Priorité (basse, normale, haute, urgente)
- Type (bug, fonctionnalité, question, autre)

### Créer un ticket

1. Cliquez sur **"Nouveau ticket"**
2. Remplissez :
   - Titre
   - Description
   - Client
   - Priorité
   - Type
3. Cliquez sur **"Créer"**

### Gérer un ticket

- Changez le statut en cliquant sur les boutons rapides
- Assignez le ticket à un utilisateur
- Ajoutez des commentaires

### Vue Kanban

Affichez les tickets en colonnes par statut pour une gestion visuelle.

---

## Portail client

### Accès client

Vos clients peuvent accéder à leur espace via un lien unique envoyé par email.

### Fonctionnalités du portail

Le client peut :

- Voir ses projets/opportunités
- Consulter les détails et montants
- Télécharger les documents partagés
- Voir l'avancement de ses projets

### Partager l'accès

1. Ouvrez la fiche client
2. Cliquez sur **"Envoyer accès portail"**
3. Un email est envoyé avec le lien d'accès

---

## Paramètres

### Informations personnelles

- **Nom affiché** : Votre nom ou celui de votre entreprise
- **Email** : Adresse de contact

### Logo entreprise

Deux options pour ajouter votre logo :

1. **Upload** : Cliquez sur "Choisir un fichier" et sélectionnez votre logo
2. **URL directe** : Collez une URL Cloudinary, Imgur ou autre service d'hébergement

Le logo apparaîtra sur vos devis, factures et le portail client.

### Adresse

- Adresse ligne 1 et 2
- Code postal
- Ville
- Pays
- Téléphone

### Informations légales

#### Régime TVA

- **Franchise de TVA** : Pour les micro-entrepreneurs (taux 0%)
- **Assujetti à la TVA** : Saisissez votre taux (ex: 20%)

#### Identifiants

- **SIRET** : Numéro d'identification de votre entreprise
- **N° TVA intracommunautaire** : Si applicable

#### Mentions légales

Ajoutez des mentions personnalisées qui apparaîtront sur vos documents.

### Coordonnées bancaires

- **IBAN** : Numéro de compte bancaire
- **BIC** : Code d'identification de la banque

Ces informations apparaissent sur les factures pour faciliter le paiement.

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl + K` | Recherche globale |
| `Échap` | Fermer une modale |

---

## Support

Pour toute question ou problème, contactez le support technique.

---

*Document généré le 9 décembre 2025*
