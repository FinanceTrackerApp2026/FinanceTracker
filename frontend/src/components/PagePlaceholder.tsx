import type { LucideIcon } from 'lucide-react';

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PagePlaceholder({
  title,
  description,
  icon: Icon,
}: PagePlaceholderProps) {
  return (
    <section aria-labelledby="page-title">
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl items-center justify-center py-10">
        <div className="w-full rounded-3xl border border-dashed border-slate-300 bg-white/65 px-6 py-16 text-center shadow-sm sm:px-10 dark:border-white/15 dark:bg-white/[0.025]">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-300/10">
            <Icon aria-hidden="true" className="size-6" />
          </span>
          <h2
            id="page-title"
            className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white"
          >
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
