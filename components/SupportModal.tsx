import React from 'react';
import { XMarkIcon, TelegramIcon } from './icons';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            پشتیبانی ۲۴ ساعته
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <XMarkIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        <div className="p-8 text-center">
          <TelegramIcon className="w-16 h-16 text-sky-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            پشتیبانی ما در حال حاضر از طریق تلگرام انجام می‌شود. برای ارتباط با ما روی دکمه زیر کلیک کنید.
          </p>
          <a
            href="https://t.me/iranpartnersup"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 font-semibold text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-transform hover:scale-105"
          >
            <TelegramIcon className="w-6 h-6" />
            <span>ارتباط با پشتیبانی تلگرام</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
