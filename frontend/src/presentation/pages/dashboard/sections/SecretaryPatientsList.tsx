interface SecretaryPatientsListProps {
  filterType?: 'externe' | 'hospitalise';
}

export function SecretaryPatientsList({ filterType }: SecretaryPatientsListProps) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {filterType === 'externe' ? 'Patients Externes' : 'Patients Hospitalisés'}
      </h2>
      <p className="text-gray-600">Liste des patients (à implémenter)</p>
    </div>
  );
}