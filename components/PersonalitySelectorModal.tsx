import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, CheckIcon, SearchIcon } from './icons';

interface Option {
  value: string;
  emoji?: string;
}

interface PersonalitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string | string[]) => void;
  title: string;
  options: Option[];
  currentValue: string | string[];
  multiSelect?: boolean;
  maxSelect?: number;
  showSearch?: boolean;
  useShowMore?: boolean;
}

const ITEMS_THRESHOLD = 12;

const PersonalitySelectorModal: React.FC<PersonalitySelectorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  options,
  currentValue,
  multiSelect = false,
  maxSelect = 3,
  showSearch = false,
  useShowMore = false,
}) => {
  const [selection, setSelection] = useState<string | string[]>(currentValue);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Sync state when modal opens
    if (isOpen) {
      setSelection(currentValue);
      setSearchTerm('');
      setShowAll(false); // Reset on open
    }
  }, [isOpen, currentValue]);

  const handleSelect = (value: string) => {
    if (multiSelect && Array.isArray(selection)) {
      const newSelection = [...selection];
      const index = newSelection.indexOf(value);
      if (index > -1) {
        newSelection.splice(index, 1);
      } else if (newSelection.length < maxSelect) {
        newSelection.push(value);
      }
      setSelection(newSelection);
    } else {
      setSelection(value);
    }
  };

  const handleSave = () => {
    onSave(selection);
  };

  const filteredOptions = useMemo(() => {
    if (!showSearch || !searchTerm) {
      return options;
    }
    return options.filter(opt =>
      opt.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, showSearch]);

  const getButtonClass = (value: string) => {
    const isSelected = multiSelect
      ? (selection as string[]).includes(value)
      : selection === value;
    
    let baseClass = "relative w-full text-center p-3 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center gap-2";
    if (isSelected) {
      return `${baseClass} bg-slate-800 border-white text-white font-semibold`;
    }
    return `${baseClass} bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500`;
  };

  if (!isOpen) return null;

  const getVisibleOptions = (opts: Option[]) => {
      if (!useShowMore || showAll || searchTerm || opts.length <= ITEMS_THRESHOLD) {
          return opts;
      }
      return opts.slice(0, ITEMS_THRESHOLD);
  }

  const renderOptionsGrid = () => {
    let gridClass = 'flex flex-wrap gap-2 justify-center';
    if (title === "ویرایش رابطه") gridClass = 'grid grid-cols-3 sm:grid-cols-4 gap-2';
    
    if (title === "ویرایش تمایلات") {
        const selectedKinks = multiSelect ? (selection as string[]) : [];
        const unselectedOptions = filteredOptions.filter(opt => !selectedKinks.includes(opt.value));
        const unselectedToRender = getVisibleOptions(unselectedOptions);
        return (
            <>
                {selectedKinks.length > 0 && (
                     <div className="flex flex-wrap gap-2 p-2 border border-slate-700 rounded-md mb-4">
                        {selectedKinks.map(kink => (
                             <span key={kink} className="flex items-center gap-1.5 bg-slate-600 text-white pl-3 pr-2 py-1 text-sm font-semibold rounded-md">
                                {kink}
                                <button type="button" onClick={() => handleSelect(kink)} className="text-slate-300 hover:text-white">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                 <div className="flex flex-wrap gap-2 justify-center">
                    {unselectedToRender.map(opt => (
                        <button key={opt.value} onClick={() => handleSelect(opt.value)} className={getButtonClass(opt.value)}>
                            {opt.emoji && <span>{opt.emoji}</span>}
                            <span>{opt.value}</span>
                        </button>
                    ))}
                </div>
            </>
        );
    }

    const optionsToRender = getVisibleOptions(filteredOptions);
    return (
        <div className={gridClass}>
            {optionsToRender.map(opt => (
                <button key={opt.value} onClick={() => handleSelect(opt.value)} className={getButtonClass(opt.value)}>
                    {opt.emoji && <span className="text-lg">{opt.emoji}</span>}
                    <span className="text-sm font-medium">{opt.value}</span>
                    {selection === opt.value && !multiSelect &&
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-slate-900">
                          <CheckIcon className="w-4 h-4 text-rose-500" />
                      </div>
                    }
                </button>
            ))}
        </div>
    );
  };

  const listForButtonCheck = (multiSelect && title === 'ویرایش تمایلات')
      ? filteredOptions.filter(opt => !(selection as string[]).includes(opt.value))
      : filteredOptions;
  const shouldShowButton = useShowMore && !searchTerm && listForButtonCheck.length > ITEMS_THRESHOLD;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[70]"
      onClick={onClose}
    >
      <div
        className="bg-[#1C1C1E] text-white rounded-xl shadow-xl w-full max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {showSearch && (
            <div className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pr-4 pl-10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
          )}
          {renderOptionsGrid()}
        </div>

        {shouldShowButton && (
          <div className="px-6 py-4 border-t border-slate-800">
              <button onClick={() => setShowAll(prev => !prev)} className="w-full text-center p-3 rounded-lg border-2 border-slate-700 text-slate-400 bg-transparent hover:bg-slate-800 transition">
                  {showAll ? 'نمایش کمتر' : 'نمایش بیشتر'}
              </button>
          </div>
        )}

        <div className="bg-slate-900/50 p-4 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-white bg-[#3A3A3C] hover:bg-[#4A4A4C] font-semibold"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
          >
            ذخیره تغییرات
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalitySelectorModal;