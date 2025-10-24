import React from 'react';
import { Button } from './Button';
import { UserCircleIcon } from './Icons';

interface ApiKeySelectorProps {
  onSelectKey: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSelectKey }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <UserCircleIcon className="w-16 h-16 mx-auto text-brand-accent" />
        <h2 className="text-2xl font-bold text-gray-900 mt-4">ربط حساب Google AI Studio</h2>
        <p className="text-gray-600 mt-2">
          للاستفادة من قدرات الذكاء الاصطناعي وإنشاء صور فريدة، يرجى ربط حسابك. سيتم احتساب الاستخدام ضمن مشروعك الخاص في Google AI Studio الذي تم تمكين الفوترة فيه.
        </p>
        <div className="mt-6">
          <Button onClick={onSelectKey} className="w-full" color="primary">
            ربط الحساب والمتابعة
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          لمزيد من المعلومات حول الفوترة، يرجى زيارة{' '}
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline"
          >
            الوثائق الرسمية
          </a>.
        </p>
      </div>
    </div>
  );
};
