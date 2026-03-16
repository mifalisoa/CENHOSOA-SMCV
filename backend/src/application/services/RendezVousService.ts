// backend/src/application/services/RendezVousService.ts

import { IRendezVousRepository } from '../../domain/repositories/IRendezVousRepository';
import type { 
  RendezVous, 
  CreateRendezVousDTO, 
  UpdateRendezVousDTO
} from '../../domain/entities/RendezVous';
import type { PaginatedResponse, PaginationParams } from '../../shared/types';

export class RendezVousService {
  constructor(private repository: IRendezVousRepository) {}

  async createRendezVous(data: CreateRendezVousDTO): Promise<RendezVous> {
    const dateObj = new Date(data.date_rdv);
    const isAvailable = await this.repository.checkAvailability(
      data.id_docteur,
      dateObj,
      data.heure_rdv
    );
    if (!isAvailable) {
      throw new Error('Créneau déjà occupé');
    }
    return await this.repository.create(data);
  }

  async getAllRendezVous(): Promise<RendezVous[]> {
    return [];
  }

  async getRendezVousByDate(date: string): Promise<RendezVous[]> {
    const dateObj = new Date(date);
    return await this.repository.findByDate(dateObj);
  }

  async getRendezVousByPeriod(dateDebut: string, dateFin: string): Promise<RendezVous[]> {
    const dateDebutObj = new Date(dateDebut);
    const dateFinObj = new Date(dateFin);
    return await this.repository.findByPeriod(dateDebutObj, dateFinObj);
  }

  async getRendezVousByPatient(patientId: number, params: PaginationParams = {}): Promise<PaginatedResponse<RendezVous>> {
    return await this.repository.findByPatient(patientId, params);
  }

  async getRendezVousByDocteur(docteurId: number, params: PaginationParams = {}): Promise<PaginatedResponse<RendezVous>> {
    return await this.repository.findByDocteur(docteurId, params);
  }

  async getRendezVousById(id: number): Promise<RendezVous | null> {
    return await this.repository.findById(id);
  }

  async updateRendezVous(id: number, data: UpdateRendezVousDTO): Promise<RendezVous | null> {
    if (data.id_docteur || data.date_rdv || data.heure_rdv) {
      const rdv = await this.repository.findById(id);
      if (!rdv) throw new Error('Rendez-vous non trouvé');

      const docteurId = data.id_docteur ?? rdv.id_docteur;
      const dateStr = data.date_rdv ?? (typeof rdv.date_rdv === 'string' ? rdv.date_rdv : rdv.date_rdv.toISOString().split('T')[0]);
      const heure = data.heure_rdv ?? rdv.heure_rdv;
      const dateObj = new Date(dateStr);
      const isAvailable = await this.repository.checkAvailability(docteurId, dateObj, heure);

      if (!isAvailable) {
        const rdvsDate = await this.repository.findByDate(dateObj, docteurId);
        const conflictRdv = rdvsDate.find(r => r.heure_rdv === heure);
        if (conflictRdv && conflictRdv.id_rdv !== id) {
          throw new Error('Conflit d\'horaire : ce créneau est déjà occupé');
        }
      }
    }
    return await this.repository.update(id, data);
  }

  async confirmerRendezVous(id: number): Promise<boolean> {
    return await this.repository.confirm(id);
  }

  async annulerRendezVous(id: number, raison: string = 'Non spécifié'): Promise<boolean> {
    return await this.repository.cancel(id, raison);
  }

  async marquerTermine(id: number): Promise<boolean> {
    return await this.repository.complete(id);
  }

  async marquerAbsent(id: number): Promise<boolean> {
    const updated = await this.repository.update(id, { statut_rdv: 'absent' });
    return updated !== null;
  }

  async reporterRendezVous(id: number, nouvelleDate: string, nouvelleHeure: string): Promise<RendezVous | null> {
    const rdv = await this.repository.findById(id);
    if (!rdv) throw new Error('Rendez-vous non trouvé');

    const dateObj = new Date(nouvelleDate);
    const isAvailable = await this.repository.checkAvailability(rdv.id_docteur, dateObj, nouvelleHeure);
    if (!isAvailable) throw new Error('Conflit d\'horaire : le nouveau créneau est déjà occupé');

    return await this.repository.update(id, {
      date_rdv: nouvelleDate,
      heure_rdv: nouvelleHeure,
      statut_rdv: 'planifie'  // ← sans accent
    });
  }

  async deleteRendezVous(id: number): Promise<boolean> {
    return await this.repository.cancel(id, 'Supprimé');
  }

  async getCreneauxDisponibles(
    docteurId: number,
    date: string,
    heureDebut: string = '08:00',
    heureFin: string = '18:00',
    dureeCreneauMinutes: number = 30
  ): Promise<string[]> {
    const dateObj = new Date(date);
    const rdvs = await this.repository.findByDate(dateObj, docteurId);
    const creneaux: string[] = [];
    let heureActuelle = heureDebut;

    while (heureActuelle < heureFin) {
      const estOccupe = rdvs.some(rdv => rdv.heure_rdv === heureActuelle);
      if (!estOccupe) creneaux.push(heureActuelle);

      const [h, m] = heureActuelle.split(':').map(Number);
      const prochainCreneau = new Date(0, 0, 0, h, m + dureeCreneauMinutes);
      heureActuelle = `${String(prochainCreneau.getHours()).padStart(2, '0')}:${String(prochainCreneau.getMinutes()).padStart(2, '0')}`;
    }

    return creneaux;
  }
}