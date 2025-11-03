import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { XMarkIcon, SparklesIcon, TelegramIcon, CheckIcon } from './icons';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const premiumFeatures = [
    'ساخت دوست دختر (های) مجازی دلخواه',
    'پیام‌های متنی نامحدود',
    'دریافت ماهانه ۱۰۰ سکه رایگان',
    'حذف تاری عکس‌ها',
    'ساخت تصویر',
    'تماس صوتی با هوش مصنوعی',
    'پاسخ‌های سریع‌تر',
    'امکان خرید سکه اضافی',
];

const subscriptionPlans = [
  {
    id: '1-month',
    duration: '1 ماهه',
    price: '9.99',
    pricePerMonth: '9.99$ در ماه',
    features: premiumFeatures,
    discount: null,
  },
  {
    id: '3-months',
    duration: '3 ماهه',
    price: '27.99',
    pricePerMonth: '9.33$ در ماه',
    discount: '۷٪ تخفیف',
    popular: true,
    features: premiumFeatures,
  },
  {
    id: '12-months',
    duration: '12 ماهه',
    price: '99.99',
    pricePerMonth: '8.33$ در ماه',
    discount: '۱۷٪ تخفیف',
    features: premiumFeatures,
  },
];


const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [showTelegramInfo, setShowTelegramInfo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowTelegramInfo(false);
    }
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const handlePlanSelect = () => {
    setShowTelegramInfo(true);
  };
  
  const handleClose = () => {
      onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]"
      onClick={handleClose}
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-amber-500" />
            {showTelegramInfo ? 'راهنمای خرید' : 'اشتراک ویژه'}
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <XMarkIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto">
            {showTelegramInfo ? (
                <div className="p-8 text-center">
                    <TelegramIcon className="w-16 h-16 text-sky-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">خرید از طریق تلگرام</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                        برای تکمیل فرآیند خرید و فعال‌سازی اشتراک خود، لطفاً به پشتیبانی ما در تلگرام پیام دهید.
                    </p>
                    <div className="mb-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg inline-block">
                          توجه: فعال‌سازی اشتراک شما معمولاً کمتر از ۱۵ دقیقه زمان می‌برد.
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <a
                            href="https://t.me/iranpartnersup"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 font-semibold text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-transform hover:scale-105"
                        >
                            <TelegramIcon className="w-6 h-6" />
                            <span>ارتباط با پشتیبانی</span>
                        </a>
                         <button 
                            onClick={() => setShowTelegramInfo(false)} 
                            className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 transition"
                         >
                            بازگشت به پلن‌ها
                         </button>
                    </div>
                </div>
            ) : (
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6">
                    {subscriptionPlans.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={handlePlanSelect}
                        className={`relative p-6 rounded-lg border-2 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer flex flex-col w-full lg:w-1/3
                          ${plan.popular
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20'
                          }`}
                      >
                        {plan.popular && (
                          <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full z-10">
                            محبوب‌ترین
                          </div>
                        )}

                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                              {plan.duration}
                            </p>
                            {plan.discount && (
                                 <p className="text-sm font-semibold text-green-600 dark:text-green-400">{plan.discount}</p>
                            )}
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{plan.pricePerMonth}</p>
                        </div>
                        
                        <div className="my-4 h-px bg-slate-200 dark:bg-slate-700"></div>

                        <ul className="flex-grow space-y-2 text-sm text-right mb-6">
                            {plan.features.map(feature => (
                                 <li key={feature} className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div>
                            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                              ${plan.price}
                            </p>
                             <p className="text-slate-500 dark:text-slate-400 mb-6">دلار</p>
                            
                            <div
                              className="w-full px-6 py-3 font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition"
                            >
                              انتخاب پلن
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;