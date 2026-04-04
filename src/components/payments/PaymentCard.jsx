import { useState } from 'react';
import Card from '../ui/Card';
import ConfirmDialog from '../ui/ConfirmDialog';
import Modal from '../ui/Modal';
import PaymentForm from './PaymentForm';
import { usePayments } from '../../hooks/usePayments';
import { useLanguageContext } from '../../context/LanguageContext';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

const EditIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function PaymentCard({ payment, memberName = '' }) {
  const { updatePayment, deletePayment } = usePayments(payment.messId);
  const { t, isBn } = useLanguageContext();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEditSubmit = async (formData) => {
    setEditing(true);
    const result = await updatePayment(payment.id, formData);
    setEditing(false);
    if (result.success) setEditOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const result = await deletePayment(payment.id);
    setDeleting(false);
    if (result.success) setDeleteOpen(false);
  };

  return (
    <>
      <Card hover={true}>
        <div className="flex items-start gap-3">
          {/* Green check icon */}
          <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-600 dark:text-emerald-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {memberName || isBn ? 'সদস্য' : 'Member'}
              </h3>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
              <span>{formatDateShort(payment.date, isBn ? 'bn' : 'en')}</span>
              {payment.remark && (
                <span className="truncate max-w-[180px]" title={payment.remark}>
                  {payment.remark}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(payment.amount)}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setEditOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-baltic hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={t('action.edit')}
              >
                {EditIcon}
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title={t('action.delete')}
              >
                {DeleteIcon}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={t('payments.editPayment')} size="sm" footer={null}>
        <PaymentForm
          messId={payment.messId}
          activeMembers={[]}
          initialData={payment}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditOpen(false)}
          loading={editing}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('payments.deletePayment')}
        message={t('payments.confirmDelete')}
        confirmText={t('action.delete')}
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
