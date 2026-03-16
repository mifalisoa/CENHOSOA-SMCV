// frontend/src/infrastructure/utils/statsExport.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ── Types explicites pour remplacer les any[] ──────────────────────────────

interface LitCategorie {
  categorie: string;
  total: number;
  occupes: number;
}

interface RdvStatut {
  statut: string;
  count: number;
}

interface RdvType {
  type: string;
  count: number;
}

interface StatsExportData {
  periode: string;
  date_generation: string;
  patients: {
    total: number;
    externes: number;
    hospitalises: number;
    sortis: number;
    nouveaux_mois: number;
  };
  lits: {
    total: number;
    occupes: number;
    libres: number;
    taux_occupation: number;
    par_categorie: LitCategorie[];  // ← typage explicite
  };
  rendez_vous: {
    total_mois: number;
    aujourdhui: number;
    semaine: number;
    par_statut: RdvStatut[];        // ← typage explicite
    par_type: RdvType[];            // ← typage explicite
  };
  admissions: {
    total_mois: number;
    en_cours: number;
    terminees: number;
    duree_moyenne: number;
  };
  documents: {
    observations: number;
    bilans: number;
    soins_medicaux: number;
    soins_infirmiers: number;
    traitements: number;
    total: number;
  };
}

// ── Type pour accéder à lastAutoTable sur jsPDF ────────────────────────────

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

