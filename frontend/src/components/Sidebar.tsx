import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { navigationItems } from '../utils/navigation';
import { Brand } from './Brand';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary navigation" className="mt-8 flex-1">
      <p className="px-3 text-[0.6875rem] font-semibold tracking-[0.16em] text-slate-400 uppercase dark:text-slate-500">
        Workspace
      </p>
      <ul className="mt-3 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-50 text-teal-800 dark:bg-teal-400/10 dark:text-teal-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white',
                  ].join(' ')
                }
              >
                <Icon
                  aria-hidden="true"
                  className="size-[1.125rem] shrink-0"
                  strokeWidth={2}
                />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/80 bg-white px-5 py-6 lg:flex lg:flex-col dark:border-white/10 dark:bg-[#111815]">
        <Brand />
        <Navigation />
        <p className="px-3 text-xs leading-5 text-slate-400 dark:text-slate-500">
          A clear view of your finances.
        </p>
      </aside>

      <div
        aria-hidden={!isOpen}
        className={[
          'fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
      />
      <aside
        aria-label="Mobile navigation"
        aria-modal="true"
        role="dialog"
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[min(20rem,86vw)] flex-col bg-white px-5 py-5 shadow-2xl transition-transform duration-300 ease-out lg:hidden dark:bg-[#111815]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close navigation"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <Navigation onNavigate={onClose} />
      </aside>
    </>
  );
}
