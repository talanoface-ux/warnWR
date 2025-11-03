import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import { XMarkIcon } from './icons';

interface CharacterEditorModalProps {
  character: Character | null;
  onSave: (character: Character) => void;
  onClose: () => void;
  isUserCreator?: boolean;
}

const CharacterEditorModal: React.FC<CharacterEditorModalProps> = ({ character, onSave, onClose, isUserCreator = false }) => {
  const [formData, setFormData] = useState<Omit<Character, 'id'>>({
    name: '',
    age: 18,
    bodyType: '',
    imageUrl: '',
    gifUrl: '',
    bio: '',
    roleplayDescription: '',
    systemPrompt: '',
    tags: [],
    gallery: [],
    isPrivate: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        age: character.age,
        bodyType: character.bodyType || '',
        imageUrl: character.imageUrl,
        gifUrl: character.gifUrl || '',
        bio: character.bio,
        roleplayDescription: character.roleplayDescription || '',
        systemPrompt: character.systemPrompt,
        tags: character.tags || [],
        gallery: character.gallery || [],
        isPrivate: character.isPrivate || false,
      });
    } else {
        setFormData({
            name: '',
            age: 18,
            bodyType: '',
            imageUrl: '',
            gifUrl: '',
            bio: '',
            roleplayDescription: '',
            systemPrompt: '',
            tags: [],
            gallery: [],
            isPrivate: false,
        });
    }
  }, [character]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({
        ...prev,
        [name]: name === 'age' ? parseInt(value, 10) || 0 : value,
        }));
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !(formData.tags || []).includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleAddGalleryImage = () => {
    const newUrl = galleryInput.trim();
    if (newUrl && !(formData.gallery || []).includes(newUrl)) {
        try {
            // Basic URL validation
            new URL(newUrl);
            setFormData(prev => ({
                ...prev,
                gallery: [...(prev.gallery || []), newUrl],
            }));
            setGalleryInput('');
        } catch (_) {
            alert('لطفاً یک آدرس (URL) معتبر وارد کنید.');
        }
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
        ...prev,
        gallery: (prev.gallery || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCharacter: Character = {
      id: character?.id || `char_${Date.now()}`,
      ...formData,
    };
    onSave(newCharacter);
  };

  const inputStyle = "mt-1 w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500";

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {character ? 'ویرایش شخصیت' : 'ساخت شخصیت جدید'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">نام</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-600 dark:text-slate-300">سن</label>
                <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="bodyType" className="block text-sm font-medium text-slate-600 dark:text-slate-300">اندام (Body Type)</label>
                <input type="text" name="bodyType" id="bodyType" value={formData.bodyType || ''} onChange={handleChange} className={inputStyle} placeholder="مثلا: لاغر، ورزشی، متوسط..." />
              </div>
              {!isUserCreator && (
                <div className="md:col-span-2">
                    <div className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            name="isPrivate"
                            id="isPrivate"
                            checked={formData.isPrivate || false}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        <label htmlFor="isPrivate" className="mr-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                            شخصیت خصوصی (فقط برای ادمین قابل مشاهده باشد)
                        </label>
                    </div>
                </div>
              )}
              <div className="md:col-span-2">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-600 dark:text-slate-300">آدرس عکس اصلی (URL)</label>
                <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} required className={inputStyle} placeholder="https://example.com/image.png" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="gifUrl" className="block text-sm font-medium text-slate-600 dark:text-slate-300">آدرس گیف برای هاور (اختیاری)</label>
                <input type="url" name="gifUrl" id="gifUrl" value={formData.gifUrl || ''} onChange={handleChange} className={inputStyle} placeholder="https://example.com/animation.gif" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="tags-input" className="block text-sm font-medium text-slate-600 dark:text-slate-300">برچسب‌ها</label>
                <div className="flex flex-wrap items-center gap-2 p-2 mt-1 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-rose-500">
                  {(formData.tags || []).map((tag, index) => (
                    <span key={index} className="flex items-center gap-1.5 bg-rose-500 text-white px-2.5 py-1 text-xs font-semibold rounded-full">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(index)} className="text-rose-100 hover:text-white focus:outline-none">
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    id="tags-input"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-1 min-w-[120px] text-slate-800 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    placeholder="افزودن تگ..."
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">برای افزودن تگ، Enter یا کاما را فشار دهید.</p>
              </div>

              {/* Gallery Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">گالری تصاویر</label>
                 <div className="flex items-center gap-2 mt-1">
                    <input 
                        type="url" 
                        value={galleryInput}
                        onChange={(e) => setGalleryInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGalleryImage(); }}}
                        className={inputStyle + " flex-1 !mt-0"} 
                        placeholder="آدرس عکس جدید را وارد کنید..."
                    />
                    <button type="button" onClick={handleAddGalleryImage} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700">افزودن</button>
                </div>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
                    {(formData.gallery || []).map((url, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-slate-100 dark:bg-slate-700 p-2 rounded">
                            <span className="truncate text-slate-500 dark:text-slate-400">{url}</span>
                            <button type="button" onClick={() => handleRemoveGalleryImage(index)} className="text-red-500 hover:text-red-400 flex-shrink-0 mr-2">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-slate-600 dark:text-slate-300">بیوگرافی کوتاه</label>
                <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} required rows={2} className={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="roleplayDescription" className="block text-sm font-medium text-slate-600 dark:text-slate-300">توضیح نقش (سناریو)</label>
                <textarea name="roleplayDescription" id="roleplayDescription" value={formData.roleplayDescription || ''} onChange={handleChange} rows={2} className={inputStyle} placeholder="مثال: خواهر کوچیک دوست‌دخترت که همیشه..." />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="systemPrompt" className="block text-sm font-medium text-slate-600 dark:text-slate-300">دستورالعمل سیستمی (شخصیت)</label>
                <textarea name="systemPrompt" id="systemPrompt" value={formData.systemPrompt} onChange={handleChange} required rows={5} className={inputStyle} placeholder="شخصیت، لحن و دستورالعمل‌های هوش مصنوعی را اینجا تعریف کنید..." />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">این متن اصلی‌ترین بخش تعریف هویت و رفتار شخصیت است.</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-700/50 px-6 py-3 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600">
              انصراف
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-rose-600 text-white font-semibold hover:bg-rose-700">
              ذخیره
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterEditorModal;