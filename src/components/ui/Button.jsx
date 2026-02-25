import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  className = '', 
  loading = false, 
  disabled = false,
  type = "button",
  icon: Icon 
}) => {
  
  const baseStyles = "font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-baltic-blue hover:bg-baltic-blue/90 text-white shadow-lg shadow-baltic-blue/30",
    secondary: "bg-white dark:bg-slate-700 text-baltic-blue dark:text-emerald border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;
