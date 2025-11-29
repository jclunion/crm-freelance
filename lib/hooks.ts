'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  recupererClients,
  recupererClient,
  creerClient,
  mettreAJourClient,
  supprimerClient,
  recupererOpportunites,
  creerOpportunite,
  mettreAJourOpportunite,
  supprimerOpportunite,
  recupererTickets,
  recupererTicket,
  creerTicket,
  mettreAJourTicket,
  supprimerTicket,
  creerContact,
  mettreAJourContact,
  supprimerContact,
  recupererDashboard,
  type ClientCreation,
  type ContactCreation,
  type OpportuniteCreation,
  type TicketCreation,
  type Opportunite,
} from './api';

// --- Hooks Clients ---

export function useClients(params?: {
  recherche?: string;
  statutClient?: string;
  typeClient?: string;
}) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => recupererClients(params),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => recupererClient(id),
    enabled: !!id,
  });
}

export function useCreerClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (donnees: ClientCreation) => creerClient(donnees),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useMettreAJourClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, donnees }: { id: string; donnees: Partial<ClientCreation> }) =>
      mettreAJourClient(id, donnees),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
    },
  });
}

export function useSupprimerClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supprimerClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// --- Hooks Contacts ---

export function useCreerContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (donnees: ContactCreation) => creerContact(donnees),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients', variables.clientId] });
    },
  });
}

export function useMettreAJourContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      donnees,
    }: {
      id: string;
      donnees: Partial<Omit<ContactCreation, 'clientId'>>;
    }) => mettreAJourContact(id, donnees),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useSupprimerContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supprimerContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// --- Hooks Opportunités ---

export function useOpportunites(params?: { clientId?: string; etapePipeline?: string }) {
  return useQuery({
    queryKey: ['opportunites', params],
    queryFn: () => recupererOpportunites(params),
  });
}

export function useCreerOpportunite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (donnees: OpportuniteCreation) => creerOpportunite(donnees),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunites'] });
      queryClient.invalidateQueries({ queryKey: ['clients', variables.clientId] });
    },
  });
}

export function useMettreAJourOpportunite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      donnees,
    }: {
      id: string;
      donnees: Partial<Omit<OpportuniteCreation, 'clientId'>>;
    }) => mettreAJourOpportunite(id, donnees),
    // Mise à jour optimiste pour éviter le flash lors du drag & drop
    onMutate: async ({ id, donnees }) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ['opportunites'] });

      // Sauvegarder l'état précédent
      const previousOpportunites = queryClient.getQueryData(['opportunites']);

      // Mettre à jour le cache de manière optimiste
      queryClient.setQueryData(['opportunites'], (old: Opportunite[] | undefined) => {
        if (!old) return old;
        return old.map((opp) =>
          opp.id === id ? { ...opp, ...donnees } : opp
        );
      });

      // Retourner le contexte avec l'état précédent
      return { previousOpportunites };
    },
    onError: (_err, _variables, context) => {
      // En cas d'erreur, restaurer l'état précédent
      if (context?.previousOpportunites) {
        queryClient.setQueryData(['opportunites'], context.previousOpportunites);
      }
    },
    onSettled: () => {
      // Toujours revalider après la mutation
      queryClient.invalidateQueries({ queryKey: ['opportunites'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useSupprimerOpportunite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supprimerOpportunite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunites'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// --- Hooks Tickets ---

export function useTickets(params?: {
  clientId?: string;
  statutTicket?: string;
  priorite?: string;
  recherche?: string;
}) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => recupererTickets(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => recupererTicket(id),
    enabled: !!id,
  });
}

export function useCreerTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (donnees: TicketCreation) => creerTicket(donnees),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['clients', variables.clientId] });
    },
  });
}

export function useMettreAJourTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      donnees,
    }: {
      id: string;
      donnees: Partial<Omit<TicketCreation, 'clientId'>> & {
        statutTicket?: string;
        assigneId?: string | null;
      };
    }) => mettreAJourTicket(id, donnees),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useSupprimerTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supprimerTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// --- Hook Dashboard ---

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => recupererDashboard(),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
}
