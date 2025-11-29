'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreerOpportunite } from '@/lib/hooks';
import { recupererClients, type ClientAvecStats } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface ModaleNouvelleOpportuniteProps {
  ouverte: boolean;
  onFermer: () => void;
  clientIdPreselectionne?: string;
}

export function ModaleNouvelleOpportunite({
  ouverte,
  onFermer,
  clientIdPreselectionne,
}: ModaleNouvelleOpportuniteProps) {
  const [clients, setClients] = useState<ClientAvecStats[]>([]);
  const [clientId, setClientId] = useState(clientIdPreselectionne || '');
  const [titre, setTitre] = useState('');
  const [descriptionCourte, setDescriptionCourte] = useState('');
  const [montantEstime, setMontantEstime] = useState('');
  const [etapePipeline, setEtapePipeline] = useState<'lead' | 'qualifie' | 'proposition_envoyee' | 'negociation'>('lead');

  const creerOpportuniteMutation = useCreerOpportunite();
  const toast = useToast();

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
    setTitre('');
    setDescriptionCourte('');
    setMontantEstime('');
    setEtapePipeline('lead');
  };

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await creerOpportuniteMutation.mutateAsync({
        clientId,
        titre,
        descriptionCourte: descriptionCourte || undefined,
        montantEstime: montantEstime ? parseFloat(montantEstime) : undefined,
        etapePipeline,
      });

      toast.success('Opportunité créée', `${titre} a été ajoutée au pipeline`);
      reinitialiserFormulaire();
      onFermer();
    } catch (erreur) {
      console.error('Erreur création opportunité:', erreur);
      toast.error('Erreur', 'Impossible de créer l\'opportunité');
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
          <h2 className="text-lg font-semibold">Nouvelle opportunité</h2>
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
              {clients.length === 0 && (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Aucun client disponible. Créez d'abord un client.
                </p>
              )}
            </div>

            {/* Titre */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                placeholder="Ex: Refonte site vitrine"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={descriptionCourte}
                onChange={(e) => setDescriptionCourte(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                placeholder="Brève description de l'opportunité..."
              />
            </div>

            {/* Montant et Étape */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Montant estimé (€)</label>
                <input
                  type="number"
                  value={montantEstime}
                  onChange={(e) => setMontantEstime(e.target.value)}
                  min="0"
                  step="100"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Étape</label>
                <select
                  value={etapePipeline}
                  onChange={(e) => setEtapePipeline(e.target.value as typeof etapePipeline)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="lead">Lead</option>
                  <option value="qualifie">Qualifié</option>
                  <option value="proposition_envoyee">Proposition envoyée</option>
                  <option value="negociation">Négociation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Erreur */}
          {creerOpportuniteMutation.error && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              Erreur lors de la création de l'opportunité
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
              disabled={creerOpportuniteMutation.isPending || !clientId || !titre}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {creerOpportuniteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Créer l'opportunité
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
