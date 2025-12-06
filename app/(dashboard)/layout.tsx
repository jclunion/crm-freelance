import { Sidebar } from '@/components/layout/Sidebar';

/**
 * Layout pour les routes authentifiées (dashboard).
 * Inclut la sidebar et la structure principale.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
