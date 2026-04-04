export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon */}
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
          {icon}
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className="text-base font-semibold text-slate-600 dark:text-slate-300 mb-1">
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Action button */}
      {action && action}
    </div>
  );
}
