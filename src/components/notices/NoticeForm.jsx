import { useState, useEffect, useCallback } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validateNotice } from '../../utils/validators';
import { useLanguageContext } from '../../context/LanguageContext';
import { useToastContext } from '../../context/ToastContext';

const initialState = {
  title: '',
  content: '',
  isPinned: false,
};

export default function NoticeForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const { t, isBn } = useLanguageContext();
  const { error: showError } = useToastContext();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        content: initialData.content || '',
        isPinned: Boolean(initialData.isPinned),
      });
    } else {
      setForm(initialState);
    }
    setErrors({});
  }, [initialData]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const validation = validateNotice(form);
      if (!validation.valid) {
        const message = isBn ? validation.messageBn : validation.messageEn;

        const fieldMap = {
          title: [isBn ? 'শিরোনাম' : 'Title', 'title', 'Title'],
          content: [isBn ? 'বিষয়বস্তু' : 'Content', 'content', 'Content'],
        };

        let matched = false;
        for (const [field, keywords] of Object.entries(fieldMap)) {
          if (keywords.some((kw) => message.includes(kw))) {
            setErrors({ [field]: message });
            matched = true;
            break;
          }
        }
        if (!matched) showError(message);
        return;
      }

      onSubmit(form);
    },
    [form, isBn, showError, onSubmit]
  );

  const isEditing = Boolean(initialData);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('notices.titlePlaceholder').replace(':', '')}
        placeholder={t('notices.titlePlaceholder')}
        value={form.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        required={true}
        autoFocus={true}
      />

      <Input
        label={t('notices.contentPlaceholder').replace(':', '')}
        placeholder={t('notices.contentPlaceholder')}
        value={form.content}
        onChange={(e) => handleChange('content', e.target.value)}
        error={errors.content}
        type="textarea"
        rows={5}
        required={true}
      />

      {/* Pin toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            checked={form.isPinned}
            onChange={(e) => handleChange('isPinned', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-slate-200 dark:bg-slate-600 rounded-full peer-focus:ring-2 peer-focus:ring-teal/30 transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white dark:bg-slate-300 rounded-full shadow-sm transition-transform peer-checked:translate-x-4 peer-checked:bg-teal" />
        </div>
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {t('notices.pinNotice')}
        </span>
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {t('action.cancel')}
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {isEditing ? t('action.update') : t('notices.addNotice')}
        </Button>
      </div>
    </form>
  );
}
