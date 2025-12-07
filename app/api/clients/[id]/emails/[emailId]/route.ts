import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const emailUpdateSchema = z.object({
  sujet: z.string().min(1, 'Le sujet est requis'),
  contenu: z.string().min(1, 'Le contenu est requis'),
  direction: z.enum(['entrant', 'sortant']),
});

interface RouteParams {
  params: { id: string; emailId: string };
}

/**
 * PATCH /api/clients/[id]/emails/[emailId]
 * Met à jour un événement email.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { id: clientId, emailId } = params;

    // Vérifier que le client appartient à l'utilisateur
    const client = await prisma.client.findFirst({
      where: { id: clientId, proprietaireId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ erreur: 'Client non trouvé' }, { status: 404 });
    }

    // Vérifier que l'événement existe et appartient au client
    const evenementExistant = await prisma.evenementTimeline.findFirst({
      where: { id: emailId, clientId, typeEvenement: 'email_client' },
    });

    if (!evenementExistant) {
      return NextResponse.json({ erreur: 'Email non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    const donnees = emailUpdateSchema.parse(body);

    // Reconstruire la description
    const directionLabel = donnees.direction === 'entrant' ? 'Email reçu' : 'Email envoyé';
    const description = `${directionLabel} : ${donnees.sujet}\n\n${donnees.contenu}`;

    const evenement = await prisma.evenementTimeline.update({
      where: { id: emailId },
      data: { descriptionTexte: description },
    });

    return NextResponse.json(evenement);
  } catch (erreur) {
    console.error('Erreur PATCH /api/clients/[id]/emails/[emailId]:', erreur);

    if (erreur instanceof z.ZodError) {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: 'Erreur lors de la mise à jour de l\'email' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[id]/emails/[emailId]
 * Supprime un événement email.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { id: clientId, emailId } = params;

    // Vérifier que le client appartient à l'utilisateur
    const client = await prisma.client.findFirst({
      where: { id: clientId, proprietaireId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ erreur: 'Client non trouvé' }, { status: 404 });
    }

    // Vérifier que l'événement existe et appartient au client
    const evenementExistant = await prisma.evenementTimeline.findFirst({
      where: { id: emailId, clientId, typeEvenement: 'email_client' },
    });

    if (!evenementExistant) {
      return NextResponse.json({ erreur: 'Email non trouvé' }, { status: 404 });
    }

    await prisma.evenementTimeline.delete({
      where: { id: emailId },
    });

    return NextResponse.json({ message: 'Email supprimé' });
  } catch (erreur) {
    console.error('Erreur DELETE /api/clients/[id]/emails/[emailId]:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la suppression de l\'email' },
      { status: 500 }
    );
  }
}
