// DTOs pour l'API (front ↔ back)

import type { EtapePipeline } from './models';

// --- Utilisateur ---

export interface UtilisateurDto {
  id: string;
  email: string;
  nomAffiche: string;
  role: 'freelance_solo' | 'membre_agence' | 'admin';
  fuseauHoraire: string;
  langueInterface: string;
}

// --- Client ---

export interface ClientDto {
  id: string;
  nom: string;
  typeClient: 'freelance' | 'agence' | 'entreprise' | 'particulier';
  emailPrincipal?: string;
  telephonePrincipal?: string;
  statutClient: 'prospect' | 'client';
  noteInterne?: string;
  proprietaireUtilisateurId: string;
  dateCreation: string;
  dateMiseAJour: string;
}

export interface ClientCreationDto {
  nom: string;
  typeClient: 'freelance' | 'agence' | 'entreprise' | 'particulier';
  emailPrincipal?: string;
  telephonePrincipal?: string;
  statutClient?: 'prospect' | 'client';
  noteInterne?: string;
  proprietaireUtilisateurId?: string;
}

export interface ClientMiseAJourDto {
  nom?: string;
  typeClient?: 'freelance' | 'agence' | 'entreprise' | 'particulier';
  emailPrincipal?: string;
  telephonePrincipal?: string;
  statutClient?: 'prospect' | 'client';
  noteInterne?: string;
  proprietaireUtilisateurId?: string;
}

// --- Contact ---

export interface ContactDto {
  id: string;
  clientId: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  role?: string;
}

export interface ContactCreationDto {
  clientId: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  role?: string;
}

export interface ContactMiseAJourDto {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  role?: string;
}

// --- Opportunité ---

export interface OpportuniteDto {
  id: string;
  clientId: string;
  contactPrincipalId?: string;
  titre: string;
  descriptionCourte?: string;
  montantEstime?: number;
  devise?: string;
  probabilite?: number;
  dateCloturePrevue?: string;
  etapePipeline: EtapePipeline;
  raisonPerdu?: string;
  proprietaireUtilisateurId: string;
  dateCreation: string;
  dateMiseAJour: string;
}

export interface OpportuniteCreationDto {
  clientId: string;
  contactPrincipalId?: string;
  titre: string;
  descriptionCourte?: string;
  montantEstime?: number;
  devise?: string;
  probabilite?: number;
  dateCloturePrevue?: string;
  etapePipeline?: EtapePipeline;
  proprietaireUtilisateurId?: string;
}

export interface OpportuniteMiseAJourDto {
  contactPrincipalId?: string;
  titre?: string;
  descriptionCourte?: string;
  montantEstime?: number;
  devise?: string;
  probabilite?: number;
  dateCloturePrevue?: string;
  etapePipeline?: EtapePipeline;
  raisonPerdu?: string;
  proprietaireUtilisateurId?: string;
}

// --- Ticket ---

export interface TicketDto {
  id: string;
  clientId: string;
  contactId?: string;
  sujet: string;
  description: string;
  typeTicket: 'bug' | 'question' | 'demande_evolution';
  priorite: 'basse' | 'normale' | 'haute';
  statutTicket: 'nouveau' | 'en_cours' | 'resolu';
  assigneAUtilisateurId?: string;
  dateCreation: string;
  dateMiseAJour: string;
  dateResolution?: string;
}

export interface TicketCreationDto {
  clientId: string;
  contactId?: string;
  sujet: string;
  description: string;
  typeTicket: 'bug' | 'question' | 'demande_evolution';
  priorite?: 'basse' | 'normale' | 'haute';
}

export interface TicketMiseAJourDto {
  sujet?: string;
  description?: string;
  typeTicket?: 'bug' | 'question' | 'demande_evolution';
  priorite?: 'basse' | 'normale' | 'haute';
  statutTicket?: 'nouveau' | 'en_cours' | 'resolu';
  assigneAUtilisateurId?: string;
  dateResolution?: string;
}

// --- Événement Timeline ---

export interface EvenementTimelineDto {
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
  auteurUtilisateurId?: string;
}

export interface EvenementTimelineCreationDto {
  clientId: string;
  typeEvenement:
    | 'opportunite_creee'
    | 'opportunite_etape_changee'
    | 'ticket_cree'
    | 'ticket_statut_change'
    | 'note_client';
  referenceId?: string;
  descriptionTexte: string;
}
