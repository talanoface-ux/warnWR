import React, { useState, useMemo } from 'react';
import { Page, Conversation, Character, User, AuditLogEntry, AuditLogAction } from '../types';
import CharacterEditorModal from './CharacterEditorModal';
import useLocalStorage from '../hooks/useLocalStorage';
import { PencilIcon, TrashIcon, PlusIcon, ArrowRightIcon, LockClosedIcon } from './icons';
import { calculateDaysRemaining } from '../utils/dateUtils';

interface AdminDashboardProps {
  navigate: (page: Page) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  bannedIdentifiers: string[];
  setBannedIdentifiers: React.Dispatch<React.SetStateAction<string[]>>;
  visitorId: string;
  auditLog: AuditLogEntry[];
  setAuditLog: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>;
}

const ADMIN_USERNAME = "ajnrfbJNTjW56nI^%NI%JIJM#%N#I(WN%HOQNM%B(_UI#N5U*(IN%MTBUIW$BN#";
const ADMIN_PASSWORD = "oKNJMRTNIOKB#NT%UJION#U%^ntOUW#BJN^MJJNUOIT$WN^^%UW$J%^HUIW#$HNJ%^UW#$N%4wnT^";
const MAX_LOGIN_ATTEMPTS = 5;

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  navigate, isAdmin, setIsAdmin, characters, setCharacters, users, setUsers, conversations, setConversations, bannedIdentifiers, setBannedIdentifiers, visitorId, auditLog, setAuditLog
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState<'conversations' | 'characters' | 'users' | 'bans' | 'history'>('conversations');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null);
  
  const [balanceAmounts, setBalanceAmounts] = useState<Record<string, string>>({});
  const [subscriptionDays, setSubscriptionDays] = useState<Record<string, string>>({});
  
  const [loginAttempts, setLoginAttempts] = useLocalStorage<Record<string, number>>('ai-login-attempts', {});

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [conversations]);

  const userEmailMap = useMemo(() => {
    return users.reduce((acc, user) => {
        acc[user.id] = user.email;
        return acc;
    }, {} as Record<string, string>);
  }, [users]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setError('');
      setLoginAttempts(prev => {
        const newAttempts = { ...prev };
        delete newAttempts[visitorId];
        return newAttempts;
      });
    } else {
      const currentAttempts = (loginAttempts[visitorId] || 0) + 1;
      
      if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
        setBannedIdentifiers(prev => [...new Set([...prev, visitorId])]);
        setError('تعداد تلاش‌های ناموفق بیش از حد مجاز بود. دسترسی شما مسدود شد.');
      } else {
        setLoginAttempts(prev => ({ ...prev, [visitorId]: currentAttempts }));
        setError(`نام کاربری یا رمز عبور نادرست است. ${MAX_LOGIN_ATTEMPTS - currentAttempts} تلاش دیگر باقی مانده است.`);
      }
    }
    setPassword('');
    setUsername('');
  };
  
  const handleDeleteConversation = (id: string) => {
    if (window.confirm('آیا از حذف این مکالمه مطمئن هستید؟')) {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
    }
  };
  
  const exportToCSV = () => {
    const headers = ['conversationId', 'userId', 'messageId', 'timestamp', 'role', 'content'];
    const rows = conversations.flatMap(conv => 
      conv.messages.map(msg => [
        conv.id,
        conv.userId || 'guest',
        msg.id,
        msg.timestamp,
        msg.role,
        `"${msg.content?.replace(/"/g, '""') || ''}"`
      ])
    );
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n' 
      + rows.map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "conversations_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleOpenModal = (character: Character | null = null) => {
    setCharacterToEdit(character);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCharacterToEdit(null);
  };

  const handleSaveCharacter = (character: Character) => {
    if (characterToEdit) {
      setCharacters(prev => prev.map(c => c.id === character.id ? character : c));
    } else {
      setCharacters(prev => [...prev, character]);
    }
    handleCloseModal();
  };
  
  const handleDeleteCharacter = (id: string) => {
    if (window.confirm('آیا از حذف این شخصیت مطمئن هستید؟')) {
      setCharacters(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleBalanceChange = (userId: string, amount: string) => {
    setBalanceAmounts(prev => ({...prev, [userId]: amount}));
  };
  
  const createLogEntry = (action: AuditLogAction, targetUserId: string, details: Record<string, any>) => {
    const log: AuditLogEntry = {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
        action: action,
        adminId: 'admin',
        targetUserId,
        details,
    };
    setAuditLog(prev => [log, ...prev]);
  };

  const handleUpdateBalance = (userId: string, operation: 'add' | 'subtract') => {
    const amountStr = balanceAmounts[userId] || '0';
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) {
      alert("لطفا یک عدد معتبر وارد کنید.");
      return;
    }

    const userBefore = users.find(u => u.id === userId);
    if (!userBefore) return;

    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        const newBalance = operation === 'add' 
          ? user.balance + amount 
          : user.balance - amount;
        
        createLogEntry(
            operation === 'add' ? AuditLogAction.BALANCE_ADD : AuditLogAction.BALANCE_SUBTRACT,
            userId,
            { amount, oldBalance: userBefore.balance, newBalance: Math.max(0, newBalance) }
        );

        return { ...user, balance: Math.max(0, newBalance) };
      }
      return user;
    }));
    handleBalanceChange(userId, '');
  };

   const handleSubscriptionDaysChange = (userId: string, days: string) => {
    setSubscriptionDays(prev => ({ ...prev, [userId]: days }));
  };

  const handleAddSubscriptionDays = (userId: string) => {
    const daysStr = subscriptionDays[userId] || '0';
    const days = parseInt(daysStr, 10);
    if (isNaN(days) || days <= 0) {
        alert("لطفا تعداد روز معتبر وارد کنید.");
        return;
    }
    
    const userBefore = users.find(u => u.id === userId);
    if (!userBefore) return;

    setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === userId) {
            const currentExpiry = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : new Date();
            const startDate = currentExpiry > new Date() ? currentExpiry : new Date();
            const newExpiry = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
            
            createLogEntry(AuditLogAction.SUBSCRIPTION_ADD, userId, {
                daysAdded: days,
                oldExpiry: userBefore.subscription?.expiresAt,
                newExpiry: newExpiry.toISOString(),
            });

            return {
                ...user,
                subscription: { expiresAt: newExpiry.toISOString() }
            };
        }
        return user;
    }));
    handleSubscriptionDaysChange(userId, '');
  };

  const handleRemoveSubscription = (userId: string) => {
    if (window.confirm("آیا از حذف اشتراک این کاربر مطمئن هستید؟")) {
        const userBefore = users.find(u => u.id === userId);
        if (!userBefore) return;

        setUsers(prevUsers => prevUsers.map(user => {
            if (user.id === userId) {
                 const { subscription, ...rest } = user;
                 createLogEntry(AuditLogAction.SUBSCRIPTION_REMOVE, userId, {
                     lastExpiry: userBefore.subscription?.expiresAt
                 });
                 return { ...rest, subscription: { expiresAt: null } };
            }
            return user;
        }));
    }
  };


  const handleUnban = (idToUnban: string) => {
    if (window.confirm(`آیا از رفع مسدودیت برای شناسه "${idToUnban}" مطمئن هستید؟`)) {
        setBannedIdentifiers(prev => prev.filter(id => id !== idToUnban));
        setLoginAttempts(prev => {
            const newAttempts = { ...prev };
            delete newAttempts[idToUnban];
            return newAttempts;
        });
    }
  };
  
  const renderAuditLogMessage = (log: AuditLogEntry): string => {
    const userEmail = userEmailMap[log.targetUserId] || log.targetUserId;
    const { details } = log;
    
    switch(log.action) {
        case AuditLogAction.USER_CREATED:
            return `کاربر ${details.email} با ${details.initialBalance} سکه اولیه ثبت نام کرد.`;
        case AuditLogAction.BALANCE_ADD:
            return `ادمین ${details.amount.toLocaleString('fa-IR')} سکه به ${userEmail} اضافه کرد. (موجودی قبلی: ${details.oldBalance.toLocaleString('fa-IR')})`;
        case AuditLogAction.BALANCE_SUBTRACT:
            return `ادمین ${details.amount.toLocaleString('fa-IR')} سکه از ${userEmail} کسر کرد. (موجودی قبلی: ${details.oldBalance.toLocaleString('fa-IR')})`;
        case AuditLogAction.SUBSCRIPTION_ADD:
            return `ادمین ${details.daysAdded} روز اشتراک به ${userEmail} اضافه کرد. (انقضای جدید: ${new Date(details.newExpiry).toLocaleDateString('fa-IR')})`;
        case AuditLogAction.SUBSCRIPTION_REMOVE:
            return `ادمین اشتراک کاربر ${userEmail} را حذف کرد.`;
        default:
            return `رویداد ناشناخته: ${log.action}`;
    }
  };


  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <div className="relative w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <button
              onClick={() => navigate('landing')}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="بازگشت به صفحه اصلی"
          >
              <ArrowRightIcon className="w-6 h-6 text-slate-500" />
          </button>
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100">ورود ادمین</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label htmlFor="username-admin" className="text-sm font-medium text-slate-600 dark:text-slate-300">نام کاربری</label>
                <input
                    id="username-admin"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                />
            </div>
            <div>
              <label htmlFor="password-admin" className="text-sm font-medium text-slate-600 dark:text-slate-300">رمز عبور</label>
              <input
                id="password-admin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full py-2 px-4 font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700">
              ورود
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">داشبورد ادمین</h1>
          <button 
            onClick={() => navigate('landing')} 
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition" 
            aria-label="بازگشت به سایت"
          >
            <ArrowRightIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <div className="mb-4 border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs" dir="rtl">
                <button
                    onClick={() => setActiveTab('conversations')}
                    className={`${activeTab === 'conversations' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    مدیریت مکالمات
                </button>
                <button
                    onClick={() => setActiveTab('characters')}
                    className={`${activeTab === 'characters' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    مدیریت شخصیت‌ها
                </button>
                 <button
                    onClick={() => setActiveTab('users')}
                    className={`${activeTab === 'users' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    مدیریت کاربران
                </button>
                <button
                    onClick={() => setActiveTab('bans')}
                    className={`${activeTab === 'bans' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    مدیریت مسدودیت‌ها ({bannedIdentifiers.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`${activeTab === 'history' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    تاریخچه
                </button>
            </nav>
        </div>

        {activeTab === 'conversations' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-1 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
               <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">مکالمات ({conversations.length})</h2>
               <ul className="h-[75vh] overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
                 {sortedConversations.map(conv => (
                   <li key={conv.id} onClick={() => setSelectedConversation(conv)} className={`p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${selectedConversation?.id === conv.id ? 'bg-slate-200 dark:bg-slate-600' : ''}`}>
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="font-semibold">{conv.title}</p>
                         <p className="text-sm text-sky-600 dark:text-sky-400 font-medium">{userEmailMap[conv.userId || ''] || 'کاربر مهمان'}</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">{conv.messages.length} پیام</p>
                         <p className="text-xs text-slate-400 dark:text-slate-500">آخرین بروزرسانی: {new Date(conv.lastUpdated).toLocaleString('fa-IR')}</p>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }} className="text-red-600 hover:text-red-500 p-1 text-xs">حذف</button>
                     </div>
                   </li>
                 ))}
               </ul>
             </div>
             <div className="md:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
               <div className="flex justify-between items-center mb-2">
                 <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">گزارش پیام‌ها</h2>
                 <button onClick={exportToCSV} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                   خروجی CSV از همه
                 </button>
               </div>
               <div className="h-[75vh] overflow-y-auto bg-slate-100 dark:bg-slate-700/50 p-3 rounded">
                 {selectedConversation ? (
                   <div>
                     {selectedConversation.messages.map(msg => (
                       <div key={msg.id} className={`p-3 my-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-slate-200 dark:bg-slate-600'}`}>
                         <p className="text-sm font-bold capitalize text-slate-900 dark:text-slate-100">{msg.role}</p>
                         <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(msg.timestamp).toLocaleString('fa-IR')}</p>
                         <p className="mt-1 whitespace-pre-wrap text-slate-800 dark:text-slate-200">{msg.content}</p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-slate-500 dark:text-slate-400 text-center pt-10">یک مکالمه را برای دیدن پیام‌ها انتخاب کنید.</p>
                 )}
               </div>
             </div>
           </div>
        )}
        
        {activeTab === 'characters' && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">شخصیت‌ها ({characters.length})</h2>
              <button 
                onClick={() => handleOpenModal()} 
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition"
              >
                <PlusIcon className="w-5 h-5" />
                <span>ساخت شخصیت جدید</span>
              </button>
            </div>
            <div className="h-[75vh] overflow-y-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                  <thead className="text-xs text-slate-600 dark:text-slate-300 uppercase bg-slate-200 dark:bg-slate-700">
                      <tr>
                          <th scope="col" className="px-6 py-3">شخصیت</th>
                          <th scope="col" className="px-6 py-3">سازنده</th>
                          <th scope="col" className="px-6 py-3">وضعیت</th>
                          <th scope="col" className="px-6 py-3">تگ‌ها</th>
                          <th scope="col" className="px-6 py-3">عملیات</th>
                      </tr>
                  </thead>
                  <tbody>
                      {characters.map((char) => (
                          <tr key={char.id} className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <img src={char.imageUrl} alt={char.name} className="w-10 h-10 rounded-full object-cover"/>
                                      <div>
                                          <p className="font-semibold text-slate-900 dark:text-slate-100">{char.name}</p>
                                          <p className="text-xs text-slate-500">{char.age} ساله</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  {char.creatorId ? (
                                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">{userEmailMap[char.creatorId] || 'کاربر حذف شده'}</span>
                                  ) : (
                                      <span className="text-slate-500">سیستم</span>
                                  )}
                              </td>
                               <td className="px-6 py-4">
                                  {char.isPrivate ? (
                                      <span className="px-2 py-1 text-xs font-medium text-rose-800 bg-rose-100 dark:text-rose-200 dark:bg-rose-900/50 rounded-full">خصوصی</span>
                                  ) : (
                                      <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50 rounded-full">عمومی</span>
                                  )}
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1">
                                      {char.tags?.map(tag => (
                                          <span key={tag} className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                              {tag}
                                          </span>
                                      ))}
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                      <button onClick={() => handleOpenModal(char)} className="p-2 text-slate-500 hover:text-amber-500" title="ویرایش">
                                          <PencilIcon className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => handleDeleteCharacter(char.id)} className="p-2 text-slate-500 hover:text-red-500" title="حذف">
                                          <TrashIcon className="w-4 h-4" />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">کاربران ({users.length})</h2>
            <div className="h-[75vh] overflow-y-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-600 dark:text-slate-300 uppercase bg-slate-200 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">ایمیل کاربر</th>
                    <th scope="col" className="px-6 py-3">موجودی سکه</th>
                    <th scope="col" className="px-6 py-3">وضعیت اشتراک</th>
                    <th scope="col" className="px-6 py-3">مدیریت موجودی</th>
                    <th scope="col" className="px-6 py-3">مدیریت اشتراک</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                     const isPremium = user.subscription && user.subscription.expiresAt && new Date(user.subscription.expiresAt) > new Date();
                     const expiresAt = isPremium ? new Date(user.subscription!.expiresAt!).toLocaleDateString('fa-IR') : null;
                     const daysRemaining = calculateDaysRemaining(user.subscription?.expiresAt || null);

                    return (
                    <tr key={user.id} className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {user.email}
                      </th>
                      <td className="px-6 py-4">
                        {user.balance.toLocaleString('fa-IR')}
                      </td>
                      <td className="px-6 py-4">
                        {isPremium ? (
                            <div className="flex flex-col">
                                <span className="text-green-500 font-semibold">ویژه تا {expiresAt}</span>
                                <span className="text-xs text-slate-400">({daysRemaining} روز باقی مانده)</span>
                            </div>
                        ) : (
                            <span className="text-slate-500">عادی</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                value={balanceAmounts[user.id] || ''}
                                onChange={(e) => handleBalanceChange(user.id, e.target.value)}
                                placeholder="مقدار"
                                className="w-24 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-800 dark:text-slate-200"
                            />
                            <button onClick={() => handleUpdateBalance(user.id, 'add')} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">افزایش</button>
                            <button onClick={() => handleUpdateBalance(user.id, 'subtract')} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">کاهش</button>
                        </div>
                      </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                              <input 
                                  type="number"
                                  value={subscriptionDays[user.id] || ''}
                                  onChange={(e) => handleSubscriptionDaysChange(user.id, e.target.value)}
                                  placeholder="تعداد روز"
                                  className="w-20 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-800 dark:text-slate-200"
                              />
                              <button onClick={() => handleAddSubscriptionDays(user.id)} className="px-2 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 text-xs">افزودن</button>
                              {isPremium && (
                                <button onClick={() => handleRemoveSubscription(user.id)} className="p-1.5 rounded text-slate-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" title="حذف اشتراک">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    تاریخچه اقدامات ({auditLog.length})
                </h2>
                <div className="h-[75vh] overflow-y-auto">
                    {auditLog.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {auditLog.map(log => (
                                <li key={log.id} className="py-3 px-2">
                                    <p className="text-sm text-slate-800 dark:text-slate-200">{renderAuditLogMessage(log)}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {new Date(log.timestamp).toLocaleString('fa-IR')}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center pt-10">هیچ اقدامی برای نمایش وجود ندارد.</p>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'bans' && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              شناسه‌های مسدود شده ({bannedIdentifiers.length})
            </h2>
            <div className="h-[75vh] overflow-y-auto">
              {bannedIdentifiers.length > 0 ? (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {bannedIdentifiers.map(id => (
                    <li key={id} className="py-3 flex justify-between items-center">
                      <span className="font-mono text-sm text-slate-500 dark:text-slate-400 break-all">{id}</span>
                      <button
                        onClick={() => handleUnban(id)}
                        className="flex-shrink-0 ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-semibold"
                      >
                        رفع مسدودیت
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center pt-10">هیچ شناسه‌ی مسدود شده‌ای وجود ندارد.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {isModalOpen && (
        <CharacterEditorModal
          character={characterToEdit}
          onSave={handleSaveCharacter}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
