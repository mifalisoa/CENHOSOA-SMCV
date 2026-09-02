import PDFDocument from 'pdfkit';
import path from 'path';
import type { CompteRendu } from '../../domain/entities/CompteRendu';
import type { Patient } from '../../domain/entities/Patient';

export class CompteRenduPDFService {
  generatePDF(cr: CompteRendu, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 30, bottom: 40, left: 50, right: 50 } });

    this.addOfficialHeader(doc, cr, patient);
    this.addServiceTeam(doc);
    this.addSection(doc, 'DIAGNOSTIC', cr.diagnostic);
    if (cr.contexte)              this.addSection(doc, 'CONTEXTE', cr.contexte);
    if (cr.examens_paracliniques) this.addSection(doc, 'EXAMENS PARACLINIQUES', cr.examens_paracliniques);
    this.addSection(doc, 'RESUME DE L\'OBSERVATION', cr.resume_observation);
    this.addSection(doc, 'TRAITEMENT DE SORTIE', cr.traitement_sortie);
    if (cr.evolution)    this.addSection(doc, 'EVOLUTION', cr.evolution);
    if (cr.prochain_rdv) this.addSection(doc, 'PROCHAIN RENDEZ-VOUS', cr.prochain_rdv);
    this.addSignature(doc, cr);
    return doc;
  }

  // Remplace les caracteres "intelligents" de Word (guillemets courbes, tirets longs,
  // puces, espaces insecables...) par leurs equivalents simples. PDFKit utilise la
  // police standard Helvetica qui ne supporte que l'encodage WinAnsi (256 caracteres) :
  // les caracteres Unicode non reconnus provoquent un decalage binaire qui corrompt
  // tout le texte suivant. Cette fonction doit etre appliquee a TOUT texte libre
  // (saisi ou colle par l'utilisateur) avant tout appel a doc.text().
  private sanitizeText(text: string | undefined | null): string {
    if (!text) return '';
    return text
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2022\u2023\u25E6\u2043]/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/[\u00A0\u2007\u202F]/g, ' ')
      .replace(/[^\x00-\x7F\u00C0-\u00FF]/g, '');
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, cr: CompteRendu, patient: Patient) {
    const startY    = 20;
    const leftColX  = 40;
    const rightColX = 280;

    try {
      const logoPath = path.join(__dirname, '../../assets/logo-cenhosoa.png');
      doc.image(logoPath, leftColX, startY, { width: 210 });
    } catch (e) {
      doc.fontSize(9).font('Helvetica-Bold')
         .text('CENTRE HOSPITALIER', leftColX, startY, { width: 210, align: 'center' })
         .text('DE SOAVINANDRIANA', leftColX, startY + 12, { width: 210, align: 'center' })
         .text('ANTANANARIVO', leftColX, startY + 24, { width: 210, align: 'center' });
    }

    doc.fontSize(16).font('Helvetica-Bold')
       .text("COMPTE RENDU D'HOSPITALISATION", rightColX, startY + 10, { underline: true, width: 260 });

    // Infos patient
    const patientY = startY + 65;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${this.sanitizeText(patient.nom_patient).toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${this.sanitizeText(patient.prenom_patient)}`, rightColX, patientY + 18)
       .text(`AGE : ${age} ans`, rightColX, patientY + 36)
       .text(`GENRE : ${patient.sexe_patient === 'M' ? 'Masculin' : 'Feminin'}`, rightColX + 130, patientY + 36);

    // Dates admission / sortie
    const datesY = patientY + 60;
    const dateAdmission = new Date(cr.date_admission);
    const dateSortie    = new Date(cr.date_sortie);
    doc.text(`DATE D'ADMISSION : ${dateAdmission.toLocaleDateString('fr-FR')}`, rightColX, datesY)
       .text(`DATE DE SORTIE   : ${dateSortie.toLocaleDateString('fr-FR')}`,    rightColX, datesY + 18);

    // Duree d'hospitalisation
    const dureeJours = Math.round(
      (dateSortie.getTime() - dateAdmission.getTime()) / (1000 * 60 * 60 * 24)
    );
    doc.fontSize(9).font('Helvetica').fillColor('#64748b')
       .text(`Duree d'hospitalisation : ${dureeJours} jour${dureeJours > 1 ? 's' : ''}`, rightColX, datesY + 36);
    doc.fillColor('#000000');

    doc.moveTo(50, 255).lineTo(545, 255).dash(2, { space: 2 }).stroke().undash();
    doc.y = 270;
  }

  // Bloc statique — equipe complete du service, ne depend d'aucune donnee du compte rendu.
  // Le Chef de Service a un statut complet et precis (specialite, parcours) — a ne jamais
  // resumer ou tronquer, c'est un point de rigueur pour le medecin responsable du service.
  private addServiceTeam(doc: PDFKit.PDFDocument) {
    const startY = doc.y;

    // Chef de Service — bloc detaille, statut complet
    doc.fontSize(7).fillColor('#0891b2').font('Helvetica-Bold')
       .text('Chef de Service', 50, startY, { width: 495 });
    doc.fontSize(9).fillColor('#0f172a').font('Helvetica-Bold')
       .text('Medecin - Colonel RAVAOAVY Hariniaina', 50, doc.y, { width: 495 });
    doc.fontSize(7).fillColor('#64748b').font('Helvetica')
       .text('Specialiste des maladies du coeur et des vaisseaux - Ancien resident des hopitaux de Dakar', 50, doc.y, { width: 495 })
       .text('Cardiologie generale et Pediatrique - Cardiologie interventionnelle (coronarographie diagnostique-angioplastie)', 50, doc.y, { width: 495 });

    doc.moveTo(50, doc.y + 3).lineTo(545, doc.y + 3).lineWidth(0.5).strokeColor('#e2e8f0').stroke();
    doc.y += 8;

    // Reste de l'equipe — format compact
    const team: Array<{ role: string; name: string; extra?: string }> = [
      { role: 'Chef de Service Adjoint',    name: 'Medecin-Capitaine RABEHASY Radomahefa Josena' },
      { role: 'Adjoint au Chef de Service', name: 'Docteur RAKOTOMANGA Dina' },
      { role: 'Medecin Assistant',          name: 'Docteur ANDRIANJAFIARIOLY Rojovola' },
      { role: 'Major de Service',           name: 'Adjudant-Chef RANDRIANJANAKA Elie Athanase Jean Philibert',
        extra: 'Tel : 034 58 166 31' },
      { role: 'Secretaire',                 name: 'Madame RAZAFINDRAHANTA Linah',
        extra: 'Tel : 032 11 053 34' },
    ];

    let y = doc.y;
    for (const member of team) {
      doc.fontSize(7).fillColor('#0891b2').font('Helvetica-Bold')
         .text(`${member.role} : `, 50, y, { continued: true, width: 495 });
      doc.fillColor('#475569').font('Helvetica')
         .text(member.name);
      if (member.extra) {
        y += 9;
        doc.fontSize(7).fillColor('#94a3b8').font('Helvetica')
           .text(member.extra, 50, y, { width: 495 });
      }
      y += 11;
    }
    doc.fillColor('#000000');
    doc.y = y + 6;
  }

  private addSection(doc: PDFKit.PDFDocument, title: string, content: string) {
    if (doc.y > 700) doc.addPage();
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
       .text(`${title} :`, 50, doc.y, { width: 495 });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica')
       .text(this.sanitizeText(content), 50, doc.y, { width: 495, align: 'justify' });
    doc.moveDown(0.8);
  }

  private addSignature(doc: PDFKit.PDFDocument, cr: CompteRendu) {
    if (doc.y > 680) doc.addPage();

    const date  = new Date(cr.date_sortie);
    const signY = doc.y + 20;

    doc.moveTo(50, signY).lineTo(545, signY).lineWidth(0.5).strokeColor('#e2e8f0').stroke();

    const boxX = 330;
    const boxY = signY + 15;
    const boxW = 215;

    doc.roundedRect(boxX, boxY, boxW, 75, 6)
       .fillColor('#f8fafc').fill()
       .roundedRect(boxX, boxY, boxW, 75, 6)
       .strokeColor('#e2e8f0').lineWidth(1).stroke();

    doc.fontSize(8).font('Helvetica').fillColor('#64748b')
       .text(`Fait a Antananarivo, le ${date.toLocaleDateString('fr-FR')}`, boxX + 10, boxY + 10, { width: boxW - 20, align: 'center' });

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a')
       .text(this.sanitizeText(cr.medecin).toUpperCase(), boxX + 10, boxY + 28, { width: boxW - 20, align: 'center' });

    doc.fontSize(8).font('Helvetica').fillColor('#64748b')
       .text('Medecin responsable', boxX + 10, boxY + 43, { width: boxW - 20, align: 'center' });

    doc.roundedRect(boxX + 30, boxY + 57, boxW - 60, 14, 3)
       .fillColor('#dcfce7').fill();
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#15803d')
       .text('Document verifié et validé', boxX + 10, boxY + 60, { width: boxW - 20, align: 'center' });

    doc.fillColor('#000000');
    doc.y = boxY + 95;
  }
}