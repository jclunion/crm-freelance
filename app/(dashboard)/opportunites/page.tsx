'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Loader2,
  Search,
  LayoutGrid,
  List,
  TrendingUp,
  Target,
  Trophy,
  Filter,
  ChevronDown,
  Columns,
  X,
} from 'lucide-react';
import { useOpportunites, useMettreAJourOpportunite, useClients } from '@/lib/hooks';
import { ModaleNouvelleOpportunite } from '@/components/opportunites/ModaleNouvelleOpportunite';
import { ModaleEditionOpportunite } from '@/components/opportunites/ModaleEditionOpportunite';
import { KanbanBoard } from '@/components/opportunites/KanbanBoard';
import { BoutonExportCSV } from '@/components/ui/BoutonExportCSV';
import { colonnesOpportunites } from '@/lib/export-csv';
import { formaterMontant, formaterDate } from '@/lib/utils';
import type { Opportunite } from '@/lib/api';

const etapesPipeline = [
  { id: 'lead', nom: 'Lead', couleur: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { id: 'qualifie', nom: 'Qualifié', couleur: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  { id: 'proposition_envoyee', nom: 'Proposition', couleur: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  { id: 'negociation', nom: 'Négociation', couleur: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  { id: 'gagne', nom: 'Gagné', couleur: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
];

type VueType = 'kanban' | 'liste';

// Configuration des colonnes affichables
interface ColonneConfig {
  id: string;
  label: string;
  visible: boolean;
  obligatoire?: boolean;
}

const colonnesParDefaut: ColonneConfig[] = [
  { id: 'titre', label: 'Opportunité', visible: true, obligatoire: true },
  { id: 'client', label: 'Client', visible: true },
  { id: 'etape', label: 'Étape', visible: true },
  { id: 'montant', label: 'Montant', visible: true },
  { id: 'probabilite', label: 'Probabilité', visible: true },
  { id: 'cloture', label: 'Clôture prévue', visible: true },
  { id: 'dateCreation', label: 'Date création', visible: false },
];

export default function PipelineOpportunites() {
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [modaleEditionOuverte, setModaleEditionOuverte] = useState(false);
  const [opportuniteSelectionnee, setOpportuniteSelectionnee] = useState<Opportunite | null>(null);
  const [recherche, setRecherche] = useState('');
  const [filtres, setFiltres] = useState<Record<string, string | number | undefined>>({});
  const [vue, setVue] = useState<VueType>('kanban');
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [colonnesOuvertes, setColonnesOuvertes] = useState(false);
  const [colonnes, setColonnes] = useState<ColonneConfig[]>(colonnesParDefaut);
  
  const { data: opportunites, isLoading, error } = useOpportunites();
  const { data: clients } = useClients({});
  const mettreAJourMutation = useMettreAJourOpportunite();

  // Filtrage des opportunités
  const opportunitesFiltrees = useMemo(() => {
    if (!opportunites) return [];
    
    return opportunites.filter((opp) => {
      // Recherche textuelle
      if (recherche) {
        const rechLower = recherche.toLowerCase();
        const matchTitre = opp.titre.toLowerCase().includes(rechLower);
        const matchClient = opp.client?.nom?.toLowerCase().includes(rechLower);
        if (!matchTitre && !matchClient) return false;
      }
      
      // Filtre par client
      if (filtres.clientId && opp.clientId !== filtres.clientId) return false;
      
      // Filtre par étape
      if (filtres.etape && opp.etapePipeline !== filtres.etape) return false;
      
      // Filtre par montant
      if (filtres.montantMin && (opp.montantEstime || 0) < (filtres.montantMin as number)) return false;
      if (filtres.montantMax && (opp.montantEstime || 0) > (filtres.montantMax as number)) return false;
      
      // Filtre par date de création
      if (filtres.dateCreationDebut) {
        const dateDebut = new Date(filtres.dateCreationDebut as string);
        const dateOpp = new Date(opp.dateCreation);
        if (dateOpp < dateDebut) return false;
      }
      if (filtres.dateCreationFin) {
        const dateFin = new Date(filtres.dateCreationFin as string);
        dateFin.setHours(23, 59, 59, 999);
        const dateOpp = new Date(opp.dateCreation);
        if (dateOpp > dateFin) return false;
      }
      
      // Filtre par date de clôture
      if (filtres.dateClotureDebut && opp.dateCloturePrevue) {
        const dateDebut = new Date(filtres.dateClotureDebut as string);
        const dateOpp = new Date(opp.dateCloturePrevue);
        if (dateOpp < dateDebut) return false;
      }
      if (filtres.dateClotureFin && opp.dateCloturePrevue) {
        const dateFin = new Date(filtres.dateClotureFin as string);
        dateFin.setHours(23, 59, 59, 999);
        const dateOpp = new Date(opp.dateCloturePrevue);
        if (dateOpp > dateFin) return false;
      }
      
      return true;
    });
  }, [opportunites, recherche, filtres]);

  const gererChangementFiltre = (id: string, valeur: string | number | undefined) => {
    setFiltres((prev) => ({ ...prev, [id]: valeur }));
  };

  const reinitialiserFiltres = () => {
    setFiltres({});
    setRecherche('');
  };

  // Gestion du changement d'étape (drag & drop)
  const changerEtape = async (oppId: string, nouvelleEtape: string) => {
    // On laisse l'erreur se propager pour que KanbanBoard puisse gérer le rollback et les toasts
    await mettreAJourMutation.mutateAsync({
      id: oppId,
      donnees: { etapePipeline: nouvelleEtape as 'lead' | 'qualifie' | 'proposition_envoyee' | 'negociation' | 'gagne' | 'perdu' },
    });
  };

  // Calcul des statistiques
  const stats = useMemo(() => {
    if (!opportunites) return { caTotal: 0, caPondere: 0, caGagne: 0, enCours: 0 };
    
    const caTotal = opportunites
      .filter((o) => o.etapePipeline !== 'perdu')
      .reduce((sum, o) => sum + (o.montantEstime || 0), 0);
    
    const caPondere = opportunites
      .filter((o) => !['gagne', 'perdu'].includes(o.etapePipeline))
      .reduce((sum, o) => sum + ((o.montantEstime || 0) * (o.probabilite || 0) / 100), 0);
    
    const caGagne = opportunites
      .filter((o) => o.etapePipeline === 'gagne')
      .reduce((sum, o) => sum + (o.montantEstime || 0), 0);
    
    const enCours = opportunites.filter((o) => !['gagne', 'perdu'].includes(o.etapePipeline)).length;
    
    return { caTotal, caPondere, caGagne, enCours };
  }, [opportunites]);

  // Nombre de filtres actifs
  const nombreFiltresActifs = Object.values(filtres).filter(Boolean).length;

  // Toggle colonne
  const toggleColonne = (id: string) => {
    setColonnes((prev) =>
      prev.map((col) =>
        col.id === id && !col.obligatoire ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Colonnes visibles
  const colonnesVisibles = colonnes.filter((col) => col.visible);

  // Ouvrir la modale d'édition
  const ouvrirEdition = (opp: Opportunite) => {
    setOpportuniteSelectionnee(opp);
    setModaleEditionOuverte(true);
  };

  const fermerEdition = () => {
    setModaleEditionOuverte(false);
    setOpportuniteSelectionnee(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        {/* Ligne 1 : Titre + Actions */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Pipeline</h1>
            <p className="text-sm text-[var(--muted)]">
              {opportunitesFiltrees.length} opportunité{opportunitesFiltrees.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <BoutonExportCSV
              donnees={opportunitesFiltrees.map((o) => ({
                ...o,
                clientNom: o.client?.nom || '',
                dateCreation: new Date(o.dateCreation).toLocaleDateString('fr-FR'),
                dateCloturePrevue: o.dateCloturePrevue
                  ? new Date(o.dateCloturePrevue).toLocaleDateString('fr-FR')
                  : '',
              }))}
              colonnes={colonnesOpportunites}
              nomFichier="opportunites"
            />
            <button
              onClick={() => setModaleOuverte(true)}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Nouvelle opportunité
            </button>
          </div>
        </div>

        {/* Ligne 2 : Statistiques */}
        <div className="flex gap-6 border-t border-[var(--border)] px-6 py-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">En cours</span>
            <span className="font-semibold">{stats.enCours}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">CA potentiel</span>
            <span className="font-semibold">{formaterMontant(stats.caTotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-sm text-[var(--muted)]">CA pondéré</span>
            <span className="font-semibold text-[var(--primary)]">{formaterMontant(stats.caPondere)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green-600" />
            <span className="text-sm text-[var(--muted)]">CA gagné</span>
            <span className="font-semibold text-green-600">{formaterMontant(stats.caGagne)}</span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          BARRE DISPLAY
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-3">
        {/* Gauche : Recherche + Filtres */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-64 rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          <button
            onClick={() => setFiltresOuverts(!filtresOuverts)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              filtresOuverts || nombreFiltresActifs > 0
                ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'border-[var(--border)] hover:bg-[var(--border)]'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {nombreFiltresActifs > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-xs text-[var(--primary-foreground)]">
                {nombreFiltresActifs}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${filtresOuverts ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Droite : Colonnes + Vue */}
        <div className="flex items-center gap-3">
          {/* Sélecteur de colonnes (uniquement en vue liste) */}
          {vue === 'liste' && (
            <div className="relative">
              <button
                onClick={() => setColonnesOuvertes(!colonnesOuvertes)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  colonnesOuvertes
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--border)] hover:bg-[var(--border)]'
                }`}
              >
                <Columns className="h-4 w-4" />
                Colonnes
                <ChevronDown className={`h-4 w-4 transition-transform ${colonnesOuvertes ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown colonnes */}
              {colonnesOuvertes && (
                <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 shadow-lg animate-slide-down">
                  <p className="mb-2 px-2 text-xs font-medium text-[var(--muted)]">Colonnes visibles</p>
                  {colonnes.map((col) => (
                    <label
                      key={col.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[var(--border)] ${
                        col.obligatoire ? 'opacity-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={col.visible}
                        disabled={col.obligatoire}
                        onChange={() => toggleColonne(col.id)}
                        className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Toggle Vue */}
          <div className="flex rounded-lg border border-[var(--border)] p-1">
            <button
              onClick={() => setVue('kanban')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                vue === 'kanban'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </button>
            <button
              onClick={() => setVue('liste')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                vue === 'liste'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <List className="h-4 w-4" />
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* Panneau de filtres (collapsible) */}
      {filtresOuverts && (
        <div className="animate-slide-down border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Filtre Client */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Client</label>
              <select
                value={(filtres.clientId as string) || ''}
                onChange={(e) => gererChangementFiltre('clientId', e.target.value || undefined)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="">Tous les clients</option>
                {(clients || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Filtre Étape */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Étape</label>
              <select
                value={(filtres.etape as string) || ''}
                onChange={(e) => gererChangementFiltre('etape', e.target.value || undefined)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="">Toutes les étapes</option>
                {etapesPipeline.map((e) => (
                  <option key={e.id} value={e.id}>{e.nom}</option>
                ))}
              </select>
            </div>

            {/* Filtre Montant min */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Montant min (€)</label>
              <input
                type="number"
                value={(filtres.montantMin as number) || ''}
                onChange={(e) => gererChangementFiltre('montantMin', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Filtre Montant max */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Montant max (€)</label>
              <input
                type="number"
                value={(filtres.montantMax as number) || ''}
                onChange={(e) => gererChangementFiltre('montantMax', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="∞"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Bouton réinitialiser */}
            {nombreFiltresActifs > 0 && (
              <button
                onClick={reinitialiserFiltres}
                className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENU
      ═══════════════════════════════════════════════════════════════════ */}
      {/* État de chargement */}
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="m-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Erreur lors du chargement des opportunités
        </div>
      )}

      {/* Vue Kanban */}
      {!isLoading && !error && vue === 'kanban' && (
        <div className="flex-1 overflow-x-auto p-6">
          <KanbanBoard
            etapes={etapesPipeline.map((e) => ({ ...e, couleur: `border-l-4 ${e.couleur.replace('bg-', 'border-').split(' ')[0]}` }))}
            opportunites={opportunitesFiltrees}
            onChangerEtape={changerEtape}
            onClickOpportunite={ouvrirEdition}
          />
        </div>
      )}

      {/* Vue Liste */}
      {!isLoading && !error && vue === 'liste' && (
        <div className="flex-1 overflow-y-auto p-6">
          {opportunitesFiltrees.length > 0 ? (
            <div className="rounded-lg border border-[var(--border)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                    {colonnesVisibles.map((col) => (
                      <th
                        key={col.id}
                        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] ${
                          col.id === 'montant' || col.id === 'probabilite' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {opportunitesFiltrees.map((opp) => {
                    const etape = etapesPipeline.find((e) => e.id === opp.etapePipeline);
                    return (
                      <tr key={opp.id} className="transition-colors hover:bg-[var(--card)]">
                        {colonnesVisibles.map((col) => (
                          <td
                            key={col.id}
                            className={`px-4 py-3 ${col.id === 'montant' || col.id === 'probabilite' ? 'text-right' : ''}`}
                          >
                            {col.id === 'titre' && (
                              <button
                                onClick={() => ouvrirEdition(opp)}
                                className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
                              >
                                {opp.titre}
                              </button>
                            )}
                            {col.id === 'client' && (
                              opp.client ? (
                                <Link href={`/clients/${opp.clientId}`} className="text-[var(--primary)] hover:underline">
                                  {opp.client.nom}
                                </Link>
                              ) : (
                                <span className="text-[var(--muted)]">—</span>
                              )
                            )}
                            {col.id === 'etape' && (
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${etape?.couleur || ''}`}>
                                {etape?.nom || opp.etapePipeline}
                              </span>
                            )}
                            {col.id === 'montant' && (
                              <span className="font-medium">{formaterMontant(opp.montantEstime || 0)}</span>
                            )}
                            {col.id === 'probabilite' && (
                              <span className="text-[var(--muted)]">{opp.probabilite || 0}%</span>
                            )}
                            {col.id === 'cloture' && (
                              <span className="text-sm text-[var(--muted)]">
                                {opp.dateCloturePrevue ? formaterDate(opp.dateCloturePrevue) : '—'}
                              </span>
                            )}
                            {col.id === 'dateCreation' && (
                              <span className="text-sm text-[var(--muted)]">{formaterDate(opp.dateCreation)}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-[var(--muted)]" />
              <p className="mt-4 text-[var(--muted)]">Aucune opportunité</p>
              <button
                onClick={() => setModaleOuverte(true)}
                className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
              >
                <Plus className="h-4 w-4" />
                Créer une opportunité
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fermer dropdown colonnes si clic ailleurs */}
      {colonnesOuvertes && (
        <div className="fixed inset-0 z-10" onClick={() => setColonnesOuvertes(false)} />
      )}

      {/* Modale de création */}
      <ModaleNouvelleOpportunite
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
      />

      {/* Modale d'édition */}
      <ModaleEditionOpportunite
        ouverte={modaleEditionOuverte}
        onFermer={fermerEdition}
        opportunite={opportuniteSelectionnee}
      />
    </div>
  );
}
