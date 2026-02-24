#  CENHOSOA-SMCV - Système de Gestion Médicale

Système de gestion hospitalière développé pour le **Centre Hospitalier CENHOSOA** - Service de Maladies Cardio-Vasculaires.

##  Description

Application web complète de gestion des dossiers patients avec :
- Gestion des patients externes et hospitalisés
- Dossier médical électronique complet
- Observations médicales
- Bilans biologiques
- Soins médicaux et infirmiers
- Prescriptions et traitements
- Documents patients
- Comptes rendus d'hospitalisation

##  Technologies

### Backend
- **Node.js** avec **Express**
- **TypeScript**
- **PostgreSQL** (base de données)
- **JWT** (authentification)
- **bcrypt** (hashage de mots de passe)
- **Zod** (validation)

### Frontend
- **React 18** avec **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **React Router** (navigation)
- **Axios** (HTTP client)
- **date-fns** (manipulation de dates)

##  Installation

### Prérequis
- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement dans .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

##  Base de données

### Créer la base de données
```sql
CREATE DATABASE postgres;
```

### Migration
```bash
cd backend
psql -U postgres -d postgres -f migrations/init.sql
```

##  Utilisateur par défaut

- **Email** : `admin@cenhosoa.mg`
- **Mot de passe** : `Admin@2025`

##  Structure du projet
```
CENHOSOA-SMCV/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── application/     # Use cases
│   │   ├── domain/          # Entités et interfaces
│   │   ├── infrastructure/  # Repositories et DB
│   │   ├── interfaces/      # Controllers et routes
│   │   └── config/          # Configuration
│   └── migrations/          # SQL migrations
│
├── frontend/                # Application React
│   ├── src/
│   │   ├── core/            # Entités et use cases
│   │   ├── infrastructure/  # Repositories
│   │   ├── presentation/    # Components et pages
│   │   └── shared/          # Utils et constants
│   └── public/
│
└── README.md
```

##  Fonctionnalités

###  Gestion des patients
- Création de patients externes
- Hospitalisation de patients
- Recherche et filtrage
- Historique complet

### Dossier médical
- Observations médicales (externes/hospitalisés)
- Bilans biologiques (créatinine, glycémie, CRP, etc.)
- Soins médicaux (ETT, ETO)
- Soins infirmiers (ECG, injections, pansements)
- Traitements et ordonnances
- Documents patients (PDF, images, vidéos)
- Comptes rendus d'hospitalisation

###  Sécurité
- Authentification JWT
- Contrôle d'accès par rôle (admin, médecin, infirmier, secrétaire)
- Hashage des mots de passe
- Protection des routes API

##  Rôles utilisateur

- **Admin** : Accès complet
- **Médecin** : Création/modification des observations, prescriptions
- **Infirmier** : Soins infirmiers, lecture des dossiers
- **Secrétaire** : Gestion administrative des patients

##  API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Patients
- `GET /api/patients` - Liste des patients
- `POST /api/patients` - Créer un patient
- `GET /api/patients/:id` - Détails d'un patient

### Observations
- `POST /api/observations` - Créer une observation
- `GET /api/observations/patient/:id` - Observations d'un patient

[... autres endpoints ...]



## 👨‍💻 Développement

Développé par ANDRIANANDRAINA Mifalisoa Jacquis
