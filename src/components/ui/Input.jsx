import React from 'react';
import { cn } from '../../utils/cn'; // Utility helper to merge classes

const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  className = "", 
  type = "text", 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1.5 mb-4 w-full">
      {label && (
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-tropical-teal transition-colors">
            <Icon size={20} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-tropical-teal/50 focus:border-tropical-teal transition-all placeholder:text-gray-400 text-slate-800 dark:text-slate-100",
            Icon && "pl-10",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>
      )}
    </div>
  );
};

export default Input;
