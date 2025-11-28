import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Logique personnalisée si nécessaire
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Autoriser l'accès aux pages d'auth sans token
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true;
        }
        // Autoriser l'accès aux API publiques
        if (req.nextUrl.pathname.startsWith('/api/auth')) {
          return true;
        }
        // Pour toutes les autres routes, un token est requis
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protéger toutes les routes sauf les fichiers statiques et les pages d'auth
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
};
