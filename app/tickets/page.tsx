'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTickets, useClients } from '@/lib/hooks';
import { ModaleNouveauTicket } from '@/components/tickets/ModaleNouveauTicket';
import { PanneauFiltres } from '@/components/filtres/PanneauFiltres';
import { BoutonExportCSV } from '@/components/ui/BoutonExportCSV';
import { colonnesTickets } from '@/lib/export-csv';
import { formaterDate } from '@/lib/utils';

const badgeType: Record<string, string> = {
  bug: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  question: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  demande_evolution: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

const badgePriorite: Record<string, string> = {
  basse: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  normale: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  haute: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const badgeStatut: Record<string, string> = {
  nouveau: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  resolu: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export default function ListeTickets() {
  const [recherche, setRecherche] = useState('');
  const [filtres, setFiltres] = useState<Record<string, string | number | undefined>>({});
  const [modaleOuverte, setModaleOuverte] = useState(false);

  const { data: tickets, isLoading, error } = useTickets({
    recherche: recherche || undefined,
    statutTicket: filtres.statutTicket as string | undefined,
    priorite: filtres.priorite as string | undefined,
  });
  const { data: clients } = useClients({});

  // Configuration des filtres
  const configFiltres = useMemo(() => [
    {
      id: 'statutTicket',
      label: 'Statut',
      type: 'select' as const,
      options: [
        { valeur: 'nouveau', label: 'Nouveau' },
        { valeur: 'en_cours', label: 'En cours' },
        { valeur: 'resolu', label: 'Résolu' },
      ],
    },
    {
      id: 'priorite',
      label: 'Priorité',
      type: 'select' as const,
      options: [
        { valeur: 'haute', label: 'Haute' },
        { valeur: 'normale', label: 'Normale' },
        { valeur: 'basse', label: 'Basse' },
      ],
    },
    {
      id: 'typeTicket',
      label: 'Type',
      type: 'select' as const,
      options: [
        { valeur: 'bug', label: 'Bug' },
        { valeur: 'question', label: 'Question' },
        { valeur: 'demande_evolution', label: 'Demande évolution' },
      ],
    },
    {
      id: 'clientId',
      label: 'Client',
      type: 'select' as const,
      options: (clients || []).map((c) => ({ valeur: c.id, label: c.nom })),
    },
    {
      id: 'dateCreation',
      label: 'Date de création',
      type: 'dateRange' as const,
    },
  ], [clients]);

  // Filtrage côté client pour les filtres non supportés par l'API
  const ticketsFiltres = useMemo(() => {
    if (!tickets) return [];
    
    return tickets.filter((ticket) => {
      // Filtre par type
      if (filtres.typeTicket && ticket.typeTicket !== filtres.typeTicket) return false;
      
      // Filtre par client
      if (filtres.clientId && ticket.clientId !== filtres.clientId) return false;
      
      // Filtre par date de création
      if (filtres.dateCreationDebut) {
        const dateDebut = new Date(filtres.dateCreationDebut as string);
        const dateTicket = new Date(ticket.dateCreation);
        if (dateTicket < dateDebut) return false;
      }
      if (filtres.dateCreationFin) {
        const dateFin = new Date(filtres.dateCreationFin as string);
        dateFin.setHours(23, 59, 59, 999);
        const dateTicket = new Date(ticket.dateCreation);
        if (dateTicket > dateFin) return false;
      }
      
      return true;
    });
  }, [tickets, filtres]);

  const gererChangementFiltre = (id: string, valeur: string | number | undefined) => {
    setFiltres((prev) => ({ ...prev, [id]: valeur }));
  };

  const reinitialiserFiltres = () => {
    setFiltres({});
    setRecherche('');
  };

  return (
    <div className="flex flex-col">
      <PageHeader titre="Tickets" description="Support et demandes clients">
        <BoutonExportCSV
          donnees={ticketsFiltres.map((t) => ({
            ...t,
            clientNom: t.client?.nom || '',
            dateCreation: new Date(t.dateCreation).toLocaleDateString('fr-FR'),
            dateResolution: t.dateResolution
              ? new Date(t.dateResolution).toLocaleDateString('fr-FR')
              : '',
          }))}
          colonnes={colonnesTickets}
          nomFichier="tickets"
        />
        <button
          onClick={() => setModaleOuverte(true)}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nouveau ticket
        </button>
      </PageHeader>

      <div className="p-6">
        {/* Barre de recherche */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Rechercher un ticket..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* Filtres avancés */}
        <div className="mb-6">
          <PanneauFiltres
            filtres={configFiltres}
            valeurs={filtres}
            onChange={gererChangementFiltre}
            onReinitialiser={reinitialiserFiltres}
            nombreResultats={ticketsFiltres.length}
          />
        </div>

        {/* État de chargement */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            Erreur lors du chargement des tickets
          </div>
        )}

        {/* Table des tickets */}
        {!isLoading && !error && (
          <div className="overflow-hidden rounded-lg border border-[var(--border)]">
            <table className="w-full">
              <thead className="bg-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Sujet
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Priorité
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {ticketsFiltres && ticketsFiltres.length > 0 ? (
                  ticketsFiltres.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="transition-colors hover:bg-[var(--border)]/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                        >
                          {ticket.sujet}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted)]">
                        {ticket.client?.nom || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            badgeType[ticket.typeTicket] || ''
                          }`}
                        >
                          {ticket.typeTicket.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            badgePriorite[ticket.priorite] || ''
                          }`}
                        >
                          {ticket.priorite}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            badgeStatut[ticket.statutTicket] || ''
                          }`}
                        >
                          {ticket.statutTicket.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted)]">
                        {formaterDate(ticket.dateCreation)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                      Aucun ticket trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale de création */}
      <ModaleNouveauTicket
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
      />
    </div>
  );
}
