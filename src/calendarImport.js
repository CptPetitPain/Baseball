/* Lecture d'un calendrier Excel (.xlsx) ou CSV et reconnaissance automatique des colonnes.
   Tout se passe dans le navigateur : le fichier n'est jamais envoyé tel quel au serveur. */

const MONTHS = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
const MONTHS_EN = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
export const norm = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9/:.\- ]+/g, " ").replace(/\s+/g, " ").trim();
const CLUB_RE = /ronchin|dragon/;

/* Noms de colonnes reconnus (en minuscules, sans accents) */
const COLS = {
  date: ["date", "date du match", "jour", "date match", "le"],
  time: ["heure", "horaire", "h", "debut", "heure du match", "heure debut", "time"],
  squad: ["equipe", "team", "categorie", "division", "niveau", "championnat", "equipe dragons", "notre equipe", "competition"],
  opponent: ["adversaire", "adversaires", "opposant", "contre", "vs", "adv", "club adverse", "equipe adverse"],
  location: ["lieu", "dom/ext", "d/e", "domicile/exterieur", "domicile / exterieur", "dom ext", "terrain", "a domicile", "reception", "home/away", "ville", "stade"],
  home: ["recevant", "recevants", "equipe recevante", "locaux", "home", "club recevant", "equipe a"],
  away: ["visiteur", "visiteurs", "equipe visiteuse", "away", "club visiteur", "equipe b"],
};
function colKind(h) {
  const n = norm(h);
  if (!n) return null;
  for (const [k, list] of Object.entries(COLS)) if (list.includes(n)) return k;
  // correspondances partielles
  if (/^date/.test(n)) return "date";
  if (/heure|horaire/.test(n)) return "time";
  if (/adversaire|opposant/.test(n)) return "opponent";
  if (/recev|locaux/.test(n)) return "home";
  if (/visit/.test(n)) return "away";
  if (/^equipe|categorie|division|championnat/.test(n)) return "squad";
  if (/domicile|exterieur|lieu|dom.?ext/.test(n)) return "location";
  return null;
}

/* ------------ lecture du fichier ------------ */
function splitCsvLine(line, sep) {
  const out = []; let cur = ""; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === sep) { out.push(cur); cur = ""; } else cur += c;
  }
  out.push(cur);
  return out;
}
export function parseCsv(text) {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const first = lines.slice(0, 5).join("\n");
  const sep = [";", "\t", ","].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  return lines.map((l) => splitCsvLine(l, sep));
}
export async function readCalendarFile(file) {
  const name = (file.name || "").toLowerCase();
  if (/\.(csv|txt)$/.test(name)) return parseCsv(await file.text());
  if (/\.xls$/.test(name)) throw new Error("Ancien format Excel (.xls) : dans Excel, fais « Enregistrer sous » → « Classeur Excel (.xlsx) » ou « CSV ».");
  if (!/\.xlsx$/.test(name)) throw new Error("Format non reconnu : envoie un fichier Excel (.xlsx) ou CSV.");
  const { readSheet } = await import("read-excel-file/browser");
  return await readSheet(file); // 1re feuille du classeur
}

/* ------------ dates et heures ------------ */
const pad = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? `${y}-${pad(m)}-${pad(d)}` : "";
};
const fullYear = (y) => (y < 100 ? 2000 + y : y);
export function parseDate(v, defYear) {
  if (v == null || v === "") return { date: "" };
  if (v instanceof Date && !isNaN(v)) {
    const t = v.getUTCHours() || v.getUTCMinutes() ? `${v.getUTCHours()}:${pad(v.getUTCMinutes())}` : "";
    return { date: iso(v.getUTCFullYear(), v.getUTCMonth() + 1, v.getUTCDate()), time: t };
  }
  if (typeof v === "number") { // numéro de série Excel
    if (v > 20000 && v < 80000) { const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v * 86400000)); return parseDate(d, defYear); }
    return { date: "" };
  }
  const s = norm(v);
  const time = parseTime((s.match(/(\d{1,2})\s*[h:]\s*(\d{2})?\b(?!\s*[/.-])/) || [])[0]);
  let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return { date: iso(+m[1], +m[2], +m[3]), time };
  m = s.match(/(\d{1,2})[/.\-](\d{1,2})(?:[/.\-](\d{2,4}))?/);
  if (m) return { date: iso(m[3] ? fullYear(+m[3]) : defYear, +m[2], +m[1]), time };
  m = s.match(/(\d{1,2})(?:er)?\s+([a-z]{3,})\.?\s*(\d{4})?/);
  if (m) {
    let mi = MONTHS.findIndex((x) => x === m[2] || x.startsWith(m[2]) || m[2].startsWith(x.slice(0, 4)));
    if (mi === -1) mi = MONTHS_EN.findIndex((x) => m[2].startsWith(x));
    if (mi !== -1) return { date: iso(m[3] ? +m[3] : defYear, mi + 1, +m[1]), time };
  }
  return { date: "" };
}
export function parseTime(v) {
  if (v == null || v === "") return "";
  if (v instanceof Date && !isNaN(v)) return `${v.getUTCHours()}:${pad(v.getUTCMinutes())}`;
  if (typeof v === "number") { if (v >= 0 && v < 1) { const mins = Math.round(v * 1440); return `${Math.floor(mins / 60)}:${pad(mins % 60)}`; } if (v >= 0 && v < 24) return `${Math.floor(v)}:00`; return ""; }
  const m = norm(v).match(/(\d{1,2})\s*(?:h|:|\.)\s*(\d{2})?/) || norm(v).match(/^(\d{1,2})$/);
  if (!m) return "";
  const h = +m[1], mi = m[2] ? +m[2] : 0;
  return h < 24 && mi < 60 ? `${h}:${pad(mi)}` : "";
}
const fmtTime = (t) => (t ? t.replace(/^(\d):/, "0$1:") : "");

