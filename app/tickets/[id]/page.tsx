'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Loader2, Clock, User, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTicket, useSupprimerTicket, useMettreAJourTicket } from '@/lib/hooks';
import { formaterDate, formaterDateRelative } from '@/lib/utils';

const badgeType: Record<string, string> = {
  bug: 'bg-red-100 text-red-700',
  question: 'bg-blue-100 text-blue-700',
  demande_evolution: 'bg-purple-100 text-purple-700',
};

const badgePriorite: Record<string, string> = {
  basse: 'bg-gray-100 text-gray-700',
  normale: 'bg-yellow-100 text-yellow-700',
  haute: 'bg-red-100 text-red-700',
};

const badgeStatut: Record<string, string> = {
  nouveau: 'bg-blue-100 text-blue-700',
  en_cours: 'bg-yellow-100 text-yellow-700',
  resolu: 'bg-green-100 text-green-700',
};

const labelsType: Record<string, string> = {
  bug: 'Bug',
  question: 'Question',
  demande_evolution: 'Demande d\'évolution',
};

const labelsPriorite: Record<string, string> = {
  basse: 'Basse',
  normale: 'Normale',
  haute: 'Haute',
};

const labelsStatut: Record<string, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  resolu: 'Résolu',
};

interface PageProps {
  params: { id: string };
}

export default function FicheTicket({ params }: PageProps) {
  const router = useRouter();
  const { data: ticket, isLoading, error } = useTicket(params.id);
  const supprimerMutation = useSupprimerTicket();
  const mettreAJourMutation = useMettreAJourTicket();

  const [editionStatut, setEditionStatut] = useState(false);

  const gererSuppression = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) return;

    try {
      await supprimerMutation.mutateAsync(params.id);
      router.push('/tickets');
    } catch (erreur) {
      console.error('Erreur suppression:', erreur);
    }
  };

  const changerStatut = async (nouveauStatut: string) => {
    try {
      await mettreAJourMutation.mutateAsync({
        id: params.id,
        donnees: { statutTicket: nouveauStatut as 'nouveau' | 'en_cours' | 'resolu' },
      });
      setEditionStatut(false);
    } catch (erreur) {
      console.error('Erreur changement statut:', erreur);
    }
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Erreur ou ticket non trouvé
  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-lg text-red-600">Ticket non trouvé</p>
        <Link href="/tickets" className="mt-4 text-[var(--primary)] hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader titre={ticket.sujet}>
        <Link
          href="/tickets"
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <button
          onClick={gererSuppression}
          disabled={supprimerMutation.isPending}
          className="flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          {supprimerMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Supprimer
        </button>
      </PageHeader>

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
              <h2 className="mb-4 text-lg font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-[var(--foreground)]">
                {ticket.description || 'Aucune description fournie.'}
              </p>
            </div>

            {/* Actions rapides */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
              <h2 className="mb-4 text-lg font-semibold">Changer le statut</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(labelsStatut).map(([valeur, label]) => (
                  <button
                    key={valeur}
                    onClick={() => changerStatut(valeur)}
                    disabled={ticket.statutTicket === valeur || mettreAJourMutation.isPending}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                      ticket.statutTicket === valeur
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'border border-[var(--border)] hover:bg-[var(--border)]'
                    }`}
                  >
                    {mettreAJourMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      label
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
              <h2 className="mb-4 text-lg font-semibold">Informations</h2>
              <dl className="space-y-4">
                {/* Statut */}
                <div>
                  <dt className="text-sm text-[var(--muted)]">Statut</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${badgeStatut[ticket.statutTicket] || ''}`}>
                      {labelsStatut[ticket.statutTicket] || ticket.statutTicket}
                    </span>
                  </dd>
                </div>

                {/* Type */}
                <div>
                  <dt className="text-sm text-[var(--muted)]">Type</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${badgeType[ticket.typeTicket] || ''}`}>
                      {labelsType[ticket.typeTicket] || ticket.typeTicket}
                    </span>
                  </dd>
                </div>

                {/* Priorité */}
                <div>
                  <dt className="text-sm text-[var(--muted)]">Priorité</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${badgePriorite[ticket.priorite] || ''}`}>
                      {labelsPriorite[ticket.priorite] || ticket.priorite}
                    </span>
                  </dd>
                </div>

                {/* Client */}
                <div>
                  <dt className="text-sm text-[var(--muted)]">Client</dt>
                  <dd className="mt-1">
                    <Link
                      href={`/clients/${ticket.client?.id}`}
                      className="font-medium text-[var(--primary)] hover:underline"
                    >
                      {ticket.client?.nom || 'Client inconnu'}
                    </Link>
                  </dd>
                </div>

                {/* Date de création */}
                <div>
                  <dt className="text-sm text-[var(--muted)]">Créé le</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[var(--muted)]" />
                    <span>{formaterDate(ticket.dateCreation)}</span>
                    <span className="text-sm text-[var(--muted)]">
                      ({formaterDateRelative(ticket.dateCreation)})
                    </span>
                  </dd>
                </div>

                {/* Date de résolution */}
                {ticket.dateResolution && (
                  <div>
                    <dt className="text-sm text-[var(--muted)]">Résolu le</dt>
                    <dd className="mt-1 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>{formaterDate(ticket.dateResolution)}</span>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Lien vers le client */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-6">
              <h2 className="mb-4 text-lg font-semibold">Actions</h2>
              <div className="space-y-2">
                <Link
                  href={`/clients/${ticket.client?.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
                >
                  <User className="h-4 w-4" />
                  Voir la fiche client
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
