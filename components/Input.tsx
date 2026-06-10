
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  light?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, className, light, ...props }) => {
  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
      <label className={`text-[11px] sm:text-sm font-bold ${light ? 'text-slate-700' : 'text-slate-300'}`}>{label}</label>
      <input
        {...props}
        className={`px-2.5 sm:px-3 py-1.5 sm:py-2 border rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
          light 
            ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' 
            : 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500'
        } ${
          error ? 'border-red-500' : ''
        } ${className}`}
      />
      {error && <span className="text-[10px] sm:text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};
