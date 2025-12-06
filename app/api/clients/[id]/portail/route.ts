import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { genererTokenPortail, construireUrlPortail } from '@/lib/portail';

/**
 * POST /api/clients/[id]/portail
 * Génère ou régénère le token du portail client.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;

    // Vérifier que le client existe et appartient à l'utilisateur
    const client = await prisma.client.findUnique({
      where: { id },
      select: { id: true, proprietaireId: true },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    if (client.proprietaireId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Générer un nouveau token
    const token = genererTokenPortail();

    // Mettre à jour le client
    await prisma.client.update({
      where: { id },
      data: { tokenPortail: token },
    });

    return NextResponse.json({
      token,
      urlPortail: construireUrlPortail(token),
    });
  } catch (error) {
    console.error('Erreur génération token portail:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/**
 * DELETE /api/clients/[id]/portail
 * Révoque l'accès au portail client.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;

    // Vérifier que le client existe et appartient à l'utilisateur
    const client = await prisma.client.findUnique({
      where: { id },
      select: { id: true, proprietaireId: true },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    if (client.proprietaireId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Supprimer le token
    await prisma.client.update({
      where: { id },
      data: { tokenPortail: null },
    });

    return NextResponse.json({ message: 'Accès portail révoqué' });
  } catch (error) {
    console.error('Erreur révocation token portail:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
