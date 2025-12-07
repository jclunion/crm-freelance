import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { opportuniteMiseAJourSchema } from '@/lib/validateurs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/opportunites/[id] - Récupère une opportunité par ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const opportunite = await prisma.opportunite.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            emailPrincipal: true,
          },
        },
        proprietaire: {
          select: {
            id: true,
            nomAffiche: true,
            email: true,
          },
        },
      },
    });

    if (!opportunite) {
      return NextResponse.json(
        { erreur: 'Opportunité non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunite);
  } catch (erreur) {
    console.error('Erreur GET /api/opportunites/[id]:', erreur);
    return NextResponse.json(
      { erreur: "Erreur lors de la récupération de l'opportunité" },
      { status: 500 }
    );
  }
}

// PATCH /api/opportunites/[id] - Met à jour une opportunité
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const donnees = opportuniteMiseAJourSchema.parse(body);

    const opportuniteExistante = await prisma.opportunite.findUnique({
      where: { id },
    });

    if (!opportuniteExistante) {
      return NextResponse.json(
        { erreur: 'Opportunité non trouvée' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const donneesMAJ: Record<string, unknown> = { ...donnees };
    if (donnees.dateCloturePrevue) {
      donneesMAJ.dateCloturePrevue = new Date(donnees.dateCloturePrevue);
    }

    const opportunite = await prisma.opportunite.update({
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

    // Si l'étape a changé, créer un événement timeline
    if (donnees.etapePipeline && donnees.etapePipeline !== opportuniteExistante.etapePipeline) {
      await prisma.evenementTimeline.create({
        data: {
          clientId: opportunite.clientId,
          typeEvenement: 'opportunite_etape_changee',
          referenceId: opportunite.id,
          descriptionTexte: `Opportunité "${opportunite.titre}" passée à "${donnees.etapePipeline}"`,
        },
      });
    }

    return NextResponse.json(opportunite);
  } catch (erreur) {
    console.error('Erreur PATCH /api/opportunites/[id]:', erreur);

    if (erreur instanceof Error && erreur.name === 'ZodError') {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: "Erreur lors de la mise à jour de l'opportunité" },
      { status: 500 }
    );
  }
}

// DELETE /api/opportunites/[id] - Supprime une opportunité
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const opportuniteExistante = await prisma.opportunite.findUnique({
      where: { id },
    });

    if (!opportuniteExistante) {
      return NextResponse.json(
        { erreur: 'Opportunité non trouvée' },
        { status: 404 }
      );
    }

    await prisma.opportunite.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Opportunité supprimée' });
  } catch (erreur) {
    console.error('Erreur DELETE /api/opportunites/[id]:', erreur);
    return NextResponse.json(
      { erreur: "Erreur lors de la suppression de l'opportunité" },
      { status: 500 }
    );
  }
}
