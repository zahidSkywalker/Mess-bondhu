import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useMessContext } from '../../context/MessContext';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import LoadingSpinner from '../ui/LoadingSpinner';
import MessSetup from '../../pages/MessSetup';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hasMess, loading } = useMessContext();
  const location = useLocation();

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // ---- Show full-screen loading while initial mess data loads ----
  if (loading) {
    return <LoadingSpinner.Page message="Loading..." />;
  }

  // ---- If no mess exists, redirect to setup page ----
  if (!hasMess) {
    return <MessSetup />;
  }

  // ---- Main layout shell ----
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={openSidebar} />

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-6">
          <div className="fade-in" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
