import React from 'react';
import { PhoneIcon } from './icons';

interface SupportButtonProps {
  onClick: () => void;
}

const SupportButton: React.FC<SupportButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 transition-transform hover:scale-110 group"
      aria-label="پشتیبانی"
    >
      <PhoneIcon className="h-7 w-7 m-auto" />
       <span className="absolute right-full mr-4 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-slate-800 text-xs font-bold transition-all duration-100 scale-0 origin-right group-hover:scale-100">
        پشتیبانی
      </span>
    </button>
  );
};

export default SupportButton;
