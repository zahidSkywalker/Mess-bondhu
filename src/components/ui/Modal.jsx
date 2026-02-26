import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
          />
          
          {/* Modal Container - Fixed positioning with scroll support */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300 
            }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto"
          >
            {/* Inner Modal Card - Responsive Width and Max Height */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col my-8 max-h-[90vh]">
              
              {/* Modal Header (Fixed Top) */}
              <div className="flex justify-between items-start p-6 pb-2 flex-shrink-0">
                <div className="pr-8">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight">
                    {title}
                  </h2>
                  <div className="h-1.5 w-10 bg-tropical-teal rounded-full mt-3"></div>
                </div>
                
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
                >
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 pt-4 overflow-y-auto no-scrollbar space-y-6">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
