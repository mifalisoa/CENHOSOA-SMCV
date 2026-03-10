import PDFDocument from 'pdfkit';
import path from 'path';
import type { SoinInfirmier } from '../../domain/entities/SoinInfirmier';
import type { Patient } from '../../domain/entities/Patient';

export class SoinInfirmierPDFService {
  generatePDF(soin: SoinInfirmier, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 30, bottom: 40, left: 50, right: 50 },
    });

    // 1. En-tête officiel
    this.addOfficialHeader(doc, soin, patient);
    
    // 2. Contenu des soins
    if (soin.ecg) {
      this.addSection(doc, 'ECG (ÉLECTROCARDIOGRAMME)', soin.ecg);
    }
    
    if (soin.ecg_dii_long) {
      this.addSection(doc, 'ECG DII LONG', soin.ecg_dii_long);
    }
    
    if (soin.injection_iv) {
      this.addSection(doc, 'INJECTION INTRAVEINEUSE (IV)', soin.injection_iv);
    }
    
    if (soin.injection_im) {
      this.addSection(doc, 'INJECTION INTRAMUSCULAIRE (IM)', soin.injection_im);
    }
    
    if (soin.pse) {
      this.addSection(doc, 'PSE (POUSSE-SERINGUE ÉLECTRIQUE)', soin.pse);
    }
    
    if (soin.pansement) {
      this.addSection(doc, 'PANSEMENT', soin.pansement);
    }
    
    if (soin.autre_soins) {
      this.addSection(doc, 'AUTRES SOINS INFIRMIERS', soin.autre_soins);
    }
    
    // 3. Signature
    this.addSignature(doc, soin);

    return doc;
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, soin: SoinInfirmier, patient: Patient) {
    const startY = 30;
    const leftColX = 50;
    const rightColX = 280;
    const colWidth = 200;
    
    // --- COLONNE GAUCHE : BLOC ADMINISTRATIF ---
    doc.fontSize(9).font('Helvetica-Bold')
       .text('CENTRE HOSPITALIER', leftColX, startY, { width: colWidth, align: 'center' })
       .text('DE SOAVINANDRIANA', leftColX, startY + 12, { width: colWidth, align: 'center' })
       .text('ANTANANARIVO', leftColX, startY + 24, { width: colWidth, align: 'center' });
    
    // Logo
    try {
      const logoPath = path.join(__dirname, '../../assets/logo-cenhosoa.png');
      doc.image(logoPath, leftColX + 40, startY + 40, { width: 120 });
    } catch (e) {
      console.warn("Logo non trouvé dans src/assets/");
    }
    
    // Coordonnées sous le logo
    const coordY = startY + 130;
    doc.fontSize(7).font('Helvetica')
       .text('Rue Dr MOSS, Soavinandriana', leftColX, coordY, { width: colWidth, align: 'center' })
       .text('BP: 6 bis- E-Mail : cenhosoa@moov.mg', leftColX, coordY + 10, { width: colWidth, align: 'center' });
    
    // Service
    doc.fontSize(10).font('Helvetica-Bold')
       .text('Services des Maladies Cardiovasculaires', leftColX, coordY + 25, { width: colWidth, align: 'center' });
    doc.fontSize(8)
       .text('Tel : 0 32 11 053 34', leftColX, coordY + 37, { width: colWidth, align: 'center' });
    
    // Petite barre horizontale décorative
    doc.moveTo(leftColX + 50, coordY + 52).lineTo(leftColX + 150, coordY + 52).lineWidth(0.5).stroke();
    
    // --- COLONNE DROITE : TITRE ET INFOS PATIENT ---
    // Titre
    doc.fontSize(16).font('Helvetica-Bold')
       .text('SOIN INFIRMIER', rightColX, startY + 10, { underline: true });
    
    // Statut vérifié
    if (soin.verifie) {
      doc.fontSize(10).fillColor('#16a34a')
         .text('✓ VÉRIFIÉ', rightColX, startY + 35);
      doc.fillColor('#000000');
    }
    
    // Bloc Patient
    const patientY = startY + 60;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${patient.nom_patient.toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${patient.prenom_patient}`, rightColX, patientY + 18)
       .text(`AGE : ${age} ans`, rightColX, patientY + 36)
       .text(`GENRE : ${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}`, rightColX + 130, patientY + 36);
    
    // Infos soin
    const soinY = patientY + 60;
    const dateSoin = new Date(soin.date_soin);
    doc.text(`DATE DU SOIN : ${dateSoin.toLocaleDateString('fr-FR')}`, rightColX, soinY)
       .text(`HEURE : ${soin.heure_soin}`, rightColX, soinY + 18)
       .text(`RÉALISÉ PAR : ${soin.realise_par}`, rightColX, soinY + 36);
    
    // Ligne de séparation horizontale (pointillée)
    doc.moveTo(50, 240).lineTo(545, 240).dash(2, { space: 2 }).stroke().undash();
    
    doc.y = 260;
  }

  private addSection(doc: PDFKit.PDFDocument, title: string, content: string) {
    if (doc.y > 700) doc.addPage();
    
    const pageWidth = 495;
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
    doc.text(title, 50, doc.y, { width: pageWidth, underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(content || '', 50, doc.y, { width: pageWidth, align: 'justify' });
    doc.moveDown(1);
  }

  private addSignature(doc: PDFKit.PDFDocument, soin: SoinInfirmier) {
    doc.moveDown(2);
    const date = new Date(soin.date_soin);
    doc.fontSize(10).font('Helvetica-Oblique');
    doc.text(`Fait à Antananarivo, le ${date.toLocaleDateString('fr-FR')}`, 50, doc.y, { width: 495, align: 'right' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold');
    doc.text(soin.realise_par.toUpperCase(), 50, doc.y, { width: 495, align: 'right' });
    doc.fontSize(9).font('Helvetica');
    doc.text('Infirmier(ère)', 50, doc.y + 15, { width: 495, align: 'right' });
    
    if (soin.verifie) {
      doc.moveDown(0.3);
      doc.fontSize(8).fillColor('#16a34a');
      doc.text('✓ Document vérifié et validé', 50, doc.y, { width: 495, align: 'right' });
    }
  }
}