import PDFDocument from 'pdfkit';
import path from 'path';
import type { Traitement } from '../../domain/entities/Traitement';
import type { Patient } from '../../domain/entities/Patient';

export class TraitementPDFService {
  generatePDF(traitement: Traitement, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 30, bottom: 40, left: 50, right: 50 } });

    this.addOfficialHeader(doc, traitement, patient);
    if (traitement.diagnostic)             this.addDiagnostic(doc, traitement.diagnostic);
    this.addPrescription(doc, traitement);
    if (traitement.instructions)           this.addInstructions(doc, traitement.instructions);
    if (traitement.observations_speciales) this.addObservations(doc, traitement.observations_speciales);
    this.addSignature(doc, traitement);
    return doc;
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, traitement: Traitement, patient: Patient) {
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

    const titre = traitement.type_document === 'ordonnance' ? 'ORDONNANCE MÉDICALE' : 'TRAITEMENT';
    doc.fontSize(16).font('Helvetica-Bold')
       .text(titre, rightColX, startY + 10, { underline: true });

    const patientY = startY + 50;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${patient.nom_patient.toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${patient.prenom_patient}`, rightColX, patientY + 18)
       .text(`AGE : ${age} ans`, rightColX, patientY + 36)
       .text(`GENRE : ${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}`, rightColX + 130, patientY + 36);

    const prescY = patientY + 60;
    const datePresc = new Date(traitement.date_prescription);
    doc.text(`DATE : ${datePresc.toLocaleDateString('fr-FR')}`, rightColX, prescY)
       .text(`HEURE : ${traitement.heure_prescription}`, rightColX, prescY + 18);
    if (traitement.prescripteur)
      doc.text(`PRESCRIPTEUR : ${traitement.prescripteur}`, rightColX, prescY + 36);
    if (traitement.lieu_prescription)
      doc.fontSize(9).text(`Lieu : ${traitement.lieu_prescription}`, rightColX, prescY + 54);

    doc.moveTo(50, 250).lineTo(545, 250).dash(2, { space: 2 }).stroke().undash();
    doc.y = 265;
  }

  private addDiagnostic(doc: PDFKit.PDFDocument, diagnostic: string) {
    if (doc.y > 700) doc.addPage();
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
       .text('DIAGNOSTIC', 50, doc.y, { width: 495, underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(diagnostic, 50, doc.y, { width: 495 });
    doc.moveDown(1.5);
  }

  private addPrescription(doc: PDFKit.PDFDocument, traitement: Traitement) {
    if (doc.y > 650) doc.addPage();
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
       .text('PRESCRIPTION', 50, doc.y, { width: 495, underline: true });
    doc.moveDown(0.8);
    doc.fontSize(20).font('Helvetica-Bold').text('℞', 50, doc.y);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold')
       .text(`${traitement.medicament} - ${traitement.dosage}`, 50, doc.y, { width: 495 });
    doc.moveDown(0.8);
    doc.fontSize(10).font('Helvetica')
       .text(`Voie d'administration : ${traitement.voie_administration}`, 70, doc.y)
       .moveDown(0.5)
       .text(`Fréquence : ${traitement.frequence}`, 70, doc.y)
       .moveDown(0.5)
       .text(`Durée du traitement : ${traitement.duree}`, 70, doc.y);
    doc.moveDown(1.5);
  }

  private addInstructions(doc: PDFKit.PDFDocument, instructions: string) {
    if (doc.y > 700) doc.addPage();
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
       .text('INSTRUCTIONS', 50, doc.y, { width: 495, underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(instructions, 50, doc.y, { width: 495, align: 'justify' });
    doc.moveDown(1);
  }

  private addObservations(doc: PDFKit.PDFDocument, observations: string) {
    if (doc.y > 700) doc.addPage();
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#d97706')
       .text('OBSERVATIONS SPÉCIALES', 50, doc.y, { width: 495, underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#000000')
       .text(observations, 50, doc.y, { width: 495, align: 'justify' });
    doc.moveDown(1);
  }

  private addSignature(doc: PDFKit.PDFDocument, traitement: Traitement) {
    doc.moveDown(3);
    const date = new Date(traitement.date_prescription);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#000000')
       .text(`Fait à ${traitement.lieu_prescription || 'Antananarivo'}, le ${date.toLocaleDateString('fr-FR')}`, 50, doc.y, { width: 495, align: 'right' });
    doc.moveDown(0.5);
    if (traitement.prescripteur) {
      doc.font('Helvetica-Bold')
         .text(traitement.prescripteur.toUpperCase(), 50, doc.y, { width: 495, align: 'right' });
      doc.fontSize(9).font('Helvetica')
         .text('Médecin prescripteur', 50, doc.y + 15, { width: 495, align: 'right' });
    }
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica-Oblique').fillColor('#666666')
       .text('Cachet et signature', 50, doc.y, { width: 495, align: 'right' });
  }
}