/* ------------ domicile / extérieur, équipe ------------ */
export function parseLocation(v) {
  const s = norm(v);
  if (!s) return "";
  if (/^(d|dom|domicile|a domicile|home|h|recoit|reception|oui|ronchin)$/.test(s) || CLUB_RE.test(s) || /domicile/.test(s)) return "domicile";
  if (/^(e|ext|exterieur|a l exterieur|away|a|deplacement|non|visiteur)$/.test(s) || /exterieur|deplacement/.test(s)) return "exterieur";
  return "exterieur"; // une ville autre que Ronchin
}
export function matchSquad(v, squads) {
  const s = norm(v);
  if (!s) return "";
  const num = (s.match(/(?:^|\D)(\d)(?:\D|$)/) || [])[1];
  if (num) {
    const byName = squads.find((q) => norm(q.name).replace(/\D/g, "") === num);
    if (byName) return byName.id;
  }
  const exact = squads.find((q) => norm(q.name) === s || norm(q.level) === s);
  if (exact) return exact.id;
  const part = squads.find((q) => s.includes(norm(q.name)) || (q.level && s.includes(norm(q.level))));
  return part ? part.id : "";
}

/* ------------ analyse complète ------------ */
export function analyseCalendar(rows, { squads, defaultSquad, defaultYear }) {
  const clean = (rows || []).map((r) => (Array.isArray(r) ? r : [])).filter((r) => r.some((c) => c != null && String(c).trim() !== ""));
  // ligne d'en-tête : la première (parmi les 15 premières) avec une colonne date + une autre colonne reconnue
  let hi = -1, map = null;
  for (let i = 0; i < Math.min(15, clean.length); i++) {
    const kinds = clean[i].map(colKind);
    if (kinds.includes("date") && kinds.filter(Boolean).length >= 2) {
      map = {}; kinds.forEach((k, j) => { if (k && map[k] == null) map[k] = j; }); hi = i; break;
    }
  }
  if (!map) return { error: "Je ne trouve pas la ligne d'en-tête : il faut au moins une colonne « Date » et une colonne « Adversaire » (ou « Recevant » / « Visiteur »). Utilise le modèle si besoin.", rows: [], columns: {} };
  const out = [];
  clean.slice(hi + 1).forEach((r, k) => {
    const line = hi + k + 2;
    const cell = (key) => (map[key] == null ? "" : r[map[key]]);
    const pd = parseDate(cell("date"), defaultYear);
    const row = { line, date: pd.date, time: fmtTime(parseTime(cell("time")) || pd.time || ""), opponent: "", location: "", squad: "", warn: "", error: "" };
    if (map.home != null || map.away != null) {
      const h = String(cell("home") || "").trim(), a = String(cell("away") || "").trim();
      if (CLUB_RE.test(norm(h))) { row.location = "domicile"; row.opponent = a; }
      else if (CLUB_RE.test(norm(a))) { row.location = "exterieur"; row.opponent = h; }
      else if (h || a) { row.skip = true; row.warn = `ignorée : ni Ronchin ni Dragons (${h} - ${a})`; }
    }
    if (map.opponent != null) row.opponent = String(cell("opponent") || "").trim() || row.opponent;
    if (map.location != null && !row.location) row.location = parseLocation(cell("location"));
    if (!row.location) { row.location = "exterieur"; row.warn = row.warn || "domicile / extérieur non précisé : mis en extérieur"; }
    row.squad = map.squad != null ? matchSquad(cell("squad"), squads) : defaultSquad || "";
    if (map.squad != null && !row.squad) row.error = `équipe « ${String(cell("squad"))} » non reconnue`;
    if (!row.date) row.error = row.error || (String(cell("date") || "").trim() ? `date « ${String(cell("date"))} » non comprise` : "pas de date");
    if (/annul|report/.test(norm(r.join(" "))) && !row.error) row.warn = "mention annulé / reporté : à vérifier";
    out.push(row);
  });
  return { rows: out, columns: map, header: clean[hi] };
}

