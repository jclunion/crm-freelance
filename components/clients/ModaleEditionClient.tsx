'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useMettreAJourClient } from '@/lib/hooks';
import { useToast } from '@/components/ui/Toast';
import type { ClientComplet } from '@/lib/api';

interface ModaleEditionClientProps {
  ouverte: boolean;
  onFermer: () => void;
  client: ClientComplet;
}

export function ModaleEditionClient({
  ouverte,
  onFermer,
  client,
}: ModaleEditionClientProps) {
  const [nom, setNom] = useState(client.nom);
  const [typeClient, setTypeClient] = useState(client.typeClient);
  const [emailPrincipal, setEmailPrincipal] = useState(client.emailPrincipal || '');
  const [telephonePrincipal, setTelephonePrincipal] = useState(client.telephonePrincipal || '');
  const [statutClient, setStatutClient] = useState(client.statutClient);
  const [noteInterne, setNoteInterne] = useState(client.noteInterne || '');

  const mettreAJourMutation = useMettreAJourClient();
  const toast = useToast();

  // Synchroniser les valeurs quand le client change
  useEffect(() => {
    setNom(client.nom);
    setTypeClient(client.typeClient);
    setEmailPrincipal(client.emailPrincipal || '');
    setTelephonePrincipal(client.telephonePrincipal || '');
    setStatutClient(client.statutClient);
    setNoteInterne(client.noteInterne || '');
  }, [client]);

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await mettreAJourMutation.mutateAsync({
        id: client.id,
        donnees: {
          nom,
          typeClient: typeClient as 'freelance' | 'agence' | 'entreprise' | 'particulier',
          emailPrincipal: emailPrincipal || undefined,
          telephonePrincipal: telephonePrincipal || undefined,
          statutClient: statutClient as 'prospect' | 'client',
          noteInterne: noteInterne || undefined,
        },
      });

      toast.success('Client modifié', `${nom} a été mis à jour`);
      onFermer();
    } catch (erreur) {
      console.error('Erreur mise à jour client:', erreur);
      toast.error('Erreur', 'Impossible de modifier le client');
    }
  };

  if (!ouverte) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="modal-overlay absolute inset-0 bg-black/50" onClick={onFermer} />

      {/* Modale */}
      <div className="modal-content relative z-10 w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold">Modifier le client</h2>
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
              />
            </div>

            {/* Type et Statut */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select
                  value={typeClient}
                  onChange={(e) => setTypeClient(e.target.value)}
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
                  onChange={(e) => setStatutClient(e.target.value)}
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
              />
            </div>
          </div>

          {/* Erreur */}
          {mettreAJourMutation.error && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              Erreur lors de la mise à jour
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
              disabled={mettreAJourMutation.isPending || !nom}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {mettreAJourMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
