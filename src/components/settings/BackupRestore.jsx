import { useState, useRef } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import Modal from '../ui/Modal';
import useBackup from '../../hooks/useBackup';
import { useLanguageContext } from '../../context/LanguageContext';

const DownloadIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const UploadIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ShieldIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function BackupRestore() {
  const { exporting, restoring, exportBackup, restoreBackup, validateBackupFile } = useBackup();
  const { t, isBn } = useLanguageContext();

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);
  const [error, setError] = useState('');

  // ---- Handle file selection ----
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0] || null;
    setError('');
    setSelectedFile(file);
    setFileInfo(null);

    if (!file) return;

    const validation = await validateBackupFile(file);
    if (validation.valid) {
      setFileInfo(validation);
    } else {
      setError(validation.reason);
      setSelectedFile(null);
    }

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ---- Trigger restore with overwrite ----
  const handleRestore = async (overwrite) => {
    if (!selectedFile) return;
    setError('');

    const result = await restoreBackup(selectedFile, overwrite);
    if (!result.success) {
      setError(result.message || t('settings.restoreError'));
    }
    setSelectedFile(null);
    setFileInfo(null);
  };

  return (
    <div className="space-y-3">
      {/* Export card */}
      <Card hover={false}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-baltic/10 flex items-center justify-center flex-shrink-0 text-baltic dark:text-baltic-300">
            {DownloadIcon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('settings.backup')}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {t('settings.backupDesc')}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={DownloadIcon}
            onClick={exportBackup}
            loading={exporting}
            disabled={restoring}
            className="flex-shrink-0"
          >
            {t('action.download')}
          </Button>
        </div>
      </Card>

      {/* Import card */}
      <Card hover={false}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
            {UploadIcon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('settings.restore')}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {t('settings.restoreDesc')}
            </p>

            {/* File info preview */}
            {fileInfo && (
              <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  {isBn ? '✓ বৈধ ব্যাকআপ ফাইল' : '✓ Valid backup file'}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                  {isBn
                    ? `${isBn ? 'মেস' : 'Mess'}: ${fileInfo.messCount}, ${isBn ? 'রেকর্ড' : 'Records'}: ${fileInfo.totalRecords}`
                    : `${fileInfo.messCount} mess profile(s), ${fileInfo.totalRecords} records`}
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                {error}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Button
                variant="secondary"
                size="sm"
                icon={UploadIcon}
                onClick={() => fileInputRef.current?.click()}
                loading={false}
                disabled={restoring || exporting}
              >
                {t('action.upload')}
              </Button>

              {selectedFile && fileInfo && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleRestore(false)}
                    loading={restoring}
                    disabled={exporting}
                  >
                    {t('settings.merge')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={ShieldIcon}
                    onClick={() => setOverwriteConfirmOpen(true)}
                    loading={false}
                    disabled={restoring || exporting}
                  >
                    {t('settings.overwrite')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Overwrite confirmation dialog */}
      <ConfirmDialog
        isOpen={overwriteConfirmOpen}
        onClose={() => setOverwriteConfirmOpen(false)}
        onConfirm={() => {
          setOverwriteConfirmOpen(false);
          handleRestore(true);
        }}
        title={t('settings.overwrite')}
        message={t('settings.restoreWarning')}
        confirmText={t('settings.overwrite')}
        variant="danger"
        loading={restoring}
        icon={
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        }
      />
    </div>
  );
}
