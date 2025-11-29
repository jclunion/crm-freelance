'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  Target,
  Ticket,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn, genererInitiales } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { BoutonRechercheGlobale } from '@/components/ui/RechercheGlobale';

const navigationItems = [
  {
    nom: 'Tableau de bord',
    href: '/',
    icone: LayoutDashboard,
  },
  {
    nom: 'Clients',
    href: '/clients',
    icone: Users,
  },
  {
    nom: 'Opportunités',
    href: '/opportunites',
    icone: Target,
  },
  {
    nom: 'Tickets',
    href: '/tickets',
    icone: Ticket,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Ne pas afficher la sidebar sur les pages d'auth
  if (pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--background)]">
      {/* Logo / Titre + Theme Toggle */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
        <h1 className="text-xl font-bold text-[var(--primary)]">
          CRM Freelance
        </h1>
        <ThemeToggle />
      </div>

      {/* Barre de recherche */}
      <div className="px-3 pt-4">
        <BoutonRechercheGlobale />
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const estActif = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                estActif
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)] hover:translate-x-1'
              )}
            >
              <item.icone className="h-5 w-5" />
              {item.nom}
            </Link>
          );
        })}
      </nav>

      {/* Utilisateur connecté + Paramètres */}
      <div className="border-t border-[var(--border)] px-3 py-4">
        {/* Infos utilisateur */}
        {session?.user && (
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-[var(--border)]/30 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-[var(--primary-foreground)]">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                genererInitiales(session.user.name || session.user.email || 'U')
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {session.user.name || 'Utilisateur'}
              </p>
              <p className="truncate text-xs text-[var(--muted)]">
                {session.user.email}
              </p>
            </div>
          </div>
        )}

        {/* Paramètres */}
        <Link
          href="/parametres"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]'
          )}
        >
          <Settings className="h-5 w-5" />
          Paramètres
        </Link>

        {/* Déconnexion */}
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: '/auth/connexion' })}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        )}
      </div>
    </aside>
  );
}
