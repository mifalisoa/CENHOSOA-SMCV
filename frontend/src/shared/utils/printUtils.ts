export function printHTML(html: string, title = 'Impression') {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;

  win.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 11px;
          color: #1a1a1a;
          background: white;
          padding: 20px;
        }

        /* ── En-tête institution ── */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0891b2;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .header-left h1 { font-size: 14px; font-weight: 800; color: #0891b2; }
        .header-left p  { font-size: 10px; color: #666; margin-top: 2px; }
        .header-right   { text-align: right; }
        .header-right .doc-title {
          font-size: 16px; font-weight: 800; color: #0c4a6e;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .header-right .doc-subtitle { font-size: 10px; color: #666; margin-top: 4px; }

        /* ── Info patient ── */
        .patient-box {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .patient-box .field { }
        .patient-box .field-label { font-size: 9px; font-weight: 700; color: #0891b2; text-transform: uppercase; }
        .patient-box .field-value { font-size: 11px; font-weight: 600; color: #0c4a6e; }

        /* ── Observation ── */
        .observation {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 20px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .obs-header {
          background: #0891b2;
          color: white;
          padding: 8px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .obs-header .obs-type { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .obs-header .obs-date { font-size: 10px; opacity: 0.85; }
        .obs-body { padding: 12px 14px; }

        /* ── Sections ── */
        .section { margin-bottom: 10px; }
        .section-title {
          font-size: 9px; font-weight: 800; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px;
        }
        .section-content { font-size: 11px; color: #334155; line-height: 1.5; }

        /* ── Paramètres vitaux ── */
        .vitals-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 4px;
        }
        .vital-box {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 4px; padding: 5px 8px;
        }
        .vital-label { font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .vital-value { font-size: 12px; font-weight: 700; color: #0f172a; }

        /* ── Antécédents ── */
        .ant-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 4px; }
        .ant-box  { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px; }
        .ant-box-title { font-size: 9px; font-weight: 700; color: #0891b2; margin-bottom: 4px; }
        .ant-row { font-size: 10px; color: #475569; margin-bottom: 2px; }
        .ant-row span { font-weight: 600; color: #334155; }

        /* ── Diagnostic ── */
        .diagnostic-box {
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 4px; padding: 8px 12px; margin-top: 8px;
        }
        .diagnostic-box .diag-label { font-size: 9px; font-weight: 700; color: #15803d; text-transform: uppercase; }
        .diagnostic-box .diag-value { font-size: 12px; font-weight: 700; color: #14532d; margin-top: 2px; }

        /* ── Signatures ── */
        .signatures { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px; }
        .sig-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 9px; color: #64748b;
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 4px; padding: 3px 7px;
        }
        .sig-badge .sig-role { color: #0891b2; font-weight: 600; }

        /* ── Mise à jour ── */
        .evolution {
          background: #f0f9ff; border: 1px solid #bae6fd;
          border-radius: 4px; padding: 8px 12px; margin-top: 6px;
          page-break-inside: avoid;
        }
        .evolution-header {
          display: flex; gap: 8px; align-items: center;
          font-size: 10px; font-weight: 700; color: #0c4a6e;
          margin-bottom: 6px; padding-bottom: 4px;
          border-bottom: 1px solid #bae6fd;
        }
        .evolution-section { margin-bottom: 5px; }
        .evolution-section-title { font-size: 9px; font-weight: 700; color: #0891b2; text-transform: uppercase; margin-bottom: 2px; }

        /* ── Médecin signature finale ── */
        .medecin-box {
          margin-top: 12px; padding: 8px 14px;
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 4px; display: flex; justify-content: flex-end;
        }
        .medecin-inner { text-align: center; }
        .medecin-name  { font-size: 12px; font-weight: 800; color: #0f172a; }
        .medecin-label { font-size: 9px; color: #64748b; margin-top: 2px; }

        /* ── Séparateur entre observations ── */
        .obs-separator { border: none; border-top: 1px dashed #cbd5e1; margin: 16px 0; }

        /* ── Pied de page ── */
        .footer {
          margin-top: 20px; padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          display: flex; justify-content: space-between;
          font-size: 9px; color: #94a3b8;
        }

        /* ── Bouton imprimer (masqué à l'impression) ── */
        .print-btn {
          display: block; margin: 0 auto 20px;
          padding: 10px 28px;
          background: #0891b2; color: white;
          border: none; border-radius: 6px;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
        }
        .print-btn:hover { background: #0e7490; }

        @media print {
          .print-btn { display: none !important; }
          body { padding: 10px; }
          .observation { page-break-inside: avoid; }
          .evolution   { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">🖨️ Imprimer</button>
      ${html}
      <script>
        window.focus();
      </script>
    </body>
    </html>
  `);
  win.document.close();
}

export function patientHeaderHTML(patient: {
  nom_patient:        string;
  prenom_patient:     string;
  num_dossier:        string;
  date_naissance?:    Date | string;
  sexe_patient?:      'M' | 'F';
  tel_patient?:       string;
  assurance?:         string;
  statut_patient?:    string;
  medecin_traitant?:  string;
  lit?:               string;
}): string {
  const formatDate = (d?: Date | string) =>
    d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  const assuranceLabel: Record<string, string> = {
    PAS:    'Sans assurance',
    FMILIF: 'FMILIF',
    OCONV:  'OCONV',
    PERS:   'Personnel',
  };

  return `
    <div class="header">
      <div class="header-left">
        <h1>CENHOSOA-SMCV</h1>
        <p>Centre Hospitalier — Service de Cardiologie</p>
      </div>
      <div class="header-right">
        <div class="doc-title">Dossier Patient</div>
        <div class="doc-subtitle">N° ${patient.num_dossier}</div>
      </div>
    </div>

    <div class="patient-box">
      <div class="field">
        <div class="field-label">Patient</div>
        <div class="field-value">${patient.nom_patient} ${patient.prenom_patient}</div>
      </div>
      <div class="field">
        <div class="field-label">N° Dossier</div>
        <div class="field-value">${patient.num_dossier}</div>
      </div>
      ${patient.date_naissance ? `
      <div class="field">
        <div class="field-label">Date de naissance</div>
        <div class="field-value">${formatDate(patient.date_naissance)}</div>
      </div>` : ''}
      ${patient.sexe_patient ? `
      <div class="field">
        <div class="field-label">Sexe</div>
        <div class="field-value">${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}</div>
      </div>` : ''}
      ${patient.tel_patient ? `
      <div class="field">
        <div class="field-label">Téléphone</div>
        <div class="field-value">${patient.tel_patient}</div>
      </div>` : ''}
      ${patient.assurance ? `
      <div class="field">
        <div class="field-label">Assurance</div>
        <div class="field-value">${assuranceLabel[patient.assurance] ?? patient.assurance}</div>
      </div>` : ''}
      ${patient.medecin_traitant ? `
      <div class="field">
        <div class="field-label">Médecin traitant</div>
        <div class="field-value">${patient.medecin_traitant}</div>
      </div>` : ''}
      ${patient.lit ? `
      <div class="field">
        <div class="field-label">Lit</div>
        <div class="field-value">${patient.lit}</div>
      </div>` : ''}
    </div>
  `;
}

export function footerHTML(): string {
  const now = new Date().toLocaleString('fr-FR', {
    day:    '2-digit',
    month:  'long',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
  return `
    <div class="footer">
      <span>CENHOSOA-SMCV — Document confidentiel</span>
      <span>Imprimé le ${now}</span>
    </div>
  `;
}