import type { BilanBiologique } from '../../core/entities/BilanBiologique';
import type { Patient }         from '../../core/entities/Patient';

const NORMES: Record<string, { min: number; max: number; unit: string; label: string }> = {
  creatinine: { min: 7,   max: 13,  unit: 'mg/L',    label: 'Créatinine' },
  glycemie:   { min: 0.7, max: 1.1, unit: 'g/L',     label: 'Glycémie'   },
  crp:        { min: 0,   max: 5,   unit: 'mg/L',     label: 'CRP'        },
  inr:        { min: 0.8, max: 1.2, unit: '',          label: 'INR'        },
  nfs:        { min: 4,   max: 10,  unit: '×10³/µL',  label: 'NFS'        },
};

function getStatus(value: number | undefined, key: string): 'normal' | 'high' | 'low' | null {
  if (!value) return null;
  const n = NORMES[key];
  if (!n) return null;
  if (value < n.min) return 'low';
  if (value > n.max) return 'high';
  return 'normal';
}

function bilanResultsHTML(bilan: BilanBiologique): string {
  const keys: Array<keyof BilanBiologique> = ['creatinine', 'glycemie', 'crp', 'inr', 'nfs'];
  const filled = keys.filter(k => bilan[k] !== undefined && bilan[k] !== null);
  if (filled.length === 0) return '';

  return `
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:8px">
      ${filled.map(k => {
        const val    = bilan[k] as number;
        const norme  = NORMES[k as string];
        const status = getStatus(val, k as string);
        const isAnormal = status === 'high' || status === 'low';
        const bg     = isAnormal ? '#fef2f2' : status === 'normal' ? '#f0fdf4' : '#f8fafc';
        const border = isAnormal ? '#fca5a5' : status === 'normal' ? '#bbf7d0'  : '#e2e8f0';
        const color  = isAnormal ? '#991b1b' : status === 'normal' ? '#14532d'  : '#1e293b';
        const badge  = status === 'high' ? '⬆ ÉLEVÉ' : status === 'low' ? '⬇ BAS' : '✓ Normal';
        return `
          <div style="background:${bg};border:1px solid ${border};border-radius:6px;padding:8px 10px">
            <div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px">
              ${norme?.label ?? k}
            </div>
            <div style="font-size:16px;font-weight:800;color:${color}">
              ${val}${norme?.unit ? `<span style="font-size:10px;font-weight:400;margin-left:3px">${norme.unit}</span>` : ''}
            </div>
            <div style="font-size:9px;color:${isAnormal ? '#dc2626' : '#16a34a'};margin-top:3px;font-weight:600">
              ${badge}
            </div>
            ${norme ? `<div style="font-size:8px;color:#94a3b8;margin-top:1px">Norme : ${norme.min}–${norme.max}</div>` : ''}
          </div>`;
      }).join('')}
    </div>`;
}

export function bilanToHTML(bilan: BilanBiologique): string {
  const date = new Date(bilan.date_prelevement).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const nbAnormal = (['creatinine','glycemie','crp','inr','nfs'] as Array<keyof BilanBiologique>)
    .filter(k => { const s = getStatus(bilan[k] as number | undefined, k as string); return s === 'high' || s === 'low'; }).length;

  const headerColor = nbAnormal > 0 ? '#dc2626' : '#0891b2';

  return `
  <div class="observation">
    <div class="obs-header" style="background:${headerColor}">
      <span class="obs-type">🧪 ${bilan.type_bilan || 'Bilan biologique'}</span>
      <span class="obs-date">${date} à ${String(bilan.heure_prelevement).slice(0,5)}</span>
    </div>
    <div class="obs-body">

      ${nbAnormal > 0 ? `
        <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:4px;padding:6px 12px;margin-bottom:10px;font-size:11px;color:#991b1b;font-weight:600">
          ⚠️ ${nbAnormal} valeur${nbAnormal > 1 ? 's' : ''} hors norme
        </div>` : `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:6px 12px;margin-bottom:10px;font-size:11px;color:#15803d;font-weight:600">
          ✅ Toutes les valeurs sont dans les normes
        </div>`}

      ${bilanResultsHTML(bilan)}

      ${bilan.resultat ? `
        <div class="section" style="margin-top:12px">
          <div class="section-title">Résultats détaillés</div>
          <div class="section-content">${bilan.resultat}</div>
        </div>` : ''}

      ${bilan.interpretation ? `
        <div class="section">
          <div class="section-title">Interprétation</div>
          <div class="section-content">${bilan.interpretation}</div>
        </div>` : ''}

      ${bilan.laboratoire ? `
        <div style="font-size:10px;color:#64748b;margin-top:8px">
          🏥 Laboratoire : <strong>${bilan.laboratoire}</strong>
        </div>` : ''}

      ${bilan.prescripteur ? `
        <div class="medecin-box">
          <div class="medecin-inner">
            <div class="medecin-label">Prescripteur</div>
            <div class="medecin-name">Dr. ${bilan.prescripteur}</div>
          </div>
        </div>` : ''}
    </div>
  </div>`;
}