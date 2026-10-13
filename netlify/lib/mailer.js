/* Envoi des mails du club en SMTP.
   Aujourd'hui : un compte Gmail + mot de passe d'application.
   Plus tard : Brevo (ou autre) en changeant seulement les variables Netlify, sans toucher au code.

   Variables d'environnement (Netlify › Site configuration › Environment variables) :
     SMTP_USER       adresse qui envoie (ex. ton.adresse@gmail.com)           — obligatoire
     SMTP_PASS       mot de passe d'application Google (16 lettres)          — obligatoire
     SMTP_HOST       serveur SMTP (défaut : smtp.gmail.com)
     SMTP_PORT       port (défaut : 465, connexion chiffrée)
     MAIL_FROM       adresse affichée (défaut : SMTP_USER)
     MAIL_FROM_NAME  nom affiché (défaut : Dragons de Ronchin)
     MAIL_REPLY_TO   adresse de réponse (optionnel)                                   */
import nodemailer from "nodemailer";

export const SUBJECT_PREFIX = "[Dragons] ";

export function mailConfig() {
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  if (!user || !pass) return null;
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT || 465);
  return {
    host,
    port,
    user,
    pass,
    from: (process.env.MAIL_FROM || user).trim(),
    name: (process.env.MAIL_FROM_NAME || "Dragons de Ronchin").trim(),
    replyTo: (process.env.MAIL_REPLY_TO || "").trim(),
  };
}

/* Adresse affichée, masquée à moitié (pour l'écran Administration) */
export function maskEmail(e) {
  const [u, d] = String(e || "").split("@");
  if (!d) return "";
  return (u.length <= 2 ? u[0] + "…" : u.slice(0, 2) + "…" + u.slice(-1)) + "@" + d;
}

export function makeTransport(cfg) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    // uniquement pour les tests locaux (serveur SMTP de test sans chiffrement)
    ...(process.env.SMTP_TEST_PLAIN ? { ignoreTLS: true, secure: false } : {}),
  });
}

/* Envoie un mail. images : [{ cid, dataUrl }] → pièces jointes « inline » (les messageries bloquent les images data:) */
export async function sendMail(transport, cfg, { to, subject, html, text, images = [] }) {
  const attachments = images
    .filter((im) => im && im.cid && /^data:image\/png;base64,/.test(im.dataUrl || ""))
    .map((im) => ({ filename: im.cid.split("@")[0] + ".png", content: im.dataUrl.split(",")[1], encoding: "base64", cid: im.cid, contentType: "image/png" }));
  return transport.sendMail({
    from: { name: cfg.name, address: cfg.from },
    to,
    ...(cfg.replyTo ? { replyTo: cfg.replyTo } : {}),
    subject: subject.startsWith(SUBJECT_PREFIX) ? subject : SUBJECT_PREFIX + subject,
    html,
    text,
    attachments,
    headers: { "Auto-Submitted": "auto-generated" },
  });
}

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function shell(title, body) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#F3F6F4">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F6F4"><tr><td align="center" style="padding:20px 10px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #E3EAE5">
<tr><td style="background:#0E1511;padding:16px 24px;font:700 16px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#fff">Dragons de Ronchin</td></tr>
${body}
</table></td></tr></table></body></html>`;
}

export function renderResetMail({ name, username, link, minutes }) {
  const subject = "Réinitialiser ton mot de passe";
  const html = shell(subject, `<tr><td style="padding:24px 24px 6px;font:16px/1.5 Arial,sans-serif;color:#0E1511">
  Salut ${esc(name || username)},<br><br>
  Quelqu'un (sûrement toi) a demandé un nouveau mot de passe pour ton compte <b>@${esc(username)}</b> sur l'appli des Dragons.
</td></tr>
<tr><td align="center" style="padding:18px 24px">
  <a href="${esc(link)}" style="display:inline-block;background:#2E8B57;color:#fff;text-decoration:none;font:700 15px Arial,sans-serif;padding:14px 26px;border-radius:10px">Choisir un nouveau mot de passe</a>
</td></tr>
<tr><td style="padding:0 24px 22px;font:13px/1.5 Arial,sans-serif;color:#6B7A71">
  Le lien marche <b>${minutes} minutes</b> et une seule fois.<br>
  Ce n'est pas toi ? Ignore ce mail : ton mot de passe actuel ne change pas.
</td></tr>`);
  const text = `Salut ${name || username},\n\nNouveau mot de passe pour ton compte @${username} (appli des Dragons) :\n${link}\n\nLe lien marche ${minutes} minutes et une seule fois. Ce n'est pas toi ? Ignore ce mail.`;
  return { subject, html, text };
}

export function renderTestMail({ by }) {
  const subject = "Mail de test de l'appli";
  const html = shell(subject, `<tr><td style="padding:24px;font:16px/1.5 Arial,sans-serif;color:#0E1511">
  ✅ L'envoi des mails fonctionne.<br><br>
  <span style="color:#6B7A71;font-size:14px">Envoyé depuis Administration par @${esc(by)}. Les récaps de match et les mots de passe oubliés partiront de cette adresse.</span>
</td></tr>`);
  return { subject, html, text: "L'envoi des mails de l'appli des Dragons fonctionne." };
}
