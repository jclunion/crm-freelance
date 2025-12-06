'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Mail, Send, Inbox, Trash2 } from 'lucide-react';
import { modifierEmail, supprimerEmail, type EvenementTimeline } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';

interface ModaleEditionEmailProps {
  ouverte: boolean;
  onFermer: () => void;
  clientId: string;
  evenement: EvenementTimeline | null;
}

// Parser la description pour extraire sujet, contenu et direction
function parserDescription(description: string): { sujet: string; contenu: string; direction: 'entrant' | 'sortant' } {
  const lignes = description.split('\n');
  const premiereLigne = lignes[0] || '';
  
  let direction: 'entrant' | 'sortant' = 'sortant';
  let sujet = '';
  
  if (premiereLigne.startsWith('Email reçu : ')) {
    direction = 'entrant';
    sujet = premiereLigne.replace('Email reçu : ', '');
  } else if (premiereLigne.startsWith('Email envoyé : ')) {
    direction = 'sortant';
    sujet = premiereLigne.replace('Email envoyé : ', '');
  } else {
    sujet = premiereLigne;
  }
  
  // Le contenu est tout après la première ligne vide
  const contenu = lignes.slice(2).join('\n');
  
  return { sujet, contenu, direction };
}

export function ModaleEditionEmail({ ouverte, onFermer, clientId, evenement }: ModaleEditionEmailProps) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [sujet, setSujet] = useState('');
  const [contenu, setContenu] = useState('');
  const [direction, setDirection] = useState<'entrant' | 'sortant'>('sortant');
  const [enCours, setEnCours] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  // Charger les données de l'événement
  useEffect(() => {
    if (evenement) {
      const parsed = parserDescription(evenement.descriptionTexte);
      setSujet(parsed.sujet);
      setContenu(parsed.contenu);
      setDirection(parsed.direction);
    }
  }, [evenement]);

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sujet || !contenu || !evenement) return;

    setEnCours(true);
    try {
      await modifierEmail(clientId, evenement.id, { sujet, contenu, direction });
      toast.success('Email modifié', 'Les modifications ont été enregistrées');
      queryClient.invalidateQueries({ queryKey: ['clients', clientId] });
      onFermer();
    } catch (erreur) {
      console.error('Erreur modification email:', erreur);
      toast.error('Erreur', 'Impossible de modifier l\'email');
    } finally {
      setEnCours(false);
    }
  };

  const gererSuppression = async () => {
    if (!evenement || !confirm('Supprimer cet email de la timeline ?')) return;

    setSuppressionEnCours(true);
    try {
      await supprimerEmail(clientId, evenement.id);
      toast.success('Email supprimé', 'L\'email a été retiré de la timeline');
      queryClient.invalidateQueries({ queryKey: ['clients', clientId] });
      onFermer();
    } catch (erreur) {
      console.error('Erreur suppression email:', erreur);
      toast.error('Erreur', 'Impossible de supprimer l\'email');
    } finally {
      setSuppressionEnCours(false);
    }
  };

  if (!ouverte || !evenement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onFermer} />

      {/* Modale */}
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold">Modifier l'email</h2>
          </div>
          <button
            onClick={onFermer}
            className="rounded-lg p-2 hover:bg-[var(--border)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={gererSoumission} className="p-6">
          {/* Direction */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Type d'échange</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDirection('sortant')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  direction === 'sortant'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--border)] hover:bg-[var(--border)]'
                }`}
              >
                <Send className="h-4 w-4" />
                Email envoyé
              </button>
              <button
                type="button"
                onClick={() => setDirection('entrant')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  direction === 'entrant'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--border)] hover:bg-[var(--border)]'
                }`}
              >
                <Inbox className="h-4 w-4" />
                Email reçu
              </button>
            </div>
          </div>

          {/* Sujet */}
          <div className="mb-4">
            <label htmlFor="sujet" className="mb-2 block text-sm font-medium">
              Sujet *
            </label>
            <input
              id="sujet"
              type="text"
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none"
              placeholder="Objet de l'email"
            />
          </div>

          {/* Contenu */}
          <div className="mb-6">
            <label htmlFor="contenu" className="mb-2 block text-sm font-medium">
              Contenu / Résumé *
            </label>
            <textarea
              id="contenu"
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              required
              rows={5}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none"
              placeholder="Contenu de l'email ou résumé de l'échange..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={gererSuppression}
              disabled={suppressionEnCours}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              {suppressionEnCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Supprimer
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onFermer}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--border)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={enCours || !sujet || !contenu}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
              >
                {enCours ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
