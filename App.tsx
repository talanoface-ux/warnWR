
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import LandingPage from './components/LandingPage';
import ChatPage from './components/ChatPage';
import AdminDashboard from './components/AdminDashboard';
import PrivacyPage from './components/PrivacyPage';
import AuthPage from './components/AuthPage';
import UserProfilePage from './components/UserProfilePage';
import PurchaseModal from './components/PurchaseModal';
import SupportModal from './components/SupportModal';
import LoginPromptModal from './components/LoginPromptModal';
import BannedPage from './components/BannedPage';
import CharacterCreatorWizard from './components/CharacterCreatorWizard';
import PremiumFeatureModal from './components/PremiumFeatureModal';
import { Page, Character, User, Conversation, AuditLogEntry } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { characters as defaultCharacters } from './data/characters';
import GlobalSidebar from './components/GlobalSidebar';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  
  // User Management State
  const [users, setUsers] = useLocalStorage<User[]>('ai-users', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('ai-currentUser', null);
  
  // Character and Conversation State
  const [characterToChat, setCharacterToChat] = useState<Character | null>(null);
  const [characters, setCharacters] = useLocalStorage<Character[]>('ai-characters', defaultCharacters);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('ai-conversations', []);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [bannedIdentifiers, setBannedIdentifiers] = useLocalStorage<string[]>('ai-banned-ids', []);
  const [visitorId] = useLocalStorage<string>('ai-visitor-id', `visitor_${Date.now()}_${Math.random()}`);
  const [auditLog, setAuditLog] = useLocalStorage<AuditLogEntry[]>('ai-audit-log', []);
  
  // Theme State
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  // Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLoginPromptModalOpen, setIsLoginPromptModalOpen] = useState(false);
  const [loginPromptPurpose, setLoginPromptPurpose] = useState<'chat' | 'create'>('chat');
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  
  // Auth page initial mode state
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'signup'>('login');
  
  const isBanned = useMemo(() => bannedIdentifiers.includes(visitorId), [bannedIdentifiers, visitorId]);

  const isPremium = useMemo(() => {
    if (!currentUser) return false;
    return !!(currentUser.subscription?.expiresAt && new Date(currentUser.subscription.expiresAt) > new Date());
  }, [currentUser]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const navigate = useCallback((page: Page) => {
    // When navigating to auth page generally, default to login mode.
    if (page === 'auth') {
      setInitialAuthMode('login');
    }
    setCurrentPage(page);
  }, []);
  
  // Specific navigation for auth page to set mode
  const navigateToAuth = (mode: 'login' | 'signup') => {
    setInitialAuthMode(mode);
    setCurrentPage('auth');
  };

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setIsAdmin(false); // Also log out from admin
    navigate('landing');
  }, [setCurrentUser, navigate]);

  const handleCharacterSelect = (character: Character) => {
    if (!currentUser) {
      setLoginPromptPurpose('chat');
      setIsLoginPromptModalOpen(true);
    } else {
      setCharacterToChat(character);
      navigate('chat');
    }
  };

  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return conversations
      .filter(c => c.userId === currentUser.id)
      .reduce((count, conversation) => {
        const unreadInConv = conversation.messages.filter(
            message => message.role === 'assistant' && message.isRead === false
        ).length;
        return count + unreadInConv;
    }, 0);
  }, [conversations, currentUser]);
  
  const handleOpenCreateCharacter = () => {
    if (!currentUser) {
        setLoginPromptPurpose('create');
        setIsLoginPromptModalOpen(true);
    } else if (!isPremium) {
        setIsPremiumModalOpen(true);
    } else {
        navigate('character-creator');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage 
                  onCharacterSelect={handleCharacterSelect} 
                  characters={characters} 
                  navigate={navigate}
                  navigateToAuth={navigateToAuth}
                  currentUser={currentUser} 
                  onLogout={handleLogout} 
                  isAdmin={isAdmin}
                  filterTag={filterTag}
                  setFilterTag={setFilterTag} 
                  setIsPurchaseModalOpen={setIsPurchaseModalOpen}
                />;
      case 'chat':
        return <ChatPage 
                  navigate={navigate} 
                  character={characterToChat} 
                  characters={characters}
                  setCharacterToChat={setCharacterToChat}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  setUsers={setUsers}
                  conversations={conversations}
                  setConversations={setConversations}
                  isAdmin={isAdmin}
                  setCharacters={setCharacters}
                  setIsPurchaseModalOpen={setIsPurchaseModalOpen}
                />;
      case 'admin':
        return <AdminDashboard 
                  navigate={navigate} 
                  setIsAdmin={setIsAdmin} 
                  isAdmin={isAdmin} 
                  characters={characters} 
                  setCharacters={setCharacters}
                  users={users}
                  setUsers={setUsers}
                  conversations={conversations}
                  setConversations={setConversations}
                  bannedIdentifiers={bannedIdentifiers}
                  setBannedIdentifiers={setBannedIdentifiers}
                  visitorId={visitorId}
                  auditLog={auditLog}
                  setAuditLog={setAuditLog}
                />;
      case 'privacy':
        return <PrivacyPage navigate={navigate} />;
      case 'auth':
        return <AuthPage 
                  navigate={navigate} 
                  users={users} 
                  setUsers={setUsers} 
                  setCurrentUser={setCurrentUser} 
                  initialMode={initialAuthMode}
                  setAuditLog={setAuditLog}
                />;
      case 'profile':
        return <UserProfilePage 
                  navigate={navigate} 
                  currentUser={currentUser} 
                  onLogout={handleLogout} 
                  setIsPurchaseModalOpen={setIsPurchaseModalOpen}
                  setIsSupportModalOpen={setIsSupportModalOpen}
                />;
      case 'character-creator':
        return <CharacterCreatorWizard
                  navigate={navigate}
                  currentUser={currentUser}
                  setCharacters={setCharacters}
                />;
      default:
        return <LandingPage 
                  onCharacterSelect={handleCharacterSelect} 
                  characters={characters} 
                  navigate={navigate}
                  navigateToAuth={navigateToAuth}
                  currentUser={currentUser} 
                  onLogout={handleLogout} 
                  isAdmin={isAdmin}
                  filterTag={filterTag}
                  setFilterTag={setFilterTag}
                  setIsPurchaseModalOpen={setIsPurchaseModalOpen}
                />;
    }
  };

  if (isBanned) {
    return <BannedPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {currentPage !== 'character-creator' && (
         <GlobalSidebar 
            navigate={navigate} 
            currentPage={currentPage} 
            theme={theme} 
            toggleTheme={toggleTheme} 
            unreadCount={unreadCount}
            characters={characters}
            setFilterTag={setFilterTag} 
            openSupportModal={() => setIsSupportModalOpen(true)}
            currentUser={currentUser}
            openCreateCharacterModal={handleOpenCreateCharacter}
          />
      )}
      <main className={currentPage !== 'character-creator' ? "pl-20" : ""}>
        {renderPage()}
      </main>
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        setUsers={setUsers}
      />
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />
      <LoginPromptModal
        isOpen={isLoginPromptModalOpen}
        onClose={() => setIsLoginPromptModalOpen(false)}
        onLogin={() => {
          setIsLoginPromptModalOpen(false);
          navigateToAuth('login');
        }}
        onSignup={() => {
          setIsLoginPromptModalOpen(false);
          navigateToAuth('signup');
        }}
        purpose={loginPromptPurpose}
      />
      <PremiumFeatureModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={() => {
            setIsPremiumModalOpen(false);
            setIsPurchaseModalOpen(true);
        }}
      />
    </div>
  );
};

export default App;
