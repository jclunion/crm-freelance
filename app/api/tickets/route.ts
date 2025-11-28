import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { ticketCreationSchema } from '@/lib/validateurs';
import { authOptions } from '@/lib/auth';

// GET /api/tickets - Liste tous les tickets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || '';
    const statutTicket = searchParams.get('statutTicket') || '';
    const priorite = searchParams.get('priorite') || '';
    const recherche = searchParams.get('recherche') || '';

    const tickets = await prisma.ticket.findMany({
      where: {
        client: { proprietaireId: session.user.id },
        AND: [
          clientId ? { clientId } : {},
          statutTicket ? { statutTicket } : {},
          priorite ? { priorite } : {},
          recherche
            ? {
                OR: [
                  { sujet: { contains: recherche, mode: 'insensitive' } },
                  { description: { contains: recherche, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: [
        { statutTicket: 'asc' },
        { priorite: 'desc' },
        { dateCreation: 'desc' },
      ],
    });

    return NextResponse.json(tickets);
  } catch (erreur) {
    console.error('Erreur GET /api/tickets:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la récupération des tickets' },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Crée un nouveau ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const donnees = ticketCreationSchema.parse(body);

    // Vérifier que le client existe et appartient à l'utilisateur
    const clientExiste = await prisma.client.findFirst({
      where: { id: donnees.clientId, proprietaireId: session.user.id },
    });

    if (!clientExiste) {
      return NextResponse.json(
        { erreur: 'Client non trouvé' },
        { status: 404 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: donnees,
      include: {
        client: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });

    // Créer un événement timeline
    await prisma.evenementTimeline.create({
      data: {
        clientId: donnees.clientId,
        typeEvenement: 'ticket_cree',
        referenceId: ticket.id,
        descriptionTexte: `Ticket "${ticket.sujet}" créé`,
        auteurId: session.user.id,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (erreur) {
    console.error('Erreur POST /api/tickets:', erreur);

    if (erreur instanceof Error && erreur.name === 'ZodError') {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: 'Erreur lors de la création du ticket' },
      { status: 500 }
    );
  }
}
