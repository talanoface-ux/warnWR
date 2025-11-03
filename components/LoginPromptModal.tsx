
import React from 'react';
import { XMarkIcon, SparklesIcon, UserPlusIcon } from './icons';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
  purpose: 'chat' | 'create';
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onClose, onLogin, onSignup, purpose }) => {
  if (!isOpen) return null;

  const content = {
    chat: {
      icon: <SparklesIcon className="w-10 h-10 text-white" />,
      title: 'برای شروع گفتگو وارد شوید',
      description: (
        <>
            ثبت‌نام کنید و <span className="font-bold text-rose-500">۱۵ سکه رایگان</span> برای چت با اولین پارتنر خود دریافت کنید!
        </>
      ),
      signupButton: 'ثبت‌نام و دریافت سکه رایگان',
    },
    create: {
      icon: <UserPlusIcon className="w-10 h-10 text-white" />,
      title: 'برای ساخت شخصیت وارد شوید',
      description: (
        <>
            برای ساخت، ویرایش و به اشتراک‌گذاری شخصیت‌های خود، ابتدا یک حساب کاربری بسازید.
        </>
      ),
      signupButton: 'ثبت‌نام و ساخت شخصیت',
    }
  };

  const currentContent = content[purpose] || content.chat;

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

            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-rose-500 to-amber-400 -mt-10 shadow-lg border-4 border-white dark:border-slate-800">
                 {currentContent.icon}
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-6">
                {currentContent.title}
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
                {currentContent.description}
            </p>

            <div className="mt-8 space-y-3">
                <button
                    onClick={onSignup}
                    className="w-full px-6 py-3 font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-transform hover:scale-105"
                >
                    {currentContent.signupButton}
                </button>
                <button
                    onClick={onLogin}
                    className="w-full px-6 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                    ورود به حساب کاربری
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

export default LoginPromptModal;
