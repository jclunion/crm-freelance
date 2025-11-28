// Utilitaires pour l'export CSV

/**
 * Convertit un tableau d'objets en CSV
 */
export function convertirEnCSV<T extends Record<string, unknown>>(
  donnees: T[],
  colonnes: { cle: keyof T; label: string }[]
): string {
  if (donnees.length === 0) return '';

  // En-têtes
  const enTetes = colonnes.map((col) => `"${col.label}"`).join(';');

  // Lignes de données
  const lignes = donnees.map((item) => {
    return colonnes
      .map((col) => {
        const valeur = item[col.cle];
        if (valeur === null || valeur === undefined) return '""';
        if (typeof valeur === 'string') return `"${valeur.replace(/"/g, '""')}"`;
        if (typeof valeur === 'number') return valeur.toString();
        if (valeur instanceof Date) return `"${valeur.toLocaleDateString('fr-FR')}"`;
        return `"${String(valeur).replace(/"/g, '""')}"`;
      })
      .join(';');
  });

  return [enTetes, ...lignes].join('\n');
}

/**
 * Télécharge un fichier CSV
 */
export function telechargerCSV(contenu: string, nomFichier: string): void {
  // Ajouter BOM UTF-8 pour Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + contenu], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = `${nomFichier}.csv`;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}

// Configurations d'export par entité

export const colonnesClients = [
  { cle: 'nom' as const, label: 'Nom' },
  { cle: 'typeClient' as const, label: 'Type' },
  { cle: 'statutClient' as const, label: 'Statut' },
  { cle: 'emailPrincipal' as const, label: 'Email' },
  { cle: 'telephonePrincipal' as const, label: 'Téléphone' },
  { cle: 'dateCreation' as const, label: 'Date de création' },
];

export const colonnesOpportunites = [
  { cle: 'titre' as const, label: 'Titre' },
  { cle: 'clientNom' as const, label: 'Client' },
  { cle: 'montantEstime' as const, label: 'Montant (€)' },
  { cle: 'probabilite' as const, label: 'Probabilité (%)' },
  { cle: 'etapePipeline' as const, label: 'Étape' },
  { cle: 'dateCloturePrevue' as const, label: 'Date clôture prévue' },
  { cle: 'dateCreation' as const, label: 'Date de création' },
];

export const colonnesTickets = [
  { cle: 'sujet' as const, label: 'Sujet' },
  { cle: 'clientNom' as const, label: 'Client' },
  { cle: 'typeTicket' as const, label: 'Type' },
  { cle: 'priorite' as const, label: 'Priorité' },
  { cle: 'statutTicket' as const, label: 'Statut' },
  { cle: 'dateCreation' as const, label: 'Date de création' },
  { cle: 'dateResolution' as const, label: 'Date de résolution' },
];
