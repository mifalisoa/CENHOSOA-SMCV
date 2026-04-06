import PDFDocument from 'pdfkit';
import path from 'path';
import type { SoinInfirmier } from '../../domain/entities/SoinInfirmier';
import type { Patient } from '../../domain/entities/Patient';

export class SoinInfirmierPDFService {
  generatePDF(soin: SoinInfirmier, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 30, bottom: 40, left: 50, right: 50 } });

    this.addOfficialHeader(doc, soin, patient);
    if (soin.ecg)          this.addSection(doc, 'ECG (ÉLECTROCARDIOGRAMME)', soin.ecg);
    if (soin.ecg_dii_long) this.addSection(doc, 'ECG DII LONG', soin.ecg_dii_long);
    if (soin.injection_iv) this.addSection(doc, 'INJECTION INTRAVEINEUSE (IV)', soin.injection_iv);
    if (soin.injection_im) this.addSection(doc, 'INJECTION INTRAMUSCULAIRE (IM)', soin.injection_im);
    if (soin.pse)          this.addSection(doc, 'PSE (POUSSE-SERINGUE ÉLECTRIQUE)', soin.pse);
    if (soin.pansement)    this.addSection(doc, 'PANSEMENT', soin.pansement);
    if (soin.autre_soins)  this.addSection(doc, 'AUTRES SOINS INFIRMIERS', soin.autre_soins);
    this.addSignature(doc, soin);
    return doc;
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, soin: SoinInfirmier, patient: Patient) {
    const startY = 20;
    const leftColX = 40;
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
       .text('SOIN INFIRMIER', rightColX, startY + 10, { underline: true });

    if (soin.verifie) {
      doc.fontSize(10).fillColor('#16a34a').text('✓ VÉRIFIÉ', rightColX, startY + 35);
      doc.fillColor('#000000');
    }

    const patientY = startY + 60;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${patient.nom_patient.toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${patient.prenom_patient}`, rightColX, patientY + 18)
       .text(`AGE : ${age} ans`, rightColX, patientY + 36)
       .text(`GENRE : ${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}`, rightColX + 130, patientY + 36);

    const soinY = patientY + 60;
    const dateSoin = new Date(soin.date_soin);
    doc.text(`DATE DU SOIN : ${dateSoin.toLocaleDateString('fr-FR')}`, rightColX, soinY)
       .text(`HEURE : ${soin.heure_soin}`, rightColX, soinY + 18)
       .text(`RÉALISÉ PAR : ${soin.realise_par}`, rightColX, soinY + 36);

    doc.moveTo(50, 250).lineTo(545, 250).dash(2, { space: 2 }).stroke().undash();
    doc.y = 265;
  }

  private addSection(doc: PDFKit.PDFDocument, title: string, content: string) {
    if (doc.y > 700) doc.addPage();
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
       .text(title, 50, doc.y, { width: 495, underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica')
       .text(content || '', 50, doc.y, { width: 495, align: 'justify' });
    doc.moveDown(1);
  }

  private addSignature(doc: PDFKit.PDFDocument, soin: SoinInfirmier) {
    doc.moveDown(2);
    const date = new Date(soin.date_soin);
    doc.fontSize(10).font('Helvetica-Oblique')
       .text(`Fait à Antananarivo, le ${date.toLocaleDateString('fr-FR')}`, 50, doc.y, { width: 495, align: 'right' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold')
       .text(soin.realise_par.toUpperCase(), 50, doc.y, { width: 495, align: 'right' });
    doc.fontSize(9).font('Helvetica')
       .text('Infirmier(ère)', 50, doc.y + 15, { width: 495, align: 'right' });
    if (soin.verifie) {
      doc.moveDown(0.3);
      doc.fontSize(8).fillColor('#16a34a')
         .text('✓ Document vérifié et validé', 50, doc.y, { width: 495, align: 'right' });
    }
  }
}