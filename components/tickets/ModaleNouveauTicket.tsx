'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreerTicket } from '@/lib/hooks';
import { recupererClients, type ClientAvecStats } from '@/lib/api';

interface ModaleNouveauTicketProps {
  ouverte: boolean;
  onFermer: () => void;
  clientIdPreselectionne?: string;
}

export function ModaleNouveauTicket({
  ouverte,
  onFermer,
  clientIdPreselectionne,
}: ModaleNouveauTicketProps) {
  const [clients, setClients] = useState<ClientAvecStats[]>([]);
  const [clientId, setClientId] = useState(clientIdPreselectionne || '');
  const [sujet, setSujet] = useState('');
  const [description, setDescription] = useState('');
  const [typeTicket, setTypeTicket] = useState<'bug' | 'question' | 'demande_evolution'>('question');
  const [priorite, setPriorite] = useState<'basse' | 'normale' | 'haute'>('normale');

  const creerTicketMutation = useCreerTicket();

  // Charger les clients au montage
  useEffect(() => {
    if (ouverte) {
      recupererClients().then(setClients).catch(console.error);
    }
  }, [ouverte]);

  // Mettre à jour clientId si préselectionné
  useEffect(() => {
    if (clientIdPreselectionne) {
      setClientId(clientIdPreselectionne);
    }
  }, [clientIdPreselectionne]);

  const reinitialiserFormulaire = () => {
    setClientId(clientIdPreselectionne || '');
    setSujet('');
    setDescription('');
    setTypeTicket('question');
    setPriorite('normale');
  };

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await creerTicketMutation.mutateAsync({
        clientId,
        sujet,
        description,
        typeTicket,
        priorite,
      });

      reinitialiserFormulaire();
      onFermer();
    } catch (erreur) {
      console.error('Erreur création ticket:', erreur);
    }
  };

  if (!ouverte) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onFermer} />

      {/* Modale */}
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold">Nouveau ticket</h2>
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
            {/* Client */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom}
                  </option>
                ))}
              </select>
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
                placeholder="Ex: Bug sur la page d'accueil"
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
                placeholder="Décrivez le problème ou la demande en détail..."
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
          </div>

          {/* Erreur */}
          {creerTicketMutation.error && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              Erreur lors de la création du ticket
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
              disabled={creerTicketMutation.isPending || !clientId || !sujet || !description}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {creerTicketMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Créer le ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
