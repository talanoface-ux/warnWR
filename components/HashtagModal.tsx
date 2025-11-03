import React, { useMemo } from 'react';
import { Character } from '../types';
import { XMarkIcon } from './icons';

interface HashtagModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onTagSelect: (tag: string) => void;
}

const HashtagModal: React.FC<HashtagModalProps> = ({ isOpen, onClose, characters, onTagSelect }) => {
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    characters.forEach(character => {
      character.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [characters]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">فیلتر بر اساس تگ</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <XMarkIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {allTags.length > 0 ? allTags.map(tag => (
              <button 
                key={tag}
                onClick={() => onTagSelect(tag)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full font-semibold hover:bg-rose-500 hover:text-white transition-colors duration-200"
              >
                #{tag}
              </button>
            )) : <p className="text-slate-500 dark:text-slate-400">تگی برای نمایش وجود ندارد.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashtagModal;
