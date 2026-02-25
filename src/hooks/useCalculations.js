import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export const useCalculations = (messId, monthDate) => {
  // monthDate is a Date object representing the month to calculate (e.g., 2023-10-15)

  const expenses = useLiveQuery(
    () => db.expenses.where('messId').equals(messId).toArray(),
    [messId]
  );

  const meals = useLiveQuery(
    () => db.meals.where('messId').equals(messId).toArray(),
    [messId]
  );
  
  const members = useLiveQuery(
    () => db.members.where('messId').equals(messId).toArray(),
    [messId]
  );

  const payments = useLiveQuery(
    () => db.payments.where('messId').equals(messId).toArray(),
    [messId]
  );

  if (!expenses || !meals || !members || !payments) {
    return { loading: true, data: null };
  }

  // 1. Filter Data for the Selected Month
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  const monthlyExpenses = expenses.filter(ex => 
    isWithinInterval(new Date(ex.date), { start, end })
  );
  
  const monthlyMeals = meals.filter(ml => 
    isWithinInterval(new Date(ml.date), { start, end })
  );

  const monthlyPayments = payments.filter(pm => 
    isWithinInterval(new Date(pm.date), { start, end })
  );

  // 2. Aggregate Totals
  // Logic: "Bazar" category usually covers meal cost. Others are shared utility.
  const totalBazarCost = monthlyExpenses
    .filter(ex => ex.category.toLowerCase() === 'bazar')
    .reduce((sum, ex) => sum + parseFloat(ex.amount), 0);

  const totalUtilityCost = monthlyExpenses
    .filter(ex => ex.category.toLowerCase() !== 'bazar')
    .reduce((sum, ex) => sum + parseFloat(ex.amount), 0);

  const totalMealsCount = monthlyMeals.reduce((sum, ml) => sum + parseFloat(ml.count), 0);
  
  // 3. Calculate Meal Rate
  const mealRate = totalMealsCount > 0 ? (totalBazarCost / totalMealsCount) : 0;

  // 4. Calculate Per Member Breakdown
  const activeMembers = members.filter(m => m.status === 'active');
  const memberCount = activeMembers.length;
  
  // Shared Utility per person
  const utilityPerPerson = memberCount > 0 ? (totalUtilityCost / memberCount) : 0;

  const memberStats = activeMembers.map(member => {
    // Member's total meals in this month
    const memberMeals = monthlyMeals
      .filter(m => m.memberId === member.id)
      .reduce((sum, m) => sum + parseFloat(m.count), 0);

    // Costs
    const mealCost = memberMeals * mealRate;
    const rentCost = parseFloat(member.rentAmount) || 0;
    const utilityCost = utilityPerPerson;
    
    // Total Expense for this member
    const totalExpense = mealCost + rentCost + utilityCost;

    // Payments made by this member
    const paid = monthlyPayments
      .filter(p => p.memberId === member.id)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const due = totalExpense - paid;

    return {
      ...member,
      meals: memberMeals,
      mealCost: mealCost.toFixed(2),
      rentCost: rentCost.toFixed(2),
      utilityCost: utilityCost.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      paid: paid.toFixed(2),
      due: due.toFixed(2)
    };
  });

  return {
    loading: false,
    summary: {
      totalExpense: (totalBazarCost + totalUtilityCost).toFixed(2),
      totalBazar: totalBazarCost.toFixed(2),
      totalUtility: totalUtilityCost.toFixed(2),
      totalMeals: totalMealsCount,
      mealRate: mealRate.toFixed(2),
      totalCollected: monthlyPayments.reduce((s,p) => s + parseFloat(p.amount), 0).toFixed(2),
      totalDue: memberStats.reduce((s, m) => s + parseFloat(m.due), 0).toFixed(2)
    },
    memberStats
  };
};
