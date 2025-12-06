import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { creerSessionPaiement } from '@/lib/integrations/stripe';

/**
 * POST /api/paiements/stripe/session
 * Crée une session Stripe Checkout pour une opportunité gagnée.
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'ID de l'opportunité
    const body = await request.json();
    const { opportuniteId } = body;

    if (!opportuniteId) {
      return NextResponse.json(
        { error: 'opportuniteId requis' },
        { status: 400 }
      );
    }

    // Récupérer l'opportunité avec le client
    const opportunite = await prisma.opportunite.findUnique({
      where: { id: opportuniteId },
      include: { client: true },
    });

    if (!opportunite) {
      return NextResponse.json(
        { error: 'Opportunité non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire
    if (opportunite.proprietaireId !== session.user.id) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    // Vérifier que l'opportunité est gagnée
    if (opportunite.etapePipeline !== 'gagne') {
      return NextResponse.json(
        { error: 'L\'opportunité doit être à l\'étape "gagne" pour générer un paiement' },
        { status: 400 }
      );
    }

    // Vérifier qu'un montant est défini
    if (!opportunite.montantEstime || opportunite.montantEstime <= 0) {
      return NextResponse.json(
        { error: 'Montant estimé requis pour générer un paiement' },
        { status: 400 }
      );
    }

    // Vérifier si un paiement n'est pas déjà en cours ou payé
    if (opportunite.statutPaiement === 'paye') {
      return NextResponse.json(
        { error: 'Cette opportunité a déjà été payée' },
        { status: 400 }
      );
    }

    // Créer la session Stripe
    const resultat = await creerSessionPaiement({
      opportuniteId: opportunite.id,
      clientId: opportunite.clientId,
      montant: Math.round(opportunite.montantEstime * 100), // Convertir en centimes
      devise: opportunite.devise,
      description: `${opportunite.titre} - ${opportunite.client.nom}`,
    });

    // Mettre à jour l'opportunité avec les infos Stripe
    await prisma.opportunite.update({
      where: { id: opportuniteId },
      data: {
        stripeSessionId: resultat.sessionId,
        urlPaiement: resultat.urlPaiement,
        statutPaiement: 'en_attente',
      },
    });

    return NextResponse.json({
      urlPaiement: resultat.urlPaiement,
      sessionId: resultat.sessionId,
      statutPaiement: 'en_attente',
    });

  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
