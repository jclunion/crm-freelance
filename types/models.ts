// Types des modèles persistés (miroir du schéma Prisma)

export interface Utilisateur {
  id: string;
  email: string;
  nomAffiche: string;
  role: 'freelance_solo' | 'membre_agence' | 'admin';
  fuseauHoraire: string;
  langueInterface: string;
  dateCreation: string;
  dateMiseAJour: string;
}

export interface Client {
  id: string;
  nom: string;
  typeClient: 'freelance' | 'agence' | 'entreprise' | 'particulier';
  emailPrincipal?: string;
  telephonePrincipal?: string;
  statutClient: 'prospect' | 'client';
  noteInterne?: string;
  proprietaireId: string;
  dateCreation: string;
  dateMiseAJour: string;
}

export interface Contact {
  id: string;
  clientId: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  role?: string;
}

export interface Opportunite {
  id: string;
  clientId: string;
  titre: string;
  descriptionCourte?: string;
  montantEstime?: number;
  devise: string;
  probabilite?: number;
  dateCloturePrevue?: string;
  etapePipeline: EtapePipeline;
  raisonPerdu?: string;
  proprietaireId: string;
  dateCreation: string;
  dateMiseAJour: string;
}

export type EtapePipeline =
  | 'lead'
  | 'qualifie'
  | 'proposition_envoyee'
  | 'negociation'
  | 'gagne'
  | 'perdu';

export interface Ticket {
  id: string;
  clientId: string;
  sujet: string;
  description: string;
  typeTicket: 'bug' | 'question' | 'demande_evolution';
  priorite: 'basse' | 'normale' | 'haute';
  statutTicket: 'nouveau' | 'en_cours' | 'resolu';
  assigneId?: string;
  dateCreation: string;
  dateMiseAJour: string;
  dateResolution?: string;
}

export interface EvenementTimeline {
  id: string;
  clientId: string;
  typeEvenement:
    | 'opportunite_creee'
    | 'opportunite_etape_changee'
    | 'ticket_cree'
    | 'ticket_statut_change'
    | 'note_client';
  referenceId?: string;
  descriptionTexte: string;
  dateEvenement: string;
  auteurId?: string;
}
