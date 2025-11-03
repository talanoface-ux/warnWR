

import React, { useMemo, useState, useEffect } from 'react';
import { Character, Page, User } from '../types';
import { LogoutIcon, MenuIcon, XMarkIcon, WalletIcon, SparklesIcon, LockClosedIcon } from './icons';

interface LandingPageProps {
  onCharacterSelect: (character: Character) => void;
  characters: Character[];
  navigate: (page: Page) => void;
  navigateToAuth: (mode: 'login' | 'signup') => void;
  currentUser: User | null;
  onLogout: () => void;
  isAdmin: boolean;
  filterTag: string | null;
  setFilterTag: (tag: string | null) => void;
  setIsPurchaseModalOpen: (isOpen: boolean) => void;
}

const CharacterCard: React.FC<{ 
  character: Character; 
  onSelect: () => void;
  isAdmin: boolean;
}> = ({ character, onSelect, isAdmin }) => {
  const [isHovered, setIsHovered] = useState(false);

  const displayUrl = isHovered && character.gifUrl ? character.gifUrl : character.imageUrl;

  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-lg group aspect-[2/3] cursor-pointer"
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={displayUrl}
        alt={character.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
       {isAdmin && character.isPrivate && (
        <div className="absolute top-2 left-2 bg-rose-600/80 text-white p-1.5 rounded-full backdrop-blur-sm" title="شخصیت خصوصی">
          <LockClosedIcon className="w-4 h-4" />
        </div>
      )}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
      />
      <div className="absolute bottom-0 left-0 p-4 text-white w-full">
        <h3 className="text-xl font-bold">{character.name}, {character.age}</h3>
        {character.roleplayDescription && (
            <p className="text-sm mt-1 text-slate-200 line-clamp-2 font-playpen">
                {character.roleplayDescription}
            </p>
        )}
      </div>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onCharacterSelect, characters, navigate, navigateToAuth, currentUser, onLogout, isAdmin, filterTag, setFilterTag, setIsPurchaseModalOpen }) => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  useEffect(() => {
    // Preload GIFs to ensure they play instantly on hover.
    // This creates new Image objects in memory, causing the browser to
    // fetch and cache them without rendering them to the DOM.
    characters.forEach(character => {
      if (character.gifUrl) {
        const img = new Image();
        img.src = character.gifUrl;
      }
    });
  }, [characters]);

  useEffect(() => {
    if (sessionStorage.getItem('devBannerDismissed') === 'true') {
      setIsBannerVisible(false);
    }
  }, []);

  const handleDismissBanner = () => {
    sessionStorage.setItem('devBannerDismissed', 'true');
    setIsBannerVisible(false);
  };

  const filteredCharacters = useMemo(() => {
    const viewableCharacters = characters.filter(c => {
        if (isAdmin) return true; // Admin sees all
        // Public characters (isPrivate=false) are visible to everyone
        if (!c.isPrivate) return true; 
        // If the character is private, only show it if the current user is the creator
        if (currentUser && c.creatorId === currentUser.id) return true;
        return false;
    });

    if (!filterTag) return viewableCharacters;
    return viewableCharacters.filter(c => c.tags?.includes(filterTag));
  }, [characters, filterTag, isAdmin, currentUser]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="sticky top-0 z-40 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                    <div className="text-slate-400 dark:text-slate-600">
                        <MenuIcon className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-rose-500 tracking-wider">
                        ایران پارتنر
                    </h1>
                </div>

                <div className="hidden md:flex items-center">
                   <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                      اولین پارتنر مجازی ایران
                   </p>
                </div>

                <div className="flex items-center gap-3">
                    {currentUser ? (
                        <>
                            {isAdmin && (
                                <button 
                                    onClick={() => navigate('admin')}
                                    className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition hidden sm:block"
                                >
                                    پنل ادمین
                                </button>
                            )}
                            <button 
                                onClick={() => setIsPurchaseModalOpen(true)}
                                className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-full transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                                title="خرید سکه"
                            >
                                <WalletIcon className="w-5 h-5 text-amber-500" />
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    {currentUser.balance.toLocaleString('fa-IR')}
                                </span>
                            </button>
                            <button 
                                onClick={() => navigate('profile')}
                                className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition hidden sm:block border border-slate-300 dark:border-slate-600"
                            >
                                پروفایل
                            </button>
                            <button 
                                onClick={onLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-rose-600 text-white rounded-full hover:bg-rose-700 transition"
                            >
                                <LogoutIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">خروج</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigateToAuth('login')}
                                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-500 transition"
                            >
                                ورود
                            </button>
                            <button 
                                onClick={() => navigateToAuth('signup')}
                                className="px-5 py-2 text-sm font-semibold bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-transform hover:scale-105"
                            >
                                ثبت نام و دریافت سکه رایگان
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {isBannerVisible && (
          <div className="mb-8 p-4 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-lg text-center relative shadow-sm">
              <div className="flex items-center justify-center gap-3">
                  <SparklesIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                  <p className="text-sm md:text-base text-indigo-800 dark:text-indigo-200">
                  وب‌سایت در حال توسعه اولیه است و به زودی ویژگی‌های جدید و پیشرفت‌های زیادی اضافه خواهد شد. 
                  پیشنهادات خود را از طریق <a href="https://t.me/iranpartnersup" target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">پشتیبانی تلگرام</a> برای ما ارسال کنید
                  </p>
              </div>
              <button 
              onClick={handleDismissBanner} 
              className="absolute top-2 right-2 p-1.5 rounded-full text-indigo-500 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
              aria-label="بستن اعلان"
              >
              <XMarkIcon className="w-5 h-5" />
              </button>
          </div>
        )}

        {filterTag && (
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-4 py-2 rounded-full">
              <span className="font-semibold">فیلتر فعال: #{filterTag}</span>
              <button onClick={() => setFilterTag(null)} className="p-1 rounded-full hover:bg-rose-200 dark:hover:bg-rose-800 transition">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {filteredCharacters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              onSelect={() => onCharacterSelect(char)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </main>

      <footer className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
        <div>
          <button onClick={() => navigate('admin')} className="hover:text-rose-400 transition-colors">
            ورود به پنل ادمین
          </button>
          <span className="mx-2">|</span>
           <button onClick={() => navigate('privacy')} className="hover:text-rose-400 transition-colors">
            حریم خصوصی و شرایط
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;