'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClient, useSupprimerClient } from '@/lib/hooks';
import { formaterDate } from '@/lib/utils';
import { ModaleNouveauContact } from '@/components/contacts/ModaleNouveauContact';
import { ModaleNouvelleOpportunite } from '@/components/opportunites/ModaleNouvelleOpportunite';
import { ModaleNouveauTicket } from '@/components/tickets/ModaleNouveauTicket';
import { ModaleEditionClient } from '@/components/clients/ModaleEditionClient';

const badgeEtape: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-700',
  qualifie: 'bg-blue-100 text-blue-700',
  proposition_envoyee: 'bg-purple-100 text-purple-700',
  negociation: 'bg-orange-100 text-orange-700',
  gagne: 'bg-green-100 text-green-700',
  perdu: 'bg-red-100 text-red-700',
};

const badgeStatutTicket: Record<string, string> = {
  nouveau: 'bg-blue-100 text-blue-700',
  en_cours: 'bg-yellow-100 text-yellow-700',
  resolu: 'bg-green-100 text-green-700',
};

interface PageProps {
  params: { id: string };
}

export default function FicheClient({ params }: PageProps) {
  const router = useRouter();
  const { data: client, isLoading, error } = useClient(params.id);
  const supprimerMutation = useSupprimerClient();

  const [modaleContactOuverte, setModaleContactOuverte] = useState(false);
  const [modaleOpportuniteOuverte, setModaleOpportuniteOuverte] = useState(false);
  const [modaleTicketOuverte, setModaleTicketOuverte] = useState(false);
  const [modaleEditionOuverte, setModaleEditionOuverte] = useState(false);

  const gererSuppression = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
      await supprimerMutation.mutateAsync(params.id);
      router.push('/clients');
    } catch (erreur) {
      console.error('Erreur suppression:', erreur);
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

  // Erreur ou client non trouvé
  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-lg text-red-600">Client non trouvé</p>
        <Link href="/clients" className="mt-4 text-[var(--primary)] hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader titre={client.nom}>
        <Link
          href="/clients"
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <button
          onClick={() => setModaleEditionOuverte(true)}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
        >
          <Edit className="h-4 w-4" />
          Modifier
        </button>
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

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        {/* Colonne gauche : Infos + listes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Infos principales */}
          <section className="rounded-lg border border-[var(--border)] p-6">
            <h2 className="mb-4 text-lg font-semibold">Informations</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--muted)]">Type</p>
                <p className="font-medium capitalize">{client.typeClient}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Statut</p>
                <p className="font-medium capitalize">{client.statutClient}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--muted)]" />
                <span>{client.emailPrincipal || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[var(--muted)]" />
                <span>{client.telephonePrincipal || '—'}</span>
              </div>
            </div>
            {client.noteInterne && (
              <div className="mt-4 rounded-lg bg-[var(--border)]/50 p-3">
                <p className="text-sm text-[var(--muted)]">Note interne</p>
                <p className="mt-1 text-sm">{client.noteInterne}</p>
              </div>
            )}
          </section>

          {/* Contacts */}
          <section className="rounded-lg border border-[var(--border)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Contacts ({client.contacts?.length || 0})
              </h2>
              <button
                onClick={() => setModaleContactOuverte(true)}
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {client.contacts && client.contacts.length > 0 ? (
                client.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-lg bg-[var(--border)]/30 p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {contact.prenom} {contact.nom}
                      </p>
                      <p className="text-sm text-[var(--muted)]">{contact.role || '—'}</p>
                    </div>
                    <p className="text-sm text-[var(--muted)]">{contact.email}</p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-[var(--muted)]">
                  Aucun contact
                </p>
              )}
            </div>
          </section>

          {/* Opportunités */}
          <section className="rounded-lg border border-[var(--border)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Opportunités ({client.opportunites?.length || 0})
              </h2>
              <button
                onClick={() => setModaleOpportuniteOuverte(true)}
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                <Plus className="h-4 w-4" />
                Nouvelle
              </button>
            </div>
            <div className="space-y-3">
              {client.opportunites && client.opportunites.length > 0 ? (
                client.opportunites.map((opp) => (
                  <div
                    key={opp.id}
                    className="flex items-center justify-between rounded-lg bg-[var(--border)]/30 p-3"
                  >
                    <div>
                      <p className="font-medium">{opp.titre}</p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          badgeEtape[opp.etapePipeline] || ''
                        }`}
                      >
                        {opp.etapePipeline.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-medium">
                      {opp.montantEstime?.toLocaleString('fr-FR') || 0} €
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-[var(--muted)]">
                  Aucune opportunité
                </p>
              )}
            </div>
          </section>

          {/* Tickets */}
          <section className="rounded-lg border border-[var(--border)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Tickets ({client.tickets?.length || 0})
              </h2>
              <button
                onClick={() => setModaleTicketOuverte(true)}
                className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
              >
                <Plus className="h-4 w-4" />
                Nouveau
              </button>
            </div>
            <div className="space-y-3">
              {client.tickets && client.tickets.length > 0 ? (
                client.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-lg bg-[var(--border)]/30 p-3"
                  >
                    <div>
                      <p className="font-medium">{ticket.sujet}</p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          badgeStatutTicket[ticket.statutTicket] || ''
                        }`}
                      >
                        {ticket.statutTicket.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm capitalize text-[var(--muted)]">
                      {ticket.priorite}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-[var(--muted)]">
                  Aucun ticket
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Colonne droite : Timeline */}
        <div className="lg:col-span-1">
          <section className="rounded-lg border border-[var(--border)] p-6">
            <h2 className="mb-4 text-lg font-semibold">Timeline</h2>
            <div className="space-y-4">
              {client.evenements && client.evenements.length > 0 ? (
                client.evenements.map((evt) => (
                  <div key={evt.id} className="border-l-2 border-[var(--border)] pl-4">
                    <p className="text-xs text-[var(--muted)]">
                      {formaterDate(evt.dateEvenement)}
                    </p>
                    <p className="mt-1 text-sm">{evt.descriptionTexte}</p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-[var(--muted)]">
                  Aucun événement
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modales */}
      <ModaleNouveauContact
        ouverte={modaleContactOuverte}
        onFermer={() => setModaleContactOuverte(false)}
        clientId={params.id}
      />
      <ModaleNouvelleOpportunite
        ouverte={modaleOpportuniteOuverte}
        onFermer={() => setModaleOpportuniteOuverte(false)}
        clientIdPreselectionne={params.id}
      />
      <ModaleNouveauTicket
        ouverte={modaleTicketOuverte}
        onFermer={() => setModaleTicketOuverte(false)}
        clientIdPreselectionne={params.id}
      />
      <ModaleEditionClient
        ouverte={modaleEditionOuverte}
        onFermer={() => setModaleEditionOuverte(false)}
        client={client}
      />
    </div>
  );
}
