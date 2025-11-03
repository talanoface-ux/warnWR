import React, { useState, useRef, useEffect, useMemo } from 'react';
// FIX: Imported Personality and SafetyLevel to resolve 'Cannot find name' errors.
import { Page, Message, Role, Conversation, Character, User, Personality, SafetyLevel } from '../types';
import { getChatResponse } from '../services/geminiService';
import { generateImage } from '../services/imageService';
import ChatMessage from './ChatMessage';
import CharacterEditorModal from './CharacterEditorModal';
import useLocalStorage from '../hooks/useLocalStorage';
import { 
    SendIcon, SparklesIcon, ArrowLeftIcon, SearchIcon, 
    SidebarRightIcon, XMarkIcon, PencilIcon, TrashIcon,
    SpeakerWaveIcon, SpeakerXMarkIcon, MenuIcon, WalletIcon,
    ImageIcon
} from './icons';

interface ChatPageProps {
  navigate: (page: Page) => void;
  character: Character | null; // The character selected from landing page to start a new chat
  characters: Character[];
  setCharacterToChat: (character: Character | null) => void;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  isAdmin: boolean;
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  setIsPurchaseModalOpen: (isOpen: boolean) => void;
}


// --- Sub-components defined within ChatPage.tsx ---

const ConversationList: React.FC<{
    conversations: Conversation[];
    characters: Character[];
    activeConversationId: string | null;
    onSelect: (id: string) => void;
}> = ({ conversations, characters, activeConversationId, onSelect }) => {
    const getCharacter = (id?: string) => characters.find(c => c.id === id);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-800/50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">چت‌ها</h2>
                </div>
                <div className="relative">
                    <input type="text" placeholder="جستجوی پروفایل..." className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-rose-500 focus:border-rose-500" />
                    <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => {
                    const char = getCharacter(conv.characterId);
                    if (!char) return null;
                    const lastMessage = conv.messages[conv.messages.length - 1];
                    const unreadCount = conv.messages.filter(m => m.role === Role.ASSISTANT && !m.isRead).length;

                    return (
                        <div key={conv.id} onClick={() => onSelect(conv.id)}
                             className={`group flex items-center justify-between gap-3 p-3 cursor-pointer border-r-4 transition-colors ${activeConversationId === conv.id ? 'bg-slate-200 dark:bg-slate-700 border-rose-500' : 'border-transparent hover:bg-slate-200/60 dark:hover:bg-slate-700/60'}`}>
                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                <img src={char.imageUrl} alt={char.name} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{char.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{lastMessage?.content || '...'}</p>
                                </div>
                            </div>
                             {unreadCount > 0 && (
                                <span className="flex-shrink-0 flex items-center justify-center h-5 min-w-[1.25rem] px-1 bg-rose-600 text-white text-xs font-bold rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const CharacterProfile: React.FC<{ character: Character | null; onStartChat?: () => void; }> = ({ character, onStartChat }) => {
    if (!character) return <div className="p-6 text-center text-slate-500 dark:text-slate-400">شخصیتی انتخاب نشده است.</div>;
    
    const [activeImage, setActiveImage] = useState(character.gifUrl || character.imageUrl);

    useEffect(() => {
        // Reset to main image (or gif) when character changes
        setActiveImage(character.gifUrl || character.imageUrl);
    }, [character]);

    const allImages = useMemo(() => {
        // Create a unique set of images, with the gifUrl always first if it exists.
        if (!character) return [];
        const imageList: string[] = [];
        
        if (character.gifUrl) {
            imageList.push(character.gifUrl);
        }
        imageList.push(character.imageUrl);
        if (character.gallery) {
            imageList.push(...character.gallery);
        }

        const imageSet = new Set(imageList);
        return Array.from(imageSet);
    }, [character]);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-800/50 p-4 overflow-y-auto">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 shadow-lg">
                <img src={activeImage} alt={character.name} className="w-full h-full object-cover transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            {allImages.length > 1 && (
                <div className="flex space-x-2 space-x-reverse mb-4 overflow-x-auto pb-2 -mx-4 px-4">
                    {allImages.map((img, index) => (
                        <button key={index} onClick={() => setActiveImage(img)} className="flex-shrink-0">
                            <img 
                                src={img} 
                                alt={`Thumbnail ${index + 1}`}
                                className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition-all ${
                                    activeImage === img ? 'border-rose-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            )}

             {onStartChat && (
                 <button
                    onClick={onStartChat}
                    className="w-full mb-4 bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 transition lg:hidden"
                >
                    چت کنید
                </button>
            )}
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{character.name}</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{character.bio}</p>
            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">درباره من:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg">
                        <p className="text-slate-500 dark:text-slate-400">سن</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{character.age}</p>
                    </div>
                    {character.bodyType && (
                      <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg">
                          <p className="text-slate-500 dark:text-slate-400">اندام</p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{character.bodyType}</p>
                      </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main ChatPage Component ---

const ChatPage: React.FC<ChatPageProps> = ({ navigate, character, characters, setCharacterToChat, currentUser, setCurrentUser, setUsers, conversations, setConversations, isAdmin, setCharacters, setIsPurchaseModalOpen }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useLocalStorage('ai-chat-muted', false);
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);
  const [isImagePrompt, setIsImagePrompt] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('auth');
    }
  }, [currentUser, navigate]);

  const isPremium = useMemo(() => {
    if (!currentUser) return false;
    return !!(currentUser.subscription?.expiresAt && new Date(currentUser.subscription.expiresAt) > new Date());
  }, [currentUser]);

  const userConversations = useMemo(() => {
    if (!currentUser) return [];
    return conversations
      .filter(c => c.userId === currentUser.id)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [conversations, currentUser]);

  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId);
  }, [conversations, activeConversationId]);
  
  const activeCharacter = useMemo(() => {
      if (!activeConversation) return null;
      return characters.find(c => c.id === activeConversation.characterId);
  }, [activeConversation, characters]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const promptOpen = sessionStorage.getItem('promptOpenChatList');
    if (promptOpen === 'true') {
      sessionStorage.removeItem('promptOpenChatList');
      // Tailwind's 'md' breakpoint is 768px.
      if (window.innerWidth < 768) {
        setIsConversationListOpen(true);
      }
    }
  }, []); // Run only on component mount

  // Effect to mark messages as read when a conversation is active
  useEffect(() => {
    if (activeConversation) {
      const messagesToUpdate = activeConversation.messages.filter(
        m => m.role === Role.ASSISTANT && !m.isRead
      );

      if (messagesToUpdate.length > 0) {
        setConversations(prev => 
            prev.map(c => 
                c.id === activeConversation.id 
                ? { ...c, messages: c.messages.map(m => 
                        (!m.isRead && m.role === Role.ASSISTANT) ? { ...m, isRead: true } : m
                      ) 
                } 
                : c
            )
        );
      }
    }
  }, [activeConversation, setConversations]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    if (isMuted) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1500, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.error("Failed to play sound:", error);
    }
  };
  
  const startNewChatWithCharacter = (char: Character) => {
    if (!currentUser) return;
    const existingConv = conversations.find(c => c.characterId === char.id && c.userId === currentUser.id);
    if (existingConv) {
        setActiveConversationId(existingConv.id);
        return;
    }

    const newConversation: Conversation = {
      id: `conv_${char.id}_${Date.now()}`,
      title: `چت با ${char.name}`,
      messages: [],
      personality: Personality.FRIENDLY,
      systemPrompt: char.systemPrompt,
      safetyLevel: SafetyLevel.DEFAULT,
      lastUpdated: new Date().toISOString(),
      characterId: char.id,
      userId: currentUser.id,
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };
  
  useEffect(() => {
    if (character) { // If a character was passed from landing page
      startNewChatWithCharacter(character);
      setCharacterToChat(null); // Reset the character to chat prop
    } else if (!activeConversationId && userConversations.length > 0) {
      setActiveConversationId(userConversations[0].id)
    } else if (userConversations.length === 0 && !character) {
        navigate('landing');
    }
  }, [character, userConversations, activeConversationId, navigate, setCharacterToChat]);
  
  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const addMessageToConversation = (newMessage: Message) => {
    if (!activeConversationId) return;
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, newMessage], lastUpdated: new Date().toISOString() }
          : c
      )
    );
  };

  const calculateMessageCost = (responseText: string): number => {
    const lineCount = responseText.split('\n').length;

    if (lineCount < 6) return 1;
    if (lineCount <= 10) return 2;
    
    const len = responseText.length;
    if (len <= 750) return 3;
    if (len <= 1500) return 5;
    return 10;
  };

  const handleSendMessage = async () => {
    if (!activeConversation || !currentUser) return;

    const trimmedInput = input.trim();
    if (trimmedInput === '' || isLoading) return;
    
    // New Image Generation Flow
    if (isImagePrompt) {
        setInput('');
        setIsImagePrompt(false);
        setIsLoading(true);

        const userPromptMessage: Message = {
            id: `msg_img_prompt_${Date.now()}`,
            role: Role.USER,
            content: `[ساخت عکس] ${trimmedInput}`,
            timestamp: new Date().toISOString(),
        };
        addMessageToConversation(userPromptMessage);
        
        if (!isPremium) {
            // Non-premium user flow: show blurred image and upgrade prompt
            addMessageToConversation({
                id: `msg_blur_${Date.now()}`,
                role: Role.ASSISTANT,
                imageUrl: 'https://github.com/talanoface-ux/imgesss/blob/main/n$%25nW%23%25w4.jpg?raw=true',
                timestamp: new Date().toISOString(),
            });
            addMessageToConversation({
                id: `msg_upgrade_${Date.now() + 1}`,
                role: Role.ASSISTANT,
                content: 'برای مشاهده عکس بدون تاری و ساخت تصاویر نامحدود، اشتراک خود را فعال کنید.',
                timestamp: new Date().toISOString(),
                action: 'purchase',
            });
            setIsLoading(false);
        } else {
            // Premium user flow: generate the actual image
            const imagePrompt = trimmedInput;
            
            const placeholderId = `img_loading_${Date.now()}`;
            addMessageToConversation({
                id: placeholderId,
                role: Role.ASSISTANT,
                imageIsLoading: true,
                timestamp: new Date().toISOString(),
            });

            try {
                const imageUrl = await generateImage(imagePrompt);
                setConversations(prev => prev.map(c => 
                    c.id === activeConversationId ? {
                        ...c,
                        messages: c.messages.map(m => m.id === placeholderId ? { ...m, imageIsLoading: false, imageUrl: imageUrl } : m),
                        lastUpdated: new Date().toISOString()
                    } : c
                ));
            } catch (error) {
                console.error("Image generation failed:", error);
                setConversations(prev => prev.map(c => 
                    c.id === activeConversationId ? {
                        ...c,
                        messages: c.messages.map(m => m.id === placeholderId ? { ...m, imageIsLoading: false, content: `متاسفانه ساخت عکس با مشکل مواجه شد: ${(error as Error).message}` } : m),
                        lastUpdated: new Date().toISOString()
                    } : c
                ));
            } finally {
                setIsLoading(false);
            }
        }
        return; // End image generation flow here
    }

    // Normal Chat Flow
    if (!isPremium && currentUser.balance <= 0) {
        addMessageToConversation({
            id: `msg_error_${Date.now()}`,
            role: Role.ASSISTANT,
            content: 'موجودی سکه شما برای ارسال پیام کافی نیست. برای چت نامحدود، اشتراک ویژه تهیه کنید.',
            timestamp: new Date().toISOString(),
            action: 'purchase',
        });
        return;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: Role.USER,
      content: trimmedInput,
      timestamp: new Date().toISOString(),
    };
    
    const tempConversation = {
        ...activeConversation,
        messages: [...activeConversation.messages, userMessage]
    };

    addMessageToConversation(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const geminiResult = await getChatResponse(tempConversation.messages, activeConversation.systemPrompt, activeConversation.safetyLevel);
      
      if (geminiResult.text) {
          if (isPremium) {
                addMessageToConversation({
                    id: `msg_${Date.now() + 1}`,
                    role: Role.ASSISTANT,
                    content: geminiResult.text,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                });
          } else {
                const messageCost = calculateMessageCost(geminiResult.text);
                const newBalance = currentUser.balance - messageCost;
                const updatedUser = { ...currentUser, balance: Math.max(0, newBalance) };
                setCurrentUser(updatedUser);
                setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
                
                addMessageToConversation({
                    id: `msg_${Date.now() + 1}`,
                    role: Role.ASSISTANT,
                    content: geminiResult.text,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    cost: messageCost,
                });
          }
          playNotificationSound();
      }
    } catch (error) {
      console.error(error);
      addMessageToConversation({
        id: `msg_${Date.now() + 1}`,
        role: Role.ASSISTANT,
        content: (error as Error).message || 'متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.',
        timestamp: new Date().toISOString(),
      });
      playNotificationSound();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveCharacter = (updatedCharacter: Character) => {
    setCharacters(prev => prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
    if (activeConversation && activeConversation.systemPrompt !== updatedCharacter.systemPrompt) {
        setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, systemPrompt: updatedCharacter.systemPrompt } : c));
    }
    setIsEditorOpen(false);
  };

  const handleDeleteConversation = (idToDelete: string) => {
    if (window.confirm("آیا از حذف کامل این مکالمه و تمام حافظه آن مطمئن هستید؟ این عمل غیرقابل بازگشت است.")) {
        setConversations(prevConversations => prevConversations.filter(c => c.id !== idToDelete));
        
        if (!currentUser) return;

        if (activeConversationId === idToDelete) {
            const remainingUserConversations = conversations
                .filter(c => c.id !== idToDelete && c.userId === currentUser.id)
                .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

            if (remainingUserConversations.length > 0) {
                setActiveConversationId(remainingUserConversations[0].id);
            } else {
                navigate('landing');
            }
        }
    }
  };
  
  if (!currentUser) {
      return <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-900"><p>در حال انتقال...</p></div>;
  }
  
  if (userConversations.length === 0 && !character) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-900">
          <p className="text-slate-500 dark:text-slate-400">هنوز مکالمه‌ای ندارید. برای انتخاب شخصیت به صفحه اصلی بازگردید.</p>
          <button onClick={() => navigate('landing')} className="ml-4 px-4 py-2 bg-rose-600 rounded">صفحه اصلی</button>
        </div>
      );
  }

  if (!activeConversation || !activeCharacter) {
    return <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-900"><p>...در حال بارگذاری</p></div>
  }

  const lastMessageIsFromUser = activeConversation.messages[activeConversation.messages.length - 1]?.role === Role.USER;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        {/* Mobile Conversation List Panel */}
        <div 
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${
            isConversationListOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsConversationListOpen(false)}
          aria-hidden="true"
        ></div>
        <div 
          className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-slate-100 dark:bg-slate-800 z-50 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
            isConversationListOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
        >
          <ConversationList 
            conversations={userConversations}
            characters={characters}
            activeConversationId={activeConversationId}
            onSelect={(id) => {
              setActiveConversationId(id);
              setIsConversationListOpen(false);
            }}
          />
        </div>

        {/* Left Sidebar: Conversations */}
        <div className="w-full md:w-1/4 xl:w-1/5 border-r border-slate-200 dark:border-slate-700 hidden md:block">
            <ConversationList 
                conversations={userConversations}
                characters={characters}
                activeConversationId={activeConversationId}
                onSelect={setActiveConversationId}
            />
        </div>

        {/* Center: Chat Panel */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 min-w-0">
            {/* Chat Header */}
            <header className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsConversationListOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition md:hidden" aria-label="فهرست چت‌ها">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <img src={activeCharacter.imageUrl} alt={activeCharacter.name} className="w-10 h-10 rounded-full object-cover" />
                    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{activeCharacter.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {currentUser && (
                        <button
                            onClick={() => setIsPurchaseModalOpen(true)}
                            className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-full transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                            title="خرید اشتراک یا سکه"
                        >
                            <WalletIcon className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {currentUser.balance.toLocaleString('fa-IR')}
                            </span>
                        </button>
                    )}
                    {isAdmin && (
                        <button onClick={() => setIsEditorOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition" title="ویرایش شخصیت">
                            <PencilIcon className="w-5 h-5 text-amber-400" />
                        </button>
                    )}
                    <button 
                        onClick={() => setIsMuted(!isMuted)} 
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition" 
                        title={isMuted ? "روشن کردن صدا" : "بی‌صدا کردن"}
                    >
                        {isMuted ? <SpeakerXMarkIcon className="w-5 h-5 text-slate-500" /> : <SpeakerWaveIcon className="w-5 h-5 text-slate-500" />}
                    </button>
                    <button 
                        onClick={() => handleDeleteConversation(activeConversation.id)} 
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition" 
                        title="حذف این چت"
                    >
                        <TrashIcon className="w-5 h-5 text-red-400" />
                    </button>
                    <button onClick={() => setShowProfile(!showProfile)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        <SidebarRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeConversation.messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
                        <SparklesIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4"/>
                        <p className="text-lg">این شروع چت شما با {activeCharacter.name} است.</p>
                        <p>برای شروع گفتگو، یک پیام ارسال کنید!</p>
                    </div>
                )}
                {activeConversation.messages.map(msg => <ChatMessage key={msg.id} message={msg} onPurchaseClick={() => setIsPurchaseModalOpen(true)} isPremium={isPremium} />)}
                {isLoading && lastMessageIsFromUser && (
                  <div className="flex items-start gap-3 my-4 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-rose-400 animate-pulse" />
                    </div>
                    <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-bl-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-end mb-2">
                    <button 
                        onClick={() => setIsImagePrompt(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                    >
                        <ImageIcon className="w-4 h-4 text-rose-400" />
                        <span>ساخت عکس</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 flex items-center bg-slate-200 dark:bg-slate-700 rounded-full pr-4">
                        {isImagePrompt && (
                            <span className="flex-shrink-0 flex items-center gap-1.5 mr-[-8px] ml-2 px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded-full animate-fade-in-short">
                                ساخت عکس
                                <button onClick={() => { setIsImagePrompt(false); setInput(''); }} className="text-rose-100 hover:text-white">
                                    <XMarkIcon className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        )}
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder={isImagePrompt ? 'توضیحات عکس را بنویسید...' : 'پیام خود را بنویسید...'}
                            className="w-full pl-4 py-2 bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none resize-none placeholder:text-slate-500 dark:placeholder:text-slate-400"
                            rows={1}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || input.trim() === ''}
                        className="p-2.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
                <style>{`
                    @keyframes fade-in-short {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in-short {
                        animation: fade-in-short 0.2s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
        
        {/* Mobile Profile Sidebar Panel */}
        <div 
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${
            showProfile ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setShowProfile(false)}
          aria-hidden="true"
        ></div>
        <div 
          className={`fixed top-0 right-0 h-full w-4/5 max-w-sm z-50 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
            showProfile ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
        >
          <CharacterProfile character={activeCharacter} onStartChat={() => setShowProfile(false)} />
          {/* Close button on top of the panel content */}
          <div className="absolute top-2 right-2 z-10">
              <button 
                onClick={() => setShowProfile(false)} 
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition text-white"
                aria-label="بستن پروفایل"
              >
                  <XMarkIcon className="w-6 h-6" />
              </button>
          </div>
        </div>

        {/* Right Sidebar: Character Profile (Desktop) */}
        {showProfile && (
            <div className="w-1/4 xl:w-1/5 border-l border-slate-200 dark:border-slate-700 hidden lg:block">
                <CharacterProfile character={activeCharacter} />
            </div>
        )}
        
        {isEditorOpen && activeCharacter && (
            <CharacterEditorModal 
                character={activeCharacter}
                onSave={handleSaveCharacter}
                onClose={() => setIsEditorOpen(false)}
            />
        )}
    </div>
  );
};

export default ChatPage;