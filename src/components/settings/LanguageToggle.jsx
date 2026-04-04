import { useLanguageContext } from '../../context/LanguageContext';
import Card from '../ui/Card';

const GlobeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguageContext();

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 dark:text-slate-500">{GlobeIcon}</span>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('settings.language')}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {t('settings.languageDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
          <button
            onClick={() => setLanguage('bn')}
            className={`
              px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${language === 'bn' ? 'bg-white dark:bg-slate-600 text-baltic dark:text-teal shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
            `}
          >
            বাংলা
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`
              px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${language === 'en' ? 'bg-white dark:bg-slate-600 text-baltic dark:text-teal shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
            `}
          >
            English
          </button>
        </div>
      </div>
    </Card>
  );
}
