import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Avatar({ src, alt, className = '', children }: AvatarProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        children
      )}
    </div>
  );
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export function AvatarFallback({ children, className = '' }: AvatarFallbackProps) {
  return (
    <div className={`w-full h-full rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-semibold ${className}`}>
      {children}
    </div>
  );
}

interface AvatarImageProps {
  src: string;
  alt: string;
}

export function AvatarImage({ src, alt }: AvatarImageProps) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full rounded-full object-cover"
    />
  );
}