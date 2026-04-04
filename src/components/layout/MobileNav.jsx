import { NavLink } from 'react-router-dom';
import { useLanguageContext } from '../../context/LanguageContext';

/* Inline SVG icons for bottom nav — same style as Sidebar but 20x20 */
const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  members: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  meals: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  expenses: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  payments: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
};

/* Bottom nav items — subset of full nav, most-used 5 */
const MOBILE_NAV_ITEMS = [
  { path: '/', iconKey: 'dashboard', labelKey: 'nav.dashboard', end: true },
  { path: '/members', iconKey: 'members', labelKey: 'nav.members', end: false },
  { path: '/meals', iconKey: 'meals', labelKey: 'nav.meals', end: false },
  { path: '/expenses', iconKey: 'expenses', labelKey: 'nav.expenses', end: false },
  { path: '/payments', iconKey: 'payments', labelKey: 'nav.payments', end: false },
];

export default function MobileNav() {
  const { t } = useLanguageContext();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-0.5 flex-1 h-full
              text-[10px] font-medium transition-colors duration-200
              ${
                isActive
                  ? 'text-baltic dark:text-teal'
                  : 'text-slate-400 dark:text-slate-500'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'scale-110 transition-transform' : ''}>
                  {icons[item.iconKey]}
                </span>
                <span>{t(item.labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
