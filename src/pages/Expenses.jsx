import React, { useState } from 'react';
import { Plus, Trash2, ShoppingBag, Zap, Home, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../hooks/useExpenses';
import { useLang } from '../context/LangContext';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Expenses = () => {
  const { activeMess } = useAuth();
  const { t } = useLang();
  const { expenses, addExpense, deleteExpense } = useExpenses(activeMess?.id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    category: 'bazar', 
    amount: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0] 
  });

  const categoryIcons = {
    bazar: { icon: ShoppingBag, color: 'text-emerald', bg: 'bg-emerald/10' },
    utilities: { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    rent: { icon: Home, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    others: { icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-200 dark:bg-slate-700' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.amount || !formData.category) return;
    await addExpense(formData);
    setIsModalOpen(false);
    setFormData({ category: 'bazar', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-baltic-blue dark:text-emerald">{t('expenses')}</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={Plus} className="!py-2 !px-4">
          {t('add_expense')}
        </Button>
      </div>

      <div className="space-y-3">
        {expenses.map((ex) => {
          const CatIcon = categoryIcons[ex.category]?.icon || MoreHorizontal;
          const styles = categoryIcons[ex.category] || categoryIcons.others;
          
          return (
            <div key={ex.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${styles.bg} ${styles.color}`}>
                  <CatIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 capitalize">{ex.category}</h3>
                  <p className="text-xs text-slate-500">
                    {ex.description || 'No description'} • {new Date(ex.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg text-slate-800 dark:text-white">৳{ex.amount}</span>
                <button onClick={() => deleteExpense(ex.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('add_expense')}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5 ml-1">{t('category')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['bazar', 'utilities', 'others'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    formData.category === cat 
                    ? 'bg-baltic-blue text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <Input 
            label={t('amount')} 
            type="number" 
            value={formData.amount} 
            onChange={(e) => setFormData({...formData, amount: e.target.value})} 
          />
          <Input 
            label={t('description')} 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
          />
          <Input 
            label={t('date')} 
            type="date" 
            value={formData.date} 
            onChange={(e) => setFormData({...formData, date: e.target.value})} 
          />
          <Button type="submit" className="w-full mt-2">{t('save')}</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
