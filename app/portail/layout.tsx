/**
 * Layout spécifique pour le portail client.
 * N'inclut pas la sidebar ni la navigation principale.
 */
export default function PortailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {children}
    </div>
  );
}
