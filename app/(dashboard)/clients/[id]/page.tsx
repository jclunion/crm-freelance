'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Target,
  Ticket as TicketIcon,
  Users,
  Clock,
  TrendingUp,
  MoreHorizontal,
  Building2,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useClient, useSupprimerClient } from '@/lib/hooks';
import { formaterDate, formaterMontant } from '@/lib/utils';
import { genererLienPortail, revoquerPortail, type Opportunite, type Ticket } from '@/lib/api';
import { ModaleNouveauContact } from '@/components/contacts/ModaleNouveauContact';
import { ModaleNouvelleOpportunite } from '@/components/opportunites/ModaleNouvelleOpportunite';
import { ModaleEditionOpportunite } from '@/components/opportunites/ModaleEditionOpportunite';
import { ModaleNouveauTicket } from '@/components/tickets/ModaleNouveauTicket';
import { ModaleEditionTicket } from '@/components/tickets/ModaleEditionTicket';
import { ModaleEditionClient } from '@/components/clients/ModaleEditionClient';
import { ModaleNouvelEmail } from '@/components/emails/ModaleNouvelEmail';
import { ModaleEditionEmail } from '@/components/emails/ModaleEditionEmail';
import { useToast } from '@/components/ui/Toast';
import type { EvenementTimeline } from '@/lib/api';

// Badges pour les étapes du pipeline
const badgeEtape: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  qualifie: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  proposition_envoyee: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  negociation: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  gagne: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  perdu: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

