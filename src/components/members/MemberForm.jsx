import { useState, useEffect, useCallback } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { validateMember } from '../../utils/validators';
import { MEMBER_STATUS_OPTIONS } from '../../utils/constants';
import { useLanguageContext } from '../../context/LanguageContext';
import { useToastContext } from '../../context/ToastContext';
import { getToday } from '../../utils/formatters';

const initialState = {
  name: '',
  phone: '',
  address: '',
  rentAmount: '',
  joiningDate: '',
  status: 'active',
};

export default function MemberForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  showStatusField = false,
}) {
  const { t, isBn } = useLanguageContext();
  const { error: showError } = useToastContext();
  const [form, setForm] = useState({
    ...initialState,
    joiningDate: getToday(),
  });
  const [errors, setErrors] = useState({});

  // Populate form when initialData changes (edit mode)
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        rentAmount: initialData.rentAmount != null ? String(initialData.rentAmount) : '',
        joiningDate: initialData.joiningDate || getToday(),
        status: initialData.status || 'active',
      });
    } else {
      setForm({
        ...initialState,
        joiningDate: getToday(),
      });
    }
    setErrors({});
  }, [initialData]);

  // ---- Handle input change ----
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

  // ---- Validate and submit ----
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const validation = validateMember(form);
      if (!validation.valid) {
        const message = isBn ? validation.messageBn : validation.messageEn;

        // Try to map error to specific field
        const fieldMap = {
          name: [t('members.namePlaceholder'), 'Name', t('members.namePlaceholder').split(' ')[0]],
          phone: [t('label.phone'), 'Phone', 'ফোন'],
          rentAmount: [t('members.rentPlaceholder'), 'Rent', 'ভাড়া'],
          joiningDate: [t('members.joiningDatePlaceholder'), 'Joining', 'তারিখ'],
        };

        let matched = false;
        for (const [field, keywords] of Object.entries(fieldMap)) {
          if (keywords.some((kw) => message.includes(kw))) {
            setErrors({ [field]: message });
            matched = true;
            break;
          }
        }
        if (!matched) {
          showError(message);
        }
        return;
      }

      // Convert rentAmount to number before submitting
      const submitData = {
        ...form,
        rentAmount: Number(form.rentAmount) || 0,
      };

      onSubmit(submitData);
    },
    [form, isBn, t, showError, onSubmit]
  );

  const isEditing = Boolean(initialData);

  // Build status options with translated labels
  const statusOptions = MEMBER_STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label: isBn ? opt.labelBn : opt.labelEn,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Member Name */}
      <Input
        label={t('label.name')}
        placeholder={t('members.namePlaceholder')}
        value={form.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required={true}
        autoFocus={true}
      />

      {/* Phone */}
      <Input
        label={t('label.phone')}
        placeholder={t('members.phonePlaceholder')}
        value={form.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        error={errors.phone}
        type="tel"
        required={true}
      />

      {/* Address */}
      <Input
        label={t('label.address')}
        placeholder={t('members.addressPlaceholder')}
        value={form.address}
        onChange={(e) => handleChange('address', e.target.value)}
        error={errors.address}
      />

      {/* Rent Amount */}
      <Input
        label={t('members.rentPerMonth')}
        placeholder={t('members.rentPlaceholder')}
        value={form.rentAmount}
        onChange={(e) => handleChange('rentAmount', e.target.value)}
        error={errors.rentAmount}
        type="number"
        min="0"
        step="1"
        prefix={isBn ? '৳' : '৳'}
      />

      {/* Joining Date */}
      <Input
        label={t('label.joiningDate')}
        placeholder={t('members.joiningDatePlaceholder')}
        value={form.joiningDate}
        onChange={(e) => handleChange('joiningDate', e.target.value)}
        error={errors.joiningDate}
        type="date"
        required={true}
        max={getToday()}
      />

      {/* Status field (only shown in edit mode or when explicitly requested) */}
      {showStatusField && isEditing && (
        <Select
          label={t('label.status')}
          options={statusOptions}
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value)}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {t('action.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {isEditing ? t('action.update') : t('members.addMember')}
        </Button>
      </div>
    </form>
  );
}
