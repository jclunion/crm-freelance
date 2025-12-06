'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Loader2,
  Users,
  UserCheck,
  UserPlus,
  Building2,
  List,
  LayoutGrid,
  Filter,
  ChevronDown,
  Columns,
  X,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { useClients } from '@/lib/hooks';
import { ModaleNouveauClient } from '@/components/clients/ModaleNouveauClient';
import { BoutonExportCSV } from '@/components/ui/BoutonExportCSV';
import { colonnesClients } from '@/lib/export-csv';
import { formaterDate } from '@/lib/utils';

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

// Configuration des colonnes affichables
interface ColonneConfig {
  id: string;
  label: string;
  visible: boolean;
  obligatoire?: boolean;
}

const colonnesParDefaut: ColonneConfig[] = [
  { id: 'nom', label: 'Nom', visible: true, obligatoire: true },
  { id: 'type', label: 'Type', visible: true },
  { id: 'statut', label: 'Statut', visible: true },
  { id: 'email', label: 'Email', visible: true },
  { id: 'telephone', label: 'Téléphone', visible: true },
  { id: 'dateCreation', label: 'Date création', visible: false },
  { id: 'opportunites', label: 'Opportunités', visible: false },
  { id: 'tickets', label: 'Tickets', visible: false },
];

type VueType = 'liste' | 'grille';

