// backend/src/interfaces/http/controllers/StatsController.ts
//
// Colonnes dates réelles par table :
// patients          → date_enregistrement
// rendez_vous       → date_creation_rdv
// admission         → date_admission (pas de created_at)
// observation       → created_at ✓
// bilans_biologiques→ created_at ✓
// soins_medicaux    → created_at ✓
// soins_infirmiers  → created_at ✓
// traitements       → created_at ✓
// comptes_rendus    → created_at ✓

import { Request, Response } from 'express';
import { pool } from '../../../config/database';

export class StatsController {

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const periode = (req.query.periode as string) || 'mois';

      const intervalMap: Record<string, string> = {
        semaine:   '7 days',
        mois:      '30 days',
        trimestre: '90 days',
        annee:     '365 days',
      };
      const interval = intervalMap[periode] || '30 days';

      const [
        patientsTotal,
        patientsStatuts,
        patientsNouveaux,
        patientsPrecedents,

        litsStats,
        litsParCategorie,

        rdvTotal,
        rdvAujourdhui,
        rdvSemaine,
        rdvParStatut,
        rdvParType,

        admissionsEnCours,
        admissionsTerminees,
        admissionsMois,
        admissionsDureeMoyenne,

        docsObservations,
        docsBilans,
        docsSoinsMedicaux,
        docsSoinsInfirmiers,
        docsTraitements,
        docsCompteRendus,

        historiquePatients,
        historiqueRdv,
        historiqueAdmissions,
      ] = await Promise.all([

        // ── Patients — colonne : date_enregistrement ──────────────────────
        pool.query(`SELECT COUNT(*) FROM patients`),

        pool.query(`
          SELECT statut_patient, COUNT(*) as count
          FROM patients GROUP BY statut_patient
        `),

        pool.query(`
          SELECT COUNT(*) FROM patients
          WHERE date_enregistrement >= NOW() - INTERVAL '${interval}'
        `),

        pool.query(`
          SELECT COUNT(*) FROM patients
          WHERE date_enregistrement >= NOW() - INTERVAL '${interval}' * 2
            AND date_enregistrement <  NOW() - INTERVAL '${interval}'
        `),

        // ── Lits — pas de colonne date (statut instantané) ────────────────
        pool.query(`
          SELECT
            COUNT(*)                                                  AS total,
            COUNT(*) FILTER (WHERE statut_lit = 'occupe')             AS occupes,
            COUNT(*) FILTER (WHERE statut_lit = 'disponible')         AS libres,
            COUNT(*) FILTER (WHERE statut_lit = 'maintenance')        AS maintenance
          FROM lit WHERE actif_lit = true
        `),

        pool.query(`
          SELECT
            categorie,
            COUNT(*)                                         AS total,
            COUNT(*) FILTER (WHERE statut_lit = 'occupe')    AS occupes,
            COUNT(*) FILTER (WHERE statut_lit = 'disponible') AS libres
          FROM lit WHERE actif_lit = true
          GROUP BY categorie ORDER BY categorie
        `),

        // ── Rendez-vous — colonne : date_creation_rdv ────────────────────
        pool.query(`
          SELECT COUNT(*) FROM rendez_vous
          WHERE date_creation_rdv >= NOW() - INTERVAL '${interval}'
        `),

        pool.query(`
          SELECT COUNT(*) FROM rendez_vous
          WHERE date_rdv = CURRENT_DATE AND statut_rdv != 'annule'
        `),

        pool.query(`
          SELECT COUNT(*) FROM rendez_vous
          WHERE date_rdv BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
            AND statut_rdv != 'annule'
        `),

        pool.query(`
          SELECT statut_rdv AS statut, COUNT(*) AS count
          FROM rendez_vous
          WHERE date_creation_rdv >= NOW() - INTERVAL '${interval}'
          GROUP BY statut_rdv
        `),

        pool.query(`
          SELECT type_rdv AS type, COUNT(*) AS count
          FROM rendez_vous
          WHERE date_creation_rdv >= NOW() - INTERVAL '${interval}'
          GROUP BY type_rdv
        `),

        // ── Admissions — colonne : date_admission ─────────────────────────
        pool.query(`SELECT COUNT(*) FROM admission WHERE statut_admission = 'en_cours'`),

        pool.query(`
          SELECT COUNT(*) FROM admission
          WHERE statut_admission = 'termine'
            AND date_admission >= NOW() - INTERVAL '${interval}'
        `),

        pool.query(`
          SELECT COUNT(*) FROM admission
          WHERE date_admission >= NOW() - INTERVAL '${interval}'
        `),

        pool.query(`
          SELECT ROUND(AVG(
            EXTRACT(EPOCH FROM (COALESCE(date_sortie_prevue, NOW()) - date_admission)) / 86400
          )::numeric, 1) AS duree_moyenne
          FROM admission
          WHERE date_admission >= NOW() - INTERVAL '${interval}'
        `),

        // ── Documents — tous ont created_at ──────────────────────────────
        pool.query(`SELECT COUNT(*) FROM observation        WHERE created_at >= NOW() - INTERVAL '${interval}'`),
        pool.query(`SELECT COUNT(*) FROM bilans_biologiques WHERE created_at >= NOW() - INTERVAL '${interval}'`),
        pool.query(`SELECT COUNT(*) FROM soins_medicaux     WHERE created_at >= NOW() - INTERVAL '${interval}'`),
        pool.query(`SELECT COUNT(*) FROM soins_infirmiers   WHERE created_at >= NOW() - INTERVAL '${interval}'`),
        pool.query(`SELECT COUNT(*) FROM traitements        WHERE created_at >= NOW() - INTERVAL '${interval}'`),
        pool.query(`SELECT COUNT(*) FROM comptes_rendus     WHERE created_at >= NOW() - INTERVAL '${interval}'`),

        // ── Historiques 30j ───────────────────────────────────────────────
        pool.query(`
          SELECT
            DATE(date_enregistrement) AS date,
            COUNT(*) AS nouveaux
          FROM patients
          WHERE date_enregistrement >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(date_enregistrement)
          ORDER BY date ASC
        `),

        pool.query(`
          SELECT
            DATE(date_creation_rdv) AS date,
            COUNT(*) AS count
          FROM rendez_vous
          WHERE date_creation_rdv >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(date_creation_rdv)
          ORDER BY date ASC
        `),

        pool.query(`
          SELECT
            DATE(date_admission) AS date,
            COUNT(*) AS count
          FROM admission
          WHERE date_admission >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(date_admission)
          ORDER BY date ASC
        `),
      ]);

