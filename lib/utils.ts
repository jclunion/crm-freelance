import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utilitaire pour combiner les classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formater une date en français
export function formaterDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Formater une date relative (il y a X jours)
export function formaterDateRelative(dateIso: string): string {
  const date = new Date(dateIso);
  const maintenant = new Date();
  const diffMs = maintenant.getTime() - date.getTime();
  const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffJours === 0) return "Aujourd'hui";
  if (diffJours === 1) return 'Hier';
  if (diffJours < 7) return `Il y a ${diffJours} jours`;
  if (diffJours < 30) return `Il y a ${Math.floor(diffJours / 7)} semaines`;
  return formaterDate(dateIso);
}

// Formater un montant en euros
export function formaterMontant(montant: number, devise = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
}

// Générer les initiales d'un nom
export function genererInitiales(nom: string): string {
  return nom
    .split(' ')
    .map((mot) => mot[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
