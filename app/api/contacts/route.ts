import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactCreationSchema } from '@/lib/validateurs';

// GET /api/contacts - Liste tous les contacts (optionnel: filtrer par clientId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || '';

    const contacts = await prisma.contact.findMany({
      where: clientId ? { clientId } : {},
      include: {
        client: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: { nom: 'asc' },
    });

    return NextResponse.json(contacts);
  } catch (erreur) {
    console.error('Erreur GET /api/contacts:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la récupération des contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Crée un nouveau contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const donnees = contactCreationSchema.parse(body);

    // Vérifier que le client existe
    const clientExiste = await prisma.client.findUnique({
      where: { id: donnees.clientId },
    });

    if (!clientExiste) {
      return NextResponse.json(
        { erreur: 'Client non trouvé' },
        { status: 404 }
      );
    }

    const contact = await prisma.contact.create({
      data: donnees,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (erreur) {
    console.error('Erreur POST /api/contacts:', erreur);

    if (erreur instanceof Error && erreur.name === 'ZodError') {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: 'Erreur lors de la création du contact' },
      { status: 500 }
    );
  }
}
