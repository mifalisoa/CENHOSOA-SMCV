interface PatientsHospitalisesViewProps {
  userRole: 'docteur' | 'interne' | 'stagiaire';
}

export function PatientsHospitalisesView({ userRole }: PatientsHospitalisesViewProps) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Patients Hospitalisés</h2>
      <p className="text-gray-600">Liste des patients hospitalisés (à implémenter)</p>
    </div>
  );
}