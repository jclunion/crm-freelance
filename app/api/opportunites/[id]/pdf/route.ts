import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { DocumentPDF, DonneesEmetteur, DonneesDestinataire, DonneesOpportunite } from '@/lib/pdf/DocumentPDF';
import React from 'react';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/opportunites/[id]/pdf?type=devis|facture
 * Génère un PDF de devis ou facture pour l'opportunité
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const typeDocument = searchParams.get('type') as 'devis' | 'facture';

    if (!typeDocument || !['devis', 'facture'].includes(typeDocument)) {
      return NextResponse.json(
        { error: 'Type de document invalide. Utilisez ?type=devis ou ?type=facture' },
        { status: 400 }
      );
    }

    // Récupérer l'opportunité avec le client et le propriétaire
    const opportunite = await prisma.opportunite.findFirst({
      where: {
        id,
        proprietaireId: session.user.id,
      },
      include: {
        client: true,
        proprietaire: true,
      },
    });

    if (!opportunite) {
      return NextResponse.json({ error: 'Opportunité non trouvée' }, { status: 404 });
    }

    // Vérifier les conditions pour la facture
    if (typeDocument === 'facture') {
      if (opportunite.etapePipeline !== 'gagne' || opportunite.statutPaiement !== 'paye') {
        return NextResponse.json(
          { error: 'La facture ne peut être générée que pour une opportunité gagnée et payée' },
          { status: 400 }
        );
      }
    }

    // Incrémenter le compteur et générer le numéro
    const annee = new Date().getFullYear();
    const prefixe = typeDocument === 'devis' ? 'DEV' : 'FAC';
    const champCompteur = typeDocument === 'devis' ? 'compteurDevis' : 'compteurFacture';

    // Incrémenter le compteur de manière atomique
    const utilisateurMaj = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        [champCompteur]: { increment: 1 },
      },
    });

    const nouveauCompteur = typeDocument === 'devis' 
      ? utilisateurMaj.compteurDevis 
      : utilisateurMaj.compteurFacture;
    
    const numeroDocument = `${prefixe}-${annee}-${String(nouveauCompteur).padStart(4, '0')}`;

    // Préparer les données pour le PDF
    // Construire le chemin absolu du logo si disponible (fichier local)
    let logoUrlAbsolu: string | null = null;
    if (opportunite.proprietaire.logoUrl) {
      let cheminRelatif = opportunite.proprietaire.logoUrl;
      console.log('Logo URL original:', cheminRelatif);
      
      // Si c'est une URL localhost, extraire le chemin relatif
      if (cheminRelatif.includes('localhost') || cheminRelatif.includes('127.0.0.1')) {
        try {
          const url = new URL(cheminRelatif);
          cheminRelatif = url.pathname; // Ex: /uploads/xxx/logo.jpg
          console.log('Chemin extrait:', cheminRelatif);
        } catch (e) {
          console.error('Erreur parsing URL:', e);
        }
      }
      
      // Si c'est une URL externe (non localhost), on ne peut pas l'utiliser facilement
      if (cheminRelatif.startsWith('http')) {
        // URL externe non supportée pour le moment
        console.log('URL externe ignorée');
        logoUrlAbsolu = null;
      } else {
        // Chemin relatif, convertir en chemin absolu du fichier
        const logoPath = path.join(process.cwd(), 'public', cheminRelatif);
        console.log('Chemin absolu du logo:', logoPath);
        
        // Vérifier si le fichier existe et le convertir en base64
        const fs = require('fs');
        if (fs.existsSync(logoPath)) {
          console.log('Fichier logo trouvé, conversion en base64...');
          try {
            const logoBuffer = fs.readFileSync(logoPath);
            const extension = path.extname(logoPath).toLowerCase().slice(1);
            const mimeType = extension === 'jpg' ? 'jpeg' : extension;
            logoUrlAbsolu = `data:image/${mimeType};base64,${logoBuffer.toString('base64')}`;
            console.log('Logo converti en base64 avec succès');
          } catch (e) {
            console.error('Erreur lecture logo:', e);
            logoUrlAbsolu = null;
          }
        } else {
          console.log('Fichier logo NON trouvé !');
          logoUrlAbsolu = null;
        }
      }
    } else {
      console.log('Pas de logo configuré pour cet utilisateur');
    }

    const emetteur: DonneesEmetteur = {
      logoUrl: logoUrlAbsolu,
      nomAffiche: opportunite.proprietaire.nomAffiche,
      raisonSociale: opportunite.proprietaire.raisonSociale,
      adresseLigne1: opportunite.proprietaire.adresseLigne1,
      adresseLigne2: opportunite.proprietaire.adresseLigne2,
      codePostal: opportunite.proprietaire.codePostal,
      ville: opportunite.proprietaire.ville,
      pays: opportunite.proprietaire.pays,
      siret: opportunite.proprietaire.siret,
      numeroTva: opportunite.proprietaire.numeroTva,
      telephone: opportunite.proprietaire.telephone,
      email: opportunite.proprietaire.email,
      iban: opportunite.proprietaire.iban,
      bic: opportunite.proprietaire.bic,
      mentionsLegales: opportunite.proprietaire.mentionsLegales,
      tauxTva: opportunite.proprietaire.tauxTva ?? 0,
    };

    const destinataire: DonneesDestinataire = {
      nom: opportunite.client.nom,
      raisonSociale: opportunite.client.raisonSociale,
      adresseLigne1: opportunite.client.adresseLigne1,
      adresseLigne2: opportunite.client.adresseLigne2,
      codePostal: opportunite.client.codePostal,
      ville: opportunite.client.ville,
      pays: opportunite.client.pays,
      siret: opportunite.client.siret,
      numeroTva: opportunite.client.numeroTva,
      emailPrincipal: opportunite.client.emailPrincipal,
    };

    const donneesOpportunite: DonneesOpportunite = {
      titre: opportunite.titre,
      descriptionCourte: opportunite.descriptionCourte,
      montantEstime: opportunite.montantEstime,
      devise: opportunite.devise,
    };

    const dateEmission = new Date();
    const dateValidite = typeDocument === 'devis' 
      ? new Date(dateEmission.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 jours
      : undefined;

    // Générer le PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(DocumentPDF, {
        typeDocument,
        numeroDocument,
        dateEmission,
        dateValidite,
        emetteur,
        destinataire,
        opportunite: donneesOpportunite,
        estPaye: opportunite.statutPaiement === 'paye',
      }) as React.ReactElement
    );

    // Nom du fichier
    const nomFichier = `${typeDocument}_${numeroDocument}_${opportunite.client.nom.replace(/\s+/g, '_')}.pdf`;

    // Sauvegarder le PDF dans le dossier uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', session.user.id);
    await mkdir(uploadsDir, { recursive: true });
    
    const cheminFichier = path.join(uploadsDir, nomFichier);
    await writeFile(cheminFichier, Buffer.from(pdfBuffer));
    
    const fichierUrl = `/uploads/${session.user.id}/${nomFichier}`;

    // Créer le document dans la base de données
    await prisma.document.create({
      data: {
        opportuniteId: opportunite.id,
        proprietaireId: session.user.id,
        nom: `${typeDocument === 'devis' ? 'Devis' : 'Facture'} ${numeroDocument}`,
        typeDocument: typeDocument,
        fichierUrl,
        tailleFichier: pdfBuffer.byteLength,
        mimeType: 'application/pdf',
        visiblePortail: true,
      },
    });

    // Retourner le PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nomFichier}"`,
      },
    });
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du PDF' }, { status: 500 });
  }
}
