import React, { useState } from 'react';
import { DownloadIcon, ImageIcon, SparklesIcon, MagicWandIcon } from './Icons';
import { Button } from './Button';

interface ResultDisplayProps {
  generatedImage: string | null;
  isLoading: boolean;
  isRegenerating: boolean;
  onRegenerate: (prompt: string) => void;
}

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full w-full text-center text-gray-500">
    <SparklesIcon className="w-16 h-16 text-brand-accent animate-pulse" />
    <p className="mt-4 text-lg font-semibold text-gray-700">جاري إنشاء غرفتك الجديدة...</p>
    <p className="text-sm">الذكاء الاصطناعي يبحث عن المكان المثالي لمرآتك.</p>
  </div>
);

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full w-full text-center text-gray-400">
        <ImageIcon className="w-24 h-24" />
        <p className="mt-4 text-lg font-semibold text-gray-700">غرفتك الجديدة في انتظارك</p>
        <p className="text-sm">ارفع صورة مرآتك ودع السحر يبدأ.</p>
    </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ generatedImage, isLoading, isRegenerating, onRegenerate }) => {
  const [editPrompt, setEditPrompt] = useState('');
  
  const handleRegenerateClick = () => {
      onRegenerate(editPrompt);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center w-full h-full min-h-[30rem] bg-gray-100 rounded-lg p-4">
      {isLoading ? (
        <LoadingState />
      ) : generatedImage ? (
        <div className="w-full h-full flex flex-col space-y-6">
            <div className="flex-grow relative rounded-lg overflow-hidden flex items-center justify-center">
                <img src={generatedImage} alt="Generated decor" className="w-full h-full object-contain" />
                {isRegenerating && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center transition-opacity duration-300">
                        <SparklesIcon className="w-12 h-12 text-brand-accent animate-pulse" />
                        <p className="mt-2 text-gray-700 font-semibold">جاري تحديث رؤيتك...</p>
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 space-y-4">
                 <a
                    href={generatedImage}
                    download="generated-mirror-decor.png"
                    className="inline-flex items-center justify-center px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-300 w-full"
                >
                    <DownloadIcon className="w-5 h-5 ml-2" />
                    تحميل الصورة
                </a>

                {/* Edit Section */}
                <div className="pt-2">
                    <div className="flex items-center space-x-3 space-x-reverse mb-3">
                      <MagicWandIcon className="w-6 h-6 text-brand-accent" />
                      <h3 className="text-lg font-semibold text-gray-800">حسّن رؤيتك</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:space-x-2 sm:space-x-reverse space-y-2 sm:space-y-0">
                      <input
                          type="text"
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder="مثلاً: 'اجعل لون الحائط أزرق فاتح'"
                          disabled={isRegenerating || isLoading}
                          className="flex-grow w-full px-4 py-3 text-base text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-colors disabled:bg-gray-200"
                      />
                      <Button
                          onClick={handleRegenerateClick}
                          isLoading={isRegenerating}
                          disabled={isRegenerating || isLoading}
                          className="flex-shrink-0 !py-3"
                      >
                          <SparklesIcon className="w-5 h-5 ml-2" />
                          تحديث
                      </Button>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <InitialState />
      )}
    </div>
  );
};
