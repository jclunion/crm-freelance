import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { opportuniteCreationSchema } from '@/lib/validateurs';

// GET /api/opportunites - Liste toutes les opportunités
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || '';
    const etapePipeline = searchParams.get('etapePipeline') || '';

    const opportunites = await prisma.opportunite.findMany({
      where: {
        proprietaireId: session.user.id,
        AND: [
          clientId ? { clientId } : {},
          etapePipeline ? { etapePipeline } : {},
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
      orderBy: { dateCreation: 'desc' },
    });

    return NextResponse.json(opportunites);
  } catch (erreur) {
    console.error('Erreur GET /api/opportunites:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la récupération des opportunités' },
      { status: 500 }
    );
  }
}

// POST /api/opportunites - Crée une nouvelle opportunité
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const donnees = opportuniteCreationSchema.parse(body);

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

    const opportunite = await prisma.opportunite.create({
      data: {
        ...donnees,
        dateCloturePrevue: donnees.dateCloturePrevue
          ? new Date(donnees.dateCloturePrevue)
          : null,
        proprietaireId: session.user.id,
      },
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
        typeEvenement: 'opportunite_creee',
        referenceId: opportunite.id,
        descriptionTexte: `Opportunité "${opportunite.titre}" créée`,
        auteurId: session.user.id,
      },
    });

    return NextResponse.json(opportunite, { status: 201 });
  } catch (erreur) {
    console.error('Erreur POST /api/opportunites:', erreur);

    if (erreur instanceof Error && erreur.name === 'ZodError') {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: "Erreur lors de la création de l'opportunité" },
      { status: 500 }
    );
  }
}
