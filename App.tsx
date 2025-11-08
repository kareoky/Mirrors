import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Button } from './components/Button';
import { generateDecorImage, editDecorImage } from './services/geminiService';
import type { ImageState } from './types';
import { SparklesIcon } from './components/Icons';
import { OptionSelector } from './components/OptionSelector';

const mirrorTypeOptions = [
  { value: 'classic', label: 'كلاسيك' },
  { value: 'illuminated', label: 'مضيئة' },
  { value: 'touch-illuminated', label: 'بزر لمس' },
];

const placementOptions = [
  { value: 'wall-mounted', label: 'تثبيت على الحائط' },
  { value: 'floor-standing', label: 'قائمة على الأرض' },
];

const App: React.FC = () => {
  const [mirrorImage, setMirrorImage] = useState<ImageState>({ file: null, preview: null });
  const [decorImage, setDecorImage] = useState<ImageState>({ file: null, preview: null });
  const [mirrorType, setMirrorType] = useState('classic');
  const [mirrorPlacement, setMirrorPlacement] = useState('wall-mounted');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const retryIntervalRef = useRef<number | null>(null);


  const handleApiError = useCallback((e: unknown) => {
    console.error(e);
    let errorMessage = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";

    if (e instanceof Error) {
      errorMessage = e.message;

      // Check for rate-limiting messages passed from the backend function
      if (e.message.includes("RESOURCE_EXHAUSTED") || e.message.includes("429")) {
        const retryMatch = e.message.match(/retry in (\d+(\.\d+)?)s/i);
        const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
        
        setRetryAfter(retrySeconds);
        errorMessage = `لقد تجاوزت حصتك في الطبقة المجانية.`;

        if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = window.setInterval(() => {
          setRetryAfter(prev => {
            if (prev <= 1) {
              if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);
              setError(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    setError(errorMessage);
  }, []);

  const handleGenerate = async () => {
    if (!mirrorImage.file) return;
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);
    setRetryAfter(0);

    try {
      const image = await generateDecorImage(mirrorImage.file, decorImage.file, mirrorType, mirrorPlacement);
      setGeneratedImage(image);
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (prompt: string) => {
    if (!generatedImage || !prompt) return;
    setIsRegenerating(true);
    setError(null);
    if (retryIntervalRef.current) clearInterval(retryIntervalRef.current);
    setRetryAfter(0);

    try {
      const image = await editDecorImage(generatedImage, prompt);
      setGeneratedImage(image);
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-secondary text-brand-primary font-sans">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          
          {/* Left Column: Inputs */}
          <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">1. ارفع صورك</h2>
                <p className="text-gray-600">
                    ارفع صورة واضحة للمرآة. اختياريًا، يمكنك رفع صورة مرجعية للديكور لإلهام الذكاء الاصطناعي.
                </p>
            </div>
            <ImageUploader 
              label="صورة المرآة (مطلوبة)" 
              imageState={mirrorImage} 
              onImageChange={setMirrorImage} 
            />
            <ImageUploader 
              label="صورة مرجعية للديكور (اختياري)" 
              imageState={decorImage} 
              onImageChange={setDecorImage} 
            />
            <div className="space-y-4 pt-4">
              <h2 className="text-2xl font-bold text-gray-800">2. حدد خياراتك</h2>
              <p className="text-gray-600">
                أخبرنا المزيد عن مرآتك لمساعدتنا في وضعها بشكل مثالي في المشهد الجديد.
              </p>
            </div>
            <OptionSelector 
              label="نوع المرآة"
              options={mirrorTypeOptions}
              selectedValue={mirrorType}
              onChange={setMirrorType}
            />
            <OptionSelector 
              label="طريقة التثبيت"
              options={placementOptions}
              selectedValue={mirrorPlacement}
              onChange={setMirrorPlacement}
            />

            <div className="pt-4">
              <Button
                onClick={handleGenerate}
                isLoading={isLoading}
                disabled={!mirrorImage.file || isLoading || isRegenerating || retryAfter > 0}
                className="w-full"
              >
                <SparklesIcon className="w-6 h-6 ml-3" />
                إنشاء
              </Button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="sticky top-8">
            <ResultDisplay
              generatedImage={generatedImage}
              isLoading={isLoading}
              isRegenerating={isRegenerating}
              onRegenerate={handleRegenerate}
              retryAfter={retryAfter}
            />
          </div>
        </div>
        {error && (
            <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">خطأ: </strong>
                <span className="block sm:inline">{error}</span>
                {retryAfter > 0 && (
                  <span className="block sm:inline mt-1 sm:mt-0 mr-2 font-semibold">
                    يرجى المحاولة مرة أخرى خلال {retryAfter} ثانية.
                  </span>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
