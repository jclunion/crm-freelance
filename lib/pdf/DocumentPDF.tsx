import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

// Styles minimalistes sans bordures
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  emetteur: {
    width: '45%',
  },
  logoEmetteur: {
    width: 80,
    height: 80,
    objectFit: 'contain',
    marginBottom: 10,
  },
  destinataire: {
    width: '45%',
    textAlign: 'right',
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
  },
  sousTitre: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitre: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  ligne: {
    marginBottom: 3,
  },
  ligneGras: {
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  colDescription: {
    width: '60%',
  },
  colMontant: {
    width: '40%',
    textAlign: 'right',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 12,
    marginRight: 20,
  },
  totalMontant: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  mentions: {
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  coordonneesBancaires: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fafafa',
  },
  tamponPaye: {
    position: 'absolute',
    top: 180,
    right: 40,
    padding: 10,
    borderWidth: 3,
    borderColor: '#22c55e',
    borderRadius: 8,
    transform: 'rotate(-15deg)',
  },
  tamponPayeTexte: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
    textTransform: 'uppercase',
  },
  dateEmission: {
    fontSize: 10,
    color: '#666',
    marginBottom: 20,
  },
});

// Formater un montant en euros (formatage manuel pour éviter les problèmes de rendu PDF)
function formaterMontant(montant: number | null, devise: string = 'EUR'): string {
  if (montant === null) return '—';
  
  // Formatage manuel pour éviter les caractères spéciaux mal rendus dans le PDF
  const parties = montant.toFixed(2).split('.');
  const entier = parties[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const decimales = parties[1];
  
  const symboles: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
  };
  
  return `${entier},${decimales} ${symboles[devise] || devise}`;
}

// Formater une date
function formaterDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export interface DonneesEmetteur {
  logoUrl: string | null;
  nomAffiche: string | null;
  raisonSociale: string | null;
  adresseLigne1: string | null;
  adresseLigne2: string | null;
  codePostal: string | null;
  ville: string | null;
  pays: string | null;
  siret: string | null;
  numeroTva: string | null;
  telephone: string | null;
  email: string;
  iban: string | null;
  bic: string | null;
  mentionsLegales: string | null;
  tauxTva: number; // 0 = franchise, > 0 = taux applicable
}

export interface DonneesDestinataire {
  nom: string;
  raisonSociale: string | null;
  adresseLigne1: string | null;
  adresseLigne2: string | null;
  codePostal: string | null;
  ville: string | null;
  pays: string | null;
  siret: string | null;
  numeroTva: string | null;
  emailPrincipal: string | null;
}

export interface DonneesOpportunite {
  titre: string;
  descriptionCourte: string | null;
  montantEstime: number | null;
  devise: string;
}

export interface DocumentPDFProps {
  typeDocument: 'devis' | 'facture';
  numeroDocument: string;
  dateEmission: Date;
  dateValidite?: Date;
  emetteur: DonneesEmetteur;
  destinataire: DonneesDestinataire;
  opportunite: DonneesOpportunite;
  estPaye?: boolean; // Pour afficher le tampon "PAYÉ" sur les factures
}

// Calculer les montants TVA
function calculerMontants(montantHT: number | null, tauxTva: number) {
  if (montantHT === null) return { ht: 0, tva: 0, ttc: 0 };
  const tva = montantHT * (tauxTva / 100);
  return {
    ht: montantHT,
    tva: tva,
    ttc: montantHT + tva,
  };
}

