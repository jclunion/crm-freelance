'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Trash2, Eye, EyeOff, Loader2, ExternalLink, Plus, Link } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Document {
  id: string;
  nom: string;
  typeDocument: string;
  fichierUrl: string;
  tailleFichier: number | null;
  mimeType: string | null;
  visiblePortail: boolean;
  dateCreation: string;
}

interface GestionDocumentsProps {
  opportuniteId: string;
}

const TYPE_DOCUMENT_LABELS: Record<string, string> = {
  contrat: 'Contrat',
  devis: 'Devis',
  facture: 'Facture',
  autre: 'Autre',
};

export function GestionDocuments({ opportuniteId }: GestionDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [modeAjout, setModeAjout] = useState<'upload' | 'url'>('upload');
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [dragActif, setDragActif] = useState(false);
  
  // Formulaire nouveau document
  const [nom, setNom] = useState('');
  const [typeDocument, setTypeDocument] = useState('contrat');
  const [fichierUrl, setFichierUrl] = useState('');
  const [tailleFichier, setTailleFichier] = useState<number | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [visiblePortail, setVisiblePortail] = useState(true);
  
  const inputFichierRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Charger les documents
  const chargerDocuments = async () => {
    setChargement(true);
    try {
      const reponse = await fetch(`/api/documents?opportuniteId=${opportuniteId}`);
      if (reponse.ok) {
        const data = await reponse.json();
        setDocuments(data);
      } else {
        console.error('Erreur API documents:', await reponse.text());
      }
    } catch (error) {
      console.error('Erreur chargement documents:', error);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerDocuments();
  }, [opportuniteId]);

  // Upload d'un fichier (fonction commune)
  const uploaderFichier = async (fichier: File) => {
    // Vérifier la taille (10 Mo max)
    if (fichier.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux', 'La taille maximale est de 10 Mo');
      return;
    }

    // Vérifier le type
    const typesAutorises = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
    ];
    
    if (!typesAutorises.includes(fichier.type)) {
      toast.error('Type non autorisé', 'Formats acceptés : PDF, Word, Excel, images');
      return;
    }

    setUploadEnCours(true);
    try {
      const formData = new FormData();
      formData.append('file', fichier);

      const reponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!reponse.ok) {
        const erreur = await reponse.json();
        throw new Error(erreur.error || 'Erreur upload');
      }

      const resultat = await reponse.json();
      setFichierUrl(resultat.url);
      setTailleFichier(resultat.taille);
      setMimeType(resultat.mimeType);
      
      // Pré-remplir le nom si vide
      if (!nom) {
        setNom(fichier.name.replace(/\.[^/.]+$/, '')); // Retirer l'extension
      }
      
      toast.success('Fichier uploadé', fichier.name);
    } catch (error) {
      toast.error('Erreur', error instanceof Error ? error.message : 'Impossible d\'uploader le fichier');
    } finally {
      setUploadEnCours(false);
    }
  };

  // Gérer la sélection de fichier via input
  const gererSelectionFichier = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (fichier) {
      await uploaderFichier(fichier);
    }
  };

  // Gestionnaires de drag & drop
  const gererDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActif(true);
  };

  const gererDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Vérifier qu'on quitte vraiment la zone (pas juste un enfant)
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setDragActif(false);
    }
  };

  const gererDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const gererDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActif(false);

    const fichiers = e.dataTransfer.files;
    if (fichiers.length > 0) {
      await uploaderFichier(fichiers[0]);
    }
  };

  // Ajouter un document
  const ajouterDocument = async () => {
    if (!nom || !fichierUrl) return;

    setAjoutEnCours(true);
    try {
      const reponse = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportuniteId,
          nom,
          typeDocument,
          fichierUrl,
          tailleFichier,
          mimeType,
          visiblePortail,
        }),
      });

      if (!reponse.ok) {
        throw new Error('Erreur création');
      }

      const nouveauDoc = await reponse.json();
      setDocuments((prev) => [nouveauDoc, ...prev]);
      toast.success('Document ajouté', `${nom} a été ajouté à l'opportunité`);
      
      // Réinitialiser le formulaire
      reinitialiserFormulaire();
    } catch (error) {
      console.error('Erreur ajout document:', error);
      toast.error('Erreur', 'Impossible d\'ajouter le document');
    } finally {
      setAjoutEnCours(false);
    }
  };

  // Réinitialiser le formulaire
  const reinitialiserFormulaire = () => {
    setNom('');
    setFichierUrl('');
    setTailleFichier(null);
    setMimeType(null);
    setTypeDocument('contrat');
    setVisiblePortail(true);
    setFormulaireOuvert(false);
    setModeAjout('upload');
    if (inputFichierRef.current) {
      inputFichierRef.current.value = '';
    }
  };

  // Supprimer un document
  const supprimerDocument = async (doc: Document) => {
    if (!confirm(`Supprimer "${doc.nom}" ?`)) return;

    try {
      const reponse = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
      if (!reponse.ok) throw new Error('Erreur suppression');

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success('Document supprimé', `${doc.nom} a été retiré`);
    } catch (error) {
      toast.error('Erreur', 'Impossible de supprimer le document');
    }
  };

  // Basculer la visibilité portail
  const basculerVisibilite = async (doc: Document) => {
    try {
      const reponse = await fetch(`/api/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visiblePortail: !doc.visiblePortail }),
      });

      if (!reponse.ok) throw new Error('Erreur mise à jour');

      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, visiblePortail: !d.visiblePortail } : d))
      );
      toast.success(
        doc.visiblePortail ? 'Document masqué' : 'Document visible',
        doc.visiblePortail 
          ? `${doc.nom} n'est plus visible sur le portail client`
          : `${doc.nom} est maintenant visible sur le portail client`
      );
    } catch (error) {
      toast.error('Erreur', 'Impossible de modifier la visibilité');
    }
  };

  if (chargement) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[var(--muted)]" />
          <span className="font-medium">Documents ({documents.length})</span>
        </div>
        <button
          type="button"
          onClick={() => setFormulaireOuvert(!formulaireOuvert)}
          className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-medium hover:bg-[var(--border)]"
        >
          <Plus className="h-3 w-3" />
          Ajouter
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {formulaireOuvert && (
        <div className="mb-4 space-y-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
          {/* Sélecteur de mode */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModeAjout('upload')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                modeAjout === 'upload'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border border-[var(--border)] hover:bg-[var(--border)]'
              }`}
            >
              <Upload className="h-3 w-3" />
              Uploader un fichier
            </button>
            <button
              type="button"
              onClick={() => setModeAjout('url')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                modeAjout === 'url'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border border-[var(--border)] hover:bg-[var(--border)]'
              }`}
            >
              <Link className="h-3 w-3" />
              Lien externe
            </button>
          </div>

          {/* Zone d'upload ou URL */}
          {modeAjout === 'upload' ? (
            <div>
              <input
                ref={inputFichierRef}
                type="file"
                onChange={gererSelectionFichier}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                className="hidden"
                id="fichier-upload"
              />
              {!fichierUrl ? (
                <div
                  ref={dropZoneRef}
                  onDragEnter={gererDragEnter}
                  onDragLeave={gererDragLeave}
                  onDragOver={gererDragOver}
                  onDrop={gererDrop}
                  onClick={() => inputFichierRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all ${
                    dragActif
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.02]'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]'
                  } ${uploadEnCours ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {uploadEnCours ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                      <span className="mt-2 text-sm text-[var(--primary)]">Upload en cours...</span>
                    </>
                  ) : dragActif ? (
                    <>
                      <Upload className="h-8 w-8 text-[var(--primary)]" />
                      <span className="mt-2 text-sm font-medium text-[var(--primary)]">
                        Déposez le fichier ici
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-[var(--muted)]" />
                      <span className="mt-2 text-sm text-[var(--foreground)]">
                        Glissez-déposez un fichier ici
                      </span>
                      <span className="mt-1 text-xs text-[var(--muted)]">
                        ou cliquez pour sélectionner
                      </span>
                      <span className="mt-2 text-xs text-[var(--muted)]">
                        PDF, Word, Excel, Images (max 10 Mo)
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Fichier uploadé
                      </span>
                      {tailleFichier && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-500">
                          ({(tailleFichier / 1024).toFixed(0)} Ko)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFichierUrl('');
                      setTailleFichier(null);
                      setMimeType(null);
                      if (inputFichierRef.current) inputFichierRef.current.value = '';
                    }}
                    className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-medium">URL du fichier</label>
              <input
                type="url"
                value={fichierUrl}
                onChange={(e) => setFichierUrl(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                placeholder="https://drive.google.com/... ou https://dropbox.com/..."
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                Collez un lien vers votre fichier (Google Drive, Dropbox, etc.)
              </p>
            </div>
          )}

          {/* Nom et type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Nom du document</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                placeholder="Ex: Contrat de prestation"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Type</label>
              <select
                value={typeDocument}
                onChange={(e) => setTypeDocument(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
              >
                <option value="contrat">Contrat</option>
                <option value="devis">Devis</option>
                <option value="facture">Facture</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Visibilité portail */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visiblePortail"
              checked={visiblePortail}
              onChange={(e) => setVisiblePortail(e.target.checked)}
              className="rounded border-[var(--border)]"
            />
            <label htmlFor="visiblePortail" className="text-xs">
              Visible sur le portail client
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={reinitialiserFormulaire}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--border)]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={ajouterDocument}
              disabled={ajoutEnCours || !nom || !fichierUrl}
              className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
            >
              {ajoutEnCours && <Loader2 className="h-3 w-3 animate-spin" />}
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Liste des documents */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.nom}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {TYPE_DOCUMENT_LABELS[doc.typeDocument] || doc.typeDocument}
                    {doc.tailleFichier && ` • ${(doc.tailleFichier / 1024).toFixed(0)} Ko`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Indicateur visibilité */}
                <button
                  type="button"
                  onClick={() => basculerVisibilite(doc)}
                  className={`rounded p-1.5 ${
                    doc.visiblePortail 
                      ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' 
                      : 'text-[var(--muted)] hover:bg-[var(--border)]'
                  }`}
                  title={doc.visiblePortail ? 'Visible sur le portail' : 'Masqué sur le portail'}
                >
                  {doc.visiblePortail ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                {/* Ouvrir le lien */}
                <a
                  href={doc.fichierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                  title="Ouvrir"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                {/* Supprimer */}
                <button
                  type="button"
                  onClick={() => supprimerDocument(doc)}
                  className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-[var(--muted)] py-2">
          Aucun document. Cliquez sur "Ajouter" pour en créer un.
        </p>
      )}
    </div>
  );
}
