import React, { useState, CSSProperties } from 'react';
import { Page, Character, User } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon, CheckIcon, RefreshIcon, PencilIcon, SparklesIcon, ImageIcon } from './icons';
import PersonalitySelectorModal from './PersonalitySelectorModal';
import { personalityOptions, relationshipOptions, occupationOptions, kinkOptions } from '../data/personalityOptions';
import { generateCharacterImage as generateImage } from '../services/perchanceImageService';


interface CharacterCreatorWizardProps {
  navigate: (page: Page) => void;
  currentUser: User | null;
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
}

type Style = 'Realistic' | 'Anime';
type Gender = 'girl' | 'boy';
type EditingField = 'personality' | 'relationship' | 'occupation' | 'kinks';

// Data for the options
const hairStyleOptions = [
    { name: 'Straight', label: 'صاف', image: 'https://i.pinimg.com/564x/27/7f/3c/277f3c3f8e586bcb01103f6f7553b3b2.jpg' },
    { name: 'Bangs', label: 'چتری', image: 'https://i.pinimg.com/564x/11/b3/ae/11b3ae3d44d422a57173e35198033a82.jpg' },
    { name: 'Curly', label: 'فر', image: 'https://i.pinimg.com/564x/ac/46/64/ac4664593125e836b95c0bd01d125026.jpg' },
    { name: 'Bun', label: 'گوجه‌ای', image: 'https://i.pinimg.com/564x/d6/3b/0b/d63b0b7596a7076a4a15a0c3a88c7f93.jpg' },
    { name: 'Short', label: 'کوتاه', image: 'https://i.pinimg.com/564x/39/39/3a/39393a54a106f20b3cb154678a3c5efb.jpg' },
    { name: 'Ponytail', label: 'دم اسبی', image: 'https://i.pinimg.com/564x/b8/18/1e/b8181e285e65b4308a3d5483a3118a8b.jpg' },
];

const girlRealisticImageUrl = 'https://github.com/talanoface-ux/imgesss/blob/main/%D8%A7%D9%86%D8%AF%D8%A7%D9%85%D8%B tribulations%20%DA%86%D8%B7%D9%88%D8%B1%D9%87%D8%9F%F0%9F%98%8D..%23%D8%A7%D9%86%D8%AF%D8%A7%D9%85%20%23%D8%B2%DB%8C%D8%A8%D8%A7%20%23%D8%AF%D8%AE%D8%AA%D8%B1%20%23%D8%A7%D8%B3%D8%AA%D8%A7%DB%8C%D9%84%20%23%D9%85%D8%AF%D9%84.webp?raw=true';