export function DocumentPDF({
  typeDocument,
  numeroDocument,
  dateEmission,
  dateValidite,
  emetteur,
  destinataire,
  opportunite,
  estPaye,
}: DocumentPDFProps) {
  const titreDocument = typeDocument === 'devis' ? 'DEVIS' : 'FACTURE';
  const nomEmetteur = emetteur.raisonSociale || emetteur.nomAffiche || 'Émetteur';
  const nomDestinataire = destinataire.raisonSociale || destinataire.nom;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Tampon PAYÉ pour les factures acquittées */}
        {typeDocument === 'facture' && estPaye && (
          <View style={styles.tamponPaye}>
            <Text style={styles.tamponPayeTexte}>PAYÉ</Text>
          </View>
        )}

        {/* En-tête */}
        <View style={styles.header}>
          {/* Émetteur (gauche) */}
          <View style={styles.emetteur}>
            {emetteur.logoUrl && (
              <Image src={emetteur.logoUrl} style={styles.logoEmetteur} />
            )}
            <Text style={styles.ligneGras}>{nomEmetteur}</Text>
            {emetteur.adresseLigne1 && <Text style={styles.ligne}>{emetteur.adresseLigne1}</Text>}
            {emetteur.adresseLigne2 && <Text style={styles.ligne}>{emetteur.adresseLigne2}</Text>}
            {(emetteur.codePostal || emetteur.ville) && (
              <Text style={styles.ligne}>
                {emetteur.codePostal} {emetteur.ville}
              </Text>
            )}
            {emetteur.pays && <Text style={styles.ligne}>{emetteur.pays}</Text>}
            {emetteur.telephone && <Text style={styles.ligne}>Tél : {emetteur.telephone}</Text>}
            <Text style={styles.ligne}>{emetteur.email}</Text>
            {emetteur.siret && <Text style={styles.ligne}>SIRET : {emetteur.siret}</Text>}
            {emetteur.numeroTva && <Text style={styles.ligne}>TVA : {emetteur.numeroTva}</Text>}
          </View>

          {/* Destinataire (droite) */}
          <View style={styles.destinataire}>
            <Text style={styles.ligneGras}>{nomDestinataire}</Text>
            {destinataire.adresseLigne1 && <Text style={styles.ligne}>{destinataire.adresseLigne1}</Text>}
            {destinataire.adresseLigne2 && <Text style={styles.ligne}>{destinataire.adresseLigne2}</Text>}
            {(destinataire.codePostal || destinataire.ville) && (
              <Text style={styles.ligne}>
                {destinataire.codePostal} {destinataire.ville}
              </Text>
            )}
            {destinataire.pays && <Text style={styles.ligne}>{destinataire.pays}</Text>}
            {destinataire.emailPrincipal && <Text style={styles.ligne}>{destinataire.emailPrincipal}</Text>}
            {destinataire.siret && <Text style={styles.ligne}>SIRET : {destinataire.siret}</Text>}
            {destinataire.numeroTva && <Text style={styles.ligne}>TVA : {destinataire.numeroTva}</Text>}
          </View>
        </View>

        {/* Titre et numéro */}
        <View style={styles.section}>
          <Text style={styles.titre}>{titreDocument}</Text>
          <Text style={styles.sousTitre}>N° {numeroDocument}</Text>
          <Text style={styles.dateEmission}>Date d'émission : {formaterDate(dateEmission)}</Text>
          {dateValidite && typeDocument === 'devis' && (
            <Text style={styles.sousTitre}>Valide jusqu'au : {formaterDate(dateValidite)}</Text>
          )}
        </View>

        {/* Détails de la prestation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Détails</Text>
          
          {/* En-tête tableau */}
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colMontant}>Montant HT</Text>
          </View>

          {/* Ligne prestation */}
          <View style={styles.tableRow}>
            <View style={styles.colDescription}>
              <Text style={styles.ligneGras}>{opportunite.titre}</Text>
              {opportunite.descriptionCourte && (
                <Text style={styles.ligne}>{opportunite.descriptionCourte}</Text>
              )}
            </View>
            <Text style={styles.colMontant}>
              {formaterMontant(opportunite.montantEstime, opportunite.devise)}
            </Text>
          </View>
        </View>

        {/* Total */}
        {emetteur.tauxTva > 0 ? (
          // Assujetti à la TVA : afficher HT, TVA, TTC
          <View style={styles.section}>
            <View style={styles.total}>
              <Text style={styles.totalLabel}>Total HT :</Text>
              <Text style={styles.totalMontant}>
                {formaterMontant(calculerMontants(opportunite.montantEstime, emetteur.tauxTva).ht, opportunite.devise)}
              </Text>
            </View>
            <View style={styles.total}>
              <Text style={styles.totalLabel}>TVA ({emetteur.tauxTva}%) :</Text>
              <Text style={styles.totalMontant}>
                {formaterMontant(calculerMontants(opportunite.montantEstime, emetteur.tauxTva).tva, opportunite.devise)}
              </Text>
            </View>
            <View style={[styles.total, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#ddd' }]}>
              <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Total TTC :</Text>
              <Text style={[styles.totalMontant, { fontWeight: 'bold' }]}>
                {formaterMontant(calculerMontants(opportunite.montantEstime, emetteur.tauxTva).ttc, opportunite.devise)}
              </Text>
            </View>
          </View>
        ) : (
          // Franchise de TVA : afficher uniquement le total
          <View style={styles.section}>
            <View style={styles.total}>
              <Text style={styles.totalLabel}>Total :</Text>
              <Text style={styles.totalMontant}>
                {formaterMontant(opportunite.montantEstime, opportunite.devise)}
              </Text>
            </View>
            <Text style={[styles.mentions, { marginTop: 8 }]}>
              TVA non applicable, art. 293 B du CGI
            </Text>
          </View>
        )}

        {/* Coordonnées bancaires (pour facture) */}
        {typeDocument === 'facture' && (emetteur.iban || emetteur.bic) && (
          <View style={styles.coordonneesBancaires}>
            <Text style={styles.sectionTitre}>Coordonnées bancaires</Text>
            {emetteur.iban && <Text style={styles.ligne}>IBAN : {emetteur.iban}</Text>}
            {emetteur.bic && <Text style={styles.ligne}>BIC : {emetteur.bic}</Text>}
          </View>
        )}

        {/* Mentions légales */}
        <View style={styles.footer}>
          {emetteur.mentionsLegales && (
            <Text style={styles.mentions}>{emetteur.mentionsLegales}</Text>
          )}
          {typeDocument === 'devis' && (
            <Text style={styles.mentions}>
              Devis valable 30 jours. En cas d'acceptation, merci de retourner ce document signé avec la mention "Bon pour accord".
            </Text>
          )}
          {typeDocument === 'facture' && (
            <Text style={styles.mentions}>
              En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
