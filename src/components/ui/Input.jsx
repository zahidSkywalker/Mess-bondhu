import React from 'react';
import { cn } from '../../utils/cn';

const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  className = "", 
  type = "text", 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-2 mb-6 w-full">
      {label && (
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-baltic-blue transition-colors duration-300">
            <Icon size={20} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "w-full bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-2xl px-5 py-4 outline-none text-lg transition-all duration-300 placeholder:text-slate-400 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-baltic-blue focus:shadow-lg focus:shadow-baltic-blue/5",
            Icon && "pl-12",
            error && "border-red-400 focus:border-red-500 focus:shadow-red-500/10",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 ml-1 font-bold mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
