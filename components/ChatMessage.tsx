import React from 'react';
import { Message, Role } from '../types';
import { UserCircleIcon, SparklesIcon, WalletIcon } from './icons';

interface ChatMessageProps {
  message: Message;
  onPurchaseClick: () => void;
  isPremium: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onPurchaseClick, isPremium }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`my-4 flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}>
      <div className={`flex w-full items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-rose-400" />
          </div>
        )}
        <div
          className={`max-w-xs md:max-w-md lg:max-w-lg shadow-md overflow-hidden flex flex-col ${
            isUser
              ? 'bg-blue-600 text-white rounded-2xl rounded-br-lg'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-lg'
          }`}
        >
          {message.imageIsLoading && (
            <div className="p-4">
                <div className="flex items-center justify-center space-x-2 space-x-reverse animate-pulse">
                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-rose-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-rose-400 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-sm mr-2 font-playpen font-medium">در حال ساختن عکس...</span>
                </div>
            </div>
          )}
          {message.imageUrl && !message.imageIsLoading && (
            <a href={message.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
                <img 
                    src={message.imageUrl} 
                    alt="تصویر ساخته شده توسط هوش مصنوعی"
                    className="w-full h-auto object-cover transition-opacity duration-300 opacity-0 animate-fade-in"
                    onLoad={(e) => e.currentTarget.style.opacity = '1'}
                />
            </a>
          )}
          {message.content && (
              <p className={`px-4 py-3 whitespace-pre-wrap break-words ${!isUser ? 'font-playpen font-medium' : ''}`}>
                  {message.content}
              </p>
          )}
          {message.action === 'purchase' && !isUser && (
              <div className="px-4 pb-3 pt-1">
                  <button
                      onClick={onPurchaseClick}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                  >
                      <WalletIcon className="w-5 h-5"/>
                      <span>خرید اشتراک</span>
                  </button>
              </div>
          )}
        </div>
        {isUser && (
           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <UserCircleIcon className="w-5 h-5 text-sky-400" />
          </div>
        )}
      </div>
      {!isUser && !isPremium && typeof message.cost === 'number' && message.cost > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1.5 ml-11">
              <WalletIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{message.cost.toLocaleString('fa-IR')} سکه کسر شد</span>
          </div>
      )}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatMessage;