import { IEvolutionPatientRepository } from '../../../domain/repositories/IEvolutionPatientRepository';
import { IObservationRepository } from '../../../domain/repositories/IObservationRepository';
import { EvolutionPatient, CreateEvolutionPatientDTO } from '../../../domain/entities/EvolutionPatient';

export class CreateEvolution {
  constructor(
    private evolutionRepository: IEvolutionPatientRepository,
    private observationRepository: IObservationRepository,
  ) {}

  async execute(data: CreateEvolutionPatientDTO): Promise<EvolutionPatient> {
    // Vérification : l'observation parente existe
    const observation = await this.observationRepository.findById(data.id_observation);
    if (!observation) {
      throw new Error('Observation parente non trouvée');
    }

    // Vérification : l'observation appartient bien au patient
    if (observation.id_patient !== data.id_patient) {
      throw new Error('Cette observation n\'appartient pas à ce patient');
    }

    // Champs obligatoires
    if (!data.medecin?.trim()) {
      throw new Error('Le médecin est requis');
    }
    if (!data.heure_visite?.trim()) {
      throw new Error('L\'heure de visite est requise');
    }

    return await this.evolutionRepository.create({
      id_observation:                  data.id_observation,
      id_patient:                      data.id_patient,
      date_visite:                     new Date(data.date_visite),
      heure_visite:                    data.heure_visite,
      medecin:                         data.medecin,
      resume_patient:                  data.resume_patient,
      parametres:                      data.parametres,
      examen_physique_central:         data.examen_physique_central,
      examen_physique_peripherique:    data.examen_physique_peripherique,
      resultats_examens_paracliniques: data.resultats_examens_paracliniques,
      traitement:                      data.traitement,
      problemes_poses:                 data.problemes_poses,
      cat:                             data.cat,
    });
  }
}