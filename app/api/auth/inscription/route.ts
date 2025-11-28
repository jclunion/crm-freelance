import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const inscriptionSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  nomAffiche: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const donnees = inscriptionSchema.parse(body);

    // Vérifier si l'email existe déjà
    const utilisateurExistant = await prisma.user.findUnique({
      where: { email: donnees.email },
    });

    if (utilisateurExistant) {
      return NextResponse.json(
        { erreur: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const motDePasseHash = await bcrypt.hash(donnees.motDePasse, 12);

    // Créer l'utilisateur
    const utilisateur = await prisma.user.create({
      data: {
        email: donnees.email,
        motDePasse: motDePasseHash,
        nomAffiche: donnees.nomAffiche,
        role: 'freelance_solo',
      },
      select: {
        id: true,
        email: true,
        nomAffiche: true,
        role: true,
      },
    });

    return NextResponse.json(
      { message: 'Compte créé avec succès', utilisateur },
      { status: 201 }
    );
  } catch (erreur) {
    console.error('Erreur inscription:', erreur);

    if (erreur instanceof z.ZodError) {
      return NextResponse.json(
        { erreur: 'Données invalides', details: erreur.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { erreur: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
