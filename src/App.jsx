import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import { Toaster } from 'react-hot-toast';

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

// Main App Content Router
const AppContent = () => {
  const { activeMess, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Reset to dashboard when switching mess
  useEffect(() => {
    setCurrentPage('dashboard');
  }, [activeMess?.id]);

  if (loading) return null; // Or a loading spinner

  if (!activeMess) {
    return <Auth />;
  }

  // Render Page Component based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'members':
        return <Members />;
      case 'expenses':
        return <Expenses />;
      case 'meals':
        return <Meals />;
      case 'settings':
        return <Settings />;
      case 'reports':
        // Special case: Generate PDF then go back
        const { summary, memberStats } = useCalculations(activeMess.id, currentMonth);
        if (!summary.loading) {
           generateReport(summary, memberStats, format(currentMonth, 'MMMM yyyy'));
           setCurrentPage('dashboard');
        }
        return <div className="p-10 text-center">Generating Report...</div>;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans selection:bg-emerald-200 selection:text-baltic-blue">
      <main className="max-w-lg mx-auto min-h-screen relative pb-24">
        {renderPage()}
      </main>
      <BottomNav activePage={currentPage} setActivePage={setCurrentPage} />
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </div>
  );
};

// Root App with Providers
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
