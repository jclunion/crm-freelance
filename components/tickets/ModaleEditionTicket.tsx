'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { useMettreAJourTicket, useSupprimerTicket, useClients } from '@/lib/hooks';
import type { Ticket } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface ModaleEditionTicketProps {
  ouverte: boolean;
  onFermer: () => void;
  ticket: Ticket | null;
}

export function ModaleEditionTicket({
  ouverte,
  onFermer,
  ticket,
}: ModaleEditionTicketProps) {
  const { data: clients } = useClients({});
  const [clientId, setClientId] = useState('');
  const [sujet, setSujet] = useState('');
  const [description, setDescription] = useState('');
  const [typeTicket, setTypeTicket] = useState<'bug' | 'question' | 'demande_evolution'>('question');
  const [priorite, setPriorite] = useState<'basse' | 'normale' | 'haute'>('normale');
  const [statutTicket, setStatutTicket] = useState<'nouveau' | 'en_cours' | 'resolu'>('nouveau');
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);

  const mettreAJourMutation = useMettreAJourTicket();
  const supprimerMutation = useSupprimerTicket();
  const toast = useToast();

  // Initialiser le formulaire avec les données du ticket
  useEffect(() => {
    if (ticket) {
      setClientId(ticket.clientId);
      setSujet(ticket.sujet);
      setDescription(ticket.description);
      setTypeTicket(ticket.typeTicket as typeof typeTicket);
      setPriorite(ticket.priorite as typeof priorite);
      setStatutTicket(ticket.statutTicket as typeof statutTicket);
      setConfirmationSuppression(false);
    }
  }, [ticket]);

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    try {
      await mettreAJourMutation.mutateAsync({
        id: ticket.id,
        donnees: {
          sujet,
          description,
          typeTicket,
          priorite,
          statutTicket,
        },
      });
      toast.success('Ticket modifié', `${sujet} a été mis à jour`);
      onFermer();
    } catch (erreur) {
      console.error('Erreur mise à jour ticket:', erreur);
      toast.error('Erreur', 'Impossible de modifier le ticket');
    }
  };

  const gererSuppression = async () => {
    if (!ticket) return;

    try {
      await supprimerMutation.mutateAsync(ticket.id);
      toast.success('Ticket supprimé', `${sujet} a été supprimé`);
      onFermer();
    } catch (erreur) {
      console.error('Erreur suppression ticket:', erreur);
      toast.error('Erreur', 'Impossible de supprimer le ticket');
    }
  };

  if (!ouverte || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="modal-overlay absolute inset-0 bg-black/50" onClick={onFermer} />

      {/* Modale */}
      <div className="modal-content relative z-10 w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold">Modifier le ticket</h2>
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
            {/* Client (non modifiable) */}
            <div>
              <label className="mb-1 block text-sm font-medium">Client</label>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)]">
                {clients?.find((c) => c.id === clientId)?.nom || ticket.client?.nom || 'Client inconnu'}
              </div>
            </div>

            {/* Sujet */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Sujet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Type et Priorité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select
                  value={typeTicket}
                  onChange={(e) => setTypeTicket(e.target.value as typeof typeTicket)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="bug">Bug</option>
                  <option value="question">Question</option>
                  <option value="demande_evolution">Demande d'évolution</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Priorité</label>
                <select
                  value={priorite}
                  onChange={(e) => setPriorite(e.target.value as typeof priorite)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                </select>
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="mb-1 block text-sm font-medium">Statut</label>
              <select
                value={statutTicket}
                onChange={(e) => setStatutTicket(e.target.value as typeof statutTicket)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="nouveau">Nouveau</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
              </select>
            </div>
          </div>

          {/* Erreur */}
          {(mettreAJourMutation.error || supprimerMutation.error) && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              Erreur lors de l'opération
            </div>
          )}

          {/* Zone de suppression */}
          <div className="mt-6 border-t border-[var(--border)] pt-4">
            {!confirmationSuppression ? (
              <button
                type="button"
                onClick={() => setConfirmationSuppression(true)}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer ce ticket
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600 dark:text-red-400">Confirmer la suppression ?</span>
                <button
                  type="button"
                  onClick={gererSuppression}
                  disabled={supprimerMutation.isPending}
                  className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {supprimerMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Oui, supprimer
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmationSuppression(false)}
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

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
              disabled={mettreAJourMutation.isPending || !sujet || !description}
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
