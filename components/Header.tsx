import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-primary shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center md:justify-start h-24">
          <div className="flex items-center text-white">
            <div className="bg-brand-accent p-3 rounded-lg ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M12 14.5v5.714c0 .597.237 1.17.659 1.591L17.25 21M12 14.5c-.251.023-.501.05-.75.082m.75-.082c.251.023.501.05.75.082M3 3.104v5.714a2.25 2.25 0 00.659 1.591L8.25 14.5m-5.25 0c.251.023.501.05.75.082m-4.5 0a24.301 24.301 0 004.5 0m0 0v5.714c0 .597-.237 1.17-.659 1.591L3.75 21m17.25-17.896a24.301 24.301 0 00-4.5 0m0 0v5.714c0 .597-.237 1.17-.659 1.591L15 14.5M21 3.104c-.251.023-.501.05-.75.082m-4.5 0a24.301 24.301 0 014.5 0" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">رؤية ديكور المرآة</h1>
              <p className="text-base text-gray-300">تصور التصميم الداخلي بالذكاء الاصطناعي</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
