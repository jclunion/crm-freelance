import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ticketMiseAJourSchema } from '@/lib/validateurs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/tickets/[id] - Récupère un ticket par ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await context.params;
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        client: { proprietaireId: session.user.id },
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            emailPrincipal: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { erreur: 'Ticket non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (erreur) {
    console.error('Erreur GET /api/tickets/[id]:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la récupération du ticket' },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets/[id] - Met à jour un ticket
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const donnees = ticketMiseAJourSchema.parse(body);

    const ticketExistant = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticketExistant) {
      return NextResponse.json(
        { erreur: 'Ticket non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const donneesMAJ: Record<string, unknown> = { ...donnees };
    
    // Si le statut passe à "resolu", enregistrer la date de résolution
    if (donnees.statutTicket === 'resolu' && ticketExistant.statutTicket !== 'resolu') {
      donneesMAJ.dateResolution = new Date();
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: donneesMAJ,
      include: {
        client: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });

    // Si le statut a changé, créer un événement timeline
    if (donnees.statutTicket && donnees.statutTicket !== ticketExistant.statutTicket) {
      await prisma.evenementTimeline.create({
        data: {
          clientId: ticket.clientId,
          typeEvenement: 'ticket_statut_change',
          referenceId: ticket.id,
          descriptionTexte: `Ticket "${ticket.sujet}" passé à "${donnees.statutTicket}"`,
        },
      });
    }

    return NextResponse.json(ticket);
  } catch (erreur) {
    console.error('Erreur PATCH /api/tickets/[id]:', erreur);

    if (erreur instanceof Error && erreur.name === 'ZodError') {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: 'Erreur lors de la mise à jour du ticket' },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/[id] - Supprime un ticket
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ticketExistant = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticketExistant) {
      return NextResponse.json(
        { erreur: 'Ticket non trouvé' },
        { status: 404 }
      );
    }

    await prisma.ticket.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Ticket supprimé' });
  } catch (erreur) {
    console.error('Erreur DELETE /api/tickets/[id]:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la suppression du ticket' },
      { status: 500 }
    );
  }
}
