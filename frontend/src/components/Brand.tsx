import { WalletCards } from 'lucide-react';

interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm shadow-teal-950/20">
        <WalletCards aria-hidden="true" className="size-5" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight text-slate-950 dark:text-white">
            Finance Tracker
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            Personal finance
          </span>
        </span>
      )}
    </div>
  );
}
