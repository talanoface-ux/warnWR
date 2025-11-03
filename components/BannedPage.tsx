
import React from 'react';

const BannedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 text-center">
      <svg className="w-24 h-24 text-red-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
      <h1 className="text-4xl font-bold mb-2">دسترسی شما مسدود شده است</h1>
      <p className="text-lg text-slate-400">
        به دلیل تلاش‌های ناموفق متعدد برای ورود، دسترسی شما به این سایت محدود شده است.
      </p>
      <p className="mt-4 text-sm text-slate-500">
        اگر فکر می‌کنید این یک اشتباه است، لطفاً با پشتیبانی تماس بگیرید.
      </p>
    </div>
  );
};

export default BannedPage;
