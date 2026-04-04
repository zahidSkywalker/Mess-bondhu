import StatsCard from './StatsCard';
import { useLanguageContext } from '../../context/LanguageContext';
import { formatCurrency, toBengaliNum, formatMonthKey } from '../../utils/formatters';

/* Inline SVG icons for dashboard stat cards */
const TotalExpenseIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const TotalMealsIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

const CollectedIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DueIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const MembersIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MealRateIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

/**
 * MonthlyOverview — Grid of stat cards for the dashboard.
 *
 * Props:
 *   summary: object from calculateMonthlySummary
 *   monthKey: string "YYYY-MM"
 */
export default function MonthlyOverview({ summary, monthKey }) {
  const { t, isBn } = useLanguageContext();

  if (!summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-16" />
          </div>
        ))}
      </div>
    );
  }

  const monthLabel = formatMonthKey(monthKey, isBn ? 'bn' : 'en');

  const cards = [
    {
      label: t('dashboard.totalExpense'),
      value: formatCurrency(summary.totalAllExpenses),
      icon: TotalExpenseIcon,
      color: 'baltic',
      subtitle: `${isBn ? 'বাজার' : 'Bazar'}: ${formatCurrency(summary.totalBazarCost)}`,
    },
    {
      label: t('dashboard.totalMeals'),
      value: isBn ? toBengaliNum(summary.totalMeals) : String(summary.totalMeals),
      icon: TotalMealsIcon,
      color: 'teal',
      subtitle: `${t('dashboard.mealRate')}: ৳${summary.mealRate}`,
    },
    {
      label: t('dashboard.totalCollected'),
      value: formatCurrency(summary.totalCollected),
      icon: CollectedIcon,
      color: 'emerald',
      subtitle: summary.totalCollected >= summary.totalAllExpenses
        ? (isBn ? 'পর্যাপ্ত' : 'Sufficient')
        : (isBn ? 'অপর্যাপ্ত' : 'Insufficient'),
    },
    {
      label: t('dashboard.totalDue'),
      value: formatCurrency(Math.abs(summary.totalBalance)),
      icon: DueIcon,
      color: summary.totalBalance < -0.5 ? 'red' : 'slate',
      subtitle: summary.totalBalance < -0.5
        ? (isBn ? 'বাকি আছে' : 'Outstanding')
        : (isBn ? 'কোনো বাকি নেই' : 'All clear'),
    },
    {
      label: t('dashboard.activeMembers'),
      value: isBn ? toBengaliNum(summary.activeMemberCount) : String(summary.activeMemberCount),
      icon: MembersIcon,
      color: 'slate',
      subtitle: `${isBn ? 'মোট ভাড়া' : 'Total rent'}: ${formatCurrency(summary.totalRent)}`,
    },
    {
      label: t('dashboard.mealRate'),
      value: `৳${summary.mealRate}`,
      icon: MealRateIcon,
      color: 'amber',
      subtitle: t('meals.bazarDividedByMeals'),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card) => (
          <StatsCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
            subtitle={card.subtitle}
          />
        ))}
      </div>
    </div>
  );
}