export default function ListeClients() {
  const [recherche, setRecherche] = useState('');
  const [filtres, setFiltres] = useState<Record<string, string | undefined>>({});
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [vue, setVue] = useState<VueType>('liste');
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [colonnesOuvertes, setColonnesOuvertes] = useState(false);
  const [colonnes, setColonnes] = useState<ColonneConfig[]>(colonnesParDefaut);

  const { data: clients, isLoading, error } = useClients({
    recherche: recherche || undefined,
    statutClient: filtres.statutClient,
    typeClient: filtres.typeClient,
  });

  // Statistiques
  const stats = useMemo(() => {
    if (!clients) return { total: 0, clients: 0, prospects: 0 };
    const clientsActifs = clients.filter((c) => c.statutClient === 'client').length;
    const prospects = clients.filter((c) => c.statutClient === 'prospect').length;
    return { total: clients.length, clients: clientsActifs, prospects };
  }, [clients]);

  // Filtrage côté client
  const clientsFiltres = useMemo(() => {
    if (!clients) return [];
    return clients;
  }, [clients]);

  // Nombre de filtres actifs
  const nombreFiltresActifs = Object.values(filtres).filter(Boolean).length;

  // Toggle colonne
  const toggleColonne = (id: string) => {
    setColonnes((prev) =>
      prev.map((col) =>
        col.id === id && !col.obligatoire ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Colonnes visibles
  const colonnesVisibles = colonnes.filter((col) => col.visible);

  return (
    <div className="flex h-full flex-col">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        {/* Ligne 1 : Titre + Actions */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-sm text-[var(--muted)]">Gérez vos clients et prospects</p>
          </div>
          <div className="flex items-center gap-3">
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
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Nouveau client
            </button>
          </div>
        </div>

        {/* Ligne 2 : Statistiques */}
        <div className="flex gap-6 border-t border-[var(--border)] px-6 py-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">Total</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-500" />
            <span className="text-sm text-[var(--muted)]">Clients</span>
            <span className="font-semibold text-green-600">{stats.clients}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-[var(--muted)]">Prospects</span>
            <span className="font-semibold text-yellow-600">{stats.prospects}</span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          BARRE DISPLAY
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-3">
        {/* Gauche : Recherche + Filtres */}
        <div className="flex items-center gap-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-64 rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          {/* Bouton Filtres */}
          <button
            onClick={() => setFiltresOuverts(!filtresOuverts)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              filtresOuverts || nombreFiltresActifs > 0
                ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'border-[var(--border)] hover:bg-[var(--border)]'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {nombreFiltresActifs > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-xs text-[var(--primary-foreground)]">
                {nombreFiltresActifs}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${filtresOuverts ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Droite : Colonnes + Vue */}
        <div className="flex items-center gap-3">
          {/* Sélecteur de colonnes */}
          <div className="relative">
            <button
              onClick={() => setColonnesOuvertes(!colonnesOuvertes)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                colonnesOuvertes
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'border-[var(--border)] hover:bg-[var(--border)]'
              }`}
            >
              <Columns className="h-4 w-4" />
              Colonnes
              <ChevronDown className={`h-4 w-4 transition-transform ${colonnesOuvertes ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown colonnes */}
            {colonnesOuvertes && (
              <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 shadow-lg animate-slide-down">
                <p className="mb-2 px-2 text-xs font-medium text-[var(--muted)]">Colonnes visibles</p>
                {colonnes.map((col) => (
                  <label
                    key={col.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[var(--border)] ${
                      col.obligatoire ? 'opacity-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={col.visible}
                      disabled={col.obligatoire}
                      onChange={() => toggleColonne(col.id)}
                      className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Vue */}
          <div className="flex rounded-lg border border-[var(--border)] p-1">
            <button
              onClick={() => setVue('liste')}
              className={`rounded-md p-1.5 transition-colors ${
                vue === 'liste' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'hover:bg-[var(--border)]'
              }`}
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setVue('grille')}
              className={`rounded-md p-1.5 transition-colors ${
                vue === 'grille' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'hover:bg-[var(--border)]'
              }`}
              title="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Panneau de filtres (collapsible) */}
      {filtresOuverts && (
        <div className="animate-slide-down border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Filtre Statut */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Statut</label>
              <select
                value={filtres.statutClient || ''}
                onChange={(e) => setFiltres((prev) => ({ ...prev, statutClient: e.target.value || undefined }))}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">Tous</option>
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
              </select>
            </div>

            {/* Filtre Type */}
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Type</label>
              <select
                value={filtres.typeClient || ''}
                onChange={(e) => setFiltres((prev) => ({ ...prev, typeClient: e.target.value || undefined }))}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">Tous</option>
                <option value="freelance">Freelance</option>
                <option value="agence">Agence</option>
                <option value="entreprise">Entreprise</option>
                <option value="particulier">Particulier</option>
              </select>
            </div>

            {/* Bouton réinitialiser */}
            {nombreFiltresActifs > 0 && (
              <button
                onClick={() => setFiltres({})}
                className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENU
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* État de chargement */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            Erreur lors du chargement des clients
          </div>
        )}

        {/* Vue Liste */}
        {!isLoading && !error && vue === 'liste' && (
          <div className="overflow-hidden rounded-lg border border-[var(--border)]">
            <table className="w-full">
              <thead className="bg-[var(--border)]">
                <tr>
                  {colonnesVisibles.map((col) => (
                    <th key={col.id} className="px-4 py-3 text-left text-sm font-medium text-[var(--muted)]">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {clientsFiltres.length > 0 ? (
                  clientsFiltres.map((client) => (
                    <tr key={client.id} className="transition-colors hover:bg-[var(--card)]">
                      {colonnesVisibles.map((col) => (
                        <td key={col.id} className="px-4 py-3">
                          {col.id === 'nom' && (
                            <Link
                              href={`/clients/${client.id}`}
                              className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
                            >
                              {client.nom}
                            </Link>
                          )}
                          {col.id === 'type' && (
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${badgeTypeClient[client.typeClient] || ''}`}>
                              {client.typeClient}
                            </span>
                          )}
                          {col.id === 'statut' && (
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${badgeStatut[client.statutClient] || ''}`}>
                              {client.statutClient}
                            </span>
                          )}
                          {col.id === 'email' && (
                            <span className="text-sm text-[var(--muted)]">{client.emailPrincipal || '—'}</span>
                          )}
                          {col.id === 'telephone' && (
                            <span className="text-sm text-[var(--muted)]">{client.telephonePrincipal || '—'}</span>
                          )}
                          {col.id === 'dateCreation' && (
                            <span className="text-sm text-[var(--muted)]">{formaterDate(client.dateCreation)}</span>
                          )}
                          {col.id === 'opportunites' && (
                            <span className="text-sm font-medium">{client._count?.opportunites || 0}</span>
                          )}
                          {col.id === 'tickets' && (
                            <span className="text-sm font-medium">{client._count?.tickets || 0}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={colonnesVisibles.length} className="px-4 py-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-[var(--muted)]" />
                      <p className="mt-4 text-[var(--muted)]">Aucun client trouvé</p>
                      <button
                        onClick={() => setModaleOuverte(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
                      >
                        <Plus className="h-4 w-4" />
                        Créer un client
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Vue Grille */}
        {!isLoading && !error && vue === 'grille' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clientsFiltres.length > 0 ? (
              clientsFiltres.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="hover-lift rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${badgeStatut[client.statutClient] || ''}`}>
                      {client.statutClient}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold">{client.nom}</h3>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeTypeClient[client.typeClient] || ''}`}>
                    {client.typeClient}
                  </span>
                  <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                    {client.emailPrincipal && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{client.emailPrincipal}</span>
                      </div>
                    )}
                    {client.telephonePrincipal && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{client.telephonePrincipal}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formaterDate(client.dateCreation)}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-[var(--muted)]" />
                <p className="mt-4 text-[var(--muted)]">Aucun client trouvé</p>
                <button
                  onClick={() => setModaleOuverte(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
                >
                  <Plus className="h-4 w-4" />
                  Créer un client
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fermer dropdown colonnes si clic ailleurs */}
      {colonnesOuvertes && (
        <div className="fixed inset-0 z-10" onClick={() => setColonnesOuvertes(false)} />
      )}

      {/* Modale de création */}
      <ModaleNouveauClient
        ouverte={modaleOuverte}
        onFermer={() => setModaleOuverte(false)}
      />
    </div>
  );
}
