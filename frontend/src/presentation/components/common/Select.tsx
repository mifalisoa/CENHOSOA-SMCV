import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  label?: string; // nom accessible
}

export function Select({
  options,
  placeholder,
  label,
  className = '',
  ...props
}: SelectProps) {
  return (
    <select
      aria-label={label || placeholder || 'Select'}
      title={label || placeholder || 'Select'}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg 
        focus:outline-none focus:ring-2 focus:ring-cyan-500 
        focus:border-transparent transition-all bg-white ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
