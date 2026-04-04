import { useState, useEffect, useCallback } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { validateExpense } from '../../utils/validators';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { useLanguageContext } from '../../context/LanguageContext';
import { useToastContext } from '../../context/ToastContext';
import { getToday } from '../../utils/formatters';

const initialState = {
  category: '',
  amount: '',
  description: '',
  date: '',
  remark: '',
};

export default function ExpenseForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const { t, isBn } = useLanguageContext();
  const { error: showError } = useToastContext();
  const [form, setForm] = useState({
    ...initialState,
    date: getToday(),
    category: 'bazar',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        category: initialData.category || 'bazar',
        amount: initialData.amount != null ? String(initialData.amount) : '',
        description: initialData.description || '',
        date: initialData.date || getToday(),
        remark: initialData.remark || '',
      });
    } else {
      setForm({
        ...initialState,
        date: getToday(),
        category: 'bazar',
      });
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

      const validation = validateExpense(form);
      if (!validation.valid) {
        const message = isBn ? validation.messageBn : validation.messageEn;

        const fieldMap = {
          category: [isBn ? 'খাত' : 'Category', 'category'],
          amount: [isBn ? 'পরিমাণ' : 'Amount', 'amount'],
          description: [isBn ? 'বিবরণ' : 'Description', 'description'],
          date: [isBn ? 'তারিখ' : 'Date', 'date'],
        };

        let matched = false;
        for (const [field, keywords] of Object.entries(fieldMap)) {
          if (keywords.some((kw) => message.toLowerCase().includes(kw.toLowerCase()))) {
            setErrors({ [field]: message });
            matched = true;
            break;
          }
        }
        if (!matched) showError(message);
        return;
      }

      onSubmit({
        ...form,
        amount: Number(form.amount) || 0,
      });
    },
    [form, isBn, showError, onSubmit]
  );

  const isEditing = Boolean(initialData);

  // Build category options with translated labels
  const categoryOptions = EXPENSE_CATEGORIES.map((cat) => ({
    value: cat.value,
    label: isBn ? cat.labelBn : cat.labelEn,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label={t('label.category')}
        options={categoryOptions}
        value={form.category}
        onChange={(e) => handleChange('category', e.target.value)}
        placeholder={t('expenses.selectCategory')}
        error={errors.category}
        required={true}
      />

      <Input
        label={t('label.amount')}
        placeholder={t('expenses.amountPlaceholder')}
        value={form.amount}
        onChange={(e) => handleChange('amount', e.target.value)}
        error={errors.amount}
        type="number"
        min="0"
        step="1"
        prefix={isBn ? '৳' : '৳'}
        required={true}
        autoFocus={!isEditing}
      />

      <Input
        label={t('label.description')}
        placeholder={t('expenses.descriptionPlaceholder')}
        value={form.description}
        onChange={(e) => handleChange('description', e.target.value)}
        error={errors.description}
        required={true}
      />

      <Input
        label={t('label.date')}
        value={form.date}
        onChange={(e) => handleChange('date', e.target.value)}
        error={errors.date}
        type="date"
        required={true}
        max={getToday()}
      />

      <Input
        label={t('label.remark')}
        placeholder={t('payments.remarkPlaceholder')}
        value={form.remark}
        onChange={(e) => handleChange('remark', e.target.value)}
        error={errors.remark}
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {t('action.cancel')}
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {isEditing ? t('action.update') : t('expenses.addExpense')}
        </Button>
      </div>
    </form>
  );
}
