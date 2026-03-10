import PDFDocument from 'pdfkit';
import path from 'path';
import type { Traitement } from '../../domain/entities/Traitement';
import type { Patient } from '../../domain/entities/Patient';

export class TraitementPDFService {
  generatePDF(traitement: Traitement, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 30, bottom: 40, left: 50, right: 50 },
    });

    // 1. En-tête officiel
    this.addOfficialHeader(doc, traitement, patient);
    
    // 2. Diagnostic
    if (traitement.diagnostic) {
      this.addDiagnostic(doc, traitement.diagnostic);
    }
    
    // 3. Prescription
    this.addPrescription(doc, traitement);
    
    // 4. Instructions et observations
    if (traitement.instructions) {
      this.addInstructions(doc, traitement.instructions);
    }
    
    if (traitement.observations_speciales) {
      this.addObservations(doc, traitement.observations_speciales);
    }
    
    // 5. Signature
    this.addSignature(doc, traitement);

    return doc;
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, traitement: Traitement, patient: Patient) {
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
    const titre = traitement.type_document === 'ordonnance' ? 'ORDONNANCE MÉDICALE' : 'TRAITEMENT';
    doc.fontSize(16).font('Helvetica-Bold')
       .text(titre, rightColX, startY + 10, { underline: true });
    
    // Bloc Patient
    const patientY = startY + 50;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${patient.nom_patient.toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${patient.prenom_patient}`, rightColX, patientY + 18)
       .text(`AGE : ${age} ans`, rightColX, patientY + 36)
       .text(`GENRE : ${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}`, rightColX + 130, patientY + 36);
    
    // Infos prescription
    const prescY = patientY + 60;
    const datePresc = new Date(traitement.date_prescription);
    doc.text(`DATE : ${datePresc.toLocaleDateString('fr-FR')}`, rightColX, prescY)
       .text(`HEURE : ${traitement.heure_prescription}`, rightColX, prescY + 18);
    
    if (traitement.prescripteur) {
      doc.text(`PRESCRIPTEUR : ${traitement.prescripteur}`, rightColX, prescY + 36);
    }
    
    if (traitement.lieu_prescription) {
      doc.fontSize(9)
         .text(`Lieu : ${traitement.lieu_prescription}`, rightColX, prescY + 54);
    }
    
    // Ligne de séparation horizontale (pointillée)
    doc.moveTo(50, 240).lineTo(545, 240).dash(2, { space: 2 }).stroke().undash();
    
    doc.y = 260;
  }

  private addDiagnostic(doc: PDFKit.PDFDocument, diagnostic: string) {
    if (doc.y > 700) doc.addPage();
    
    const pageWidth = 495;
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
    doc.text('DIAGNOSTIC', 50, doc.y, { width: pageWidth, underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(diagnostic, 50, doc.y, { width: pageWidth });
    doc.moveDown(1.5);
  }

  private addPrescription(doc: PDFKit.PDFDocument, traitement: Traitement) {
    if (doc.y > 650) doc.addPage();
    
    const pageWidth = 495;
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
    doc.text('PRESCRIPTION', 50, doc.y, { width: pageWidth, underline: true });
    doc.moveDown(0.8);
    
    // Symbole Rx
    doc.fontSize(20).font('Helvetica-Bold');
    doc.text('℞', 50, doc.y);
    doc.moveDown(0.5);
    
    // Médicament et dosage
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`${traitement.medicament} - ${traitement.dosage}`, 50, doc.y, { width: pageWidth });
    doc.moveDown(0.8);
    
    // Détails
    doc.fontSize(10).font('Helvetica');
    doc.text(`Voie d'administration : ${traitement.voie_administration}`, 70, doc.y);
    doc.moveDown(0.5);
    doc.text(`Fréquence : ${traitement.frequence}`, 70, doc.y);
    doc.moveDown(0.5);
    doc.text(`Durée du traitement : ${traitement.duree}`, 70, doc.y);
    doc.moveDown(1.5);
  }

  private addInstructions(doc: PDFKit.PDFDocument, instructions: string) {
    if (doc.y > 700) doc.addPage();
    
    const pageWidth = 495;
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
    doc.text('INSTRUCTIONS', 50, doc.y, { width: pageWidth, underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(instructions, 50, doc.y, { width: pageWidth, align: 'justify' });
    doc.moveDown(1);
  }

  private addObservations(doc: PDFKit.PDFDocument, observations: string) {
    if (doc.y > 700) doc.addPage();
    
    const pageWidth = 495;
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#d97706');
    doc.text('OBSERVATIONS SPÉCIALES', 50, doc.y, { width: pageWidth, underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica').fillColor('#000000');
    doc.text(observations, 50, doc.y, { width: pageWidth, align: 'justify' });
    doc.moveDown(1);
  }

  private addSignature(doc: PDFKit.PDFDocument, traitement: Traitement) {
    doc.moveDown(3);
    const date = new Date(traitement.date_prescription);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#000000');
    doc.text(`Fait à ${traitement.lieu_prescription || 'Antananarivo'}, le ${date.toLocaleDateString('fr-FR')}`, 50, doc.y, { width: 495, align: 'right' });
    doc.moveDown(0.5);
    
    if (traitement.prescripteur) {
      doc.font('Helvetica-Bold');
      doc.text(traitement.prescripteur.toUpperCase(), 50, doc.y, { width: 495, align: 'right' });
      doc.fontSize(9).font('Helvetica');
      doc.text('Médecin prescripteur', 50, doc.y + 15, { width: 495, align: 'right' });
    }
    
    // Cachet et signature
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica-Oblique').fillColor('#666666');
    doc.text('Cachet et signature', 50, doc.y, { width: 495, align: 'right' });
  }
}