import PDFDocument from 'pdfkit';
import path from 'path';
import type { BilanBiologique } from '../../domain/entities/BilanBiologique';
import type { Patient } from '../../domain/entities/Patient';

export class BilanBiologiquePDFService {
  generatePDF(bilan: BilanBiologique, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 30, bottom: 40, left: 50, right: 50 },
    });

    // 1. En-tête officiel
    this.addOfficialHeader(doc, bilan, patient);
    
    // 2. Résultats biologiques
    this.addResultatsBiologiques(doc, bilan);
    
    // 3. Résultats détaillés
    if (bilan.resultat) {
      this.addSection(doc, 'RÉSULTATS DÉTAILLÉS', bilan.resultat);
    }
    
    // 4. Interprétation
    if (bilan.interpretation) {
      this.addSection(doc, 'INTERPRÉTATION', bilan.interpretation);
    }
    
    // 5. Signature
    this.addSignature(doc, bilan);

    return doc;
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, bilan: BilanBiologique, patient: Patient) {
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
       .text('Laboratoire d\'Analyses Médicales', leftColX, coordY + 25, { width: colWidth, align: 'center' });
    doc.fontSize(8)
       .text('Tel : 0 32 11 053 34', leftColX, coordY + 37, { width: colWidth, align: 'center' });
    
    // Petite barre horizontale décorative
    doc.moveTo(leftColX + 50, coordY + 52).lineTo(leftColX + 150, coordY + 52).lineWidth(0.5).stroke();
    
    // --- COLONNE DROITE : TITRE ET INFOS PATIENT ---
    // Titre du bilan
    doc.fontSize(16).font('Helvetica-Bold')
       .text('BILAN BIOLOGIQUE', rightColX, startY + 10, { underline: true });
    doc.fontSize(12)
       .text(bilan.type_bilan || 'Bilan standard', rightColX, startY + 30, { width: 250, align: 'left' });
    
    // Bloc Patient
    const patientY = startY + 80;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${patient.nom_patient.toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${patient.prenom_patient}`, rightColX, patientY + 18)
       .text(`AGE : ${age} ans`, rightColX, patientY + 36)
       .text(`GENRE : ${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}`, rightColX + 130, patientY + 36);
    
    // Infos prélèvement
    const prelevY = patientY + 60;
    const datePrelevement = new Date(bilan.date_prelevement);
    doc.text(`DATE PRÉLÈVEMENT : ${datePrelevement.toLocaleDateString('fr-FR')}`, rightColX, prelevY)
       .text(`HEURE : ${bilan.heure_prelevement}`, rightColX, prelevY + 18);
    
    if (bilan.laboratoire) {
      doc.text(`LABORATOIRE : ${bilan.laboratoire}`, rightColX, prelevY + 36);
    }
    
    // Ligne de séparation horizontale (pointillée)
    doc.moveTo(50, 240).lineTo(545, 240).dash(2, { space: 2 }).stroke().undash();
    
    doc.y = 260;
  }

  private addResultatsBiologiques(doc: PDFKit.PDFDocument, bilan: BilanBiologique) {
    const pageWidth = 495;
    
    doc.fontSize(11).font('Helvetica-Bold')
       .text('RÉSULTATS DES ANALYSES', 50, doc.y, { width: pageWidth, underline: true });
    doc.moveDown(0.5);

    // Créer un tableau des résultats
    const resultats: Array<{param: string, valeur: string, unite: string, norme: string}> = [];
    
    if (bilan.glycemie) {
      resultats.push({
        param: 'Glycémie',
        valeur: bilan.glycemie.toString(),
        unite: 'g/L',
        norme: '0.70 - 1.10'
      });
    }
    
    if (bilan.creatinine) {
      resultats.push({
        param: 'Créatinine',
        valeur: bilan.creatinine.toString(),
        unite: 'mg/L',
        norme: '7 - 13'
      });
    }
    
    if (bilan.crp) {
      resultats.push({
        param: 'CRP',
        valeur: bilan.crp.toString(),
        unite: 'mg/L',
        norme: '< 5'
      });
    }
    
    if (bilan.inr) {
      resultats.push({
        param: 'INR',
        valeur: bilan.inr.toString(),
        unite: '',
        norme: '0.8 - 1.2'
      });
    }
    
    if (bilan.nfs) {
      resultats.push({
        param: 'NFS (GB)',
        valeur: bilan.nfs.toString(),
        unite: '×10³/mm³',
        norme: '4 - 10'
      });
    }

    if (resultats.length === 0) {
      doc.fontSize(10).font('Helvetica')
         .text('Aucun résultat numérique disponible', 60, doc.y);
      doc.moveDown();
      return;
    }

    // En-tête du tableau
    const tableTop = doc.y;
    const colWidths = [150, 100, 80, 120];
    const colX = [50, 200, 300, 380];
    
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('PARAMÈTRE', colX[0], tableTop);
    doc.text('VALEUR', colX[1], tableTop);
    doc.text('UNITÉ', colX[2], tableTop);
    doc.text('NORMES', colX[3], tableTop);
    
    // Ligne sous l'en-tête
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).lineWidth(1).stroke();
    
    // Données
    let yPos = tableTop + 20;
    doc.font('Helvetica').fontSize(9);
    
    resultats.forEach((res) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }
      
      doc.text(res.param, colX[0], yPos);
      doc.text(res.valeur, colX[1], yPos);
      doc.text(res.unite, colX[2], yPos);
      doc.text(res.norme, colX[3], yPos);
      
      yPos += 20;
    });
    
    // Ligne de fin de tableau
    doc.moveTo(50, yPos).lineTo(545, yPos).lineWidth(0.5).stroke();
    
    doc.y = yPos + 15;
  }

  private addSection(doc: PDFKit.PDFDocument, title: string, content: string) {
    if (doc.y > 700) doc.addPage();
    
    const pageWidth = 495;
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
    doc.text(`${title} :`, 50, doc.y, { width: pageWidth });
    doc.moveDown(0.3);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(content || '', 50, doc.y, { width: pageWidth, align: 'justify' });
    doc.moveDown(0.8);
  }

  private addSignature(doc: PDFKit.PDFDocument, bilan: BilanBiologique) {
    doc.moveDown(2);
    const date = new Date(bilan.date_prelevement);
    doc.fontSize(10).font('Helvetica-Oblique');
    doc.text(`Fait à Antananarivo, le ${date.toLocaleDateString('fr-FR')}`, 50, doc.y, { width: 495, align: 'right' });
    
    if (bilan.prescripteur) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold');
      doc.text(`Dr ${bilan.prescripteur.toUpperCase()}`, 50, doc.y, { width: 495, align: 'right' });
    }
  }
}