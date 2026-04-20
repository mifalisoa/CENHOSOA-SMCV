import PDFDocument from 'pdfkit';
import path from 'path';
import type { SoinMedical } from '../../domain/entities/SoinMedical';
import type { Patient } from '../../domain/entities/Patient';

export class SoinMedicalPDFService {
  generatePDF(soin: SoinMedical, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 30, bottom: 40, left: 50, right: 50 } });

    this.addOfficialHeader(doc, soin, patient);
    if (soin.ett)   this.addSection(doc, 'ECHOCARDIOGRAPHIE TRANSTHORACIQUE (ETT)', soin.ett);
    if (soin.eto)   this.addSection(doc, 'ECHOCARDIOGRAPHIE TRANSOESOPHAGIENNE (ETO)', soin.eto);
    if (soin.autre) this.addSection(doc, 'AUTRE SOIN MEDICAL', soin.autre);
    this.addSignature(doc, soin);
    return doc;
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, soin: SoinMedical, patient: Patient) {
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
       .text('SOIN MEDICAL', rightColX, startY + 10, { underline: true });

    if (soin.verifie) {
      doc.fontSize(10).fillColor('#16a34a').text('(v) VERIFIE', rightColX, startY + 35);
      doc.fillColor('#000000');
    }

    const patientY = startY + 60;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${patient.nom_patient.toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${patient.prenom_patient}`, rightColX, patientY + 18)
       .text(`AGE : ${age} ans`, rightColX, patientY + 36)
       .text(`GENRE : ${patient.sexe_patient === 'M' ? 'Masculin' : 'Feminin'}`, rightColX + 130, patientY + 36);

    const soinY = patientY + 60;
    const dateSoin = new Date(soin.date_soin);
    doc.text(`DATE DU SOIN : ${dateSoin.toLocaleDateString('fr-FR')}`, rightColX, soinY)
       .text(`HEURE : ${soin.heure_soin}`, rightColX, soinY + 18)
       .text(`REALISE PAR : ${soin.realise_par}`, rightColX, soinY + 36);

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

  private addSignature(doc: PDFKit.PDFDocument, soin: SoinMedical) {
    if (doc.y > 680) doc.addPage();

    const date = new Date(soin.date_soin);
    const signY = doc.y + 20;

    doc.moveTo(50, signY).lineTo(545, signY).lineWidth(0.5).strokeColor('#e2e8f0').stroke();

    const boxX = 330;
    const boxY = signY + 15;
    const boxW = 215;

    doc.roundedRect(boxX, boxY, boxW, 70, 6)
       .fillColor('#f8fafc').fill()
       .roundedRect(boxX, boxY, boxW, 70, 6)
       .strokeColor('#e2e8f0').lineWidth(1).stroke();

    doc.fontSize(8).font('Helvetica').fillColor('#64748b')
       .text(`Fait a Antananarivo, le ${date.toLocaleDateString('fr-FR')}`, boxX + 10, boxY + 10, { width: boxW - 20, align: 'center' });

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a')
       .text(soin.realise_par.toUpperCase(), boxX + 10, boxY + 28, { width: boxW - 20, align: 'center' });

    const badgeColor = soin.verifie ? '#dcfce7' : '#f1f5f9';
    const textColor  = soin.verifie ? '#15803d' : '#64748b';
    const badgeText  = soin.verifie ? 'Document verifie et valide' : 'En attente de verification';

    doc.roundedRect(boxX + 30, boxY + 48, boxW - 60, 14, 3)
       .fillColor(badgeColor).fill();
    doc.fontSize(7).font('Helvetica-Bold').fillColor(textColor)
       .text(badgeText, boxX + 10, boxY + 51, { width: boxW - 20, align: 'center' });

    doc.fillColor('#000000');
    doc.y = boxY + 90;
  }
}