'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CreditCard, CheckCircle } from 'lucide-react';
import type { Opportunite } from '@/lib/api';

interface EtapePipeline {
  id: string;
  nom: string;
  couleur: string;
}

interface KanbanBoardProps {
  etapes: EtapePipeline[];
  opportunites: Opportunite[];
  onChangerEtape: (oppId: string, nouvelleEtape: string) => Promise<void>;
  onClickOpportunite?: (opportunite: Opportunite) => void;
}

// Carte d'opportunité draggable
function CarteOpportunite({ 
  opportunite, 
  onClick 
}: { 
  opportunite: Opportunite;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opportunite.id,
    data: {
      opportunite,
      etape: opportunite.etapePipeline,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group cursor-grab rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? 'shadow-lg ring-2 ring-[var(--primary)]' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={onClick}
            className="font-medium truncate text-left hover:text-[var(--primary)] hover:underline"
          >
            {opportunite.titre}
          </button>
          <p className="mt-1 text-sm text-[var(--muted)] truncate">
            {opportunite.client?.nom || 'Client inconnu'}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-semibold text-[var(--primary)]">
              {opportunite.montantEstime?.toLocaleString('fr-FR') || 0} €
            </p>
            <div className="flex items-center gap-1.5">
              {/* Badge paiement pour les opportunités gagnées */}
              {opportunite.etapePipeline === 'gagne' && (
                opportunite.statutPaiement === 'paye' ? (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    Payé
                  </span>
                ) : opportunite.urlPaiement ? (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <CreditCard className="h-3 w-3" />
                    En attente
                  </span>
                ) : null
              )}
              {opportunite.probabilite && opportunite.etapePipeline !== 'gagne' && (
                <span className="rounded-full bg-[var(--border)] px-2 py-0.5 text-xs">
                  {opportunite.probabilite}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Carte fantôme pendant le drag
function CarteOpportuniteOverlay({ opportunite }: { opportunite: Opportunite }) {
  return (
    <div className="w-64 cursor-grabbing rounded-lg border-2 border-[var(--primary)] bg-[var(--background)] p-4 shadow-xl">
      <h4 className="font-medium">{opportunite.titre}</h4>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {opportunite.client?.nom || 'Client inconnu'}
      </p>
      <p className="mt-2 text-lg font-semibold text-[var(--primary)]">
        {opportunite.montantEstime?.toLocaleString('fr-FR') || 0} €
      </p>
    </div>
  );
}

// Colonne droppable
function ColonneKanban({
  etape,
  opportunites,
  onClickOpportunite,
}: {
  etape: EtapePipeline;
  opportunites: Opportunite[];
  onClickOpportunite?: (opportunite: Opportunite) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: etape.id,
    data: {
      etape: etape.id,
    },
  });

  const total = opportunites.reduce((sum, opp) => sum + (opp.montantEstime || 0), 0);

  return (
    <div
      className={`flex w-72 flex-shrink-0 flex-col rounded-lg transition-colors ${
        isOver ? 'bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]' : 'bg-[var(--border)]/30'
      }`}
    >
      {/* Header de colonne */}
      <div className={`border-t-4 ${etape.couleur} rounded-t-lg px-4 py-3`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{etape.nom}</h3>
          <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-xs font-medium">
            {opportunites.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {total.toLocaleString('fr-FR')} €
        </p>
      </div>

      {/* Zone de drop */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 overflow-y-auto p-3 min-h-[200px] ${
          isOver ? 'bg-[var(--primary)]/5' : ''
        }`}
      >
        {opportunites.map((opp) => (
          <CarteOpportunite 
            key={opp.id} 
            opportunite={opp} 
            onClick={() => onClickOpportunite?.(opp)}
          />
        ))}

        {opportunites.length === 0 && (
          <div
            className={`flex h-24 items-center justify-center rounded-lg border-2 border-dashed ${
              isOver ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-[var(--border)]'
            }`}
          >
            <p className="text-sm text-[var(--muted)]">
              {isOver ? 'Déposer ici' : 'Aucune opportunité'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ etapes, opportunites, onChangerEtape, onClickOpportunite }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // État local pour les opportunités (mise à jour optimiste)
  const [opportunitesLocales, setOpportunitesLocales] = useState<Opportunite[]>(opportunites);

  // Synchroniser avec les props quand elles changent (après mutation réussie)
  useEffect(() => {
    setOpportunitesLocales(opportunites);
  }, [opportunites]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Trouver l'opportunité active
  const activeOpportunite = activeId
    ? opportunitesLocales.find((o) => o.id === activeId)
    : null;

  // Grouper les opportunités par étape (utiliser l'état local)
  const opportunitesParEtape = etapes.map((etape) => ({
    ...etape,
    opportunites: opportunitesLocales.filter((opp) => opp.etapePipeline === etape.id),
  }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeOppId = active.id as string;
    const nouvelleEtape = over.id as string;

    // Trouver l'étape actuelle de l'opportunité
    const opp = opportunitesLocales.find((o) => o.id === activeOppId);
    const etapeActuelle = opp?.etapePipeline;

    // Si l'étape a changé, mettre à jour
    if (etapeActuelle && nouvelleEtape && etapeActuelle !== nouvelleEtape) {
      // Vérifier que la destination est une étape valide
      if (etapes.some((e) => e.id === nouvelleEtape)) {
        // Mise à jour optimiste immédiate
        setOpportunitesLocales((prev) =>
          prev.map((o) =>
            o.id === activeOppId ? { ...o, etapePipeline: nouvelleEtape } : o
          )
        );

        // Appeler l'API en arrière-plan
        try {
          await onChangerEtape(activeOppId, nouvelleEtape);
        } catch (error) {
          // En cas d'erreur, restaurer l'état précédent
          setOpportunitesLocales((prev) =>
            prev.map((o) =>
              o.id === activeOppId ? { ...o, etapePipeline: etapeActuelle } : o
            )
          );
          console.error('Erreur lors du changement d\'étape:', error);
        }
      }
    }
  }, [opportunitesLocales, etapes, onChangerEtape]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4">
        {opportunitesParEtape.map((etape) => (
          <ColonneKanban
            key={etape.id}
            etape={etape}
            opportunites={etape.opportunites}
            onClickOpportunite={onClickOpportunite}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOpportunite ? (
          <CarteOpportuniteOverlay opportunite={activeOpportunite} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
