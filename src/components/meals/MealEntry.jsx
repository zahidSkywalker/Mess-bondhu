import { useState, useEffect, useCallback, useMemo } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';
import { useLanguageContext } from '../../context/LanguageContext';
import { useToastContext } from '../../context/ToastContext';
import { validateMealEntry } from '../../utils/validators';
import { getToday } from '../../utils/formatters';
import db from '../../db';

/**
 * MealEntry — Form for recording daily meals.
 *
 * Props:
 *   messId: number — current mess id
 *   activeMembers: array — list of active member objects
 *   defaultMealCount: number — from settings
 *   selectedDate: string — pre-selected date (YYYY-MM-DD)
 *   onSubmit: callback — called after successful entry to trigger refresh
 *   onCancel: callback — close the form
 *   mode: 'single' | 'bulk' | 'both' — which modes to show
 *   initialMode: 'single' | 'bulk' — starting tab
 */
export default function MealEntry({
  messId,
  activeMembers = [],
  defaultMealCount = 1,
  selectedDate = null,
  onSubmit,
  onCancel,
  mode = 'both',
  initialMode = 'single',
}) {
  const { t, isBn } = useLanguageContext();
  const { success, error: showError } = useToastContext();

  const [currentMode, setCurrentMode] = useState(initialMode);
  const [submitting, setSubmitting] = useState(false);

  // ---- Single entry state ----
  const [singleForm, setSingleForm] = useState({
    memberId: '',
    date: selectedDate || getToday(),
    mealCount: String(defaultMealCount),
  });
  const [singleErrors, setSingleErrors] = useState({});

  // ---- Bulk entry state ----
  const [bulkDate, setBulkDate] = useState(selectedDate || getToday());
  const [bulkMeals, setBulkMeals] = useState({}); // { memberId: mealCount string }

  // ---- Build member options for select ----
  const memberOptions = useMemo(() => {
    return activeMembers.map((m) => ({
      value: m.id,
      label: m.name,
    }));
  }, [activeMembers]);

  // ---- Initialize bulk meals map when members or date change ----
  useEffect(() => {
    const initial = {};
    for (const member of activeMembers) {
      initial[member.id] = String(defaultMealCount);
    }
    setBulkMeals(initial);
  }, [activeMembers.length]); // Only re-init when member count changes

  // ---- Sync selectedDate prop changes ----
  useEffect(() => {
    if (selectedDate) {
      setSingleForm((prev) => ({ ...prev, date: selectedDate }));
      setBulkDate(selectedDate);
    }
  }, [selectedDate]);

  // ---- Tabs definition ----
  const tabs = useMemo(() => {
    const list = [];
    if (mode === 'both' || mode === 'single') {
      list.push({ key: 'single', label: t('meals.singleEntry') });
    }
    if (mode === 'both' || mode === 'bulk') {
      list.push({ key: 'bulk', label: t('meals.bulkEntry') });
    }
    return list;
  }, [mode, t]);

  // ---- Single: handle change ----
  const handleSingleChange = useCallback((field, value) => {
    setSingleForm((prev) => ({ ...prev, [field]: value }));
    if (singleErrors[field]) {
      setSingleErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [singleErrors]);

  // ---- Single: validate and submit ----
  const handleSingleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const validation = validateMealEntry(singleForm);
      if (!validation.valid) {
        const message = isBn ? validation.messageBn : validation.messageEn;
        if (message.includes(isBn ? 'সদস্য' : 'Member')) {
          setSingleErrors({ memberId: message });
        } else if (message.includes(isBn ? 'তারিখ' : 'Date')) {
          setSingleErrors({ date: message });
        } else {
          showError(message);
        }
        return;
      }

      setSubmitting(true);
      try {
        const now = new Date().toISOString();
        await db.meals.add({
          messId,
          memberId: Number(singleForm.memberId),
          date: singleForm.date,
          mealCount: Number(singleForm.mealCount) || 0,
          createdAt: now,
        });
        success(t('toast.saved'));
        // Reset member selection but keep date
        setSingleForm((prev) => ({ ...prev, memberId: '', mealCount: String(defaultMealCount) }));
        if (onSubmit) onSubmit();
      } catch (err) {
        console.error('Failed to add meal:', err);
        showError(t('toast.error'));
      } finally {
        setSubmitting(false);
      }
    },
    [singleForm, isBn, messId, defaultMealCount, success, showError, t, onSubmit]
  );

  // ---- Bulk: handle meal count change for a member ----
  const handleBulkMealChange = useCallback((memberId, value) => {
    setBulkMeals((prev) => ({ ...prev, [memberId]: value }));
  }, []);

  // ---- Bulk: mark all present ----
  const handleMarkAllPresent = useCallback(() => {
    const updated = {};
    for (const member of activeMembers) {
      updated[member.id] = '1';
    }
    setBulkMeals(updated);
  }, [activeMembers]);

  // ---- Bulk: validate and submit ----
  const handleBulkSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!bulkDate) {
        showError(isBn ? 'তারিখ নির্বাচন করুন' : 'Please select a date');
        return;
      }

      if (activeMembers.length === 0) {
        showError(isBn ? 'কোনো সক্রিয় সদস্য নেই' : 'No active members');
        return;
      }

      setSubmitting(true);
      try {
        const now = new Date().toISOString();
        const mealsToAdd = [];

        for (const member of activeMembers) {
          const count = Number(bulkMeals[member.id]) || 0;
          if (count > 0) {
            mealsToAdd.push({
              messId,
              memberId: member.id,
              date: bulkDate,
              mealCount: count,
              createdAt: now,
            });
          }
        }

        if (mealsToAdd.length === 0) {
          showError(isBn ? 'কমপক্ষে একটি খাবার লিখুন' : 'Enter at least one meal');
          setSubmitting(false);
          return;
        }

        await db.meals.bulkAdd(mealsToAdd);
        success(
          isBn
            ? `${mealsToAdd.length}টি এন্ট্রি সেভ হয়েছে!`
            : `${mealsToAdd.length} entries saved!`
        );
        if (onSubmit) onSubmit();
      } catch (err) {
        console.error('Failed to bulk add meals:', err);
        showError(t('toast.error'));
      } finally {
        setSubmitting(false);
      }
    },
    [bulkDate, bulkMeals, activeMembers, messId, isBn, success, showError, t, onSubmit]
  );

  return (
    <div className="space-y-4">
      {/* Tab switcher (only if both modes available) */}
      {mode === 'both' && (
        <Tabs
          tabs={tabs}
          activeTab={currentMode}
          onTabChange={setCurrentMode}
        />
      )}

      {/* ---- Single Entry Form ---- */}
      {(currentMode === 'single' && mode !== 'bulk') && (
        <form onSubmit={handleSingleSubmit} className="space-y-4">
          <Select
            label={t('meals.selectMember')}
            options={memberOptions}
            value={singleForm.memberId}
            onChange={(e) => handleSingleChange('memberId', e.target.value)}
            placeholder={t('meals.selectMember')}
            error={singleErrors.memberId}
            required={true}
          />

          <Input
            label={t('meals.selectDate')}
            value={singleForm.date}
            onChange={(e) => handleSingleChange('date', e.target.value)}
            error={singleErrors.date}
            type="date"
            required={true}
            max={getToday()}
          />

          <Input
            label={t('label.mealCount')}
            placeholder={t('meals.mealCountPlaceholder')}
            value={singleForm.mealCount}
            onChange={(e) => handleSingleChange('mealCount', e.target.value)}
            error={singleErrors.mealCount}
            type="number"
            min="0"
            step="1"
            helpText={t('meals.defaultMealNote')}
          />

          <div className="flex items-center justify-end gap-3 pt-1">
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
                {t('action.cancel')}
              </Button>
            )}
            <Button type="submit" variant="primary" loading={submitting}>
              {t('meals.addMeal')}
            </Button>
          </div>
        </form>
      )}

      {/* ---- Bulk Entry Form ---- */}
      {(currentMode === 'bulk' && mode !== 'single') && (
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          {/* Date selector + Mark All button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                label={t('meals.selectDate')}
                value={bulkDate}
                onChange={(e) => setBulkDate(e.target.value)}
                type="date"
                required={true}
                max={getToday()}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleMarkAllPresent}
                className="whitespace-nowrap"
              >
                {t('meals.markAllPresent')}
              </Button>
            </div>
          </div>

          {/* Member meal count rows */}
          <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
            {activeMembers.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                {t('members.noMembers')}
              </p>
            ) : (
              activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30"
                >
                  {/* Member name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {member.name}
                    </p>
                  </div>

                  {/* Meal count input */}
                  <div className="w-20 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={bulkMeals[member.id] || '0'}
                      onChange={(e) => handleBulkMealChange(member.id, e.target.value)}
                      className="input-field text-center py-2 px-2"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary + Actions */}
          {activeMembers.length > 0 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {isBn
                  ? `মোট: ${activeMembers.length} জন সদস্য`
                  : `Total: ${activeMembers.length} members`}
              </p>
              <div className="flex items-center gap-3">
                {onCancel && (
                  <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
                    {t('action.cancel')}
                  </Button>
                )}
                <Button type="submit" variant="primary" loading={submitting}>
                  {t('meals.addMeal')}
                </Button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
