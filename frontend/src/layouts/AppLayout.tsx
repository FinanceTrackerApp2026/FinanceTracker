import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-slate-950 dark:bg-[#0b100e] dark:text-white">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="min-h-screen lg:pl-64">
        <TopNavbar onOpenMenu={openSidebar} />
        <main className="px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
