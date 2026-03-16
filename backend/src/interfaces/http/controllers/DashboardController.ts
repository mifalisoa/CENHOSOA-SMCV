// backend/src/interfaces/http/controllers/DashboardController.ts

import { Request, Response } from 'express';
import { pool } from '../../../config/database';

export class DashboardController {

  // GET /api/dashboard/stats
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [
        cardiologieR, usicR,
        litsLibresCardR, litsTotalCardR,
        litsLibresUsicR, litsTotalUsicR,
        ecgHospR, ecgDiiHospR, ettHospR, etoHospR,
        consultationsR,
        ecgExtR, ecgDiiExtR, ettExtR, etoExtR,
      ] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM admission a LEFT JOIN lit l ON a.id_lit = l.id_lit WHERE a.statut_admission = 'en_cours' AND (l.categorie IN ('1','2','3') OR a.id_lit IS NULL)`),
        pool.query(`SELECT COUNT(*) FROM admission a INNER JOIN lit l ON a.id_lit = l.id_lit WHERE a.statut_admission = 'en_cours' AND l.categorie = 'USIC'`),
        pool.query(`SELECT COUNT(*) FROM lit WHERE categorie IN ('1','2','3') AND statut_lit = 'disponible' AND actif_lit = true`),
        pool.query(`SELECT COUNT(*) FROM lit WHERE categorie IN ('1','2','3') AND actif_lit = true`),
        pool.query(`SELECT COUNT(*) FROM lit WHERE categorie = 'USIC' AND statut_lit = 'disponible' AND actif_lit = true`),
        pool.query(`SELECT COUNT(*) FROM lit WHERE categorie = 'USIC' AND actif_lit = true`),
        pool.query(`SELECT COUNT(*) FROM soins_infirmiers si INNER JOIN patients p ON si.id_patient = p.id_patient WHERE si.ecg IS NOT NULL AND si.ecg != '' AND si.date_soin = $1 AND p.statut_patient IN ('hospitalise','hospitalisé')`, [today]),
        pool.query(`SELECT COUNT(*) FROM soins_infirmiers si INNER JOIN patients p ON si.id_patient = p.id_patient WHERE si.ecg_dii_long IS NOT NULL AND si.ecg_dii_long != '' AND si.date_soin = $1 AND p.statut_patient IN ('hospitalise','hospitalisé')`, [today]),
        pool.query(`SELECT COUNT(*) FROM soins_medicaux sm INNER JOIN patients p ON sm.id_patient = p.id_patient WHERE sm.ett IS NOT NULL AND sm.ett != '' AND sm.date_soin = $1 AND p.statut_patient IN ('hospitalise','hospitalisé')`, [today]),
        pool.query(`SELECT COUNT(*) FROM soins_medicaux sm INNER JOIN patients p ON sm.id_patient = p.id_patient WHERE sm.eto IS NOT NULL AND sm.eto != '' AND sm.date_soin = $1 AND p.statut_patient IN ('hospitalise','hospitalisé')`, [today]),
        pool.query(`SELECT COUNT(*) FROM rendez_vous WHERE type_rdv = 'consultation' AND date_rdv = $1 AND statut_rdv != 'annule'`, [today]),
        pool.query(`SELECT COUNT(*) FROM soins_infirmiers si INNER JOIN patients p ON si.id_patient = p.id_patient WHERE si.ecg IS NOT NULL AND si.ecg != '' AND si.date_soin = $1 AND p.statut_patient = 'externe'`, [today]),
        pool.query(`SELECT COUNT(*) FROM soins_infirmiers si INNER JOIN patients p ON si.id_patient = p.id_patient WHERE si.ecg_dii_long IS NOT NULL AND si.ecg_dii_long != '' AND si.date_soin = $1 AND p.statut_patient = 'externe'`, [today]),
        pool.query(`SELECT COUNT(*) FROM soins_medicaux sm INNER JOIN patients p ON sm.id_patient = p.id_patient WHERE sm.ett IS NOT NULL AND sm.ett != '' AND sm.date_soin = $1 AND p.statut_patient = 'externe'`, [today]),
        pool.query(`SELECT COUNT(*) FROM soins_medicaux sm INNER JOIN patients p ON sm.id_patient = p.id_patient WHERE sm.eto IS NOT NULL AND sm.eto != '' AND sm.date_soin = $1 AND p.statut_patient = 'externe'`, [today]),
      ]);

      res.json({
        success: true,
        data: {
          hospitalises: {
            cardiologie:  parseInt(cardiologieR.rows[0].count),
            usic:         parseInt(usicR.rows[0].count),
            ecg:          parseInt(ecgHospR.rows[0].count),
            ecg_dii_long: parseInt(ecgDiiHospR.rows[0].count),
            ett:          parseInt(ettHospR.rows[0].count),
            eto:          parseInt(etoHospR.rows[0].count),
          },
          externes: {
            consultations: parseInt(consultationsR.rows[0].count),
            ecg:           parseInt(ecgExtR.rows[0].count),
            ecg_dii_long:  parseInt(ecgDiiExtR.rows[0].count),
            ett:           parseInt(ettExtR.rows[0].count),
            eto:           parseInt(etoExtR.rows[0].count),
          },
          lits: {
            cardiologie: { libres: parseInt(litsLibresCardR.rows[0].count), total: parseInt(litsTotalCardR.rows[0].count) },
            usic:        { libres: parseInt(litsLibresUsicR.rows[0].count), total: parseInt(litsTotalUsicR.rows[0].count) },
          }
        }
      });
    } catch (error: unknown) {
      console.error('❌ [DashboardController] getStats:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur stats dashboard' } });
    }
  }

  // GET /api/dashboard/detail/:type?date=YYYY-MM-DD
  async getDetail(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

      const hospFilter = `p.statut_patient IN ('hospitalise','hospitalisé')`;
      const extFilter  = `p.statut_patient = 'externe'`;

      let rows: unknown[] = [];

      switch (type) {
        case 'cardiologie': {
          const r = await pool.query(`
            SELECT p.id_patient, p.nom_patient, p.prenom_patient, p.num_dossier,
              l.numero_lit, l.categorie, l.service_lit,
              a.date_admission, a.motif_admission,
              u.nom AS medecin_nom, u.prenom AS medecin_prenom
            FROM admission a
            INNER JOIN patients     p ON a.id_patient = p.id_patient
            LEFT  JOIN lit          l ON a.id_lit     = l.id_lit
            LEFT  JOIN utilisateurs u ON a.id_docteur = u.id_user
            WHERE a.statut_admission = 'en_cours'
              AND (l.categorie IN ('1','2','3') OR a.id_lit IS NULL)
            ORDER BY a.date_admission DESC
          `);
          rows = r.rows; break;
        }
        case 'usic': {
          const r = await pool.query(`
            SELECT p.id_patient, p.nom_patient, p.prenom_patient, p.num_dossier,
              l.numero_lit, l.categorie, l.service_lit,
              a.date_admission, a.motif_admission,
              u.nom AS medecin_nom, u.prenom AS medecin_prenom
            FROM admission a
            INNER JOIN patients     p ON a.id_patient = p.id_patient
            INNER JOIN lit          l ON a.id_lit     = l.id_lit
            LEFT  JOIN utilisateurs u ON a.id_docteur = u.id_user
            WHERE a.statut_admission = 'en_cours' AND l.categorie = 'USIC'
            ORDER BY a.date_admission DESC
          `);
          rows = r.rows; break;
        }
        case 'hosp_ecg': case 'ext_ecg': {
          const filter = type === 'hosp_ecg' ? hospFilter : extFilter;
          const r = await pool.query(`SELECT p.id_patient, p.nom_patient, p.prenom_patient, p.num_dossier, si.date_soin, si.heure_soin, si.ecg, si.realise_par, si.verifie FROM soins_infirmiers si INNER JOIN patients p ON si.id_patient = p.id_patient WHERE si.ecg IS NOT NULL AND si.ecg != '' AND si.date_soin = $1 AND ${filter} ORDER BY si.heure_soin ASC`, [date]);
          rows = r.rows; break;
        }
        case 'hosp_ecg_dii_long': case 'ext_ecg_dii_long': {
          const filter = type === 'hosp_ecg_dii_long' ? hospFilter : extFilter;
          const r = await pool.query(`SELECT p.id_patient, p.nom_patient, p.prenom_patient, p.num_dossier, si.date_soin, si.heure_soin, si.ecg_dii_long, si.realise_par, si.verifie FROM soins_infirmiers si INNER JOIN patients p ON si.id_patient = p.id_patient WHERE si.ecg_dii_long IS NOT NULL AND si.ecg_dii_long != '' AND si.date_soin = $1 AND ${filter} ORDER BY si.heure_soin ASC`, [date]);
          rows = r.rows; break;
        }
        case 'hosp_ett': case 'ext_ett': {
          const filter = type === 'hosp_ett' ? hospFilter : extFilter;
          const r = await pool.query(`SELECT p.id_patient, p.nom_patient, p.prenom_patient, p.num_dossier, sm.date_soin, sm.heure_soin, sm.ett, sm.realise_par, sm.verifie FROM soins_medicaux sm INNER JOIN patients p ON sm.id_patient = p.id_patient WHERE sm.ett IS NOT NULL AND sm.ett != '' AND sm.date_soin = $1 AND ${filter} ORDER BY sm.heure_soin ASC`, [date]);
          rows = r.rows; break;
        }
        case 'hosp_eto': case 'ext_eto': {
          const filter = type === 'hosp_eto' ? hospFilter : extFilter;
          const r = await pool.query(`SELECT p.id_patient, p.nom_patient, p.prenom_patient, p.num_dossier, sm.date_soin, sm.heure_soin, sm.eto, sm.realise_par, sm.verifie FROM soins_medicaux sm INNER JOIN patients p ON sm.id_patient = p.id_patient WHERE sm.eto IS NOT NULL AND sm.eto != '' AND sm.date_soin = $1 AND ${filter} ORDER BY sm.heure_soin ASC`, [date]);
          rows = r.rows; break;
        }
        case 'consultations': {
          const r = await pool.query(`
            SELECT p.id_patient, p.nom_patient, p.prenom_patient, p.num_dossier,
              r.heure_rdv, r.motif_rdv, r.statut_rdv, r.type_rdv,
              u.nom AS medecin_nom, u.prenom AS medecin_prenom
            FROM rendez_vous r
            INNER JOIN patients     p ON r.id_patient = p.id_patient
            LEFT  JOIN utilisateurs u ON r.id_docteur = u.id_user
            WHERE r.type_rdv = 'consultation' AND r.date_rdv = $1 AND r.statut_rdv != 'annule'
            ORDER BY r.heure_rdv ASC
          `, [date]);
          rows = r.rows; break;
        }
        default:
          res.status(400).json({ success: false, error: { message: 'Type invalide' } });
          return;
      }

      res.json({ success: true, data: rows });
    } catch (error: unknown) {
      console.error('❌ [DashboardController] getDetail:', error);
      res.status(500).json({ success: false, error: { message: 'Erreur détail dashboard' } });
    }
  }
}