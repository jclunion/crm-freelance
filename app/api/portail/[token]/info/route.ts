import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/portail/[token]/info
 * Récupère les infos de base du client (nom, email) pour la page de connexion.
 * Ne retourne pas les données sensibles (opportunités, tickets).
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;

    if (!token || token.length < 32) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
    }

    // Trouver le client par son token
    const client = await prisma.client.findFirst({
      where: { tokenPortail: token },
      select: {
        nom: true,
        emailPrincipal: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Portail non trouvé' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Erreur récupération info portail:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
