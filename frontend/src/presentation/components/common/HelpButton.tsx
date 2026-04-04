// frontend/src/presentation/components/common/HelpButton.tsx

import { useState } from 'react';
import {
  HelpCircle, X, ChevronRight, ChevronDown,
  LayoutDashboard, Users, Calendar, Bed, 
  Shield, FileText, Stethoscope, Syringe, Pill,
  Beaker, ClipboardList, Settings, Search, 
  Plus, Download, Eye,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// ── Types ──────────────────────────────────────────────────────────────────────

interface GuideStep {
  icon:    React.ElementType;
  titre:   string;
  contenu: string[];
}

interface GuideSection {
  id:     string;
  titre:  string;
  icon:   React.ElementType;
  color:  string;
  steps:  GuideStep[];
}

// ── Contenu du guide par rôle ─────────────────────────────────────────────────

const GUIDE_ADMIN: GuideSection[] = [
  {
    id: 'dashboard', titre: 'Tableau de bord', icon: LayoutDashboard, color: 'bg-cyan-100 text-cyan-700',
    steps: [
      {
        icon: LayoutDashboard, titre: 'Vue d\'ensemble',
        contenu: [
          'Le tableau de bord affiche les statistiques en temps réel : patients hospitalisés, externes, RDV du jour.',
          'Les cartes KPI montrent les chiffres clés. Cliquez sur "Voir tout" pour accéder aux détails.',
          'Le panneau de détail à droite affiche les informations complètes du patient sélectionné.',
        ],
      },
      {
        icon: Search, titre: 'Recherche globale',
        contenu: [
          'Utilisez la barre de recherche en haut ou le raccourci Ctrl+K pour rechercher dans toute l\'application.',
          'La recherche couvre : patients, utilisateurs, rendez-vous et admissions en cours.',
          'Cliquez sur un résultat pour naviguer directement vers la page correspondante.',
        ],
      },
    ],
  },
  {
    id: 'patients', titre: 'Gestion des patients', icon: Users, color: 'bg-blue-100 text-blue-700',
    steps: [
      {
        icon: Users, titre: 'Patients externes',
        contenu: [
          'Liste tous les patients en consultation externe. Utilisez la recherche et les filtres pour trouver un patient.',
          'Cliquez sur "Nouveau Patient" pour créer une fiche patient externe.',
          'Cliquez sur un patient pour accéder à son dossier médical complet.',
        ],
      },
      {
        icon: Bed, titre: 'Patients hospitalisés',
        contenu: [
          'Affiche tous les patients actuellement hospitalisés avec leur lit et service.',
          'Cliquez sur "Nouvelle Admission" pour hospitaliser un patient (existant ou nouveau).',
          'Le numéro de lit et le service sont affichés en temps réel depuis la base de données.',
        ],
      },
    ],
  },
  {
    id: 'dossier', titre: 'Dossier patient', icon: FileText, color: 'bg-purple-100 text-purple-700',
    steps: [
      {
        icon: Stethoscope, titre: 'Onglets du dossier',
        contenu: [
          'Observation médicale : historique des consultations et hospitalisations.',
          'Biologie : résultats d\'analyses avec indicateurs normaux/anormaux en couleur.',
          'Soins médicaux : ETT, ETO et autres soins cardiaques.',
          'Soins infirmiers : ECG, injections, pansements, PSE.',
          'Traitement : ordonnances groupées par prescription.',
          'Documents : fichiers PDF, images et autres documents.',
          'Compte rendu : disponible uniquement pour les patients hospitalisés.',
        ],
      },
      {
        icon: Download, titre: 'Téléchargement',
        contenu: [
          'Chaque onglet dispose d\'un bouton PDF pour télécharger le document individuel.',
          'Le bouton ZIP télécharge tous les documents d\'un onglet en une archive.',
          'Le bouton "Tout télécharger" dans l\'en-tête télécharge le dossier complet.',
        ],
      },
    ],
  },
  {
    id: 'planning', titre: 'Planning RDV', icon: Calendar, color: 'bg-orange-100 text-orange-700',
    steps: [
      {
        icon: Calendar, titre: 'Grille horaire',
        contenu: [
          'Sur desktop, la grille affiche les créneaux de 8h à 18h pour chaque médecin.',
          'Cliquez sur un créneau vide pour créer un RDV à cette heure précise.',
          'Cliquez sur un RDV existant pour voir les détails et les actions disponibles.',
        ],
      },
      {
        icon: Plus, titre: 'Créer un RDV',
        contenu: [
          'Remplissez : patient, médecin, date, heure, type (consultation/urgence/contrôle/suivi) et motif.',
          'Le ticket PDF du RDV peut être téléchargé depuis le modal de détail.',
          'Les statuts disponibles : En attente, Confirmé, Terminé, Annulé, Absent.',
        ],
      },
    ],
  },
  {
    id: 'lits', titre: 'Gestion des lits', icon: Bed, color: 'bg-green-100 text-green-700',
    steps: [
      {
        icon: Bed, titre: 'Vue des lits',
        contenu: [
          'Affiche tous les lits par catégorie : Cat.1 (VIP), Cat.2, Cat.3, USIC.',
          'Les lits verts sont disponibles, les lits rouges sont occupés.',
          'Cliquez sur un lit occupé pour voir les informations du patient.',
        ],
      },
      {
        icon: Settings, titre: 'Administration des lits',
        contenu: [
          'Créez de nouveaux lits avec numéro, catégorie, étage et service.',
          'Libérez un lit manuellement depuis le panneau de détail.',
          'Le bouton "Initialiser" crée les 24 lits standard CENHOSOA.',
        ],
      },
    ],
  },
  {
    id: 'utilisateurs', titre: 'Utilisateurs', icon: Users, color: 'bg-indigo-100 text-indigo-700',
    steps: [
      {
        icon: Users, titre: 'Gestion des comptes',
        contenu: [
          'Créez des comptes pour : médecins, internes, stagiaires, infirmiers et secrétaires.',
          'Définissez le rôle, la spécialité (pour les médecins) et le statut (actif/inactif).',
          'Les permissions sont automatiquement attribuées selon le rôle.',
        ],
      },
      {
        icon: Shield, titre: 'Permissions',
        contenu: [
          'Personnalisez les permissions de chaque utilisateur au-delà de son rôle.',
          'Les permissions couvrent : lecture, écriture et suppression par module.',
        ],
      },
    ],
  },
  {
    id: 'securite', titre: 'Sécurité', icon: Shield, color: 'bg-red-100 text-red-700',
    steps: [
      {
        icon: Shield, titre: 'Tableau de bord sécurité',
        contenu: [
          'Surveillez les tentatives de connexion échouées et les alertes de sécurité.',
          'Consultez les sessions actives et forcez la déconnexion si nécessaire.',
          'Bloquez des adresses IP suspectes depuis le panneau de gestion.',
        ],
      },
      {
        icon: ClipboardList, titre: 'Logs d\'actions',
        contenu: [
          'Chaque action importante est enregistrée : création, modification, suppression.',
          'Filtrez les logs par utilisateur, type d\'action ou période.',
        ],
      },
    ],
  },
];

const GUIDE_MEDECIN: GuideSection[] = [
  {
    id: 'dashboard', titre: 'Mon tableau de bord', icon: LayoutDashboard, color: 'bg-cyan-100 text-cyan-700',
    steps: [
      {
        icon: LayoutDashboard, titre: 'Vue d\'ensemble',
        contenu: [
          'Vos statistiques personnelles : nombre de patients, RDV du jour, confirmés.',
          'Liste des rendez-vous du jour triés par heure.',
          'Liste de vos patients récents pour un accès rapide.',
        ],
      },
    ],
  },
  {
    id: 'patients', titre: 'Mes patients', icon: Users, color: 'bg-blue-100 text-blue-700',
    steps: [
      {
        icon: Users, titre: 'Patients externes',
        contenu: [
          'Vos patients en consultation externe. Recherchez par nom ou numéro de dossier.',
          'Cliquez sur un patient pour ouvrir son dossier médical complet.',
        ],
      },
      {
        icon: Bed, titre: 'Patients hospitalisés',
        contenu: [
          'Vos patients actuellement hospitalisés avec leur lit et service.',
          'Utilisez "Hospitaliser" depuis le dossier patient pour admettre un patient externe.',
          '"Rendre externe" pour sortir un patient de l\'hospitalisation.',
          '"Changer de lit" pour transférer un patient vers un autre lit disponible.',
        ],
      },
    ],
  },
  {
    id: 'dossier', titre: 'Dossier médical', icon: FileText, color: 'bg-purple-100 text-purple-700',
    steps: [
      {
        icon: Stethoscope, titre: 'Observations',
        contenu: [
          'Saisissez les observations médicales : motif, histoire de la maladie, antécédents.',
          'Remplissez l\'examen général : température, FC, TA, SpO2, poids, IMC.',
          'Notez le diagnostic retenu et la conduite à tenir.',
        ],
      },
      {
        icon: Beaker, titre: 'Biologie',
        contenu: [
          'Saisissez les résultats : créatinine, glycémie, CRP, INR, NFS.',
          'Les valeurs hors norme sont affichées en rouge avec badge ÉLEVÉ ou BAS.',
          'Téléchargez les bilans en PDF ou en archive ZIP.',
        ],
      },
      {
        icon: Pill, titre: 'Ordonnances',
        contenu: [
          'Créez des ordonnances avec un ou plusieurs médicaments.',
          'Pour chaque médicament : dosage, voie, fréquence, durée et instructions.',
          'Les médicaments d\'une même ordonnance sont groupés automatiquement.',
        ],
      },
      {
        icon: ClipboardList, titre: 'Compte rendu d\'hospitalisation',
        contenu: [
          'Disponible uniquement pour les patients hospitalisés.',
          'Remplissez : résumé, diagnostic de sortie, traitement de sortie, modalité.',
          'Les modalités : Guéri, Amélioré, Transféré, Décès.',
        ],
      },
    ],
  },
  {
    id: 'planning', titre: 'Planning', icon: Calendar, color: 'bg-orange-100 text-orange-700',
    steps: [
      {
        icon: Calendar, titre: 'Mes RDV',
        contenu: [
          'La grille affiche uniquement vos rendez-vous du jour sélectionné.',
          'Naviguez entre les jours avec les flèches ou le mini-calendrier.',
          'Cliquez sur un créneau vide pour planifier un nouveau RDV.',
        ],
      },
    ],
  },
];

const GUIDE_SECRETAIRE: GuideSection[] = [
  {
    id: 'dashboard', titre: 'Tableau de bord', icon: LayoutDashboard, color: 'bg-cyan-100 text-cyan-700',
    steps: [
      {
        icon: LayoutDashboard, titre: 'Vue d\'ensemble',
        contenu: [
          'Statistiques du jour : RDV total, en attente, annulés, nombre de patients.',
          'Liste des rendez-vous du jour avec statut et heure.',
          'Cliquez sur "Voir tout" pour accéder au planning complet.',
        ],
      },
    ],
  },
  {
    id: 'planning', titre: 'Planning RDV', icon: Calendar, color: 'bg-orange-100 text-orange-700',
    steps: [
      {
        icon: Calendar, titre: 'Gérer les RDV',
        contenu: [
          'Créez, modifiez et annulez les rendez-vous pour tous les médecins.',
          'Filtrez par médecin, statut ou type de consultation.',
          'Confirmez les RDV en attente depuis le modal de détail.',
        ],
      },
      {
        icon: Download, titre: 'Ticket PDF',
        contenu: [
          'Générez et imprimez le ticket de RDV pour le patient depuis le modal de détail.',
          'Le ticket contient : patient, médecin, date, heure et motif.',
        ],
      },
    ],
  },
  {
    id: 'patients', titre: 'Patients', icon: Users, color: 'bg-blue-100 text-blue-700',
    steps: [
      {
        icon: Users, titre: 'Accès limité',
        contenu: [
          'En tant que secrétaire, vous accédez uniquement à l\'onglet Documents du dossier patient.',
          'Vous pouvez ajouter, consulter et supprimer des documents administratifs.',
          'Les données médicales sont réservées au personnel soignant.',
        ],
      },
      {
        icon: FileText, titre: 'Documents',
        contenu: [
          'Ajoutez des documents : ordonnances scannées, résultats, courriers, images.',
          'Téléchargez les documents individuellement ou en archive ZIP.',
          'Cliquez sur "Voir" pour prévisualiser un document dans le navigateur.',
        ],
      },
    ],
  },
];

const GUIDE_INTERNE: GuideSection[] = [
  {
    id: 'acces', titre: 'Votre accès', icon: Shield, color: 'bg-cyan-100 text-cyan-700',
    steps: [
      {
        icon: Shield, titre: 'Rôle interne',
        contenu: [
          'En tant qu\'interne, vous avez accès à l\'ensemble du dossier médical en lecture et écriture.',
          'Vous pouvez créer des observations, bilans, soins et ordonnances.',
          'La validation finale de certains actes peut nécessiter une vérification du médecin responsable.',
        ],
      },
    ],
  },
  {
    id: 'dossier', titre: 'Dossier médical', icon: FileText, color: 'bg-purple-100 text-purple-700',
    steps: [
      {
        icon: Stethoscope, titre: 'Saisie médicale',
        contenu: [
          'Saisissez les observations médicales sous supervision du médecin référent.',
          'Créez les bilans biologiques et interprétez les résultats.',
          'Rédigez les ordonnances qui seront vérifiées par le médecin.',
        ],
      },
      {
        icon: Syringe, titre: 'Soins',
        contenu: [
          'Enregistrez les soins médicaux (ETT, ETO) et infirmiers (ECG, injections).',
          'Le bouton "Marquer vérifié" permet au médecin de valider votre saisie.',
        ],
      },
    ],
  },
];

const GUIDE_STAGIAIRE: GuideSection[] = [
  {
    id: 'acces', titre: 'Votre accès', icon: Shield, color: 'bg-cyan-100 text-cyan-700',
    steps: [
      {
        icon: Shield, titre: 'Rôle stagiaire',
        contenu: [
          'En tant que stagiaire, vous avez accès au dossier médical en lecture et écriture limitée.',
          'Vos saisies sont visibles par l\'équipe médicale et peuvent être vérifiées.',
          'Respectez la confidentialité des données patients à tout moment.',
        ],
      },
    ],
  },
  {
    id: 'dossier', titre: 'Dossier médical', icon: FileText, color: 'bg-purple-100 text-purple-700',
    steps: [
      {
        icon: Eye, titre: 'Consultation',
        contenu: [
          'Consultez les observations, bilans, soins et traitements des patients.',
          'Vous pouvez créer des observations et bilans sous supervision.',
          'Les données sont en lecture seule pour certains modules sensibles.',
        ],
      },
    ],
  },
];

const GUIDE_INFIRMIER: GuideSection[] = [
  {
    id: 'acces', titre: 'Votre accès', icon: Shield, color: 'bg-cyan-100 text-cyan-700',
    steps: [
      {
        icon: Shield, titre: 'Rôle infirmier',
        contenu: [
          'Vous avez accès aux soins infirmiers, soins médicaux, observations et traitements.',
          'Votre rôle principal est la saisie et le suivi des soins quotidiens.',
        ],
      },
    ],
  },
  {
    id: 'soins', titre: 'Soins infirmiers', icon: Syringe, color: 'bg-green-100 text-green-700',
    steps: [
      {
        icon: Syringe, titre: 'Saisie des soins',
        contenu: [
          'Enregistrez les soins réalisés : ECG, ECG DII Long, injection IV/IM, PSE, pansement.',
          'Notez l\'heure exacte de réalisation et votre nom comme réalisateur.',
          'Cliquez sur "Marquer vérifié" après validation par le médecin.',
        ],
      },
      {
        icon: Pill, titre: 'Suivi des traitements',
        contenu: [
          'Consultez les ordonnances actives pour administrer les médicaments.',
          'Vérifiez le dosage, la voie d\'administration et la fréquence avant toute administration.',
        ],
      },
    ],
  },
];

const GUIDES_BY_ROLE: Record<string, { titre: string; sections: GuideSection[] }> = {
  admin:     { titre: 'Guide Administrateur',  sections: GUIDE_ADMIN      },
  medecin:   { titre: 'Guide Médecin',          sections: GUIDE_MEDECIN    },
  secretaire:{ titre: 'Guide Secrétaire',       sections: GUIDE_SECRETAIRE },
  interne:   { titre: 'Guide Interne',          sections: GUIDE_INTERNE    },
  stagiaire: { titre: 'Guide Stagiaire',        sections: GUIDE_STAGIAIRE  },
  infirmier: { titre: 'Guide Infirmier',        sections: GUIDE_INFIRMIER  },
};

// ── Composant HelpButton ──────────────────────────────────────────────────────

export function HelpButton() {
  const { user }     = useAuth();
  const [open,       setOpen]       = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const role  = user?.role ?? 'admin';
  const guide = GUIDES_BY_ROLE[role] ?? GUIDES_BY_ROLE['admin'];

  const toggleSection = (id: string) =>
    setActiveSection(prev => prev === id ? null : id);

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Aide et guide d'utilisation"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
      >
        <HelpCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Modal guide */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">{guide.titre}</h2>
                  <p className="text-cyan-100 text-xs">CENHOSOA — Système de gestion hospitalière</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fermer"
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Corps — accordéon par section */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {guide.sections.map(section => {
                const Icon      = section.icon;
                const isOpen    = activeSection === section.id;
                return (
                  <div key={section.id}>
                    {/* Section header */}
                    <button onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${section.color} rounded-lg flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">{section.titre}</span>
                      </div>
                      {isOpen
                        ? <ChevronDown className="w-4 h-4 text-gray-400" />
                        : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </button>

                    {/* Steps */}
                    {isOpen && (
                      <div className="bg-gray-50 px-5 pb-4 space-y-4">
                        {section.steps.map((step, si) => {
                          const StepIcon = step.icon;
                          return (
                            <div key={si} className="bg-white rounded-xl border border-gray-100 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <StepIcon className="w-4 h-4 text-cyan-500 shrink-0" />
                                <h4 className="text-sm font-bold text-gray-800">{step.titre}</h4>
                              </div>
                              <ul className="space-y-1.5">
                                {step.contenu.map((ligne, li) => (
                                  <li key={li} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 shrink-0" />
                                    {ligne}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <p className="text-xs text-gray-400">CENHOSOA v1.0 — Cardiologie</p>
              <button onClick={() => setOpen(false)}
                className="text-xs font-semibold text-cyan-600 hover:text-cyan-700">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}