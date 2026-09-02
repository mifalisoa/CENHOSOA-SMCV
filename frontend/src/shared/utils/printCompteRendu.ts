// src/shared/utils/printCompteRendu.ts
import type { CompteRendu } from '../../core/entities/CompteRendu';
import type { Patient }     from '../../core/entities/Patient';
import { printHTML }        from './printUtils';

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function calculateAge(dateNaissance: string | Date): number {
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return age;
}

// Bloc reutilisable pour une section texte optionnelle
function textSection(title: string, content: string | undefined): string {
  if (!content) return '';
  return `
  <div style="margin-bottom:12px">
    <div style="font-size:10px;font-weight:800;color:#0891b2;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:#0891b2;border-radius:2px"></span>
      ${title}
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:12px;color:#334155;line-height:1.7;white-space:pre-wrap">${content}</div>
  </div>`;
}

export function compteRenduToHTML(patient: Patient, cr: CompteRendu): string {
  const age = calculateAge(patient.date_naissance);

  const dateAdmission = formatDate(cr.date_admission);
  const dateSortie    = formatDate(cr.date_sortie);

  const diffMs    = new Date(cr.date_sortie).getTime() - new Date(cr.date_admission).getTime();
  const diffJours = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return `
  <!-- En-tete institution -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0891b2;padding-bottom:14px;margin-bottom:8px">
    <div>
      <div style="font-size:15px;font-weight:900;color:#0891b2;letter-spacing:0.5px">CENHOSOA — SMCV</div>
      <div style="font-size:10px;color:#64748b;margin-top:2px">Centre Hospitalier de Soavinandriana</div>
      <div style="font-size:10px;color:#64748b">Service des Maladies Cardiovasculaires</div>
      <div style="font-size:10px;color:#64748b">Antananarivo — Madagascar</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:900;color:#0c4a6e;text-transform:uppercase;letter-spacing:1px">COMPTE RENDU</div>
      <div style="font-size:13px;font-weight:700;color:#0891b2">D'HOSPITALISATION</div>
      <div style="font-size:10px;color:#64748b;margin-top:4px">
        Imprime le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toTimeString().slice(0, 5)}
      </div>
    </div>
  </div>

  <!-- Equipe du service — bloc statique complet, identique sur tous les comptes rendus -->
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:8px;color:#475569;line-height:1.5">

    <!-- Chef de Service — statut complet, mis en avant sur toute la largeur -->
    <div style="border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin-bottom:6px">
      <div style="font-weight:700;color:#0891b2;text-transform:uppercase;font-size:7px">Chef de Service</div>
      <div style="font-weight:700;font-size:9px;color:#0f172a;margin-top:1px">Médecin - Colonel RAVAOAVY Hariniaina</div>
      <div style="color:#64748b;margin-top:1px">Spécialiste des maladies du cœur et des vaisseaux — Ancien résident des hôpitaux de Dakar</div>
      <div style="color:#64748b">Cardiologie générale et Pédiatrique — Cardiologie interventionnelle (coronarographie diagnostique-angioplastie)</div>
    </div>

    <!-- Reste de l'equipe -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
      <div>
        <div style="font-weight:700;color:#0891b2;text-transform:uppercase;font-size:7px">Chef de Service Adjoint</div>
        <div>Médecin-Capitaine RABEHASY Radomahefa Josena</div>
      </div>
      <div>
        <div style="font-weight:700;color:#0891b2;text-transform:uppercase;font-size:7px">Adjoint au Chef de Service</div>
        <div>Docteur RAKOTOMANGA Dina</div>
      </div>
      <div>
        <div style="font-weight:700;color:#0891b2;text-transform:uppercase;font-size:7px">Médecin Assistant</div>
        <div>Docteur ANDRIANJAFIARIOLY Rojovola</div>
      </div>
      <div>
        <div style="font-weight:700;color:#0891b2;text-transform:uppercase;font-size:7px">Major de Service</div>
        <div>Adjudant-Chef RANDRIANJANAKA Elie Athanase Jean Philibert</div>
        <div style="color:#94a3b8">Tél : 034 58 166 31</div>
      </div>
      <div>
        <div style="font-weight:700;color:#0891b2;text-transform:uppercase;font-size:7px">Secrétaire</div>
        <div>Madame RAZAFINDRAHANTA Linah</div>
        <div style="color:#94a3b8">Tél : 032 11 053 34</div>
      </div>
    </div>
  </div>

  <!-- Info patient -->
  <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px 16px;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:20px">
    <div>
      <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Patient</div>
      <div style="font-size:14px;font-weight:800;color:#0c4a6e">${patient.nom_patient.toUpperCase()} ${patient.prenom_patient}</div>
    </div>
    <div>
      <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Age</div>
      <div style="font-size:13px;font-weight:700;color:#0c4a6e">${age} ans</div>
    </div>
    <div>
      <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Sexe</div>
      <div style="font-size:13px;font-weight:700;color:#0c4a6e">${patient.sexe_patient === 'M' ? 'Masculin' : 'Feminin'}</div>
    </div>
    <div>
      <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">N° Dossier</div>
      <div style="font-size:13px;font-weight:700;color:#0c4a6e">${patient.num_dossier}</div>
    </div>
    ${patient.adresse_patient ? `
    <div>
      <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Adresse</div>
      <div style="font-size:13px;font-weight:700;color:#0c4a6e">${patient.adresse_patient}</div>
    </div>` : ''}
    ${patient.tel_patient ? `
    <div>
      <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Telephone</div>
      <div style="font-size:13px;font-weight:700;color:#0c4a6e">${patient.tel_patient}</div>
    </div>` : ''}
    ${patient.assurance ? `
    <div>
      <div style="font-size:9px;font-weight:700;color:#0891b2;text-transform:uppercase">Assurance</div>
      <div style="font-size:13px;font-weight:700;color:#0c4a6e">${patient.assurance}</div>
    </div>` : ''}
  </div>

  <!-- Diagnostic — remonte en evidence, juste apres l'identite du patient -->
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:12px 16px;margin-bottom:12px">
    <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;margin-bottom:4px">Diagnostic</div>
    <div style="font-size:14px;font-weight:700;color:#14532d">${cr.diagnostic}</div>
  </div>

  <!-- Sejour hospitalier -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px">Date d'admission</div>
      <div style="font-size:13px;font-weight:700;color:#0f172a">${dateAdmission}</div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px">Date de sortie</div>
      <div style="font-size:13px;font-weight:700;color:#0f172a">${dateSortie}</div>
    </div>
    <div style="background:#0891b2;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:9px;font-weight:700;color:#bae6fd;text-transform:uppercase;margin-bottom:4px">Duree de sejour</div>
      <div style="font-size:20px;font-weight:900;color:white">${diffJours} jour${diffJours > 1 ? 's' : ''}</div>
    </div>
  </div>

  <!-- Sections texte — ordre calque sur le modele reel du service -->
  ${textSection('Contexte', cr.contexte)}
  ${textSection('Examens paracliniques', cr.examens_paracliniques)}
  ${textSection("Resume de l'observation", cr.resume_observation)}
  ${textSection('Traitement de sortie', cr.traitement_sortie)}
  ${textSection('Evolution', cr.evolution)}

  ${cr.prochain_rdv ? `
  <!-- Prochain RDV -->
  <div style="background:#fefce8;border:1px solid #fde047;border-radius:6px;padding:10px 14px;margin-bottom:12px">
    <div style="font-size:9px;font-weight:700;color:#854d0e;text-transform:uppercase;margin-bottom:4px">Prochain rendez-vous</div>
    <div style="font-size:12px;font-weight:600;color:#713f12">${cr.prochain_rdv}</div>
  </div>` : ''}

  <!-- Signature medecin -->
  <div style="display:flex;justify-content:flex-end;margin-top:24px">
    <div style="text-align:center;min-width:220px">
      <div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">
        Medecin traitant
      </div>
      <div style="font-size:14px;font-weight:800;color:#0f172a">Dr. ${cr.medecin}</div>
      <div style="margin-top:40px;border-top:1px solid #94a3b8;padding-top:6px">
        <div style="font-size:9px;color:#94a3b8">Cachet et signature</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8">
    <span>CENHOSOA-SMCV — Document confidentiel</span>
    <span>Imprime le ${new Date().toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
  </div>
  `;
}

export function printCompteRendu(patient: Patient, cr: CompteRendu): void {
  const html = compteRenduToHTML(patient, cr);
  printHTML(html, `Compte rendu — ${patient.nom_patient} ${patient.prenom_patient}`);
}