      // ── Construction réponse ─────────────────────────────────────────────
      const statuts = Object.fromEntries(
        patientsStatuts.rows.map((r: { statut_patient: string; count: string }) =>
          [r.statut_patient, parseInt(r.count)]
        )
      );

      const total      = parseInt(patientsTotal.rows[0].count);
      const nouveaux   = parseInt(patientsNouveaux.rows[0].count);
      const precedents = parseInt(patientsPrecedents.rows[0].count);
      const evolution  = precedents > 0
        ? Math.round(((nouveaux - precedents) / precedents) * 100 * 10) / 10
        : nouveaux > 0 ? 100 : 0;

      const litsRow     = litsStats.rows[0];
      const litsTotal   = parseInt(litsRow.total);
      const litsOccupes = parseInt(litsRow.occupes);
      const tauxOccup   = litsTotal > 0 ? Math.round((litsOccupes / litsTotal) * 100) : 0;

      // Historique lits — taux actuel répété sur 30j (pas de colonne historique)
      const tauxLitsHisto = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          taux: tauxOccup,
        };
      });

      const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

      const docsObs  = parseInt(docsObservations.rows[0].count);
      const docsBio  = parseInt(docsBilans.rows[0].count);
      const docsSM   = parseInt(docsSoinsMedicaux.rows[0].count);
      const docsSI   = parseInt(docsSoinsInfirmiers.rows[0].count);
      const docsTrai = parseInt(docsTraitements.rows[0].count);
      const docsCR   = parseInt(docsCompteRendus.rows[0].count);

      res.json({
        success: true,
        data: {
          patients: {
            total,
            externes:      statuts['externe']    || 0,
            hospitalises:  statuts['hospitalise'] || statuts['hospitalisé'] || 0,
            sortis:        statuts['sorti']       || 0,
            nouveaux_mois: nouveaux,
            evolution,
            historique: historiquePatients.rows.map((r: { date: string; nouveaux: string }) => ({
              date:     formatDate(r.date),
              nouveaux: parseInt(r.nouveaux),
              total,   // total actuel — pas d'historique cumulatif disponible
            })),
          },
          lits: {
            total:           litsTotal,
            occupes:         litsOccupes,
            libres:          parseInt(litsRow.libres),
            maintenance:     parseInt(litsRow.maintenance),
            taux_occupation: tauxOccup,
            par_categorie:   litsParCategorie.rows.map((r: { categorie: string; total: string; occupes: string; libres: string }) => ({
              categorie: r.categorie,
              total:     parseInt(r.total),
              occupes:   parseInt(r.occupes),
              libres:    parseInt(r.libres),
            })),
            historique: tauxLitsHisto,
          },
          rendez_vous: {
            total_mois: parseInt(rdvTotal.rows[0].count),
            aujourdhui: parseInt(rdvAujourdhui.rows[0].count),
            semaine:    parseInt(rdvSemaine.rows[0].count),
            par_statut: rdvParStatut.rows.map((r: { statut: string; count: string }) => ({
              statut: r.statut, count: parseInt(r.count),
            })),
            par_type: rdvParType.rows.map((r: { type: string; count: string }) => ({
              type: r.type, count: parseInt(r.count),
            })),
            historique: historiqueRdv.rows.map((r: { date: string; count: string }) => ({
              date: formatDate(r.date), count: parseInt(r.count),
            })),
          },
          admissions: {
            total_mois:    parseInt(admissionsMois.rows[0].count),
            en_cours:      parseInt(admissionsEnCours.rows[0].count),
            terminees:     parseInt(admissionsTerminees.rows[0].count),
            duree_moyenne: parseFloat(admissionsDureeMoyenne.rows[0].duree_moyenne || '0'),
            historique: historiqueAdmissions.rows.map((r: { date: string; count: string }) => ({
              date: formatDate(r.date), count: parseInt(r.count),
            })),
          },
          documents: {
            observations:     docsObs,
            bilans:           docsBio,
            soins_medicaux:   docsSM,
            soins_infirmiers: docsSI,
            traitements:      docsTrai,
            comptes_rendus:   docsCR,
            total:            docsObs + docsBio + docsSM + docsSI + docsTrai + docsCR,
          },
        },
      });
    } catch (error: unknown) {
      console.error('❌ [StatsController] getStats:', error);
      res.status(500).json({ success: false, message: 'Erreur lors du chargement des statistiques' });
    }
  }
}