'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreerClient } from '@/lib/hooks';

interface ModaleNouveauClientProps {
  ouverte: boolean;
  onFermer: () => void;
}

export function ModaleNouveauClient({ ouverte, onFermer }: ModaleNouveauClientProps) {
  const [nom, setNom] = useState('');
  const [typeClient, setTypeClient] = useState<'freelance' | 'agence' | 'entreprise' | 'particulier'>('entreprise');
  const [emailPrincipal, setEmailPrincipal] = useState('');
  const [telephonePrincipal, setTelephonePrincipal] = useState('');
  const [statutClient, setStatutClient] = useState<'prospect' | 'client'>('prospect');
  const [noteInterne, setNoteInterne] = useState('');

  const creerClientMutation = useCreerClient();

  const reinitialiserFormulaire = () => {
    setNom('');
    setTypeClient('entreprise');
    setEmailPrincipal('');
    setTelephonePrincipal('');
    setStatutClient('prospect');
    setNoteInterne('');
  };

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await creerClientMutation.mutateAsync({
        nom,
        typeClient,
        emailPrincipal: emailPrincipal || undefined,
        telephonePrincipal: telephonePrincipal || undefined,
        statutClient,
        noteInterne: noteInterne || undefined,
      });

      reinitialiserFormulaire();
      onFermer();
    } catch (erreur) {
      console.error('Erreur création client:', erreur);
    }
  };

  if (!ouverte) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onFermer}
      />

      {/* Modale */}
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold">Nouveau client</h2>
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
            {/* Nom */}
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
                placeholder="Nom du client ou de l'entreprise"
              />
            </div>

            {/* Type et Statut */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select
                  value={typeClient}
                  onChange={(e) => setTypeClient(e.target.value as typeof typeClient)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="freelance">Freelance</option>
                  <option value="agence">Agence</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="particulier">Particulier</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Statut</label>
                <select
                  value={statutClient}
                  onChange={(e) => setStatutClient(e.target.value as typeof statutClient)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="prospect">Prospect</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={emailPrincipal}
                onChange={(e) => setEmailPrincipal(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                placeholder="email@exemple.com"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="mb-1 block text-sm font-medium">Téléphone</label>
              <input
                type="tel"
                value={telephonePrincipal}
                onChange={(e) => setTelephonePrincipal(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            {/* Note interne */}
            <div>
              <label className="mb-1 block text-sm font-medium">Note interne</label>
              <textarea
                value={noteInterne}
                onChange={(e) => setNoteInterne(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                placeholder="Notes privées sur ce client..."
              />
            </div>
          </div>

          {/* Erreur */}
          {creerClientMutation.error && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              Erreur lors de la création du client
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
              disabled={creerClientMutation.isPending || !nom}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {creerClientMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Créer le client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
