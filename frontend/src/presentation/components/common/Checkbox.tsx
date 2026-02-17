import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={`w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2 cursor-pointer ${className}`}
        {...props}
      />
      {label && (
        <label htmlFor={props.id} className="ml-2 text-sm text-gray-600 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}