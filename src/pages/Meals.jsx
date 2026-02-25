import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMembers } from '../hooks/useMembers';
import { db } from '../db/db';
import { useLang } from '../context/LangContext';
import Button from '../components/ui/Button';
import { format, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const Meals = () => {
  const { activeMess } = useAuth();
  const { t } = useLang();
  const { members } = useMembers(activeMess?.id);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealCounts, setMealCounts] = useState({}); // { memberId: count }
  const [saving, setSaving] = useState(false);

  // Fetch existing meals for selected date when date or members change
  useEffect(() => {
    const loadMeals = async () => {
      if (!activeMess?.id) return;
      
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);

      const existingMeals = await db.meals
        .where('messId').equals(activeMess.id)
        .and(meal => meal.date >= start && meal.date <= end)
        .toArray();

      // Map existing meals to state
      const counts = {};
      existingMeals.forEach(m => {
        counts[m.memberId] = m.count;
      });
      
      // Ensure all active members are in the state (default 0 if not found)
      members.filter(m => m.status === 'active').forEach(m => {
        if (counts[m.id] === undefined) counts[m.id] = 0;
      });

      setMealCounts(counts);
    };

    loadMeals();
  }, [selectedDate, activeMess?.id, members]);

  const handleCountChange = (memberId, value) => {
    setMealCounts(prev => ({
      ...prev,
      [memberId]: parseInt(value) || 0
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);

      // Strategy: Delete all meals for this mess on this date, then bulk add
      // This is simpler and safer than upserting for this scope
      await db.meals
        .where('messId').equals(activeMess.id)
        .and(meal => meal.date >= start && meal.date <= end)
        .delete();

      const bulkData = Object.entries(mealCounts).map(([memberId, count]) => ({
        messId: activeMess.id,
        memberId: parseInt(memberId),
        count: parseFloat(count),
        date: selectedDate
      }));

      if (bulkData.length > 0) {
        await db.meals.bulkAdd(bulkData);
      }

      toast.success('Meals updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save meals');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur z-10 py-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-baltic-blue dark:text-emerald">{t('meals')}</h1>
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ChevronLeft />
          </button>
          <span className="font-bold text-lg w-32 text-center">
            {format(selectedDate, 'dd MMM')}
          </span>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {members.filter(m => m.status === 'active').map(member => (
          <div key={member.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tropical-teal/20 text-tropical-teal flex items-center justify-center font-bold">
                {member.name.charAt(0)}
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{member.name}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleCountChange(member.id, (mealCounts[member.id] || 0) - 1)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200"
              >
                -
              </button>
              <input 
                type="number" 
                value={mealCounts[member.id] || 0}
                onChange={(e) => handleCountChange(member.id, e.target.value)}
                className="w-16 text-center bg-transparent font-bold text-xl focus:outline-none"
              />
              <button 
                onClick={() => handleCountChange(member.id, (mealCounts[member.id] || 0) + 1)}
                className="w-8 h-8 rounded-full bg-baltic-blue text-white flex items-center justify-center hover:bg-baltic-blue/90"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
        <Button onClick={handleSave} loading={saving} icon={Save} className="w-full shadow-xl shadow-baltic-blue/20">
          Save Meals
        </Button>
      </div>
    </div>
  );
};

export default Meals;
