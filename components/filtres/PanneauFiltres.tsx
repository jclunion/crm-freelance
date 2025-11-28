'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface OptionFiltre {
  valeur: string;
  label: string;
}

interface ConfigFiltre {
  id: string;
  label: string;
  type: 'select' | 'date' | 'number' | 'dateRange' | 'numberRange';
  options?: OptionFiltre[];
  placeholder?: string;
  min?: number;
  max?: number;
}

interface PanneauFiltresProps {
  filtres: ConfigFiltre[];
  valeurs: Record<string, string | number | undefined>;
  onChange: (id: string, valeur: string | number | undefined) => void;
  onReinitialiser: () => void;
  nombreResultats?: number;
}

export function PanneauFiltres({
  filtres,
  valeurs,
  onChange,
  onReinitialiser,
  nombreResultats,
}: PanneauFiltresProps) {
  const [ouvert, setOuvert] = useState(false);

  // Compter les filtres actifs
  const filtresActifs = Object.values(valeurs).filter(
    (v) => v !== undefined && v !== ''
  ).length;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)]">
      {/* Header */}
      <button
        onClick={() => setOuvert(!ouvert)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--muted)]" />
          <span className="font-medium">Filtres avancés</span>
          {filtresActifs > 0 && (
            <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-medium text-[var(--primary-foreground)]">
              {filtresActifs}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {nombreResultats !== undefined && (
            <span className="text-sm text-[var(--muted)]">
              {nombreResultats} résultat{nombreResultats > 1 ? 's' : ''}
            </span>
          )}
          {ouvert ? (
            <ChevronUp className="h-4 w-4 text-[var(--muted)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
          )}
        </div>
      </button>

      {/* Contenu des filtres */}
      {ouvert && (
        <div className="border-t border-[var(--border)] p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtres.map((filtre) => (
              <div key={filtre.id}>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">
                  {filtre.label}
                </label>

                {filtre.type === 'select' && filtre.options && (
                  <select
                    value={(valeurs[filtre.id] as string) || ''}
                    onChange={(e) =>
                      onChange(filtre.id, e.target.value || undefined)
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  >
                    <option value="">Tous</option>
                    {filtre.options.map((opt) => (
                      <option key={opt.valeur} value={opt.valeur}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {filtre.type === 'date' && (
                  <input
                    type="date"
                    value={(valeurs[filtre.id] as string) || ''}
                    onChange={(e) =>
                      onChange(filtre.id, e.target.value || undefined)
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                )}

                {filtre.type === 'dateRange' && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={(valeurs[`${filtre.id}Debut`] as string) || ''}
                      onChange={(e) =>
                        onChange(`${filtre.id}Debut`, e.target.value || undefined)
                      }
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm"
                      placeholder="Du"
                    />
                    <input
                      type="date"
                      value={(valeurs[`${filtre.id}Fin`] as string) || ''}
                      onChange={(e) =>
                        onChange(`${filtre.id}Fin`, e.target.value || undefined)
                      }
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm"
                      placeholder="Au"
                    />
                  </div>
                )}

                {filtre.type === 'number' && (
                  <input
                    type="number"
                    value={(valeurs[filtre.id] as number) || ''}
                    onChange={(e) =>
                      onChange(
                        filtre.id,
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    min={filtre.min}
                    max={filtre.max}
                    placeholder={filtre.placeholder}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                )}

                {filtre.type === 'numberRange' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={(valeurs[`${filtre.id}Min`] as number) || ''}
                      onChange={(e) =>
                        onChange(
                          `${filtre.id}Min`,
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      min={filtre.min}
                      placeholder="Min"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm"
                    />
                    <span className="text-[var(--muted)]">—</span>
                    <input
                      type="number"
                      value={(valeurs[`${filtre.id}Max`] as number) || ''}
                      onChange={(e) =>
                        onChange(
                          `${filtre.id}Max`,
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      max={filtre.max}
                      placeholder="Max"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bouton réinitialiser */}
          {filtresActifs > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onReinitialiser}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]"
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
