import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  // Désactiver l'adapter pendant le build
  //adapter: process.env.SKIP_ENV_VALIDATION ? undefined : PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    CredentialsProvider({
      name: 'Identifiants',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@exemple.com' },
        motDePasse: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.motDePasse) {
          throw new Error('Email et mot de passe requis');
        }

        const utilisateur = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!utilisateur || !utilisateur.motDePasse) {
          throw new Error('Identifiants invalides');
        }

        const motDePasseValide = await bcrypt.compare(
          credentials.motDePasse,
          utilisateur.motDePasse
        );

        if (!motDePasseValide) {
          throw new Error('Identifiants invalides');
        }

        return {
          id: utilisateur.id,
          email: utilisateur.email,
          name: utilisateur.nomAffiche,
          image: utilisateur.image,
          role: utilisateur.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/connexion',
    error: '/auth/erreur',
  },
  secret: process.env.NEXTAUTH_SECRET,
};