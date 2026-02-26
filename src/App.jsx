import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Expenses from './pages/Expenses';
import Meals from './pages/Meals';
import Settings from './pages/Settings';

// Components
import BottomNav from './components/layout/BottomNav';
import { useCalculations } from './hooks/useCalculations';
import { generateReport } from './utils/pdfGenerator';
import { format } from 'date-fns';

// Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -10, scale: 0.98 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

const AppContent = () => {
  const { activeMess, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setCurrentPage('dashboard');
  }, [activeMess?.id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-baltic-blue"></div>
    </div>
  );

  if (!activeMess) return <Auth />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'members': return <Members />;
      case 'expenses': return <Expenses />;
      case 'meals': return <Meals />;
      case 'settings': return <Settings />;
      case 'reports':
        const { summary, memberStats } = useCalculations(activeMess.id, currentMonth);
        if (!summary.loading) {
           generateReport(summary, memberStats, format(currentMonth, 'MMMM yyyy'));
           setCurrentPage('dashboard');
        }
        return <div className="p-10 text-center font-medium text-slate-500">Generating Report...</div>;
      default: return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-200 selection:text-baltic-blue flex justify-center">
      
      {/* The App Container */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 min-h-screen relative shadow-2xl sm:border-x sm:border-slate-200 dark:sm:border-slate-800">
        
        {/* Animated Page Wrapper */}
        {/* Added pt-safe for top alignment on notched devices */}
        <main className="pb-28 pt-8 pt-safe px-6 min-h-screen relative">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentPage}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="w-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Nav */}
        <BottomNav activePage={currentPage} setActivePage={setCurrentPage} />
        
        <Toaster position="top-center" toastOptions={{ duration: 3000, className: 'rounded-xl shadow-lg' }} />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
};

export default App;
