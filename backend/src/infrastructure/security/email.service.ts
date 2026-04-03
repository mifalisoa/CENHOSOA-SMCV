// backend/src/infrastructure/services/email.service.ts

import nodemailer from 'nodemailer';
import { env }  from '../../config/env';
import fs       from 'fs';
import path     from 'path';

// ── Logo en base64 (noir et blanc via filtre CSS) ─────────────────────────────
function getLogoBase64(): string {
  try {
    const logoPath = path.join(__dirname, '../../../assets/logo-cenhosoa.png');
    const data     = fs.readFileSync(logoPath);
    return `data:image/png;base64,${data.toString('base64')}`;
  } catch {
    return ''; // Si le logo n'est pas trouvé, on l'ignore silencieusement
  }
}

const transporter = nodemailer.createTransport({
  host:   env.SMTP_HOST,
  port:   env.SMTP_PORT,
  secure: false, // TLS sur port 587
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

// ── Templates ─────────────────────────────────────────────────────────────────

function templateBase(contenu: string): string {
  const logoBase64 = getLogoBase64();
  const logoHtml   = logoBase64
    ? `<img src="${logoBase64}" alt="CENHOSOA" style="width:80px;height:80px;object-fit:contain;filter:grayscale(100%) brightness(10);margin-bottom:8px;" /><br/>`
    : '🏥 ';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: white;
                     border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: #08C5D1; padding: 28px 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; letter-spacing: 0.5px; }
        .header p  { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; }
        .body { padding: 32px; color: #374151; line-height: 1.6; }
        .body h2 { color: #111827; font-size: 18px; margin-top: 0; }
        .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
                padding: 20px 24px; margin: 20px 0; }
        .card p { margin: 6px 0; font-size: 14px; color: #6b7280; }
        .card strong { color: #111827; font-size: 15px; }
        .badge { display: inline-block; background: #08C5D1; color: white;
                 padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
        .warning { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px;
                   padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #92400e; }
        .footer { background: #f9fafb; padding: 16px 32px; text-align: center;
                  font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logoHtml}
          <h1>CENHOSOA-SMCV</h1>
          <p>Service des Maladies Cardio-Vasculaires</p>
        </div>
        <div class="body">${contenu}</div>
        <div class="footer">
          Cet email a été envoyé automatiquement — ne pas répondre.<br/>
          © ${new Date().getFullYear()} CENHOSOA-SMCV
        </div>
      </div>
    </body>
    </html>
  `;
}

// ── Envoi compte créé + mot de passe temporaire ───────────────────────────────

export async function sendCompteCreé(params: {
  to:                string;
  prenom:            string;
  nom:               string;
  role:              string;
  motDePasseTemporaire: string;
}): Promise<void> {
  const roleLabels: Record<string, string> = {
    admin: 'Administrateur', medecin: 'Médecin', interne: 'Interne',
    stagiaire: 'Stagiaire', infirmier: 'Infirmier', secretaire: 'Secrétaire',
  };

  const html = templateBase(`
    <h2>Bienvenue, ${params.prenom} ${params.nom} 👋</h2>
    <p>Votre compte a été créé sur la plateforme <strong>CENHOSOA-SMCV</strong>.</p>

    <div class="card">
      <p>Email de connexion</p>
      <strong>${params.to}</strong>
      <br/><br/>
      <p>Mot de passe temporaire</p>
      <strong style="font-size: 22px; letter-spacing: 2px; color: #08C5D1;">${params.motDePasseTemporaire}</strong>
      <br/><br/>
      <p>Rôle</p>
      <span class="badge">${roleLabels[params.role] ?? params.role}</span>
    </div>

    <div class="warning">
      ⚠️ <strong>Important :</strong> Ce mot de passe est temporaire.
      Vous devrez le changer dès votre première connexion.
    </div>

    <p style="font-size: 13px; color: #6b7280;">
      Si vous n'êtes pas à l'origine de cette demande ou si vous avez des questions,
      contactez l'administrateur de votre établissement.
    </p>
  `);

  await transporter.sendMail({
    from:    env.SMTP_FROM,
    to:      params.to,
    subject: '🏥 Vos identifiants CENHOSOA-SMCV',
    html,
  });
}

// ── Envoi alerte brute force ──────────────────────────────────────────────────

export async function sendAlerteBruteForce(params: {
  to:         string;
  ip:         string;
  email:      string;
  nbTentatives: number;
}): Promise<void> {
  const html = templateBase(`
    <h2>🚨 Alerte Sécurité</h2>
    <p>Des tentatives de connexion répétées ont été détectées sur votre plateforme.</p>

    <div class="card">
      <p>Compte ciblé</p>
      <strong>${params.email}</strong>
      <br/><br/>
      <p>Adresse IP</p>
      <strong>${params.ip}</strong>
      <br/><br/>
      <p>Nombre de tentatives</p>
      <strong style="color: #ef4444;">${params.nbTentatives} tentatives échouées</strong>
      <br/><br/>
      <p>Date/heure</p>
      <strong>${new Date().toLocaleString('fr-FR')}</strong>
    </div>

    <div class="warning">
      ⚠️ Si vous ne reconnaissez pas cette activité, vérifiez les sessions actives
      dans le module Sécurité de votre application.
    </div>
  `);

  await transporter.sendMail({
    from:    env.SMTP_FROM,
    to:      params.to,
    subject: '🚨 Alerte sécurité — Tentatives de connexion répétées',
    html,
  });
}

// ── Envoi confirmation changement mot de passe ────────────────────────────────

export async function sendMotDePasseChangé(params: {
  to:     string;
  prenom: string;
  nom:    string;
}): Promise<void> {
  const html = templateBase(`
    <h2>Mot de passe modifié ✅</h2>
    <p>Bonjour <strong>${params.prenom} ${params.nom}</strong>,</p>
    <p>Votre mot de passe CENHOSOA-SMCV a été modifié avec succès.</p>

    <div class="card">
      <p>Date/heure de modification</p>
      <strong>${new Date().toLocaleString('fr-FR')}</strong>
    </div>

    <div class="warning">
      ⚠️ Si vous n'êtes pas à l'origine de cette modification,
      contactez immédiatement votre administrateur.
    </div>
  `);

  await transporter.sendMail({
    from:    env.SMTP_FROM,
    to:      params.to,
    subject: '✅ Mot de passe CENHOSOA-SMCV modifié',
    html,
  });
}

// ── Envoi lien de réinitialisation mot de passe ───────────────────────────────

export async function sendResetPassword(params: {
  to:     string;
  prenom: string;
  nom:    string;
  token:  string;
}): Promise<void> {
  // L'URL du frontend — configurable via env
  const baseUrl  = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password/${params.token}`;

  const html = templateBase(`
    <h2>Réinitialisation de mot de passe 🔐</h2>
    <p>Bonjour <strong>${params.prenom} ${params.nom}</strong>,</p>
    <p>Vous avez demandé à réinitialiser votre mot de passe CENHOSOA-SMCV.</p>

    <div style="text-align:center; margin: 28px 0;">
      <a href="${resetUrl}"
         style="display:inline-block; background:#08C5D1; color:white; padding:14px 32px;
                border-radius:8px; font-weight:bold; font-size:15px; text-decoration:none;">
        Réinitialiser mon mot de passe
      </a>
    </div>

    <div class="card">
      <p>Ce lien est valable</p>
      <strong>1 heure</strong>
      <br/><br/>
      <p>Date d'expiration</p>
      <strong>${new Date(Date.now() + 60 * 60 * 1000).toLocaleString('fr-FR')}</strong>
    </div>

    <div class="warning">
      ⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      Votre mot de passe ne sera pas modifié.
    </div>

    <p style="font-size:12px; color:#9ca3af; margin-top:16px;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
      <span style="word-break:break-all; color:#08C5D1;">${resetUrl}</span>
    </p>
  `);

  await transporter.sendMail({
    from:    env.SMTP_FROM,
    to:      params.to,
    subject: '🔐 Réinitialisation de votre mot de passe CENHOSOA-SMCV',
    html,
  });
}

// ── Test de connexion SMTP ────────────────────────────────────────────────────

export async function verifySmtpConnection(): Promise<void> {
  await transporter.verify();
  console.log('✅ [Email] Connexion SMTP Brevo OK');
}