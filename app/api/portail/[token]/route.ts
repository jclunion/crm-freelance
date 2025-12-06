import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/portail/[token]
 * Récupère les données du client pour le portail (accès public via token).
 */
export async function GET(
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
      select: {
        id: true,
        nom: true,
        emailPrincipal: true,
        opportunites: {
          where: {
            etapePipeline: { in: ['gagne', 'proposition_envoyee', 'negociation'] },
          },
          select: {
            id: true,
            titre: true,
            descriptionCourte: true,
            montantEstime: true,
            devise: true,
            etapePipeline: true,
            statutPaiement: true,
            urlPaiement: true,
            dateCreation: true,
          },
          orderBy: { dateCreation: 'desc' },
        },
        tickets: {
          select: {
            id: true,
            sujet: true,
            description: true,
            typeTicket: true,
            priorite: true,
            statutTicket: true,
            dateCreation: true,
            dateMiseAJour: true,
          },
          orderBy: { dateCreation: 'desc' },
          take: 20,
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Portail non trouvé' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Erreur récupération portail:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
