// backend/src/interfaces/http/controllers/SearchController.ts

import { Request, Response } from 'express';
import { pool } from '../../../config/database';

interface SearchResult {
  type:        'patient' | 'utilisateur' | 'rendez_vous' | 'admission';
  id:          number;
  titre:       string;
  sous_titre:  string;
  meta?:       string;
  url:         string;
}

export class SearchController {

  async search(req: Request, res: Response): Promise<void> {
    const q = (req.query.q as string ?? '').trim();

    if (!q || q.length < 2) {
      res.json({ data: [], total: 0 });
      return;
    }

    const term = `%${q}%`;
    const results: SearchResult[] = [];

    try {
      await Promise.all([

        // ── Patients ──────────────────────────────────────────────────────────
        (async () => {
          const { rows } = await pool.query<{
            id_patient:      number;
            nom_patient:     string;
            prenom_patient:  string;
            num_dossier:     string;
            statut_patient:  string;
            tel_patient:     string | null;
          }>(
            `SELECT id_patient, nom_patient, prenom_patient, num_dossier, statut_patient, tel_patient
             FROM patients
             WHERE LOWER(nom_patient)    ILIKE $1
                OR LOWER(prenom_patient) ILIKE $1
                OR LOWER(num_dossier)    ILIKE $1
                OR LOWER(tel_patient)    ILIKE $1
             ORDER BY nom_patient
             LIMIT 8`,
            [term]
          );
          rows.forEach(p => results.push({
            type:       'patient',
            id:         p.id_patient,
            titre:      `${p.nom_patient} ${p.prenom_patient}`,
            sous_titre: `Dossier ${p.num_dossier} · ${p.statut_patient === 'hospitalise' ? 'Hospitalisé' : 'Externe'}`,
            meta:       p.tel_patient ?? undefined,
            url:        `/patients/${p.id_patient}/dossier`,
          }));
        })(),

        // ── Utilisateurs ─────────────────────────────────────────────────────
        (async () => {
          const { rows } = await pool.query<{
            id_user:  number;
            nom:      string;
            prenom:   string;
            email:    string;
            role:     string;
            statut:   string;
          }>(
            `SELECT id_user, nom, prenom, email, role, statut
             FROM utilisateurs
             WHERE LOWER(nom)    ILIKE $1
                OR LOWER(prenom) ILIKE $1
                OR LOWER(email)  ILIKE $1
             ORDER BY nom
             LIMIT 5`,
            [term]
          );
          rows.forEach(u => results.push({
            type:       'utilisateur',
            id:         u.id_user,
            titre:      `${u.prenom} ${u.nom}`,
            sous_titre: `${u.role} · ${u.statut}`,
            meta:       u.email,
            url:        `/utilisateurs`,
          }));
        })(),

        // ── Rendez-vous ───────────────────────────────────────────────────────
        (async () => {
          const { rows } = await pool.query<{
            id_rdv:          number;
            heure_rdv:       string;
            date_rdv:        string;
            nom_patient:     string;
            prenom_patient:  string;
            type_rdv:        string;
            statut_rdv:      string;
          }>(
            `SELECT r.id_rdv, r.heure_rdv, r.date_rdv::text, r.type_rdv, r.statut_rdv,
                    p.nom_patient, p.prenom_patient
             FROM rendez_vous r
             JOIN patients p ON p.id_patient = r.id_patient
             WHERE LOWER(p.nom_patient)    ILIKE $1
                OR LOWER(p.prenom_patient) ILIKE $1
                OR r.date_rdv::text        ILIKE $1
             ORDER BY r.date_rdv DESC, r.heure_rdv
             LIMIT 5`,
            [term]
          );
          rows.forEach(r => results.push({
            type:       'rendez_vous',
            id:         r.id_rdv,
            titre:      `RDV — ${r.nom_patient} ${r.prenom_patient}`,
            sous_titre: `${new Date(r.date_rdv).toLocaleDateString('fr-FR')} à ${r.heure_rdv} · ${r.type_rdv}`,
            meta:       r.statut_rdv,
            url:        `/planning`,
          }));
        })(),

        // ── Admissions en cours ───────────────────────────────────────────────
        (async () => {
          const { rows } = await pool.query<{
            id_admission:    number;
            nom_patient:     string;
            prenom_patient:  string;
            num_dossier:     string;
            date_admission:  string;
            numero_lit:      string | null;
          }>(
            `SELECT a.id_admission, p.nom_patient, p.prenom_patient, p.num_dossier,
                    a.date_admission::text, l.numero_lit
             FROM admissions a
             JOIN patients p ON p.id_patient = a.id_patient
             LEFT JOIN lits l ON l.id_lit = a.id_lit
             WHERE a.statut_admission = 'en_cours'
               AND (LOWER(p.nom_patient)    ILIKE $1
                 OR LOWER(p.prenom_patient) ILIKE $1
                 OR LOWER(p.num_dossier)    ILIKE $1)
             ORDER BY a.date_admission DESC
             LIMIT 5`,
            [term]
          );
          rows.forEach(a => results.push({
            type:       'admission',
            id:         a.id_admission,
            titre:      `Admission — ${a.nom_patient} ${a.prenom_patient}`,
            sous_titre: `Depuis le ${new Date(a.date_admission).toLocaleDateString('fr-FR')}${a.numero_lit ? ` · Lit ${a.numero_lit}` : ''}`,
            meta:       a.num_dossier,
            url:        `/patients-hospitalises`,
          }));
        })(),

      ]);

      // Tri : patients en premier, puis par ordre d'apparition
      const order: SearchResult['type'][] = ['patient', 'utilisateur', 'rendez_vous', 'admission'];
      results.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

      res.json({ data: results, total: results.length });
    } catch (error) {
      console.error('❌ [Search] Erreur:', error);
      res.status(500).json({ message: 'Erreur lors de la recherche' });
    }
  }
}