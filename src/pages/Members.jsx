import { useState, useEffect, useCallback } from 'react';
import { useMess } from '../hooks/useMess';
import useMembers from '../hooks/useMembers';
import MemberList from '../components/members/MemberList';
import MemberForm from '../components/members/MemberForm';
import Modal from '../components/ui/Modal';
import { useLanguageContext } from '../context/LanguageContext';

export default function Members() {
  const { activeMessId } = useMess();
  const { t } = useLanguageContext();
  const {
    members,
    loading,
    fetchMembers,
    addMember,
  } = useMembers(activeMessId);

  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  // ---- Fetch members on mount or mess change ----
  useEffect(() => {
    if (activeMessId) {
      fetchMembers();
    }
  }, [activeMessId, fetchMembers]);

  // ---- Handle add member ----
  const handleAddSubmit = useCallback(async (data) => {
    setAdding(true);
    const result = await addMember(data);
    setAdding(false);
    if (result.success) {
      setAddOpen(false);
    }
  }, [addMember]);

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">{t('members.title')}</h1>
        <p className="page-subtitle">{t('members.subtitle')}</p>
      </div>

      {/* Member list with search, filter, and add button */}
      <MemberList
        members={members}
        loading={loading}
        onAdd={() => setAddOpen(true)}
      />

      {/* Add member modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title={t('members.addMember')}
        size="sm"
        footer={null}
      >
        <MemberForm
          onSubmit={handleAddSubmit}
          onCancel={() => setAddOpen(false)}
          loading={adding}
        />
      </Modal>
    </div>
  );
}
