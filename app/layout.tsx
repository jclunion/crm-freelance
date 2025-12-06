import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { RechercheGlobale } from '@/components/ui/RechercheGlobale';

// Police pour les titres - moderne, géométrique, impactante
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
});

// Police pour le corps de texte - neutre, très lisible
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// Police monospace pour les données, codes, chiffres
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'CRM Freelance',
  description: 'CRM + Support unifiés pour freelances et agences',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans min-h-screen bg-[var(--background)]">
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>
              <ToastProvider>
                {children}
                <RechercheGlobale />
              </ToastProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
