import { z } from 'zod';

// --- Client ---

export const clientCreationSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  typeClient: z.enum(['freelance', 'agence', 'entreprise', 'particulier']),
  emailPrincipal: z.string().email('Email invalide').optional().or(z.literal('')),
  telephonePrincipal: z.string().optional(),
  statutClient: z.enum(['prospect', 'client']).default('prospect'),
  noteInterne: z.string().optional(),

  // Informations entreprise / organisation
  raisonSociale: z.string().optional(),
  siteWeb: z.string().optional(),
  adresseLigne1: z.string().optional(),
  adresseLigne2: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  siret: z.string().optional(),
  numeroTva: z.string().optional(),
  secteurActivite: z.string().optional(),
  tailleEntreprise: z.string().optional(),
});

export const clientMiseAJourSchema = clientCreationSchema.partial();

export type ClientCreationInput = z.infer<typeof clientCreationSchema>;
export type ClientMiseAJourInput = z.infer<typeof clientMiseAJourSchema>;

// --- Contact ---

export const contactCreationSchema = z.object({
  clientId: z.string().min(1, 'Le client est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  role: z.string().optional(),
});

export const contactMiseAJourSchema = contactCreationSchema.partial().omit({ clientId: true });

export type ContactCreationInput = z.infer<typeof contactCreationSchema>;
export type ContactMiseAJourInput = z.infer<typeof contactMiseAJourSchema>;

// --- Opportunité ---

export const opportuniteCreationSchema = z.object({
  clientId: z.string().min(1, 'Le client est requis'),
  titre: z.string().min(1, 'Le titre est requis'),
  descriptionCourte: z.string().optional(),
  montantEstime: z.number().min(0).optional(),
  devise: z.string().default('EUR'),
  probabilite: z.number().min(0).max(100).optional(),
  dateCloturePrevue: z.string().optional(),
  etapePipeline: z
    .enum(['lead', 'qualifie', 'proposition_envoyee', 'negociation', 'gagne', 'perdu'])
    .default('lead'),
});

export const opportuniteMiseAJourSchema = opportuniteCreationSchema.partial().omit({ clientId: true });

export type OpportuniteCreationInput = z.infer<typeof opportuniteCreationSchema>;
export type OpportuniteMiseAJourInput = z.infer<typeof opportuniteMiseAJourSchema>;

// --- Ticket ---

export const ticketCreationSchema = z.object({
  clientId: z.string().min(1, 'Le client est requis'),
  sujet: z.string().min(1, 'Le sujet est requis'),
  description: z.string().min(1, 'La description est requise'),
  typeTicket: z.enum(['bug', 'question', 'demande_evolution']),
  priorite: z.enum(['basse', 'normale', 'haute']).default('normale'),
});

export const ticketMiseAJourSchema = z.object({
  sujet: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  typeTicket: z.enum(['bug', 'question', 'demande_evolution']).optional(),
  priorite: z.enum(['basse', 'normale', 'haute']).optional(),
  statutTicket: z.enum(['nouveau', 'en_cours', 'resolu']).optional(),
  assigneId: z.string().optional().nullable(),
});

export type TicketCreationInput = z.infer<typeof ticketCreationSchema>;
export type TicketMiseAJourInput = z.infer<typeof ticketMiseAJourSchema>;
