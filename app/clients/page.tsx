'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClients } from '@/lib/hooks';
import { ModaleNouveauClient } from '@/components/clients/ModaleNouveauClient';
import { PanneauFiltres } from '@/components/filtres/PanneauFiltres';
import { BoutonExportCSV } from '@/components/ui/BoutonExportCSV';
import { colonnesClients } from '@/lib/export-csv';

const badgeTypeClient: Record<string, string> = {
  freelance: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  agence: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  entreprise: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  particulier: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const badgeStatut: Record<string, string> = {
  prospect: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  client: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const configFiltresClients = [
  {
    id: 'statutClient',
    label: 'Statut',
    type: 'select' as const,
    options: [
      { valeur: 'prospect', label: 'Prospect' },
      { valeur: 'client', label: 'Client' },
    ],
  },
  {
    id: 'typeClient',
    label: 'Type',
    type: 'select' as const,
    options: [
      { valeur: 'freelance', label: 'Freelance' },
      { valeur: 'agence', label: 'Agence' },
      { valeur: 'entreprise', label: 'Entreprise' },
      { valeur: 'particulier', label: 'Particulier' },
    ],
  },
  {
    id: 'dateCreation',
    label: 'Date de création',
    type: 'dateRange' as const,
  },
];

export default function ListeClients() {
  const [recherche, setRecherche] = useState('');
  const [filtres, setFiltres] = useState<Record<string, string | number | undefined>>({});
  const [modaleOuverte, setModaleOuverte] = useState(false);

  const { data: clients, isLoading, error } = useClients({
    recherche: recherche || undefined,
    statutClient: filtres.statutClient as string | undefined,
    typeClient: filtres.typeClient as string | undefined,
  });

  // Filtrage côté client pour les dates (l'API ne supporte pas encore)
  const clientsFiltres = useMemo(() => {
    if (!clients) return [];
    
    return clients.filter((client) => {
      // Filtre par date de création
      if (filtres.dateCreationDebut) {
        const dateDebut = new Date(filtres.dateCreationDebut as string);
        const dateClient = new Date(client.dateCreation);
        if (dateClient < dateDebut) return false;
      }
      if (filtres.dateCreationFin) {
        const dateFin = new Date(filtres.dateCreationFin as string);
        dateFin.setHours(23, 59, 59, 999);
        const dateClient = new Date(client.dateCreation);
        if (dateClient > dateFin) return false;
      }
      
      return true;
    });
  }, [clients, filtres]);

  const gererChangementFiltre = (id: string, valeur: string | number | undefined) => {
    setFiltres((prev) => ({ ...prev, [id]: valeur }));
  };

  const reinitialiserFiltres = () => {
    setFiltres({});
    setRecherche('');
  };

  return (
    <div className="flex flex-col">
      <PageHeader titre="Clients" description="Gérez vos clients et prospects">
        <BoutonExportCSV
          donnees={clientsFiltres.map((c) => ({
            ...c,
            dateCreation: new Date(c.dateCreation).toLocaleDateString('fr-FR'),
          }))}
          colonnes={colonnesClients}
          nomFichier="clients"
        />
        <button
          onClick={() => setModaleOuverte(true)}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nouveau client
        </button>
      </PageHeader>

      <div className="p-6">
        {/* Barre de recherche */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* Filtres avancés */}
        <div className="mb-6">
          <PanneauFiltres
            filtres={configFiltresClients}
            valeurs={filtres}
            onChange={gererChangementFiltre}
            onReinitialiser={reinitialiserFiltres}
            nombreResultats={clientsFiltres.length}
          />
        </div>

        {/* État de chargement */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            Erreur lors du chargement des clients
          </div>
        )}

        {/* Table des clients */}
        {!isLoading && !error && (
          <div className="overflow-hidden rounded-lg border border-[var(--border)]">
            <table className="w-full">
              <thead className="bg-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                    Téléphone
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {clientsFiltres && clientsFiltres.length > 0 ? (
                  clientsFiltres.map((client) => (
                    <tr
                      key={client.id}
                      className="transition-colors hover:bg-[var(--border)]/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                        >
                          {client.nom}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            badgeTypeClient[client.typeClient] || ''
                          }`}
                        >
                          {client.typeClient}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            badgeStatut[client.statutClient] || ''
                          }`}
                        >
                          {client.statutClient}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted)]">
                        {client.emailPrincipal || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted)]">
                        {client.telephonePrincipal || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">
                      Aucun client trouvé. Créez votre premier client !
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale de création */}
      <ModaleNouveauClient
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
      />
    </div>
  );
}
