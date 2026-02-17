import { Menu, X } from 'lucide-react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export function MobileMenuButton({ isOpen, onToggle, isMobile }: MobileMenuButtonProps) {
  if (!isMobile) return null;

  return (
    <button
      onClick={onToggle}
      className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <X className="w-6 h-6 text-gray-600" />
      ) : (
        <Menu className="w-6 h-6 text-gray-600" />
      )}
    </button>
  );
}