'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Briefcase, 
  Ticket, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Loader2,
  ExternalLink,
  Mail,
  LogIn
} from 'lucide-react';

interface Opportunite {
  id: string;
  titre: string;
  descriptionCourte: string | null;
  montantEstime: number | null;
  devise: string;
  etapePipeline: string;
  statutPaiement: string;
  urlPaiement: string | null;
  dateCreation: string;
}

interface TicketPortail {
  id: string;
  sujet: string;
  description: string;
  typeTicket: string;
  priorite: string;
  statutTicket: string;
  dateCreation: string;
  dateMiseAJour: string;
}

interface DonneesPortail {
  id: string;
  nom: string;
  emailPrincipal: string | null;
  opportunites: Opportunite[];
  tickets: TicketPortail[];
}

export default function PagePortail() {
  const params = useParams();
  const token = params.token as string;

  const [donnees, setDonnees] = useState<DonneesPortail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ongletActif, setOngletActif] = useState<'projets' | 'tickets'>('projets');

  // État pour l'authentification
  const [estAuthentifie, setEstAuthentifie] = useState(false);
  const [emailSaisi, setEmailSaisi] = useState('');
  const [erreurAuth, setErreurAuth] = useState<string | null>(null);
  const [authEnCours, setAuthEnCours] = useState(false);
  const [emailAttendu, setEmailAttendu] = useState<string | null>(null);
  const [nomClient, setNomClient] = useState<string | null>(null);

  // État pour le formulaire de ticket
  const [modaleTicketOuverte, setModaleTicketOuverte] = useState(false);
  const [nouveauTicket, setNouveauTicket] = useState({ sujet: '', description: '', typeTicket: 'question' });
  const [creationEnCours, setCreationEnCours] = useState(false);

  // Vérifier si déjà authentifié (session storage)
  useEffect(() => {
    const sessionKey = `portail_auth_${token}`;
    const session = sessionStorage.getItem(sessionKey);
    if (session) {
      setEstAuthentifie(true);
    }
  }, [token]);

  // Charger les infos de base du portail (pour afficher le nom et vérifier l'email)
  useEffect(() => {
    async function chargerInfosPortail() {
      try {
        const reponse = await fetch(`/api/portail/${token}/info`);
        if (!reponse.ok) {
          if (reponse.status === 404) {
            setErreur('Ce lien de portail est invalide ou a expiré.');
          } else {
            setErreur('Erreur lors du chargement.');
          }
          setChargement(false);
          return;
        }
        const data = await reponse.json();
        setEmailAttendu(data.emailPrincipal);
        setNomClient(data.nom);
        setChargement(false);
      } catch (err) {
        setErreur('Erreur de connexion.');
        setChargement(false);
      }
    }

    if (token) {
      chargerInfosPortail();
    }
  }, [token]);

  // Charger les données complètes après authentification
  useEffect(() => {
    async function chargerDonnees() {
      try {
        const reponse = await fetch(`/api/portail/${token}`);
        if (!reponse.ok) {
          setErreur('Erreur lors du chargement des données.');
          return;
        }
        const data = await reponse.json();
        setDonnees(data);
      } catch (err) {
        setErreur('Erreur de connexion.');
      }
    }

    if (estAuthentifie && token) {
      chargerDonnees();
    }
  }, [estAuthentifie, token]);

  // Gérer la connexion
  const gererConnexion = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthEnCours(true);
    setErreurAuth(null);

    // Vérifier que l'email correspond
    if (emailSaisi.toLowerCase().trim() === emailAttendu?.toLowerCase().trim()) {
      // Sauvegarder la session
      const sessionKey = `portail_auth_${token}`;
      sessionStorage.setItem(sessionKey, 'true');
      setEstAuthentifie(true);
    } else {
      setErreurAuth('Adresse email incorrecte.');
    }
    setAuthEnCours(false);
  };

  const creerTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauTicket.sujet || !nouveauTicket.description) return;

    setCreationEnCours(true);
    try {
      const reponse = await fetch(`/api/portail/${token}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouveauTicket),
      });

      if (!reponse.ok) {
        throw new Error('Erreur lors de la création du ticket');
      }

      const ticket = await reponse.json();
      setDonnees((prev) => prev ? {
        ...prev,
        tickets: [ticket, ...prev.tickets],
      } : null);
      setNouveauTicket({ sujet: '', description: '', typeTicket: 'question' });
      setModaleTicketOuverte(false);
    } catch (err) {
      alert('Erreur lors de la création du ticket');
    } finally {
      setCreationEnCours(false);
    }
  };

  if (chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold">Accès refusé</h1>
          <p className="mt-2 text-[var(--muted)]">{erreur}</p>
        </div>
      </div>
    );
  }

  // Page de connexion si non authentifié
  if (!estAuthentifie) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
              <LogIn className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Portail Client</h1>
            {nomClient && (
              <p className="mt-2 text-[var(--muted)]">Espace dédié à {nomClient}</p>
            )}
          </div>

          <form onSubmit={gererConnexion} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="email"
                  value={emailSaisi}
                  onChange={(e) => setEmailSaisi(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-3 pl-10 pr-4 text-sm focus:border-[var(--primary)] focus:outline-none"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {erreurAuth && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {erreurAuth}
              </div>
            )}

            <button
              type="submit"
              disabled={authEnCours || !emailSaisi}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-3 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {authEnCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Accéder au portail
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            Entrez l'adresse email associée à votre compte client pour accéder à votre espace.
          </p>
        </div>
      </div>
    );
  }

  if (!donnees) return null;

  const projetsEnCours = donnees.opportunites.filter(o => o.etapePipeline !== 'gagne');
  const projetsTermines = donnees.opportunites.filter(o => o.etapePipeline === 'gagne');

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold">Portail Client</h1>
          <p className="mt-1 text-[var(--muted)]">Bienvenue, {donnees.nom}</p>
        </div>
      </header>

      {/* Navigation onglets */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-4xl px-4">
          <nav className="flex gap-4">
            <button
              onClick={() => setOngletActif('projets')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                ongletActif === 'projets'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Projets ({donnees.opportunites.length})
            </button>
            <button
              onClick={() => setOngletActif('tickets')}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                ongletActif === 'tickets'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Ticket className="h-4 w-4" />
              Tickets ({donnees.tickets.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {ongletActif === 'projets' && (
          <div className="space-y-6">
            {/* Projets en cours */}
            {projetsEnCours.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">Projets en cours</h2>
                <div className="space-y-3">
                  {projetsEnCours.map((projet) => (
                    <CarteProjet key={projet.id} projet={projet} />
                  ))}
                </div>
              </section>
            )}

            {/* Projets terminés */}
            {projetsTermines.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">Projets terminés</h2>
                <div className="space-y-3">
                  {projetsTermines.map((projet) => (
                    <CarteProjet key={projet.id} projet={projet} />
                  ))}
                </div>
              </section>
            )}

            {donnees.opportunites.length === 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-[var(--muted)]" />
                <p className="mt-4 text-[var(--muted)]">Aucun projet pour le moment</p>
              </div>
            )}
          </div>
        )}

        {ongletActif === 'tickets' && (
          <div className="space-y-4">
            {/* Bouton créer ticket */}
            <div className="flex justify-end">
              <button
                onClick={() => setModaleTicketOuverte(true)}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Nouveau ticket
              </button>
            </div>

            {/* Liste des tickets */}
            {donnees.tickets.length > 0 ? (
              <div className="space-y-3">
                {donnees.tickets.map((ticket) => (
                  <CarteTicket key={ticket.id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
                <Ticket className="mx-auto h-12 w-12 text-[var(--muted)]" />
                <p className="mt-4 text-[var(--muted)]">Aucun ticket</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modale création ticket */}
      {modaleTicketOuverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setModaleTicketOuverte(false)} 
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Nouveau ticket</h2>
            <form onSubmit={creerTicket} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Sujet</label>
                <input
                  type="text"
                  value={nouveauTicket.sujet}
                  onChange={(e) => setNouveauTicket({ ...nouveauTicket, sujet: e.target.value })}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="Résumé de votre demande"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select
                  value={nouveauTicket.typeTicket}
                  onChange={(e) => setNouveauTicket({ ...nouveauTicket, typeTicket: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="question">Question</option>
                  <option value="bug">Bug / Problème</option>
                  <option value="demande_evolution">Demande d'évolution</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  value={nouveauTicket.description}
                  onChange={(e) => setNouveauTicket({ ...nouveauTicket, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="Décrivez votre demande en détail..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModaleTicketOuverte(false)}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--border)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creationEnCours}
                  className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
                >
                  {creationEnCours && <Loader2 className="h-4 w-4 animate-spin" />}
                  Créer le ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant carte projet
function CarteProjet({ projet }: { projet: Opportunite }) {
  const etapeLabels: Record<string, string> = {
    proposition_envoyee: 'Proposition envoyée',
    negociation: 'En négociation',
    gagne: 'Terminé',
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{projet.titre}</h3>
          {projet.descriptionCourte && (
            <p className="mt-1 text-sm text-[var(--muted)]">{projet.descriptionCourte}</p>
          )}
        </div>
        <span className="rounded-full bg-[var(--border)] px-2.5 py-0.5 text-xs font-medium">
          {etapeLabels[projet.etapePipeline] || projet.etapePipeline}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-semibold">
          {projet.montantEstime?.toLocaleString('fr-FR')} {projet.devise}
        </p>

        {/* Statut paiement pour projets gagnés */}
        {projet.etapePipeline === 'gagne' && (
          projet.statutPaiement === 'paye' ? (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Payé
            </span>
          ) : projet.urlPaiement ? (
            <a
              href={projet.urlPaiement}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
            >
              <CreditCard className="h-4 w-4" />
              Payer maintenant
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="flex items-center gap-1 text-sm text-[var(--muted)]">
              <Clock className="h-4 w-4" />
              En attente de facture
            </span>
          )
        )}
      </div>
    </div>
  );
}

// Composant carte ticket
function CarteTicket({ ticket }: { ticket: TicketPortail }) {
  const statutColors: Record<string, string> = {
    ouvert: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    resolu: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ferme: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  const statutLabels: Record<string, string> = {
    ouvert: 'Ouvert',
    en_cours: 'En cours',
    resolu: 'Résolu',
    ferme: 'Fermé',
  };

  const typeLabels: Record<string, string> = {
    question: 'Question',
    bug: 'Bug',
    demande_evolution: 'Évolution',
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{ticket.sujet}</h3>
          <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{ticket.description}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statutColors[ticket.statutTicket] || ''}`}>
          {statutLabels[ticket.statutTicket] || ticket.statutTicket}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="rounded bg-[var(--border)] px-2 py-0.5">
          {typeLabels[ticket.typeTicket] || ticket.typeTicket}
        </span>
        <span>
          Créé le {new Date(ticket.dateCreation).toLocaleDateString('fr-FR')}
        </span>
      </div>
    </div>
  );
}
