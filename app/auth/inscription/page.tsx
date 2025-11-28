'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User } from 'lucide-react';

export default function PageInscription() {
  const router = useRouter();

  const [nomAffiche, setNomAffiche] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    // Validation
    if (motDePasse !== confirmationMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }

    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setChargement(true);

    try {
      const reponse = await fetch('/api/auth/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse, nomAffiche }),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        setErreur(donnees.erreur || "Erreur lors de l'inscription");
        return;
      }

      // Rediriger vers la page de connexion
      router.push('/auth/connexion?inscription=succes');
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
          <p className="mt-2 text-[var(--muted)]">Créez votre compte</p>
        </div>

        {/* Formulaire */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 shadow-lg">
          <form onSubmit={gererSoumission} className="space-y-4">
            {/* Nom */}
            <div>
              <label className="mb-1 block text-sm font-medium">Nom affiché</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  value={nomAffiche}
                  onChange={(e) => setNomAffiche(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm focus:border-[var(--primary)] focus:outline-none"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

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
              <p className="mt-1 text-xs text-[var(--muted)]">Minimum 8 caractères</p>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="mb-1 block text-sm font-medium">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="password"
                  value={confirmationMotDePasse}
                  onChange={(e) => setConfirmationMotDePasse(e.target.value)}
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
              Créer mon compte
            </button>
          </form>

          {/* Lien connexion */}
          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--muted)]">Déjà un compte ? </span>
            <Link
              href="/auth/connexion"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
