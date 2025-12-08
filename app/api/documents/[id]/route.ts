import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/documents/[id]
 * Met à jour un document
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Vérifier que le document appartient à l'utilisateur
    const documentExistant = await prisma.document.findFirst({
      where: { id, proprietaireId: session.user.id },
    });

    if (!documentExistant) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        nom: body.nom,
        typeDocument: body.typeDocument,
        visiblePortail: body.visiblePortail,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Erreur mise à jour document:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/[id]
 * Supprime un document
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await context.params;

    // Vérifier que le document appartient à l'utilisateur
    const document = await prisma.document.findFirst({
      where: { id, proprietaireId: session.user.id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ message: 'Document supprimé' });
  } catch (error) {
    console.error('Erreur suppression document:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
