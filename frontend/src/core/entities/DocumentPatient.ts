export interface DocumentPatient {
  id_document: number;
  id_patient: number;
  id_admission?: number;
  
  titre: string;
  type_fichier: 'pdf' | 'image' | 'video';
  nom_fichier: string;
  url_fichier: string;
  taille_fichier: number;
  description?: string;
  
  date_ajout: Date | string;
  heure_ajout: string;
  ajoute_par?: string;
  
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateDocumentPatientDTO {
  id_patient: number;
  id_admission?: number;
  titre: string;
  type_fichier: 'pdf' | 'image' | 'video';
  nom_fichier: string;
  url_fichier: string;
  taille_fichier: number;
  description?: string;
  date_ajout: string;
  heure_ajout: string;
  ajoute_par?: string;
}