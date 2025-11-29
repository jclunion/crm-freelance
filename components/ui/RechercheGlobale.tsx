'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Users,
  Target,
  Ticket,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useClients, useOpportunites, useTickets } from '@/lib/hooks';

interface ResultatRecherche {
  id: string;
  type: 'client' | 'opportunite' | 'ticket';
  titre: string;
  sousTitre?: string;
  url: string;
}

export function RechercheGlobale() {
  const [ouverte, setOuverte] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [indexSelectionne, setIndexSelectionne] = useState(0);
  const router = useRouter();

  const { data: clients } = useClients({});
  const { data: opportunites } = useOpportunites();
  const { data: tickets } = useTickets({});

  // Raccourci clavier Cmd+K / Ctrl+K
  useEffect(() => {
    const gererRaccourci = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOuverte(true);
      }
      if (e.key === 'Escape') {
        setOuverte(false);
      }
    };

    document.addEventListener('keydown', gererRaccourci);
    return () => document.removeEventListener('keydown', gererRaccourci);
  }, []);

  // Réinitialiser à l'ouverture
  useEffect(() => {
    if (ouverte) {
      setRecherche('');
      setIndexSelectionne(0);
    }
  }, [ouverte]);

  // Recherche dans les données
  const resultats = useMemo((): ResultatRecherche[] => {
    if (!recherche.trim()) return [];

    const rechLower = recherche.toLowerCase();
    const resultats: ResultatRecherche[] = [];

    // Recherche dans les clients
    (clients || []).forEach((client) => {
      if (
        client.nom.toLowerCase().includes(rechLower) ||
        client.emailPrincipal?.toLowerCase().includes(rechLower)
      ) {
        resultats.push({
          id: client.id,
          type: 'client',
          titre: client.nom,
          sousTitre: `${client.typeClient} • ${client.statutClient}`,
          url: `/clients/${client.id}`,
        });
      }
    });

    // Recherche dans les opportunités
    (opportunites || []).forEach((opp) => {
      if (
        opp.titre.toLowerCase().includes(rechLower) ||
        opp.client?.nom?.toLowerCase().includes(rechLower)
      ) {
        resultats.push({
          id: opp.id,
          type: 'opportunite',
          titre: opp.titre,
          sousTitre: opp.client?.nom || 'Sans client',
          url: `/opportunites`,
        });
      }
    });

    // Recherche dans les tickets
    (tickets || []).forEach((ticket) => {
      if (
        ticket.sujet.toLowerCase().includes(rechLower) ||
        ticket.client?.nom?.toLowerCase().includes(rechLower)
      ) {
        resultats.push({
          id: ticket.id,
          type: 'ticket',
          titre: ticket.sujet,
          sousTitre: ticket.client?.nom || 'Sans client',
          url: `/tickets`,
        });
      }
    });

    return resultats.slice(0, 10); // Limiter à 10 résultats
  }, [recherche, clients, opportunites, tickets]);

  // Navigation clavier dans les résultats
  const gererToucheClavier = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndexSelectionne((prev) => Math.min(prev + 1, resultats.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndexSelectionne((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && resultats[indexSelectionne]) {
        e.preventDefault();
        naviguerVers(resultats[indexSelectionne]);
      }
    },
    [resultats, indexSelectionne]
  );

  const naviguerVers = (resultat: ResultatRecherche) => {
    router.push(resultat.url);
    setOuverte(false);
  };

  const getIcone = (type: ResultatRecherche['type']) => {
    switch (type) {
      case 'client':
        return <Users className="h-4 w-4" />;
      case 'opportunite':
        return <Target className="h-4 w-4" />;
      case 'ticket':
        return <Ticket className="h-4 w-4" />;
    }
  };

  const getLabel = (type: ResultatRecherche['type']) => {
    switch (type) {
      case 'client':
        return 'Client';
      case 'opportunite':
        return 'Opportunité';
      case 'ticket':
        return 'Ticket';
    }
  };

  if (!ouverte) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOuverte(false)}
      />

      {/* Modale de recherche */}
      <div className="relative z-10 w-full max-w-xl animate-slide-down rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Barre de recherche */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <Search className="h-5 w-5 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Rechercher clients, opportunités, tickets..."
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value);
              setIndexSelectionne(0);
            }}
            onKeyDown={gererToucheClavier}
            autoFocus
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-[var(--muted)]"
          />
          <button
            onClick={() => setOuverte(false)}
            className="rounded-lg p-1 text-[var(--muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Résultats */}
        <div className="max-h-80 overflow-y-auto p-2">
          {recherche.trim() === '' ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[var(--muted)]">
                Commencez à taper pour rechercher...
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
                <kbd className="rounded bg-[var(--border)] px-2 py-1 font-mono text-xs">↑</kbd>
                <kbd className="rounded bg-[var(--border)] px-2 py-1 font-mono text-xs">↓</kbd>
                <span>pour naviguer</span>
                <kbd className="rounded bg-[var(--border)] px-2 py-1 font-mono text-xs">↵</kbd>
                <span>pour sélectionner</span>
              </div>
            </div>
          ) : resultats.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[var(--muted)]">
                Aucun résultat pour "{recherche}"
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {resultats.map((resultat, index) => (
                <button
                  key={`${resultat.type}-${resultat.id}`}
                  onClick={() => naviguerVers(resultat)}
                  onMouseEnter={() => setIndexSelectionne(index)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    index === indexSelectionne
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'hover:bg-[var(--border)]'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      index === indexSelectionne
                        ? 'bg-white/20'
                        : 'bg-[var(--border)]'
                    }`}
                  >
                    {getIcone(resultat.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{resultat.titre}</p>
                    <p
                      className={`truncate text-sm ${
                        index === indexSelectionne
                          ? 'text-white/70'
                          : 'text-[var(--muted)]'
                      }`}
                    >
                      {resultat.sousTitre}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      index === indexSelectionne
                        ? 'bg-white/20'
                        : 'bg-[var(--border)]'
                    }`}
                  >
                    {getLabel(resultat.type)}
                  </span>
                  <ArrowRight
                    className={`h-4 w-4 ${
                      index === indexSelectionne ? '' : 'text-[var(--muted)]'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[var(--border)] px-1.5 py-0.5 font-mono">Esc</kbd>
              pour fermer
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>+</span>
            <kbd className="rounded bg-[var(--border)] px-1.5 py-0.5 font-mono">K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bouton pour ouvrir la recherche (à placer dans la sidebar ou le header)
export function BoutonRechercheGlobale() {
  const [, setOuverte] = useState(false);

  const ouvrirRecherche = () => {
    // Simuler Cmd+K
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      onClick={ouvrirRecherche}
      className="flex w-full items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--foreground)]"
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left">Rechercher...</span>
      <kbd className="hidden rounded bg-[var(--border)] px-1.5 py-0.5 font-mono text-xs sm:inline-block">
        ⌘K
      </kbd>
    </button>
  );
}
