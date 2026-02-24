import { Outlet } from 'react-router-dom';

export default function DoctorLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Doctor Layout</h1>
        <p className="text-gray-600 mb-4">À implémenter avec DoctorSidebar et DoctorHeader</p>
        <Outlet />
      </div>
    </div>
  );
}