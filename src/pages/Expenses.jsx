import { useState, useEffect, useCallback } from 'react';
import { useMess } from '../hooks/useMess';
import useExpenses from '../hooks/useExpenses';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Modal from '../components/ui/Modal';
import { useLanguageContext } from '../context/LanguageContext';
import { formatMonthKey, getMonthKey } from '../utils/formatters';

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

export default function Expenses() {
  const { activeMessId } = useMess();
  const { t, isBn } = useLanguageContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const {
    expenses,
    loading,
    totalAmount,
    totalBazar,
    totalNonBazar,
    fetchExpenses,
    addExpense,
    getCategoryBreakdown,
  } = useExpenses(activeMessId);

  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);

  // ---- Fetch expenses when month changes ----
  useEffect(() => {
    if (activeMessId) {
      fetchExpenses(year, month);
    }
  }, [activeMessId, year, month, fetchExpenses]);

  // ---- Update category breakdown after expenses load ----
  useEffect(() => {
    if (expenses.length >= 0) {
      setCategoryBreakdown(getCategoryBreakdown());
    }
  }, [expenses, getCategoryBreakdown]);

  // ---- Refresh helper ----
  const refresh = useCallback(() => {
    fetchExpenses(year, month);
  }, [year, month, fetchExpenses]);

  // ---- Handle add ----
  const handleAddSubmit = useCallback(async (data) => {
    setAdding(true);
    const result = await addExpense(data);
    setAdding(false);
    if (result.success) {
      setAddOpen(false);
    }
  }, [addExpense]);

  // ---- Month navigation ----
  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth() + 1;

  const monthKey = getMonthKey(currentDate);
  const monthLabel = formatMonthKey(monthKey, isBn ? 'bn' : 'en');

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t('expenses.title')}</h1>
            <p className="page-subtitle">{t('expenses.subtitle')}</p>
          </div>

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

      {/* Expense list */}
      <ExpenseList
        expenses={expenses}
        loading={loading}
        totalAmount={totalAmount}
        totalBazar={totalBazar}
        totalNonBazar={totalNonBazar}
        categoryBreakdown={categoryBreakdown}
        onAdd={() => setAddOpen(true)}
      />

      {/* Add expense modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title={t('expenses.addExpense')}
        size="sm"
        footer={null}
      >
        <ExpenseForm
          onSubmit={handleAddSubmit}
          onCancel={() => setAddOpen(false)}
          loading={adding}
        />
      </Modal>
    </div>
  );
}
