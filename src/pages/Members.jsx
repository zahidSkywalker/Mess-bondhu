import React, { useState } from 'react';
import { Plus, Trash2, Edit2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMembers } from '../hooks/useMembers';
import { useLang } from '../context/LangContext';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Members = () => {
  const { activeMess } = useAuth();
  const { t } = useLang();
  const { members, addMember, deleteMember, updateMember, isLoading } = useMembers(activeMess?.id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', rentAmount: '', joinedDate: new Date().toISOString().split('T')[0] });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', rentAmount: '', joinedDate: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingId(member.id);
    setFormData({ name: member.name, rentAmount: member.rentAmount, joinedDate: member.joinedDate.split('T')[0] });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.name || !formData.rentAmount) return;

    if (editingId) {
      await updateMember(editingId, formData);
    } else {
      await addMember(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm(t('confirm_delete'))) {
      await deleteMember(id);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-baltic-blue dark:text-emerald">{t('members')}</h1>
        <Button variant="primary" onClick={openAddModal} icon={Plus} className="!py-2 !px-4">
          {t('add_member')}
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <UserPlus size={48} className="mb-3 opacity-50" />
          <p>No members yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(member => (
            <div key={member.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{member.name}</h3>
                <div className="flex gap-3 text-sm text-slate-500 mt-1">
                  <span>Rent: ৳{member.rentAmount}</span>
                  <span>•</span>
                  <span className={member.status === 'active' ? 'text-emerald' : 'text-red-500'}>
                    {member.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(member)} className="p-2 text-slate-400 hover:text-baltic-blue bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(member.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? t('edit') : t('add_member')}>
        <form onSubmit={handleSubmit}>
          <Input 
            label={t('member_name')} 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            placeholder="Enter full name"
          />
          <Input 
            label={t('rent_amount')} 
            type="number" 
            value={formData.rentAmount} 
            onChange={(e) => setFormData({...formData, rentAmount: e.target.value})} 
            placeholder="0"
          />
          <Input 
            label={t('joining_date')} 
            type="date" 
            value={formData.joinedDate} 
            onChange={(e) => setFormData({...formData, joinedDate: e.target.value})} 
          />
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">{t('cancel')}</Button>
            <Button type="submit" className="flex-1">{t('save')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
