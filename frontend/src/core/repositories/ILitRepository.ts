// frontend/src/core/repositories/ILitRepository.ts
//
// Contrat frontend pour le module Lit.
// Miroir exact des routes exposees par backend/src/interfaces/http/routes/lit.routes.ts
// et implementees dans backend/src/interfaces/http/controllers/LitController.ts.
//
// IMPORTANT : contrairement a IAdmissionRepository, il n'y a pas de pagination ici.
// GET /api/lits renvoie la liste complete des lits (24 lits CENHOSOA au total,
// volume fixe et connu -> la pagination n'a pas de sens pour ce module).

import type { Lit, LitWithOccupation, CreateLitDTO, UpdateLitDTO } from '../entities/Lit';

// Forme des statistiques renvoyees par GET /api/lits/statistiques.
// Le controleur backend ne type pas explicitement ce retour (litService.getStatistiques()),
// donc cette forme est une hypothese a confirmer aupres du backend avant de l'utiliser
// dans un composant. Ne pas se fier a ce type sans verification.
export interface LitStatistiques {
  total: number;
  occupes: number;
  disponibles: number;
  [key: string]: unknown; // champs additionnels possibles, non confirmes
}

export interface ILitRepository {
  // GET /api/lits
  // Retourne LitWithOccupation, pas Lit : chaque lit est enrichi du patient
  // qui l'occupe actuellement (patient_actuel), quand applicable.
  getAll(): Promise<LitWithOccupation[]>;

  // GET /api/lits/statistiques
  getStatistiques(): Promise<LitStatistiques>;

  // GET /api/lits/:id
  getById(id: number): Promise<Lit>;

  // POST /api/lits
  create(data: CreateLitDTO): Promise<Lit>;

  // PUT /api/lits/:id
  update(id: number, data: UpdateLitDTO): Promise<Lit>;

  // DELETE /api/lits/:id
  delete(id: number): Promise<void>;

  // POST /api/lits/:id/liberer
  // Libere un lit occupe (le remet disponible). Ne prend pas de body.
  liberer(id: number): Promise<Lit>;

  // POST /api/lits/initialiser
  // Action d'amorcage : cree les 24 lits CENHOSOA par defaut.
  // A n'utiliser qu'une seule fois en configuration initiale, pas dans le flux normal.
  initialiser(): Promise<{ success: boolean; message: string }>;
}