import React from 'react';
import { LayoutDashboard, Users, UtensilsCrossed, Wallet, Settings } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { motion } from 'framer-motion';

const BottomNav = ({ activePage, setActivePage }) => {
  const { t } = useLang();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'meals', label: t('meals'), icon: UtensilsCrossed },
    { id: 'expenses', label: t('expenses'), icon: Wallet },
    { id: 'members', label: t('members'), icon: Users },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40">
      {/* Container to match app width on desktop */}
      <div className="max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                whileTap={{ scale: 0.9 }}
                className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'text-baltic-blue dark:text-emerald' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="navBubble"
                    className="absolute inset-0 bg-baltic-blue/10 dark:bg-emerald/10 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
