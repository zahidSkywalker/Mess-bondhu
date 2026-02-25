import React, { useState } from 'react';
import { Download, Upload, FileText, Moon, Sun, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../db/db';
import { generateReport } from '../utils/pdfGenerator';
import { format } from 'date-fns';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Settings = () => {
  const { activeMess, logout } = useAuth();
  const { t, toggleLang, lang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [currentDate] = useState(new Date());

  // Backup: Export entire DB as JSON
  const handleBackup = async () => {
    try {
      const allData = {
        messProfiles: await db.messProfiles.toArray(),
        members: await db.members.toArray(),
        meals: await db.meals.toArray(),
        expenses: await db.expenses.toArray(),
        payments: await db.payments.toArray(),
        notices: await db.notices.toArray(),
        settings: await db.settings.toArray(),
      };
      
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mess_bondhu_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Backup downloaded');
    } catch (e) {
      toast.error('Backup failed');
    }
  };

  // Restore: Import JSON and overwrite DB
  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if(!window.confirm("Warning: This will DELETE all current data and restore from this file. Continue?")) return;

        await db.transaction('rw', db.tables, async () => {
          await Promise.all(db.tables.map(table => table.clear()));
          await db.messProfiles.bulkPut(data.messProfiles || []);
          await db.members.bulkPut(data.members || []);
          await db.meals.bulkPut(data.meals || []);
          await db.expenses.bulkPut(data.expenses || []);
          await db.payments.bulkPut(data.payments || []);
        });
        
        toast.success('Data restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error(err);
        toast.error('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-20 p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-baltic-blue dark:text-emerald mb-6">{t('settings')}</h1>

      {/* Preferences */}
      <section className="mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Preferences</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <span className="font-medium">{t('dark_mode')}</span>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-baltic-blue' : 'bg-slate-300'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                <Globe size={18} />
              </div>
              <span className="font-medium">{t('language')}</span>
            </div>
            <button 
              onClick={() => toggleLang()}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold text-baltic-blue dark:text-emerald"
            >
              {lang === 'en' ? 'EN' : 'বাং'}
            </button>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Data & Reports</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft p-4 space-y-3">
          <Button variant="secondary" onClick={handleBackup} icon={Download} className="w-full justify-between">
            {t('backup_data')}
            <span className="text-xs font-normal text-slate-400">Export JSON</span>
          </Button>
          
          <div className="relative">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleRestore} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <Button variant="secondary" icon={Upload} className="w-full justify-between pointer-events-none">
              {t('restore_data')}
              <span className="text-xs font-normal text-slate-400">Import JSON</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Account */}
      <section>
        <Button variant="danger" onClick={logout} icon={LogOut} className="w-full">
          {t('logout')}
        </Button>
      </section>
    </div>
  );
};

export default Settings;
