import React, { useState } from 'react';
import { Plus, LogIn, Building2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { db } from '../db/db';
import toast from 'react-hot-toast';

const Auth = () => {
  const { messes, switchMess, createMess, loading } = useAuth();
  const { t } = useLang();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessName, setNewMessName] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newMessName.trim()) return;
    const success = await createMess(newMessName);
    if (success) {
      setIsModalOpen(false);
      setNewMessName('');
    }
  };

  const handleDeleteMess = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure? This will delete ALL data for this mess permanently.")) {
      try {
        // Cascade delete logic would go here, for now manual
        await db.transaction('rw', db.messProfiles, db.members, db.meals, db.expenses, db.payments, async () => {
           await db.members.where('messId').equals(id).delete();
           await db.meals.where('messId').equals(id).delete();
           await db.expenses.where('messId').equals(id).delete();
           await db.payments.where('messId').equals(id).delete();
           await db.messProfiles.delete(id);
        });
        toast.success('Mess deleted');
      } catch (err) {
        toast.error('Could not delete mess');
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-baltic-blue">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-baltic-blue to-tropical-teal flex flex-col items-center justify-center p-6 text-white">
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
          <Building2 size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('app_name')}</h1>
        <p className="text-white/80">{t('welcome')}</p>
      </div>

      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
        <h2 className="text-lg font-semibold mb-4 opacity-90">{t('select_mess')}</h2>
        
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {messes.length === 0 ? (
            <p className="text-center text-sm opacity-70 py-4">No mess profiles found.</p>
          ) : (
            messes.map(mess => (
              <div 
                key={mess.id} 
                onClick={() => switchMess(mess.id)}
                className="group flex justify-between items-center bg-white text-slate-800 p-4 rounded-xl hover:bg-tea-green transition-all cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="text-baltic-blue" size={18} />
                  <span className="font-medium">{mess.name}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteMess(mess.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)} 
          className="w-full mt-6 bg-white text-baltic-blue hover:bg-tea-green hover:text-baltic-blue"
          icon={Plus}
        >
          {t('create_mess')}
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('create_mess')}>
        <form onSubmit={handleCreate}>
          <Input 
            label={t('mess_name')} 
            value={newMessName} 
            onChange={(e) => setNewMessName(e.target.value)} 
            placeholder={t('mess_name_placeholder')}
          />
          <Button type="submit" className="w-full">{t('create')}</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Auth;
