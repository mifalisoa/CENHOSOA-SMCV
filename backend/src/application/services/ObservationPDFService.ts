import PDFDocument from 'pdfkit';
import path from 'path';
import type { Observation } from '../../domain/entities/Observation';
import type { Patient } from '../../domain/entities/Patient';

export class ObservationPDFService {
  generatePDF(observation: Observation, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 30, bottom: 40, left: 50, right: 50 },
    });

    // 1. En-tête avec infos patient
    this.addOfficialHeader(doc, observation, patient);
    
    // 2. Motif et Histoire
    this.addSection(doc, 'MOTIF DE CONSULTATION', 
      observation.motif_consultation || observation.motif_hospitalisation || ''
    );
    
    this.addSection(doc, 'HISTOIRE DE LA MALADIE', observation.histoire_maladie || '');

    // 3. Antécédents
    this.addAntecedents(doc, observation);

    // 4. Examen clinique
    this.addExamenClinique(doc, observation);

    // 5. Synthèse
    this.addSection(doc, 'RESUME SYNDROMIQUE', observation.resume_syndromique || '');
    this.addSection(doc, 'HYPOTHESES DIAGNOSTIQUES', observation.hypotheses_diagnostiques || '');
    this.addSection(doc, 'RESULTAT DES EXAMENS PARACLINIQUES DEMANDES', 
      observation.resultats_examens_paracliniques || ''
    );
    
    // 6. Conclusion
    this.addSection(doc, 'DIAGNOSTIC RETENU', observation.diagnostic_retenu || '');
    this.addSection(doc, 'CAT (Conduite à tenir)', observation.cat || '');

    // 7. Signature
    this.addSignature(doc, observation);

    return doc;
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, obs: Observation, patient: Patient) {
    const startY = 30;
    const leftColX = 50;
    const rightColX = 280;
    const colWidth = 200;
    
    // --- COLONNE GAUCHE : BLOC ADMINISTRATIF ---
    doc.fontSize(9).font('Helvetica-Bold')
       .text('CENTRE HOSPITALIER', leftColX, startY, { width: colWidth, align: 'center' })
       .text('DE SOAVINANDRIANA', leftColX, startY + 12, { width: colWidth, align: 'center' })
       .text('ANTANANARIVO', leftColX, startY + 24, { width: colWidth, align: 'center' });
    
    // Logo (Portail 1891)
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
    // Titre de l'observation
    const typeTxt = obs.type_observation === 'externe' ? '(externe)' : '(hospitalisation)';
    doc.fontSize(16).font('Helvetica-Bold')
       .text('OBSERVATION MEDICALE', rightColX, startY + 10, { underline: true });
    doc.fontSize(12)
       .text(typeTxt, rightColX, startY + 30, { width: 250, align: 'left' });
    
    // Bloc Patient (Positionné à droite du logo)
    const patientY = startY + 80;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${patient.nom_patient.toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${patient.prenom_patient}`, rightColX, patientY + 18)
       .text(`AGE : ${age} ans`, rightColX, patientY + 36)
       .text(`GENRE : ${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}`, rightColX + 130, patientY + 36)
       .text(`ADRESSE : ${patient.adresse_patient}`, rightColX, patientY + 54)
       .text(`TELEPHONE : ${patient.tel_patient || '/'}`, rightColX, patientY + 72);
    
    // Ligne de séparation horizontale (pointillée)
    doc.moveTo(50, 240).lineTo(545, 240).dash(2, { space: 2 }).stroke().undash();
    
    // On replace le curseur pour le début du contenu
    doc.y = 260;
  }

  private addSection(doc: PDFKit.PDFDocument, title: string, content: string) {
    if (doc.y > 700) doc.addPage();
    
    const pageWidth = 495; // Largeur totale utilisable (595 - 50 - 50)
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
    doc.text(`${title} :`, 50, doc.y, { width: pageWidth });
    doc.moveDown(0.3);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(content || '', 50, doc.y, { width: pageWidth, align: 'justify' });
    doc.moveDown(0.8);
  }

  private addAntecedents(doc: PDFKit.PDFDocument, obs: Observation) {
    if (doc.y > 650) doc.addPage();
    
    const pageWidth = 495;
    
    doc.fontSize(11).font('Helvetica-Bold').text('ANTECEDENTS', 50, doc.y, { width: pageWidth, underline: true });
    doc.moveDown(0.3);

    // CMO
    doc.fontSize(10).font('Helvetica-Bold').text('CMO', 50, doc.y, { width: pageWidth });
    doc.fontSize(9).font('Helvetica');
    doc.text(`• Chirurgicaux : ${obs.antecedents_cmo?.chirurgicaux || 'Néant'}`, 60, doc.y, { width: pageWidth - 10 });
    doc.text(`• Médicaux : ${obs.antecedents_cmo?.medicaux || 'Néant'}`, 60, doc.y, { width: pageWidth - 10 });
    doc.text(`• Gynéco-Obstétricaux : ${obs.antecedents_cmo?.gyneco_obstetricaux || 'Néant'}`, 60, doc.y, { width: pageWidth - 10 });
    doc.moveDown(0.3);

    // GMO
    doc.fontSize(10).font('Helvetica-Bold').text('GMO', 50, doc.y, { width: pageWidth });
    doc.fontSize(9).font('Helvetica');
    doc.text(`• Génétique : ${obs.antecedents_gmo?.genetique || 'Néant'}`, 60, doc.y, { width: pageWidth - 10 });
    doc.text(`• Mode de vie / Per Os : ${obs.antecedents_gmo?.mode_vie || 'Néant'}`, 60, doc.y, { width: pageWidth - 10 });
    doc.moveDown(0.3);

    // CHE
    doc.fontSize(10).font('Helvetica-Bold').text('CHE', 50, doc.y, { width: pageWidth });
    doc.fontSize(9).font('Helvetica');
    doc.text(`• Curriculum Vitae : ${obs.antecedents_che?.curriculum_vitae || 'Néant'}`, 60, doc.y, { width: pageWidth - 10 });
    doc.text(`• Hospitalisation antérieure : ${obs.antecedents_che?.hospitalisation || 'Néant'}`, 60, doc.y, { width: pageWidth - 10 });
    doc.text(`• Niveau Socio-économique : ${obs.antecedents_che?.niveau_socio_economique || 'Néant'}`, 60, doc.y, { width: pageWidth - 10 });
    doc.moveDown(0.8);
  }

  private addExamenClinique(doc: PDFKit.PDFDocument, obs: Observation) {
    if (doc.y > 650) doc.addPage();
    
    const pageWidth = 495;
    
    doc.fontSize(11).font('Helvetica-Bold').text('EXAMEN CLINIQUE', 50, doc.y, { width: pageWidth, underline: true });
    doc.moveDown(0.3);
    
    // EXAMEN GENERAL
    doc.fontSize(10).font('Helvetica-Bold').text('EXAMEN GENERAL', 50, doc.y, { width: pageWidth });
    doc.fontSize(9).font('Helvetica');
    const ex = obs.examen_general || {};
    
    doc.text(`Etat général : ${ex.etat_general || '...'} | Conscience : ${ex.conscience || '...'}`, 60, doc.y, { width: pageWidth - 10 });
    doc.text(`TA : ${ex.tension_arterielle_gauche || '...'} mmHg | FC : ${ex.frequence_cardiaque || '...'} bpm | T° : ${ex.temperature || '...'}°C | SaO2 : ${ex.saturation_oxygene || '...'}%`, 60, doc.y, { width: pageWidth - 10 });
    doc.text(`Poids : ${ex.poids || '...'} kg | Taille : ${ex.taille || '...'} cm | IMC : ${ex.imc || '...'}`, 60, doc.y, { width: pageWidth - 10 });
    doc.moveDown(0.5);

    // EXAMEN PHYSIQUE
    doc.fontSize(10).font('Helvetica-Bold').text('EXAMEN PHYSIQUE', 50, doc.y, { width: pageWidth });
    doc.fontSize(9).font('Helvetica');
    
    doc.text('GROUPE CENTRAL :', 60, doc.y, { width: pageWidth - 10 });
    const c = obs.examen_physique_central || {};
    doc.text(`• BDC : ${c.bdc || '...'} | Souffles : ${c.souffles || '...'}`, 70, doc.y, { width: pageWidth - 20 });
    doc.text(`• Appareil respiratoire : ${c.appareil_respiratoire || '...'}`, 70, doc.y, { width: pageWidth - 20 });
    doc.moveDown(0.3);
    
    doc.text('GROUPE PERIPHERIQUE :', 60, doc.y, { width: pageWidth - 10 });
    const p = obs.examen_physique_peripherique || {};
    doc.text(`• Abdomen : ${p.abdomen || '...'} | Masse palpée : ${p.masse_palpee || '...'}`, 70, doc.y, { width: pageWidth - 20 });
    doc.text(`• Membres inférieurs (OMI) : ${p.membres_inferieurs_omi || '...'}`, 70, doc.y, { width: pageWidth - 20 });
    doc.moveDown(0.8);
  }

  private addSignature(doc: PDFKit.PDFDocument, observation: Observation) {
    doc.moveDown(2);
    const date = new Date(observation.date_observation);
    doc.fontSize(10).font('Helvetica-Oblique');
    doc.text(`Fait à Antananarivo, le ${date.toLocaleDateString('fr-FR')}`, 50, doc.y, { width: 495, align: 'right' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold');
    doc.text(`Dr ${observation.medecin.toUpperCase()}`, 50, doc.y, { width: 495, align: 'right' });
  }
}