import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  color?: 'primary' | 'accent';
}

export const Button: React.FC<ButtonProps> = ({ isLoading, children, color = 'accent', ...props }) => {
  const colorClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-600',
    accent: 'bg-brand-accent hover:bg-brand-accent-hover focus:ring-brand-accent',
  };

  return (
    <button
      {...props}
      className={`flex items-center justify-center px-6 py-4 text-lg font-bold text-white rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50
        ${isLoading || props.disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : colorClasses[color]
        } ${props.className}`}
    >
      {isLoading && (
        <svg className="animate-spin -mr-1 ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};