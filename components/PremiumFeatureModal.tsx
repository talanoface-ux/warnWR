
import React from 'react';
import { XMarkIcon, SparklesIcon } from './icons';

interface PremiumFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumFeatureModal: React.FC<PremiumFeatureModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        <div className="relative p-8 pt-0 text-center">
            <button 
                onClick={onClose} 
                className="absolute top-4 left-4 p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                aria-label="بستن"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 -mt-10 shadow-lg border-4 border-white dark:border-slate-800">
                 <SparklesIcon className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-6">
                این یک ویژگی ویژه است
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
                ساخت شخصیت‌های سفارشی فقط برای کاربرانی که اشتراک ویژه دارند در دسترس است. برای دسترسی کامل، اشتراک خود را ارتقا دهید.
            </p>

            <div className="mt-8">
                <button
                    onClick={onUpgrade}
                    className="w-full px-6 py-3 font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-transform hover:scale-105"
                >
                    خرید اشتراک ویژه
                </button>
            </div>
        </div>
      </div>
       <style>{`
        @keyframes scale-in {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
      `}</style>
    </div>
  );
};

export default PremiumFeatureModal;
