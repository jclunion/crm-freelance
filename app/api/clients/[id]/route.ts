import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { clientMiseAJourSchema } from '@/lib/validateurs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/clients/[id] - Récupère un client par ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await context.params;
    const client = await prisma.client.findFirst({
      where: { id, proprietaireId: session.user.id },
      include: {
        contacts: true,
        opportunites: {
          orderBy: { dateCreation: 'desc' },
        },
        tickets: {
          orderBy: { dateCreation: 'desc' },
        },
        evenements: {
          orderBy: { dateEvenement: 'desc' },
          take: 20,
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { erreur: 'Client non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (erreur) {
    console.error('Erreur GET /api/clients/[id]:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la récupération du client' },
      { status: 500 }
    );
  }
}

// PATCH /api/clients/[id] - Met à jour un client
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const donnees = clientMiseAJourSchema.parse(body);

    const clientExistant = await prisma.client.findFirst({
      where: { id, proprietaireId: session.user.id },
    });

    if (!clientExistant) {
      return NextResponse.json(
        { erreur: 'Client non trouvé' },
        { status: 404 }
      );
    }

    const client = await prisma.client.update({
      where: { id },
      data: donnees,
    });

    return NextResponse.json(client);
  } catch (erreur) {
    console.error('Erreur PATCH /api/clients/[id]:', erreur);

    if (erreur instanceof Error && erreur.name === 'ZodError') {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: 'Erreur lors de la mise à jour du client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Supprime un client
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await context.params;
    const clientExistant = await prisma.client.findFirst({
      where: { id, proprietaireId: session.user.id },
    });

    if (!clientExistant) {
      return NextResponse.json(
        { erreur: 'Client non trouvé' },
        { status: 404 }
      );
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Client supprimé' });
  } catch (erreur) {
    console.error('Erreur DELETE /api/clients/[id]:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la suppression du client' },
      { status: 500 }
    );
  }
}
