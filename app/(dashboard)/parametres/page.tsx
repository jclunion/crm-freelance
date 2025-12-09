'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Building2, CreditCard, FileText, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface DonneesUtilisateur {
  id: string;
  email: string;
  nomAffiche: string | null;
  logoUrl: string | null;
  raisonSociale: string | null;
  adresseLigne1: string | null;
  adresseLigne2: string | null;
  codePostal: string | null;
  ville: string | null;
  pays: string | null;
  siret: string | null;
  numeroTva: string | null;
  telephone: string | null;
  iban: string | null;
  bic: string | null;
  mentionsLegales: string | null;
  tauxTva: number;
  compteurDevis: number;
  compteurFacture: number;
}

export default function PageParametres() {
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [donnees, setDonnees] = useState<DonneesUtilisateur | null>(null);
  const toast = useToast();

  // États du formulaire
  const [nomAffiche, setNomAffiche] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [raisonSociale, setRaisonSociale] = useState('');
  const [adresseLigne1, setAdresseLigne1] = useState('');
  const [adresseLigne2, setAdresseLigne2] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  const [pays, setPays] = useState('France');
  const [siret, setSiret] = useState('');
  const [numeroTva, setNumeroTva] = useState('');
  const [telephone, setTelephone] = useState('');
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [mentionsLegales, setMentionsLegales] = useState('');
  const [tauxTva, setTauxTva] = useState(0);

  // Charger les données utilisateur
  useEffect(() => {
    async function chargerDonnees() {
      try {
        const reponse = await fetch('/api/utilisateur');
        if (!reponse.ok) throw new Error('Erreur chargement');
        const data = await reponse.json();
        setDonnees(data);
        
        // Remplir le formulaire
        setNomAffiche(data.nomAffiche || '');
        setLogoUrl(data.logoUrl || '');
        setRaisonSociale(data.raisonSociale || '');
        setAdresseLigne1(data.adresseLigne1 || '');
        setAdresseLigne2(data.adresseLigne2 || '');
        setCodePostal(data.codePostal || '');
        setVille(data.ville || '');
        setPays(data.pays || 'France');
        setSiret(data.siret || '');
        setNumeroTva(data.numeroTva || '');
        setTelephone(data.telephone || '');
        setIban(data.iban || '');
        setBic(data.bic || '');
        setMentionsLegales(data.mentionsLegales || '');
        setTauxTva(data.tauxTva ?? 0);
      } catch (err) {
        console.error('Erreur chargement paramètres:', err);
        toast.error('Erreur lors du chargement des paramètres');
      } finally {
        setChargement(false);
      }
    }
    chargerDonnees();
  }, []);

  // Enregistrer les modifications
  async function gererEnregistrement(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);

    try {
      const reponse = await fetch('/api/utilisateur', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomAffiche,
          logoUrl,
          raisonSociale,
          adresseLigne1,
          adresseLigne2,
          codePostal,
          ville,
          pays,
          siret,
          numeroTva,
          telephone,
          iban,
          bic,
          mentionsLegales,
          tauxTva,
        }),
      });

      if (!reponse.ok) throw new Error('Erreur enregistrement');
      
      const data = await reponse.json();
      setDonnees(data);
      toast.success('Paramètres enregistrés');
    } catch (err) {
      console.error('Erreur enregistrement:', err);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setEnregistrement(false);
    }
  }

  // Upload du logo
  async function gererUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    const formData = new FormData();
    formData.append('file', fichier);

    try {
      const reponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!reponse.ok) throw new Error('Erreur upload');
      
      const data = await reponse.json();
      setLogoUrl(data.url || '');
      toast.success('Logo uploadé');
    } catch (err) {
      console.error('Erreur upload logo:', err);
      toast.error('Erreur lors de l\'upload du logo');
    }
  }

  if (chargement) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-[var(--muted)]">
          Configurez vos informations entreprise pour les devis et factures.
        </p>
      </div>

      <form onSubmit={gererEnregistrement} className="space-y-8">
        {/* Identité */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[var(--muted)]" />
            <h2 className="text-lg font-semibold">Identité</h2>
          </div>

          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-16 w-16 rounded-lg border border-[var(--border)] object-contain"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-[var(--muted)]">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
              <div>
                <label className="cursor-pointer text-sm font-medium text-[var(--primary)] hover:underline">
                  {logoUrl ? 'Changer le logo' : 'Ajouter un logo'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={gererUploadLogo}
                  />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="ml-3 text-sm text-[var(--muted)] hover:underline"
                  >
                    Retirer
                  </button>
                )}
                <p className="text-xs text-[var(--muted)]">PNG, JPG ou WebP. Max 2 Mo.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Nom affiché</label>
                <input
                  type="text"
                  value={nomAffiche}
                  onChange={(e) => setNomAffiche(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Raison sociale</label>
                <input
                  type="text"
                  value={raisonSociale}
                  onChange={(e) => setRaisonSociale(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="SARL Dupont Consulting"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Adresse ligne 1</label>
              <input
                type="text"
                value={adresseLigne1}
                onChange={(e) => setAdresseLigne1(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                placeholder="123 rue de la Paix"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Adresse ligne 2</label>
              <input
                type="text"
                value={adresseLigne2}
                onChange={(e) => setAdresseLigne2(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                placeholder="Bâtiment A, 2ème étage"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Code postal</label>
                <input
                  type="text"
                  value={codePostal}
                  onChange={(e) => setCodePostal(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="75001"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Ville</label>
                <input
                  type="text"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="Paris"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Pays</label>
                <input
                  type="text"
                  value={pays}
                  onChange={(e) => setPays(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="France"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Téléphone</label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>
        </section>

        {/* Informations légales */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--muted)]" />
            <h2 className="text-lg font-semibold">Informations légales</h2>
          </div>

          <div className="space-y-4">
            {/* Régime TVA */}
            <div>
              <label className="mb-1 block text-sm font-medium">Régime TVA</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="regimeTva"
                    checked={tauxTva === 0}
                    onChange={() => setTauxTva(0)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Franchise de TVA (micro-entrepreneur)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="regimeTva"
                    checked={tauxTva > 0}
                    onChange={() => setTauxTva(20)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Assujetti à la TVA</span>
                </label>
              </div>
              {tauxTva === 0 && (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Mention affichée : "TVA non applicable, art. 293 B du CGI"
                </p>
              )}
            </div>

            {/* Taux TVA si assujetti */}
            {tauxTva > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium">Taux de TVA (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tauxTva}
                  onChange={(e) => setTauxTva(parseFloat(e.target.value) || 0)}
                  className="w-32 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="20"
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">SIRET</label>
                <input
                  type="text"
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="123 456 789 00012"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">N° TVA intracommunautaire</label>
                <input
                  type="text"
                  value={numeroTva}
                  onChange={(e) => setNumeroTva(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="FR12345678901"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Mentions légales personnalisées</label>
              <textarea
                value={mentionsLegales}
                onChange={(e) => setMentionsLegales(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                placeholder="Mentions légales à afficher sur vos devis et factures..."
              />
            </div>
          </div>
        </section>

        {/* Coordonnées bancaires */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[var(--muted)]" />
            <h2 className="text-lg font-semibold">Coordonnées bancaires</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--muted)]">
            Ces informations apparaîtront sur vos factures pour faciliter le paiement.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">IBAN</label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono"
                placeholder="FR76 1234 5678 9012 3456 7890 123"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">BIC</label>
              <input
                type="text"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono"
                placeholder="BNPAFRPP"
              />
            </div>
          </div>
        </section>

        {/* Compteurs */}
        {donnees && (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--muted)]" />
              <h2 className="text-lg font-semibold">Numérotation</h2>
            </div>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Compteurs actuels pour la numérotation automatique des documents.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[var(--background)] p-4">
                <p className="text-sm text-[var(--muted)]">Prochain devis</p>
                <p className="text-lg font-semibold">
                  DEV-{new Date().getFullYear()}-{String(donnees.compteurDevis + 1).padStart(4, '0')}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--background)] p-4">
                <p className="text-sm text-[var(--muted)]">Prochaine facture</p>
                <p className="text-lg font-semibold">
                  FAC-{new Date().getFullYear()}-{String(donnees.compteurFacture + 1).padStart(4, '0')}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Bouton enregistrer */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={enregistrement}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {enregistrement ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
