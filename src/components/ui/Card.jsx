export default function Card({
  children,
  className = '',
  hover = true,
  padding = true,
  onClick,
  as: Component = 'div',
  ...rest
}) {
  return (
    <Component
      onClick={onClick}
      className={`
        ${hover ? 'card' : 'card-flat'}
        ${!padding ? 'p-0' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * Card sub-components for consistent layout.
 */
Card.Header = function CardHeader({ children, className = '' }) {
  return <div className={`flex items-center justify-between mb-4 ${className}`}>{children}</div>;
};

Card.Title = function CardTitle({ children, className = '' }) {
  return <h3 className={`text-base font-semibold text-slate-800 dark:text-slate-100 ${className}`}>{children}</h3>;
};

Card.Subtitle = function CardSubtitle({ children, className = '' }) {
  return <p className={`text-xs text-slate-500 dark:text-slate-400 mt-0.5 ${className}`}>{children}</p>;
};

Card.Content = function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return <div className={`flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 ${className}`}>{children}</div>;
};
