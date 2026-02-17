export interface DocumentPatient {
  id_document: number;
  id_patient: number;
  id_admission?: number; // Optionnel - lien avec admission si patient hospitalisé
  
  titre: string;
  type_fichier: 'pdf' | 'image' | 'video'; // Type de fichier
  nom_fichier: string;                      // Nom original du fichier
  url_fichier: string;                      // URL de stockage (S3, local, etc.)
  taille_fichier: number;                   // Taille en octets
  description?: string;
  
  // Métadonnées
  date_ajout: Date;
  heure_ajout: string;
  ajoute_par?: string; // Qui a ajouté le document
  created_at: Date;
  updated_at: Date;
}