import Stripe from 'stripe';

// ============================================
// Configuration Stripe
// ============================================

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY non définie. Les paiements Stripe ne fonctionneront pas.');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-11-17.clover' })
  : null;

// ============================================
// Types
// ============================================

export interface DonneesPaiement {
  opportuniteId: string;
  clientId: string;
  montant: number; // en centimes (ex: 5000 = 50.00 EUR)
  devise: string;  // ex: "EUR"
  description?: string;
  urlSucces?: string;
  urlAnnulation?: string;
}

export interface ResultatSessionPaiement {
  sessionId: string;
  urlPaiement: string;
}

// ============================================
// Création de session de paiement
// ============================================

/**
 * Crée une session Stripe Checkout pour une opportunité.
 * @param donnees - Informations de paiement (montant en centimes, devise, etc.)
 * @returns L'ID de session Stripe et l'URL de paiement.
 */
export async function creerSessionPaiement(
  donnees: DonneesPaiement
): Promise<ResultatSessionPaiement> {
  if (!stripe) {
    throw new Error('Stripe non configuré. Vérifiez STRIPE_SECRET_KEY.');
  }

  const { opportuniteId, clientId, montant, devise, description, urlSucces, urlAnnulation } = donnees;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: devise.toLowerCase(),
          product_data: {
            name: description || `Paiement opportunité ${opportuniteId}`,
          },
          unit_amount: montant,
        },
        quantity: 1,
      },
    ],
    metadata: {
      opportuniteId,
      clientId,
    },
    success_url: urlSucces || `${process.env.NEXTAUTH_URL}/opportunites?paiement=succes`,
    cancel_url: urlAnnulation || `${process.env.NEXTAUTH_URL}/opportunites?paiement=annule`,
  });

  if (!session.url) {
    throw new Error("Stripe n'a pas retourné d'URL de paiement.");
  }

  return {
    sessionId: session.id,
    urlPaiement: session.url,
  };
}

// ============================================
// Vérification de la signature webhook
// ============================================

/**
 * Vérifie la signature d'un webhook Stripe.
 * @param payload - Corps brut de la requête (Buffer ou string).
 * @param signature - Valeur du header `stripe-signature`.
 * @returns L'événement Stripe vérifié.
 */
export function verifierWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe non configuré.');
  }

  if (!stripeWebhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET non définie.');
  }

  return stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
}

// ============================================
// Traitement des événements Stripe
// ============================================

export interface ResultatTraitementEvenement {
  traite: boolean;
  opportuniteId?: string;
  nouveauStatut?: string;
  message?: string;
}

/**
 * Traite un événement Stripe (ex: checkout.session.completed).
 * Retourne les informations nécessaires pour mettre à jour l'opportunité.
 * @param event - Événement Stripe vérifié.
 */
export function traiterEvenementStripe(
  event: Stripe.Event
): ResultatTraitementEvenement {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const opportuniteId = session.metadata?.opportuniteId;

      if (!opportuniteId) {
        return {
          traite: false,
          message: 'Metadata opportuniteId manquante dans la session.',
        };
      }

      return {
        traite: true,
        opportuniteId,
        nouveauStatut: 'paye',
        message: `Paiement complété pour opportunité ${opportuniteId}.`,
      };
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const opportuniteId = session.metadata?.opportuniteId;

      return {
        traite: true,
        opportuniteId: opportuniteId || undefined,
        message: `Session expirée pour opportunité ${opportuniteId || 'inconnue'}.`,
      };
    }

    default:
      return {
        traite: false,
        message: `Événement non géré : ${event.type}`,
      };
  }
}
