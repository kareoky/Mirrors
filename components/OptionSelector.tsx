import React from 'react';
import { CheckIcon } from './Icons';

interface Option {
  value: string;
  label: string;
}

interface OptionSelectorProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({ label, options, selectedValue, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="flex flex-col space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-start text-right w-full px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent
              ${selectedValue === option.value
                ? 'bg-brand-accent text-white border-brand-accent shadow-md'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
          >
            {selectedValue === option.value && <CheckIcon className="w-5 h-5 ml-3" />}
            <span className={selectedValue !== option.value ? 'mr-[2.25rem]' : ''}>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
