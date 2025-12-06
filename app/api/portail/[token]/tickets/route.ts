import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/portail/[token]/tickets
 * Permet au client de créer un ticket depuis le portail.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token || token.length < 32) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    // Trouver le client par son token
    const client = await prisma.client.findFirst({
      where: { tokenPortail: token },
      select: { id: true, proprietaireId: true },
    });

    if (!client) {
      return NextResponse.json({ error: 'Portail non trouvé' }, { status: 404 });
    }

    // Récupérer les données du ticket
    const body = await request.json();
    const { sujet, description, typeTicket } = body;

    if (!sujet || !description) {
      return NextResponse.json(
        { error: 'Sujet et description requis' },
        { status: 400 }
      );
    }

    // Créer le ticket
    const ticket = await prisma.ticket.create({
      data: {
        clientId: client.id,
        sujet,
        description,
        typeTicket: typeTicket || 'question',
        priorite: 'normale',
        statutTicket: 'ouvert',
      },
    });

    // Créer un événement timeline
    await prisma.evenementTimeline.create({
      data: {
        clientId: client.id,
        typeEvenement: 'ticket_cree',
        referenceId: ticket.id,
        descriptionTexte: `Ticket créé depuis le portail client : "${sujet}"`,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Erreur création ticket portail:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
