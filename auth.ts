import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
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
          where: { email: credentials.email as string },
        });

        if (!utilisateur || !utilisateur.motDePasse) {
          throw new Error('Identifiants invalides');
        }

        const motDePasseValide = await bcrypt.compare(
          credentials.motDePasse as string,
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
  trustHost: true,
});
