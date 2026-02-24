import { Outlet } from 'react-router-dom';

export default function SecretaryLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Secretary Layout</h1>
        <p className="text-gray-600 mb-4">À implémenter avec SecretarySidebar et SecretaryHeader</p>
        <Outlet />
      </div>
    </div>
  );
}