import { LitManagement } from '../../components/lits/LitManagement';

interface LitsPageProps {
  onBackToDashboard?: () => void;
}

export default function LitsPage({ onBackToDashboard }: LitsPageProps) {
  const handleBack = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  return (
    <LitManagement 
      onBackToDashboard={handleBack}
    />
  );
}