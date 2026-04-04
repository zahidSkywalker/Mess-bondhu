import { forwardRef } from 'react';

const Select = forwardRef(function Select(
  {
    label,
    error,
    helpText,
    options = [],
    placeholder,
    required = false,
    className = '',
    containerClassName = '',
    ...rest
  },
  ref
) {
  const displayError = typeof error === 'string' ? error : error?.messageBn || error?.messageEn || '';

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <select
        ref={ref}
        required={required}
        className={`
          select-field
          ${displayError ? 'border-red-400 dark:border-red-500 focus:ring-red-500/50 focus:border-red-400' : ''}
          ${className}
        `}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? (opt.label || opt.labelBn || opt.labelEn || '') : opt;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>

      {displayError && (
        <p className="text-xs text-red-500 dark:text-red-400">{displayError}</p>
      )}
      {!displayError && helpText && (
        <p className="text-xs text-slate-400 dark:text-slate-500">{helpText}</p>
      )}
    </div>
  );
});

export default Select;
