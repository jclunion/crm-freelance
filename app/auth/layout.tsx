export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout sans sidebar pour les pages d'authentification
  return <>{children}</>;
}
