import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Users, Calendar, Stethoscope, Activity, LogOut } from 'lucide-react';

interface DoctorDashboardProps {
  userRole?: 'docteur' | 'interne' | 'stagiaire';
}

export default function DoctorDashboard({ userRole = 'docteur' }: DoctorDashboardProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const stats = [
    {
      title: "Mes Patients",
      value: "0",
      subtitle: "Patients actifs",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "RDV Aujourd'hui",
      value: "0",
      subtitle: "Rendez-vous planifiés",
      icon: Calendar,
      color: "bg-blue-600"
    },
    {
      title: "Consultations",
      value: "0",
      subtitle: "En attente",
      icon: Stethoscope,
      color: "bg-blue-700"
    },
    {
      title: "Urgences",
      value: "0",
      subtitle: "Cas urgents",
      icon: Activity,
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-20 px-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Médical</h1>
            <p className="text-sm text-gray-600">CENHOSOA - Service de Cardiologie</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                Dr. {user?.prenom_user} {user?.nom_user}
              </p>
              <p className="text-xs text-blue-600 font-medium">
                {userRole === 'docteur' ? 'Chef de service' : 
                 userRole === 'interne' ? 'Interne' : 'Stagiaire'}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, Dr. {user?.prenom_user} 👋
          </h2>
          <p className="text-gray-600">
            Vue d'ensemble de votre activité médicale
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-900 mb-1">{stat.title}</div>
                <div className="text-xs text-gray-500">{stat.subtitle}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle>🎉 Bienvenue dans votre espace médical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Vous êtes connecté en tant que <strong>
                  {userRole === 'docteur' ? 'Docteur' : 
                   userRole === 'interne' ? 'Interne' : 'Stagiaire'}
                </strong>. Vous avez accès à la gestion de vos patients et consultations.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🩺 Vos fonctionnalités :</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Consulter et gérer vos patients</li>
                  <li>• Voir votre planning de rendez-vous</li>
                  <li>• Rédiger des observations médicales</li>
                  <li>• Prescrire des traitements</li>
                  <li>• Suivre les patients hospitalisés</li>
                </ul>
              </div>
              
              <p className="text-xs text-gray-500 italic">
                Les fonctionnalités complètes seront implémentées progressivement.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}