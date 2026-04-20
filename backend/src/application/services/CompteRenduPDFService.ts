import PDFDocument from 'pdfkit';
import path from 'path';
import type { CompteRendu } from '../../domain/entities/CompteRendu';
import type { Patient } from '../../domain/entities/Patient';

export class CompteRenduPDFService {
  generatePDF(cr: CompteRendu, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 30, bottom: 40, left: 50, right: 50 } });

    this.addOfficialHeader(doc, cr, patient);
    this.addSection(doc, 'RESUME DE L\'OBSERVATION', cr.resume_observation);
    this.addSection(doc, 'DIAGNOSTIC DE SORTIE', cr.diagnostic_sortie);
    this.addSection(doc, 'TRAITEMENT DE SORTIE', cr.traitement_sortie);
    if (cr.lieu_transfert) this.addSection(doc, 'LIEU DE TRANSFERT', cr.lieu_transfert);
    if (cr.prochain_rdv)   this.addSection(doc, 'PROCHAIN RENDEZ-VOUS', cr.prochain_rdv);
    this.addSignature(doc, cr);
    return doc;
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

    // Modalite de sortie
    const modaliteLabels: Record<string, string> = {
      gueri:     'Gueri',
      ameliore:  'Ameliore',
      transfert: 'Transfere',
      deces:     'Deces',
    };
    const modaliteLabel = modaliteLabels[cr.modalite_sortie] ?? cr.modalite_sortie;
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
       .text(`Modalite de sortie : ${modaliteLabel}`, rightColX, startY + 38, { width: 260 });
    doc.fillColor('#000000');

    // Infos patient
    const patientY = startY + 65;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${patient.nom_patient.toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${patient.prenom_patient}`, rightColX, patientY + 18)
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

  private addSection(doc: PDFKit.PDFDocument, title: string, content: string) {
    if (doc.y > 700) doc.addPage();
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
       .text(`${title} :`, 50, doc.y, { width: 495 });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica')
       .text(content || '', 50, doc.y, { width: 495, align: 'justify' });
    doc.moveDown(0.8);
  }

  private addSignature(doc: PDFKit.PDFDocument, cr: CompteRendu) {
    if (doc.y > 680) doc.addPage();

    const date  = new Date(cr.date_sortie);
    const signY = doc.y + 20;

    // Ligne de separation
    doc.moveTo(50, signY).lineTo(545, signY).lineWidth(0.5).strokeColor('#e2e8f0').stroke();

    const boxX = 330;
    const boxY = signY + 15;
    const boxW = 215;

    // Fond du bloc signature
    doc.roundedRect(boxX, boxY, boxW, 75, 6)
       .fillColor('#f8fafc').fill()
       .roundedRect(boxX, boxY, boxW, 75, 6)
       .strokeColor('#e2e8f0').lineWidth(1).stroke();

    // Date
    doc.fontSize(8).font('Helvetica').fillColor('#64748b')
       .text(`Fait a Antananarivo, le ${date.toLocaleDateString('fr-FR')}`, boxX + 10, boxY + 10, { width: boxW - 20, align: 'center' });

    // Nom medecin
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a')
       .text(cr.medecin.toUpperCase(), boxX + 10, boxY + 28, { width: boxW - 20, align: 'center' });

    // Titre medecin
    doc.fontSize(8).font('Helvetica').fillColor('#64748b')
       .text('Medecin responsable', boxX + 10, boxY + 43, { width: boxW - 20, align: 'center' });

    // Badge document valide
    doc.roundedRect(boxX + 30, boxY + 57, boxW - 60, 14, 3)
       .fillColor('#dcfce7').fill();
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#15803d')
       .text('Document verifie et valide', boxX + 10, boxY + 60, { width: boxW - 20, align: 'center' });

    doc.fillColor('#000000');
    doc.y = boxY + 95;
  }
}