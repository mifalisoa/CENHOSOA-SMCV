import PDFDocument from 'pdfkit';
import path from 'path';
import type { SoinMedical } from '../../domain/entities/SoinMedical';
import type { Patient } from '../../domain/entities/Patient';

export class SoinMedicalPDFService {
  generatePDF(soin: SoinMedical, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 30, bottom: 40, left: 50, right: 50 },
    });

    this.addOfficialHeader(doc, soin, patient);
    
    if (soin.ett)   this.addSection(doc, 'ÉCHOCARDIOGRAPHIE TRANSTHORACIQUE (ETT)', soin.ett);
    if (soin.eto)   this.addSection(doc, 'ÉCHOCARDIOGRAPHIE TRANSŒSOPHAGIENNE (ETO)', soin.eto);
    if (soin.autre) this.addSection(doc, 'AUTRE SOIN MÉDICAL', soin.autre);
    
    this.addSignature(doc, soin);
    return doc;
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, soin: SoinMedical, patient: Patient) {
    const startY   = 20;
    const leftColX = 40;
    const rightColX = 280;

    // --- COLONNE GAUCHE : Logo seul (contient déjà tout le texte) ---
    try {
      const logoPath = path.join(__dirname, '../../assets/logo-cenhosoa.png');
      doc.image(logoPath, leftColX, startY, { width: 210 });
    } catch (e) {
      // Fallback texte si logo absent
      doc.fontSize(9).font('Helvetica-Bold')
         .text('CENTRE HOSPITALIER', leftColX, startY, { width: 210, align: 'center' })
         .text('DE SOAVINANDRIANA', leftColX, startY + 12, { width: 210, align: 'center' })
         .text('ANTANANARIVO', leftColX, startY + 24, { width: 210, align: 'center' });
      doc.fontSize(7).font('Helvetica')
         .text('Rue Dr MOSS, Soavinandriana', leftColX, startY + 40, { width: 210, align: 'center' })
         .text('BP: 6 bis- E-Mail : cenhosoa@moov.mg', leftColX, startY + 50, { width: 210, align: 'center' });
      doc.fontSize(9).font('Helvetica-Bold')
         .text('Services des Maladies Cardiovasculaires', leftColX, startY + 65, { width: 210, align: 'center' });
      doc.fontSize(8)
         .text('Tel : 0 32 11 053 34', leftColX, startY + 78, { width: 210, align: 'center' });
    }

    // --- COLONNE DROITE : Titre + infos patient ---
    doc.fontSize(16).font('Helvetica-Bold')
       .text('SOIN MÉDICAL', rightColX, startY + 10, { underline: true });

    if (soin.verifie) {
      doc.fontSize(10).fillColor('#16a34a')
         .text('✓ VÉRIFIÉ', rightColX, startY + 35);
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

    // Ligne de séparation
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
    doc.moveDown(2);
    const date = new Date(soin.date_soin);
    doc.fontSize(10).font('Helvetica-Oblique')
       .text(`Fait à Antananarivo, le ${date.toLocaleDateString('fr-FR')}`, 50, doc.y, { width: 495, align: 'right' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold')
       .text(soin.realise_par.toUpperCase(), 50, doc.y, { width: 495, align: 'right' });
    if (soin.verifie) {
      doc.moveDown(0.3);
      doc.fontSize(8).fillColor('#16a34a')
         .text('✓ Document vérifié et validé', 50, doc.y, { width: 495, align: 'right' });
    }
  }
}