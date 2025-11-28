import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactMiseAJourSchema } from '@/lib/validateurs';

interface RouteParams {
  params: { id: string };
}

// GET /api/contacts/[id] - Récupère un contact par ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { erreur: 'Contact non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (erreur) {
    console.error('Erreur GET /api/contacts/[id]:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la récupération du contact' },
      { status: 500 }
    );
  }
}

// PATCH /api/contacts/[id] - Met à jour un contact
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const donnees = contactMiseAJourSchema.parse(body);

    const contactExistant = await prisma.contact.findUnique({
      where: { id: params.id },
    });

    if (!contactExistant) {
      return NextResponse.json(
        { erreur: 'Contact non trouvé' },
        { status: 404 }
      );
    }

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: donnees,
    });

    return NextResponse.json(contact);
  } catch (erreur) {
    console.error('Erreur PATCH /api/contacts/[id]:', erreur);

    if (erreur instanceof Error && erreur.name === 'ZodError') {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: 'Erreur lors de la mise à jour du contact' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Supprime un contact
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const contactExistant = await prisma.contact.findUnique({
      where: { id: params.id },
    });

    if (!contactExistant) {
      return NextResponse.json(
        { erreur: 'Contact non trouvé' },
        { status: 404 }
      );
    }

    await prisma.contact.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Contact supprimé' });
  } catch (erreur) {
    console.error('Erreur DELETE /api/contacts/[id]:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la suppression du contact' },
      { status: 500 }
    );
  }
}