// Badges pour les statuts de tickets
const badgeStatutTicket: Record<string, string> = {
  nouveau: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  resolu: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

// Badges pour les priorités
const badgePriorite: Record<string, string> = {
  haute: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  normale: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  basse: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

// Badges pour le type de client
const badgeType: Record<string, string> = {
  freelance: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  agence: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  entreprise: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  particulier: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

// Badges pour le statut client
const badgeStatut: Record<string, string> = {
  prospect: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  client: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

// Onglets disponibles
type Onglet = 'apercu' | 'opportunites' | 'tickets' | 'timeline';

export default function FicheClient() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const clientId = params.id;
  const { data: client, isLoading, error, refetch } = useClient(clientId);
  const supprimerMutation = useSupprimerClient();
  const toast = useToast();

  const [ongletActif, setOngletActif] = useState<Onglet>('apercu');
  const [menuActionsOuvert, setMenuActionsOuvert] = useState(false);
  const [modaleContactOuverte, setModaleContactOuverte] = useState(false);
  const [modaleOpportuniteOuverte, setModaleOpportuniteOuverte] = useState(false);
  const [modaleEditionOpportuniteOuverte, setModaleEditionOpportuniteOuverte] = useState(false);
  const [opportuniteSelectionnee, setOpportuniteSelectionnee] = useState<Opportunite | null>(null);
  const [modaleTicketOuverte, setModaleTicketOuverte] = useState(false);
  const [modaleEditionTicketOuverte, setModaleEditionTicketOuverte] = useState(false);
  const [ticketSelectionne, setTicketSelectionne] = useState<Ticket | null>(null);
  const [modaleEditionOuverte, setModaleEditionOuverte] = useState(false);

  // État pour le portail client
  const [generationPortailEnCours, setGenerationPortailEnCours] = useState(false);
  const [lienPortailCopie, setLienPortailCopie] = useState(false);

  // État pour la modale email
  const [modaleEmailOuverte, setModaleEmailOuverte] = useState(false);
  const [modaleEditionEmailOuverte, setModaleEditionEmailOuverte] = useState(false);
  const [emailSelectionne, setEmailSelectionne] = useState<EvenementTimeline | null>(null);

  const ouvrirEditionEmail = (evt: EvenementTimeline) => {
    setEmailSelectionne(evt);
    setModaleEditionEmailOuverte(true);
  };

  const fermerEditionEmail = () => {
    setModaleEditionEmailOuverte(false);
    setEmailSelectionne(null);
  };

  const gererSuppression = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;
    try {
      await supprimerMutation.mutateAsync(clientId);
      router.push('/clients');
    } catch (erreur) {
      console.error('Erreur suppression:', erreur);
    }
  };

  // Générer le lien du portail client
  const gererGenerationPortail = async () => {
    setGenerationPortailEnCours(true);
    try {
      const resultat = await genererLienPortail(params.id);
      toast.success('Lien portail généré', 'Le client peut maintenant accéder à son portail');
      refetch();
      // Copier automatiquement le lien
      await navigator.clipboard.writeText(resultat.urlPortail);
      setLienPortailCopie(true);
      setTimeout(() => setLienPortailCopie(false), 2000);
    } catch (erreur) {
      console.error('Erreur génération portail:', erreur);
      toast.error('Erreur', 'Impossible de générer le lien du portail');
    } finally {
      setGenerationPortailEnCours(false);
    }
  };

  // Copier le lien du portail
  const copierLienPortail = async () => {
    if (!client?.tokenPortail) return;
    const url = `${window.location.origin}/portail/${client.tokenPortail}`;
    try {
      await navigator.clipboard.writeText(url);
      setLienPortailCopie(true);
      toast.success('Lien copié', 'Le lien du portail a été copié');
      setTimeout(() => setLienPortailCopie(false), 2000);
    } catch (erreur) {
      toast.error('Erreur', 'Impossible de copier le lien');
    }
  };

  // Révoquer l'accès au portail
  const gererRevocationPortail = async () => {
    if (!confirm('Révoquer l\'accès au portail pour ce client ?')) return;
    try {
      await revoquerPortail(params.id);
      toast.success('Accès révoqué', 'Le client ne peut plus accéder au portail');
      refetch();
    } catch (erreur) {
      console.error('Erreur révocation portail:', erreur);
      toast.error('Erreur', 'Impossible de révoquer l\'accès');
    }
  };

  // Calculs des statistiques
  const calculerStats = () => {
    if (!client) return { caTotal: 0, opportunitesOuvertes: 0, ticketsOuverts: 0 };
    
    const opportunitesOuvertes = client.opportunites?.filter(
      (o) => !['gagne', 'perdu'].includes(o.etapePipeline)
    ).length || 0;
    
    const caTotal = client.opportunites?.reduce(
      (sum, o) => sum + (o.montantEstime || 0), 0
    ) || 0;
    
    const ticketsOuverts = client.tickets?.filter(
      (t) => t.statutTicket !== 'resolu'
    ).length || 0;

    return { caTotal, opportunitesOuvertes, ticketsOuverts };
  };

  // Ouvrir la modale d'édition d'opportunité
  const ouvrirEditionOpportunite = (opp: Opportunite) => {
    setOpportuniteSelectionnee(opp);
    setModaleEditionOpportuniteOuverte(true);
  };

  const fermerEditionOpportunite = () => {
    setModaleEditionOpportuniteOuverte(false);
    setOpportuniteSelectionnee(null);
  };

  // Ouvrir la modale d'édition de ticket
  const ouvrirEditionTicket = (ticket: Ticket) => {
    setTicketSelectionne(ticket);
    setModaleEditionTicketOuverte(true);
  };

  const fermerEditionTicket = () => {
    setModaleEditionTicketOuverte(false);
    setTicketSelectionne(null);
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

  const stats = calculerStats();

  const onglets = [
    { id: 'apercu' as Onglet, label: 'Aperçu', icon: Building2 },
    { id: 'opportunites' as Onglet, label: `Opportunités (${client.opportunites?.length || 0})`, icon: Target },
    { id: 'tickets' as Onglet, label: `Tickets (${client.tickets?.length || 0})`, icon: TicketIcon },
    { id: 'timeline' as Onglet, label: 'Timeline', icon: Clock },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER - Toujours visible
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        {/* Ligne 1 : Navigation + Actions */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Gauche : Retour + Nom */}
          <div className="flex items-center gap-4">
            <Link
              href="/clients"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] transition-colors hover:bg-[var(--border)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{client.nom}</h1>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeType[client.typeClient] || ''}`}>
                  {client.typeClient}
                </span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStatut[client.statutClient] || ''}`}>
                  {client.statutClient}
                </span>
              </div>
            </div>
          </div>

          {/* Droite : Actions principales */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModaleOpportuniteOuverte(true)}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
            >
              <Target className="h-4 w-4" />
              Nouvelle opportunité
            </button>
            <button
              onClick={() => setModaleTicketOuverte(true)}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
            >
              <TicketIcon className="h-4 w-4" />
              Nouveau ticket
            </button>

            {/* Menu actions secondaires */}
            <div className="relative">
              <button
                onClick={() => setMenuActionsOuvert(!menuActionsOuvert)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] transition-colors hover:bg-[var(--border)]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuActionsOuvert && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuActionsOuvert(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[var(--border)] bg-[var(--background)] py-1 shadow-lg">
                    <button
                      onClick={() => {
                        setModaleEditionOuverte(true);
                        setMenuActionsOuvert(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--border)]"
                    >
                      <Edit className="h-4 w-4" />
                      Modifier le client
                    </button>
                    <button
                      onClick={() => {
                        setModaleContactOuverte(true);
                        setMenuActionsOuvert(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--border)]"
                    >
                      <Users className="h-4 w-4" />
                      Ajouter un contact
                    </button>
                    <button
                      onClick={() => {
                        setModaleEmailOuverte(true);
                        setMenuActionsOuvert(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--border)]"
                    >
                      <Mail className="h-4 w-4" />
                      Consigner un email
                    </button>
                    <hr className="my-1 border-[var(--border)]" />
                    <button
                      onClick={() => {
                        gererSuppression();
                        setMenuActionsOuvert(false);
                      }}
                      disabled={supprimerMutation.isPending}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ligne 2 : Chiffres clés */}
        <div className="flex gap-6 border-t border-[var(--border)] px-6 py-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">CA potentiel</span>
            <span className="font-semibold">{formaterMontant(stats.caTotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">Opportunités ouvertes</span>
            <span className="font-semibold">{stats.opportunitesOuvertes}</span>
          </div>
          <div className="flex items-center gap-2">
            <TicketIcon className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">Tickets ouverts</span>
            <span className="font-semibold">{stats.ticketsOuverts}</span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENU PRINCIPAL - 2 colonnes
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─────────────────────────────────────────────────────────────────
            COLONNE GAUCHE : Infos & Contacts (fixe, scrollable)
        ───────────────────────────────────────────────────────────────── */}
        <aside className="w-80 flex-shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--card)] p-6">
          {/* Bloc Informations */}
          <section className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Informations
            </h3>
            <div className="space-y-3">
              {client.emailPrincipal && (
                <a
                  href={`mailto:${client.emailPrincipal}`}
                  className="flex items-center gap-3 text-sm hover:text-[var(--primary)]"
                >
                  <Mail className="h-4 w-4 text-[var(--muted)]" />
                  <span className="truncate">{client.emailPrincipal}</span>
                </a>
              )}
              {client.telephonePrincipal && (
                <a
                  href={`tel:${client.telephonePrincipal}`}
                  className="flex items-center gap-3 text-sm hover:text-[var(--primary)]"
                >
                  <Phone className="h-4 w-4 text-[var(--muted)]" />
                  <span>{client.telephonePrincipal}</span>
                </a>
              )}
              {!client.emailPrincipal && !client.telephonePrincipal && (
                <p className="text-sm text-[var(--muted)]">Aucune information de contact</p>
              )}
            </div>
          </section>

          {/* Bloc Note interne */}
          {client.noteInterne && (
            <section className="mb-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Note interne
              </h3>
              <p className="rounded-lg bg-[var(--background)] p-3 text-sm">
                {client.noteInterne}
              </p>
            </section>
          )}

          {/* Bloc Portail Client */}
          <section className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Portail client
            </h3>
            <div className="rounded-lg bg-[var(--background)] p-3">
              {client.tokenPortail ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">Accès activé</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copierLienPortail}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--border)]"
                    >
                      {lienPortailCopie ? (
                        <>
                          <Check className="h-3 w-3 text-green-500" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copier le lien
                        </>
                      )}
                    </button>
                    <a
                      href={`/portail/${client.tokenPortail}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg border border-[var(--border)] px-3 py-2 text-xs transition-colors hover:bg-[var(--border)]"
                      title="Ouvrir le portail"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={gererGenerationPortail}
                      disabled={generationPortailEnCours}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:bg-[var(--border)] disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${generationPortailEnCours ? 'animate-spin' : ''}`} />
                      Régénérer
                    </button>
                    <button
                      onClick={gererRevocationPortail}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                      Révoquer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--muted)]">
                    Aucun accès portail configuré
                  </p>
                  <button
                    onClick={gererGenerationPortail}
                    disabled={generationPortailEnCours}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {generationPortailEnCours ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LinkIcon className="h-4 w-4" />
                    )}
                    Générer un lien portail
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Bloc Contacts */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Contacts ({client.contacts?.length || 0})
              </h3>
              <button
                onClick={() => setModaleContactOuverte(true)}
                className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {client.contacts && client.contacts.length > 0 ? (
                client.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-lg bg-[var(--background)] p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {contact.prenom} {contact.nom}
                        </p>
                        {contact.role && (
                          <p className="text-xs text-[var(--muted)]">{contact.role}</p>
                        )}
                      </div>
                    </div>
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="mt-2 flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--primary)]"
                      >
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </a>
                    )}
                    {contact.telephone && (
                      <a
                        href={`tel:${contact.telephone}`}
                        className="mt-1 flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--primary)]"
                      >
                        <Phone className="h-3 w-3" />
                        {contact.telephone}
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-[var(--muted)]">
                  Aucun contact
                </p>
              )}
            </div>
          </section>
        </aside>

        {/* ─────────────────────────────────────────────────────────────────
            COLONNE DROITE : Onglets + Contenu
        ───────────────────────────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Barre d'onglets */}
          <nav className="flex gap-1 border-b border-[var(--border)] px-6">
            {onglets.map((onglet) => (
              <button
                key={onglet.id}
                onClick={() => setOngletActif(onglet.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  ongletActif === onglet.id
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <onglet.icon className="h-4 w-4" />
                {onglet.label}
              </button>
            ))}
          </nav>

          {/* Contenu de l'onglet */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* ═══ ONGLET APERÇU ═══ */}
            {ongletActif === 'apercu' && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Résumé Opportunités */}
                <section className="rounded-lg border border-[var(--border)] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">Opportunités récentes</h3>
                    <button
                      onClick={() => setOngletActif('opportunites')}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      Voir tout
                    </button>
                  </div>
                  <div className="space-y-3">
                    {client.opportunites && client.opportunites.length > 0 ? (
                      client.opportunites.slice(0, 3).map((opp) => (
                        <button
                          key={opp.id}
                          onClick={() => ouvrirEditionOpportunite(opp as Opportunite)}
                          className="flex w-full items-center justify-between rounded-lg bg-[var(--card)] p-3 text-left transition-colors hover:bg-[var(--card-hover)]"
                        >
                          <div>
                            <p className="font-medium hover:text-[var(--primary)]">{opp.titre}</p>
                            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeEtape[opp.etapePipeline] || ''}`}>
                              {opp.etapePipeline.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="font-semibold text-[var(--primary)]">
                            {formaterMontant(opp.montantEstime || 0)}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className="py-6 text-center text-sm text-[var(--muted)]">
                        Aucune opportunité
                      </p>
                    )}
                  </div>
                </section>

                {/* Résumé Tickets */}
                <section className="rounded-lg border border-[var(--border)] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">Tickets récents</h3>
                    <button
                      onClick={() => setOngletActif('tickets')}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      Voir tout
                    </button>
                  </div>
                  <div className="space-y-3">
                    {client.tickets && client.tickets.length > 0 ? (
                      client.tickets.slice(0, 3).map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => ouvrirEditionTicket(ticket as Ticket)}
                          className="flex w-full items-center justify-between rounded-lg bg-[var(--card)] p-3 text-left transition-colors hover:bg-[var(--card-hover)]"
                        >
                          <div>
                            <p className="font-medium hover:text-[var(--primary)]">{ticket.sujet}</p>
                            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeStatutTicket[ticket.statutTicket] || ''}`}>
                              {ticket.statutTicket.replace('_', ' ')}
                            </span>
                          </div>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgePriorite[ticket.priorite] || ''}`}>
                            {ticket.priorite}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="py-6 text-center text-sm text-[var(--muted)]">
                        Aucun ticket
                      </p>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* ═══ ONGLET OPPORTUNITÉS ═══ */}
            {ongletActif === 'opportunites' && (
              <div className="space-y-3">
                {client.opportunites && client.opportunites.length > 0 ? (
                  client.opportunites.map((opp) => (
                    <button
                      key={opp.id}
                      onClick={() => ouvrirEditionOpportunite(opp as Opportunite)}
                      className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] p-4 text-left transition-colors hover:bg-[var(--card)]"
                    >
                      <div className="flex-1">
                        <p className="font-medium hover:text-[var(--primary)]">{opp.titre}</p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeEtape[opp.etapePipeline] || ''}`}>
                            {opp.etapePipeline.replace('_', ' ')}
                          </span>
                          {opp.probabilite && (
                            <span className="text-xs text-[var(--muted)]">
                              {opp.probabilite}% de probabilité
                            </span>
                          )}
                          {opp.dateCloturePrevue && (
                            <span className="text-xs text-[var(--muted)]">
                              Clôture prévue : {formaterDate(opp.dateCloturePrevue)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-[var(--primary)]">
                        {formaterMontant(opp.montantEstime || 0)}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-[var(--muted)]" />
                    <p className="mt-4 text-[var(--muted)]">Aucune opportunité</p>
                    <button
                      onClick={() => setModaleOpportuniteOuverte(true)}
                      className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
                    >
                      <Plus className="h-4 w-4" />
                      Créer une opportunité
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ ONGLET TICKETS ═══ */}
            {ongletActif === 'tickets' && (
              <div className="space-y-3">
                {client.tickets && client.tickets.length > 0 ? (
                  client.tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => ouvrirEditionTicket(ticket as Ticket)}
                      className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] p-4 text-left transition-colors hover:bg-[var(--card)]"
                    >
                      <div className="flex-1">
                        <p className="font-medium hover:text-[var(--primary)]">{ticket.sujet}</p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeStatutTicket[ticket.statutTicket] || ''}`}>
                            {ticket.statutTicket.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-[var(--muted)]">
                            {formaterDate(ticket.dateCreation)}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgePriorite[ticket.priorite] || ''}`}>
                        {ticket.priorite}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <TicketIcon className="h-12 w-12 text-[var(--muted)]" />
                    <p className="mt-4 text-[var(--muted)]">Aucun ticket</p>
                    <button
                      onClick={() => setModaleTicketOuverte(true)}
                      className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
                    >
                      <Plus className="h-4 w-4" />
                      Créer un ticket
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ ONGLET TIMELINE ═══ */}
            {ongletActif === 'timeline' && (
              <div className="space-y-4">
                {/* Bouton ajouter email */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setModaleEmailOuverte(true)}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
                  >
                    <Mail className="h-4 w-4" />
                    Consigner un email
                  </button>
                </div>

                {client.evenements && client.evenements.length > 0 ? (
                  client.evenements.map((evt) => {
                    // Déterminer la couleur selon le type
                    const estEmail = evt.typeEvenement === 'email_client';
                    const estPaiement = evt.typeEvenement === 'paiement_recu';
                    const estTicket = evt.typeEvenement?.startsWith('ticket');

                    let couleurPoint = 'bg-[var(--primary)]';
                    if (estEmail) couleurPoint = 'bg-blue-500';
                    if (estPaiement) couleurPoint = 'bg-green-500';
                    if (estTicket) couleurPoint = 'bg-orange-500';

                    const ContenuEvenement = (
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-[var(--muted)]">
                            {formaterDate(evt.dateEvenement)}
                          </p>
                          {estEmail && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Email
                            </span>
                          )}
                          {estPaiement && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                              Paiement
                            </span>
                          )}
                        </div>
                        <p className="mt-1 whitespace-pre-line">{evt.descriptionTexte}</p>
                      </div>
                    );

                    return (
                      <div key={evt.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full ${couleurPoint}`} />
                          <div className="w-0.5 flex-1 bg-[var(--border)]" />
                        </div>
                        {estEmail ? (
                          <button
                            onClick={() => ouvrirEditionEmail(evt)}
                            className="flex-1 rounded-lg p-2 -ml-2 text-left transition-colors hover:bg-[var(--card)]"
                          >
                            {ContenuEvenement}
                          </button>
                        ) : (
                          ContenuEvenement
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-[var(--muted)]" />
                    <p className="mt-4 text-[var(--muted)]">Aucun événement</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODALES
      ═══════════════════════════════════════════════════════════════════ */}
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
      <ModaleEditionOpportunite
        ouverte={modaleEditionOpportuniteOuverte}
        onFermer={fermerEditionOpportunite}
        opportunite={opportuniteSelectionnee}
      />
      <ModaleEditionTicket
        ouverte={modaleEditionTicketOuverte}
        onFermer={fermerEditionTicket}
        ticket={ticketSelectionne}
      />
      <ModaleNouvelEmail
        ouverte={modaleEmailOuverte}
        onFermer={() => setModaleEmailOuverte(false)}
        clientId={params.id}
        clientNom={client.nom}
      />
      <ModaleEditionEmail
        ouverte={modaleEditionEmailOuverte}
        onFermer={fermerEditionEmail}
        clientId={params.id}
        evenement={emailSelectionne}
      />
    </div>
  );
}
