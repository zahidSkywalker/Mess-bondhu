import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMess } from '../hooks/useMess';
import useMeals from '../hooks/useMeals';
import useMembers from '../hooks/useMembers';
import MealTable from '../components/meals/MealTable';
import MealCalendar from '../components/meals/MealCalendar';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import { useLanguageContext } from '../context/LanguageContext';
import { toBengaliNum, formatMonthKey, getMonthKey, getToday, getDaysInMonth } from '../utils/formatters';
import { DAYS_BN, DAYS_EN } from '../utils/constants';

const ChevronLeft = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 18 9" />
  </svg>
);

const ChevronRight = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLine="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 18 9" />
  </svg>
);

export default function Meals() {
  const { activeMessId } = useMess();
  const { t, isBn } = useLanguageContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [viewMode, setViewMode] = useState('table');

  const {
    meals,
    loading: mealsLoading,
    totalMealCount,
    fetchMeals,
    getMealsByDateMap,
    quickSetMealCount,
  } = useMeals(activeMessId);

  const { getActiveMembers } = useMembers(activeMessId);
  const [activeMembers, setActiveMembers] = useState([]);

  useEffect(() => {
    if (activeMessId) {
      getActiveMembers().then(setActiveMembers);
    }
  }, [activeMessId, getActiveMembers]);

  useEffect(() => {
    if (activeMessId) {
      fetchMeals(year, month);
    }
  }, [activeMessId, year, month, fetchMeals]);

  const mealsByDate = useMemo(() => getMealsByDateMap(), [meals, getMealsByDateMap]);

  const daysInMonth = getDaysInMonth(year, month);
  const days = isBn ? DAYS_BN : DAYS_EN;

  // Date strip
  const dateOptions = useMemo(() => {
    const options = [];
    for (let d = daysInMonth; d >= 1; d--) {
      const dd = String(d).padStart(2, '0');
      const mm = String(month).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      const today = new Date();
      const isToday = d === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
      const dateMeals = mealsByDate[dateStr] || {};
      let dayTotal = 0;
      for (const count of Object.values(dateMeals)) dayTotal += count;
      options.push({ dateStr, dayNum: d, dayOfWeek, total: dayTotal, isToday });
    }
    return options;
  }, [year, month, mealsByDate]);

  const selectedDateTotal = useMemo(() => {
    const dateMeals = mealsByDate[selectedDate] || {};
    let total = 0;
    for (const count of Object.values(dateMeals)) total += count;
    return total;
  }, [mealsByDate, selectedDate]);

  const getMemberMealCount = useCallback((memberId) => {
    const dateMeals = mealsByDate[selectedDate] || {};
    return dateMeals[memberId] || 0;
  }, [mealsByDate, selectedDate]);

  const [updatingId, setUpdatingId] = useState(null);

  const handleMealChange = useCallback(async (memberId, delta) => {
    const current = getMemberMealCount(memberId);
    const next = Math.max(0, current + delta);
    if (next === current && next === 0) return;
    setUpdatingId(memberId);
    const result = await quickSetMealCount(memberId, selectedDate, next);
    setUpdatingId(null);
    if (!result.success) {
      // fetchMeals will handle re-sync
      fetchMeals(year, month);
    }
  }, [getMemberMealCount, selectedDate, quickSetMealCount, fetchMeals, year, month]);

  const [markingAllLoading, setMarkingAllLoading] = useState(false);

  const handleMarkAllPresent = useCallback(async () => {
    setMarkingAllLoading(true);
    for (const member of activeMembers) {
      await quickSetMealCount(member.id, selectedDate, 1);
    }
    setMarkingAllLoading(false);
  }, [activeMembers, selectedDate, quickSetMealCount]);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(getToday());
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(getToday());
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(getToday());
  }, []);

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth() + 1;

  const monthKey = getMonthKey(currentDate);
  const monthLabel = formatMonthKey(monthKey, isBn ? 'bn' : 'en');

  const viewTabs = [
    { key: 'table', label: t('meals.table') },
    { key: 'calendar', label: t('meals.calendar') },
  ];

  const avatarColors = [
    'bg-baltic', 'bg-teal', 'bg-emerald',
    'bg-amber-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-cyan-500', 'bg-rose-500',
  ];

  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = (name || '').charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t('meals.title')}</h1>
            <p className="page-subtitle">{t('meals.subtitle')}</p>
          </div>
          {/* Month nav */}
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
              {monthLabel}
            </button>
            <button
              onClick={goToNextMonth}
              className={`p-1.5 rounded-lg transition-colors ${
                isCurrentMonth ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-500 hover:text-baltic hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              disabled={isCurrentMonth}
            >
              {ChevronRight}
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card hover={false} className="text-center py-3">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t('dashboard.totalMeals')}</p>
          <p className="text-xl font-bold text-baltic dark:text-teal mt-0.5">
            {isBn ? toBengaliNum(totalMealCount) : totalMealCount}
          </p>
        </Card>
        <Card hover={false} className="text-center py-3">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t('dashboard.activeMembers')}</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">
            {isBn ? toBengaliNum(activeMembers.length) : activeMembers.length}
          </p>
        </Card>
      </div>

      {/* Date strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar mb-5">
        {dateOptions.map(({ dateStr, dayNum, dayOfWeek, total, isToday }) => {
          const isSelected = dateStr === selectedDate;
          const isFriday = dayOfWeek === 5;
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`
                flex-shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-all duration-150
                ${isSelected
                  ? 'bg-baltic text-white shadow-sm scale-[1.02]'
                  : isToday
                  ? 'ring-2 ring-baltic dark:ring-teal'
                  : isFriday
                  ? 'bg-amber-50 dark:bg-amber-900/10'
                  : 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              <span className={`text-[11px] font-medium ${isFriday ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {isBn ? toBengaliNum(dayNum) : dayNum}
              </span>
              {total > 0 && (
                <span className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                  {isBn ? toBengaliNum(total) : total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date summary + Mark all */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {isBn
              ? `${toBengaliNum(selectedDateTotal)} জনের খাবার`
              : `${selectedDateTotal} meal${selectedDateTotal !== 1 ? 's' : ''} today`
            }
          </span>
        </div>
        <button
          onClick={handleMarkAllPresent}
          disabled={markingAllLoading || activeMembers.length === 0}
          className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-50"
        >
          {markingAllLoading
            ? (isBn ? 'হচ্ছিছে...' : 'Marking...')
            : (isBn ? 'সবাই উপস্থিত (১ টি করে প্রত্যেকে)'
            : 'All Present (1 each)')
          }
        </button>
      </div>

      {/* Member cards with +/- buttons */}
      <div className="space-y-2">
        {activeMembers.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500">
            {t('members.noMembers')}
          </div>
        ) : (
          activeMembers.map((member) => {
            const count = getMemberMealCount(member.id);
            const isUpdating = updatingId === member.id;
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 shadow-card"
              >
                {/* Avatar */}
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                    ${getAvatarColor(member.name)}
                  `}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + phone */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                    {member.name}
                  </p>
                  {member.phone && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {member.phone}
                    </p>
                  )}
                </div>

                {/* +/- buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleMealChange(member.id, -1)}
                    disabled={isUpdating || count === 0}
                    className={`
                      w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold transition-all duration-100
                      ${count === 0
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        : isUpdating
                          ? 'opacity-50 cursor-wait'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95'
                      }
                    `}
                    aria-label={isBn ? 'কম কমিয়ে' : 'Decrease'}
                  >
                    −
                  </button>

                  {/* Count display */}
                  <div className="w-10 h-9 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center">
                    <span className={`text-sm font-bold tabular-nums ${count > 0 ? 'text-baltic dark:text-teal' : 'text-slate-300 dark:text-slate-600'}`}>
                      {isBn ? toBengaliNum(count) : count}
                    </span>
                  </div>

                  <button
                    onClick={() => handleMealChange(member.id, 1)}
                    disabled={isUpdating}
                    className={`
                      w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold transition-all duration-100
                      ${isUpdating
                        ? 'opacity-50 cursor-wait'
                        : 'bg-emerald/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald/20 dark:hover:bg-emerald/30 active:scale-95'
                      }
                    `}
                    aria-label={isBn ? 'বাড়া' : 'Increase'}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View tabs + view */}
      <div className="flex items-center justify-between mt-6">
        <Tabs
          tabs={viewTabs}
          activeTab={viewMode}
          onTabChange={setViewMode}
          contentClassName=""
        />
      </div>

      <div className="fade-in" key={viewMode}>
        {viewMode === 'table' ? (
          <MealTable
            year={year}
            month={month}
            activeMembers={activeMembers}
            mealsByDate={mealsByDate}
          />
        ) : (
          <MealCalendar
            year={year}
            month={month}
            mealsByDate={mealsByDate}
            onDateClick={(dateStr) => setSelectedDate(dateStr)}
          />
        )}
      </div>
    </div>
  );
}
