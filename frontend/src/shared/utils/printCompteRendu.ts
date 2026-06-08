// src/shared/utils/printCompteRendu.ts
import type { CompteRendu } from '../../core/entities/CompteRendu';
import type { Patient }     from '../../core/entities/Patient';
import { printHTML }        from './printUtils';

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

const MODALITE_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  gueri:     { label: '✅ Guéri',      color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  ameliore:  { label: '🔵 Amélioré',   color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  transfert: { label: '🔀 Transféré',  color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  deces:     { label: '🖤 Décès',       color: '#1e293b', bg: '#f8fafc', border: '#cbd5e1' },
};

export function compteRenduToHTML(patient: Patient, cr: CompteRendu): string {
  const age     = calculateAge(patient.date_naissance);
  const modalite = MODALITE_LABELS[cr.modalite_sortie] ?? { label: cr.modalite_sortie, color: '#0f172a', bg: '#f8fafc', border: '#e2e8f0' };

  const dateAdmission = formatDate(cr.date_admission);
  const dateSortie    = formatDate(cr.date_sortie);

  // Calcul durée hospitalisation
  const diffMs   = new Date(cr.date_sortie).getTime() - new Date(cr.date_admission).getTime();
  const diffJours = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return `
  <!-- En-tête institution -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0891b2;padding-bottom:14px;margin-bottom:16px">
    <div>
      <div style="font-size:15px;font-weight:900;color:#0891b2;letter-spacing:0.5px">CENHOSOA — SMCV</div>
      <div style="font-size:10px;color:#64748b;margin-top:2px">Centre Hospitalier de Soavinandriana</div>
      <div style="font-size:10px;color:#64748b">Service des Maladies Cardiovasculaires</div>
      <div style="font-size:10px;color:#64748b">Antananarivo — Madagascar</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:900;color:#0c4a6e;text-transform:uppercase;letter-spacing:1px">COMPTE RENDU</div>
      <div style="font-size:13px;font-weight:700;color:#0891b2">D'HOSPITALISATION</div>
      <div style="font-size:10px;color:#64748b;margin-top:4px">
        Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toTimeString().slice(0, 5)}
      </div>
    </div>
  </div>

  <!-- Info patient -->
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

  <!-- Séjour hospitalier -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px">Date d'admission</div>
      <div style="font-size:13px;font-weight:700;color:#0f172a">📅 ${dateAdmission}</div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px">Date de sortie</div>
      <div style="font-size:13px;font-weight:700;color:#0f172a">📅 ${dateSortie}</div>
    </div>
    <div style="background:#0891b2;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:9px;font-weight:700;color:#bae6fd;text-transform:uppercase;margin-bottom:4px">Durée de séjour</div>
      <div style="font-size:20px;font-weight:900;color:white">${diffJours} jour${diffJours > 1 ? 's' : ''}</div>
    </div>
  </div>

  <!-- Modalité de sortie -->
  <div style="background:${modalite.bg};border:2px solid ${modalite.border};border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
    <div style="font-size:9px;font-weight:700;color:${modalite.color};text-transform:uppercase;margin-right:8px">Modalité de sortie</div>
    <div style="font-size:16px;font-weight:800;color:${modalite.color}">${modalite.label}</div>
    ${cr.lieu_transfert ? `
    <div style="font-size:12px;color:${modalite.color};margin-left:8px">→ ${cr.lieu_transfert}</div>` : ''}
  </div>

  <!-- Résumé clinique -->
  <div style="margin-bottom:12px">
    <div style="font-size:10px;font-weight:800;color:#0891b2;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:#0891b2;border-radius:2px"></span>
      Résumé de l'observation
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:12px;color:#334155;line-height:1.7;white-space:pre-wrap">${cr.resume_observation}</div>
  </div>

  <!-- Diagnostic de sortie -->
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:12px 16px;margin-bottom:12px">
    <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;margin-bottom:4px">✅ Diagnostic de sortie</div>
    <div style="font-size:14px;font-weight:700;color:#14532d">${cr.diagnostic_sortie}</div>
  </div>

  <!-- Traitement de sortie -->
  <div style="margin-bottom:12px">
    <div style="font-size:10px;font-weight:800;color:#0891b2;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:#0891b2;border-radius:2px"></span>
      Traitement de sortie
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:12px;color:#334155;line-height:1.7;white-space:pre-wrap">${cr.traitement_sortie}</div>
  </div>

  ${cr.prochain_rdv ? `
  <!-- Prochain RDV -->
  <div style="background:#fefce8;border:1px solid #fde047;border-radius:6px;padding:10px 14px;margin-bottom:12px">
    <div style="font-size:9px;font-weight:700;color:#854d0e;text-transform:uppercase;margin-bottom:4px">📅 Prochain rendez-vous</div>
    <div style="font-size:12px;font-weight:600;color:#713f12">${cr.prochain_rdv}</div>
  </div>` : ''}

  <!-- Signature médecin -->
  <div style="display:flex;justify-content:flex-end;margin-top:24px">
    <div style="text-align:center;min-width:220px">
      <div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">
        Médecin traitant
      </div>
      <div style="font-size:14px;font-weight:800;color:#0f172a">Dr. ${cr.medecin}</div>
      <div style="margin-top:40px;border-top:1px solid #94a3b8;padding-top:6px">
        <div style="font-size:9px;color:#94a3b8">Cachet et signature</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8">
    <span>CENHOSOA-SMCV — Document confidentiel</span>
    <span>Imprimé le ${new Date().toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
  </div>
  `;
}

export function printCompteRendu(patient: Patient, cr: CompteRendu): void {
  const html = compteRenduToHTML(patient, cr);
  printHTML(html, `Compte rendu — ${patient.nom_patient} ${patient.prenom_patient}`);
}