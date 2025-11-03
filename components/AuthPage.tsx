

import React, { useState } from 'react';
import { Page, User, AuditLogEntry, AuditLogAction } from '../types';
import { ArrowRightIcon } from './icons';

interface AuthPageProps {
  navigate: (page: Page) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  initialMode?: 'login' | 'signup';
  setAuditLog: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>;
}

const AuthPage: React.FC<AuthPageProps> = ({ navigate, users, setUsers, setCurrentUser, initialMode = 'login', setAuditLog }) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      // Handle Login
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        setCurrentUser(user);
        navigate('landing');
      } else {
        setError('ایمیل یا رمز عبور نامعتبر است.');
      }
    } else {
      // Handle Sign Up
      if (users.some(u => u.email === email)) {
        setError('کاربری با این ایمیل از قبل وجود دارد.');
        return;
      }
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        password, // In a real app, hash this password!
        balance: 15,
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);

      // Create audit log for user creation
      const logEntry: AuditLogEntry = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: AuditLogAction.USER_CREATED,
        adminId: 'system',
        targetUserId: newUser.id,
        details: { email: newUser.email, initialBalance: newUser.balance }
      };
      setAuditLog(prev => [logEntry, ...prev]);

      navigate('landing');
    }
  };
  
  const containerClasses = `relative w-full max-w-md p-8 space-y-4 bg-white dark:bg-slate-800 rounded-lg shadow-md transition-all duration-300 border-t-4 ${
    isLoginMode 
    ? 'border-rose-500' 
    : 'border-indigo-500'
  }`;
  
  const buttonClasses = `w-full py-2 px-4 font-semibold text-white rounded-md transition-colors ${
    isLoginMode
    ? 'bg-rose-600 hover:bg-rose-700'
    : 'bg-indigo-600 hover:bg-indigo-700'
  }`;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className={containerClasses}>
        <button
            onClick={() => navigate('landing')}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            aria-label="بازگشت به صفحه اصلی"
        >
            <ArrowRightIcon className="w-6 h-6 text-slate-500" />
        </button>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isLoginMode ? 'ورود به حساب کاربری' : 'ایجاد حساب کاربری'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isLoginMode
                ? 'خوشحالیم که برگشتی! برای ادامه وارد شو.'
                : 'به ایران پارتنر خوش آمدی! همین حالا حساب رایگان خود را بساز.'
            }
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <label htmlFor="email-auth" className="text-sm font-medium text-slate-600 dark:text-slate-300">ایمیل</label>
            <input
              id="email-auth"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div>
            <label htmlFor="password-auth" className="text-sm font-medium text-slate-600 dark:text-slate-300">رمز عبور</label>
            <input
              id="password-auth"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button type="submit" className={buttonClasses}>
            {isLoginMode ? 'ورود' : 'ثبت‌نام و ورود'}
          </button>
        </form>
        <div className="text-center">
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500">
            {isLoginMode ? 'حساب کاربری ندارید؟ ثبت‌نام کنید' : 'از قبل حساب دارید؟ وارد شوید'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;