import Card from '../ui/Card';
import { useLanguageContext } from '../../context/LanguageContext';
import { formatCurrency, toBengaliNum } from '../../utils/formatters';

/**
 * ProfitLossCalculator — Manager P&L breakdown display.
 *
 * Props:
 *   profitLoss: object from calculateProfitLoss()
 *   serviceChargePercent: number
 */
export default function ProfitLossCalculator({ profitLoss, serviceChargePercent = 0 }) {
  const { t, isBn } = useLanguageContext();

  if (!profitLoss) return null;

  if (serviceChargePercent <= 0) {
    return (
      <Card hover={false} className="text-center py-6">
        <p className="text-sm text-slate-400 dark:text-slate-500">
          {isBn
            ? 'সার্ভিস চার্জ সেট করা না থাকলে লাভ-ক্ষতি দেখানো হবে না।'
            : 'Set a service charge percentage in Settings to see the P&L breakdown.'}
        </p>
        <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
          {t('settings.title')} → {t('settings.serviceCharge')}
        </p>
      </Card>
    );
  }

  const statusConfig = {
    surplus: {
      label: t('status.surplus'),
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    deficit: {
      label: t('status.deficit'),
      color: 'text-red-500 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/10',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
          <polyline points="17 18 23 18 23 12" />
        </svg>
      ),
    },
    balanced: {
      label: t('status.balanced'),
      color: 'text-slate-500 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-800/50',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
    },
  };

  const status = statusConfig[profitLoss.status] || statusConfig.balanced;

  return (
    <Card hover={false}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t('dashboard.profitLoss')}
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {t('settings.serviceCharge')}: {isBn ? toBengaliNum(serviceChargePercent) : serviceChargePercent}%
          </span>
        </div>

        {/* Breakdown rows */}
        <div className="space-y-2.5">
          {/* Total Expense */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t('dashboard.totalExpense')}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {formatCurrency(profitLoss.totalAllExpenses)}
            </span>
          </div>

          {/* Service Charge */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {t('dashboard.serviceCharge')}
              <span className="text-xs ml-1 text-slate-400 dark:text-slate-500">
                ({isBn ? toBengaliNum(serviceChargePercent) : serviceChargePercent}%)
              </span>
            </span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              + {formatCurrency(profitLoss.serviceChargeAmount)}
            </span>
          </div>

          {/* Total cost to members */}
          <div className="flex items-center justify-between text-sm border-t border-slate-100 dark:border-slate-700 pt-2.5">
            <span className="text-slate-600 dark:text-slate-300 font-medium">{t('dashboard.costToMembers')}</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {formatCurrency(profitLoss.totalCostToMembers)}
            </span>
          </div>

          {/* Total collected */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t('dashboard.collected')}</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(profitLoss.totalCollected)}
            </span>
          </div>
        </div>

        {/* Net result */}
        <div className={`${status.bg} rounded-xl p-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className={status.color}>{status.icon}</span>
            <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
          </div>
          <span className={`text-lg font-bold ${status.color}`}>
            {profitLoss.netCollection >= 0 ? '+' : '-'}
            {formatCurrency(Math.abs(profitLoss.netCollection))}
          </span>
        </div>
      </div>
    </Card>
  );
}
