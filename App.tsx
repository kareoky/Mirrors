import React, { useState, useCallback } from 'react';
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

  const handleGenerate = useCallback(async () => {
    if (!mirrorImage.file) {
      setError('من فضلك ارفع صورة المرآة للبدء.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateDecorImage(mirrorImage.file, decorImage.file, mirrorType, mirrorPlacement);
      setGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف. من فضلك حاول مرة أخرى.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [mirrorImage, decorImage, mirrorType, mirrorPlacement]);
  
  const handleRegenerate = useCallback(async (editPrompt: string) => {
    if (!generatedImage) {
      setError('يجب إنشاء صورة أولية قبل التعديل.');
      return;
    }
    if (!editPrompt.trim()) {
        setError('من فضلك أدخل تعليمات لتعديل الصورة.');
        return;
    }

    setIsRegenerating(true);
    setError(null);

    try {
      const result = await editDecorImage(generatedImage, editPrompt);
      setGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف أثناء التعديل.');
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  }, [generatedImage]);


  return (
    <div className="min-h-screen bg-gray-50 font-sans text-brand-primary">
      <Header />
      <main className="container mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Controls Column */}
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-10 flex flex-col space-y-8 border border-gray-200">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">١. ارفع صورة مرآتك</h2>
              <p className="text-gray-700">قدم صورة واضحة للمرآة التي تريد تصورها.</p>
            </div>
            <ImageUploader
              label="صورة المرآة"
              imageState={mirrorImage}
              onImageChange={setMirrorImage}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <OptionSelector 
                label="نوع المرآة"
                options={mirrorTypeOptions}
                selectedValue={mirrorType}
                onChange={setMirrorType}
               />
               <OptionSelector 
                label="مكان التركيب"
                options={placementOptions}
                selectedValue={mirrorPlacement}
                onChange={setMirrorPlacement}
               />
            </div>


            <div className="space-y-2 pt-2">
              <h2 className="text-3xl font-bold text-gray-900">٢. أضف إلهام (اختياري)</h2>
              <p className="text-gray-700">ارفع صورة مرجعية للستايل الذي تحبه.</p>
            </div>
            <ImageUploader
              label="مرجع ستايل الديكور"
              imageState={decorImage}
              onImageChange={setDecorImage}
            />
            
            <div className="pt-4">
              <Button
                onClick={handleGenerate}
                disabled={!mirrorImage.file || isLoading || isRegenerating}
                isLoading={isLoading}
                className="w-full"
                color="primary"
              >
                <SparklesIcon className="w-5 h-5 ml-2" />
                {isLoading ? 'جاري تصميم مساحتك...' : 'إنشاء ديكور جديد'}
              </Button>
              {error && <p className="text-red-600 mt-4 text-center lg:text-right">{error}</p>}
            </div>
          </div>

          {/* Result Column */}
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-10 flex flex-col border border-gray-200">
              <div className="space-y-2 mb-6">
                <h2 className="text-3xl font-bold text-gray-900">٣. رؤيتك أصبحت حقيقة</h2>
                <p className="text-gray-700">ها هي مرآتك في مكان جديد مصمم باحترافية.</p>
            </div>
            <ResultDisplay
              generatedImage={generatedImage}
              isLoading={isLoading}
              isRegenerating={isRegenerating}
              onRegenerate={handleRegenerate}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-6 text-gray-500 text-sm mt-8">
        <p>مدعوم بواسطة Gemini. تم التصميم بواسطة مهندس ذكاء اصطناعي عالمي.</p>
      </footer>
    </div>
  );
};

export default App;