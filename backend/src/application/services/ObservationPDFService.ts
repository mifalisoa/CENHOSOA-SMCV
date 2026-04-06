import PDFDocument from 'pdfkit';
import path from 'path';
import type { Observation } from '../../domain/entities/Observation';
import type { Patient } from '../../domain/entities/Patient';

export class ObservationPDFService {
  generatePDF(observation: Observation, patient: Patient): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 30, bottom: 40, left: 50, right: 50 } });

    this.addOfficialHeader(doc, observation, patient);
    this.addSection(doc, 'MOTIF DE CONSULTATION', observation.motif_consultation || observation.motif_hospitalisation || '');
    this.addSection(doc, 'HISTOIRE DE LA MALADIE', observation.histoire_maladie || '');
    this.addAntecedents(doc, observation);
    this.addExamenClinique(doc, observation);
    this.addSection(doc, 'RESUME SYNDROMIQUE', observation.resume_syndromique || '');
    this.addSection(doc, 'HYPOTHESES DIAGNOSTIQUES', observation.hypotheses_diagnostiques || '');
    this.addSection(doc, 'RESULTAT DES EXAMENS PARACLINIQUES DEMANDES', observation.resultats_examens_paracliniques || '');
    this.addSection(doc, 'DIAGNOSTIC RETENU', observation.diagnostic_retenu || '');
    this.addSection(doc, 'CAT (Conduite à tenir)', observation.cat || '');
    this.addSignature(doc, observation);
    return doc;
  }

  private addOfficialHeader(doc: PDFKit.PDFDocument, obs: Observation, patient: Patient) {
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

    const typeTxt = obs.type_observation === 'externe' ? '(externe)' : '(hospitalisation)';
    doc.fontSize(16).font('Helvetica-Bold')
       .text('OBSERVATION MEDICALE', rightColX, startY + 10, { underline: true });
    doc.fontSize(12).text(typeTxt, rightColX, startY + 30, { width: 250, align: 'left' });

    const patientY = startY + 80;
    const age = new Date().getFullYear() - new Date(patient.date_naissance).getFullYear();
    doc.fontSize(10).font('Helvetica')
       .text(`NOM : ${patient.nom_patient.toUpperCase()}`, rightColX, patientY)
       .text(`PRENOMS : ${patient.prenom_patient}`, rightColX, patientY + 18)
       .text(`AGE : ${age} ans`, rightColX, patientY + 36)
       .text(`GENRE : ${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}`, rightColX + 130, patientY + 36)
       .text(`ADRESSE : ${patient.adresse_patient}`, rightColX, patientY + 54)
       .text(`TELEPHONE : ${patient.tel_patient || '/'}`, rightColX, patientY + 72);

    doc.moveTo(50, 250).lineTo(545, 250).dash(2, { space: 2 }).stroke().undash();
    doc.y = 265;
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

  private addAntecedents(doc: PDFKit.PDFDocument, obs: Observation) {
    if (doc.y > 650) doc.addPage();
    doc.fontSize(11).font('Helvetica-Bold')
       .text('ANTECEDENTS', 50, doc.y, { width: 495, underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica-Bold').text('CMO', 50, doc.y, { width: 495 });
    doc.fontSize(9).font('Helvetica')
       .text(`• Chirurgicaux : ${obs.antecedents_cmo?.chirurgicaux || 'Néant'}`, 60, doc.y, { width: 485 })
       .text(`• Médicaux : ${obs.antecedents_cmo?.medicaux || 'Néant'}`, 60, doc.y, { width: 485 })
       .text(`• Gynéco-Obstétricaux : ${obs.antecedents_cmo?.gyneco_obstetricaux || 'Néant'}`, 60, doc.y, { width: 485 });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica-Bold').text('GMO', 50, doc.y, { width: 495 });
    doc.fontSize(9).font('Helvetica')
       .text(`• Génétique : ${obs.antecedents_gmo?.genetique || 'Néant'}`, 60, doc.y, { width: 485 })
       .text(`• Mode de vie / Per Os : ${obs.antecedents_gmo?.mode_vie || 'Néant'}`, 60, doc.y, { width: 485 });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica-Bold').text('CHE', 50, doc.y, { width: 495 });
    doc.fontSize(9).font('Helvetica')
       .text(`• Curriculum Vitae : ${obs.antecedents_che?.curriculum_vitae || 'Néant'}`, 60, doc.y, { width: 485 })
       .text(`• Hospitalisation antérieure : ${obs.antecedents_che?.hospitalisation || 'Néant'}`, 60, doc.y, { width: 485 })
       .text(`• Niveau Socio-économique : ${obs.antecedents_che?.niveau_socio_economique || 'Néant'}`, 60, doc.y, { width: 485 });
    doc.moveDown(0.8);
  }

  private addExamenClinique(doc: PDFKit.PDFDocument, obs: Observation) {
    if (doc.y > 650) doc.addPage();
    doc.fontSize(11).font('Helvetica-Bold')
       .text('EXAMEN CLINIQUE', 50, doc.y, { width: 495, underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica-Bold').text('EXAMEN GENERAL', 50, doc.y, { width: 495 });
    doc.fontSize(9).font('Helvetica');
    const ex = obs.examen_general || {};
    doc.text(`Etat général : ${ex.etat_general || '...'} | Conscience : ${ex.conscience || '...'}`, 60, doc.y, { width: 485 })
       .text(`TA : ${ex.tension_arterielle_gauche || '...'} mmHg | FC : ${ex.frequence_cardiaque || '...'} bpm | T° : ${ex.temperature || '...'}°C | SaO2 : ${ex.saturation_oxygene || '...'}%`, 60, doc.y, { width: 485 })
       .text(`Poids : ${ex.poids || '...'} kg | Taille : ${ex.taille || '...'} cm | IMC : ${ex.imc || '...'}`, 60, doc.y, { width: 485 });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica-Bold').text('EXAMEN PHYSIQUE', 50, doc.y, { width: 495 });
    doc.fontSize(9).font('Helvetica');
    doc.text('GROUPE CENTRAL :', 60, doc.y, { width: 485 });
    const c = obs.examen_physique_central || {};
    doc.text(`• BDC : ${c.bdc || '...'} | Souffles : ${c.souffles || '...'}`, 70, doc.y, { width: 475 })
       .text(`• Appareil respiratoire : ${c.appareil_respiratoire || '...'}`, 70, doc.y, { width: 475 });
    doc.moveDown(0.3);
    doc.text('GROUPE PERIPHERIQUE :', 60, doc.y, { width: 485 });
    const p = obs.examen_physique_peripherique || {};
    doc.text(`• Abdomen : ${p.abdomen || '...'} | Masse palpée : ${p.masse_palpee || '...'}`, 70, doc.y, { width: 475 })
       .text(`• Membres inférieurs (OMI) : ${p.membres_inferieurs_omi || '...'}`, 70, doc.y, { width: 475 });
    doc.moveDown(0.8);
  }

  private addSignature(doc: PDFKit.PDFDocument, observation: Observation) {
    doc.moveDown(2);
    const date = new Date(observation.date_observation);
    doc.fontSize(10).font('Helvetica-Oblique')
       .text(`Fait à Antananarivo, le ${date.toLocaleDateString('fr-FR')}`, 50, doc.y, { width: 495, align: 'right' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold')
       .text(`Dr ${observation.medecin.toUpperCase()}`, 50, doc.y, { width: 495, align: 'right' });
  }
}