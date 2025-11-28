'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDashboard } from '@/lib/hooks';
import { formaterMontant, formaterDateRelative } from '@/lib/utils';
import {
  Users,
  Target,
  Ticket,
  TrendingUp,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Euro,
} from 'lucide-react';

const badgeEtape: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-700',
  qualifie: 'bg-blue-100 text-blue-700',
  proposition_envoyee: 'bg-purple-100 text-purple-700',
  negociation: 'bg-orange-100 text-orange-700',
  gagne: 'bg-green-100 text-green-700',
};

const badgePriorite: Record<string, string> = {
  haute: 'bg-red-100 text-red-700',
  normale: 'bg-yellow-100 text-yellow-700',
  basse: 'bg-gray-100 text-gray-700',
};

const badgeStatutTicket: Record<string, string> = {
  nouveau: 'bg-blue-100 text-blue-700',
  en_cours: 'bg-yellow-100 text-yellow-700',
};

export default function TableauDeBord() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-red-600">Erreur de chargement</p>
      </div>
    );
  }

  const { stats, repartitionPipeline, dernieresOpportunites, derniersTickets, derniersClients } = data;

  return (
    <div className="flex flex-col">
      <PageHeader
        titre="Tableau de bord"
        description="Vue d'ensemble de votre activité"
      />

      <div className="p-6">
        {/* Cartes statistiques principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">Clients</p>
                <p className="mt-1 text-2xl font-bold">{stats.totalClients}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {stats.clientsProspects} prospects
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">Opportunités</p>
                <p className="mt-1 text-2xl font-bold">{stats.opportunitesEnCours}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  en cours sur {stats.totalOpportunites}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">Tickets ouverts</p>
                <p className="mt-1 text-2xl font-bold">{stats.ticketsOuverts}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {stats.ticketsResolus} résolus ce mois
                </p>
              </div>
              <Ticket className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">CA estimé</p>
                <p className="mt-1 text-2xl font-bold">{formaterMontant(stats.caEstime)}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Pondéré : {formaterMontant(stats.caPondere)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* CA Gagné */}
        {stats.caGagne > 0 && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">CA Gagné</p>
                <p className="text-2xl font-bold text-green-700">{formaterMontant(stats.caGagne)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Pipeline des opportunités</h2>
          <div className="grid gap-2 md:grid-cols-5">
            {repartitionPipeline.map((etape) => (
              <div
                key={etape.etape}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-center"
              >
                <p className="text-sm font-medium text-[var(--muted)]">{etape.label}</p>
                <p className="mt-1 text-2xl font-bold">{etape.count}</p>
                <p className="mt-1 text-sm text-[var(--primary)]">
                  {formaterMontant(etape.montant)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Grille 3 colonnes */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Dernières opportunités */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Opportunités récentes</h2>
              <Link
                href="/opportunites"
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {dernieresOpportunites.length > 0 ? (
              <div className="space-y-3">
                {dernieresOpportunites.map((opp) => (
                  <div
                    key={opp.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{opp.titre}</p>
                      <p className="text-sm text-[var(--muted)]">{opp.client?.nom}</p>
                    </div>
                    <div className="ml-2 text-right">
                      <p className="font-semibold text-[var(--primary)]">
                        {formaterMontant(opp.montantEstime || 0)}
                      </p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeEtape[opp.etapePipeline] || ''}`}>
                        {opp.etapePipeline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-[var(--muted)]">
                Aucune opportunité
              </p>
            )}
          </div>

          {/* Tickets à traiter */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tickets à traiter</h2>
              <Link
                href="/tickets"
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {derniersTickets.length > 0 ? (
              <div className="space-y-3">
                {derniersTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 transition-colors hover:bg-[var(--border)]/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{ticket.sujet}</p>
                      <p className="text-sm text-[var(--muted)]">{ticket.client?.nom}</p>
                    </div>
                    <div className="ml-2 flex flex-col items-end gap-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgePriorite[ticket.priorite] || ''}`}>
                        {ticket.priorite}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeStatutTicket[ticket.statutTicket] || ''}`}>
                        {ticket.statutTicket.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Aucun ticket en attente
                </p>
              </div>
            )}
          </div>

          {/* Derniers clients */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Derniers clients</h2>
              <Link
                href="/clients"
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {derniersClients.length > 0 ? (
              <div className="space-y-3">
                {derniersClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 transition-colors hover:bg-[var(--border)]/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{client.nom}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {client.typeClient} • {client.statutClient}
                      </p>
                    </div>
                    <div className="ml-2 flex items-center gap-1 text-xs text-[var(--muted)]">
                      <Clock className="h-3 w-3" />
                      {formaterDateRelative(client.dateCreation)}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-[var(--muted)]">
                Aucun client
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
