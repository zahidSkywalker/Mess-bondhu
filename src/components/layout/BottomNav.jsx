import React from 'react';
import { LayoutDashboard, Users, UtensilsCrossed, Wallet, Settings } from 'lucide-react';
import { useLang } from '../../context/LangContext';

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
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-2 pb-4 z-40 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-baltic-blue dark:text-emerald bg-baltic-blue/5 dark:bg-emerald/5 -translate-y-2' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className={`${isActive ? 'shadow-soft' : ''} p-1 rounded-lg`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
