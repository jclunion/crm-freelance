import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/dashboard - Récupère les statistiques du dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer toutes les stats en parallèle
    const [
      totalClients,
      clientsProspects,
      totalOpportunites,
      opportunitesEnCours,
      ticketsOuverts,
      ticketsResolus,
      opportunites,
      dernieresOpportunites,
      derniersTickets,
      derniersClients,
    ] = await Promise.all([
      // Total clients
      prisma.client.count({
        where: { proprietaireId: userId },
      }),
      // Clients prospects
      prisma.client.count({
        where: { proprietaireId: userId, statutClient: 'prospect' },
      }),
      // Total opportunités
      prisma.opportunite.count({
        where: { proprietaireId: userId },
      }),
      // Opportunités en cours (pas gagnées ni perdues)
      prisma.opportunite.count({
        where: {
          proprietaireId: userId,
          etapePipeline: { notIn: ['gagne', 'perdu'] },
        },
      }),
      // Tickets ouverts
      prisma.ticket.count({
        where: {
          client: { proprietaireId: userId },
          statutTicket: { in: ['nouveau', 'en_cours'] },
        },
      }),
      // Tickets résolus ce mois
      prisma.ticket.count({
        where: {
          client: { proprietaireId: userId },
          statutTicket: 'resolu',
          dateResolution: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      // Toutes les opportunités pour calculer le CA
      prisma.opportunite.findMany({
        where: { proprietaireId: userId },
        select: {
          montantEstime: true,
          probabilite: true,
          etapePipeline: true,
        },
      }),
      // 5 dernières opportunités
      prisma.opportunite.findMany({
        where: { proprietaireId: userId },
        include: {
          client: { select: { id: true, nom: true } },
        },
        orderBy: { dateCreation: 'desc' },
        take: 5,
      }),
      // 5 derniers tickets ouverts
      prisma.ticket.findMany({
        where: {
          client: { proprietaireId: userId },
          statutTicket: { in: ['nouveau', 'en_cours'] },
        },
        include: {
          client: { select: { id: true, nom: true } },
        },
        orderBy: [
          { priorite: 'desc' },
          { dateCreation: 'desc' },
        ],
        take: 5,
      }),
      // 5 derniers clients
      prisma.client.findMany({
        where: { proprietaireId: userId },
        orderBy: { dateCreation: 'desc' },
        take: 5,
      }),
    ]);

    // Calculer le CA estimé (opportunités en cours)
    const caEstime = opportunites
      .filter((o) => !['gagne', 'perdu'].includes(o.etapePipeline))
      .reduce((sum, o) => sum + (o.montantEstime || 0), 0);

    // Calculer le CA pondéré (avec probabilité)
    const caPondere = opportunites
      .filter((o) => !['gagne', 'perdu'].includes(o.etapePipeline))
      .reduce((sum, o) => {
        const montant = o.montantEstime || 0;
        const proba = o.probabilite || 50;
        return sum + (montant * proba) / 100;
      }, 0);

    // Calculer le CA gagné
    const caGagne = opportunites
      .filter((o) => o.etapePipeline === 'gagne')
      .reduce((sum, o) => sum + (o.montantEstime || 0), 0);

    // Répartition par étape pipeline
    const repartitionPipeline = [
      { etape: 'lead', label: 'Lead', count: 0, montant: 0 },
      { etape: 'qualifie', label: 'Qualifié', count: 0, montant: 0 },
      { etape: 'proposition_envoyee', label: 'Proposition', count: 0, montant: 0 },
      { etape: 'negociation', label: 'Négociation', count: 0, montant: 0 },
      { etape: 'gagne', label: 'Gagné', count: 0, montant: 0 },
    ];

    opportunites.forEach((o) => {
      const etape = repartitionPipeline.find((e) => e.etape === o.etapePipeline);
      if (etape) {
        etape.count++;
        etape.montant += o.montantEstime || 0;
      }
    });

    return NextResponse.json({
      stats: {
        totalClients,
        clientsProspects,
        clientsActifs: totalClients - clientsProspects,
        totalOpportunites,
        opportunitesEnCours,
        ticketsOuverts,
        ticketsResolus,
        caEstime,
        caPondere,
        caGagne,
      },
      repartitionPipeline,
      dernieresOpportunites,
      derniersTickets,
      derniersClients,
    });
  } catch (erreur) {
    console.error('Erreur GET /api/dashboard:', erreur);
    return NextResponse.json(
      { erreur: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
