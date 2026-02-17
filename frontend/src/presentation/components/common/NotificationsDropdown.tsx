import { Bell } from 'lucide-react';


interface NotificationsDropdownProps {
  count?: number;
  onClick?: () => void;
}

export function NotificationsDropdown({ count = 0, onClick }: NotificationsDropdownProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
    >
      <Bell className="w-5 h-5 text-gray-600" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}