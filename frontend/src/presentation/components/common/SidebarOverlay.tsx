interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export function SidebarOverlay({ isOpen, onClose, isMobile }: SidebarOverlayProps) {
  if (!isMobile || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 transition-opacity"
      onClick={onClose}
    />
  );
}