import { Menu, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useTheme } from '../hooks/useTheme';
import { navigationItems } from '../utils/navigation';

interface TopNavbarProps {
  onOpenMenu: () => void;
}

export function TopNavbar({ onOpenMenu }: TopNavbarProps) {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const currentPage = navigationItems.find(
    (item) =>
      item.path === pathname ||
      (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`)),
  );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#f6f8f7]/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b100e]/85">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="inline-flex size-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-white hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 lg:hidden dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          aria-label="Open navigation"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-slate-950 sm:text-base dark:text-white">
            {currentPage?.label ?? 'Finance Tracker'}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
            {currentPage?.description ?? 'Personal finance workspace'}
          </p>
        </div>

        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <Moon aria-hidden="true" className="size-[1.125rem]" />
            ) : (
              <Sun aria-hidden="true" className="size-[1.125rem]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
