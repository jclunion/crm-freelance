import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const emailSchema = z.object({
  sujet: z.string().min(1, 'Le sujet est requis'),
  contenu: z.string().min(1, 'Le contenu est requis'),
  direction: z.enum(['entrant', 'sortant']),
  dateEmail: z.string().optional(), // ISO date string, défaut = maintenant
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/clients/[id]/emails
 * Enregistre un échange email dans la timeline du client.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { id: clientId } = await context.params;

    // Vérifier que le client appartient à l'utilisateur
    const client = await prisma.client.findFirst({
      where: { id: clientId, proprietaireId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ erreur: 'Client non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    const donnees = emailSchema.parse(body);

    // Créer l'événement dans la timeline
    const directionLabel = donnees.direction === 'entrant' ? 'Email reçu' : 'Email envoyé';
    const description = `${directionLabel} : ${donnees.sujet}\n\n${donnees.contenu}`;

    const evenement = await prisma.evenementTimeline.create({
      data: {
        clientId,
        typeEvenement: 'email_client',
        descriptionTexte: description,
        dateEvenement: donnees.dateEmail ? new Date(donnees.dateEmail) : new Date(),
      },
    });

    return NextResponse.json(evenement, { status: 201 });
  } catch (erreur) {
    console.error('Erreur POST /api/clients/[id]/emails:', erreur);

    if (erreur instanceof z.ZodError) {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: 'Erreur lors de l\'enregistrement de l\'email' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/clients/[id]/emails
 * Récupère les événements email du client.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { id: clientId } = await context.params;

    // Vérifier que le client appartient à l'utilisateur
    const client = await prisma.client.findFirst({
      where: { id: clientId, proprietaireId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ erreur: 'Client non trouvé' }, { status: 404 });
    }

    const emails = await prisma.evenementTimeline.findMany({
      where: {
        clientId,
        typeEvenement: 'email_client',
      },
      orderBy: { dateEvenement: 'desc' },
    });

    return NextResponse.json(emails);
  } catch (erreur) {
    console.error('Erreur GET /api/clients/[id]/emails:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la récupération des emails' },
      { status: 500 }
    );
  }
}
