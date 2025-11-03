import React from 'react';
import { Page, User } from '../types';
import { LogoutIcon, ArrowRightIcon, UserCircleIcon, WalletIcon, PhoneIcon, SparklesIcon } from './icons';
import { calculateDaysRemaining } from '../utils/dateUtils';

interface UserProfilePageProps {
  navigate: (page: Page) => void;
  currentUser: User | null;
  onLogout: () => void;
  setIsPurchaseModalOpen: (isOpen: boolean) => void;
  setIsSupportModalOpen: (isOpen: boolean) => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ navigate, currentUser, onLogout, setIsPurchaseModalOpen, setIsSupportModalOpen }) => {
  if (!currentUser) {
    navigate('landing');
    return null;
  }

  const isPremium = currentUser.subscription && currentUser.subscription.expiresAt && new Date(currentUser.subscription.expiresAt) > new Date();
  
  const subscriptionExpiresAt = isPremium 
    ? new Date(currentUser.subscription!.expiresAt!).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;
    
  const daysRemaining = calculateDaysRemaining(currentUser.subscription?.expiresAt || null);

  const memberSince = currentUser.createdAt 
    ? new Date(currentUser.createdAt).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'نامشخص';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 flex items-center justify-center" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(244, 63, 94, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1), transparent 50%)'}}>
      <div className="relative w-full max-w-md bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
        <button
          onClick={() => navigate('landing')}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          aria-label="بازگشت به صفحه اصلی"
        >
          <ArrowRightIcon className="w-6 h-6" />
        </button>

        <div className="p-8 flex flex-col items-center">
            <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center shadow-lg">
                    <UserCircleIcon className="w-20 h-20 text-white/80" />
                </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 break-all">{currentUser.email}</h2>
            {isPremium ? (
              <div className="mt-2 flex items-center gap-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-semibold">
                  <SparklesIcon className="w-4 h-4" />
                  <span>عضو ویژه ({daysRemaining} روز باقی مانده)</span>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">عضو از {memberSince}</p>
            )}
        
            <div className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl p-6 my-8 text-white shadow-lg text-center">
                <h3 className="text-sm font-medium opacity-80 tracking-wider">موجودی سکه (برای ساخت عکس)</h3>
                <p className="text-4xl font-bold mt-2">
                    {currentUser.balance.toLocaleString('fa-IR')}
                </p>
                <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm font-semibold hover:bg-white/30 transition"
                >
                    <SparklesIcon className="w-5 h-5"/>
                    <span>خرید اشتراک</span>
                </button>
            </div>

            <div className="w-full space-y-3">
                 <button
                    onClick={() => setIsSupportModalOpen(true)}
                    className="w-full flex items-center justify-start gap-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                 >
                    <PhoneIcon className="w-5 h-5 text-rose-500"/>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">پشتیبانی</span>
                </button>
            </div>

            <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-8 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-200 dark:hover:bg-rose-900/60 transition"
          >
            <LogoutIcon className="w-5 h-5"/>
            <span>خروج از حساب</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
