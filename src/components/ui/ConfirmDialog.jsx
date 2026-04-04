import Modal from './Modal';
import Button from './Button';
import { useLanguageContext } from '../../context/LanguageContext';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
  icon,
}) {
  const { t } = useLanguageContext();

  const btnVariant = variant === 'warning' ? 'secondary' : variant;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText || t('action.cancel')}
          </Button>
          <Button
            variant={btnVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText || t('action.delete')}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>
      </div>
    </Modal>
  );
}
