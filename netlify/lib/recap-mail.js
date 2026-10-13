/* Mail de récap après un match (envoi via Brevo quand il sera branché).
   renderRecapMail(rc, { player, site }) :
   - rc : récap stocké sous recap/<id> (voir recapOf dans public/match/index.html)
   - player : id du joueur pour la version « focus » ; absent = version globale (staff / tout le monde)
   - site : URL publique du site (pour le logo et le lien vers l'appli)
   Mise en page en tableaux + styles en ligne : c'est ce que les messageries affichent correctement. */

const GREEN = "#2E8B57";
const DARK = "#0E1511";
const MUTED = "#6B7A71";
const LINE = "#E3EAE5";
const TAG = { "1B": "Simple", "2B": "Double", "3B": "Triple", HR: "Home run", BB: "Walk", HBP: "Touché", K: "Retrait sur prises", KD: "Retrait sur prises", GO: "Retiré au sol", FO: "Retiré en flèche", E: "Sur erreur", FC: "Choix défensif", SAC: "Sacrifice", CI: "Interférence" };
const HIT = new Set(["1B", "2B", "3B", "HR"]);

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sum = (o) => Object.values(o || {}).reduce((a, b) => a + (Number(b) || 0), 0);
const avg = (h, ab) => (ab ? (h / ab).toFixed(3).replace(/^0/, "") : "—");

function dateFr(d) {
  try { return new Date(d + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); } catch (e) { return d; }
}

