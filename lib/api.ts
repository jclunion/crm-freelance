// Fonctions utilitaires pour les appels API

const API_BASE = '/api';

interface ErreurAPI {
  erreur: string;
  details?: unknown;
}

async function gererReponse<T>(reponse: Response): Promise<T> {
  if (!reponse.ok) {
    const erreur: ErreurAPI = await reponse.json().catch(() => ({
      erreur: 'Erreur inconnue',
    }));
    throw new Error(erreur.erreur || `Erreur ${reponse.status}`);
  }
  return reponse.json();
}

// --- Clients ---

export interface ClientAvecStats {
  id: string;
  nom: string;
  typeClient: string;
  emailPrincipal: string | null;
  telephonePrincipal: string | null;
  statutClient: string;
  noteInterne: string | null;
  // Informations entreprise / organisation
  raisonSociale: string | null;
  siteWeb: string | null;
  logoClientUrl: string | null;
  adresseLigne1: string | null;
  adresseLigne2: string | null;
  codePostal: string | null;
  ville: string | null;
  pays: string | null;
  siret: string | null;
  numeroTva: string | null;
  secteurActivite: string | null;
  tailleEntreprise: string | null;
  tokenPortail: string | null;
  proprietaireId: string;
  dateCreation: string;
  dateMiseAJour: string;
  _count: {
    contacts: number;
    opportunites: number;
    tickets: number;
  };
}

export interface ClientComplet extends Omit<ClientAvecStats, '_count'> {
  contacts: Contact[];
  opportunites: Opportunite[];
  tickets: Ticket[];
  evenements: EvenementTimeline[];
  proprietaire: {
    id: string;
    nomAffiche: string;
    email: string;
  };
}

export interface ClientCreation {
  nom: string;
  typeClient: 'freelance' | 'agence' | 'entreprise' | 'particulier';
  emailPrincipal?: string;
  telephonePrincipal?: string;
  statutClient?: 'prospect' | 'client';
  noteInterne?: string;

  // Informations entreprise / organisation
  raisonSociale?: string;
  siteWeb?: string;
  logoClientUrl?: string;
  adresseLigne1?: string;
  adresseLigne2?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
  siret?: string;
  numeroTva?: string;
  secteurActivite?: string;
  tailleEntreprise?: string;
}

export async function recupererClients(params?: {
  recherche?: string;
  statutClient?: string;
  typeClient?: string;
}): Promise<ClientAvecStats[]> {
  const searchParams = new URLSearchParams();
  if (params?.recherche) searchParams.set('recherche', params.recherche);
  if (params?.statutClient) searchParams.set('statutClient', params.statutClient);
  if (params?.typeClient) searchParams.set('typeClient', params.typeClient);

  const url = `${API_BASE}/clients${searchParams.toString() ? `?${searchParams}` : ''}`;
  const reponse = await fetch(url);
  return gererReponse<ClientAvecStats[]>(reponse);
}

export async function recupererClient(id: string): Promise<ClientComplet> {
  const reponse = await fetch(`${API_BASE}/clients/${id}`);
  return gererReponse<ClientComplet>(reponse);
}

export async function creerClient(donnees: ClientCreation): Promise<ClientAvecStats> {
  const reponse = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
  });
  return gererReponse<ClientAvecStats>(reponse);
}

export async function mettreAJourClient(
  id: string,
  donnees: Partial<ClientCreation>
): Promise<ClientAvecStats> {
  const reponse = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
  });
  return gererReponse<ClientAvecStats>(reponse);
}

export async function supprimerClient(id: string): Promise<void> {
  const reponse = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'DELETE',
  });
  await gererReponse<{ message: string }>(reponse);
}

// --- Contacts ---

export interface Contact {
  id: string;
  clientId: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  role: string | null;
  client?: {
    id: string;
    nom: string;
  };
}

export interface ContactCreation {
  clientId: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  role?: string;
}

export async function recupererContacts(clientId?: string): Promise<Contact[]> {
  const url = clientId
    ? `${API_BASE}/contacts?clientId=${clientId}`
    : `${API_BASE}/contacts`;
  const reponse = await fetch(url);
  return gererReponse<Contact[]>(reponse);
}

