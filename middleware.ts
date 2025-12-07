import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Routes publiques (pas besoin d'authentification)
  const routesPubliques = [
    '/auth',
    '/api/auth',
    '/api/portail',
    '/api/webhooks',
    '/portail',
  ];

  const estRoutePublique = routesPubliques.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if (estRoutePublique) {
    return NextResponse.next();
  }

  // Rediriger vers la connexion si non authentifié
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/connexion', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protéger toutes les routes sauf les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
