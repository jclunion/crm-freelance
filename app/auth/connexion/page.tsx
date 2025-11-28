'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function PageConnexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const erreurParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(erreurParam ? 'Identifiants invalides' : '');
  const [chargement, setChargement] = useState(false);

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const resultat = await signIn('credentials', {
        email,
        motDePasse,
        redirect: false,
      });

      if (resultat?.error) {
        setErreur('Email ou mot de passe incorrect');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErreur('Une erreur est survenue');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        {/* Logo / Titre */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--primary)]">CRM Freelance</h1>
          <p className="mt-2 text-[var(--muted)]">Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 shadow-lg">
          <form onSubmit={gererSoumission} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm focus:border-[var(--primary)] focus:outline-none"
                  placeholder="email@exemple.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="mb-1 block text-sm font-medium">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm focus:border-[var(--primary)] focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Erreur */}
            {erreur && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {erreur}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={chargement}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {chargement && <Loader2 className="h-4 w-4 animate-spin" />}
              Se connecter
            </button>
          </form>

          {/* Lien inscription */}
          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--muted)]">Pas encore de compte ? </span>
            <Link
              href="/auth/inscription"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