export async function creerContact(donnees: ContactCreation): Promise<Contact> {
  const reponse = await fetch(`${API_BASE}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
  });
  return gererReponse<Contact>(reponse);
}

export async function mettreAJourContact(
  id: string,
  donnees: Partial<Omit<ContactCreation, 'clientId'>>
): Promise<Contact> {
  const reponse = await fetch(`${API_BASE}/contacts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
  });
  return gererReponse<Contact>(reponse);
}

export async function supprimerContact(id: string): Promise<void> {
  const reponse = await fetch(`${API_BASE}/contacts/${id}`, {
    method: 'DELETE',
  });
  await gererReponse<{ message: string }>(reponse);
}

// --- Opportunités ---

export interface Opportunite {
  id: string;
  clientId: string;
  titre: string;
  descriptionCourte: string | null;
  montantEstime: number | null;
  devise: string;
  probabilite: number | null;
  dateCloturePrevue: string | null;
  etapePipeline: string;
  raisonPerdu: string | null;
  proprietaireId: string;
  dateCreation: string;
  dateMiseAJour: string;
  // Champs paiement Stripe
  statutPaiement: string;
  urlPaiement: string | null;
  stripeSessionId: string | null;
  client?: {
    id: string;
    nom: string;
  };
  proprietaire?: {
    id: string;
    nomAffiche: string;
  };
}

export interface OpportuniteCreation {
  clientId: string;
  titre: string;
  descriptionCourte?: string;
  montantEstime?: number;
  devise?: string;
  probabilite?: number;
  dateCloturePrevue?: string;
  etapePipeline?: string;
}

export async function recupererOpportunites(params?: {
  clientId?: string;
  etapePipeline?: string;
}): Promise<Opportunite[]> {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  if (params?.etapePipeline) searchParams.set('etapePipeline', params.etapePipeline);

  const url = `${API_BASE}/opportunites${searchParams.toString() ? `?${searchParams}` : ''}`;
  const reponse = await fetch(url);
  return gererReponse<Opportunite[]>(reponse);
}

export async function recupererOpportunite(id: string): Promise<Opportunite> {
  const reponse = await fetch(`${API_BASE}/opportunites/${id}`);
  return gererReponse<Opportunite>(reponse);
}

export async function creerOpportunite(donnees: OpportuniteCreation): Promise<Opportunite> {
  const reponse = await fetch(`${API_BASE}/opportunites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
  });
  return gererReponse<Opportunite>(reponse);
}

export async function mettreAJourOpportunite(
  id: string,
  donnees: Partial<Omit<OpportuniteCreation, 'clientId'>>
): Promise<Opportunite> {
  const reponse = await fetch(`${API_BASE}/opportunites/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
  });
  return gererReponse<Opportunite>(reponse);
}

export async function supprimerOpportunite(id: string): Promise<void> {
  const reponse = await fetch(`${API_BASE}/opportunites/${id}`, {
    method: 'DELETE',
  });
  await gererReponse<{ message: string }>(reponse);
}

// --- Paiements Stripe ---

export interface ResultatPaiement {
  urlPaiement: string;
  sessionId: string;
  statutPaiement: string;
}

export async function genererLienPaiement(opportuniteId: string): Promise<ResultatPaiement> {
  const reponse = await fetch(`${API_BASE}/paiements/stripe/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportuniteId }),
  });
  return gererReponse<ResultatPaiement>(reponse);
}

// --- Portail Client ---

export interface ResultatPortail {
  token: string;
  urlPortail: string;
}

export async function genererLienPortail(clientId: string): Promise<ResultatPortail> {
  const reponse = await fetch(`${API_BASE}/clients/${clientId}/portail`, {
    method: 'POST',
  });
  return gererReponse<ResultatPortail>(reponse);
}

export async function revoquerPortail(clientId: string): Promise<void> {
  const reponse = await fetch(`${API_BASE}/clients/${clientId}/portail`, {
    method: 'DELETE',
  });
  await gererReponse<{ message: string }>(reponse);
}

// --- Emails (Inbox) ---

export interface EmailCreation {
  sujet: string;
  contenu: string;
  direction: 'entrant' | 'sortant';
  dateEmail?: string;
}

export async function enregistrerEmail(clientId: string, email: EmailCreation): Promise<EvenementTimeline> {
  const reponse = await fetch(`${API_BASE}/clients/${clientId}/emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
  });
  return gererReponse<EvenementTimeline>(reponse);
}

