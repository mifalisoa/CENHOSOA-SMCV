interface PatientsExternesViewProps {
  userRole: 'docteur' | 'interne' | 'stagiaire';
}

export function PatientsExternesView({ userRole }: PatientsExternesViewProps) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Patients Externes</h2>
      <p className="text-gray-600">Liste des patients externes (à implémenter)</p>
    </div>
  );
}