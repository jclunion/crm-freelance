'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/lib/hooks';
import { formaterMontant, formaterDateRelative } from '@/lib/utils';
import {
  Users,
  Target,
  Ticket as TicketIcon,
  TrendingUp,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Euro,
  Zap,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const badgeEtape: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  qualifie: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  proposition_envoyee: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  negociation: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  gagne: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const badgePriorite: Record<string, string> = {
  haute: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  normale: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  basse: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const badgeStatutTicket: Record<string, string> = {
  nouveau: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

const couleursPipeline: Record<string, string> = {
  lead: 'bg-gray-400',
  qualifie: 'bg-blue-500',
  proposition_envoyee: 'bg-purple-500',
  negociation: 'bg-orange-500',
  gagne: 'bg-green-500',
};

export default function TableauDeBord() {
  const { data, isLoading, error } = useDashboard();

  // Calcul du total du pipeline pour la barre de progression
  const totalPipeline = useMemo(() => {
    if (!data?.repartitionPipeline) return 0;
    return data.repartitionPipeline.reduce((sum, e) => sum + e.montant, 0);
  }, [data?.repartitionPipeline]);

  // Taux de conversion (opportunités gagnées / total)
  const tauxConversion = useMemo(() => {
    if (!data?.stats || !data?.repartitionPipeline) return 0;
    if (data.stats.totalOpportunites === 0) return 0;
    const gagnees = data.repartitionPipeline.find((e) => e.etape === 'gagne')?.count || 0;
    return Math.round((gagnees / data.stats.totalOpportunites) * 100);
  }, [data?.stats, data?.repartitionPipeline]);

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
    <div className="flex h-full flex-col overflow-y-auto">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="border-b border-[var(--border)] bg-[var(--background)] px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord</h1>
            <p className="text-sm text-[var(--muted)]">Vue d'ensemble de votre activité</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        {/* ═══════════════════════════════════════════════════════════════════
            KPIs PRINCIPAUX
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Clients */}
          <div className="hover-lift group relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6">
            <div className="absolute right-4 top-4 rounded-full bg-blue-500/10 p-3">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-[var(--muted)]">Clients</p>
            <p className="mt-2 text-3xl font-bold">{stats.totalClients}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                <Users className="h-3 w-3" />
                {stats.clientsProspects} prospects
              </span>
            </div>
          </div>

          {/* Opportunités */}
          <div className="hover-lift group relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-green-500/10 to-green-600/5 p-6">
            <div className="absolute right-4 top-4 rounded-full bg-green-500/10 p-3">
              <Target className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm font-medium text-[var(--muted)]">Opportunités</p>
            <p className="mt-2 text-3xl font-bold">{stats.opportunitesEnCours}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                <Zap className="h-3 w-3" />
                {stats.totalOpportunites} total
              </span>
              <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                {tauxConversion}% conversion
              </span>
            </div>
          </div>

          {/* Tickets */}
          <div className="hover-lift group relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-6">
            <div className="absolute right-4 top-4 rounded-full bg-orange-500/10 p-3">
              <TicketIcon className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-sm font-medium text-[var(--muted)]">Tickets ouverts</p>
            <p className="mt-2 text-3xl font-bold">{stats.ticketsOuverts}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                {stats.ticketsResolus} résolus
              </span>
            </div>
          </div>

          {/* CA */}
          <div className="hover-lift group relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6">
            <div className="absolute right-4 top-4 rounded-full bg-purple-500/10 p-3">
              <Euro className="h-6 w-6 text-purple-500" />
            </div>
            <p className="text-sm font-medium text-[var(--muted)]">CA Pipeline</p>
            <p className="mt-2 text-3xl font-bold">{formaterMontant(stats.caEstime)}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-3 w-3" />
                {formaterMontant(stats.caPondere)} pondéré
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            CA GAGNÉ (si > 0)
        ═══════════════════════════════════════════════════════════════════ */}
        {stats.caGagne > 0 && (
          <div className="mt-6 overflow-hidden rounded-xl border border-green-200 bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent p-6 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/20 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">CA Gagné</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">{formaterMontant(stats.caGagne)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <ArrowUpRight className="h-5 w-5" />
                <span className="text-sm font-medium">Affaires conclues</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            PIPELINE VISUEL
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--muted)]" />
              <h2 className="text-lg font-semibold">Pipeline des opportunités</h2>
            </div>
            <Link
              href="/opportunites"
              className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
            >
              Voir le pipeline <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Barre de progression du pipeline */}
          <div className="mb-4 h-3 overflow-hidden rounded-full bg-[var(--border)]">
            <div className="flex h-full">
              {repartitionPipeline.map((etape) => {
                const pourcentage = totalPipeline > 0 ? (etape.montant / totalPipeline) * 100 : 0;
                return (
                  <div
                    key={etape.etape}
                    className={`${couleursPipeline[etape.etape] || 'bg-gray-400'} transition-all`}
                    style={{ width: `${pourcentage}%` }}
                    title={`${etape.label}: ${formaterMontant(etape.montant)}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Cartes du pipeline */}
          <div className="grid gap-3 md:grid-cols-5">
            {repartitionPipeline.map((etape) => (
              <div
                key={etape.etape}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${couleursPipeline[etape.etape] || 'bg-gray-400'}`} />
                  <p className="text-sm font-medium">{etape.label}</p>
                </div>
                <p className="mt-2 text-2xl font-bold">{etape.count}</p>
                <p className="mt-1 text-sm font-medium text-[var(--primary)]">
                  {formaterMontant(etape.montant)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            GRILLE 3 COLONNES
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Dernières opportunités */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                <h2 className="font-semibold">Opportunités récentes</h2>
              </div>
              <Link
                href="/opportunites"
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-4">
              {dernieresOpportunites.length > 0 ? (
                <div className="space-y-3">
                  {dernieresOpportunites.map((opp) => (
                    <Link
                      key={opp.id}
                      href="/opportunites"
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 transition-colors hover:bg-[var(--border)]/30"
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
                          {opp.etapePipeline.replace('_', ' ')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <Target className="h-10 w-10 text-[var(--muted)]" />
                  <p className="mt-2 text-sm text-[var(--muted)]">Aucune opportunité</p>
                </div>
              )}
            </div>
          </div>

          {/* Tickets à traiter */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold">Tickets à traiter</h2>
              </div>
              <Link
                href="/tickets"
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-4">
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
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                  <p className="mt-2 text-sm text-[var(--muted)]">Aucun ticket en attente</p>
                </div>
              )}
            </div>
          </div>

          {/* Derniers clients */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h2 className="font-semibold">Derniers clients</h2>
              </div>
              <Link
                href="/clients"
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-4">
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
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-10 w-10 text-[var(--muted)]" />
                  <p className="mt-2 text-sm text-[var(--muted)]">Aucun client</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