const CharacterCreatorWizard: React.FC<CharacterCreatorWizardProps> = ({ navigate, currentUser, setCharacters }) => {
  const [step, setStep] = useState(1);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [age, setAge] = useState(21);
  const [hairStyle, setHairStyle] = useState<string | null>('Straight');
  const [hairColor, setHairColor] = useState<string | null>('Black');
  const [eyeColor, setEyeColor] = useState<string | null>('Brown');
  const [bodyType, setBodyType] = useState<string | null>('Skinny');
  const [breastSize, setBreastSize] = useState<string | null>('Large');
  
  // Step 6 (Image Gen) State
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Step 7 State
  const [name, setName] = useState('سارا رضایی');
  const [personality, setPersonality] = useState('سلطه‌پذیر');
  const [relationship, setRelationship] = useState('غریبه');
  const [occupation, setOccupation] = useState('دانشجو');
  const [kinks, setKinks] = useState<string[]>(['سلطه پدرانه']);
  const [editingField, setEditingField] = useState<EditingField | null>(null);

  const isGirlRealisticPath = selectedGender === 'girl' && selectedStyle === 'Realistic';
  const totalSteps = isGirlRealisticPath ? 7 : 2;

  const handleNext = () => {
    if (step === 1 && selectedGender) {
      setStep(2);
    } else if (step === 2 && selectedStyle) {
      if (isGirlRealisticPath) {
        setStep(3);
      } else {
        alert(`جنسیت انتخاب شده: ${selectedGender}, سبک: ${selectedStyle}. مرحله بعدی برای این مسیر هنوز پیاده‌سازی نشده است.`);
      }
    } else if (step === 3 && isGirlRealisticPath) {
      setStep(4);
    } else if (step === 4 && isGirlRealisticPath) {
      setStep(5);
    } else if (step === 5 && isGirlRealisticPath) {
      setStep(6);
    } else if (step === 6 && isGirlRealisticPath) {
      if (generatedImageUrl) {
        setStep(7);
      }
    } else if (step === 7) {
      const newCharacter: Character = {
        id: `char_user_${Date.now()}`,
        name: name,
        age: age,
        bodyType: bodyType || undefined,
        imageUrl: generatedImageUrl!,
        gifUrl: '',
        bio: `یک شخصیت ${age} ساله به نام ${name}. او یک ${occupation} با شخصیت ${personality} است.`,
        systemPrompt: `شما ${name} هستید، یک شخصیت مجازی ${age} ساله. سبک شما ${selectedStyle} است. مدل موی شما ${hairStyle} با رنگ ${hairColor} و رنگ چشم شما ${eyeColor} است. نوع بدن شما ${bodyType} با اندازه سینه ${breastSize} است. شما یک ${occupation} با شخصیت ${personality} هستید. رابطه شما با کاربر ${relationship} است و تمایلات شما شامل ${kinks.join(', ')} می‌باشد.`,
        tags: [personality, occupation, relationship, ...kinks],
        isPrivate: true,
        creatorId: currentUser?.id,
      };
      setCharacters(prev => [...prev, newCharacter]);
      navigate('landing');
    }
  };
  
  const handleBack = () => {
      if (step > 1) {
          setStep(step - 1);
      }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);

    const prompt = "20-year-old Iranian girl with black straight hair, skinny body, but extra-large boobs. She is showing her pussy while some black dick is in her mouth.";

    try {
        const imageUrl = await generateImage(prompt);
        setGeneratedImageUrl(imageUrl);
    } catch (error) {
        setGenerationError((error as Error).message || 'یک خطای ناشناخته رخ داد.');
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const OptionCard: React.FC<{label: string; image: string; isSelected: boolean; onClick: () => void;}> = ({ label, image, isSelected, onClick }) => (
    <div 
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 group ${isSelected ? 'ring-2 ring-white' : 'hover:scale-105'}`}
      onClick={onClick}
    >
      <img src={image} alt={label} className="w-full aspect-square object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-2">
          <span className="text-white text-sm font-semibold">{label}</span>
      </div>
      {isSelected && (
        <>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-rose-500" />
          </div>
        </>
      )}
    </div>
  );

  // --- Image URLs ---
  const genderSelectGirlUrl = 'https://i.pinimg.com/564x/e7/8a/a5/e78aa51939105ab1c3d2a50e9803157f.jpg';
  const genderSelectBoyUrl = 'https://i.pinimg.com/564x/4b/9a/c2/4b9ac22018280f682d1645a2a1975b5b.jpg';
  
  const girlAnimeImageUrl = 'https://i.pinimg.com/564x/e7/8a/a5/e78aa51939105ab1c3d2a50e9803157f.jpg';
  const boyRealisticImageUrl = 'https://i.pinimg.com/564x/0a/7c/4f/0a7c4f1e5f8f1de866164d735067b433.jpg';
  const boyAnimeImageUrl = 'https://i.pinimg.com/564x/f1/87/9a/f1879a6331e847be27d142173161c56b.jpg';

  const getCardClasses = (isSelected: boolean, isAnySelected: boolean) => {
    let base = "relative rounded-lg overflow-hidden shadow-lg group aspect-[3/4] cursor-pointer transition-all duration-300 transform";
    if (isSelected) {
      base += " ring-4 ring-rose-500 scale-105";
    } else if (isAnySelected) {
      base += " opacity-50 scale-95";
    } else {
      base += " hover:scale-105";
    }
    return base;
  };

  const handleSaveTrait = (value: string | string[]) => {
    switch (editingField) {
      case 'personality':
        setPersonality(value as string);
        break;
      case 'relationship':
        setRelationship(value as string);
        break;
      case 'occupation':
        setOccupation(value as string);
        break;
      case 'kinks':
        setKinks(value as string[]);
        break;
    }
    setEditingField(null);
  };
  
  const renderEditorModal = () => {
    if (!editingField) return null;

    let modalProps;

    switch (editingField) {
        case 'personality':
            modalProps = {
                title: 'ویرایش شخصیت',
                options: personalityOptions,
                currentValue: personality,
                multiSelect: false,
            };
            break;
        case 'relationship':
            modalProps = {
                title: 'ویرایش رابطه',
                options: relationshipOptions,
                currentValue: relationship,
                multiSelect: false,
                useShowMore: true,
            };
            break;
        case 'occupation':
            modalProps = {
                title: 'ویرایش شغل',
                options: occupationOptions,
                currentValue: occupation,
                multiSelect: false,
                useShowMore: true,
            };
            break;
        case 'kinks':
            modalProps = {
                title: 'ویرایش تمایلات',
                options: kinkOptions,
                currentValue: kinks,
                multiSelect: true,
                maxSelect: 3,
                showSearch: true,
                useShowMore: true,
            };
            break;
        default:
            return null;
    }

    return (
        <PersonalitySelectorModal
            isOpen={!!editingField}
            onClose={() => setEditingField(null)}
            onSave={handleSaveTrait}
            {...modalProps}
        />
    );
  };

  const StepCounter = () => (
    <div className="text-center mb-4">
        <span style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} className="px-3 py-1 bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-semibold rounded-full font-zain">
            مرحله {step} از {totalSteps}
        </span>
    </div>
  );

  const renderStep1 = () => (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <StepCounter />
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 font-lalezar tracking-wide">
        جنسیت شخصیت خود را انتخاب کنید
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        <div className={getCardClasses(selectedGender === 'girl', !!selectedGender)} onClick={() => setSelectedGender('girl')}>
          <img src={genderSelectGirlUrl} alt="دختر" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <p className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-xl tracking-wider">
            دختر
          </p>
        </div>

        <div className={getCardClasses(selectedGender === 'boy', !!selectedGender)} onClick={() => setSelectedGender('boy')}>
          <img src={genderSelectBoyUrl} alt="پسر" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <p className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-xl tracking-wider">
            پسر
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const realisticImageUrl = selectedGender === 'girl' ? girlRealisticImageUrl : boyRealisticImageUrl;
    const animeImageUrl = selectedGender === 'girl' ? girlAnimeImageUrl : boyAnimeImageUrl;

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
            <StepCounter />
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 font-lalezar tracking-wide">
                سبک ظاهری را انتخاب کنید
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className={getCardClasses(selectedStyle === 'Realistic', !!selectedStyle)} onClick={() => setSelectedStyle('Realistic')}>
                    <img src={realisticImageUrl} alt="سبک واقعی" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <p className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-xl tracking-wider">
                        واقعی
                    </p>
                </div>

                <div className={getCardClasses(selectedStyle === 'Anime', !!selectedStyle)} onClick={() => setSelectedStyle('Anime')}>
                    <img src={animeImageUrl} alt="سبک انیمه" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <p className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-xl tracking-wider">
                        انیمه
                    </p>
                </div>
            </div>
        </div>
    );
  };
  
  const renderStep3 = () => {
    const sliderProgress = ((age - 18) / (55 - 18)) * 100;
    const sliderStyle: CSSProperties = {
        background: `linear-gradient(to right, #ec4899 ${sliderProgress}%, #4b5563 ${sliderProgress}%)`
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <StepCounter />
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 font-lalezar tracking-wide">
                سن را انتخاب کنید
            </h2>
            <div className="bg-slate-800/50 p-6 rounded-lg" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
                <div className="text-center mb-4">
                    <span className="px-4 py-1 bg-slate-700 text-white font-semibold text-lg rounded-md border border-slate-600">
                        {age === 55 ? '۵۵+' : `${age} سال`}
                    </span>
                </div>
                <div className="flex items-center gap-4" dir="ltr">
                    <span className="text-white font-bold">18</span>
                    <input
                        type="range"
                        min="18"
                        max="55"
                        value={age}
                        onChange={e => setAge(parseInt(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer range-slider"
                        style={sliderStyle}
                    />
                    <span className="text-white font-bold">55+</span>
                </div>
            </div>
        </div>
    );
  };

  const renderStep4 = () => {
    const hairColorOptions = [
      { name: 'Brunette', label: 'خرمایی', image: 'https://i.pinimg.com/564x/9d/5e/b4/9d5eb497b7b6238b0e513a9b1c7c4b69.jpg' },
      { name: 'Blonde', label: 'بلوند', image: 'https://i.pinimg.com/564x/1a/10/7b/1a107b3c2c1a850a58b688d01157c9a9.jpg' },
      { name: 'Black', label: 'مشکی', image: 'https://i.pinimg.com/564x/6c/4d/52/6c4d52e1a74d4361b4a92c0a876a3862.jpg' },
      { name: 'Redhead', label: 'قرمز', image: 'https://i.pinimg.com/564x/23/9c/4a/239c4a5b785e510255b7210e74e320d9.jpg' },
      { name: 'Pink', label: 'صورتی', image: 'https://i.pinimg.com/564x/3b/b1/6a/3bb16a90098f48039e190626543b357f.jpg' },
    ];
    const eyeColorOptions = [
      { name: 'Brown', label: 'قهوه‌ای', image: 'https://i.pinimg.com/564x/24/76/f3/2476f36eda01f92e42427a1a0f823133.jpg' },
      { name: 'Blue', label: 'آبی', image: 'https://i.pinimg.com/564x/62/7b/03/627b0365bcb27c34b6e51f50a041f021.jpg' },
      { name: 'Green', label: 'سبز', image: 'https://i.pinimg.com/564x/44/ae/d1/44aed140443b74302a28172c3b2f5670.jpg' },
    ];
    
    return (
      <div className="w-full max-w-2xl mx-auto animate-fade-in text-white">
        <StepCounter />
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-center mb-4">مدل مو را انتخاب کنید</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {hairStyleOptions.map(opt => (
                        <OptionCard key={opt.name} label={opt.label} image={opt.image} isSelected={hairStyle === opt.name} onClick={() => setHairStyle(opt.name)} />
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-center mb-4">رنگ مو را انتخاب کنید</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                     {hairColorOptions.map(opt => (
                        <OptionCard key={opt.name} label={opt.label} image={opt.image} isSelected={hairColor === opt.name} onClick={() => setHairColor(opt.name)} />
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-center mb-4">رنگ چشم را انتخاب کنید</h3>
                <div className="grid grid-cols-3 gap-3">
                     {eyeColorOptions.map(opt => (
                        <OptionCard key={opt.name} label={opt.label} image={opt.image} isSelected={eyeColor === opt.name} onClick={() => setEyeColor(opt.name)} />
                    ))}
                </div>
            </div>
        </div>
      </div>
    );
  };

  const renderStep5 = () => {
    const bodyTypeOptions = [
      { name: 'Skinny', label: 'لاغر', image: 'https://i.pinimg.com/564x/e1/f7/a4/e1f7a4359e1e2c64817173b18ecb7ca9.jpg' },
      { name: 'Athletic', label: 'ورزشی', image: 'https://i.pinimg.com/564x/23/34/00/2334006c8b9b5f5412a80638703f8f70.jpg' },
      { name: 'Average', label: 'متوسط', image: 'https://i.pinimg.com/564x/87/e5/23/87e5233bf131804f86d8702b335359c9.jpg' },
      { name: 'Curvy', label: 'تپل', image: 'https://i.pinimg.com/564x/7d/c1/76/7dc176b911855a74345511a2a433f858.jpg' },
      { name: 'BBW', label: 'سایز بزرگ', image: 'https://i.pinimg.com/564x/31/57/28/31572851b2f90b1067e35b757f495147.jpg' },
    ];
    const breastSizeOptions = [
      { name: 'Small', label: 'کوچک', image: 'https://i.pinimg.com/564x/b8/b5/1d/b8b51d8d21396a5a0446b7d34b22585f.jpg' },
      { name: 'Medium', label: 'متوسط', image: 'https://i.pinimg.com/564x/e7/73/45/e7734568f05fe31070562f7961205151.jpg' },
      { name: 'Large', label: 'بزرگ', image: 'https://i.pinimg.com/564x/42/4f/50/424f5062a48b301c238e83315a6b7e6f.jpg' },
      { name: 'Extra Large', label: 'خیلی بزرگ', image: 'https://i.pinimg.com/564x/e8/38/20/e83820a45e9f3b7d722e11c52136e0d9.jpg' },
    ];

    return (
      <div className="w-full max-w-2xl mx-auto animate-fade-in text-white">
        <StepCounter />
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-center mb-4">نوع بدن را انتخاب کنید</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {bodyTypeOptions.map(opt => (
                        <OptionCard key={opt.name} label={opt.label} image={opt.image} isSelected={bodyType === opt.name} onClick={() => setBodyType(opt.name)} />
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-center mb-4">اندازه سینه را انتخاب کنید</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                     {breastSizeOptions.map(opt => (
                        <OptionCard key={opt.name} label={opt.label} image={opt.image} isSelected={breastSize === opt.name} onClick={() => setBreastSize(opt.name)} />
                    ))}
                </div>
            </div>
        </div>
      </div>
    );
  };

  const renderStep6 = () => (
    <div className="w-full max-w-lg mx-auto animate-fade-in text-white text-center">
        <StepCounter />
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">ساخت تصویر شخصیت</h2>
        <p className="text-slate-400 mb-8">بر اساس انتخاب‌های شما، یک تصویر منحصر به فرد ساخته می‌شود. این فرآیند ممکن است کمی طول بکشد.</p>

        <div className="aspect-square w-full max-w-md mx-auto bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700 mb-6 overflow-hidden">
            {isGeneratingImage ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 border-4 border-t-transparent border-rose-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-300">در حال ساخت تصویر...</p>
                    <p className="text-xs text-slate-500">این کار ممکن است تا یک دقیقه طول بکشد.</p>
                </div>
            ) : generationError ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
                    <XMarkIcon className="w-16 h-16 text-red-500" />
                    <p className="mt-4 text-red-400">خطا در ساخت تصویر</p>
                    <p className="text-xs text-slate-400 text-center">{generationError}</p>
                </div>
            ) : generatedImageUrl ? (
                <img src={generatedImageUrl} alt="تصویر ساخته شده" className="w-full h-full object-cover" />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <ImageIcon className="w-24 h-24" />
                    <p className="mt-4">برای شروع، روی دکمه "ساخت تصویر" کلیک کنید.</p>
                </div>
            )}
        </div>

        <div className="flex justify-center">
            <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="inline-flex items-center gap-3 px-10 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
            >
                {isGeneratingImage ? (
                    <>
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"></div>
                        <span>در حال ساخت...</span>
                    </>
                ) : (
                     <>
                        <SparklesIcon className="w-5 h-5" />
                        <span>{generatedImageUrl ? 'ساخت مجدد' : 'ساخت تصویر'}</span>
                    </>
                )}
            </button>
        </div>
    </div>
  );
  
  const firstNames = ['سارا', 'مریم', 'فاطمه', 'زهرا', 'نگار', 'آوا', 'نیوشا', 'هستی'];
  const lastNames = ['رضایی', 'احمدی', 'محمدی', 'حسینی', 'کریمی', 'صادقی', 'موسوی'];
  
  const handleRandomizeName = () => {
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      setName(`${randomFirstName} ${randomLastName}`);
  };

  const renderStep7 = () => {
    const TraitCard: React.FC<{ title: string; value: string; onClick: () => void }> = ({ title, value, onClick }) => (
        <div 
            className="bg-slate-800/50 rounded-lg p-3 cursor-pointer border border-slate-700 hover:border-rose-500 transition"
            onClick={onClick}
            style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-400 uppercase">{title}</p>
                    <p className="font-semibold text-white truncate">{value}</p>
                </div>
                <div className="p-2 rounded-full bg-slate-700/50">
                    <PencilIcon className="w-4 h-4 text-slate-300" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-lg mx-auto animate-fade-in text-white">
            <StepCounter />
            {generatedImageUrl && (
                <div className="mb-6 flex justify-center">
                    <img src={generatedImageUrl} alt="Character preview" className="w-24 h-24 rounded-full object-cover border-4 border-slate-700 shadow-lg"/>
                </div>
            )}
            <div className="space-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-center mb-4">یک نام انتخاب کنید</h3>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={20}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pr-4 pl-12 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            placeholder="نام شخصیت..."
                            style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                        />
                        <button
                            type="button"
                            onClick={handleRandomizeName}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition"
                            title="نام تصادفی"
                        >
                            <RefreshIcon className="w-6 h-6" />
                        </button>
                    </div>
                     <p className="text-right text-xs text-slate-500 mt-2 pr-1">{name.length}/20</p>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-1">شخصیت را انتخاب کنید</h3>
                    <p className="text-sm text-slate-400">برای تغییر کلیک کنید</p>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-left">
                        <TraitCard title="شخصیت" value={personality} onClick={() => setEditingField('personality')} />
                        <TraitCard title="رابطه" value={relationship} onClick={() => setEditingField('relationship')} />
                        <TraitCard title="شغل" value={occupation} onClick={() => setEditingField('occupation')} />
                        <TraitCard title="تمایلات (حداکثر ۳)" value={kinks.join(', ')} onClick={() => setEditingField('kinks')} />
                    </div>
                </div>
            </div>
        </div>
    );
  };


  const renderContent = () => {
      switch(step) {
          case 1: return renderStep1();
          case 2: return renderStep2();
          case 3: return renderStep3();
          case 4: return renderStep4();
          case 5: return renderStep5();
          case 6: return renderStep6();
          case 7: return renderStep7();
          default:
            return <div><h2 className="text-white">مرحله نامعتبر</h2></div>;
      }
  }

  const isNextDisabled = () => {
      if (step === 1) return !selectedGender;
      if (step === 2) return !selectedStyle;
      if (step === 3) return false;
      if (step === 4) return !hairStyle || !hairColor || !eyeColor;
      if (step === 5) return !bodyType || !breastSize;
      if (step === 6) return !generatedImageUrl;
      if (step === 7) return name.trim() === '';
      return true;
  }

  return (
    <div 
        className="min-h-screen w-full flex flex-col items-center justify-between bg-gradient-to-br from-[#111827] to-[#1e293b] p-6" 
        dir="rtl"
    >
       <button 
        onClick={() => navigate('landing')} 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition z-10"
        aria-label="خروج"
      >
        <span>خروج</span>
        <XMarkIcon className="w-5 h-5" />
      </button>
      
      <div className="w-full flex-1 flex items-center justify-center">
        {renderContent()}
        {renderEditorModal()}
      </div>

      <div className="w-full max-w-4xl mx-auto mt-12 flex items-center justify-between">
            <button
                onClick={handleBack}
                disabled={step === 1}
                className="inline-flex items-center gap-3 px-10 py-3 bg-[#333333] text-white font-semibold rounded-lg hover:bg-[#444444] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
            >
                <ArrowRightIcon className="w-5 h-5" />
                <span>قبلی</span>
            </button>
            <button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="inline-flex items-center gap-3 px-10 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
            >
                <span>{step === totalSteps ? 'پایان' : 'بعدی'}</span>
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
        }
        .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            background: #f1f5f9; /* slate-100 */
            border-radius: 50%;
            cursor: pointer;
            border: 4px solid #ec4899; /* pink-500 */
        }
        .range-slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
            background: #f1f5f9; /* slate-100 */
            border-radius: 50%;
            cursor: pointer;
            border: 4px solid #ec4899; /* pink-500 */
        }
      `}</style>
    </div>
  );
};

export default CharacterCreatorWizard;