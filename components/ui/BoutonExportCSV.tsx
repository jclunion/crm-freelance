'use client';

import { Download } from 'lucide-react';
import { convertirEnCSV, telechargerCSV } from '@/lib/export-csv';

interface BoutonExportCSVProps<T extends Record<string, unknown>> {
  donnees: T[];
  colonnes: { cle: keyof T; label: string }[];
  nomFichier: string;
  label?: string;
}

export function BoutonExportCSV<T extends Record<string, unknown>>({
  donnees,
  colonnes,
  nomFichier,
  label = 'Exporter CSV',
}: BoutonExportCSVProps<T>) {
  const handleExport = () => {
    if (donnees.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const csv = convertirEnCSV(donnees, colonnes);
    const dateStr = new Date().toISOString().split('T')[0];
    telechargerCSV(csv, `${nomFichier}_${dateStr}`);
  };

  return (
    <button
      onClick={handleExport}
      disabled={donnees.length === 0}
      className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}
