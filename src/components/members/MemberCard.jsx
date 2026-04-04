import { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import Modal from '../ui/Modal';
import MemberForm from './MemberForm';
import { useMembers } from '../../hooks/useMembers';
import { useLanguageContext } from '../../context/LanguageContext';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

const EditIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const RemoveIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="18" y1="8" x2="23" y2="13" />
    <line x1="23" y1="8" x2="18" y2="13" />
  </svg>
);

const PhoneIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function MemberCard({
  member,
  mealCount = null,
  paidAmount = null,
  dueAmount = null,
}) {
  const { updateMember, removeMember } = useMembers(member.messId);
  const { t, isBn } = useLanguageContext();

  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);

  // ---- Status badge variant ----
  const getStatusBadge = () => {
    switch (member.status) {
      case 'active':
        return <Badge variant="success" dot={true}>{t('status.active')}</Badge>;
      case 'inactive':
        return <Badge variant="warning" dot={true}>{t('status.inactive')}</Badge>;
      case 'left':
        return <Badge variant="danger" dot={true}>{t('status.left')}</Badge>;
      default:
        return <Badge variant="neutral">{member.status}</Badge>;
    }
  };

  // ---- Handle edit submit ----
  const handleEditSubmit = async (formData) => {
    setEditing(true);
    const result = await updateMember(member.id, formData);
    setEditing(false);
    if (result.success) {
      setEditOpen(false);
    }
  };

  // ---- Handle remove confirm ----
  const handleRemoveConfirm = async () => {
    setRemoving(true);
    const result = await removeMember(member.id);
    setRemoving(false);
    if (result.success) {
      setRemoveOpen(false);
    }
  };

  // ---- Avatar color based on name hash ----
  const getAvatarColor = (name) => {
    const colors = [
      'bg-baltic', 'bg-teal', 'bg-emerald',
      'bg-amber-500', 'bg-purple-500', 'bg-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials (first character of name)
  const initials = (member.name || '?').charAt(0).toUpperCase();

  const isInactive = member.status !== 'active';

  return (
    <>
      <Card
        className={isInactive ? 'opacity-60' : ''}
        hover={true}
        padding={true}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={`
              flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold
              ${getAvatarColor(member.name)}
            `}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name + Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {member.name}
              </h3>
              {getStatusBadge()}
            </div>

            {/* Phone + Joining Date */}
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-1 hover:text-baltic dark:hover:text-teal transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {PhoneIcon}
                  {member.phone}
                </a>
              )}
              <span>{formatDateShort(member.joiningDate, isBn ? 'bn' : 'en')}</span>
            </div>

            {/* Financial summary row (only if data provided) */}
            {(mealCount !== null || paidAmount !== null || dueAmount !== null) && (
              <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
                {mealCount !== null && (
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      {t('meals.title')}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {isBn ? mealCount : mealCount}
                    </p>
                  </div>
                )}
                {paidAmount !== null && (
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      {t('payments.memberPaid')}
                    </p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(paidAmount)}
                    </p>
                  </div>
                )}
                {dueAmount !== null && (
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      {t('members.dueInfo')}
                    </p>
                    <p className={`text-sm font-semibold ${dueAmount > 0 ? 'text-red-500 dark:text-red-400' : dueAmount < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {formatCurrency(Math.abs(dueAmount))}
                      {dueAmount > 0 && <span className="text-[10px] ml-0.5">{isBn ? 'বাকি' : 'due'}</span>}
                      {dueAmount < 0 && <span className="text-[10px] ml-0.5">{isBn ? 'অগ্রিম' : 'advance'}</span>}
                    </p>
                  </div>
                )}
                {member.rentAmount > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      {t('members.rentPerMonth')}
                    </p>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {formatCurrency(member.rentAmount)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isInactive && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-baltic hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={t('action.edit')}
              >
                {EditIcon}
              </button>
              <button
                onClick={() => setRemoveOpen(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title={t('members.removeMember')}
              >
                {RemoveIcon}
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={t('members.editMember')}
        size="sm"
        footer={null}
      >
        <MemberForm
          initialData={member}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditOpen(false)}
          loading={editing}
          showStatusField={true}
        />
      </Modal>

      {/* Remove Confirmation — soft delete (sets status to 'left') */}
      <ConfirmDialog
        isOpen={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={handleRemoveConfirm}
        title={t('members.removeMember')}
        message={t('members.confirmDelete')}
        confirmText={t('members.removeMember')}
        variant="danger"
        loading={removing}
        icon={
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-600 dark:text-amber-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="18" y1="8" x2="23" y2="13" />
              <line x1="23" y1="8" x2="18" y2="13" />
            </svg>
          </div>
        }
      />
    </>
  );
}
