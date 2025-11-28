'use client';

import { useState, useMemo } from 'react';
import { Plus, Loader2, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useOpportunites, useMettreAJourOpportunite, useClients } from '@/lib/hooks';
import { ModaleNouvelleOpportunite } from '@/components/opportunites/ModaleNouvelleOpportunite';
import { PanneauFiltres } from '@/components/filtres/PanneauFiltres';
import { KanbanBoard } from '@/components/opportunites/KanbanBoard';
import { BoutonExportCSV } from '@/components/ui/BoutonExportCSV';
import { colonnesOpportunites } from '@/lib/export-csv';

const etapesPipeline = [
  { id: 'lead', nom: 'Lead', couleur: 'border-gray-300' },
  { id: 'qualifie', nom: 'Qualifié', couleur: 'border-blue-400' },
  { id: 'proposition_envoyee', nom: 'Proposition', couleur: 'border-purple-400' },
  { id: 'negociation', nom: 'Négociation', couleur: 'border-orange-400' },
  { id: 'gagne', nom: 'Gagné', couleur: 'border-green-400' },
];

export default function PipelineOpportunites() {
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [filtres, setFiltres] = useState<Record<string, string | number | undefined>>({});
  
  const { data: opportunites, isLoading, error } = useOpportunites();
  const { data: clients } = useClients({});
  const mettreAJourMutation = useMettreAJourOpportunite();

  // Configuration des filtres
  const configFiltres = useMemo(() => [
    {
      id: 'clientId',
      label: 'Client',
      type: 'select' as const,
      options: (clients || []).map((c) => ({ valeur: c.id, label: c.nom })),
    },
    {
      id: 'montant',
      label: 'Montant (€)',
      type: 'numberRange' as const,
      min: 0,
    },
    {
      id: 'dateCreation',
      label: 'Date de création',
      type: 'dateRange' as const,
    },
    {
      id: 'dateCloture',
      label: 'Date de clôture prévue',
      type: 'dateRange' as const,
    },
  ], [clients]);

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
    try {
      await mettreAJourMutation.mutateAsync({
        id: oppId,
        donnees: { etapePipeline: nouvelleEtape as 'lead' | 'qualifie' | 'proposition_envoyee' | 'negociation' | 'gagne' | 'perdu' },
      });
    } catch (erreur) {
      console.error('Erreur changement étape:', erreur);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        titre="Opportunités"
        description="Pipeline de vos missions potentielles"
      >
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
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nouvelle opportunité
        </button>
      </PageHeader>

      {/* Barre de recherche et filtres */}
      <div className="px-6 pt-6">
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Rechercher une opportunité..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        </div>
        <PanneauFiltres
          filtres={configFiltres}
          valeurs={filtres}
          onChange={gererChangementFiltre}
          onReinitialiser={reinitialiserFiltres}
          nombreResultats={opportunitesFiltrees.length}
        />
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="m-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          Erreur lors du chargement des opportunités
        </div>
      )}

      {/* Kanban board avec drag & drop */}
      {!isLoading && !error && (
        <div className="flex-1 overflow-x-auto p-6">
          <KanbanBoard
            etapes={etapesPipeline}
            opportunites={opportunitesFiltrees}
            onChangerEtape={changerEtape}
          />
        </div>
      )}

      {/* Modale de création */}
      <ModaleNouvelleOpportunite
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
      />
    </div>
  );
}
