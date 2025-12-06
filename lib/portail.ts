import { randomBytes } from 'crypto';

/**
 * Génère un token unique pour le portail client.
 * Format : 32 caractères hexadécimaux (128 bits d'entropie).
 */
export function genererTokenPortail(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Construit l'URL complète du portail client.
 */
export function construireUrlPortail(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/portail/${token}`;
}
