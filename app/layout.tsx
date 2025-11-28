import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';

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
    <html lang="fr">
      <body className="min-h-screen bg-[var(--background)]">
        <SessionProvider>
          <QueryProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
