// frontend/src/presentation/pages/patients/PatientsPage.tsx

import PatientsExternesView from '../dashboard/sections/admin/PatientsExternesView';
import PatientsHospitalises from '../dashboard/sections/admin/PatientsHospitalises';

interface PatientsPageProps {
  defaultTab?: 'externes' | 'hospitalises';
}

export default function PatientsPage({ defaultTab = 'externes' }: PatientsPageProps) {
  return defaultTab === 'hospitalises'
    ? <PatientsHospitalises />
    : <PatientsExternesView />;
}