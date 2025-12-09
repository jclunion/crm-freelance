'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useMettreAJourClient } from '@/lib/hooks';
import { useToast } from '@/components/ui/Toast';
import type { ClientComplet } from '@/lib/api';

interface ModaleEditionClientProps {
  ouverte: boolean;
  onFermer: () => void;
  client: ClientComplet;
}

export function ModaleEditionClient({
  ouverte,
  onFermer,
  client,
}: ModaleEditionClientProps) {
  const [nom, setNom] = useState(client.nom);
  const [typeClient, setTypeClient] = useState(client.typeClient);
  const [emailPrincipal, setEmailPrincipal] = useState(client.emailPrincipal || '');
  const [telephonePrincipal, setTelephonePrincipal] = useState(client.telephonePrincipal || '');
  const [statutClient, setStatutClient] = useState(client.statutClient);
  const [noteInterne, setNoteInterne] = useState(client.noteInterne || '');

  // Informations entreprise / organisation
  const [raisonSociale, setRaisonSociale] = useState(client.raisonSociale || '');
  const [siteWeb, setSiteWeb] = useState(client.siteWeb || '');
  const [logoClientUrl, setLogoClientUrl] = useState(client.logoClientUrl || '');
  const [adresseLigne1, setAdresseLigne1] = useState(client.adresseLigne1 || '');
  const [adresseLigne2, setAdresseLigne2] = useState(client.adresseLigne2 || '');
  const [codePostal, setCodePostal] = useState(client.codePostal || '');
  const [ville, setVille] = useState(client.ville || '');
  const [pays, setPays] = useState(client.pays || '');
  const [siret, setSiret] = useState(client.siret || '');
  const [numeroTva, setNumeroTva] = useState(client.numeroTva || '');
  const [secteurActivite, setSecteurActivite] = useState(client.secteurActivite || '');
  const [tailleEntreprise, setTailleEntreprise] = useState(client.tailleEntreprise || '');

  const mettreAJourMutation = useMettreAJourClient();
  const toast = useToast();

  // Synchroniser les valeurs quand le client change
  useEffect(() => {
    setNom(client.nom);
    setTypeClient(client.typeClient);
    setEmailPrincipal(client.emailPrincipal || '');
    setTelephonePrincipal(client.telephonePrincipal || '');
    setStatutClient(client.statutClient);
    setNoteInterne(client.noteInterne || '');
    setRaisonSociale(client.raisonSociale || '');
    setSiteWeb(client.siteWeb || '');
    setLogoClientUrl(client.logoClientUrl || '');
    setAdresseLigne1(client.adresseLigne1 || '');
    setAdresseLigne2(client.adresseLigne2 || '');
    setCodePostal(client.codePostal || '');
    setVille(client.ville || '');
    setPays(client.pays || '');
    setSiret(client.siret || '');
    setNumeroTva(client.numeroTva || '');
    setSecteurActivite(client.secteurActivite || '');
    setTailleEntreprise(client.tailleEntreprise || '');
  }, [client]);

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await mettreAJourMutation.mutateAsync({
        id: client.id,
        donnees: {
          nom,
          typeClient: typeClient as 'freelance' | 'agence' | 'entreprise' | 'particulier',
          emailPrincipal: emailPrincipal || undefined,
          telephonePrincipal: telephonePrincipal || undefined,
          statutClient: statutClient as 'prospect' | 'client',
          noteInterne: noteInterne || undefined,

          // Informations entreprise / organisation
          raisonSociale: raisonSociale || undefined,
          siteWeb: siteWeb || undefined,
          logoClientUrl: logoClientUrl || undefined,
          adresseLigne1: adresseLigne1 || undefined,
          adresseLigne2: adresseLigne2 || undefined,
          codePostal: codePostal || undefined,
          ville: ville || undefined,
          pays: pays || undefined,
          siret: siret || undefined,
          numeroTva: numeroTva || undefined,
          secteurActivite: secteurActivite || undefined,
          tailleEntreprise: tailleEntreprise || undefined,
        },
      });

      toast.success('Client modifié', `${nom} a été mis à jour`);
      onFermer();
    } catch (erreur) {
      console.error('Erreur mise à jour client:', erreur);
      toast.error('Erreur', 'Impossible de modifier le client');
    }
  };

  if (!ouverte) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="modal-overlay absolute inset-0 bg-black/50" onClick={onFermer} />

      {/* Modale */}
      <div className="modal-content relative z-10 flex w-full max-w-lg max-h-[85vh] flex-col rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold">Modifier le client</h2>
          <button
            onClick={onFermer}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={gererSoumission} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Nom */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Type et Statut */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select
                  value={typeClient}
                  onChange={(e) => setTypeClient(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="freelance">Freelance</option>
                  <option value="agence">Agence</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="particulier">Particulier</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Statut</label>
                <select
                  value={statutClient}
                  onChange={(e) => setStatutClient(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <option value="prospect">Prospect</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={emailPrincipal}
                onChange={(e) => setEmailPrincipal(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="mb-1 block text-sm font-medium">Téléphone</label>
              <input
                type="tel"
                value={telephonePrincipal}
                onChange={(e) => setTelephonePrincipal(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Note interne */}
            <div>
              <label className="mb-1 block text-sm font-medium">Note interne</label>
              <textarea
                value={noteInterne}
                onChange={(e) => setNoteInterne(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

{/* Logo entreprise */}
<div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--card)] px-3 py-2">
  <div className="flex items-center gap-3">
    {logoClientUrl ? (
      <img
        src={logoClientUrl}
        alt={nom}
        className="h-[72px] max-w-[200px] rounded border border-[var(--border)] object-contain bg-[var(--background)]"
      />
    ) : (
      <div className="flex h-[72px] max-w-[200px] items-center justify-center rounded border border-dashed border-[var(--border)] text-[var(--muted)] text-xs">
        Logo
      </div>
    )}
    <div className="text-xs text-[var(--muted)]">
      Logo de l’entreprise cliente (affiché aussi sur le portail).
    </div>
  </div>
  <div className="flex flex-col items-end gap-1">
    <label className="cursor-pointer text-xs font-medium text-[var(--primary)] hover:underline">
      Changer le logo
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={async (e) => {
          const fichier = e.target.files?.[0];
          if (!fichier) return;

          const formData = new FormData();
          formData.append('file', fichier);

          try {
            const reponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            if (!reponse.ok) {
              alert('Erreur lors de l’upload du logo');
              return;
            }
            const data = await reponse.json();
            setLogoClientUrl(data.url || '');
          } catch (err) {
            console.error('Erreur upload logo client', err);
            alert('Erreur lors de l’upload du logo');
          }
        }}
      />
    </label>
    {logoClientUrl && (
      <button
        type="button"
        onClick={() => setLogoClientUrl('')}
        className="text-[10px] text-[var(--muted)] hover:underline"
      >
        Retirer le logo
      </button>
    )}
  </div>
</div>

            {/* Informations entreprise / organisation */}
            <div className="mt-4 space-y-3 rounded-lg border border-dashed border-[var(--border)] p-3">
              <p className="text-xs font-semibold text-[var(--muted)]">Informations entreprise</p>

              {/* Raison sociale & Site web */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Raison sociale</label>
                  <input
                    type="text"
                    value={raisonSociale}
                    onChange={(e) => setRaisonSociale(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                    placeholder="Ex : ACME SAS"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Site web</label>
                  <input
                    type="url"
                    value={siteWeb}
                    onChange={(e) => setSiteWeb(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-medium">Adresse (ligne 1)</label>
                  <input
                    type="text"
                    value={adresseLigne1}
                    onChange={(e) => setAdresseLigne1(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                    placeholder="Rue, numéro..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Adresse (ligne 2)</label>
                  <input
                    type="text"
                    value={adresseLigne2}
                    onChange={(e) => setAdresseLigne2(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                    placeholder="Bâtiment, étage, complément..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium">Code postal</label>
                    <input
                      type="text"
                      value={codePostal}
                      onChange={(e) => setCodePostal(e.target.value)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Ville</label>
                    <input
                      type="text"
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Pays</label>
                    <input
                      type="text"
                      value={pays}
                      onChange={(e) => setPays(e.target.value)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SIRET / TVA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">SIRET</label>
                  <input
                    type="text"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">N° TVA</label>
                  <input
                    type="text"
                    value={numeroTva}
                    onChange={(e) => setNumeroTva(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Secteur / Taille */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Secteur d'activité</label>
                  <input
                    type="text"
                    value={secteurActivite}
                    onChange={(e) => setSecteurActivite(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                    placeholder="Ex : SaaS, Conseil..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Taille d'entreprise</label>
                  <input
                    type="text"
                    value={tailleEntreprise}
                    onChange={(e) => setTailleEntreprise(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs focus:border-[var(--primary)] focus:outline-none"
                    placeholder="Ex : 1-10, 11-50..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Erreur */}
          {mettreAJourMutation.error && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              Erreur lors de la mise à jour
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onFermer}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mettreAJourMutation.isPending || !nom}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {mettreAJourMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