/* Modèle à remplir (CSV, s'ouvre dans Excel) */
export function templateCsv(squads) {
  const s1 = (squads[0] || {}).name || "Équipe 1", s2 = (squads[1] || squads[0] || {}).name || "Équipe 2";
  return "﻿" + [
    "Date;Heure;Équipe;Adversaire;Lieu",
    `11/04/2027;14:00;${s1};Kraken d'Amiens;Domicile`,
    `11/04/2027;16:30;${s1};Kraken d'Amiens;Domicile`,
    `18/04/2027;11:00;${s2};Celtics de Tournai;Extérieur`,
  ].join("\r\n");
}

/* =================================================================== */
/* Import de l'effectif : Nom, Prénom, Numéro, Postes, Équipes, Email   */
/* =================================================================== */
const POSTE_MAP = [
  [/^(p|lanceur|pitcher|lanceuse)$/, "Lanceur"], [/^(c|catcher|receveur|receveuse)$/, "Catcher"],
  [/^(1b|1|premiere base|1ere base|1re base|premiere)$/, "Première base"], [/^(2b|2|deuxieme base|2eme base|2e base|deuxieme)$/, "Deuxième base"],
  [/^(3b|3|troisieme base|3eme base|3e base|troisieme)$/, "Troisième base"], [/^(ss|arret court|arret-court|arretcourt|short stop|shortstop)$/, "Arrêt-court"],
  [/^(lf|champ gauche|gauche|voltigeur gauche)$/, "Champ gauche"], [/^(cf|champ centre|centre|voltigeur centre)$/, "Champ centre"],
  [/^(rf|champ droit|droit|voltigeur droit)$/, "Champ droit"], [/^(of|champ exterieur|exterieur|voltigeur|outfield)$/, "Champ extérieur"],
  [/^(ut|utility|polyvalent)$/, "Utility"], [/^(manager|coach)$/, "Manager"],
];
export function parsePoste(v) {
  const s = norm(v).replace(/[.]/g, "").trim();
  for (const [re, p] of POSTE_MAP) if (re.test(s)) return p;
  return "";
}
const PCOLS = {
  nom: ["nom", "nom de famille", "last name", "nom joueur"],
  prenom: ["prenom", "first name", "prenom joueur"],
  full: ["joueur", "nom prenom", "nom et prenom", "nom complet", "identite"],
  numero: ["numero", "n", "no", "num", "n maillot", "numero de maillot", "maillot", "dossard", "#"],
  email: ["email", "e-mail", "mail", "adresse mail", "adresse e-mail", "courriel"],
  postes: ["postes", "poste", "position", "positions"],
  teams: ["equipe", "equipes", "team", "teams", "type", "categorie"],
};
function pcolKind(h) {
  const n = norm(h).replace(/[°]/g, "").trim();
  if (!n) return null;
  for (const [k, list] of Object.entries(PCOLS)) if (list.includes(n)) return k;
  if (/^poste ?[123]$|^position ?[123]$/.test(n)) return "poste" + n.slice(-1);
  if (/^(equipe|e) ?\d$/.test(n)) return "team:" + n.slice(-1);
  if (/mail/.test(n)) return "email";
  if (/^prenom/.test(n)) return "prenom";
  if (/^nom/.test(n)) return "nom";
  if (/maillot|numero/.test(n)) return "numero";
  return null;
}
/* « 1/2 », « 1 et 2 », « Équipe 1 (H), Équipe 2 (R) », « 1H 2R », « 2 R » → { "Équipe 1": "reg", "Équipe 2": "renf" } */
export function parseTeams(v, squads) {
  const s = norm(v);
  const out = {};
  if (!s) return out;
  const re = /(?:equipe|e)?\s*(\d)\s*(\(?\s*(?:h|habituel|habituelle|reg|r|renf|renfort)\s*\)?)?/g;
  let m;
  while ((m = re.exec(s))) {
    const flag = norm(m[2] || "").replace(/[()]/g, "").trim();
    out[teamName(m[1], squads)] = /^(r|renf|renfort)$/.test(flag) ? "renf" : "reg";
  }
  if (!Object.keys(out).length) { // un nom d'équipe en toutes lettres
    const q = squads.find((x) => s.includes(norm(x.name)));
    if (q) out[q.name] = /renfort/.test(s) ? "renf" : "reg";
  }
  return out;
}
function teamName(num, squads) {
  const q = squads.find((x) => norm(x.name).replace(/\D/g, "") === String(num));
  return q ? q.name : `Équipe ${num}`;
}
function cellTeamValue(v) { // colonne « Équipe 1 » : H / Habituel / X / oui → habituel ; R / Renfort → renfort ; vide / non → rien
  const s = norm(v);
  if (!s || /^(non|no|n|0|-|—)$/.test(s)) return "";
  if (/^(r|renf|renfort|renforts)$/.test(s)) return "renf";
  return "reg";
}
export function analysePlayers(rows, { squads, roster }) {
  const clean = (rows || []).map((r) => (Array.isArray(r) ? r : [])).filter((r) => r.some((c) => c != null && String(c).trim() !== ""));
  let hi = -1, map = null;
  for (let i = 0; i < Math.min(15, clean.length); i++) {
    const kinds = clean[i].map(pcolKind);
    if ((kinds.includes("nom") && kinds.includes("prenom")) || kinds.includes("full")) { map = {}; kinds.forEach((k, j) => { if (k && map[k] == null) map[k] = j; }); hi = i; break; }
  }
  if (!map) return { error: "Je ne trouve pas la ligne d'en-tête : il faut des colonnes « Nom » et « Prénom » (ou une colonne « Joueur »). Utilise le modèle si besoin.", rows: [] };
  const key = (n, p) => norm(n + " " + p).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const exist = new Map((roster || []).map((p) => [key(p.nom, p.prenom), p]));
  const known = new Set((squads || []).map((q) => norm(q.name)));
  const out = [];
  const seen = new Set();
  clean.slice(hi + 1).forEach((r, k) => {
    const cell = (c) => (map[c] == null ? "" : r[map[c]]);
    let nom = String(cell("nom") || "").trim(), prenom = String(cell("prenom") || "").trim();
    if (!nom && !prenom && map.full != null) { // « DIDAT Loïc » ou « Loïc Didat »
      const parts = String(cell("full") || "").trim().split(/\s+/);
      const upIdx = parts.findIndex((x) => x.length > 1 && x === x.toUpperCase() && /[A-Z]/.test(x));
      if (upIdx >= 0) { nom = parts.filter((x, j) => j === upIdx || (x === x.toUpperCase() && /[A-Z]/.test(x))).join(" "); prenom = parts.filter((x) => !(x === x.toUpperCase() && /[A-Z]/.test(x))).join(" "); }
      else { prenom = parts[0] || ""; nom = parts.slice(1).join(" "); }
    }
    if (!nom && !prenom) return;
    const row = { line: hi + k + 2, nom: nom.toUpperCase(), prenom, numero: String(cell("numero") == null ? "" : cell("numero")).replace(/\.0+$/, "").replace(/[^0-9]/g, "").slice(0, 3), email: String(cell("email") || "").trim().toLowerCase(), positions: [], teams: {}, warn: "", error: "" };
    const ps = map.postes != null ? String(cell("postes") || "").split(/[,;/+]|\s-\s|\set\s/) : ["poste1", "poste2", "poste3"].map((c) => cell(c));
    ps.forEach((x) => { const p = parsePoste(x); if (p && !row.positions.includes(p)) row.positions.push(p); else if (String(x || "").trim() && !p) row.warn = `poste « ${String(x).trim()} » non reconnu`; });
    row.positions = row.positions.slice(0, 3);
    if (map.teams != null) row.teams = parseTeams(cell("teams"), squads || []);
    Object.keys(map).filter((c) => c.startsWith("team:")).forEach((c) => { const v = cellTeamValue(cell(c)); if (v) row.teams[teamName(c.slice(5), squads || [])] = v; });
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.email)) { row.error = `adresse mail « ${row.email} » invalide`; }
    const kk = key(row.nom, row.prenom);
    if (seen.has(kk)) row.error = row.error || "joueur en double dans le fichier";
    seen.add(kk);
    row.exists = exist.has(kk);
    row.newTeams = Object.keys(row.teams).filter((t) => !known.has(norm(t)));
    out.push(row);
  });
  const hasTeams = map.teams != null || Object.keys(map).some((c) => c.startsWith("team:"));
  return { rows: out, hasTeams, hasEmail: map.email != null };
}
export function templatePlayersCsv(squads) {
  const n = (i) => ((squads || [])[i] || {}).name || `Équipe ${i + 1}`;
  return "﻿" + [
    `Nom;Prénom;Numéro;Poste 1;Poste 2;Poste 3;${n(0)};${n(1)};${n(2)};Email`,
    "DIDAT;Loïc;16;SS;3B;2B;H;R;;",
    "DOISE;Hugo;27;P;2B;SS;R;H;;hugo@exemple.fr",
    "GRIBI;Elwane;5;OF;;;;H;R;",
  ].join("\r\n");
}
