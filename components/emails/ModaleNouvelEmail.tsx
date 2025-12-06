'use client';

import { useState } from 'react';
import { X, Loader2, Mail, Send, Inbox } from 'lucide-react';
import { enregistrerEmail } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';

interface ModaleNouvelEmailProps {
  ouverte: boolean;
  onFermer: () => void;
  clientId: string;
  clientNom: string;
}

export function ModaleNouvelEmail({ ouverte, onFermer, clientId, clientNom }: ModaleNouvelEmailProps) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [sujet, setSujet] = useState('');
  const [contenu, setContenu] = useState('');
  const [direction, setDirection] = useState<'entrant' | 'sortant'>('sortant');
  const [enCours, setEnCours] = useState(false);

  const reinitialiser = () => {
    setSujet('');
    setContenu('');
    setDirection('sortant');
  };

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sujet || !contenu) return;

    setEnCours(true);
    try {
      await enregistrerEmail(clientId, { sujet, contenu, direction });
      toast.success('Email enregistré', 'L\'échange a été ajouté à la timeline');
      queryClient.invalidateQueries({ queryKey: ['clients', clientId] });
      reinitialiser();
      onFermer();
    } catch (erreur) {
      console.error('Erreur enregistrement email:', erreur);
      toast.error('Erreur', 'Impossible d\'enregistrer l\'email');
    } finally {
      setEnCours(false);
    }
  };

  if (!ouverte) return null;

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
            <div>
              <h2 className="text-lg font-semibold">Consigner un email</h2>
              <p className="text-sm text-[var(--muted)]">{clientNom}</p>
            </div>
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
          <div className="flex justify-end gap-3">
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
        </form>
      </div>
    </div>
  );
}
