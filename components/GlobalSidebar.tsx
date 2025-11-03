import React, { useState } from 'react';
import { Page, Character, User } from '../types';
import { HomeIcon, ChatBubbleIcon, TelegramIcon, SunIcon, MoonIcon, HashtagIcon, PhoneIcon, UserPlusIcon } from './icons';
import HashtagModal from './HashtagModal';

interface GlobalSidebarProps {
  navigate: (page: Page) => void;
  currentPage: Page;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  unreadCount: number;
  characters: Character[];
  setFilterTag: (tag: string | null) => void;
  openSupportModal: () => void;
  currentUser: User | null;
  openCreateCharacterModal: () => void;
}

const SidebarIcon: React.FC<{
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  href?: string;
  isActive?: boolean;
  badgeCount?: number;
}> = ({ icon, text, onClick, href, isActive = false, badgeCount = 0 }) => {
  const commonClasses =
    'relative group flex items-center justify-center h-12 w-12 my-2 rounded-2xl transition-all duration-300 ease-in-out cursor-pointer';
  const activeClasses = 'bg-rose-600 text-white rounded-xl';
  const inactiveClasses = 'bg-slate-700 text-slate-400 hover:bg-rose-600 hover:text-white hover:rounded-xl';

  const content = (
    <>
      {icon}
      {badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
      <span className="absolute left-full ml-4 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-slate-800 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-50">
        {text}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${commonClasses} ${inactiveClasses}`}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {content}
    </button>
  );
};


const GlobalSidebar: React.FC<GlobalSidebarProps> = ({ navigate, currentPage, theme, toggleTheme, unreadCount, characters, setFilterTag, openSupportModal, currentUser, openCreateCharacterModal }) => {
  const [isHashtagModalOpen, setIsHashtagModalOpen] = useState(false);
  const isChatActive = currentPage === 'chat';
  const isHomeActive = currentPage === 'landing';
  
  const handleChatClick = () => {
    // Set a flag for the chat page to open the conversation list on mobile
    sessionStorage.setItem('promptOpenChatList', 'true');
    navigate('chat');
  };

  const handleTagSelect = (tag: string) => {
    setFilterTag(tag);
    navigate('landing');
    setIsHashtagModalOpen(false);
  };

  const handleHomeClick = () => {
    setFilterTag(null);
    navigate('landing');
  }

  return (
    <>
      <nav className="fixed top-0 left-0 h-screen w-20 flex flex-col items-center bg-slate-800 dark:bg-slate-900 text-white shadow-lg z-50">
          <div className="flex flex-col items-center mt-4">
              <SidebarIcon 
                  icon={<HomeIcon className="h-6 w-6" />} 
                  text="خانه" 
                  onClick={handleHomeClick}
                  isActive={isHomeActive}
              />
               <SidebarIcon 
                  icon={<ChatBubbleIcon className="h-6 w-6" />} 
                  text="چت‌ها" 
                  onClick={handleChatClick}
                  isActive={isChatActive}
                  badgeCount={unreadCount}
              />
              <SidebarIcon 
                  icon={<HashtagIcon className="h-6 w-6" />}
                  text="تگ‌ها"
                  onClick={() => setIsHashtagModalOpen(true)}
              />
              <SidebarIcon
                  icon={<UserPlusIcon className="h-7 w-7" />}
                  text="ساخت شخصیت"
                  onClick={openCreateCharacterModal}
              />
          </div>

          <div className="flex flex-col items-center mt-auto mb-4">
               <SidebarIcon 
                  icon={<PhoneIcon className="h-6 w-6" />}
                  text="پشتیبانی"
                  onClick={openSupportModal}
              />
               <SidebarIcon 
                  icon={theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                  text={theme === 'light' ? 'حالت تاریک' : 'حالت روشن'} 
                  onClick={toggleTheme}
              />
               <SidebarIcon 
                  icon={<TelegramIcon className="h-6 w-6" />} 
                  text="تلگرام" 
                  href="https://t.me/IranPartnerORG"
              />
          </div>
      </nav>
      <HashtagModal
        isOpen={isHashtagModalOpen}
        onClose={() => setIsHashtagModalOpen(false)}
        characters={characters}
        onTagSelect={handleTagSelect}
      />
    </>
  );
};

export default GlobalSidebar;