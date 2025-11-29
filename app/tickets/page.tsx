'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Loader2,
  LayoutGrid,
  List,
  Ticket as TicketIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { useTickets, useClients } from '@/lib/hooks';
import { ModaleNouveauTicket } from '@/components/tickets/ModaleNouveauTicket';
import { ModaleEditionTicket } from '@/components/tickets/ModaleEditionTicket';
import { BoutonExportCSV } from '@/components/ui/BoutonExportCSV';
import { colonnesTickets } from '@/lib/export-csv';
import { formaterDate } from '@/lib/utils';
import type { Ticket } from '@/lib/api';

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

const colonnesKanban = [
  { id: 'nouveau', nom: 'Nouveau', couleur: 'border-blue-400', icon: AlertCircle },
  { id: 'en_cours', nom: 'En cours', couleur: 'border-yellow-400', icon: Clock },
  { id: 'resolu', nom: 'Résolu', couleur: 'border-green-400', icon: CheckCircle2 },
];

type VueType = 'liste' | 'kanban';

export default function ListeTickets() {
  const [recherche, setRecherche] = useState('');
  const [filtres, setFiltres] = useState<Record<string, string | number | undefined>>({});
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [modaleEditionOuverte, setModaleEditionOuverte] = useState(false);
  const [ticketSelectionne, setTicketSelectionne] = useState<Ticket | null>(null);
  const [vue, setVue] = useState<VueType>('liste');
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  const { data: tickets, isLoading, error } = useTickets({
    recherche: recherche || undefined,
    statutTicket: filtres.statutTicket as string | undefined,
    priorite: filtres.priorite as string | undefined,
  });
  const { data: clients } = useClients({});

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

  // Calcul des statistiques
  const stats = useMemo(() => {
    if (!tickets) return { total: 0, nouveaux: 0, enCours: 0, resolus: 0, hautesPriorites: 0 };
    
    const nouveaux = tickets.filter((t) => t.statutTicket === 'nouveau').length;
    const enCours = tickets.filter((t) => t.statutTicket === 'en_cours').length;
    const resolus = tickets.filter((t) => t.statutTicket === 'resolu').length;
    const hautesPriorites = tickets.filter((t) => t.priorite === 'haute' && t.statutTicket !== 'resolu').length;
    
    return { total: tickets.length, nouveaux, enCours, resolus, hautesPriorites };
  }, [tickets]);

  // Nombre de filtres actifs
  const nombreFiltresActifs = Object.values(filtres).filter(Boolean).length;

  // Ouvrir la modale d'édition
  const ouvrirEdition = (ticket: Ticket) => {
    setTicketSelectionne(ticket);
    setModaleEditionOuverte(true);
  };

  const fermerEdition = () => {
    setModaleEditionOuverte(false);
    setTicketSelectionne(null);
  };

  // Tickets groupés par statut pour le Kanban
  const ticketsParStatut = useMemo(() => {
    return colonnesKanban.map((col) => ({
      ...col,
      tickets: ticketsFiltres.filter((t) => t.statutTicket === col.id),
    }));
  }, [ticketsFiltres]);

  return (
    <div className="flex h-full flex-col">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        {/* Ligne 1 : Titre + Actions */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Tickets</h1>
            <p className="text-sm text-[var(--muted)]">
              {ticketsFiltres.length} ticket{ticketsFiltres.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
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
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Nouveau ticket
            </button>
          </div>
        </div>

        {/* Ligne 2 : Statistiques */}
        <div className="flex gap-6 border-t border-[var(--border)] px-6 py-3">
          <div className="flex items-center gap-2">
            <TicketIcon className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">Total</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-[var(--muted)]">Nouveaux</span>
            <span className="font-semibold text-blue-600">{stats.nouveaux}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-[var(--muted)]">En cours</span>
            <span className="font-semibold text-yellow-600">{stats.enCours}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-[var(--muted)]">Résolus</span>
            <span className="font-semibold text-green-600">{stats.resolus}</span>
          </div>
          {stats.hautesPriorites > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-[var(--muted)]">Haute priorité</span>
              <span className="font-semibold text-red-600">{stats.hautesPriorites}</span>
            </div>
          )}
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          BARRE D'OUTILS
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
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
              nombreFiltresActifs > 0
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

          {nombreFiltresActifs > 0 && (
            <button
              onClick={reinitialiserFiltres}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Droite : Toggle vue */}
        <div className="flex items-center rounded-lg border border-[var(--border)] p-1">
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
        </div>
      </div>

      {/* Panneau de filtres (collapsible) */}
      {filtresOuverts && (
        <div className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Filtre Statut */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Statut</label>
              <select
                value={(filtres.statutTicket as string) || ''}
                onChange={(e) => gererChangementFiltre('statutTicket', e.target.value || undefined)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="">Tous les statuts</option>
                <option value="nouveau">Nouveau</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
              </select>
            </div>

            {/* Filtre Priorité */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Priorité</label>
              <select
                value={(filtres.priorite as string) || ''}
                onChange={(e) => gererChangementFiltre('priorite', e.target.value || undefined)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="">Toutes les priorités</option>
                <option value="haute">Haute</option>
                <option value="normale">Normale</option>
                <option value="basse">Basse</option>
              </select>
            </div>

            {/* Filtre Type */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Type</label>
              <select
                value={(filtres.typeTicket as string) || ''}
                onChange={(e) => gererChangementFiltre('typeTicket', e.target.value || undefined)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              >
                <option value="">Tous les types</option>
                <option value="bug">Bug</option>
                <option value="question">Question</option>
                <option value="demande_evolution">Demande évolution</option>
              </select>
            </div>

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
          Erreur lors du chargement des tickets
        </div>
      )}

      {/* Vue Liste */}
      {!isLoading && !error && vue === 'liste' && (
        <div className="flex-1 overflow-y-auto p-6">
          {ticketsFiltres.length > 0 ? (
            <div className="rounded-lg border border-[var(--border)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Sujet
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Priorité
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {ticketsFiltres.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="transition-colors hover:bg-[var(--card)]"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => ouvrirEdition(ticket)}
                          className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
                        >
                          {ticket.sujet}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {ticket.client ? (
                          <Link
                            href={`/clients/${ticket.clientId}`}
                            className="text-sm text-[var(--primary)] hover:underline"
                          >
                            {ticket.client.nom}
                          </Link>
                        ) : (
                          <span className="text-sm text-[var(--muted)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeType[ticket.typeTicket] || ''}`}>
                          {ticket.typeTicket.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgePriorite[ticket.priorite] || ''}`}>
                          {ticket.priorite}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeStatut[ticket.statutTicket] || ''}`}>
                          {ticket.statutTicket.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted)]">
                        {formaterDate(ticket.dateCreation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <TicketIcon className="h-12 w-12 text-[var(--muted)]" />
              <p className="mt-4 text-[var(--muted)]">Aucun ticket</p>
              <button
                onClick={() => setModaleOuverte(true)}
                className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
              >
                <Plus className="h-4 w-4" />
                Créer un ticket
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vue Kanban */}
      {!isLoading && !error && vue === 'kanban' && (
        <div className="flex flex-1 gap-4 overflow-x-auto p-6">
          {ticketsParStatut.map((colonne) => (
            <div
              key={colonne.id}
              className="flex w-80 flex-shrink-0 flex-col rounded-lg bg-[var(--card)]"
            >
              {/* Header de colonne */}
              <div className={`border-t-4 ${colonne.couleur} rounded-t-lg px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <colonne.icon className="h-4 w-4" />
                    <h3 className="font-semibold">{colonne.nom}</h3>
                  </div>
                  <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-xs font-medium">
                    {colonne.tickets.length}
                  </span>
                </div>
              </div>

              {/* Cartes */}
              <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {colonne.tickets.length > 0 ? (
                  colonne.tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => ouvrirEdition(ticket)}
                      className="block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                      <h4 className="font-medium hover:text-[var(--primary)]">{ticket.sujet}</h4>
                      <p className="mt-1 text-sm text-[var(--muted)] truncate">
                        {ticket.client?.nom || 'Client inconnu'}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeType[ticket.typeTicket] || ''}`}>
                          {ticket.typeTicket.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgePriorite[ticket.priorite] || ''}`}>
                          {ticket.priorite}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)]">
                    <p className="text-sm text-[var(--muted)]">Aucun ticket</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale de création */}
      <ModaleNouveauTicket
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
      />

      {/* Modale d'édition */}
      <ModaleEditionTicket
        ouverte={modaleEditionOuverte}
        onFermer={fermerEdition}
        ticket={ticketSelectionne}
      />
    </div>
  );
}