export async function modifierEmail(clientId: string, emailId: string, email: EmailCreation): Promise<EvenementTimeline> {
  const reponse = await fetch(`${API_BASE}/clients/${clientId}/emails/${emailId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
  });
  return gererReponse<EvenementTimeline>(reponse);
}

export async function supprimerEmail(clientId: string, emailId: string): Promise<void> {
  const reponse = await fetch(`${API_BASE}/clients/${clientId}/emails/${emailId}`, {
    method: 'DELETE',
  });
  await gererReponse<{ message: string }>(reponse);
}

// --- Tickets ---

export interface Ticket {
  id: string;
  clientId: string;
  sujet: string;
  description: string;
  typeTicket: string;
  priorite: string;
  statutTicket: string;
  assigneId: string | null;
  dateCreation: string;
  dateMiseAJour: string;
  dateResolution: string | null;
  client?: {
    id: string;
    nom: string;
  };
  assigne?: {
    id: string;
    nomAffiche: string;
  } | null;
}

export interface TicketCreation {
  clientId: string;
  sujet: string;
  description: string;
  typeTicket: 'bug' | 'question' | 'demande_evolution';
  priorite?: 'basse' | 'normale' | 'haute';
}

export async function recupererTickets(params?: {
  clientId?: string;
  statutTicket?: string;
  priorite?: string;
  recherche?: string;
}): Promise<Ticket[]> {
  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  if (params?.statutTicket) searchParams.set('statutTicket', params.statutTicket);
  if (params?.priorite) searchParams.set('priorite', params.priorite);
  if (params?.recherche) searchParams.set('recherche', params.recherche);

  const url = `${API_BASE}/tickets${searchParams.toString() ? `?${searchParams}` : ''}`;
  const reponse = await fetch(url);
  return gererReponse<Ticket[]>(reponse);
}

export async function recupererTicket(id: string): Promise<Ticket> {
  const reponse = await fetch(`${API_BASE}/tickets/${id}`);
  return gererReponse<Ticket>(reponse);
}

export async function creerTicket(donnees: TicketCreation): Promise<Ticket> {
  const reponse = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
  });
  return gererReponse<Ticket>(reponse);
}

export async function mettreAJourTicket(
  id: string,
  donnees: Partial<Omit<TicketCreation, 'clientId'>> & { statutTicket?: string; assigneId?: string | null }
): Promise<Ticket> {
  const reponse = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees),
  });
  return gererReponse<Ticket>(reponse);
}

export async function supprimerTicket(id: string): Promise<void> {
  const reponse = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'DELETE',
  });
  await gererReponse<{ message: string }>(reponse);
}

// --- Timeline ---

export interface EvenementTimeline {
  id: string;
  clientId: string;
  typeEvenement: string;
  referenceId: string | null;
  descriptionTexte: string;
  dateEvenement: string;
  auteurId: string | null;
}

// --- Dashboard ---

export interface DashboardStats {
  totalClients: number;
  clientsProspects: number;
  clientsActifs: number;
  totalOpportunites: number;
  opportunitesEnCours: number;
  ticketsOuverts: number;
  ticketsResolus: number;
  caEstime: number;
  caPondere: number;
  caGagne: number;
}

export interface RepartitionPipeline {
  etape: string;
  label: string;
  count: number;
  montant: number;
}

export interface DashboardData {
  stats: DashboardStats;
  repartitionPipeline: RepartitionPipeline[];
  dernieresOpportunites: Opportunite[];
  derniersTickets: Ticket[];
  derniersClients: ClientAvecStats[];
}

export async function recupererDashboard(): Promise<DashboardData> {
  const reponse = await fetch(`${API_BASE}/dashboard`);
  return gererReponse<DashboardData>(reponse);
}
