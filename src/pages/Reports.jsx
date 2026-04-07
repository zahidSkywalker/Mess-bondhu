import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMess } from '../hooks/useMess';
import { calculateMonthlySummary, getExpenseBreakdown } from '../utils/calculations';
import { useSettings } from '../hooks/useSettings';
import { useLanguageContext } from '../context/LanguageContext';
import ExportPDF from '../components/settings/ExportPDF';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatMonthKey, toBengaliNum, getMonthKey } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../utils/constants';

const ChevronLeft = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CalIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FileTextIcon = (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliCurrency(amount) {
  const formatted = formatCurrency(amount);
  if (typeof amount !== 'number' || isNaN(amount)) return formatted;
  return formatted.replace(/[0-9]/g, function(d) { return bengaliDigits[parseInt(d)]; });
}

export default function Reports() {
  const { activeMess, activeMessId } = useMess();
  const { t, isBn } = useLanguageContext();
  const { serviceChargePercent, mealRateMode, customMealRate } = useSettings();

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const [summary, setSummary] = useState(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);

  const monthKey = getMonthKey(currentDate);
  const monthLabel = formatMonthKey(monthKey, isBn ? 'bn' : 'en');

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth() + 1;

  const fmtCur = isBn ? toBengaliCurrency : formatCurrency;

  const loadReport = useCallback(async () => {
    if (!activeMessId) {
      setSummary(null);
      setExpenseBreakdown([]);
      return;
    }

    setLoading(true);
    try {
      const [data, breakdown] = await Promise.all([
        calculateMonthlySummary(activeMessId, year, month, {
          serviceChargePercent,
          mealRateMode,
          customMealRate,
        }),
        getExpenseBreakdown(activeMessId, year, month),
      ]);
      setSummary(data);
      setExpenseBreakdown(breakdown);
    } catch (err) {
      console.error('Failed to load report:', err);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [activeMessId, year, month, serviceChargePercent, mealRateMode, customMealRate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const getCatLabel = useCallback((catValue) => {
    const catDef = EXPENSE_CATEGORIES.find((c) => c.value === catValue);
    return catDef ? (isBn ? catDef.labelBn : catDef.labelEn) : catValue;
  }, [isBn]);

  const totalExpAmount = useMemo(() => {
    return expenseBreakdown.reduce((sum, e) => sum + e.total, 0);
  }, [expenseBreakdown]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t('reports.title')}</h1>
            <p className="page-subtitle">{t('reports.subtitle')}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
              <button onClick={goToPrevMonth} className="p-1.5 rounded-lg text-slate-500 hover:text-baltic hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                {ChevronLeft}
              </button>
              <button
                onClick={goToCurrentMonth}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-w-[140px] justify-center ${
                  isCurrentMonth ? 'text-baltic dark:text-teal' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {CalIcon}
                {monthLabel}
              </button>
              <button
                onClick={goToNextMonth}
                className={`p-1.5 rounded-lg transition-colors ${isCurrentMonth ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-500 hover:text-baltic hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                disabled={isCurrentMonth}
              >
                {ChevronRight}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && !summary && (
        <EmptyState
          icon={FileTextIcon}
          title={t('label.noData')}
          description={isBn ? 'এই মাসে কোনো তথ্য নেই।' : 'No data for this month.'}
        />
      )}

      {!loading && summary && (
        <div className="space-y-6 fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card hover={false} className="text-center py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('reports.totalExpenseHead')}</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">{fmtCur(summary.totalAllExpenses)}</p>
            </Card>
            <Card hover={false} className="text-center py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('reports.totalMealsHead')}</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">{isBn ? toBengaliNum(summary.totalMeals) : summary.totalMeals}</p>
            </Card>
            <Card hover={false} className="text-center py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('reports.totalCollectedHead')}</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{fmtCur(summary.totalCollected)}</p>
            </Card>
            <Card hover={false} className="text-center py-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('reports.totalDueHead')}</p>
              <p className={`text-lg font-bold mt-0.5 ${summary.totalBalance < -0.5 ? 'text-red-500' : 'text-slate-500'}`}>
                {fmtCur(Math.abs(summary.totalBalance))}
              </p>
            </Card>
          </div>

          <Card hover={false}>
            <h2 className="section-title">{t('reports.memberWiseBreakdown')}</h2>
            <div className="overflow-x-auto custom-scrollbar -mx-5 px-5">
              <table className="data-table min-w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th>{t('label.name')}</th>
                    <th className="text-center">{t('meals.title')}</th>
                    <th className="text-right">{t('meals.mealCost')}</th>
                    <th className="text-right">{t('members.rentPerMonth')}</th>
                    <th className="text-right">{t('dashboard.otherExpense')}</th>
                    <th className="text-right">{t('reports.totalExpenseHead')}</th>
                    <th className="text-right">{t('payments.memberPaid')}</th>
                    <th className="text-right">{t('members.dueInfo')}</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.memberBreakdown.map((m) => (
                    <tr key={m.memberId}>
                      <td className="font-medium">{m.memberName}</td>
                      <td className="text-center">{isBn ? toBengaliNum(m.totalMeals) : m.totalMeals}</td>
                      <td className="text-right">{fmtCur(m.mealCost)}</td>
                      <td className="text-right">{fmtCur(m.rent)}</td>
                      <td className="text-right">{fmtCur(m.sharedExpense + m.serviceCharge)}</td>
                      <td className="text-right font-semibold">{fmtCur(m.totalDue)}</td>
                      <td className="text-right text-emerald-600 dark:text-emerald-400">{fmtCur(m.totalPaid)}</td>
                      <td className={`text-right font-bold ${m.balance < -0.5 ? 'text-red-500' : m.balance > 0.5 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {fmtCur(Math.abs(m.balance))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-600 font-bold">
                    <td>{t('pdf.grandTotal')}</td>
                    <td className="text-center">{isBn ? toBengaliNum(summary.totalMeals) : summary.totalMeals}</td>
                    <td className="text-right">{fmtCur(summary.memberBreakdown.reduce((s, m) => s + m.mealCost, 0))}</td>
                    <td className="text-right">{fmtCur(summary.totalRent)}</td>
                    <td className="text-right">{fmtCur(summary.totalSharedExpenses + summary.totalServiceCharge)}</td>
                    <td className="text-right">{fmtCur(summary.totalDue)}</td>
                    <td className="text-right text-emerald-600 dark:text-emerald-400">{fmtCur(summary.totalCollected)}</td>
                    <td className={`text-right ${summary.totalBalance < -0.5 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {fmtCur(Math.abs(summary.totalBalance))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <Card hover={false}>
            <h2 className="section-title">{t('reports.expenseSummary')}</h2>
            <div className="space-y-3">
              {expenseBreakdown.map((cat) => {
                const percentage = totalExpAmount > 0 ? ((cat.total / totalExpAmount) * 100).toFixed(1) : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-300">{getCatLabel(cat.category)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{isBn ? toBengaliNum(percentage) : percentage}%</span>
                        <span className="font-semibold text-slate-800 dark:text-white w-24 text-right">{fmtCur(cat.total)}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-baltic dark:bg-teal rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {expenseBreakdown.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">{t('expenses.noExpenses')}</p>
              )}
            </div>
          </Card>

          <ExportPDF messId={activeMessId} activeMess={activeMess} />
        </div>
      )}
    </div>
  );
}
