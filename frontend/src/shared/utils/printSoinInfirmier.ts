// src/shared/utils/printSoinInfirmier.ts
import type { SoinInfirmier } from '../../core/entities/SoinInfirmier';

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function getStatutInfo(soin: SoinInfirmier): { label: string; color: string; bgColor: string; borderColor: string } {
  const statut = soin.statut ?? (soin.verifie ? 'valide' : 'en_attente');
  
  if (statut === 'valide') {
    if (soin.mode_garde) {
      return { label: '✅ Validé (garde)', color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0' };
    }
    if (soin.valideur_nom) {
      return { label: `✅ Validé — Dr. ${soin.valideur_prenom || ''} ${soin.valideur_nom}`, color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0' };
    }
    return { label: '✅ Validé', color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0' };
  }
  
  if (statut === 'refuse') {
    return { label: '❌ Rejeté', color: '#dc2626', bgColor: '#fef2f2', borderColor: '#fca5a5' };
  }
  
  return { label: '⏳ En attente de validation', color: '#f59e0b', bgColor: '#fefce8', borderColor: '#fde047' };
}

function soinFieldsHTML(soin: SoinInfirmier): string {
  const fields = [
    { value: soin.ecg,          label: 'ECG',                          icon: '📊' },
    { value: soin.ecg_dii_long, label: 'ECG DII Long',                 icon: '📈' },
    { value: soin.injection_iv, label: 'Injection intraveineuse (IV)', icon: '💉' },
    { value: soin.injection_im, label: 'Injection intramusculaire (IM)', icon: '💉' },
    { value: soin.pse,          label: 'PSE — Pousse-Seringue',        icon: '💧' },
    { value: soin.pansement,    label: 'Pansement',                    icon: '🩹' },
    { value: soin.autre_soins,  label: 'Autres soins',                 icon: '📝' },
  ].filter(f => f.value && f.value.trim() !== '');

  if (fields.length === 0) return '';

  return `
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">
      ${fields.map(f => `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:14px">${f.icon}</span>
            <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px">${f.label}</span>
          </div>
          <div style="font-size:13px;color:#1e293b;line-height:1.5;white-space:pre-wrap">${f.value}</div>
        </div>
      `).join('')}
    </div>
  `;
}

export function soinInfirmierToHTML(soin: SoinInfirmier): string {
  const date = formatDate(soin.date_soin);
  const statutInfo = getStatutInfo(soin);
  
  const hasFields = !!(
    soin.ecg || soin.ecg_dii_long || soin.injection_iv || 
    soin.injection_im || soin.pse || soin.pansement || soin.autre_soins
  );

  return `
  <div class="observation">
    <div class="obs-header" style="background:${statutInfo.color}">
      <span class="obs-type">💊 Soin infirmier</span>
      <span class="obs-date">${date} à ${soin.heure_soin}</span>
    </div>
    <div class="obs-body">

      <div style="background:${statutInfo.bgColor};border:1px solid ${statutInfo.borderColor};border-radius:4px;padding:6px 12px;margin-bottom:10px;font-size:11px;font-weight:600;color:${statutInfo.color}">
        ${statutInfo.label}
      </div>

      ${hasFields ? soinFieldsHTML(soin) : `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;text-align:center;color:#64748b;font-size:12px">
          📋 Aucun détail de soin renseigné
        </div>
      `}

      ${soin.realise_par ? `
        <div style="margin-top:12px;display:flex;justify-content:flex-end">
          <div style="text-align:right">
            <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Réalisé par</div>
            <div style="font-size:12px;font-weight:600;color:#0f172a">${soin.realise_par}</div>
          </div>
        </div>
      ` : ''}

      ${soin.mode_garde && !soin.valideur_nom ? `
        <div style="margin-top:8px;font-size:10px;color:#64748b;text-align:right">
          🌙 Acte réalisé en mode garde
        </div>
      ` : ''}
    </div>
  </div>`;
}