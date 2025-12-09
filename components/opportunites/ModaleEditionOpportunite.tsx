'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Trash2, CreditCard, ExternalLink, Copy, Check, FileText, Download } from 'lucide-react';
import { useMettreAJourOpportunite, useSupprimerOpportunite, useOpportunites } from '@/lib/hooks';
import { recupererClients, genererLienPaiement, type ClientAvecStats, type Opportunite } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { GestionDocuments } from './GestionDocuments';

interface ModaleEditionOpportuniteProps {
  ouverte: boolean;
  onFermer: () => void;
  opportunite: Opportunite | null;
}

type EtapePipeline = 'lead' | 'qualifie' | 'proposition_envoyee' | 'negociation' | 'gagne' | 'perdu';

export function ModaleEditionOpportunite({
  ouverte,
  onFermer,
  opportunite,
}: ModaleEditionOpportuniteProps) {
  const [clients, setClients] = useState<ClientAvecStats[]>([]);
  const [clientId, setClientId] = useState('');
  const [titre, setTitre] = useState('');
  const [descriptionCourte, setDescriptionCourte] = useState('');
  const [montantEstime, setMontantEstime] = useState('');
  const [probabilite, setProbabilite] = useState('');
  const [etapePipeline, setEtapePipeline] = useState<EtapePipeline>('lead');
  const [dateCloturePrevue, setDateCloturePrevue] = useState('');

  const mettreAJourMutation = useMettreAJourOpportunite();
  const supprimerMutation = useSupprimerOpportunite();
  const { refetch: refetchOpportunites } = useOpportunites();
  const toast = useToast();

  // État pour le paiement
  const [generationPaiementEnCours, setGenerationPaiementEnCours] = useState(false);
  const [lienCopie, setLienCopie] = useState(false);

  // Charger les clients au montage
  useEffect(() => {
    if (ouverte) {
      recupererClients().then(setClients).catch(console.error);
    }
  }, [ouverte]);

  // Remplir le formulaire avec les données de l'opportunité
  useEffect(() => {
    if (opportunite) {
      setClientId(opportunite.clientId);
      setTitre(opportunite.titre);
      setDescriptionCourte(opportunite.descriptionCourte || '');
      setMontantEstime(opportunite.montantEstime?.toString() || '');
      setProbabilite(opportunite.probabilite?.toString() || '');
      setEtapePipeline(opportunite.etapePipeline as EtapePipeline);
      setDateCloturePrevue(
        opportunite.dateCloturePrevue
          ? new Date(opportunite.dateCloturePrevue).toISOString().split('T')[0]
          : ''
      );
    }
  }, [opportunite]);

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunite) return;

    try {
      await mettreAJourMutation.mutateAsync({
        id: opportunite.id,
        donnees: {
          titre,
          descriptionCourte: descriptionCourte || undefined,
          montantEstime: montantEstime ? parseFloat(montantEstime) : undefined,
          probabilite: probabilite ? parseInt(probabilite) : undefined,
          etapePipeline,
          dateCloturePrevue: dateCloturePrevue || undefined,
        },
      });
      toast.success('Opportunité modifiée', `${titre} a été mise à jour`);
      onFermer();
    } catch (erreur) {
      console.error('Erreur mise à jour opportunité:', erreur);
      toast.error('Erreur', 'Impossible de modifier l\'opportunité');
    }
  };

  const gererSuppression = async () => {
    if (!opportunite) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette opportunité ?')) return;

    try {
      await supprimerMutation.mutateAsync(opportunite.id);
      toast.success('Opportunité supprimée', `${titre} a été retirée du pipeline`);
      onFermer();
    } catch (erreur) {
      console.error('Erreur suppression opportunité:', erreur);
      toast.error('Erreur', 'Impossible de supprimer l\'opportunité');
    }
  };

  // Générer un lien de paiement Stripe
  const gererGenerationPaiement = async () => {
    if (!opportunite) return;

    setGenerationPaiementEnCours(true);
    try {
      const resultat = await genererLienPaiement(opportunite.id);
      toast.success('Lien de paiement créé', 'Redirection vers Stripe...');
      // Fermer la modale et rediriger dans le même onglet
      onFermer();
      window.location.href = resultat.urlPaiement;
    } catch (erreur) {
      console.error('Erreur génération paiement:', erreur);
      toast.error('Erreur', erreur instanceof Error ? erreur.message : 'Impossible de générer le lien de paiement');
      setGenerationPaiementEnCours(false);
    }
  };

  // Copier le lien de paiement
  const copierLienPaiement = async () => {
    if (!opportunite?.urlPaiement) return;

    try {
      await navigator.clipboard.writeText(opportunite.urlPaiement);
      setLienCopie(true);
      toast.success('Lien copié', 'Le lien de paiement a été copié dans le presse-papier');
      setTimeout(() => setLienCopie(false), 2000);
    } catch (erreur) {
      toast.error('Erreur', 'Impossible de copier le lien');
    }
  };

  // Vérifier si on peut générer un paiement
  const peutGenererPaiement = opportunite?.etapePipeline === 'gagne' 
    && opportunite?.montantEstime 
    && opportunite?.montantEstime > 0
    && opportunite?.statutPaiement !== 'paye';

  if (!ouverte || !opportunite) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="modal-overlay absolute inset-0 bg-black/50" onClick={onFermer} />

      {/* Modale */}
      <div className="modal-content relative z-10 w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold">Modifier l'opportunité</h2>
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
                {clients.find((c) => c.id === clientId)?.nom || 'Client inconnu'}
              </div>
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

            {/* Montant et Probabilité */}
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
                <label className="mb-1 block text-sm font-medium">Probabilité (%)</label>
                <input
                  type="number"
                  value={probabilite}
                  onChange={(e) => setProbabilite(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                  placeholder="50"
                />
              </div>
            </div>

            {/* Étape et Date de clôture */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Étape</label>
                <select
                  value={etapePipeline}
                  onChange={(e) => setEtapePipeline(e.target.value as EtapePipeline)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="lead">Lead</option>
                  <option value="qualifie">Qualifié</option>
                  <option value="proposition_envoyee">Proposition envoyée</option>
                  <option value="negociation">Négociation</option>
                  <option value="gagne">Gagné</option>
                  <option value="perdu">Perdu</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Date de clôture prévue</label>
                <input
                  type="date"
                  value={dateCloturePrevue}
                  onChange={(e) => setDateCloturePrevue(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>

            {/* Section Paiement Stripe */}
            {etapePipeline === 'gagne' && (
              <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[var(--muted)]" />
                    <span className="font-medium">Paiement</span>
                  </div>
                  {/* Badge statut paiement */}
                  {opportunite.statutPaiement === 'paye' ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Payé
                    </span>
                  ) : opportunite.urlPaiement ? (
                    <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      En attente
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Non généré
                    </span>
                  )}
                </div>

                {/* Lien de paiement existant */}
                {opportunite.urlPaiement && opportunite.statutPaiement !== 'paye' && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={opportunite.urlPaiement}
                      readOnly
                      className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs text-[var(--muted)]"
                    />
                    <button
                      type="button"
                      onClick={copierLienPaiement}
                      className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                      title="Copier le lien"
                    >
                      {lienCopie ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <a
                      href={opportunite.urlPaiement}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                      title="Ouvrir le lien"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {/* Bouton générer paiement */}
                {peutGenererPaiement && !opportunite.urlPaiement && (
                  <button
                    type="button"
                    onClick={gererGenerationPaiement}
                    disabled={generationPaiementEnCours}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
                  >
                    {generationPaiementEnCours ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    Générer lien de paiement
                  </button>
                )}

                {/* Message si déjà payé */}
                {opportunite.statutPaiement === 'paye' && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✓ Cette opportunité a été payée
                  </p>
                )}

                {/* Message si pas de montant */}
                {etapePipeline === 'gagne' && (!montantEstime || parseFloat(montantEstime) <= 0) && (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Renseignez un montant estimé pour générer un lien de paiement.
                  </p>
                )}
              </div>
            )}

            {/* Section Génération PDF */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-[var(--muted)]" />
                <span className="font-medium">Générer un document</span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/api/opportunites/${opportunite.id}/pdf?type=devis`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
                >
                  <Download className="h-4 w-4" />
                  Devis PDF
                </a>
                {/* Facture disponible uniquement si gagné ET payé */}
                {opportunite.etapePipeline === 'gagne' && opportunite.statutPaiement === 'paye' ? (
                  <a
                    href={`/api/opportunites/${opportunite.id}/pdf?type=facture`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
                  >
                    <Download className="h-4 w-4" />
                    Facture PDF
                  </a>
                ) : (
                  <span
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted)] cursor-not-allowed opacity-50"
                    title="La facture est disponible uniquement pour les opportunités gagnées et payées"
                  >
                    <Download className="h-4 w-4" />
                    Facture PDF
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Les documents générés sont automatiquement sauvegardés dans les documents de l'opportunité.
                {opportunite.etapePipeline !== 'gagne' || opportunite.statutPaiement !== 'paye' ? (
                  <span className="block mt-1">La facture est disponible après paiement.</span>
                ) : null}
              </p>
            </div>

            {/* Section Documents */}
            <GestionDocuments key={opportunite.id} opportuniteId={opportunite.id} />
          </div>

          {/* Erreur */}
          {(mettreAJourMutation.error || supprimerMutation.error) && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              Erreur lors de la mise à jour de l'opportunité
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={gererSuppression}
              disabled={supprimerMutation.isPending}
              className="flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              {supprimerMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Supprimer
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onFermer}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={mettreAJourMutation.isPending || !clientId || !titre}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {mettreAJourMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