function lineScore(rc) {
  const n = Math.max(7, Number(rc.inns) || 7);
  const cols = Array.from({ length: n }, (_, i) => i + 1);
  const cell = (o, i) => (o && o[i] != null ? o[i] : i <= (rc.inns || 0) ? 0 : "");
  const th = `style="padding:6px 4px;font:600 11px Arial,sans-serif;color:${MUTED};text-align:center"`;
  const td = `style="padding:7px 4px;font:14px 'Courier New',monospace;color:${DARK};text-align:center;border-top:1px solid ${LINE}"`;
  const row = (name, o, bold) => `<tr><td style="padding:7px 8px 7px 0;font:${bold ? "700" : "400"} 14px Arial,sans-serif;color:${DARK};border-top:1px solid ${LINE};white-space:nowrap">${esc(name)}</td>${cols.map((i) => `<td ${td}>${cell(o, i)}</td>`).join("")}<td ${td.replace("color:" + DARK, "color:" + GREEN + ";font-weight:700")}>${sum(o)}</td></tr>`;
  const top = rc.home ? [["" + rc.opp, rc.them, false], ["Dragons", rc.us, true]] : [["Dragons", rc.us, true], ["" + rc.opp, rc.them, false]];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
<tr><td ${th} style="text-align:left"></td>${cols.map((i) => `<td ${th}>${i}</td>`).join("")}<td ${th}>R</td></tr>
${top.map((t) => row(...t)).join("")}</table>`;
}

function teamTable(rc, me) {
  const th = (t, l) => `<td style="padding:6px 4px;font:600 11px Arial,sans-serif;color:${MUTED};text-align:${l ? "left" : "center"}">${t}</td>`;
  const rows = (rc.rows || []).filter((r) => r.pa > 0);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
<tr>${th("Joueur", 1)}${th("H/AB")}${th("R")}${th("RBI")}${th("BB")}${th("K")}</tr>
${rows.map((r) => {
    const hl = r.id === me ? `background:#E8F5EE;` : "";
    const td = `style="${hl}padding:7px 4px;font:14px Arial,sans-serif;color:${DARK};text-align:center;border-top:1px solid ${LINE}"`;
    return `<tr><td style="${hl}padding:7px 4px;font:${r.id === me ? 700 : 400} 14px Arial,sans-serif;color:${DARK};border-top:1px solid ${LINE}">${esc(r.n)}${r.num ? ` <span style="color:${MUTED};font-size:12px">#${esc(r.num)}</span>` : ""}</td><td ${td}><b>${r.h}</b>/${r.ab}</td><td ${td}>${r.r}</td><td ${td}>${r.rbi}</td><td ${td}>${r.bb}</td><td ${td}>${r.k}</td></tr>`;
  }).join("")}</table>`;
}

/* Les « tops » du match, utilisés dans les deux versions */
function highlights(rc) {
  const rows = (rc.rows || []).filter((r) => r.pa > 0);
  const out = [];
  const best = (k) => { const m = Math.max(0, ...rows.map((r) => r[k] || 0)); return m ? [m, rows.filter((r) => r[k] === m).map((r) => r.n)] : null; };
  const h = best("h"); if (h) out.push(["Coups sûrs", `${h[1].join(", ")} · ${h[0]}`]);
  const rbi = best("rbi"); if (rbi) out.push(["Points produits", `${rbi[1].join(", ")} · ${rbi[0]}`]);
  const hr = rows.filter((r) => r.hr).map((r) => r.n + (r.hr > 1 ? ` ×${r.hr}` : "")); if (hr.length) out.push(["Home run", hr.join(", ")]);
  const sb = best("sb"); if (sb) out.push(["Bases volées", `${sb[1].join(", ")} · ${sb[0]}`]);
  (rc.pitchers || []).forEach((p) => out.push(["Au monticule", `${p.n} · ${p.pc} lancers`]));
  return out;
}

const POS = { P: "lanceur", C: "receveur", "1B": "1re base", "2B": "2e base", "3B": "3e base", SS: "arrêt-court", LF: "champ gauche", CF: "champ centre", RF: "champ droit" };

/* Carte des frappes du joueur : image PNG (les messageries n'affichent pas le SVG),
   générée par la tablette au moment de l'envoi, + la liste de ses balles en jeu. */
function playerSpray(r, img) {
  const spr = r.spr || [];
  if (!spr.length) return "";
  const list = spr.map(([, , res, , pos]) => `<tr><td style="padding:5px 0;border-top:1px solid ${LINE};width:1%;white-space:nowrap"><span style="display:inline-block;padding:3px 9px;border-radius:12px;font:700 12px Arial,sans-serif;${HIT.has(res) ? `background:${GREEN};color:#fff` : `background:#FBE3E0;color:#B03A2E`}">${esc(TAG[res] || res)}</span></td><td style="padding:5px 0 5px 10px;border-top:1px solid ${LINE};font:14px Arial,sans-serif;color:${DARK}">vers ${esc(POS[pos] || pos || "?")}</td></tr>`).join("");
  return `<tr><td style="padding:18px 24px 0">
  <div style="font:700 12px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin-bottom:8px">Où sont tombées tes balles</div>
  ${img ? `<img src="${esc(img)}" width="512" alt="Carte de tes frappes : ${spr.length} balle${spr.length > 1 ? "s" : ""} en jeu" style="display:block;width:100%;max-width:512px;height:auto;border-radius:12px;margin:0 auto 10px">` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${list}</table>
  <div style="font:12px Arial,sans-serif;color:${MUTED};margin-top:6px">Vert : hit · Rouge : pas de hit</div>
</td></tr>`;
}

function playerFocus(rc, r) {
  const extra = [["d", "double", "doubles"], ["t", "triple", "triples"], ["hr", "home run", "home runs"], ["rbi", "point produit", "points produits"], ["r", "point marqué", "points marqués"], ["bb", "walk", "walks"], ["sb", "base volée", "bases volées"]]
    .filter(([k]) => r[k]).map(([k, w, pl]) => `${r[k]} ${r[k] > 1 ? pl : w}`);
  const tags = (r.res || []).map((x) => `<span style="display:inline-block;margin:0 4px 6px 0;padding:5px 10px;border-radius:14px;font:700 12px Arial,sans-serif;${HIT.has(x) ? `background:${GREEN};color:#fff` : `background:#EEF2EF;color:${MUTED}`}">${esc(TAG[x] || x)}</span>`).join("");
  const pitch = (rc.pitchers || []).find((p) => p.id === r.id);
  return `<tr><td style="padding:22px 24px 6px">
  <div style="font:700 12px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:${GREEN}">Ton match</div>
  <div style="font:700 30px Arial,sans-serif;color:${DARK};margin-top:6px">${r.h} sur ${r.ab}</div>
  <div style="font:15px Arial,sans-serif;color:${MUTED};margin-top:2px">${extra.length ? esc(extra.join(" · ")) : "Moyenne du match " + avg(r.h, r.ab)}</div>
  ${tags ? `<div style="margin-top:12px">${tags}</div>` : ""}
  ${pitch ? `<div style="margin-top:6px;font:15px Arial,sans-serif;color:${DARK}">Au monticule : <b>${pitch.pc} lancers</b></div>` : ""}
</td></tr>`;
}

export function renderRecapMail(rc, { player = null, site = "", sprayImg = "", mvp = null } = {}) {
  const us = sum(rc.us), them = sum(rc.them);
  const res = us > them ? "Victoire" : us < them ? "Défaite" : "Match nul";
  const resColor = us > them ? GREEN : us < them ? "#C0392B" : "#B7791F";
  const me = player && (rc.rows || []).find((r) => r.id === player);
  const first = me ? me.n : "";
  const subject = me
    ? `${res} ${us}-${them} contre ${rc.opp} · ton récap (${me.h}/${me.ab})`
    : `${res} ${us}-${them} contre ${rc.opp} · récap du match`;
  const hl = highlights(rc);
  const appUrl = (site || "").replace(/\/$/, "") + "/";
  const logo = site ? `<img src="${esc(appUrl)}logos/dragons.png" width="44" height="44" alt="" style="display:block;border-radius:50%">` : "";

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F3F6F4">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F6F4"><tr><td align="center" style="padding:20px 10px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;overflow:hidden;border:1px solid ${LINE}">
<tr><td style="background:${DARK};padding:18px 24px">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>${logo ? `<td style="padding-right:12px">${logo}</td>` : ""}<td>
  <div style="font:700 16px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#fff">Dragons de Ronchin</div>
  <div style="font:13px Arial,sans-serif;color:#9AADA2">${rc.squadName ? esc(rc.squadName) + " · " : ""}${esc(dateFr(rc.date))} · ${rc.home ? "à domicile" : "à l’extérieur"}${rc.kind === "amical" ? " · amical" : ""}</div></td></tr></table>
</td></tr>
<tr><td style="padding:22px 24px 4px">
  ${me ? `<div style="font:16px Arial,sans-serif;color:${DARK};margin-bottom:12px">Salut ${esc(first)},</div>` : ""}
  <div style="font:700 13px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:${resColor}">${res}</div>
  <div style="font:700 26px Arial,sans-serif;color:${DARK};margin-top:4px">Dragons ${us} – ${them} ${esc(rc.opp)}</div>
</td></tr>
${mvp && mvp.n ? `<tr><td style="padding:16px 24px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7E0;border:1px solid #F0D58A;border-radius:12px"><tr><td style="padding:12px 16px;font:15px Arial,sans-serif;color:${DARK}">🏆 <b>MVP du coach : ${esc(mvp.n)}</b>${mvp.why ? `<div style="font:italic 14px Arial,sans-serif;color:${MUTED};margin-top:3px">« ${esc(mvp.why)} »</div>` : ""}</td></tr></table></td></tr>` : ""}
${me ? playerFocus(rc, me) + playerSpray(me, sprayImg) : ""}
<tr><td style="padding:18px 24px 0">${lineScore(rc)}</td></tr>
${hl.length ? `<tr><td style="padding:22px 24px 0">
  <div style="font:700 12px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin-bottom:6px">Les tops du match</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${hl.map(([k, v]) => `<tr><td style="padding:6px 0;font:14px Arial,sans-serif;color:${MUTED};border-top:1px solid ${LINE};width:42%">${esc(k)}</td><td style="padding:6px 0;font:700 14px Arial,sans-serif;color:${DARK};border-top:1px solid ${LINE}">${esc(v)}</td></tr>`).join("")}</table>
</td></tr>` : ""}
<tr><td style="padding:22px 24px 0">
  <div style="font:700 12px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin-bottom:6px">L’équipe à la batte</div>
  ${teamTable(rc, player)}
</td></tr>
<tr><td align="center" style="padding:26px 24px 8px">
  <a href="${esc(appUrl)}" style="display:inline-block;background:${GREEN};color:#fff;text-decoration:none;font:700 15px Arial,sans-serif;padding:14px 26px;border-radius:10px">Voir le récap complet dans l’appli</a>
  <div style="font:12px Arial,sans-serif;color:${MUTED};margin-top:8px">Déroulé manche par manche, lanceurs et stats détaillées · Historique${me ? "<br>🏅 Et vote pour le MVP du match parmi tes coéquipiers (3 jours)" : ""}</div>
</td></tr>
<tr><td style="padding:18px 24px 22px;font:12px Arial,sans-serif;color:${MUTED};border-top:1px solid ${LINE}">
  Tu reçois ce mail parce que tu es inscrit dans l’appli des Dragons. Pour ne plus recevoir les récaps : Mon compte › Mails.
</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    me ? `Salut ${first},` : "",
    `${res} : Dragons ${us} – ${them} ${rc.opp} (${dateFr(rc.date)})`,
    mvp && mvp.n ? `MVP du coach : ${mvp.n}${mvp.why ? " (" + mvp.why + ")" : ""}` : "",
    me ? `Ton match : ${me.h} sur ${me.ab}` : "",
    ...hl.map(([k, v]) => `${k} : ${v}`),
    `Récap complet : ${appUrl}`,
  ].filter(Boolean).join("\n");

  return { subject, html, text };
}
