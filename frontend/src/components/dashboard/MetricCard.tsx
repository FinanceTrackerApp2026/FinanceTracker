import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: 'positive' | 'negative' | 'neutral';
}

const toneStyles = {
  positive:
    'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/10',
  negative:
    'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-300/10',
  neutral:
    'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10',
};

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'neutral',
}: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#111815] dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${toneStyles[tone]}`}
        >
          <Icon
            aria-hidden="true"
            className="size-[1.125rem]"
            strokeWidth={2}
          />
        </span>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-400 dark:text-slate-500">
        {helper}
      </p>
    </article>
  );
}
