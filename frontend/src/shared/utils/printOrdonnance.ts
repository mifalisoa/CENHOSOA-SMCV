// src/shared/utils/printOrdonnance.ts
import type { Traitement } from '../../core/entities/Traitement';
import type { Patient }    from '../../core/entities/Patient';
import { printHTML }       from './printUtils';

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function calculateAge(dateNaissance: string | Date): number {
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return age;
}

// ── En-tête ordonnance ────────────────────────────────────────────────────────
function ordonnanceHeaderHTML(patient: Patient, traitement: Traitement, type: 'ordonnance' | 'examen'): string {
  const age = calculateAge(patient.date_naissance);
  const titre = type === 'ordonnance' ? 'ORDONNANCE MÉDICALE' : "DEMANDE D'EXAMEN PARACLINIQUE";
  const color = type === 'ordonnance' ? '#0891b2' : '#7c3aed';

  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${color};padding-bottom:14px;margin-bottom:16px">
      <div>
        <div style="font-size:15px;font-weight:900;color:${color};letter-spacing:0.5px">CENHOSOA — SMCV</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px">Centre Hospitalier de Soavinandriana</div>
        <div style="font-size:10px;color:#64748b">Service des Maladies Cardiovasculaires</div>
        <div style="font-size:10px;color:#64748b">Antananarivo — Madagascar</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:18px;font-weight:900;color:${color};text-transform:uppercase;letter-spacing:1px">${titre}</div>
        <div style="font-size:10px;color:#64748b;margin-top:4px">
          Le ${formatDate(traitement.date_prescription)} à ${traitement.heure_prescription}
        </div>
        ${traitement.lieu_prescription ? `
        <div style="font-size:10px;color:#64748b;margin-top:2px">
          📍 ${traitement.lieu_prescription}
        </div>` : ''}
      </div>
    </div>

    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;flex-wrap:wrap;gap:20px">
      <div>
        <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Patient</div>
        <div style="font-size:14px;font-weight:800;color:#0c4a6e">${patient.nom_patient.toUpperCase()} ${patient.prenom_patient}</div>
      </div>
      <div>
        <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Âge</div>
        <div style="font-size:13px;font-weight:700;color:#0c4a6e">${age} ans</div>
      </div>
      <div>
        <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Sexe</div>
        <div style="font-size:13px;font-weight:700;color:#0c4a6e">${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}</div>
      </div>
      <div>
        <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">N° Dossier</div>
        <div style="font-size:13px;font-weight:700;color:#0c4a6e">${patient.num_dossier}</div>
      </div>
      ${patient.tel_patient ? `
      <div>
        <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Téléphone</div>
        <div style="font-size:13px;font-weight:700;color:#0c4a6e">${patient.tel_patient}</div>
      </div>` : ''}
      ${patient.assurance ? `
      <div>
        <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Assurance</div>
        <div style="font-size:13px;font-weight:700;color:#0c4a6e">${patient.assurance}</div>
      </div>` : ''}
    </div>

    ${traitement.diagnostic ? `
    <div style="background:#fefce8;border:1px solid #fde047;border-radius:6px;padding:10px 14px;margin-bottom:14px">
      <div style="font-size:9px;font-weight:700;color:#854d0e;text-transform:uppercase;margin-bottom:4px">Diagnostic</div>
      <div style="font-size:13px;font-weight:600;color:#713f12">${traitement.diagnostic}</div>
    </div>` : ''}
  `;
}

// ── Ordonnance ────────────────────────────────────────────────────────────────
export function ordonnanceToHTML(patient: Patient, traitements: Traitement[]): string {
  if (traitements.length === 0) return '';

  const first = traitements[0];

  const medicaments = traitements.map((t, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : 'white'}">
      <td style="padding:10px 12px;font-weight:700;font-size:13px;color:#0f172a;border-bottom:1px solid #f1f5f9">
        ${i + 1}. ${t.medicament}
      </td>
      <td style="padding:10px 12px;font-size:12px;color:#334155;border-bottom:1px solid #f1f5f9">${t.dosage}</td>
      <td style="padding:10px 12px;font-size:12px;color:#334155;border-bottom:1px solid #f1f5f9">${t.voie_administration}</td>
      <td style="padding:10px 12px;font-size:12px;color:#334155;border-bottom:1px solid #f1f5f9">${t.frequence}</td>
      <td style="padding:10px 12px;font-size:12px;color:#0891b2;font-weight:600;border-bottom:1px solid #f1f5f9">${t.duree}</td>
      ${t.instructions
        ? `<td style="padding:10px 12px;font-size:11px;color:#64748b;font-style:italic;border-bottom:1px solid #f1f5f9">${t.instructions}</td>`
        : `<td style="border-bottom:1px solid #f1f5f9"></td>`}
    </tr>
  `).join('');

  return `
    ${ordonnanceHeaderHTML(patient, first, 'ordonnance')}

    <div style="margin-bottom:20px">
      <div style="font-size:11px;font-weight:800;color:#0891b2;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:3px;height:14px;background:#0891b2;border-radius:2px"></span>
        Médicaments prescrits (${traitements.length})
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#0891b2;color:white">
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase">Médicament</th>
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase">Dosage</th>
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase">Voie</th>
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase">Fréquence</th>
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase">Durée</th>
            <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase">Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${medicaments}
        </tbody>
      </table>
    </div>

    ${first.observations_speciales ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:10px 14px;margin-bottom:16px">
      <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;margin-bottom:4px">⚠️ Observations spéciales</div>
      <div style="font-size:12px;color:#14532d;line-height:1.6">${first.observations_speciales}</div>
    </div>` : ''}

    ${signatureHTML(first)}
    ${footerOrdonnanceHTML()}
  `;
}

// ── Demande d'examen paraclinique ─────────────────────────────────────────────
export function demandeExamenToHTML(patient: Patient, traitement: Traitement): string {
  return `
    ${ordonnanceHeaderHTML(patient, traitement, 'examen')}

    <div style="margin-bottom:20px">
      <div style="font-size:11px;font-weight:800;color:#7c3aed;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:3px;height:14px;background:#7c3aed;border-radius:2px"></span>
        Examen(s) demandé(s)
      </div>

      <div style="background:#faf5ff;border:2px solid #7c3aed;border-radius:8px;padding:16px">
        <div style="font-size:16px;font-weight:800;color:#4c1d95;margin-bottom:8px">
          🔬 ${traitement.medicament}
        </div>
        ${traitement.dosage ? `
        <div style="font-size:12px;color:#6d28d9;margin-bottom:4px">
          <strong>Type :</strong> ${traitement.dosage}
        </div>` : ''}
        ${traitement.voie_administration ? `
        <div style="font-size:12px;color:#6d28d9;margin-bottom:4px">
          <strong>Urgence :</strong> ${traitement.voie_administration}
        </div>` : ''}
        ${traitement.frequence ? `
        <div style="font-size:12px;color:#6d28d9;margin-bottom:4px">
          <strong>Fréquence :</strong> ${traitement.frequence}
        </div>` : ''}
        ${traitement.instructions ? `
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid #ddd6fe">
          <div style="font-size:9px;font-weight:700;color:#7c3aed;text-transform:uppercase;margin-bottom:4px">Indications / Renseignements cliniques</div>
          <div style="font-size:12px;color:#4c1d95;line-height:1.6">${traitement.instructions}</div>
        </div>` : ''}
      </div>
    </div>

    ${traitement.observations_speciales ? `
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:10px 14px;margin-bottom:16px">
      <div style="font-size:9px;font-weight:700;color:#991b1b;text-transform:uppercase;margin-bottom:4px">⚠️ Renseignements complémentaires</div>
      <div style="font-size:12px;color:#7f1d1d;line-height:1.6">${traitement.observations_speciales}</div>
    </div>` : ''}

    <div style="border:1px dashed #cbd5e1;border-radius:6px;padding:12px 14px;margin-bottom:16px">
      <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:8px">Réservé au laboratoire / service</div>
      <div style="display:flex;gap:20px">
        <div style="flex:1">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:4px">Date de réalisation</div>
          <div style="height:24px;border-bottom:1px solid #e2e8f0"></div>
        </div>
        <div style="flex:1">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:4px">Résultat / Compte rendu</div>
          <div style="height:24px;border-bottom:1px solid #e2e8f0"></div>
        </div>
        <div style="flex:1">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:4px">Signature</div>
          <div style="height:24px;border-bottom:1px solid #e2e8f0"></div>
        </div>
      </div>
    </div>

    ${signatureHTML(traitement)}
    ${footerOrdonnanceHTML()}
  `;
}

// ── Signature médecin ─────────────────────────────────────────────────────────
function signatureHTML(traitement: Traitement): string {
  return `
    <div style="display:flex;justify-content:flex-end;margin-top:24px">
      <div style="text-align:center;min-width:200px">
        <div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">
          Médecin prescripteur
        </div>
        <div style="font-size:14px;font-weight:800;color:#0f172a">
          ${traitement.prescripteur ? `Dr. ${traitement.prescripteur}` : '____________________'}
        </div>
        <div style="margin-top:40px;border-top:1px solid #94a3b8;padding-top:6px">
          <div style="font-size:9px;color:#94a3b8">Cachet et signature</div>
        </div>
      </div>
    </div>
  `;
}

// ── Footer ────────────────────────────────────────────────────────────────────
function footerOrdonnanceHTML(): string {
  const now = new Date().toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  return `
    <div style="margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8">
      <span>CENHOSOA-SMCV — Document confidentiel</span>
      <span>Imprimé le ${now}</span>
    </div>
  `;
}

// ── Fonctions d'impression directe ───────────────────────────────────────────
export function printOrdonnance(patient: Patient, traitements: Traitement[]): void {
  const html = ordonnanceToHTML(patient, traitements);
  printHTML(html, `Ordonnance — ${patient.nom_patient} ${patient.prenom_patient}`);
}

export function printDemandeExamen(patient: Patient, traitement: Traitement): void {
  const html = demandeExamenToHTML(patient, traitement);
  printHTML(html, `Demande d'examen — ${patient.nom_patient} ${patient.prenom_patient}`);
}