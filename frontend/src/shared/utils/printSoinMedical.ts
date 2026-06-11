// src/shared/utils/printSoinMedical.ts
import type { SoinMedical } from '../../core/entities/SoinMedical';
import type { Patient }     from '../../core/entities/Patient';
import { printHTML, patientHeaderHTML, footerHTML } from './printUtils';

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getStatutInfo(soin: SoinMedical): { label: string; color: string; bgColor: string; borderColor: string } {
  const statut = soin.statut ?? (soin.verifie ? 'valide' : 'en_attente');
  if (statut === 'valide') {
    if (soin.mode_garde)
      return { label: '✅ Validé (garde)', color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0' };
    if (soin.valideur_nom)
      return { label: `✅ Validé — Dr. ${soin.valideur_prenom ?? ''} ${soin.valideur_nom}`, color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0' };
    return { label: '✅ Validé', color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0' };
  }
  if (statut === 'rejete')
    return { label: '❌ Rejeté', color: '#dc2626', bgColor: '#fef2f2', borderColor: '#fca5a5' };
  return { label: '⏳ En attente de validation', color: '#f59e0b', bgColor: '#fefce8', borderColor: '#fde047' };
}

function soinFieldsHTML(soin: SoinMedical): string {
  const fields = [
    { value: soin.ett,   label: 'ETT — Échocardiographie transthoracique',   icon: '🫀', color: '#0891b2', bg: '#f0f9ff', border: '#bae6fd' },
    { value: soin.eto,   label: 'ETO — Échocardiographie transœsophagienne', icon: '🔬', color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
    { value: soin.autre, label: 'Autres soins médicaux',                      icon: '📋', color: '#0f172a', bg: '#f8fafc', border: '#e2e8f0' },
  ].filter(f => f.value && f.value.trim() !== '');

  if (fields.length === 0) return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;text-align:center;color:#64748b;font-size:12px">
      📋 Aucun détail de soin renseigné
    </div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">
      ${fields.map(f => `
        <div style="background:${f.bg};border:1px solid ${f.border};border-radius:8px;padding:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:16px">${f.icon}</span>
            <span style="font-size:11px;font-weight:700;color:${f.color};text-transform:uppercase;letter-spacing:0.5px">${f.label}</span>
          </div>
          <div style="font-size:13px;color:#1e293b;line-height:1.6;white-space:pre-wrap">${f.value}</div>
        </div>
      `).join('')}
    </div>`;
}

export function soinMedicalToHTML(soin: SoinMedical): string {
  const date       = formatDate(soin.date_soin);
  const statutInfo = getStatutInfo(soin);

  return `
  <div class="observation">
    <div class="obs-header" style="background:${statutInfo.color}">
      <span class="obs-type">🫀 Soin médical</span>
      <span class="obs-date">${date} à ${soin.heure_soin}</span>
    </div>
    <div class="obs-body">

      <div style="background:${statutInfo.bgColor};border:1px solid ${statutInfo.borderColor};border-radius:4px;padding:6px 12px;margin-bottom:12px;font-size:11px;font-weight:600;color:${statutInfo.color}">
        ${statutInfo.label}
      </div>

      ${soinFieldsHTML(soin)}

      <div style="margin-top:14px;display:flex;justify-content:flex-end">
        <div style="text-align:right">
          <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px">Réalisé par</div>
          <div style="font-size:12px;font-weight:700;color:#0f172a">${soin.realise_par}</div>
        </div>
      </div>

      ${soin.mode_garde && !soin.valideur_nom ? `
      <div style="margin-top:6px;font-size:10px;color:#64748b;text-align:right">
        🌙 Acte réalisé en mode garde
      </div>` : ''}

    </div>
  </div>`;
}

export function printSoinMedical(patient: Patient, soin: SoinMedical): void {
  const html = patientHeaderHTML(patient) + soinMedicalToHTML(soin) + footerHTML();
  printHTML(html, `Soin médical — ${patient.nom_patient} ${patient.prenom_patient}`);
}