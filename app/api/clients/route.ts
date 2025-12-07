import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { clientCreationSchema } from '@/lib/validateurs';

// GET /api/clients - Liste tous les clients
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recherche = searchParams.get('recherche') || '';
    const statutClient = searchParams.get('statutClient') || '';
    const typeClient = searchParams.get('typeClient') || '';

    const clients = await prisma.client.findMany({
      where: {
        proprietaireId: session.user.id,
        AND: [
          recherche
            ? {
                OR: [
                  { nom: { contains: recherche, mode: 'insensitive' } },
                  { emailPrincipal: { contains: recherche, mode: 'insensitive' } },
                ],
              }
            : {},
          statutClient ? { statutClient } : {},
          typeClient ? { typeClient } : {},
        ],
      },
      include: {
        _count: {
          select: {
            contacts: true,
            opportunites: true,
            tickets: true,
          },
        },
      },
      orderBy: { dateCreation: 'desc' },
    });

    return NextResponse.json(clients);
  } catch (erreur) {
    console.error('Erreur GET /api/clients:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Crée un nouveau client
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const donnees = clientCreationSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        ...donnees,
        emailPrincipal: donnees.emailPrincipal || null,
        proprietaireId: session.user.id,
      },
    });

    // Créer un événement timeline
    await prisma.evenementTimeline.create({
      data: {
        clientId: client.id,
        typeEvenement: 'note_client',
        descriptionTexte: `Client "${client.nom}" créé`,
        auteurId: session.user.id,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (erreur) {
    console.error('Erreur POST /api/clients:', erreur);
    
    if (erreur instanceof Error && erreur.name === 'ZodError') {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: 'Erreur lors de la création du client' },
      { status: 500 }
    );
  }
}
