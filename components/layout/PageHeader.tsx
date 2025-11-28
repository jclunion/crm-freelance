import { cn } from '@/lib/utils';

interface PageHeaderProps {
  titre: string;
  description?: string;
  children?: React.ReactNode; // Actions (boutons)
  className?: string;
}

export function PageHeader({
  titre,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between border-b border-[var(--border)] px-6 py-4',
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{titre}</h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
