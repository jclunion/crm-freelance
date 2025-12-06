export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifierWebhookSignature, traiterEvenementStripe } from '@/lib/integrations/stripe';

/**
 * POST /api/webhooks/stripe
 * Reçoit les événements webhook de Stripe.
 * 
 * IMPORTANT : Cette route doit recevoir le body brut (non parsé).
 * Dans Next.js 14 App Router, request.text() retourne automatiquement le body brut.
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer le body brut
    const payload = await request.text();
    
    // Récupérer la signature Stripe
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Webhook Stripe: signature manquante');
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    // Vérifier la signature et parser l'événement
    let event;
    try {
      event = verifierWebhookSignature(payload, signature);
    } catch (err) {
      console.error('Webhook Stripe: signature invalide', err);
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      );
    }

    // Traiter l'événement
    const resultat = traiterEvenementStripe(event);

    if (!resultat.traite) {
      // Événement non géré, on retourne 200 quand même pour que Stripe ne réessaie pas
      console.log(`Webhook Stripe: ${resultat.message}`);
      return NextResponse.json({ received: true, message: resultat.message });
    }

    // Mettre à jour l'opportunité si nécessaire
    if (resultat.opportuniteId && resultat.nouveauStatut) {
      await prisma.opportunite.update({
        where: { id: resultat.opportuniteId },
        data: { statutPaiement: resultat.nouveauStatut },
      });

      // Récupérer l'opportunité pour créer un événement timeline
      const opportunite = await prisma.opportunite.findUnique({
        where: { id: resultat.opportuniteId },
        select: { clientId: true, titre: true, montantEstime: true, devise: true },
      });

      if (opportunite) {
        // Créer un événement timeline pour le paiement reçu
        await prisma.evenementTimeline.create({
          data: {
            clientId: opportunite.clientId,
            typeEvenement: 'paiement_recu',
            referenceId: resultat.opportuniteId,
            descriptionTexte: `Paiement reçu pour "${opportunite.titre}" : ${opportunite.montantEstime} ${opportunite.devise}`,
          },
        });
      }

      console.log(`Webhook Stripe: ${resultat.message}`);
    }

    return NextResponse.json({ received: true, message: resultat.message });

  } catch (error) {
    console.error('Erreur webhook Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}