export const exportStatsToPDF = (stats: StatsExportData) => {
  const doc = new jsPDF() as JsPDFWithAutoTable;  // ← cast propre au lieu de (doc as any)
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(8, 197, 209);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CENHOSOA - Statistiques', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${stats.periode}`, pageWidth / 2, 30, { align: 'center' });

  let yPos = 50;

  doc.setTextColor(0, 0, 0);

  // ── Section Patients ──
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 197, 209);
  doc.text('Patients', 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Total Patients', stats.patients.total.toString()],
      ['Patients Externes', stats.patients.externes.toString()],
      ['Patients Hospitalises', stats.patients.hospitalises.toString()],
      ['Patients Sortis', stats.patients.sortis.toString()],
      ['Nouveaux ce mois', stats.patients.nouveaux_mois.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [8, 197, 209] },
    margin: { left: 14, right: 14 }
  });

  yPos = doc.lastAutoTable.finalY + 15;  // ← plus de (doc as any)

  // ── Section Lits ──
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 197, 209);
  doc.text('Gestion des Lits', 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Total Lits', stats.lits.total.toString()],
      ['Lits Occupes', stats.lits.occupes.toString()],
      ['Lits Libres', stats.lits.libres.toString()],
      ["Taux d'Occupation", `${stats.lits.taux_occupation}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [8, 197, 209] },
    margin: { left: 14, right: 14 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  if (yPos > 250) { doc.addPage(); yPos = 20; }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 197, 209);
  doc.text('Occupation par Categorie', 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Categorie', 'Total', 'Occupes', 'Taux']],
    body: stats.lits.par_categorie.map((cat: LitCategorie) => [  // ← type explicite
      `Categorie ${cat.categorie}`,
      cat.total.toString(),
      cat.occupes.toString(),
      `${Math.round((cat.occupes / cat.total) * 100)}%`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [8, 197, 209] },
    margin: { left: 14, right: 14 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  if (yPos > 250) { doc.addPage(); yPos = 20; }

  // ── Section Rendez-vous ──
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 197, 209);
  doc.text('Rendez-vous', 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Total ce mois', stats.rendez_vous.total_mois.toString()],
      ["Aujourd'hui", stats.rendez_vous.aujourdhui.toString()],
      ['Cette semaine', stats.rendez_vous.semaine.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [8, 197, 209] },
    margin: { left: 14, right: 14 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 197, 209);
  doc.text('Par Statut', 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Statut', 'Nombre']],
    body: stats.rendez_vous.par_statut.map((s: RdvStatut) => [  // ← type explicite
      s.statut.charAt(0).toUpperCase() + s.statut.slice(1),
      s.count.toString()
    ]),
    theme: 'grid',
    headStyles: { fillColor: [8, 197, 209] },
    margin: { left: 14, right: 14 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  if (yPos > 250) { doc.addPage(); yPos = 20; }

  // ── Section Documents ──
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 197, 209);
  doc.text('Documents Generes', 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Type de Document', 'Nombre']],
    body: [
      ['Observations Medicales', stats.documents.observations.toString()],
      ['Bilans Biologiques', stats.documents.bilans.toString()],
      ['Soins Medicaux', stats.documents.soins_medicaux.toString()],
      ['Soins Infirmiers', stats.documents.soins_infirmiers.toString()],
      ['Traitements', stats.documents.traitements.toString()],
      ['TOTAL', stats.documents.total.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [8, 197, 209] },
    margin: { left: 14, right: 14 }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${pageCount} - Genere le ${stats.date_generation}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const filename = `CENHOSOA_Statistiques_${stats.periode}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export const exportStatsToExcel = (stats: StatsExportData) => {
  const wb = XLSX.utils.book_new();

  const resumeData = [
    ['CENHOSOA - STATISTIQUES'],
    [`Periode: ${stats.periode}`],
    [`Date de generation: ${stats.date_generation}`],
    [],
    ['PATIENTS'],
    ['Total', stats.patients.total],
    ['Externes', stats.patients.externes],
    ['Hospitalises', stats.patients.hospitalises],
    ['Sortis', stats.patients.sortis],
    ['Nouveaux ce mois', stats.patients.nouveaux_mois],
    [],
    ['LITS'],
    ['Total', stats.lits.total],
    ['Occupes', stats.lits.occupes],
    ['Libres', stats.lits.libres],
    ["Taux d'occupation", `${stats.lits.taux_occupation}%`],
    [],
    ['RENDEZ-VOUS'],
    ['Total ce mois', stats.rendez_vous.total_mois],
    ["Aujourd'hui", stats.rendez_vous.aujourdhui],
    ['Cette semaine', stats.rendez_vous.semaine],
    [],
    ['ADMISSIONS'],
    ['En cours', stats.admissions.en_cours],
    ['Terminees', stats.admissions.terminees],
    ['Duree moyenne', `${stats.admissions.duree_moyenne} jours`],
    [],
    ['DOCUMENTS'],
    ['Observations', stats.documents.observations],
    ['Bilans', stats.documents.bilans],
    ['Soins Medicaux', stats.documents.soins_medicaux],
    ['Soins Infirmiers', stats.documents.soins_infirmiers],
    ['Traitements', stats.documents.traitements],
    ['TOTAL', stats.documents.total],
  ];

  const wsResume = XLSX.utils.aoa_to_sheet(resumeData);
  XLSX.utils.book_append_sheet(wb, wsResume, 'Resume');

  const litsData = [
    ['Categorie', 'Total', 'Occupes', 'Libres', "Taux d'occupation"],
    ...stats.lits.par_categorie.map((cat: LitCategorie) => [  // ← type explicite
      `Categorie ${cat.categorie}`,
      cat.total,
      cat.occupes,
      cat.total - cat.occupes,
      `${Math.round((cat.occupes / cat.total) * 100)}%`
    ])
  ];
  const wsLits = XLSX.utils.aoa_to_sheet(litsData);
  XLSX.utils.book_append_sheet(wb, wsLits, 'Lits');

  const rdvStatutData = [
    ['Statut', 'Nombre'],
    ...stats.rendez_vous.par_statut.map((s: RdvStatut) => [  // ← type explicite
      s.statut.charAt(0).toUpperCase() + s.statut.slice(1),
      s.count
    ])
  ];
  const wsRdvStatut = XLSX.utils.aoa_to_sheet(rdvStatutData);
  XLSX.utils.book_append_sheet(wb, wsRdvStatut, 'RDV par Statut');

  const rdvTypeData = [
    ['Type', 'Nombre'],
    ...stats.rendez_vous.par_type.map((t: RdvType) => [  // ← type explicite
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.count
    ])
  ];
  const wsRdvType = XLSX.utils.aoa_to_sheet(rdvTypeData);
  XLSX.utils.book_append_sheet(wb, wsRdvType, 'RDV par Type');

  const filename = `CENHOSOA_Statistiques_${stats.periode}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};