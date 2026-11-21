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

/* ---------------- Roster du week-end ---------------- */
const btn = (link, label, bg = "#2E8B57", fg = "#fff") => link ? `<tr><td align="center" style="padding:20px 24px 6px"><a href="${esc(link)}" style="display:inline-block;background:${bg};color:${fg};text-decoration:none;font:700 15px Arial,sans-serif;padding:14px 26px;border-radius:10px">${label}</a></td></tr>` : "";
const names = (list) => list.length ? list.map((n) => `<span style="display:inline-block;background:#EEF4F0;border-radius:14px;padding:4px 10px;margin:0 4px 6px 0;font:14px Arial,sans-serif;color:#0E1511">${esc(n)}</span>`).join("") : `<span style="color:#6B7A71;font:14px Arial,sans-serif">—</span>`;
const block = (title, inner) => `<tr><td style="padding:14px 24px 0"><div style="font:700 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#2E8B57;margin-bottom:8px">${esc(title)}</div>${inner}</td></tr>`;

export function renderRosterCoachMail({ wk, from, to, picks, avail, deadline, link, again }) {
  const subject = `${again ? "Mise à jour · " : ""}Roster ${from} validé · à toi pour l'${to} (week-end du ${wk})`;
  const html = shell(subject, `<tr><td style="padding:24px 24px 4px;font:16px/1.5 Arial,sans-serif;color:#0E1511">
  ${again ? "<b>Mise à jour :</b> l" : "L"}'<b>${esc(from)}</b> a validé son roster pour le week-end du <b>${esc(wk)}</b>.<br>
  C'est au tour de l'<b>${esc(to)}</b> : sélectionne tes joueurs avant le <b>${esc(deadline)} soir</b>.
</td></tr>
${block(`Retenus en ${from} (${picks.length}) · plus disponibles`, names(picks))}
${block(`Disponibles pour l'${to} (${avail.length})`, names(avail))}
${btn(link, `Faire le roster de l'${esc(to)}`)}
<tr><td style="padding:10px 24px 22px;font:12px Arial,sans-serif;color:#6B7A71">Tu reçois ce mail parce que tu fais partie du staff de l'${esc(to)}.</td></tr>`);
  const text = `${from} a validé son roster (week-end du ${wk}).\nRetenus : ${picks.join(", ")}\nÀ toi pour l'${to}, avant le ${deadline} soir. Disponibles : ${avail.join(", ")}\n${link}`;
  return { subject, html, text };
}

export function renderRosterDoneMail({ wk, summary, link }) {
  const subject = `Tous les rosters du week-end du ${wk} sont validés`;
  const html = shell(subject, `<tr><td style="padding:24px 24px 4px;font:16px/1.5 Arial,sans-serif;color:#0E1511">✅ Toutes les équipes ont validé leur roster pour le week-end du <b>${esc(wk)}</b>. Les joueurs retenus ont reçu leur convocation.</td></tr>
${summary.map((x) => block(`${x.team} (${x.n})`, names(x.names))).join("")}
${btn(link, "Voir les rosters")}<tr><td style="padding:10px 24px 22px"></td></tr>`);
  return { subject, html, text: summary.map((x) => `${x.team} (${x.n}) : ${x.names.join(", ")}`).join("\n") };
}

export function renderConvocationMail({ prenom, team, wk, matches, mates, coaches = [], link }) {
  const subject = `Tu es sélectionné avec l'${team} ce week-end (${wk})`;
  const rows = matches.map((m) => `<tr><td style="padding:8px 0;border-bottom:1px solid #E3EAE5;font:700 14px Arial,sans-serif;color:#0E1511;white-space:nowrap">${esc(m.when)}</td><td style="padding:8px 0 8px 12px;border-bottom:1px solid #E3EAE5;font:14px Arial,sans-serif;color:#0E1511">${esc(m.what)}</td></tr>`).join("");
  const html = shell(subject, `<tr><td style="padding:24px 24px 4px;font:16px/1.5 Arial,sans-serif;color:#0E1511">
  Salut ${esc(prenom)},<br><br>
  <span style="font-size:19px">🐉 <b>Tu es sélectionné pour jouer avec l'<span style="color:#2E8B57">${esc(team)}</span></b></span><br>
  ce week-end, le <b>${esc(wk)}</b>.
</td></tr>
${block("Les matchs", `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`)}
${coaches.length ? block(coaches.length > 1 ? "Tes coachs" : "Ton coach", names(coaches)) : ""}
${block(`Tes coéquipiers (${mates.length})`, names(mates))}
${btn(link, "Confirmer ma présence dans l'appli")}
<tr><td style="padding:10px 24px 22px;font:12px Arial,sans-serif;color:#6B7A71">Un empêchement ? Mets-toi « Absent » dans l'appli au plus vite pour que ${coaches.length > 1 ? "tes coachs puissent" : "ton coach puisse"} s'organiser.<br>Pour ne plus recevoir les convocations : Mon compte › Mails du club.</td></tr>`);
  const text = `Salut ${prenom},\nTu es sélectionné pour jouer avec l'${team} ce week-end (${wk}).\n${matches.map((m) => `${m.when} : ${m.what}`).join("\n")}\n${coaches.length ? "Coachs : " + coaches.join(", ") + "\n" : ""}Coéquipiers : ${mates.join(", ")}\n${link}`;
  return { subject, html, text };
}

export function renderRosterRemovedMail({ prenom, team, wk, link }) {
  const subject = `Changement : roster ${team} du week-end du ${wk}`;
  const html = shell(subject, `<tr><td style="padding:24px 24px 4px;font:16px/1.5 Arial,sans-serif;color:#0E1511">
  Salut ${esc(prenom)},<br><br>Le roster de l'<b>${esc(team)}</b> pour le week-end du <b>${esc(wk)}</b> a été modifié : <b>tu n'y es plus retenu</b>.<br>Une autre équipe pourra encore faire appel à toi : tu recevras un mail si c'est le cas.
</td></tr>${btn(link, "Ouvrir l'appli")}<tr><td style="padding:10px 24px 22px"></td></tr>`);
  return { subject, html, text: `Le roster de l'${team} (week-end du ${wk}) a été modifié : tu n'y es plus retenu.` };
}
