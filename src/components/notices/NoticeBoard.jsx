import { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import NoticeForm from './NoticeForm';
import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useNotices } from '../../hooks/useNotices';
import { useLanguageContext } from '../../context/LanguageContext';
import { timeAgo, truncate } from '../../utils/formatters';

const PlusIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PinIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 2l-4 4-4-4-3 3 4 4-6 6v3h3l6-6 4 4 3-3-4-4 4-4z" />
  </svg>
);

const UnpinIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="2" x2="22" y2="22" />
    <path d="M16 2l-4 4-4-4-3 3 4 4-6 6v3h3l6-6 4 4 3-3-4-4 4-4z" />
  </svg>
);

const BellIcon = (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function NoticeBoard({ messId }) {
  const { notices, loading, addNotice, updateNotice, deleteNotice, togglePin } = useNotices(messId);
  const { t, isBn } = useLanguageContext();

  const [addOpen, setAddOpen] = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ---- Handle add ----
  const handleAddSubmit = async (data) => {
    setSubmitting(true);
    const result = await addNotice({ ...data, messId });
    setSubmitting(false);
    if (result.success) setAddOpen(false);
  };

  // ---- Handle edit ----
  const handleEditSubmit = async (data) => {
    if (!editNotice) return;
    setSubmitting(true);
    const result = await updateNotice(editNotice.id, data);
    setSubmitting(false);
    if (result.success) setEditNotice(null);
  };

  // ---- Handle delete ----
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    const result = await deleteNotice(deleteTarget.id);
    setSubmitting(false);
    if (result.success) setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* ---- Add button ---- */}
      <div className="flex justify-end">
        <Button variant="primary" icon={PlusIcon} onClick={() => setAddOpen(true)} size="sm">
          {t('notices.addNotice')}
        </Button>
      </div>

      {/* ---- Loading ---- */}
      {loading && <div className="py-8"><LoadingSpinner /></div>}

      {/* ---- Empty state ---- */}
      {!loading && notices.length === 0 && (
        <EmptyState
          icon={BellIcon}
          title={t('notices.noNotices')}
          description={t('notices.noNoticesDesc')}
        />
      )}

      {/* ---- Notice cards ---- */}
      {!loading && notices.length > 0 && (
        <div className="space-y-3">
          {notices.map((notice) => (
            <Card
              key={notice.id}
              className={notice.isPinned ? 'ring-1 ring-baltic/20 dark:ring-teal/20 bg-baltic/[0.02] dark:bg-teal/[0.03]' : ''}
              hover={true}
            >
              <div className="flex items-start gap-3">
                {/* Pin indicator */}
                <div className={`flex-shrink-0 mt-1 ${notice.isPinned ? 'text-baltic dark:text-teal' : 'text-transparent'}`}>
                  {PinIcon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                      {notice.title}
                    </h3>
                    {notice.isPinned && (
                      <Badge variant="info">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5">{PinIcon}</span>
                          {t('notices.pinned')}
                        </span>
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 whitespace-pre-wrap leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 dark:text-slate-500">
                    <span>{timeAgo(notice.createdAt, isBn ? 'bn' : 'en')}</span>
                    {notice.updatedAt !== notice.createdAt && (
                      <span>({isBn ? 'সম্পাদিত' : 'edited'})</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => togglePin(notice.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-baltic dark:hover:text-teal hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title={notice.isPinned ? t('notices.unpinNotice') : t('notices.pinNotice')}
                  >
                    {notice.isPinned ? UnpinIcon : PinIcon}
                  </button>
                  <button
                    onClick={() => setEditNotice(notice)}
                    className="p-2 rounded-lg text-slate-400 hover:text-baltic hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title={t('action.edit')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(notice)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title={t('action.delete')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---- Add Modal ---- */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title={t('notices.addNotice')} size="md" footer={null}>
        <NoticeForm onSubmit={handleAddSubmit} onCancel={() => setAddOpen(false)} loading={submitting} />
      </Modal>

      {/* ---- Edit Modal ---- */}
      <Modal isOpen={Boolean(editNotice)} onClose={() => setEditNotice(null)} title={t('notices.editNotice')} size="md" footer={null}>
        {editNotice && (
          <NoticeForm initialData={editNotice} onSubmit={handleEditSubmit} onCancel={() => setEditNotice(null)} loading={submitting} />
        )}
      </Modal>

      {/* ---- Delete Confirmation ---- */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={t('notices.deleteNotice')}
        message={t('notices.confirmDelete')}
        confirmText={t('action.delete')}
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
