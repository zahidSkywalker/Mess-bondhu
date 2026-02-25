import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import toast from 'react-hot-toast';

export const useMembers = (messId) => {
  
  const members = useLiveQuery(
    () => db.members.where('messId').equals(messId).toArray(),
    [messId]
  );

  const addMember = async (memberData) => {
    try {
      await db.members.add({
        ...memberData,
        messId,
        status: 'active',
        createdAt: new Date()
      });
      toast.success('Member added successfully');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to add member');
      return false;
    }
  };

  const updateMember = async (id, data) => {
    try {
      await db.members.update(id, data);
      toast.success('Member updated');
    } catch (error) {
      toast.error('Failed to update member');
    }
  };

  const deleteMember = async (id) => {
    try {
      await db.members.delete(id);
      toast.success('Member deleted');
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  return {
    members: members || [],
    addMember,
    updateMember,
    deleteMember,
    isLoading: members === undefined
  };
};
