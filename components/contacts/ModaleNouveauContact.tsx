'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreerContact } from '@/lib/hooks';

interface ModaleNouveauContactProps {
  ouverte: boolean;
  onFermer: () => void;
  clientId: string;
}

export function ModaleNouveauContact({
  ouverte,
  onFermer,
  clientId,
}: ModaleNouveauContactProps) {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [role, setRole] = useState('');

  const creerContactMutation = useCreerContact();

  const reinitialiserFormulaire = () => {
    setPrenom('');
    setNom('');
    setEmail('');
    setTelephone('');
    setRole('');
  };

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await creerContactMutation.mutateAsync({
        clientId,
        prenom,
        nom,
        email,
        telephone: telephone || undefined,
        role: role || undefined,
      });

      reinitialiserFormulaire();
      onFermer();
    } catch (erreur) {
      console.error('Erreur création contact:', erreur);
    }
  };

  if (!ouverte) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onFermer} />

      {/* Modale */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold">Nouveau contact</h2>
          <button
            onClick={onFermer}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={gererSoumission} className="p-6">
          <div className="space-y-4">
            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                  placeholder="Dupont"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                placeholder="jean.dupont@exemple.com"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="mb-1 block text-sm font-medium">Téléphone</label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            {/* Rôle */}
            <div>
              <label className="mb-1 block text-sm font-medium">Rôle / Fonction</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                placeholder="CEO, CTO, Chef de projet..."
              />
            </div>
          </div>

          {/* Erreur */}
          {creerContactMutation.error && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              Erreur lors de la création du contact
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onFermer}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={creerContactMutation.isPending || !prenom || !nom || !email}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {creerContactMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
