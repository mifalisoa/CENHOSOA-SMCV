import type { Observation }       from '../../core/entities/Observation';
import type { Patient }           from '../../core/entities/Patient';
import type { EvolutionPatient }  from '../../core/entities/EvolutionPatient';

function calculateAge(dateNaissance: string | Date): number {
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() ||
     (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function sigBadges(sigs?: Array<{ medecin: string; role?: string; date: string; heure: string }>): string {
  if (!sigs || sigs.length === 0) return '';
  return `<div class="signatures">${sigs.map(s => `
    <span class="sig-badge">
      ✍️ <strong>${s.medecin}</strong>
      ${s.role ? `<span class="sig-role">(${s.role})</span>` : ''}
      — ${new Date(s.date).toLocaleDateString('fr-FR')} à ${s.heure}
    </span>`).join('')}</div>`;
}

// ── HTML d'une seule observation ──────────────────────────────────────────────
export function observationToHTML(
  obs: Observation,
  evolutions: EvolutionPatient[] = []
): string {
  const sigs = (obs.signatures ?? {}) as Record<string, Array<{ medecin: string; role?: string; date: string; heure: string }>>;
  const isExt = obs.type_observation === 'externe';
  const motif = isExt ? obs.motif_consultation : obs.motif_hospitalisation;
  const ex    = obs.examen_general ?? {};
  const c     = obs.examen_physique_central ?? {};
  const p     = obs.examen_physique_peripherique ?? {};

  const vitaux = [
    { label: 'État général', value: ex.etat_general },
    { label: 'Conscience',   value: ex.conscience },
    { label: 'T°',           value: ex.temperature   ? `${ex.temperature} °C`   : null },
    { label: 'FC',           value: ex.frequence_cardiaque ? `${ex.frequence_cardiaque} bpm` : null },
    { label: 'FR',           value: ex.frequence_respiratoire ? `${ex.frequence_respiratoire} rpm` : null },
    { label: 'SpO2',         value: ex.saturation_oxygene ? `${ex.saturation_oxygene} %` : null },
    { label: 'TA G',         value: ex.tension_arterielle_gauche },
    { label: 'TA D',         value: ex.tension_arterielle_droite },
    { label: 'Poids',        value: ex.poids  ? `${ex.poids} kg`  : null },
    { label: 'Taille',       value: ex.taille ? `${ex.taille} cm` : null },
    { label: 'IMC',          value: ex.imc    ? String(ex.imc)    : null },
    { label: 'Diurèse',      value: ex.diurese },
  ].filter(v => !!v.value);

  const centraux = [
    { label: 'Choc de pointe',        value: c.choc_pointe },
    { label: 'BDC',                   value: c.bdc },
    { label: 'Souffles',              value: c.souffles },
    { label: 'Pouls périphériques',   value: c.pouls_peripheriques },
    { label: 'Veines jugulaires',     value: c.veines_jugulaires },
    { label: 'Appareil respiratoire', value: c.appareil_respiratoire },
    { label: 'Foie',                  value: c.foie },
  ].filter(v => !!v.value);

  const periph = [
    { label: 'Conjonctives',        value: p.conjonctives_muqueuses },
    { label: 'Bucco-dentaire',      value: p.etat_bucco_dentaire },
    { label: 'Masse cervicale',     value: p.masse_cervicale },
    { label: 'Abdomen',             value: p.abdomen },
    { label: 'Masse palpée',        value: p.masse_palpee },
    { label: 'Membres inf. (OMI)',  value: p.membres_inferieurs_omi },
    { label: 'Mollets',             value: p.mollets },
    { label: 'Extrémités',          value: p.extremites },
    { label: 'Autres',              value: p.autres },
  ].filter(v => !!v.value);

  // ── Mises à jour ──
  const evolSorted = [...evolutions].sort(
    (a, b) => new Date(a.date_visite).getTime() - new Date(b.date_visite).getTime()
  );

  const evolHTML = evolSorted.map(evol => {
    const pv = evol.parametres ?? {};
    const vitauxEvol = [
      { label: 'T°',    value: pv.temperature          ? `${pv.temperature} °C`    : null },
      { label: 'FC',    value: pv.frequence_cardiaque   ? `${pv.frequence_cardiaque} bpm` : null },
      { label: 'FR',    value: pv.frequence_respiratoire ? `${pv.frequence_respiratoire} rpm` : null },
      { label: 'SpO2',  value: pv.saturation_oxygene    ? `${pv.saturation_oxygene} %` : null },
      { label: 'TA G',  value: pv.tension_arterielle_gauche },
      { label: 'TA D',  value: pv.tension_arterielle_droite },
      { label: 'Poids', value: pv.poids ? `${pv.poids} kg` : null },
      { label: 'Diurèse', value: pv.diurese },
    ].filter(v => !!v.value);

    return `
    <div class="evolution">
      <div class="evolution-header">
        📅 ${new Date(evol.date_visite).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        &nbsp;·&nbsp; ${evol.heure_visite}
        &nbsp;·&nbsp; Dr. ${evol.medecin}
      </div>
      ${evol.resume_patient ? `
        <div class="evolution-section">
          <div class="evolution-section-title">Résumé</div>
          <div class="section-content">${evol.resume_patient}</div>
        </div>` : ''}
      ${vitauxEvol.length > 0 ? `
        <div class="evolution-section">
          <div class="evolution-section-title">Paramètres</div>
          <div class="vitals-grid">
            ${vitauxEvol.map(v => `
              <div class="vital-box">
                <div class="vital-label">${v.label}</div>
                <div class="vital-value">${v.value}</div>
              </div>`).join('')}
          </div>
        </div>` : ''}
      ${evol.traitement ? `
        <div class="evolution-section">
          <div class="evolution-section-title">Traitement</div>
          <div class="section-content">${evol.traitement}</div>
        </div>` : ''}
      ${evol.problemes_poses ? `
        <div class="evolution-section">
          <div class="evolution-section-title">Problèmes posés</div>
          <div class="section-content">${evol.problemes_poses}</div>
        </div>` : ''}
      ${evol.cat ? `
        <div class="evolution-section">
          <div class="evolution-section-title">CAT</div>
          <div class="section-content">${evol.cat}</div>
        </div>` : ''}
    </div>`;
  }).join('');

  return `
  <div class="observation">
    <div class="obs-header">
      <span class="obs-type">🩺 ${isExt ? 'Consultation externe' : 'Hospitalisation'}</span>
      <span class="obs-date">${formatDate(obs.date_observation)} à ${String(obs.heure_observation).slice(0, 5)}</span>
    </div>
    <div class="obs-body">

      ${motif ? `
        <div class="section">
          <div class="section-title">Motif ${isExt ? 'de consultation' : "d'hospitalisation"}</div>
          <div class="section-content">${motif}</div>
          ${sigBadges(sigs['motif'])}
        </div>` : ''}

      ${obs.histoire_maladie ? `
        <div class="section">
          <div class="section-title">Histoire de la maladie</div>
          <div class="section-content">${obs.histoire_maladie}</div>
        </div>` : ''}

      ${(obs.antecedents_cmo || obs.antecedents_gmo || obs.antecedents_che) ? `
        <div class="section">
          <div class="section-title">Antécédents</div>
          <div class="ant-grid">
            <div class="ant-box">
              <div class="ant-box-title">CMO</div>
              ${obs.antecedents_cmo?.chirurgicaux      ? `<div class="ant-row">Chirurgicaux : <span>${obs.antecedents_cmo.chirurgicaux}</span></div>` : ''}
              ${obs.antecedents_cmo?.medicaux           ? `<div class="ant-row">Médicaux : <span>${obs.antecedents_cmo.medicaux}</span></div>` : ''}
              ${obs.antecedents_cmo?.gyneco_obstetricaux ? `<div class="ant-row">Gynéco-obst. : <span>${obs.antecedents_cmo.gyneco_obstetricaux}</span></div>` : ''}
            </div>
            <div class="ant-box">
              <div class="ant-box-title">GMO</div>
              ${obs.antecedents_gmo?.genetique ? `<div class="ant-row">Génétique : <span>${obs.antecedents_gmo.genetique}</span></div>` : ''}
              ${obs.antecedents_gmo?.mode_vie  ? `<div class="ant-row">Mode de vie : <span>${obs.antecedents_gmo.mode_vie}</span></div>` : ''}
              ${obs.antecedents_gmo?.per_os    ? `<div class="ant-row">Per Os : <span>${obs.antecedents_gmo.per_os}</span></div>` : ''}
            </div>
            <div class="ant-box">
              <div class="ant-box-title">CHE</div>
              ${obs.antecedents_che?.curriculum_vitae        ? `<div class="ant-row">CV : <span>${obs.antecedents_che.curriculum_vitae}</span></div>` : ''}
              ${obs.antecedents_che?.hospitalisation          ? `<div class="ant-row">Hosp. : <span>${obs.antecedents_che.hospitalisation}</span></div>` : ''}
              ${obs.antecedents_che?.niveau_socio_economique ? `<div class="ant-row">NSE : <span>${obs.antecedents_che.niveau_socio_economique}</span></div>` : ''}
            </div>
          </div>
          ${sigBadges(sigs['antecedents'])}
        </div>` : ''}

      ${vitaux.length > 0 ? `
        <div class="section">
          <div class="section-title">Examen général</div>
          <div class="vitals-grid">
            ${vitaux.map(v => `
              <div class="vital-box">
                <div class="vital-label">${v.label}</div>
                <div class="vital-value">${v.value}</div>
              </div>`).join('')}
          </div>
          ${sigBadges(sigs['examen_general'])}
        </div>` : ''}

      ${centraux.length > 0 ? `
        <div class="section">
          <div class="section-title">Examen physique central</div>
          ${centraux.map(v => `<div class="section-content"><strong>${v.label} :</strong> ${v.value}</div>`).join('')}
          ${sigBadges(sigs['examen_physique_central'])}
        </div>` : ''}

      ${periph.length > 0 ? `
        <div class="section">
          <div class="section-title">Examen physique périphérique</div>
          ${periph.map(v => `<div class="section-content"><strong>${v.label} :</strong> ${v.value}</div>`).join('')}
          ${sigBadges(sigs['examen_physique_peripherique'])}
        </div>` : ''}

      ${obs.resume_syndromique ? `
        <div class="section">
          <div class="section-title">Résumé syndromique</div>
          <div class="section-content">${obs.resume_syndromique}</div>
          ${sigBadges(sigs['resume_syndromique'])}
        </div>` : ''}

      ${obs.hypotheses_diagnostiques ? `
        <div class="section">
          <div class="section-title">Hypothèses diagnostiques</div>
          <div class="section-content">${obs.hypotheses_diagnostiques}</div>
          ${sigBadges(sigs['hypotheses_diagnostiques'])}
        </div>` : ''}

      ${obs.resultats_examens_paracliniques ? `
        <div class="section">
          <div class="section-title">Résultats paracliniques</div>
          <div class="section-content">${obs.resultats_examens_paracliniques}</div>
          ${sigBadges(sigs['resultats_examens_paracliniques'])}
        </div>` : ''}

      ${obs.cat ? `
        <div class="section">
          <div class="section-title">CAT</div>
          <div class="section-content">${obs.cat}</div>
          ${sigBadges(sigs['cat'])}
        </div>` : ''}

      ${obs.diagnostic_retenu ? `
        <div class="diagnostic-box">
          <div class="diag-label">✅ Diagnostic retenu</div>
          <div class="diag-value">${obs.diagnostic_retenu}</div>
          ${sigBadges(sigs['diagnostic_retenu'])}
        </div>` : ''}

      ${evolSorted.length > 0 ? `
        <div class="section" style="margin-top:12px">
          <div class="section-title">Mises à jour quotidiennes (${evolSorted.length})</div>
          ${evolHTML}
        </div>` : ''}

      <div class="medecin-box">
        <div class="medecin-inner">
          <div class="medecin-label">Médecin traitant</div>
          <div class="medecin-name">${obs.medecin}</div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── HTML de l'en-tête patient ────────────────────────────────────────────────
export function patientHeaderHTML(patient: Patient): string {
  const age = calculateAge(patient.date_naissance);
  return `
  <div class="header">
    <div class="header-left">
      <h1>CENHOSOA — SMCV</h1>
      <p>Centre Hospitalier de Soavinandriana, Antananarivo</p>
    </div>
    <div class="header-right">
      <div class="doc-title">Observation Médicale</div>
      <div class="doc-subtitle">Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toTimeString().slice(0, 5)}</div>
    </div>
  </div>
  <div class="patient-box">
    <div class="field">
      <div class="field-label">Patient</div>
      <div class="field-value">${patient.nom_patient.toUpperCase()} ${patient.prenom_patient}</div>
    </div>
    <div class="field">
      <div class="field-label">Âge</div>
      <div class="field-value">${age} ans</div>
    </div>
    <div class="field">
      <div class="field-label">Genre</div>
      <div class="field-value">${patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'}</div>
    </div>
    <div class="field">
      <div class="field-label">Téléphone</div>
      <div class="field-value">${patient.tel_patient || '—'}</div>
    </div>
    <div class="field">
      <div class="field-label">Adresse</div>
      <div class="field-value">${patient.adresse_patient || '—'}</div>
    </div>
  </div>`;
}

// ── HTML footer ──────────────────────────────────────────────────────────────
export function footerHTML(): string {
  return `
  <div class="footer">
    <span>CENHOSOA — Service de Médecine Cardiovasculaire</span>
    <span>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toTimeString().slice(0, 5)}</span>
  </div>`;
}