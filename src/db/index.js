import Dexie from 'dexie';

const db = new Dexie('MessBondhuPro');

db.version(1).stores({
  messProfiles: '++id, name, createdAt, updatedAt',
  members: '++id, messId, name, status, joiningDate, createdAt',
  meals: '++id, messId, memberId, date, mealCount, createdAt',
  expenses: '++id, messId, category, date, createdAt',
  payments: '++id, messId, memberId, date, createdAt',
  notices: '++id, messId, isPinned, createdAt',
  monthlySummaries: '++id, &messId_month, messId, month',
  settings: '++id, &key',
});

export default db;

/**
 * Clear all data for a specific mess — used before mess deletion.
 * Runs inside a transaction for atomicity.
 */
export async function clearMessData(messId) {
  await db.transaction(
    'rw',
    [db.members, db.meals, db.expenses, db.payments, db.notices, db.monthlySummaries],
    async () => {
      await db.members.where('messId').equals(messId).delete();
      await db.meals.where('messId').equals(messId).delete();
      await db.expenses.where('messId').equals(messId).delete();
      await db.payments.where('messId').equals(messId).delete();
      await db.notices.where('messId').equals(messId).delete();
      await db.monthlySummaries.where('messId').equals(messId).delete();
    }
  );
}

/**
 * Export entire database as a plain JSON object for backup.
 */
export async function exportDatabase() {
  const data = {
    _meta: {
      appName: 'MessBondhuPro',
      version: 1,
      exportedAt: new Date().toISOString(),
    },
    messProfiles: await db.messProfiles.toArray(),
    members: await db.members.toArray(),
    meals: await db.meals.toArray(),
    expenses: await db.expenses.toArray(),
    payments: await db.payments.toArray(),
    notices: await db.notices.toArray(),
    monthlySummaries: await db.monthlySummaries.toArray(),
    settings: await db.settings.toArray(),
  };
  return data;
}

/**
 * Import database from a backup JSON object.
 * If overwrite is true, clears all tables first.
 * Returns { success, message, count }.
 */
export async function importDatabase(data, overwrite = false) {
  if (!data || !data._meta || data._meta.appName !== 'MessBondhuPro') {
    return { success: false, message: 'Invalid backup file.', count: 0 };
  }

  try {
    if (overwrite) {
      await db.transaction(
        'rw',
        [
          db.messProfiles, db.members, db.meals,
          db.expenses, db.payments, db.notices,
          db.monthlySummaries, db.settings,
        ],
        async () => {
          await db.messProfiles.clear();
          await db.members.clear();
          await db.meals.clear();
          await db.expenses.clear();
          await db.payments.clear();
          await db.notices.clear();
          await db.monthlySummaries.clear();
          await db.settings.clear();

          if (data.messProfiles?.length) await db.messProfiles.bulkAdd(data.messProfiles);
          if (data.members?.length) await db.members.bulkAdd(data.members);
          if (data.meals?.length) await db.meals.bulkAdd(data.meals);
          if (data.expenses?.length) await db.expenses.bulkAdd(data.expenses);
          if (data.payments?.length) await db.payments.bulkAdd(data.payments);
          if (data.notices?.length) await db.notices.bulkAdd(data.notices);
          if (data.monthlySummaries?.length) await db.monthlySummaries.bulkAdd(data.monthlySummaries);
          if (data.settings?.length) await db.settings.bulkAdd(data.settings);
        }
      );
    } else {
      // Merge mode — skip settings to preserve current prefs
      await db.transaction(
        'rw',
        [
          db.messProfiles, db.members, db.meals,
          db.expenses, db.payments, db.notices,
          db.monthlySummaries,
        ],
        async () => {
          if (data.messProfiles?.length) await db.messProfiles.bulkAdd(data.messProfiles);
          if (data.members?.length) await db.members.bulkAdd(data.members);
          if (data.meals?.length) await db.meals.bulkAdd(data.meals);
          if (data.expenses?.length) await db.expenses.bulkAdd(data.expenses);
          if (data.payments?.length) await db.payments.bulkAdd(data.payments);
          if (data.notices?.length) await db.notices.bulkAdd(data.notices);
          if (data.monthlySummaries?.length) await db.monthlySummaries.bulkAdd(data.monthlySummaries);
        }
      );
    }

    const count =
      (data.messProfiles?.length || 0) +
      (data.members?.length || 0) +
      (data.meals?.length || 0) +
      (data.expenses?.length || 0) +
      (data.payments?.length || 0) +
      (data.notices?.length || 0);

    return { success: true, message: 'Backup restored successfully.', count };
  } catch (err) {
    return { success: false, message: `Restore failed: ${err.message}`, count: 0 };
  }
}
