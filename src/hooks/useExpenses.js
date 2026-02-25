import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import toast from 'react-hot-toast';

export const useExpenses = (messId) => {
  
  const expenses = useLiveQuery(
    () => db.expenses.where('messId').equals(messId).reverse().sortBy('date'),
    [messId]
  );

  const addExpense = async (expenseData) => {
    try {
      await db.expenses.add({
        ...expenseData,
        messId,
        date: new Date(expenseData.date) // Ensure Date object
      });
      toast.success('Expense recorded');
      return true;
    } catch (error) {
      toast.error('Failed to add expense');
      return false;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await db.expenses.delete(id);
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  return {
    expenses: expenses || [],
    addExpense,
    deleteExpense,
    isLoading: expenses === undefined
  };
};
