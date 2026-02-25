import React, { useState } from 'react';
import { Plus, Trash2, Edit2, UserPlus, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMembers } from '../hooks/useMembers';
import { usePayments } from '../hooks/usePayments'; // Import the new hook
import { useLang } from '../context/LangContext';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Members = () => {
  const { activeMess } = useAuth();
  const { t } = useLang();
  const { members, addMember, deleteMember, updateMember, isLoading } = useMembers(activeMess?.id);
  const { addPayment } = usePayments(activeMess?.id); // Initialize payment hook
  
  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', rentAmount: '', joinedDate: new Date().toISOString().split('T')[0] });

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ memberId: null, amount: '', date: new Date().toISOString().split('T')[0] });

  // --- Member Handlers ---
  const openAddMemberModal = () => {
    setEditingId(null);
    setFormData({ name: '', rentAmount: '', joinedDate: new Date().toISOString().split('T')[0] });
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member) => {
    setEditingId(member.id);
    setFormData({ name: member.name, rentAmount: member.rentAmount, joinedDate: member.joinedDate.split('T')[0] });
    setIsMemberModalOpen(true);
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    if(!formData.name || !formData.rentAmount) return;
    if (editingId) await updateMember(editingId, formData);
    else await addMember(formData);
    setIsMemberModalOpen(false);
  };

  // --- Payment Handlers ---
  const openPaymentModal = (member) => {
    setPaymentData({ memberId: member.id, memberName: member.name, amount: '', date: new Date().toISOString().split('T')[0] });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentData.amount) return;
    
    await addPayment({
      memberId: paymentData.memberId,
      amount: parseFloat(paymentData.amount),
      date: paymentData.date
    });
    setIsPaymentModalOpen(false);
  };

  const handleDeleteMember = async (id) => {
    if(window.confirm(t('confirm_delete'))) await deleteMember(id);
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-baltic-blue dark:text-emerald">{t('members')}</h1>
        <Button variant="primary" onClick={openAddMemberModal} icon={Plus} className="!py-2 !px-4">
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
            <div key={member.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{member.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${member.status === 'active' ? 'bg-emerald/10 text-emerald' : 'bg-red-500/10 text-red-500'}`}>
                    {member.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Rent</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">৳{member.rentAmount}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => openEditMemberModal(member)} className="flex-1 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => openPaymentModal(member)} className="flex-1 py-1.5 text-sm font-medium text-white bg-emerald rounded-lg hover:bg-emerald/90 shadow-lg shadow-emerald/20 flex items-center justify-center gap-1">
                  <Wallet size={14} /> Pay
                </button>
                <button onClick={() => handleDeleteMember(member.id)} className="w-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Modal */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title={editingId ? t('edit') : t('add_member')}>
        <form onSubmit={handleMemberSubmit}>
          <Input label={t('member_name')} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enter name" />
          <Input label={t('rent_amount')} type="number" value={formData.rentAmount} onChange={(e) => setFormData({...formData, rentAmount: e.target.value})} placeholder="0" />
          <Input label={t('joining_date')} type="date" value={formData.joinedDate} onChange={(e) => setFormData({...formData, joinedDate: e.target.value})} />
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsMemberModalOpen(false)} className="flex-1">{t('cancel')}</Button>
            <Button type="submit" className="flex-1">{t('save')}</Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal (NEW) */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
        <form onSubmit={handlePaymentSubmit}>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl mb-4 text-center">
            <p className="text-sm text-slate-500">Paying for</p>
            <p className="font-bold text-lg text-baltic-blue dark:text-emerald">{paymentData.memberName}</p>
          </div>
          <Input label="Amount (৳)" type="number" value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} placeholder="0.00" />
          <Input label={t('date')} type="date" value={paymentData.date} onChange={(e) => setPaymentData({...paymentData, date: e.target.value})} />
          <Button type="submit" className="w-full mt-2">Confirm Payment</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
