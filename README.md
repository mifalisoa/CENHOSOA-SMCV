# CENHOSOA-SMCV — Système de Gestion Médicale

Système de gestion hospitalière développé pour le **Centre Hospitalier CENHOSOA** — Service de Maladies Cardio-Vasculaires (SMCV).

---

## Description

Application web complète de gestion hospitalière couvrant l'ensemble du parcours patient, de l'admission à la sortie, avec un dossier médical électronique complet et une gestion multi-rôles.

---

## Technologies

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** — base de données relationnelle
- **JWT** — authentification stateless
- **bcrypt** — hashage des mots de passe
- **Socket.io** — notifications temps réel
- **Nodemailer** + **Brevo SMTP** — envoi d'emails
- **Zod** — validation des données
- **PDFKit** — génération de PDF

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — styling utility-first
- **React Router v6** — navigation
- **Axios** — client HTTP
- **Framer Motion** — animations
- **Recharts** — graphiques et statistiques
- **date-fns** — manipulation de dates
- **Sonner** — notifications toast

---

## Architecture

Le projet suit les principes de la **Clean Architecture** :

```
CENHOSOA-SMCV/
├── backend/
│   └── src/
│       ├── domain/          # Entités + interfaces repositories
│       ├── application/     # Use cases + services métier
│       ├── infrastructure/  # PostgreSQL + sécurité + email
│       ├── interfaces/      # Controllers + routes + middlewares
│       ├── config/          # Configuration (DB, env, socket)
│       └── shared/          # Erreurs + utils + constantes
│
└── frontend/
    └── src/
        ├── core/            # Entités + interfaces + use cases
        ├── infrastructure/  # Repositories HTTP + stockage
        ├── presentation/    # Components + pages + hooks
        ├── shared/          # Utils + constantes + validators
        └── di/              # Injection de dépendances
```

---

## Fonctionnalités

### Gestion des patients
- Patients externes et hospitalisés
- Création, recherche, filtrage et pagination
- Assignation et transfert de lits
- Hospitalisation et sortie

### Dossier médical électronique
- **Observations médicales** — motif, histoire de la maladie, antécédents, examen général, diagnostic
- **Bilans biologiques** — créatinine, glycémie, CRP, INR, NFS avec indicateurs normaux/anormaux
- **Soins médicaux** — ETT, ETO, autres soins cardiaques
- **Soins infirmiers** — ECG, injections IV/IM, PSE, pansements
- **Traitements** — ordonnances multi-médicaments groupées
- **Documents** — PDF, images, vidéos avec prévisualisation
- **Comptes rendus** — résumé d'hospitalisation, diagnostic de sortie, modalité

### Planning et rendez-vous
- Grille horaire par médecin (8h–18h)
- Création, confirmation, annulation de RDV
- Génération de tickets PDF
- Vue liste sur mobile

### Gestion des lits
- 24 lits CENHOSOA : Cat.1 (VIP), Cat.2, Cat.3, USIC
- Suivi en temps réel de l'occupation
- Transfert de patients entre lits

### Administration
- Gestion des utilisateurs et permissions par rôle
- Tableau de bord statistiques avec graphiques
- Recherche globale (patients, utilisateurs, RDV, admissions)
- Export PDF et ZIP de tous les documents
- Guide d'utilisation intégré par rôle

### Sécurité
- Authentification JWT avec refresh
- Contrôle d'accès par rôle (RBAC)
- Permissions granulaires par module
- Logs d'actions, sessions actives, IPs bloquées
- Timeout de session automatique
- Reset mot de passe par email
- Hashage bcrypt

### Notifications
- Notifications temps réel via Socket.io
- Son de notification
- Marquage lu/non lu, suppression

---

## Rôles utilisateur

| Rôle | Accès |
|------|-------|
| **Admin** | Accès complet — patients, utilisateurs, lits, statistiques, sécurité |
| **Médecin** | Dossier médical complet, planning, patients |
| **Interne** | Dossier médical sous supervision |
| **Stagiaire** | Lecture + saisie limitée |
| **Infirmier** | Soins infirmiers, traitements |
| **Secrétaire** | Planning RDV, documents administratifs |

---

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Variables d'environnement backend

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cenhosoa
JWT_SECRET=votre_secret_jwt_long
PORT=3000
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=votre_email_brevo
SMTP_PASS=votre_cle_api_brevo
FRONTEND_URL=http://localhost:5173
```

### Variables d'environnement frontend

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Base de données

```bash
# Créer la base
psql -U postgres -c "CREATE DATABASE cenhosoa;"

# Appliquer les migrations
psql -U postgres -d cenhosoa -f migrations/init.sql
```

---

## Premier démarrage

Accédez à `/setup` pour créer le compte administrateur initial.

Ou utilisez le compte par défaut :
- **Email** : `admin@cenhosoa.mg`
- **Mot de passe** : `Admin@2025`

> ⚠️ Changez le mot de passe immédiatement après la première connexion.

---

## Principaux endpoints API

### Authentification
```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/mot-de-passe-oublie
POST   /api/auth/reset-password
```

### Patients
```
GET    /api/patients
POST   /api/patients
GET    /api/patients/:id
PUT    /api/patients/:id
POST   /api/patients/:id/hospitaliser
POST   /api/patients/:id/rendre-externe
```

### Dossier médical
```
GET/POST   /api/observations
GET/POST   /api/bilans-biologiques
GET/POST   /api/soins-medicaux
GET/POST   /api/soins-infirmiers
GET/POST   /api/traitements
GET/POST   /api/documents-patients
GET/POST   /api/comptes-rendus
```

### Planning
```
GET    /api/rendez-vous
POST   /api/rendez-vous
PATCH  /api/rendez-vous/:id/confirmer
PATCH  /api/rendez-vous/:id/annuler
```

### Recherche globale
```
GET    /api/search?q=terme
```

---

## Développeur

**ANDRIANANDRAINA Mifalisoa Jacquis**
