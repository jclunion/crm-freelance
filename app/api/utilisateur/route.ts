import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schéma de validation pour la mise à jour des infos utilisateur
const utilisateurMiseAJourSchema = z.object({
  nomAffiche: z.string().optional(),
  logoUrl: z.string().optional(),
  raisonSociale: z.string().optional(),
  adresseLigne1: z.string().optional(),
  adresseLigne2: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  siret: z.string().optional(),
  numeroTva: z.string().optional(),
  telephone: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  mentionsLegales: z.string().optional(),
  tauxTva: z.number().min(0).max(100).optional(),
});

/**
 * GET /api/utilisateur
 * Récupère les informations de l'utilisateur connecté
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const utilisateur = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        nomAffiche: true,
        logoUrl: true,
        raisonSociale: true,
        adresseLigne1: true,
        adresseLigne2: true,
        codePostal: true,
        ville: true,
        pays: true,
        siret: true,
        numeroTva: true,
        telephone: true,
        iban: true,
        bic: true,
        mentionsLegales: true,
        tauxTva: true,
        compteurDevis: true,
        compteurFacture: true,
      },
    });

    if (!utilisateur) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(utilisateur);
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/**
 * PATCH /api/utilisateur
 * Met à jour les informations de l'utilisateur connecté
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const validation = utilisateurMiseAJourSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      );
    }

    const donnees = validation.data;

    const utilisateurMaj = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nomAffiche: donnees.nomAffiche || null,
        logoUrl: donnees.logoUrl || null,
        raisonSociale: donnees.raisonSociale || null,
        adresseLigne1: donnees.adresseLigne1 || null,
        adresseLigne2: donnees.adresseLigne2 || null,
        codePostal: donnees.codePostal || null,
        ville: donnees.ville || null,
        pays: donnees.pays || null,
        siret: donnees.siret || null,
        numeroTva: donnees.numeroTva || null,
        telephone: donnees.telephone || null,
        iban: donnees.iban || null,
        bic: donnees.bic || null,
        mentionsLegales: donnees.mentionsLegales || null,
        tauxTva: donnees.tauxTva ?? undefined,
      },
      select: {
        id: true,
        email: true,
        nomAffiche: true,
        logoUrl: true,
        raisonSociale: true,
        adresseLigne1: true,
        adresseLigne2: true,
        codePostal: true,
        ville: true,
        pays: true,
        siret: true,
        numeroTva: true,
        telephone: true,
        iban: true,
        bic: true,
        mentionsLegales: true,
        tauxTva: true,
        compteurDevis: true,
        compteurFacture: true,
      },
    });

    return NextResponse.json(utilisateurMaj);
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
