const menuItems = [
  {
    id: 'home',
    label: 'Accueil',
    icon: Home,
    subtitle: "Vue d'ensemble",
  },
  {
    id: 'patients',
    label: 'Les patients',
    icon: Users,
    children: [
      {
        id: 'patients-externes',  // ✅ Important : doit matcher le switch
        label: 'Patients externes',
        icon: UserCheck,
      },
      {
        id: 'patients-hospitalises',
        label: 'Patients hospitalisés',
        icon: Bed,
      },
    ],
  },
  // ... reste
];