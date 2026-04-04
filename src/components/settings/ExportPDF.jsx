import { useState, useCallback } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { useLanguageContext } from '../../context/LanguageContext';
import { generatePDF } from '../../utils/pdfExport';
import { useToastContext } from '../../context/ToastContext';

const FilePdfIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default function ExportPDF({ messId, activeMess }) {
  const { t, isBn } = useLanguageContext();
  const { success, error: showError } = useToastContext();
  const [generating, setGenerating] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // Build month options
  const monthOptions = [];
  for (let m = 1; m <= 12; m++) {
    const months = isBn
      ? ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthOptions.push({ value: m, label: months[m - 1] });
  }

  // Build year options (current year ± 2)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    yearOptions.push({ value: y, label: isBn ? String(y) : String(y) });
  }

  const handleGenerate = useCallback(async () => {
    if (!messId) {
      showError(t('toast.error'));
      return;
    }

    setGenerating(true);
    try {
      await generatePDF(messId, year, month, activeMess, isBn ? 'bn' : 'en');
      success(isBn ? 'PDF তৈরি হয়েছে!' : 'PDF generated!');
    } catch (err) {
      console.error('PDF generation failed:', err);
      showError(t('toast.error'));
    } finally {
      setGenerating(false);
    }
  }, [messId, year, month, activeMess, isBn, success, showError, t]);

  return (
    <Card hover={false}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 text-red-500 dark:text-red-400">
          {FilePdfIcon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t('reports.exportPDF')}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {t('reports.selectMonth')}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1">
              <Select
                options={yearOptions}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                containerClassName="mb-0"
              />
            </div>
            <div className="flex-1">
              <Select
                options={monthOptions}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                containerClassName="mb-0"
              />
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={FilePdfIcon}
              onClick={handleGenerate}
              loading={generating}
              className="flex-shrink-0"
            >
              PDF
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
