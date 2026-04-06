import PDFDocument from 'pdfkit';
import path from 'path';
import type { BilanBiologique } from '../../domain/entities/BilanBiologique';
import type { Patient } from '../../domain/entities/Patient';

export class BilanBiologiquePDFService {
  generatePDF(bilan: BilanBiologique, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 30, bottom: 40, left: 50, right: 50 } });

    this.addOfficialHeader(doc, bilan, patient);
    this.addResultatsBiologiques(doc, bilan);
    if (bilan.resultat)       this.addSection(doc, 'RÉSULTATS DÉTAILLÉS', bilan.resultat);
    if (bilan.interpretation) this.addSection(doc, 'INTERPRÉTATION', bilan.interpretation);
    this.addSignature(doc, bilan);
    return doc;
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, bilan: BilanBiologique, patient: Patient) {
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
       .text('BILAN BIOLOGIQUE', rightColX, startY + 10, { underline: true });
    doc.fontSize(12)
       .text(bilan.type_bilan || 'Bilan standard', rightColX, startY + 30, { width: 250, align: 'left' });

    const patientY = startY + 80;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${patient.nom_patient.toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${patient.prenom_patient}`, rightColX, patientY + 18)
       .text(`AGE : ${age} ans`, rightColX, patientY + 36)
       .text(`GENRE : ${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}`, rightColX + 130, patientY + 36);

    const prelevY = patientY + 60;
    const datePrelevement = new Date(bilan.date_prelevement);
    doc.text(`DATE PRÉLÈVEMENT : ${datePrelevement.toLocaleDateString('fr-FR')}`, rightColX, prelevY)
       .text(`HEURE : ${bilan.heure_prelevement}`, rightColX, prelevY + 18);
    if (bilan.laboratoire)
      doc.text(`LABORATOIRE : ${bilan.laboratoire}`, rightColX, prelevY + 36);

    doc.moveTo(50, 250).lineTo(545, 250).dash(2, { space: 2 }).stroke().undash();
    doc.y = 265;
  }

  private addResultatsBiologiques(doc: PDFKit.PDFDocument, bilan: BilanBiologique) {
    doc.fontSize(11).font('Helvetica-Bold')
       .text('RÉSULTATS DES ANALYSES', 50, doc.y, { width: 495, underline: true });
    doc.moveDown(0.5);

    const resultats: Array<{ param: string; valeur: string; unite: string; norme: string }> = [];
    if (bilan.glycemie)   resultats.push({ param: 'Glycémie',    valeur: bilan.glycemie.toString(),   unite: 'g/L',       norme: '0.70 - 1.10' });
    if (bilan.creatinine) resultats.push({ param: 'Créatinine',  valeur: bilan.creatinine.toString(), unite: 'mg/L',      norme: '7 - 13'      });
    if (bilan.crp)        resultats.push({ param: 'CRP',         valeur: bilan.crp.toString(),        unite: 'mg/L',      norme: '< 5'         });
    if (bilan.inr)        resultats.push({ param: 'INR',         valeur: bilan.inr.toString(),        unite: '',          norme: '0.8 - 1.2'  });
    if (bilan.nfs)        resultats.push({ param: 'NFS (GB)',    valeur: bilan.nfs.toString(),        unite: '×10³/mm³',  norme: '4 - 10'     });

    if (resultats.length === 0) {
      doc.fontSize(10).font('Helvetica').text('Aucun résultat numérique disponible', 60, doc.y);
      doc.moveDown();
      return;
    }

    const tableTop = doc.y;
    const colX = [50, 200, 300, 380];

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('PARAMÈTRE', colX[0], tableTop);
    doc.text('VALEUR',    colX[1], tableTop);
    doc.text('UNITÉ',     colX[2], tableTop);
    doc.text('NORMES',    colX[3], tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).lineWidth(1).stroke();

    let yPos = tableTop + 20;
    doc.font('Helvetica').fontSize(9);
    resultats.forEach(res => {
      if (yPos > 700) { doc.addPage(); yPos = 50; }
      doc.text(res.param,  colX[0], yPos);
      doc.text(res.valeur, colX[1], yPos);
      doc.text(res.unite,  colX[2], yPos);
      doc.text(res.norme,  colX[3], yPos);
      yPos += 20;
    });

    doc.moveTo(50, yPos).lineTo(545, yPos).lineWidth(0.5).stroke();
    doc.y = yPos + 15;
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

  private addSignature(doc: PDFKit.PDFDocument, bilan: BilanBiologique) {
    doc.moveDown(2);
    const date = new Date(bilan.date_prelevement);
    doc.fontSize(10).font('Helvetica-Oblique')
       .text(`Fait à Antananarivo, le ${date.toLocaleDateString('fr-FR')}`, 50, doc.y, { width: 495, align: 'right' });
    if (bilan.prescripteur) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold')
         .text(`Dr ${bilan.prescripteur.toUpperCase()}`, 50, doc.y, { width: 495, align: 'right' });
    }
  }
}