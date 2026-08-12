// backend/src/domain/entities/PieceJointe.ts

export type EntiteType =
  | 'bilan_biologique'
  | 'soin_medical'
  | 'soin_infirmier'
  | 'traitement'
  | 'observation'
  | 'compte_rendu'
  | 'evolution_patient';

export type TypePieceJointe = 'pdf' | 'image' | 'video';

export interface PieceJointe {
  id_piece_jointe: number;
  entite_type:     EntiteType;
  entite_id:        number;
  url_fichier:      string;
  nom_fichier:      string;
  type_fichier:     TypePieceJointe;
  taille_fichier:   number;
  ajoute_par?:       string;
  date_ajout:        Date;
}

export interface CreatePieceJointeDTO {
  entite_type:     EntiteType;
  entite_id:        number;
  url_fichier:      string;
  nom_fichier:      string;
  type_fichier:     TypePieceJointe;
  taille_fichier:   number;
  ajoute_par?:       string;
}