import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/documents
 * Récupère les documents d'une opportunité
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const opportuniteId = searchParams.get('opportuniteId');

    if (!opportuniteId) {
      return NextResponse.json({ error: 'opportuniteId requis' }, { status: 400 });
    }

    // Vérifier que l'opportunité appartient à l'utilisateur
    const opportunite = await prisma.opportunite.findFirst({
      where: { id: opportuniteId, proprietaireId: session.user.id },
    });

    if (!opportunite) {
      return NextResponse.json({ error: 'Opportunité non trouvée' }, { status: 404 });
    }

    const documents = await prisma.document.findMany({
      where: { opportuniteId },
      orderBy: { dateCreation: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Erreur récupération documents:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/**
 * POST /api/documents
 * Crée un nouveau document
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { opportuniteId, nom, typeDocument, fichierUrl, tailleFichier, mimeType, visiblePortail } = body;

    if (!opportuniteId || !nom || !typeDocument || !fichierUrl) {
      return NextResponse.json(
        { error: 'opportuniteId, nom, typeDocument et fichierUrl requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'opportunité appartient à l'utilisateur
    const opportunite = await prisma.opportunite.findFirst({
      where: { id: opportuniteId, proprietaireId: session.user.id },
    });

    if (!opportunite) {
      return NextResponse.json({ error: 'Opportunité non trouvée' }, { status: 404 });
    }

    const document = await prisma.document.create({
      data: {
        opportuniteId,
        nom,
        typeDocument,
        fichierUrl,
        tailleFichier: tailleFichier || null,
        mimeType: mimeType || null,
        visiblePortail: visiblePortail ?? true,
        proprietaireId: session.user.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Erreur création document:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
