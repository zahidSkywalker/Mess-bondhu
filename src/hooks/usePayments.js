import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import toast from 'react-hot-toast';

export const usePayments = (messId) => {
  
  const payments = useLiveQuery(
    () => db.payments.where('messId').equals(messId).reverse().sortBy('date'),
    [messId]
  );

  const addPayment = async (paymentData) => {
    try {
      await db.payments.add({
        ...paymentData,
        messId,
        date: new Date(paymentData.date)
      });
      toast.success('Payment recorded');
      return true;
    } catch (error) {
      toast.error('Failed to record payment');
      return false;
    }
  };

  return {
    payments: payments || [],
    addPayment
  };
};
