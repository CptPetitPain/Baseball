import { getStore } from "@netlify/blobs";
import { loadTeams, TEAMS_KEY, TEAM_LOGO_PREFIX, TEAMS_DELETED_KEY, DEFAULT_TEAMS } from "../lib/teams-data.js";
import crypto from "node:crypto";
import { renderRecapMail } from "../lib/recap-mail.js";
import { mailConfig, maskEmail, makeTransport, sendMail, renderResetMail, renderTestMail } from "../lib/mailer.js";

/* ------------------------------------------------------------------ */
/* Secrets — read from environment variables, NEVER sent to the client */
/* ------------------------------------------------------------------ */

const STAFF_CODE = process.env.STAFF_CODE || "";
const OWNER_CODE = process.env.OWNER_CODE || "";

const APP_KEY = "dragons-presence-app-v1";
const SESSIONS_KEY = "dragons-sessions-v1";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const STAFF_ROLES = ["coach", "owner"];

function isStaffRole(role) {
  return STAFF_ROLES.includes(role);
}
/* Scoreuse : lecture des feuilles de match (noms complets), compos publiées,
   saisie du line-up adverse. Aucun droit d'écriture sur le reste. */
const SCORER_ROLE = "scorer";
function canReadSheets(role) {
  return isStaffRole(role) || role === SCORER_ROLE;
}

/* ------------------------------------------------------------------ */
/* V3 · Équipes du club (« squads », à ne pas confondre avec les équipes */
/* adverses / logos ni avec le classement)                              */
/* ------------------------------------------------------------------ */
const SQUAD_COLORS = ["#3FAE74", "#F2B632", "#6FA8FF", "#C77DFF", "#F2665A"];
const DEFAULT_SQUAD = { id: "e1", name: "Équipe 1", level: "Régional", color: "#3FAE74", target: 12 };
const STAFF_PERM_KEYS = ["compo", "sheet", "scout", "roster", "presence"];
const DEFAULT_STAFF_PERMS = { compo: true, sheet: true, scout: true, roster: false, presence: true };
const SQUAD_ROLES = ["coach", "staff", "scorer"];
const MEMBER_VALUES = ["reg", "renf"];

function normSquads(list) {
  const out = [];
  (Array.isArray(list) ? list : []).forEach((q, i) => {
    if (!q || typeof q !== "object" || !/^[a-z0-9-]{1,24}$/.test(q.id || "") || out.some((x) => x.id === q.id)) return;
    out.push({
      id: q.id,
      name: String(q.name || "Équipe").slice(0, 40),
      level: String(q.level || "").slice(0, 40),
      color: /^#[0-9a-f]{6}$/i.test(q.color || "") ? q.color : SQUAD_COLORS[i % SQUAD_COLORS.length],
      target: Math.max(9, Math.min(40, parseInt(q.target, 10) || 12)),
    });
  });
  return out.length ? out : [{ ...DEFAULT_SQUAD }];
}

/* Rôle global d'un compte, déduit de ses rôles par équipe (le propriétaire reste propriétaire). */
function globalRole(acc) {
  if (acc.role === "owner") return "owner";
  const vals = Object.values(acc.squads || {});
  if (vals.includes("coach") || vals.includes("staff")) return "coach";
  if (vals.includes("scorer")) return SCORER_ROLE;
  return "player";
}

/* Droits d'une session, équipe par équipe. Calculés côté serveur uniquement. */
function accessOf(state, session) {
  if (!session) return null;
  const acc = state.accounts[session.username] || {};
  const owner = session.role === "owner";
  const trainer = !owner && !!acc.trainer;
  const squads = {};
  for (const sq of state.squads) {
    if (owner) { squads[sq.id] = { role: "owner", read: true, manage: true, compo: true, sheet: true, scout: true, roster: true, presence: true }; continue; }
    const r = (acc.squads || {})[sq.id];
    if (r === "coach") squads[sq.id] = { role: "coach", read: true, manage: true, compo: true, sheet: true, scout: true, roster: true, presence: true };
    else if (r === "staff") {
      const p = { ...DEFAULT_STAFF_PERMS, ...(((acc.perms || {})[sq.id]) || {}) };
      squads[sq.id] = { role: "staff", read: true, manage: !!p.compo, ...Object.fromEntries(STAFF_PERM_KEYS.map((k) => [k, !!p[k]])) };
    } else if (r === "scorer") squads[sq.id] = { role: "scorer", read: true, scorer: true };
    else if (trainer) squads[sq.id] = { role: "trainer", read: true };
  }
  const member = session.playerId ? { ...((state.members || {})[session.playerId] || {}) } : {};
  return { owner, trainer, squads, member, playerId: session.playerId || null, space: session.space || "" };
}
function canSq(access, sq, what) {
  return !!(access && access.squads[sq] && access.squads[sq][what]);
}
function canAny(access, what) {
  return !!access && Object.values(access.squads).some((x) => x[what]);
}
/* Gérer un joueur (fiche, compte, suppression) : propriétaire, ou droit sur une des équipes dont il fait partie.
   Joueur sans équipe : n'importe quel staff qui a ce droit dans au moins une équipe. */
function canPlayer(state, access, playerId, what) {
  if (!access) return false;
  if (access.owner) return true;
  const sqs = Object.keys((state.members || {})[playerId] || {});
  if (!sqs.length) return canAny(access, what);
  return sqs.some((sq) => canSq(access, sq, what));
}
function playerOfAccount(state, username) {
  return (state.accounts[username] || {}).playerId || null;
}
function squadOfMatch(state, matchId) {
  const m = state.matches.find((x) => x.id === matchId);
  return m ? m.squad : null;
}

/* ------------------------------------------------------------------ */
/* Roster seed data                                                    */
/* ------------------------------------------------------------------ */

const POSTES = [
  "Lanceur", "Catcher", "Première base", "Deuxième base", "Troisième base",
  "Arrêt-court", "Champ gauche", "Champ centre", "Champ droit",
  "Champ extérieur", "Utility", "Manager",
];

const FIELD_POSITIONS = [
  "Lanceur", "Catcher", "Première base", "Deuxième base", "Troisième base",
  "Arrêt-court", "Champ gauche", "Champ centre", "Champ droit",
];

const RAW_ROSTER = [
  ["BAILLY", "Apolline", "15", "Champ extérieur", "", ""],
  ["BOUHSINA", "Sami", "", "Utility", "Catcher", ""],
  ["BREARD", "Maxime", "50", "Utility", "Deuxième base", ""],
  ["CAPPELLE", "Geoffrey", "61", "Utility", "", ""],
  ["DEQUECKER", "Ulrick", "63", "Champ extérieur", "Première base", ""],
  ["DERYCKER", "Wilfrid", "87", "Arrêt-court", "Lanceur", "Première base"],
  ["DIDAT", "Loïc", "16", "Arrêt-court", "Troisième base", "Deuxième base"],
  ["DOISE", "Hugo", "27", "Lanceur", "Deuxième base", "Arrêt-court"],
  ["DUFOSSE", "Martin", "59", "Catcher", "Troisième base", ""],
  ["DUQUENNE", "Baptiste", "13", "Champ extérieur", "", ""],
  ["FARSY", "Julien", "24", "Troisième base", "Champ centre", "Catcher"],
  ["GRIBI", "Elwane", "5", "Champ extérieur", "", ""],
  ["HERENT", "Francois", "84", "Utility", "Manager", "Première base"],
  ["HERENT", "Juliette", "42", "Utility", "", ""],
  ["JACOBS", "Julien", "12", "Champ extérieur", "", ""],
  ["JACQUART", "Emilio", "13", "Première base", "Champ extérieur", "Lanceur"],
  ["JAFFRE", "Nicolas", "", "", "", ""],
  ["KARR", "Salomé", "", "", "", ""],
  ["MISLANGHE", "Sylvain", "80", "Première base", "Champ droit", ""],
  ["NEUFVILLE", "Heloïse", "", "", "", ""],
  ["PATINO MURO", "Lipcius", "", "", "", ""],
  ["PRUVOST", "Nolan", "23", "Catcher", "Champ centre", "Arrêt-court"],
  ["SAUGET", "Eliot", "53", "Lanceur", "Première base", ""],
  ["SAVARY", "Clement", "31", "Catcher", "Troisième base", ""],
  ["TERRIEN", "Philemon", "72", "Champ extérieur", "", ""],
  ["TIBERGHIEN", "Louise", "", "", "", ""],
  ["TREPPOZ", "Simon", "20", "Champ centre", "Deuxième base", "Champ extérieur"],
  ["VANDENBERGHE", "Thibaut", "77", "Lanceur", "Champ gauche", "Catcher"],
  ["VIERIRA", "Jules", "", "", "", ""],
  ["WOESTYN", "François", "48", "Lanceur", "Troisième base", "Arrêt-court"],
  ["", "Paullou", "", "", "", ""],
  ["POUPART", "Damien", "", "", "", ""],
];

function slugify(nom, prenom) {
  return `${nom}-${prenom}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const INITIAL_ROSTER = RAW_ROSTER.map(([nom, prenom, numero, p1, p2, p3]) => ({
  id: slugify(nom || "joueur", prenom),
  nom,
  prenom,
  numero,
  pos1: p1,
  pos2: p2,
  pos3: p3,
}));

function emptyInnings() {
  return { dragons: Array(7).fill(null), adversaire: Array(7).fill(null) };
}

const CURRENT_SEASON = String(new Date().getFullYear());

const MATCHES_SEED = [
  { id: "m1", label: "Match 1", date: "12 avril", opponent: "", location: "exterieur", season: CURRENT_SEASON, innings: emptyInnings() },
  { id: "m2", label: "Match 2", date: "19 avril", opponent: "", location: "exterieur", season: CURRENT_SEASON, innings: emptyInnings() },
  { id: "m3", label: "Match 3", date: "26 avril", opponent: "", location: "exterieur", season: CURRENT_SEASON, innings: emptyInnings() },
  { id: "m4", label: "Match 4", date: "3 mai", opponent: "", location: "exterieur", season: CURRENT_SEASON, innings: emptyInnings() },
  { id: "m5", label: "Match 5", date: "10 mai", opponent: "", location: "exterieur", season: CURRENT_SEASON, innings: emptyInnings() },
  { id: "m6", label: "Match 6", date: "17 mai", opponent: "", location: "exterieur", season: CURRENT_SEASON, innings: emptyInnings() },
  { id: "m7", label: "Match 7", date: "31 mai", opponent: "", location: "exterieur", season: CURRENT_SEASON, innings: emptyInnings() },
  { id: "m8", label: "Match 8", date: "7 juin", opponent: "", location: "exterieur", season: CURRENT_SEASON, innings: emptyInnings() },
  { id: "m9", label: "Match 9", date: "14 juin", opponent: "", location: "exterieur", season: CURRENT_SEASON, innings: emptyInnings() },
];

function defaultState() {
  const presence = {};
  const positions = {};
  INITIAL_ROSTER.forEach((p) => {
    presence[p.id] = {};
    positions[p.id] = { pos1: p.pos1, pos2: p.pos2, pos3: p.pos3 };
  });
  return {
    roster: INITIAL_ROSTER,
    accounts: {},
    presence,
    positions,
    lineups: {},
    matches: MATCHES_SEED,
    standings: [],
    auditLog: [],
    seasons: [CURRENT_SEASON],
    currentSeason: CURRENT_SEASON,
  };
}

const SEASON_RE = /^[0-9]{4}([-/][0-9]{2,4})?$/;

function normalizeState(s, blank) {
  const base = blank ? blankState() : defaultState();
  const squads = normSquads(s.squads);
  const sqIds = squads.map((q) => q.id);
  const firstSq = sqIds[0];
  const fixSq = (v) => (sqIds.includes(v) ? v : firstSq);
  const matches = (s.matches && (s.matches.length || blank) ? s.matches : base.matches).map((m) => ({
    ...m,
    innings: m.innings || emptyInnings(),
    location: m.location || "exterieur",
    season: m.season || CURRENT_SEASON,
    cancelled: Boolean(m.cancelled),
    squad: fixSq(m.squad),
  }));
  const roster = s.roster || base.roster;
  // V3 : avant les équipes multiples, tout l'effectif jouait dans l'équipe 1 → habituels de l'équipe 1.
  let members = s.members;
  if (!members || typeof members !== "object") {
    members = {};
    if (!s.squads) roster.forEach((p) => { members[p.id] = { [firstSq]: "reg" }; });
  }
  const cleanMembers = {};
  Object.entries(members).forEach(([pid, rec]) => {
    const r = {};
    Object.entries(rec || {}).forEach(([sq, v]) => { if (sqIds.includes(sq) && MEMBER_VALUES.includes(v)) r[sq] = v; });
    if (Object.keys(r).length) cleanMembers[pid] = r;
  });
  const accounts = {};
  Object.entries(s.accounts || {}).forEach(([u, acc]) => {
    let sq = acc.squads;
    if (!sq || typeof sq !== "object") {
      // V3 : les anciens comptes staff / scoreuse deviennent coach / scoreuse de l'équipe 1
      sq = acc.role === "coach" ? { [firstSq]: "coach" } : acc.role === SCORER_ROLE ? { [firstSq]: "scorer" } : {};
    }
    const clean = {};
    Object.entries(sq).forEach(([k, v]) => { if (sqIds.includes(k) && SQUAD_ROLES.includes(v)) clean[k] = v; });
    const next = { ...acc, squads: clean };
    if (acc.role !== "owner") next.role = globalRole(next);
    accounts[u] = next;
  });
  return {
    roster,
    accounts,
    presence: s.presence || {},
    positions: s.positions || {},
    lineups: s.lineups || {},
    matches,
    standings: (s.standings || []).map((t) => ({ ...t, season: t.season || CURRENT_SEASON, squad: fixSq(t.squad) })),
    auditLog: s.auditLog || [],
    squads,
    members: cleanMembers,
    callups: s.callups && typeof s.callups === "object" ? s.callups : {},
    ...seasonsOf(s, matches),
  };
}

/* Espace test vierge : aucun joueur, aucun match. */
function blankState() {
  return {
    roster: [], accounts: {}, presence: {}, positions: {}, lineups: {}, matches: [], standings: [], auditLog: [],
    seasons: [CURRENT_SEASON], currentSeason: CURRENT_SEASON, squads: [{ ...DEFAULT_SQUAD }], members: {}, callups: {},
  };
}

function seasonsOf(s, matches) {
  const set = new Set([...(Array.isArray(s.seasons) ? s.seasons : []), CURRENT_SEASON]);
  matches.forEach((m) => m.season && set.add(String(m.season)));
  (s.standings || []).forEach((t) => t.season && set.add(String(t.season)));
  const seasons = Array.from(set).filter(Boolean).sort((a, b) => b.localeCompare(a));
  const currentSeason = s.currentSeason && seasons.includes(s.currentSeason) ? s.currentSeason : CURRENT_SEASON;
  return { seasons, currentSeason };
}

function getLineup(state, matchId) {
  const l = state.lineups[matchId] || { defense: {}, batting: [] };
  const batting = Array.from({ length: 9 }, (_, i) => (l.batting || [])[i] || "");
  return { ...l, defense: l.defense || {}, batting };
}

/* Date d'un match ("12 avril", "12/04", "2027-04-12"). L'année vient de la saison. */
const FR_MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
function matchDate(m) {
  const str = String(m.date || "").toLowerCase().trim();
  if (!str) return null;
  const year = parseInt(String(m.season || CURRENT_SEASON).slice(0, 4), 10) || new Date().getFullYear();
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]));
  const num = str.match(/(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?/);
  if (num) {
    let y = num[3] ? +num[3] : year;
    if (y < 100) y += 2000;
    return new Date(Date.UTC(y, +num[2] - 1, +num[1]));
  }
  const fr = str.match(/(\d{1,2})\s*(?:er)?\s+([a-zéèêûôîà]+)/);
  if (!fr) return null;
  const mi = FR_MONTHS.findIndex((x) => x === fr[2] || x.startsWith(fr[2]) || fr[2].startsWith(x.slice(0, 4)));
  if (mi === -1) return null;
  return new Date(Date.UTC(year, mi, +fr[1]));
}

/* Les joueurs voient la composition à partir de 2 jours avant le match. */
const LINEUP_LEAD_MS = 2 * 24 * 60 * 60 * 1000;
const LINEUP_IMG_PREFIX = "lineupimg/";
function lineupVisibleToPlayers(m) {
  const d = matchDate(m);
  return Boolean(d) && Date.now() >= d.getTime() - LINEUP_LEAD_MS;
}

/* ------------------------------------------------------------------ */
/* Storage helpers                                                     */
/* ------------------------------------------------------------------ */

function getBlobStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: "dragons-app", siteID, token });
  }
  return getStore("dragons-app");
}

async function loadAppState(store) {
  const raw = await store.get(APP_KEY);
  if (raw) return normalizeState(JSON.parse(raw), !!store.isTest);
  const initial = normalizeState(store.isTest ? blankState() : defaultState(), !!store.isTest);
  await store.set(APP_KEY, JSON.stringify(initial));
  return initial;
}

/* ------------------------------------------------------------------ */
/* Espace test : un club à part, rangé sous le préfixe « test/ » du même */
/* stockage. Rien de ce qui s'y passe ne touche les vraies données.      */
/* ------------------------------------------------------------------ */
const TEST_PREFIX = "test/";
const TEST_META_KEY = "dragons-test-meta-v1";
function scopedStore(store, prefix) {
  return {
    isTest: true,
    get: (k) => store.get(prefix + k),
    set: (k, v) => store.set(prefix + k, v),
    delete: (k) => store.delete(prefix + k),
    list: async (opts = {}) => {
      const r = await store.list({ ...opts, prefix: prefix + (opts.prefix || "") });
      return { ...r, blobs: (r.blobs || []).map((b) => ({ ...b, key: b.key.slice(prefix.length) })) };
    },
  };
}

/* Contenu « Exemple » de l'espace test : un club fictif (noms inventés). */
const EXAMPLE_PLAYERS = [
  ["MARTIN", "Alex", "7"], ["BERNARD", "Lucas", "11"], ["DUBOIS", "Nina", "4"], ["THOMAS", "Hugo", "22"], ["ROBERT", "Léo", "9"],
  ["RICHARD", "Emma", "3"], ["PETIT", "Nathan", "18"], ["DURAND", "Inès", "25"], ["LEROY", "Tom", "14"], ["MOREAU", "Jade", "6"],
  ["SIMON", "Enzo", "30"], ["LAURENT", "Lina", "2"], ["LEFEBVRE", "Noah", "21"], ["MICHEL", "Chloé", "8"], ["GARCIA", "Adam", "19"],
  ["DAVID", "Sarah", "5"], ["BERTRAND", "Louis", "27"], ["ROUX", "Manon", "12"], ["VINCENT", "Jules", "33"], ["FOURNIER", "Zoé", "16"],
  ["MOREL", "Paul", "24"], ["GIRARD", "Lola", "10"], ["ANDRE", "Gabin", "15"], ["MERCIER", "Mila", "28"],
];
function exampleState() {
  const st = blankState();
  st.squads = [
    { id: "e1", name: "Équipe 1", level: "Régional", color: "#3FAE74", target: 12 },
    { id: "e2", name: "Équipe 2", level: "Régional", color: "#F2B632", target: 12 },
  ];
  const POS = ["Lanceur", "Catcher", "Première base", "Deuxième base", "Troisième base", "Arrêt-court", "Champ gauche", "Champ centre", "Champ droit"];
  st.roster = EXAMPLE_PLAYERS.map(([nom, prenom, numero], i) => ({ id: slugify(nom, prenom), nom, prenom, numero, pos1: POS[i % 9], pos2: POS[(i + 4) % 9], pos3: "" }));
  st.roster.forEach((p, i) => {
    st.positions[p.id] = { pos1: p.pos1, pos2: p.pos2, pos3: "" };
    st.members[p.id] = i < 13 ? { e1: "reg", ...(i % 4 === 0 ? { e2: "renf" } : {}) } : i < 22 ? { e2: "reg", ...(i % 3 === 0 ? { e1: "renf" } : {}) } : {};
  });
  const day = (d) => new Date(Date.now() + d * 864e5).toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "Europe/Paris" });
  const opp = ["Kraken d'Amiens", "Celtics de Tournai", "Vipères de Valenciennes", "Apaches de Péronne", "Miners du Bassin Minier", "Imperials de Compiègne"];
  const mk = (id, sq, n, d, o, loc, inn) => ({ id, label: `Match ${n}`, date: day(d), time: sq === "e1" ? "11h" : "14h", opponent: opp[o], location: loc, season: CURRENT_SEASON, squad: sq, cancelled: false, innings: inn || emptyInnings() });
  const played = (a, b) => ({ dragons: [...a, ...Array(7 - a.length).fill(null)], adversaire: [...b, ...Array(7 - b.length).fill(null)] });
  st.matches = [
    mk("ex1", "e1", 1, -14, 0, "exterieur", played([1, 0, 2, 0, 3, 0, 1], [0, 2, 0, 1, 0, 0, 1])),
    mk("ex2", "e1", 2, -7, 2, "domicile", played([0, 1, 0, 0, 2, 1, 0], [2, 0, 1, 0, 0, 3, 0])),
    mk("ex3", "e1", 3, 4, 3, "domicile"),
    mk("ex4", "e2", 1, -13, 1, "domicile", played([3, 2, 0, 4, 3], [0, 1, 0, 1, 0])),
    mk("ex5", "e2", 2, 5, 4, "exterieur"),
    mk("ex6", "e2", 3, 12, 5, "domicile"),
  ];
  st.roster.slice(0, 22).forEach((p, i) => {
    st.presence[p.id] = {};
    if (i < 13) st.presence[p.id].ex3 = i < 10 ? "present" : i === 10 ? "absent" : "";
    if (i >= 13) st.presence[p.id].ex5 = i < 20 ? "present" : "";
  });
  st.standings = [
    { id: "st1", team: "Dragons de Ronchin", w: 1, l: 1, t: 0, season: CURRENT_SEASON, squad: "e1" },
    { id: "st2", team: "Kraken d'Amiens", w: 2, l: 0, t: 0, season: CURRENT_SEASON, squad: "e1" },
    { id: "st3", team: "Dragons de Ronchin", w: 1, l: 0, t: 0, season: CURRENT_SEASON, squad: "e2" },
  ];
  return st;
}

/* Sauvegarde automatique : une copie par jour (à la première modification
   de la journée), les 30 derniers jours sont conservés. */
const BACKUP_PREFIX = "backup/";
const BACKUP_INDEX = "dragons-backup-index-v1";
async function saveAppState(store, state) {
  await store.set(APP_KEY, JSON.stringify(state));
  try {
    const day = new Date().toISOString().slice(0, 10);
    if ((await store.get(BACKUP_INDEX)) !== day) {
      await store.set(BACKUP_PREFIX + day, JSON.stringify(state));
      await store.set(BACKUP_INDEX, day);
      const { blobs } = await store.list({ prefix: BACKUP_PREFIX });
      const days = blobs.map((b) => b.key).filter((k) => /^backup\/\d{4}-\d{2}-\d{2}$/.test(k)).sort();
      for (const k of days.slice(0, Math.max(0, days.length - 30))) await store.delete(k);
    }
  } catch (e) { /* la sauvegarde ne doit jamais bloquer l'appli */ }
}

async function handleBackup(store, state, session, action, body) {
  if (session.role !== "owner") return fail(403, "Réservé au compte propriétaire.");
  if (action === "listBackups") {
    const { blobs } = await store.list({ prefix: BACKUP_PREFIX });
    return ok({ backups: blobs.map((b) => b.key.slice(BACKUP_PREFIX.length)).sort().reverse() });
  }
  if (action === "getBackup") {
    let data = state;
    if (body.day) {
      if (!/^[0-9a-z-]{10,40}$/.test(body.day)) return fail(400, "Sauvegarde introuvable.");
      const raw = await store.get(BACKUP_PREFIX + body.day);
      if (!raw) return fail(404, "Sauvegarde introuvable.");
      data = JSON.parse(raw);
    }
    const sheets = [], extra = {};
    if (!body.day) {
      const { blobs } = await store.list({ prefix: "scoresheet/" });
      for (const b of blobs) { const r = await store.get(b.key); if (r) sheets.push(JSON.parse(r)); }
      // line-ups adverses et fiches scouting
      for (const pre of ["opp/", "scout/"]) {
        const { blobs: bl } = await store.list({ prefix: pre });
        for (const b of bl) { const r = await store.get(b.key); if (r) extra[b.key] = JSON.parse(r); }
      }
    }
    return ok({ backup: { kind: "dragons-backup", version: 2, exportedAt: new Date().toISOString(), state: data, scoresheets: sheets, extra } });
  }
  if (action === "restoreBackup") {
    const b = body.backup;
    const st = b && b.kind === "dragons-backup" ? b.state : null;
    if (!st || !Array.isArray(st.roster) || !Array.isArray(st.matches) || typeof st.accounts !== "object") {
      return fail(400, "Fichier de sauvegarde non reconnu.");
    }
    if (!Object.values(st.accounts).some((a) => a.role === "owner")) {
      return fail(400, "Cette sauvegarde ne contient aucun compte propriétaire : restauration refusée.");
    }
    await store.set(BACKUP_PREFIX + "avant-restauration-" + Date.now(), JSON.stringify(state));
    let next = normalizeState(st);
    next = logAction(next, session.username, "a restauré une sauvegarde");
    await store.set(APP_KEY, JSON.stringify(next));
    let n = 0;
    for (const sh of Array.isArray(b.scoresheets) ? b.scoresheets : []) {
      const c = cleanSheet(sh);
      if (c) { await store.set("scoresheet/" + c.id, JSON.stringify(c)); n++; }
    }
    if (b.extra && typeof b.extra === "object") {
      for (const [k, v] of Object.entries(b.extra)) {
        if (/^(opp\/[a-z0-9]{4,24}|scout\/[a-z0-9-]{1,80})$/.test(k) && v && typeof v === "object") {
          const raw = JSON.stringify(v);
          if (raw.length <= 200 * 1024) await store.set(k, raw);
        }
      }
    }
    return ok({ restored: true, scoresheets: n, state: sanitize(next, session) });
  }
  return fail(400, "Action inconnue.");
}

async function loadSessions(store) {
  const raw = await store.get(SESSIONS_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveSessions(store, sessions) {
  await store.set(SESSIONS_KEY, JSON.stringify(sessions));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/* Mots de passe : scrypt + sel. Les anciens hash SHA-256 sont encore acceptés
   et remplacés automatiquement à la prochaine connexion réussie. */
const MIN_PASSWORD = 6;
function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 32);
  return `scrypt$${salt.toString("hex")}$${h.toString("hex")}`;
}
function verifyPassword(pw, stored) {
  if (!stored) return false;
  if (stored.startsWith("scrypt$")) {
    const [, salt, h] = stored.split("$");
    const expected = Buffer.from(h, "hex");
    const got = crypto.scryptSync(pw, Buffer.from(salt, "hex"), expected.length);
    return got.length === expected.length && crypto.timingSafeEqual(got, expected);
  }
  const a = Buffer.from(sha256(pw)), b = Buffer.from(stored);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* Anti force brute : 5 échecs par identifiant (ou 20 par adresse IP) en
   15 min bloquent 15 min. Même chose pour les codes staff/propriétaire. */
const GUARD_KEY = "dragons-login-guard-v1";
const GUARD_WINDOW_MS = 15 * 60 * 1000;
async function guardLockedFor(store, keys) {
  const g = JSON.parse((await store.get(GUARD_KEY)) || "{}");
  const now = Date.now();
  for (const k of keys) {
    const e = g[k];
    if (e && e.until && e.until > now) return Math.ceil((e.until - now) / 60000);
  }
  return 0;
}
async function guardFail(store, keys) {
  const g = JSON.parse((await store.get(GUARD_KEY)) || "{}");
  const now = Date.now();
  Object.keys(g).forEach((k) => { if (g[k].reset < now && !(g[k].until > now)) delete g[k]; });
  keys.forEach((k) => {
    const e = g[k] && g[k].reset > now ? g[k] : { n: 0, reset: now + GUARD_WINDOW_MS };
    e.n += 1;
    if (e.n >= (k.startsWith("ip:") ? 20 : 5)) e.until = now + GUARD_WINDOW_MS;
    g[k] = e;
  });
  await store.set(GUARD_KEY, JSON.stringify(g));
}
async function guardClear(store, key) {
  const g = JSON.parse((await store.get(GUARD_KEY)) || "{}");
  if (g[key]) { delete g[key]; await store.set(GUARD_KEY, JSON.stringify(g)); }
}
function clientIp(event) {
  const h = (event && event.headers) || {};
  return h["x-nf-client-connection-ip"] || String(h["x-forwarded-for"] || "").split(",")[0].trim() || "inconnue";
}

function randomToken() {
  return crypto.randomBytes(24).toString("hex");
}

/* The full account list (usernames + roles) is only ever included for
   an authenticated staff session. Anyone else — including logged-out
   visitors and logged-in players — only gets which player IDs already
   have an account (needed for the signup dropdown), never usernames or
   roles. This keeps the roster of who's staff/owner from being visible
   to anyone poking at network requests. */
function sanitize(state, session) {
  const claimedPlayerIds = Object.values(state.accounts).map((acc) => acc.playerId).filter(Boolean);
  if (!session) {
    // Visiteur non connecté : juste ce qu'il faut pour se connecter / créer son compte.
    return {
      roster: state.roster.map((p) => ({ id: p.id, nom: p.nom, prenom: p.prenom })),
      claimedPlayerIds,
      matches: [], standings: [], presence: {}, positions: {}, lineups: {}, auditLog: [],
      seasons: state.seasons, currentSeason: state.currentSeason,
      squads: state.squads, members: {}, callups: {},
    };
  }
  const access = accessOf(state, session);
  const isStaff = isStaffRole(session.role);
  const readSq = new Set(Object.keys(access.squads).filter((k) => access.squads[k].read));
  const memberSq = new Set(Object.keys(access.member));
  const sqOf = {};
  state.matches.forEach((m) => { sqOf[m.id] = m.squad; });
  const me = session.playerId;
  const calledFor = (mid) => !!(me && state.callups[mid] && state.callups[mid][me]);
  // Compositions : équipes lisibles en entier (la scoreuse : dès la publication) ;
  // les joueurs de l'équipe (habituels, renforts, appelés) à partir de J-2.
  const lineups = {};
  state.matches.forEach((m) => {
    const lu = state.lineups[m.id];
    if (!lu) return;
    const a = access.squads[m.squad];
    if (a && a.read && !a.scorer) lineups[m.id] = lu;
    else if (a && a.scorer && lu.publishedAt) lineups[m.id] = lu;
    else if ((memberSq.has(m.squad) || calledFor(m.id)) && lineupVisibleToPlayers(m)) lineups[m.id] = lu;
  });
  // Présences : celles des équipes lisibles ou dont on fait partie ; les siennes toujours.
  const presence = {};
  Object.entries(state.presence || {}).forEach(([pid, rec]) => {
    if (pid === me) { presence[pid] = rec; return; }
    const out = {};
    Object.entries(rec || {}).forEach(([k, v]) => {
      const mid = k.replace(/-(vehicule|why)$/, "");
      const sq = sqOf[mid];
      if (sq && (readSq.has(sq) || memberSq.has(sq))) out[k] = v;
    });
    presence[pid] = out;
  });
  // Appels en renfort : ceux des équipes lisibles + les siens.
  const callups = {};
  Object.entries(state.callups || {}).forEach(([mid, rec]) => {
    if (readSq.has(sqOf[mid])) callups[mid] = rec;
    else if (me && rec && rec[me]) callups[mid] = { [me]: rec[me] };
  });
  const roster = state.roster.map((p) => {
    if (p.id === me || isStaff) return p;
    const { mail, ...q } = p; // adresse mail : visible seulement par le joueur lui-même et le staff
    return q.live ? { ...q, live: { ok: !!q.live.ok } } : q; // pas de mention majeur / mineur pour les autres joueurs
  });
  const base = { ...state, roster, lineups, presence, callups, claimedPlayerIds, access };
  if (isStaff) {
    const accounts = {};
    Object.entries(state.accounts).forEach(([uname, acc]) => {
      accounts[uname] = access.owner
        ? { playerId: acc.playerId, role: acc.role, label: acc.label || "", squads: acc.squads || {}, perms: acc.perms || {}, trainer: !!acc.trainer }
        : { playerId: acc.playerId, role: acc.role, label: acc.label || "", squads: acc.squads || {} };
    });
    return { ...base, accounts };
  }
  const { accounts, auditLog, ...rest } = base;
  return { ...rest, auditLog: [] };
}

function nowLabel() {
  const d = new Date();
  return (
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) +
    " " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

function logAction(state, user, action) {
  const entry = { ts: Date.now(), tsLabel: nowLabel(), user, action };
  const log = [entry, ...(state.auditLog || [])].slice(0, 300);
  return { ...state, auditLog: log };
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                        */
/* ------------------------------------------------------------------ */

function ok(data) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

function fail(statusCode, message) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: message }),
  };
}

/* ------------------------------------------------------------------ */
/* Auth                                                                 */
/* ------------------------------------------------------------------ */

async function requireSession(store, token, state) {
  if (!token) return null;
  const sessions = await loadSessions(store);
  const sess = sessions[token];
  if (!sess) return null;
  if (sess.expiresAt < Date.now()) return null;
  // Never trust the role/playerId cached at login time — always re-check
  // against the live account record. This is what actually prevents a
  // token from outliving an account being demoted, renamed, or deleted:
  // without this check, a session created while someone was staff would
  // keep working with staff-level access even after being kicked, right
  // up until the token's natural expiry.
  const acc = state.accounts[sess.username];
  if (!acc) return null; // account deleted or renamed since login
  // Le rôle est relu à chaque requête depuis le compte : une promotion ou une rétrogradation
  // s'applique tout de suite, sans déconnecter la personne. Un compte relié à un autre joueur, lui, est coupé.
  if (acc.playerId !== sess.playerId) return null; // stale session
  return { username: sess.username, role: acc.role, playerId: acc.playerId, space: sess.space || "" };
}

async function invalidateSessionsForUser(store, username) {
  const sessions = await loadSessions(store);
  let changed = false;
  Object.keys(sessions).forEach((t) => {
    if (sessions[t].username === username) {
      delete sessions[t];
      changed = true;
    }
  });
  if (changed) await saveSessions(store, sessions);
}

async function createSession(store, username, role, playerId, space) {
  const sessions = await loadSessions(store);
  const token = randomToken();
  sessions[token] = { username, role, playerId, expiresAt: Date.now() + SESSION_TTL_MS, ...(space ? { space } : {}) };
  // opportunistic cleanup of expired sessions
  Object.keys(sessions).forEach((t) => {
    if (sessions[t].expiresAt < Date.now()) delete sessions[t];
  });
  await saveSessions(store, sessions);
  return token;
}

async function destroySession(store, token) {
  const sessions = await loadSessions(store);
  delete sessions[token];
  await saveSessions(store, sessions);
}

function slugUsername(prenom, nom) {
  const clean = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  const base = clean(prenom) + clean(nom);
  return base || "joueur";
}

async function doSignup(store, body, ip) {
  const password = body.password || "";
  if (!password) return fail(400, "Le mot de passe est obligatoire.");
  if (password.length < MIN_PASSWORD) return fail(400, `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`);

  let role = "player";
  if (body.isOwner || body.isStaff) {
    const wait = await guardLockedFor(store, ["code:" + ip]);
    if (wait) return fail(429, `Trop d'essais de code. Réessaie dans ${wait} min.`);
  }
  if (body.isOwner) {
    if (!OWNER_CODE || body.ownerCode !== OWNER_CODE) { await guardFail(store, ["code:" + ip]); return fail(403, "Code incorrect."); }
    role = "owner";
  } else if (body.isStaff) {
    if (!STAFF_CODE || body.staffCode !== STAFF_CODE) { await guardFail(store, ["code:" + ip]); return fail(403, "Code staff incorrect."); }
    role = "coach";
  }

  const state = await loadAppState(store);

  let finalPlayerId = body.playerId;
  let roster = state.roster;
  let presence = state.presence;
  let positions = state.positions;
  let resolvedNom = "";
  let resolvedPrenom = "";

  if (body.playerId === "__new__") {
    const newNom = (body.newNom || "").trim();
    const newPrenom = (body.newPrenom || "").trim();
    if (!newNom && !newPrenom) return fail(400, "Indique ton nom et ton prénom.");
    finalPlayerId = slugify(newNom || "joueur", newPrenom) + "-" + crypto.randomBytes(3).toString("hex");
    roster = [...roster, { id: finalPlayerId, nom: newNom.toUpperCase(), prenom: newPrenom, numero: "", pos1: "", pos2: "", pos3: "" }];
    presence = { ...presence, [finalPlayerId]: {} };
    positions = { ...positions, [finalPlayerId]: { pos1: "", pos2: "", pos3: "" } };
    resolvedNom = newNom;
    resolvedPrenom = newPrenom;
  } else {
    const claimed = Object.values(state.accounts).some((a) => a.playerId === finalPlayerId);
    if (claimed) return fail(409, "Ce joueur a déjà un compte. Connecte-toi ou choisis \"Nouveau joueur\".");
    const player = roster.find((p) => p.id === finalPlayerId);
    if (!player) return fail(400, "Joueur introuvable.");
    resolvedNom = player.nom;
    resolvedPrenom = player.prenom;
  }

  // The identifiant is generated automatically (prénom+nom, tout collé, en
  // minuscules) rather than left to free typing, to avoid inconsistent
  // formats (spaces, dots, capitals) from less tech-savvy players.
  const base = slugUsername(resolvedPrenom, resolvedNom);
  let uname = base;
  let suffix = 2;
  while (state.accounts[uname]) {
    uname = base + suffix;
    suffix++;
  }

  // Accord pour le suivi en direct (prénom et nom sur la page publique /live) ; mineur : accord d'un parent
  const lv = body.live && typeof body.live === "object" ? body.live : null;
  if (lv) roster = roster.map((p) => (p.id === finalPlayerId ? { ...p, live: liveDoc(lv, uname) } : p));

  const hash = hashPassword(password);
  // Club à une seule équipe : un nouveau joueur en fait partie d'office (avec plusieurs équipes, un coach l'ajoute)
  let members = state.members;
  if (state.squads.length === 1 && !(members[finalPlayerId] || {})[state.squads[0].id]) {
    members = { ...members, [finalPlayerId]: { [state.squads[0].id]: "reg" } };
  }
  let next = {
    ...state,
    roster,
    presence,
    positions,
    members,
    accounts: { ...state.accounts, [uname]: { passwordHash: hash, playerId: finalPlayerId, role, squads: role === "coach" ? { [state.squads[0].id]: "coach" } : {} } },
  };
  next = logAction(next, uname, "a créé son compte" + (role !== "player" ? ` (${role})` : ""));
  await saveAppState(store, next);

  const token = await createSession(store, uname, role, finalPlayerId);
  return ok({ token, username: uname, role, playerId: finalPlayerId, state: sanitize(next, { username: uname, role, playerId: finalPlayerId }) });
}

function liveDoc(lv, by) {
  const minor = !!lv.minor;
  const ok = !!lv.ok;
  const refused = !ok && !!lv.refused; // refus explicite (≠ pas encore répondu)
  return { ok, minor: ok && minor, refused, parent: minor && ok ? String(lv.parent || "").trim().slice(0, 80) : "", at: new Date().toISOString().slice(0, 10), by: String(by || "").slice(0, 60) };
}

async function doLogin(store, body, ip) {
  const uname = (body.username || "").trim().toLowerCase();
  const password = body.password || "";
  const keys = ["u:" + uname, "ip:" + ip];
  const wait = await guardLockedFor(store, keys);
  if (wait) return fail(429, `Trop de tentatives. Réessaie dans ${wait} min.`);
  // Comptes du vrai club d'abord, puis ceux de l'espace test (identifiants « test-… »)
  let space = "";
  let st = store;
  let state = await loadAppState(store);
  let acc = state.accounts[uname];
  if (!acc && uname.startsWith("test-")) {
    st = scopedStore(store, TEST_PREFIX);
    state = await loadAppState(st);
    acc = state.accounts[uname];
    space = "test";
  }
  if (!acc || !verifyPassword(password, acc.passwordHash)) {
    await guardFail(store, keys);
    return fail(401, "Identifiant ou mot de passe incorrect.");
  }
  await guardClear(store, "u:" + uname);
  if (!acc.passwordHash.startsWith("scrypt$")) {
    // Mise à niveau silencieuse de l'ancien hash
    state.accounts[uname] = { ...acc, passwordHash: hashPassword(password) };
    await saveAppState(st, state);
  }
  const token = await createSession(store, uname, acc.role, acc.playerId, space);
  const session = { username: uname, role: acc.role, playerId: acc.playerId, space };
  return ok({ token, username: uname, role: acc.role, playerId: acc.playerId, space, state: sanitize(state, session) });
}


/* ------------------------------------------------------------------ */
/* Mails : mot de passe oublié                                         */
/* ------------------------------------------------------------------ */
const RESET_PREFIX = "pwreset/";
const RESET_USER_PREFIX = "pwreset-user/";
const RESET_TTL_MIN = 30;
const sha = (t) => crypto.createHash("sha256").update(String(t)).digest("hex");

function siteUrl(event) {
  const env = (process.env.URL || "").replace(/\/$/, "");
  if (env) return env;
  const host = ((event && event.headers) || {}).host || "";
  return /^[a-z0-9.:-]+$/i.test(host) ? (host.startsWith("localhost") || host.startsWith("127.") ? "http://" : "https://") + host : "";
}

function emailOfAccount(state, username) {
  const acc = state.accounts[username];
  if (!acc || !acc.playerId) return "";
  const p = state.roster.find((r) => r.id === acc.playerId);
  return (p && p.mail && p.mail.email) || "";
}

async function doForgotPassword(store, body, ip, event) {
  const generic = ok({ sent: true, message: "Si un compte correspond avec une adresse mail renseignée, un lien vient d'être envoyé. Pense à regarder dans les spams." });
  const cfg = mailConfig();
  if (!cfg) return fail(503, "L'envoi de mails n'est pas encore activé : demande à un membre du coaching staff de réinitialiser ton mot de passe.");
  const ident = String(body.ident || "").trim().toLowerCase().slice(0, 120);
  if (!ident) return fail(400, "Indique ton identifiant ou ton adresse mail.");
  const keys = ["fp:" + ident, "fpip:" + ip];
  const wait = await guardLockedFor(store, keys);
  if (wait) return fail(429, `Trop de demandes. Réessaie dans ${wait} min.`);
  await guardFail(store, keys); // chaque demande compte : 5 max par quart d'heure
  const state = await loadAppState(store);
  const users = ident.includes("@")
    ? Object.keys(state.accounts).filter((u) => emailOfAccount(state, u) === ident)
    : state.accounts[ident] ? [ident] : [];
  const site = siteUrl(event);
  if (!site) return generic;
  const transport = makeTransport(cfg);
  for (const username of users.slice(0, 3)) {
    const email = emailOfAccount(state, username);
    if (!email) continue;
    const tok = crypto.randomBytes(24).toString("base64url");
    const prev = await store.get(RESET_USER_PREFIX + username);
    if (prev) await store.delete(RESET_PREFIX + prev);
    await store.set(RESET_PREFIX + sha(tok), JSON.stringify({ username, exp: Date.now() + RESET_TTL_MIN * 60000 }));
    await store.set(RESET_USER_PREFIX + username, sha(tok));
    const acc = state.accounts[username];
    const p = state.roster.find((r) => r.id === acc.playerId);
    const m = renderResetMail({ name: p ? p.prenom : "", username, link: `${site}/?reset=${tok}`, minutes: RESET_TTL_MIN });
    try {
      await sendMail(transport, cfg, { to: email, ...m });
    } catch (e) {
      return fail(502, "Le mail n'a pas pu partir. Réessaie plus tard ou demande au staff.");
    }
  }
  return generic;
}

async function doResetWithToken(store, body) {
  const tok = String(body.resetToken || "");
  const newPassword = body.newPassword || "";
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(tok)) return fail(400, "Lien invalide.");
  const key = RESET_PREFIX + sha(tok);
  const raw = await store.get(key);
  const rec = raw ? JSON.parse(raw) : null;
  if (!rec || rec.exp < Date.now()) {
    if (rec) await store.delete(key);
    return fail(400, "Ce lien a expiré ou a déjà servi. Refais une demande « Mot de passe oublié ».");
  }
  if (newPassword.length < MIN_PASSWORD) return fail(400, `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`);
  let state = await loadAppState(store);
  const acc = state.accounts[rec.username];
  if (!acc) { await store.delete(key); return fail(400, "Compte introuvable."); }
  await store.delete(key);
  await store.delete(RESET_USER_PREFIX + rec.username);
  state = { ...state, accounts: { ...state.accounts, [rec.username]: { ...acc, passwordHash: hashPassword(newPassword) } } };
  state = logAction(state, rec.username, "a changé son mot de passe (lien « mot de passe oublié »)");
  await saveAppState(store, state);
  await invalidateSessionsForUser(store, rec.username);
  await guardClear(store, "u:" + rec.username);
  const token = await createSession(store, rec.username, acc.role, acc.playerId, "");
  const session = { username: rec.username, role: acc.role, playerId: acc.playerId, space: "" };
  return ok({ token, username: rec.username, role: acc.role, playerId: acc.playerId, space: "", state: sanitize(state, session) });
}

async function handleMail(store, state, session, action, body, event) {
  const access = accessOf(state, session);
  const cfg = mailConfig();
  if (action === "mailStatus") {
    if (!isStaffRole(session.role) && !access.owner) return fail(403, "Réservé au coaching staff.");
    return ok({ configured: !!cfg, from: cfg ? maskEmail(cfg.from) : "", name: cfg ? cfg.name : "", host: cfg ? cfg.host : "" });
  }
  if (action === "sendTestMail") {
    if (!access.owner) return fail(403, "Réservé au compte propriétaire.");
    if (!cfg) return fail(503, "Envoi pas encore configuré : ajoute SMTP_USER et SMTP_PASS dans Netlify.");
    const to = String(body.to || emailOfAccount(state, session.username) || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) return fail(400, "Adresse de destination invalide.");
    try {
      await sendMail(makeTransport(cfg), cfg, { to, ...renderTestMail({ by: session.username }) });
    } catch (e) {
      const auth = /auth|535|534|credentials|password/i.test(String(e.message));
      return fail(502, auth ? "Connexion refusée par le serveur mail : vérifie SMTP_USER et le mot de passe d'application (SMTP_PASS)." : "Le mail n'a pas pu partir : " + String(e.message).slice(0, 120));
    }
    return ok({ sent: true, to: maskEmail(to) });
  }
  return fail(400, "Action inconnue.");
}

/* ------------------------------------------------------------------ */
/* Mutations — every role check happens here, server-side only         */
/* ------------------------------------------------------------------ */

function targetLabelFor(state, playerId) {
  const p = state.roster.find((r) => r.id === playerId);
  return p ? `${p.prenom} ${p.nom}` : playerId;
}

async function applyMutation(store, state, session, action, body, mainStore) {
  const actingUser = session.username;
  const role = session.role;
  const access = accessOf(state, session);
  const sessStore = mainStore || store;
  const mSq = (matchId) => squadOfMatch(state, matchId);
  const NO = { error: "Pas de droit sur cette équipe." };
  let s = state;

  switch (action) {
    case "setPresence": {
      const { playerId, matchId, statusValue } = body;
      if (playerId !== session.playerId && !canSq(access, mSq(matchId), "presence")) return { error: "Action non autorisée." };
      if (!s.matches.some((m) => m.id === matchId)) return { error: "Match introuvable." };
      const prev = { ...(s.presence[playerId] || {}) };
      prev[matchId] = statusValue;
      // Raison d'absence (facultative) : « je joue en D3 », « blessé », « pas dispo »
      const why = ["d3", "blesse", "dispo"].includes(body.why) ? body.why : "";
      if (statusValue === "absent" && why) prev[matchId + "-why"] = why;
      else delete prev[matchId + "-why"];
      s = { ...s, presence: { ...s.presence, [playerId]: prev } };
      const matchLabel = s.matches.find((m) => m.id === matchId)?.label || matchId;
      const STATUTS = { present: "Présent", absent: "Absent", reserve: "Sous réserve" };
      const statusLabel = STATUTS[statusValue] || "Non renseigné";
      s = logAction(s, actingUser, `a mis à jour "${matchLabel}" → ${statusLabel} pour ${targetLabelFor(s, playerId)}`);
      break;
    }
    case "setVehicule": {
      const { playerId, matchId, value } = body;
      if (playerId !== session.playerId && !canSq(access, mSq(matchId), "presence")) return { error: "Action non autorisée." };
      const key = matchId + "-vehicule";
      const prev = s.presence[playerId] || {};
      s = { ...s, presence: { ...s.presence, [playerId]: { ...prev, [key]: value } } };
      const matchLabel = s.matches.find((m) => m.id === matchId)?.label || matchId;
      s = logAction(s, actingUser, `a mis à jour véhicule "${matchLabel}" → ${value} pour ${targetLabelFor(s, playerId)}`);
      break;
    }
    case "setPosition": {
      const { playerId, slot, value } = body;
      if (playerId !== session.playerId && !canPlayer(s, access, playerId, "presence")) return { error: "Action non autorisée." };
      if (!["pos1", "pos2", "pos3"].includes(slot)) return { error: "Poste invalide." };
      if (value && !POSTES.includes(value)) return { error: "Poste invalide." };
      const prev = s.positions[playerId] || {};
      s = { ...s, positions: { ...s.positions, [playerId]: { ...prev, [slot]: value } } };
      s = logAction(s, actingUser, `a changé sa position ${slot} → ${value || "—"} (${targetLabelFor(s, playerId)})`);
      break;
    }
    case "setLiveConsent": {
      const { playerId } = body;
      if (playerId !== session.playerId && !canPlayer(s, access, playerId, "presence")) return { error: "Action non autorisée." };
      if (!s.roster.some((p) => p.id === playerId)) return { error: "Joueur introuvable." };
      const doc = liveDoc(body, actingUser);
      s = { ...s, roster: s.roster.map((p) => (p.id === playerId ? { ...p, live: doc } : p)) };
      s = logAction(s, actingUser, `${doc.ok ? "a donné" : "a retiré"} l'accord d'affichage du nom sur le live (${targetLabelFor(s, playerId)})`);
      break;
    }
    case "setMailPrefs": {
      /* Mails du club : opt-in. Rien n'est coché par défaut, rien n'est envoyé sans case cochée. */
      const { playerId } = body;
      if (playerId !== session.playerId && !canPlayer(s, access, playerId, "presence")) return { error: "Action non autorisée." };
      if (!s.roster.some((p) => p.id === playerId)) return { error: "Joueur introuvable." };
      const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "Adresse mail invalide." };
      const doc = email ? { email, me: !!body.me, team: !!body.team, at: new Date().toISOString().slice(0, 10) } : null;
      s = { ...s, roster: s.roster.map((p) => { if (p.id !== playerId) return p; const { mail, ...rest } = p; return doc ? { ...rest, mail: doc } : rest; }) };
      s = logAction(s, actingUser, `a mis à jour ses préférences de mails (${targetLabelFor(s, playerId)})`);
      break;
    }
    case "setNumero": {
      const { playerId, value } = body;
      if (playerId !== session.playerId && !canPlayer(s, access, playerId, "presence")) return { error: "Action non autorisée." };
      const roster = s.roster.map((p) => (p.id === playerId ? { ...p, numero: value } : p));
      s = { ...s, roster };
      s = logAction(s, actingUser, `a changé son numéro de maillot → ${value || "—"} (${targetLabelFor(s, playerId)})`);
      break;
    }

    case "setDefenseSlot": {
      const { matchId, posteKey, playerId } = body;
      if (!canSq(access, mSq(matchId), "compo")) return NO;
      if (!FIELD_POSITIONS.includes(posteKey)) return { error: "Poste invalide." };
      const lineup = getLineup(s, matchId);
      const defense = { ...lineup.defense };
      if (playerId) defense[posteKey] = playerId;
      else delete defense[posteKey];
      s = { ...s, lineups: { ...s.lineups, [matchId]: { ...lineup, defense } } };
      const matchLabel = s.matches.find((m) => m.id === matchId)?.label || matchId;
      const action2 = playerId
        ? `a placé ${targetLabelFor(s, playerId)} à ${posteKey} (${matchLabel})`
        : `a vidé le poste ${posteKey} (${matchLabel})`;
      s = logAction(s, actingUser, action2);
      break;
    }
    case "setBattingSlot": {
      const { matchId, index, playerId } = body;
      if (!canSq(access, mSq(matchId), "compo")) return NO;
      const lineup = getLineup(s, matchId);
      const batting = [...lineup.batting];
      batting[index] = playerId || "";
      s = { ...s, lineups: { ...s.lineups, [matchId]: { ...lineup, batting } } };
      const matchLabel = s.matches.find((m) => m.id === matchId)?.label || matchId;
      s = logAction(s, actingUser, `a mis à jour l'ordre au bâton (position ${index + 1}) pour ${matchLabel}`);
      break;
    }

    case "updateMatchField": {
      const { matchId, field, value } = body;
      if (!canSq(access, mSq(matchId), "manage")) return NO;
      if (!["label", "date", "time", "opponent", "location", "season", "cancelled", "squad"].includes(field)) return { error: "Champ invalide." };
      if (field === "squad" && (!s.squads.some((q) => q.id === value) || !canSq(access, value, "manage"))) return NO;
      if (field === "season" && !SEASON_RE.test(String(value || ""))) return { error: "Saison invalide (ex : 2027)." };
      const matches = s.matches.map((m) => (m.id === matchId ? { ...m, [field]: value } : m));
      s = { ...s, matches, ...(field === "season" && !s.seasons.includes(value) ? { seasons: [...s.seasons, value].sort((a, b) => b.localeCompare(a)) } : {}) };
      const matchLabel = matches.find((m) => m.id === matchId)?.label || matchId;
      const fieldLabels = { label: "le nom", date: "la date", time: "l'heure", opponent: "l'équipe adverse", location: "domicile/extérieur", season: "la saison", cancelled: "le statut annulé" };
      s = logAction(s, actingUser, `a modifié ${fieldLabels[field] || field} de ${matchLabel}`);
      break;
    }
    case "addMatch": {
      const squad = s.squads.some((q) => q.id === body.squad) ? body.squad : (s.squads.find((q) => canSq(access, q.id, "manage")) || {}).id;
      if (!squad || !canSq(access, squad, "manage")) return NO;
      const id = "m-" + Date.now().toString(36) + crypto.randomBytes(2).toString("hex");
      const season = body.season && s.seasons.includes(body.season) ? body.season : s.currentSeason;
      const newMatch = { id, label: `Match ${s.matches.filter((m) => m.season === season && m.squad === squad).length + 1}`, date: "", opponent: "", location: "exterieur", season, squad, innings: emptyInnings() };
      s = { ...s, matches: [...s.matches, newMatch] };
      s = logAction(s, actingUser, `a ajouté "${newMatch.label}"`);
      break;
    }
    case "deleteMatch": {
      const { matchId } = body;
      if (!canSq(access, mSq(matchId), "manage")) return NO;
      const removed = s.matches.find((m) => m.id === matchId);
      const matches = s.matches.filter((m) => m.id !== matchId);
      const lineups = { ...s.lineups };
      delete lineups[matchId];
      const presence = {};
      Object.entries(s.presence).forEach(([playerId, rec]) => {
        const { [matchId]: _a, [matchId + "-vehicule"]: _b, ...rest } = rec;
        presence[playerId] = rest;
      });
      const callups = { ...s.callups };
      delete callups[matchId];
      s = { ...s, matches, lineups, presence, callups };
      s = logAction(s, actingUser, `a supprimé "${removed ? removed.label : matchId}"`);
      break;
    }
    case "reorderMatches": {
      if (!canAny(access, "manage")) return { error: "Réservé au coaching staff." };
      const { orderedIds } = body;
      if (!Array.isArray(orderedIds)) return { error: "Ordre invalide." };
      const byId = {};
      s.matches.forEach((m) => { byId[m.id] = m; });
      const newMatches = [];
      orderedIds.forEach((id) => {
        if (byId[id]) {
          newMatches.push(byId[id]);
          delete byId[id];
        }
      });
      s.matches.forEach((m) => {
        if (byId[m.id]) newMatches.push(m);
      });
      s = { ...s, matches: newMatches };
      s = logAction(s, actingUser, "a réorganisé l'ordre des matchs");
      break;
    }
    case "setInning": {
      const { matchId, team, inningIndex, value } = body;
      if (!canSq(access, mSq(matchId), "sheet") && !canSq(access, mSq(matchId), "manage")) return NO;
      if (!["dragons", "adversaire"].includes(team)) return { error: "Équipe invalide." };
      const matches = s.matches.map((m) => {
        if (m.id !== matchId) return m;
        const innings = m.innings || emptyInnings();
        const teamArr = [...innings[team]];
        teamArr[inningIndex] = value;
        return { ...m, innings: { ...innings, [team]: teamArr } };
      });
      s = { ...s, matches };
      const matchLabel = matches.find((m) => m.id === matchId)?.label || matchId;
      s = logAction(s, actingUser, `a modifié la manche ${inningIndex + 1} (${team === "dragons" ? "Dragons" : "adverse"}) de ${matchLabel}`);
      break;
    }

    case "addSeason": {
      if (!canAny(access, "manage")) return { error: "Réservé au coaching staff." };
      const season = String(body.season || "").trim();
      if (!SEASON_RE.test(season)) return { error: "Saison invalide (ex : 2027)." };
      if (!s.seasons.includes(season)) s = { ...s, seasons: [...s.seasons, season].sort((a, b) => b.localeCompare(a)) };
      if (body.makeCurrent) s = { ...s, currentSeason: season };
      s = logAction(s, actingUser, `a créé la saison ${season}${body.makeCurrent ? " (saison en cours)" : ""}`);
      break;
    }
    case "setCurrentSeason": {
      if (!canAny(access, "manage")) return { error: "Réservé au coaching staff." };
      if (!s.seasons.includes(body.season)) return { error: "Saison inconnue." };
      s = { ...s, currentSeason: body.season };
      s = logAction(s, actingUser, `a passé la saison en cours à ${body.season}`);
      break;
    }
    case "setLineup": {
      // Composition complète envoyée depuis la page Compo & changements.
      const { matchId, defense, batting, dh, subs } = body;
      if (!canSq(access, mSq(matchId), "compo")) return NO;
      const match = s.matches.find((m) => m.id === matchId);
      if (!match) return { error: "Match introuvable." };
      const ids = new Set(s.roster.map((p) => p.id));
      const def = {};
      for (const pos of FIELD_POSITIONS) {
        const v = defense && defense[pos];
        if (v && ids.has(v)) def[pos] = v;
      }
      const bat = Array.from({ length: 9 }, (_, i) => {
        const v = Array.isArray(batting) ? batting[i] : "";
        return v && ids.has(v) ? v : "";
      });
      const lineup = {
        defense: def,
        batting: bat,
        dh: dh && ids.has(dh) ? dh : null,
        subs: Array.isArray(subs) ? subs.slice(0, 20).map((x) => String(x).slice(0, 140)).filter(Boolean) : [],
        publishedAt: Date.now(),
        publishedBy: actingUser,
      };
      // Image de la compo (générée par la page Compo & changements), stockée à part
      const img = body.image;
      if (typeof img === "string" && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(img) && img.length <= 3 * 1024 * 1024) {
        await store.set(LINEUP_IMG_PREFIX + matchId, img);
        lineup.imageAt = lineup.publishedAt;
      } else {
        await store.delete(LINEUP_IMG_PREFIX + matchId);
      }
      s = { ...s, lineups: { ...s.lineups, [matchId]: lineup } };
      s = logAction(s, actingUser, `a publié la composition de ${match.label}`);
      break;
    }
    case "setInnings": {
      // Score complet envoyé depuis la feuille de match (/match/).
      const { matchId, dragons, adversaire } = body;
      if (!canSq(access, mSq(matchId), "sheet")) return NO;
      if (!s.matches.some((m) => m.id === matchId)) return { error: "Match introuvable." };
      const okArr = (a) => Array.isArray(a) && a.length === 7 &&
        a.every((v) => v === null || (Number.isInteger(v) && v >= 0 && v <= 99));
      if (!okArr(dragons) || !okArr(adversaire)) return { error: "Score invalide." };
      const matches = s.matches.map((m) => (m.id === matchId ? { ...m, innings: { dragons, adversaire } } : m));
      s = { ...s, matches };
      const matchLabel = matches.find((m) => m.id === matchId)?.label || matchId;
      s = logAction(s, actingUser, `a envoyé le score de ${matchLabel} depuis la feuille de match`);
      break;
    }

    case "addTeam": {
      const squad = s.squads.some((q) => q.id === body.squad) ? body.squad : (s.squads.find((q) => canSq(access, q.id, "manage")) || {}).id;
      if (!squad || !canSq(access, squad, "manage")) return NO;
      const id = "t-" + Date.now().toString(36) + crypto.randomBytes(2).toString("hex");
      const season = body.season && s.seasons.includes(body.season) ? body.season : s.currentSeason;
      const newTeam = { id, team: "Nouvelle équipe", w: 0, l: 0, t: 0, season, squad };
      s = { ...s, standings: [...(s.standings || []), newTeam] };
      s = logAction(s, actingUser, "a ajouté une équipe au classement");
      break;
    }
    case "updateTeamField": {
      const { teamId, field, value } = body;
      const tm0 = (s.standings || []).find((t) => t.id === teamId);
      if (!tm0 || !canSq(access, tm0.squad, "manage")) return NO;
      if (!["team", "w", "l", "t", "season"].includes(field)) return { error: "Champ invalide." };
      const standings = (s.standings || []).map((t) => (t.id === teamId ? { ...t, [field]: value } : t));
      s = { ...s, standings };
      const team = standings.find((t) => t.id === teamId);
      s = logAction(s, actingUser, `a modifié le classement de "${team ? team.team : teamId}"`);
      break;
    }
    case "deleteTeam": {
      const { teamId } = body;
      const tm0 = (s.standings || []).find((t) => t.id === teamId);
      if (!tm0 || !canSq(access, tm0.squad, "manage")) return NO;
      const removed = (s.standings || []).find((t) => t.id === teamId);
      s = { ...s, standings: (s.standings || []).filter((t) => t.id !== teamId) };
      s = logAction(s, actingUser, `a retiré "${removed ? removed.team : teamId}" du classement`);
      break;
    }

    case "resetPassword": {
      const { username, newPassword } = body;
      if (!newPassword || newPassword.length < MIN_PASSWORD) return { error: `Le nouveau mot de passe doit faire au moins ${MIN_PASSWORD} caractères.` };
      if (!s.accounts[username]) return { error: "Compte introuvable." };
      if (isStaffRole(s.accounts[username].role) && role !== "owner" && username !== actingUser) {
        return { error: "Seul le compte propriétaire peut réinitialiser le mot de passe d'un membre du staff." };
      }
      if (username !== actingUser && (!isStaffRole(role) || !(playerOfAccount(s, username) ? canPlayer(s, access, playerOfAccount(s, username), "roster") : access.owner))) return { error: "Action non autorisée." };
      s = { ...s, accounts: { ...s.accounts, [username]: { ...s.accounts[username], passwordHash: hashPassword(newPassword) } } };
      s = logAction(s, actingUser, `a réinitialisé le mot de passe de "${username}"`);
      await invalidateSessionsForUser(sessStore, username);
      // Changing your OWN password would otherwise kill your own current
      // session too — issue a fresh token right away so there's no
      // surprise logout.
      let newToken;
      if (username === actingUser) {
        newToken = await createSession(sessStore, username, role, s.accounts[username].playerId, session.space);
      }
      await saveAppState(store, s);
      return { state: s, newToken };
    }
    case "deleteAccount": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { username } = body;
      if (!s.accounts[username]) return { error: "Compte introuvable." };
      if (!(playerOfAccount(s, username) ? canPlayer(s, access, playerOfAccount(s, username), "roster") : access.owner)) return NO;
      if (isStaffRole(s.accounts[username].role) && role !== "owner") {
        return { error: "Seul le compte propriétaire peut supprimer un compte staff." };
      }
      const { [username]: _removed, ...rest } = s.accounts;
      s = { ...s, accounts: rest };
      s = logAction(s, actingUser, `a supprimé le compte "${username}"`);
      break;
    }
    case "setAccountRole": {
      if (!access.owner) return { error: "Réservé au compte propriétaire (Administration › Droits des comptes)." };
      const { username, newRole } = body;
      if (!s.accounts[username]) return { error: "Compte introuvable." };
      if (!["player", "coach", "owner", SCORER_ROLE].includes(newRole)) return { error: "Rôle invalide." };
      const currentRole = s.accounts[username].role;
      const touchesStaff = isStaffRole(currentRole) || isStaffRole(newRole);
      if (touchesStaff && role !== "owner") return { error: "Seul le compte propriétaire peut changer le rôle d'un membre du staff." };
      // V3 : le rôle global découle des rôles par équipe ; on garde cette action pour propriétaire / joueur / scoreuse / coach (équipe 1 par défaut)
      const first = s.squads[0].id;
      const prevAcc = s.accounts[username];
      const sq = newRole === "coach" ? (Object.values(prevAcc.squads || {}).some((v) => v === "coach" || v === "staff") ? prevAcc.squads : { [first]: "coach" })
        : newRole === SCORER_ROLE ? { [first]: "scorer" } : newRole === "player" ? {} : prevAcc.squads || {};
      s = { ...s, accounts: { ...s.accounts, [username]: { ...prevAcc, role: newRole, squads: sq } } };
      s = logAction(s, actingUser, `a changé le rôle de "${username}" → ${newRole === "owner" ? "propriétaire" : newRole === "coach" ? "staff" : newRole === SCORER_ROLE ? "scoreuse" : "joueur"}`);
      break;
    }
    case "renameAccount": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { oldUsername, newUsername } = body;
      if (oldUsername !== actingUser && !(playerOfAccount(s, oldUsername) ? canPlayer(s, access, playerOfAccount(s, oldUsername), "roster") : access.owner)) return NO;
      const uname = (newUsername || "").trim().toLowerCase();
      if (!uname) return { error: "Le nouvel identifiant ne peut pas être vide." };
      if (!s.accounts[oldUsername]) return { error: "Compte introuvable." };
      if (isStaffRole(s.accounts[oldUsername].role) && role !== "owner" && oldUsername !== actingUser) {
        return { error: "Seul le compte propriétaire peut renommer un compte staff." };
      }
      if (uname !== oldUsername && s.accounts[uname]) return { error: "Cet identifiant est déjà pris." };
      const acc = s.accounts[oldUsername];
      const { [oldUsername]: _r, ...rest } = s.accounts;
      s = { ...s, accounts: { ...rest, [uname]: acc } };
      s = logAction(s, actingUser, `a renommé le compte "${oldUsername}" → "${uname}"`);
      break;
    }
    case "createAccount": {
      // Compte créé par le propriétaire (scoreuse, non lié à un joueur) : il
      // transmet lui-même l'identifiant et le mot de passe à la personne.
      if (role !== "owner") return { error: "Réservé au compte propriétaire." };
      const uname = String(body.username || "").trim().toLowerCase();
      const pwd = String(body.password || "");
      const newRole = body.newRole === "coach" ? "coach" : SCORER_ROLE;
      if (!/^[a-z0-9._-]{3,30}$/.test(uname)) return { error: "Identifiant : 3 à 30 caractères (lettres, chiffres, . _ -)." };
      if (uname.startsWith("test-")) return { error: "Les identifiants « test-… » sont réservés aux comptes de l'espace test." };
      const sqId = s.squads.some((q) => q.id === body.squad) ? body.squad : s.squads[0].id;
      if (s.accounts[uname]) return { error: "Cet identifiant est déjà pris." };
      if (pwd.length < MIN_PASSWORD) return { error: `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.` };
      const label = String(body.label || "").trim().slice(0, 40);
      s = { ...s, accounts: { ...s.accounts, [uname]: { passwordHash: hashPassword(pwd), playerId: null, role: newRole, label, squads: { [sqId]: newRole === "coach" ? "coach" : "scorer" } } } };
      s = logAction(s, actingUser, `a créé le compte "${uname}" (${newRole === SCORER_ROLE ? "scoreuse" : "staff"})`);
      break;
    }
    case "addPlayer": {
      // Joueur pas encore inscrit : ajouté à l'effectif par le staff. Il pourra
      // plus tard créer son compte en choisissant son nom dans la liste.
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const prenom = String(body.prenom || "").trim().slice(0, 40);
      const nom = String(body.nom || "").trim().slice(0, 40);
      const numero = String(body.numero || "").trim().replace(/[^0-9]/g, "").slice(0, 3);
      if (!prenom && !nom) return { error: "Indique au moins un prénom." };
      const id = slugify(nom || "joueur", prenom || "x") + "-" + crypto.randomBytes(3).toString("hex");
      s = {
        ...s,
        roster: [...s.roster, { id, nom: nom.toUpperCase(), prenom, numero, pos1: "", pos2: "", pos3: "" }],
        presence: { ...s.presence, [id]: {} },
        positions: { ...s.positions, [id]: { pos1: "", pos2: "", pos3: "" } },
      };
      // ajouté depuis l'espace d'une équipe (ou club à une seule équipe) : habituel de cette équipe
      const sqAdd = body.squad && canSq(access, body.squad, "roster") ? body.squad : s.squads.length === 1 ? s.squads[0].id : null;
      if (sqAdd) s = { ...s, members: { ...s.members, [id]: { [sqAdd]: "reg" } } };
      s = logAction(s, actingUser, `a ajouté le joueur "${prenom} ${nom.toUpperCase()}" à l'effectif`);
      break;
    }
    case "updatePlayerField": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { playerId, field, value } = body;
      if (!canPlayer(s, access, playerId, "roster") && !canPlayer(s, access, playerId, "presence")) return NO;
      if (!["nom", "prenom", "numero"].includes(field)) return { error: "Champ invalide." };
      const target = s.roster.find((p) => p.id === playerId);
      if (!target) return { error: "Joueur introuvable." };
      const roster = s.roster.map((p) => (p.id === playerId ? { ...p, [field]: value } : p));
      s = { ...s, roster };
      const fieldLabels = { nom: "le nom", prenom: "le prénom", numero: "le numéro" };
      s = logAction(s, actingUser, `a modifié ${fieldLabels[field]} de "${target.prenom} ${target.nom}"`);
      break;
    }
    case "deletePlayer": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { playerId } = body;
      // supprimer un joueur du club : propriétaire, ou coach de toutes les équipes dont il fait partie
      const pSqs = Object.keys((s.members || {})[playerId] || {});
      if (!access.owner && (pSqs.length ? !pSqs.every((sq) => canSq(access, sq, "roster")) : !canAny(access, "roster"))) return NO;
      const removed = s.roster.find((p) => p.id === playerId);
      const linkedUsername = Object.entries(s.accounts).find(([, acc]) => acc.playerId === playerId)?.[0];
      if (linkedUsername && isStaffRole(s.accounts[linkedUsername].role) && role !== "owner") {
        return { error: "Seul le compte propriétaire peut supprimer un membre du staff." };
      }
      const roster = s.roster.filter((p) => p.id !== playerId);
      const presence = { ...s.presence };
      delete presence[playerId];
      const positions = { ...s.positions };
      delete positions[playerId];
      const lineups = {};
      Object.entries(s.lineups).forEach(([matchId, lineup]) => {
        const defense = { ...lineup.defense };
        Object.keys(defense).forEach((poste) => {
          if (defense[poste] === playerId) delete defense[poste];
        });
        const batting = (lineup.batting || []).map((pid) => (pid === playerId ? "" : pid));
        lineups[matchId] = { ...lineup, defense, batting };
      });
      const accounts = { ...s.accounts };
      if (linkedUsername) delete accounts[linkedUsername];
      const members = { ...s.members };
      delete members[playerId];
      const callups = {};
      Object.entries(s.callups || {}).forEach(([mid, rec]) => { const { [playerId]: _x, ...r } = rec || {}; callups[mid] = r; });
      s = { ...s, roster, presence, positions, lineups, accounts, members, callups };
      const label = removed ? `${removed.prenom} ${removed.nom}` : playerId;
      s = logAction(s, actingUser, `a supprimé le joueur "${label}"${linkedUsername ? ` (et son compte "${linkedUsername}")` : ""}`);
      break;
    }

    /* ---------------- V3 · équipes du club, droits, habituels / renforts ---------------- */
    case "saveSquad": {
      if (!access.owner) return { error: "Réservé au compte propriétaire." };
      const name = String(body.name || "").trim().slice(0, 40);
      if (!name) return { error: "Donne un nom à l'équipe." };
      const level = String(body.level || "").trim().slice(0, 40);
      const target = Math.max(9, Math.min(40, parseInt(body.target, 10) || 12));
      let squads;
      if (body.id && s.squads.some((q) => q.id === body.id)) {
        squads = s.squads.map((q) => (q.id === body.id ? { ...q, name, level, target, color: /^#[0-9a-f]{6}$/i.test(body.color || "") ? body.color : q.color } : q));
      } else {
        if (s.squads.length >= 6) return { error: "6 équipes maximum." };
        let n = s.squads.length + 1, id = "e" + n;
        while (s.squads.some((q) => q.id === id)) id = "e" + ++n;
        const color = /^#[0-9a-f]{6}$/i.test(body.color || "") ? body.color : SQUAD_COLORS[s.squads.length % SQUAD_COLORS.length];
        squads = [...s.squads, { id, name, level, target, color }];
      }
      s = { ...s, squads };
      s = logAction(s, actingUser, `a enregistré l'équipe « ${name} »`);
      break;
    }
    case "deleteSquad": {
      if (!access.owner) return { error: "Réservé au compte propriétaire." };
      const q = s.squads.find((x) => x.id === body.id);
      if (!q) return { error: "Équipe introuvable." };
      if (s.squads.length === 1) return { error: "Il faut garder au moins une équipe." };
      if (s.matches.some((m) => m.squad === q.id)) return { error: "Cette équipe a des matchs : supprime ou déplace-les d'abord." };
      const members = {};
      Object.entries(s.members).forEach(([pid, rec]) => { const { [q.id]: _x, ...r } = rec; if (Object.keys(r).length) members[pid] = r; });
      const accounts = {};
      Object.entries(s.accounts).forEach(([u, acc]) => {
        const { [q.id]: _y, ...sq } = acc.squads || {};
        const { [q.id]: _z, ...pm } = acc.perms || {};
        const nx = { ...acc, squads: sq, perms: pm };
        if (acc.role !== "owner") nx.role = globalRole(nx);
        accounts[u] = nx;
      });
      s = { ...s, squads: s.squads.filter((x) => x.id !== q.id), members, accounts, standings: (s.standings || []).filter((t) => t.squad !== q.id) };
      s = logAction(s, actingUser, `a supprimé l'équipe « ${q.name} »`);
      break;
    }
    case "setMember": {
      const { playerId, squad, value } = body;
      if (!s.squads.some((q) => q.id === squad)) return { error: "Équipe introuvable." };
      if (!canSq(access, squad, "roster")) return NO;
      if (!s.roster.some((p) => p.id === playerId)) return { error: "Joueur introuvable." };
      if (value && !MEMBER_VALUES.includes(value)) return { error: "Valeur invalide." };
      const rec = { ...(s.members[playerId] || {}) };
      if (value) rec[squad] = value; else delete rec[squad];
      const members = { ...s.members };
      if (Object.keys(rec).length) members[playerId] = rec; else delete members[playerId];
      s = { ...s, members };
      const qn = s.squads.find((q) => q.id === squad).name;
      s = logAction(s, actingUser, `${targetLabelFor(s, playerId)} : ${value === "reg" ? "habituel" : value === "renf" ? "renfort" : "retiré"} (${qn})`);
      break;
    }
    case "setAccountAccess": {
      if (!access.owner) return { error: "Réservé au compte propriétaire." };
      const { username } = body;
      const acc = s.accounts[username];
      if (!acc) return { error: "Compte introuvable." };
      const squads = {}, perms = {};
      Object.entries(body.squads || {}).forEach(([k, v]) => { if (s.squads.some((q) => q.id === k) && SQUAD_ROLES.includes(v)) squads[k] = v; });
      Object.entries(body.perms || {}).forEach(([k, v]) => {
        if (!s.squads.some((q) => q.id === k) || !v || typeof v !== "object") return;
        perms[k] = Object.fromEntries(STAFF_PERM_KEYS.map((x) => [x, v[x] === undefined ? DEFAULT_STAFF_PERMS[x] : !!v[x]]));
      });
      const nx = { ...acc, squads, perms, trainer: !!body.trainer };
      if (acc.role !== "owner") nx.role = globalRole(nx);
      s = { ...s, accounts: { ...s.accounts, [username]: nx } };
      s = logAction(s, actingUser, `a modifié les droits de "${username}"`);
      break;
    }
    case "callUp": {
      // Appel en renfort pour un match précis (renfort, joueur d'une autre équipe ou hors roster)
      const { matchId, playerId } = body;
      const sq = mSq(matchId);
      if (!sq) return { error: "Match introuvable." };
      if (!canSq(access, sq, "compo") && !canSq(access, sq, "presence")) return NO;
      if (!s.roster.some((p) => p.id === playerId)) return { error: "Joueur introuvable." };
      const rec = { ...(s.callups[matchId] || {}) };
      rec[playerId] = { by: actingUser, at: Date.now(), ans: "" };
      s = { ...s, callups: { ...s.callups, [matchId]: rec } };
      const lab = s.matches.find((m) => m.id === matchId).label;
      s = logAction(s, actingUser, `a appelé ${targetLabelFor(s, playerId)} en renfort (${lab})`);
      break;
    }
    case "cancelCallUp": {
      const { matchId, playerId } = body;
      const sq = mSq(matchId);
      if (!canSq(access, sq, "compo") && !canSq(access, sq, "presence")) return NO;
      const rec = { ...(s.callups[matchId] || {}) };
      delete rec[playerId];
      s = { ...s, callups: { ...s.callups, [matchId]: rec } };
      s = logAction(s, actingUser, `a annulé l'appel de ${targetLabelFor(s, playerId)}`);
      break;
    }
    case "answerCallUp": {
      const { matchId } = body;
      const me = session.playerId;
      const cur = me && s.callups[matchId] && s.callups[matchId][me];
      if (!cur) return { error: "Pas d'appel pour ce match." };
      const ans = body.ans === "yes" ? "yes" : "no";
      s = { ...s, callups: { ...s.callups, [matchId]: { ...s.callups[matchId], [me]: { ...cur, ans, answeredAt: Date.now() } } } };
      const prev = { ...(s.presence[me] || {}) };
      prev[matchId] = ans === "yes" ? "present" : "absent";
      s = { ...s, presence: { ...s.presence, [me]: prev } };
      s = logAction(s, actingUser, `${ans === "yes" ? "a accepté" : "a refusé"} l'appel en renfort (${s.matches.find((m) => m.id === matchId)?.label || matchId})`);
      break;
    }

    default:
      return { error: "Action inconnue." };
  }

  await saveAppState(store, s);
  return { state: s };
}

/* ------------------------------------------------------------------ */
/* Feuilles de match (saisie en direct depuis /match/)                  */
/* Chaque feuille est stockée sous sa propre clé pour que deux tablettes */
/* qui saisissent deux matchs différents ne s'écrasent jamais.          */
/* ------------------------------------------------------------------ */

const SHEET_PREFIX = "scoresheet/";
const SHEET_MAX_BYTES = 300 * 1024;
const SHEET_FIELDS = ["id", "opp", "date", "home", "first", "lineup", "pitcher", "catcher", "dh", "pos", "kind", "spray", "inns", "mercy", "events", "names", "created", "updated", "linkedMatchId", "device", "live", "squad", "pcs"];
const LIVE_PREFIX = "live/";
const RECAP_PREFIX = "recap/";

/* Version publique d'un match (page /live, sans connexion). La tablette envoie
   un résumé déjà filtré (prénom + numéro, pas de notes, pas de lancers) ; on ne
   garde ici que des valeurs simples et de taille limitée. */
function cleanPublic(v, depth = 0, maxArr = 60) {
  if (depth > 5) return null;
  if (v === null || typeof v === "boolean") return v;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") return v.slice(0, 160);
  if (Array.isArray(v)) return v.slice(0, maxArr).map((x) => cleanPublic(x, depth + 1, maxArr));
  if (typeof v === "object") {
    const out = {};
    Object.keys(v).slice(0, 40).forEach((k) => {
      if (/^[a-zA-Z0-9_]{1,24}$/.test(k)) out[k] = cleanPublic(v[k], depth + 1, maxArr);
    });
    return out;
  }
  return null;
}

function cleanSheet(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  if (typeof raw.id !== "string" || !/^[a-z0-9]{4,24}$/.test(raw.id)) return null;
  if (!Array.isArray(raw.events) || raw.events.length > 5000) return null;
  if (!Array.isArray(raw.lineup) || raw.lineup.length > 20) return null;
  const sheet = {};
  SHEET_FIELDS.forEach((k) => { if (raw[k] !== undefined) sheet[k] = raw[k]; });
  sheet.updated = Number(sheet.updated) || Date.now();
  if (JSON.stringify(sheet).length > SHEET_MAX_BYTES) return null;
  return sheet;
}


/* ---------------- MVP du match ----------------
   mvp/<sheetId>                         { opensAt, closedAt?, coach?: { pid, why, by, at } }
   mvpvote/<sheetId>/<votant>/<choisi>   un fichier par vote : pas de conflit quand tout le monde vote en même temps */
const MVP_PREFIX = "mvp/";
const MVP_VOTE_PREFIX = "mvpvote/";
const MVP_VOTE_MS = 72 * 3600 * 1000;
const mvpCloses = (doc) => (doc && doc.closedAt) || ((doc && doc.opensAt) || 0) + MVP_VOTE_MS;
const mvpOpen = (doc) => !(doc && doc.closedAt) && Date.now() < mvpCloses(doc);
async function loadMvpVotes(store, onlyId) {
  const { blobs } = await store.list({ prefix: MVP_VOTE_PREFIX + (onlyId ? onlyId + "/" : "") });
  const out = {};
  blobs.forEach((b) => {
    const [, sid, voter, pick] = b.key.split("/");
    if (!sid || !voter || !pick) return;
    (out[sid] = out[sid] || {})[voter] = pick;
  });
  return out;
}
function mvpView(doc, votes, rc, session, access, state) {
  const d = doc || { opensAt: rc.updated || 0 };
  const rows = rc.rows || [];
  const name = (pid) => (rows.find((r) => r.id === pid) || {}).n || "?";
  const me = session && session.playerId;
  const open = mvpOpen(d);
  const sq = rc.squad || ((state.squads || [])[0] || {}).id;
  const tally = {};
  Object.values(votes).forEach((p) => { tally[p] = (tally[p] || 0) + 1; });
  const max = Math.max(0, ...Object.values(tally));
  return {
    coach: d.coach ? { pid: d.coach.pid, n: name(d.coach.pid), why: d.coach.why || "" } : null,
    open,
    closesAt: mvpCloses(d),
    count: Object.keys(votes).length,
    myVote: me ? votes[me] || null : null,
    canVote: open && !!me && rows.some((r) => r.id === me),
    canPick: !!access && (canSq(access, sq, "sheet") || canSq(access, sq, "compo")),
    // le résultat n'est montré qu'à la clôture (personne n'est influencé pendant le vote)
    result: open || !max ? null : Object.entries(tally).filter(([, v]) => v === max).map(([pid, v]) => ({ pid, n: name(pid), v })),
  };
}

/* Qui reçoit le récap d'un match :
   - « Mes résultats » coché et a joué ce match → mail perso (avec le récap de l'équipe dedans)
   - sinon « Récap de l'équipe » coché et fait partie de l'équipe (habituel / renfort) ou a joué → mail équipe */
const MAILLOG_PREFIX = "maillog/";
function recapRecipients(state, rc) {
  const sq = rc.squad || (state.squads[0] || {}).id;
  const rows = (rc.rows || []).filter((r) => r.pa > 0);
  const played = new Set(rows.map((r) => r.id));
  const out = [];
  state.roster.forEach((p) => {
    const m = p.mail;
    if (!m || !m.email) return;
    const inSq = played.has(p.id) || !!((state.members || {})[p.id] || {})[sq];
    let kind = null;
    if (m.me && played.has(p.id)) kind = "me";
    else if (m.team && inSq) kind = "team";
    if (!kind) return;
    const row = rows.find((r) => r.id === p.id);
    out.push({ pid: p.id, name: `${p.prenom} ${p.nom}`, email: m.email, kind, spray: !!(kind === "me" && row && (row.spr || []).length) });
  });
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

async function handleScoresheet(store, state, session, action, body, event) {
  /* Récaps des matchs terminés : lecture pour tous les comptes du club */
  if (action === "getRecaps") {
    const { blobs } = await store.list({ prefix: RECAP_PREFIX });
    const recaps = [];
    for (const b of blobs) {
      const raw = await store.get(b.key);
      if (raw) { try { recaps.push(JSON.parse(raw)); } catch (e) { /* ignore */ } }
    }
    recaps.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const acc0 = accessOf(state, session);
    const votes = await loadMvpVotes(store);
    for (const rc of recaps) {
      const doc = JSON.parse((await store.get(MVP_PREFIX + rc.id)) || "null");
      rc.mvp = mvpView(doc, votes[rc.id] || {}, rc, session, acc0, state);
    }
    return ok({ recaps });
  }
  const access = accessOf(state, session);
  /* MVP du match : choix du coach + vote des coéquipiers */
  if (action === "setCoachMvp" || action === "voteMvp" || action === "closeMvpVote") {
    const id = String(body.sheetId || "");
    if (!/^[a-z0-9]{4,24}$/.test(id)) return fail(400, "Match introuvable.");
    const raw = await store.get(RECAP_PREFIX + id);
    if (!raw) return fail(404, "Récap introuvable.");
    const rc = JSON.parse(raw);
    const sq = rc.squad || firstSq;
    const ids = (rc.rows || []).map((r) => r.id);
    const doc = JSON.parse((await store.get(MVP_PREFIX + id)) || "null") || { opensAt: rc.updated || Date.now() };
    const canPick = canSq(access, sq, "sheet") || canSq(access, sq, "compo");
    if (action === "setCoachMvp") {
      if (!canPick) return fail(403, "Réservé au staff de cette équipe.");
      if (body.pid === null || body.pid === "") delete doc.coach;
      else {
        if (!ids.includes(body.pid)) return fail(400, "Ce joueur n'a pas joué ce match.");
        doc.coach = { pid: body.pid, why: String(body.why || "").trim().slice(0, 90), by: session.username, at: Date.now() };
      }
    } else if (action === "closeMvpVote") {
      if (!canPick) return fail(403, "Réservé au staff de cette équipe.");
      doc.closedAt = body.reopen ? undefined : Date.now();
      if (body.reopen) { delete doc.closedAt; doc.opensAt = Date.now(); }
    } else {
      const me = session.playerId;
      if (!me || !ids.includes(me)) return fail(403, "Seuls les joueurs de ce match votent.");
      if (body.pid === me) return fail(400, "Pas le droit de voter pour toi 😉");
      if (!ids.includes(body.pid)) return fail(400, "Ce joueur n'a pas joué ce match.");
      if (!mvpOpen(doc)) return fail(400, "Le vote est clos.");
      const mine = await store.list({ prefix: `${MVP_VOTE_PREFIX}${id}/${me}/` });
      for (const b of mine.blobs) await store.delete(b.key);
      await store.set(`${MVP_VOTE_PREFIX}${id}/${me}/${body.pid}`, "1");
    }
    await store.set(MVP_PREFIX + id, JSON.stringify(doc));
    const votes = await loadMvpVotes(store, id);
    return ok({ mvp: mvpView(doc, votes[id] || {}, rc, session, access, state) });
  }
  const firstSq = state.squads[0].id;
  const sheetSq = (sh) => (state.squads.some((q) => q.id === sh.squad) ? sh.squad : (sh.linkedMatchId && squadOfMatch(state, sh.linkedMatchId)) || firstSq);
  /* Aperçu des mails du récap (version joueur ou équipe) — l'envoi réel arrivera avec Brevo */
  if (action === "previewRecapMail") {
    const id = String(body.sheetId || "");
    if (!/^[a-z0-9]{4,24}$/.test(id)) return fail(400, "Match introuvable.");
    const raw = await store.get(RECAP_PREFIX + id);
    if (!raw) return fail(404, "Récap pas encore disponible : termine le match et laisse la tablette se synchroniser.");
    const rc = JSON.parse(raw);
    if (!canSq(access, rc.squad || firstSq, "read")) return fail(403, "Pas de droit sur cette équipe.");
    const img = typeof body.sprayImg === "string" && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(body.sprayImg) && body.sprayImg.length < 600 * 1024 ? body.sprayImg : "";
    const player = typeof body.player === "string" && (rc.rows || []).some((r) => r.id === body.player) ? body.player : null;
    const md = JSON.parse((await store.get(MVP_PREFIX + id)) || "null");
    const mvp = md && md.coach ? { n: ((rc.rows || []).find((x) => x.id === md.coach.pid) || {}).n || "", why: md.coach.why || "" } : null;
    const m = renderRecapMail(rc, { player, site: body.site && /^https?:\/\/[a-z0-9.:-]+$/i.test(body.site) ? body.site : "", sprayImg: img, mvp });
    // qui le recevrait (cases cochées dans « Mails du club »)
    const wants = state.roster.filter((p) => p.mail && p.mail.email && (player ? p.id === player && p.mail.me : p.mail.team)).length;
    return ok({ subject: m.subject, html: m.html, recipients: wants });
  }
  /* Envoi réel des récaps : liste des destinataires, puis envoi par petits paquets (la tablette fait les cartes des frappes) */
  if (action === "recapMailList" || action === "sendRecapMails") {
    const id = String(body.sheetId || "");
    if (!/^[a-z0-9]{4,24}$/.test(id)) return fail(400, "Match introuvable.");
    const raw = await store.get(RECAP_PREFIX + id);
    if (!raw) return fail(404, "Récap pas encore disponible : termine le match et laisse la tablette se synchroniser.");
    const rc = JSON.parse(raw);
    const sq = rc.squad || firstSq;
    if (!canSq(access, sq, "sheet")) return fail(403, "Réservé au staff de cette équipe (droit feuille de match).");
    const list = recapRecipients(state, rc);
    const logKey = MAILLOG_PREFIX + id;
    const sent = JSON.parse((await store.get(logKey)) || "{}");
    const cfg = mailConfig();
    if (action === "recapMailList") {
      return ok({ configured: !!cfg, recipients: list.map((r) => ({ pid: r.pid, name: r.name, kind: r.kind, spray: r.spray, sent: sent[r.pid] ? sent[r.pid].at : null })) });
    }
    if (!cfg) return fail(503, "Envoi pas encore configuré : ajoute SMTP_USER et SMTP_PASS dans Netlify (voir Administration › Mails).");
    const items = Array.isArray(body.items) ? body.items.slice(0, 6) : [];
    const site = siteUrl(event);
    const transport = makeTransport(cfg);
    const mdoc = JSON.parse((await store.get(MVP_PREFIX + id)) || "null");
    const coachMvp = mdoc && mdoc.coach ? { n: ((rc.rows || []).find((x) => x.id === mdoc.coach.pid) || {}).n || "", why: mdoc.coach.why || "" } : null;
    const results = [];
    for (const it of items) {
      const r = list.find((x) => x.pid === (it && it.pid));
      if (!r) { results.push({ pid: it && it.pid, ok: false, error: "pas inscrit" }); continue; }
      if (sent[r.pid] && !body.force) { results.push({ pid: r.pid, ok: true, skipped: true }); continue; }
      const img = r.kind === "me" && typeof it.sprayImg === "string" && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(it.sprayImg) && it.sprayImg.length < 600 * 1024 ? it.sprayImg : "";
      const m = renderRecapMail(rc, { player: r.kind === "me" ? r.pid : null, site, sprayImg: img ? "cid:frappes@dragons" : "", mvp: coachMvp });
      try {
        await sendMail(transport, cfg, { to: r.email, subject: (session.space === "test" ? "[TEST] " : "") + m.subject, html: m.html, text: m.text, images: img ? [{ cid: "frappes@dragons", dataUrl: img }] : [] });
        sent[r.pid] = { at: new Date().toISOString(), kind: r.kind, by: session.username };
        results.push({ pid: r.pid, ok: true });
      } catch (e) {
        const auth = /auth|535|534|credentials|password/i.test(String(e.message));
        results.push({ pid: r.pid, ok: false, error: auth ? "connexion refusée (identifiants SMTP)" : "envoi impossible" });
        if (auth) break;
      }
    }
    await store.set(logKey, JSON.stringify(sent));
    return ok({ results, sentCount: Object.keys(sent).length, total: list.length });
  }
  if (action === "getScoresheets" ? !canAny(access, "read") : !canAny(access, "sheet")) return fail(403, "Réservé au coaching staff.");

  if (action === "getScoresheets") {
    const { blobs } = await store.list({ prefix: SHEET_PREFIX });
    const sheets = [];
    for (const b of blobs) {
      const raw = await store.get(b.key);
      if (!raw) continue;
      let sh;
      try { sh = JSON.parse(raw); } catch (e) { continue; /* ignore corrupted entry */ }
      const sq = sheetSq(sh);
      if (canSq(access, sq, "read")) sheets.push({ ...sh, squad: sq });
      // Autre équipe : seulement le nombre de lancers par joueur (santé des lanceurs partagés)
      else sheets.push({ id: sh.id, date: sh.date, squad: sq, stub: true, pcs: sh.pcs || {}, updated: sh.updated, names: {} });
    }
    return ok({ sheets });
  }

  if (action === "saveScoresheet") {
    const sheet = cleanSheet(body.sheet);
    if (!sheet) return fail(400, "Feuille de match invalide.");
    sheet.squad = sheetSq(sheet);
    if (!canSq(access, sheet.squad, "sheet")) return fail(403, "Pas de droit sur cette équipe.");
    if (sheet.pcs && typeof sheet.pcs === "object") {
      const pc = {};
      Object.entries(sheet.pcs).slice(0, 40).forEach(([k, v]) => { if (/^[a-z0-9-]{1,80}$/.test(k) && Number.isInteger(v) && v >= 0 && v < 400) pc[k] = v; });
      sheet.pcs = pc;
    }
    const key = SHEET_PREFIX + sheet.id;
    const prevRaw = await store.get(key);
    if (prevRaw) {
      const prev = JSON.parse(prevRaw);
      if (!canSq(access, sheetSq(prev), "sheet")) return fail(403, "Pas de droit sur cette équipe.");
      // Une autre tablette a la main et sa version est plus récente : on ne l'écrase pas.
      if (prev.device && prev.device !== sheet.device && (prev.updated || 0) > sheet.updated) {
        return ok({ conflict: true, sheet: prev });
      }
    }
    sheet.savedBy = session.username;
    await store.set(key, JSON.stringify(sheet));
    if (sheet.live && body.pub && typeof body.pub === "object") {
      const pub = cleanPublic(body.pub);
      pub.id = sheet.id;
      pub.squadName = state.squads.length > 1 ? (state.squads.find((q) => q.id === sheet.squad) || {}).name || "" : "";
      pub.updated = Date.now();
      const raw = JSON.stringify(pub);
      if (raw.length <= 60 * 1024) await store.set(LIVE_PREFIX + sheet.id, raw);
    } else if (!sheet.live) {
      await store.delete(LIVE_PREFIX + sheet.id);
    }
    if (body.recap && typeof body.recap === "object") {
      const rc = cleanPublic(body.recap, 0, 300);
      rc.id = sheet.id;
      rc.squad = sheet.squad;
      rc.squadName = (state.squads.find((q) => q.id === sheet.squad) || {}).name || "";
      rc.updated = Date.now();
      rc.linkedMatchId = typeof sheet.linkedMatchId === "string" ? sheet.linkedMatchId : null;
      const raw = JSON.stringify(rc);
      if (raw.length <= 150 * 1024) await store.set(RECAP_PREFIX + sheet.id, raw);
      if (!(await store.get(MVP_PREFIX + sheet.id))) await store.set(MVP_PREFIX + sheet.id, JSON.stringify({ opensAt: Date.now() }));
    } else if (body.recap === null) {
      await store.delete(RECAP_PREFIX + sheet.id);
    }
    return ok({ saved: true, updated: sheet.updated });
  }

  if (action === "deleteScoresheet") {
    const id = String(body.sheetId || "");
    if (!/^[a-z0-9]{4,24}$/.test(id)) return fail(400, "Feuille introuvable.");
    const prevRaw = await store.get(SHEET_PREFIX + id);
    if (prevRaw && !canSq(access, sheetSq(JSON.parse(prevRaw)), "sheet")) return fail(403, "Pas de droit sur cette équipe.");
    await store.delete(SHEET_PREFIX + id);
    await store.delete(LIVE_PREFIX + id);
    await store.delete(RECAP_PREFIX + id);
    return ok({ deleted: true });
  }

  return fail(400, "Action inconnue.");
}

/* ------------------------------------------------------------------ */
/* Adversaires : line-up adverse (scoreuse + staff) et fiches de scouting */
/* (staff uniquement). Jamais exposés sur la page /live publique.        */
/* ------------------------------------------------------------------ */

const OPP_PREFIX = "opp/";
const SCOUT_PREFIX = "scout/";
const str = (v, n) => String(v == null ? "" : v).trim().slice(0, n);
function teamSlug(name) {
  return str(name, 80).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "adversaire";
}
function cleanOppPlayer(p) {
  if (!p || typeof p !== "object") return null;
  const o = { num: str(p.num, 3).replace(/[^0-9]/g, ""), prenom: str(p.prenom, 30), nom: str(p.nom, 40), pos: str(p.pos, 3).toUpperCase(), hand: str(p.hand, 1) };
  return o.num || o.prenom || o.nom ? o : null;
}

/* Équipes adverses + logos (page publique /api/teams) — staff uniquement en écriture */
async function handleTeams(store, session, action, body) {
  if (!isStaffRole(session.role)) return fail(403, "Réservé au coaching staff.");
  if (session.space && action !== "listTeams") return fail(403, "Les logos des clubs ne se modifient pas depuis l'espace test.");
  let teams = await loadTeams(store);
  const slugId = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  if (action === "saveTeam") {
    const t = body.team || {};
    const name = str(t.name, 60).trim();
    if (!name) return fail(400, "Donne un nom à l'équipe.");
    const aliases = (Array.isArray(t.aliases) ? t.aliases : String(t.aliases || "").split(",")).map((x) => str(x, 40).trim()).filter(Boolean).slice(0, 8);
    const color = /^#[0-9a-f]{6}$/i.test(t.color || "") ? t.color : "#9aada2";
    let id = t.id && teams.some((x) => x.id === t.id) ? t.id : slugId(name) || "equipe";
    if (!t.id || !teams.some((x) => x.id === t.id)) { let base = id, n = 2; while (teams.some((x) => x.id === id)) id = base + "-" + n++; }
    const prev = teams.find((x) => x.id === id);
    const doc = { id, name, aliases, color, logo: prev ? prev.logo || "" : "" };
    teams = prev ? teams.map((x) => (x.id === id ? doc : x)) : [...teams, doc];
  } else if (action === "deleteTeam") {
    teams = teams.filter((x) => x.id !== body.id);
    if (DEFAULT_TEAMS.some((d) => d.id === body.id)) {
      const del = JSON.parse((await store.get(TEAMS_DELETED_KEY)) || "[]");
      if (!del.includes(body.id)) await store.set(TEAMS_DELETED_KEY, JSON.stringify([...del, body.id]));
    }
    await store.delete(TEAM_LOGO_PREFIX + body.id).catch(() => {});
  } else if (action === "setTeamLogo") {
    const tm = teams.find((x) => x.id === body.id);
    if (!tm) return fail(404, "Équipe introuvable.");
    const d = String(body.dataUrl || "");
    if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(d)) return fail(400, "Image invalide (PNG, JPEG ou WebP).");
    if (d.length > 400 * 1024) return fail(400, "Image trop lourde.");
    await store.set(TEAM_LOGO_PREFIX + tm.id, d);
    teams = teams.map((x) => (x.id === tm.id ? { ...x, logo: "/api/teams?logo=" + tm.id + "&v=" + Date.now().toString(36) } : x));
  } else if (action !== "listTeams") return fail(400, "Action inconnue.");
  if (action !== "listTeams") await store.set(TEAMS_KEY, JSON.stringify(teams));
  return ok({ teams });
}

async function handleOpponents(store, state, session, action, body) {
  const access = accessOf(state, session);
  if (action === "getOppLineups") {
    if (!canAny(access, "read")) return fail(403, "Réservé au staff et à la scoreuse.");
    const { blobs } = await store.list({ prefix: OPP_PREFIX });
    const out = [];
    for (const b of blobs) { const raw = await store.get(b.key); if (raw) { try { out.push(JSON.parse(raw)); } catch (e) {} } }
    return ok({ lineups: out });
  }
  if (action === "saveOppLineup") {
    const sheetId = String(body.sheetId || "");
    if (!/^[a-z0-9]{4,24}$/.test(sheetId)) return fail(400, "Match introuvable.");
    const shRaw = await store.get(SHEET_PREFIX + sheetId);
    const shSq = shRaw ? (JSON.parse(shRaw).squad || state.squads[0].id) : null;
    const okSq = (sq) => canSq(access, sq, "sheet") || canSq(access, sq, "scorer");
    if (shSq ? !okSq(shSq) : !state.squads.some((q) => okSq(q.id))) return fail(403, "Réservé au staff et à la scoreuse.");
    const l = body.lineup || {};
    const order = (Array.isArray(l.order) ? l.order : []).slice(0, 12).map(cleanOppPlayer);
    const bench = (Array.isArray(l.bench) ? l.bench : []).slice(0, 20).map(cleanOppPlayer).filter(Boolean);
    const pitcher = cleanOppPlayer(l.pitcher);
    const out = (Array.isArray(l.out) ? l.out : []).slice(0, 30).map(cleanOppPlayer).filter(Boolean);
    const subs = (Array.isArray(l.subs) ? l.subs : []).slice(0, 60).map((x) => x && typeof x === "object" ? {
      inn: Math.max(1, Math.min(30, parseInt(x.inn, 10) || 1)), half: str(x.half, 6), slot: str(x.slot, 2),
      pos: str(x.pos, 3).toUpperCase(), out: cleanOppPlayer(x.out), in: cleanOppPlayer(x.in), at: Number(x.at) || Date.now(),
      kind: x.kind === "pos" ? "pos" : "sub", who: cleanOppPlayer(x.who), from: str(x.from, 3).toUpperCase(), to: str(x.to, 3).toUpperCase(),
    } : null).filter((x) => x && (x.kind === "pos" ? x.who && x.to : x.out && x.in));
    const doc = { sheetId, team: str(l.team, 80), teamSlug: teamSlug(l.team), date: str(l.date, 10), order, bench, pitcher, out, subs, updated: Date.now(), by: session.username };
    await store.set(OPP_PREFIX + sheetId, JSON.stringify(doc));
    return ok({ lineup: doc });
  }
  // Fiches de scouting : staff avec le droit « scouting » (lecture aussi pour la casquette entraîneur)
  const scoutWrite = canAny(access, "scout");
  if (!scoutWrite && !(access.trainer && action !== "saveScout")) return fail(403, "Réservé au coaching staff.");
  if (action === "listScout") {
    const { blobs } = await store.list({ prefix: SCOUT_PREFIX });
    const out = [];
    for (const b of blobs) { const raw = await store.get(b.key); if (raw) { try { out.push(JSON.parse(raw)); } catch (e) {} } }
    return ok({ teams: out });
  }
  const slug = teamSlug(body.team);
  const key = SCOUT_PREFIX + slug;
  const prev = JSON.parse((await store.get(key)) || "null") || { team: str(body.team, 80), slug, players: {} };
  if (action === "getScout") return ok({ scout: prev });
  if (action === "saveScout") {
    const pk = str(body.playerKey, 80);
    if (!pk) return fail(400, "Joueur manquant.");
    const cur = prev.players[pk] || { tags: [], notes: [], warn: false };
    if (Array.isArray(body.tags)) cur.tags = body.tags.slice(0, 15).map((x) => str(x, 30)).filter(Boolean);
    if (typeof body.warn === "boolean") cur.warn = body.warn;
    if (body.info && typeof body.info === "object") cur.info = cleanOppPlayer(body.info) || cur.info;
    if (body.note) cur.notes = [...cur.notes, { d: new Date().toISOString().slice(0, 10), txt: str(body.note, 400), by: session.username }].slice(-50);
    if (Number.isInteger(body.deleteNote)) cur.notes = cur.notes.filter((_, i) => i !== body.deleteNote);
    prev.players[pk] = cur;
    prev.team = prev.team || str(body.team, 80);
    prev.updated = Date.now();
    const raw = JSON.stringify(prev);
    if (raw.length > 200 * 1024) return fail(400, "Fiche trop volumineuse.");
    await store.set(key, raw);
    return ok({ scout: prev });
  }
  return fail(400, "Action inconnue.");
}

/* ------------------------------------------------------------------ */
/* Espace test : gestion par le propriétaire du vrai club               */
/* ------------------------------------------------------------------ */
const TEST_CLEAN_PREFIXES = [MVP_PREFIX, MVP_VOTE_PREFIX, SHEET_PREFIX, LIVE_PREFIX, RECAP_PREFIX, OPP_PREFIX, SCOUT_PREFIX, LINEUP_IMG_PREFIX, BACKUP_PREFIX];
function testPlayerFor(st, label) {
  const claimed = new Set(Object.values(st.accounts).map((a) => a.playerId).filter(Boolean));
  const free = st.roster.find((p) => !claimed.has(p.id));
  if (free) return { st, playerId: free.id };
  const id = "joueur-test-" + crypto.randomBytes(3).toString("hex");
  const prenom = String(label || "Joueur").slice(0, 30);
  const first = st.squads[0].id;
  return {
    st: { ...st, roster: [...st.roster, { id, nom: "TEST", prenom, numero: "", pos1: "", pos2: "", pos3: "" }], members: { ...st.members, [id]: { [first]: "reg" } } },
    playerId: id,
  };
}
async function handleTestSpace(main, session, action, body) {
  if (session.role !== "owner" || session.space) return fail(403, "Réservé au compte propriétaire du club.");
  const ts = scopedStore(main, TEST_PREFIX);
  let st = await loadAppState(ts);
  const meta = JSON.parse((await main.get(TEST_META_KEY)) || "{}");
  const list = () => Object.entries(st.accounts).map(([u, a]) => ({ username: u, label: a.label || "", kind: a.role === "owner" ? "full" : "player", created: a.created || null }));
  if (action === "getTestSpace") return ok({ accounts: list(), content: meta.content || "blank", resetAt: meta.at || null });
  if (action === "createTestAccount") {
    const label = String(body.label || "").trim().slice(0, 40);
    const base = "test-" + (slugUsername(label, "") || "compte").slice(0, 20);
    let uname = base, n = 2;
    while (st.accounts[uname]) uname = base + n++;
    const pwd = String(body.password || "");
    if (pwd.length < MIN_PASSWORD) return fail(400, `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`);
    const kind = body.kind === "player" ? "player" : "full";
    let playerId = null;
    if (kind === "player") { const r = testPlayerFor(st, label); st = r.st; playerId = r.playerId; }
    st = { ...st, accounts: { ...st.accounts, [uname]: { passwordHash: hashPassword(pwd), playerId, role: kind === "full" ? "owner" : "player", label, squads: {}, created: new Date().toISOString().slice(0, 10) } } };
    await ts.set(APP_KEY, JSON.stringify(st));
    return ok({ accounts: list(), created: uname, content: meta.content || "blank" });
  }
  if (action === "setTestPassword") {
    const acc = st.accounts[body.username];
    if (!acc) return fail(404, "Compte test introuvable.");
    if (String(body.password || "").length < MIN_PASSWORD) return fail(400, `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`);
    st.accounts[body.username] = { ...acc, passwordHash: hashPassword(body.password) };
    await ts.set(APP_KEY, JSON.stringify(st));
    await invalidateSessionsForUser(main, body.username);
    return ok({ accounts: list(), content: meta.content || "blank" });
  }
  if (action === "deleteTestAccount") {
    if (!st.accounts[body.username]) return fail(404, "Compte test introuvable.");
    const { [body.username]: _x, ...rest } = st.accounts;
    st = { ...st, accounts: rest };
    await ts.set(APP_KEY, JSON.stringify(st));
    await invalidateSessionsForUser(main, body.username);
    return ok({ accounts: list(), content: meta.content || "blank" });
  }
  if (action === "resetTestSpace") {
    const content = body.content === "example" ? "example" : "blank";
    // on garde les comptes test, tout le reste repart de zéro
    for (const pre of TEST_CLEAN_PREFIXES) {
      const { blobs } = await ts.list({ prefix: pre });
      for (const b of blobs) await ts.delete(b.key);
    }
    let next = normalizeState(content === "example" ? exampleState() : blankState(), true);
    const accounts = {};
    for (const [u, a] of Object.entries(st.accounts)) {
      let playerId = null;
      if (a.role !== "owner") { const r = testPlayerFor({ ...next, accounts }, a.label); next = r.st; playerId = r.playerId; }
      accounts[u] = { ...a, playerId, squads: {} };
    }
    next = { ...next, accounts };
    await ts.set(APP_KEY, JSON.stringify(next));
    await main.set(TEST_META_KEY, JSON.stringify({ content, at: new Date().toISOString() }));
    // les sessions des joueurs test pointaient peut-être vers un ancien joueur : on les coupe
    for (const u of Object.keys(accounts)) await invalidateSessionsForUser(main, u);
    st = next;
    return ok({ accounts: list(), content, resetAt: new Date().toISOString() });
  }
  return fail(400, "Action inconnue.");
}

/* ------------------------------------------------------------------ */
/* Handler                                                              */
/* ------------------------------------------------------------------ */

export async function handler(event) {
  if (event.httpMethod !== "POST") return fail(405, "Method not allowed");

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return fail(400, "JSON invalide.");
  }

  const { action, token } = body;
  const main = getBlobStore();

  try {
    const ip = clientIp(event);
    if (action === "signup") return await doSignup(main, body, ip);
    if (action === "login") return await doLogin(main, body, ip);
    if (action === "forgotPassword") return await doForgotPassword(main, body, ip, event);
    if (action === "resetWithToken") return await doResetWithToken(main, body);

    if (action === "logout") {
      if (token) await destroySession(main, token);
      return ok({ success: true });
    }

    // Session de l'espace test : tout se lit et s'écrit sous « test/ »
    const rec = token ? (await loadSessions(main))[token] : null;
    const store = rec && rec.space === "test" ? scopedStore(main, TEST_PREFIX) : main;
    const state = await loadAppState(store);

    if (action === "getState") {
      const session = token ? await requireSession(main, token, state) : null;
      return ok({ state: sanitize(state, session), session });
    }

    const session = await requireSession(main, token, state);
    if (!session) return fail(401, "Session invalide, reconnecte-toi.");

    if (["getTestSpace", "createTestAccount", "setTestPassword", "deleteTestAccount", "resetTestSpace"].includes(action)) {
      return await handleTestSpace(main, session, action, body);
    }

    if (action === "getLineupImage") {
      const match = state.matches.find((m) => m.id === body.matchId);
      if (!match) return fail(404, "Match introuvable.");
      const acc3 = accessOf(state, session);
      const lu3 = state.lineups[match.id] || {};
      const okRead = (canSq(acc3, match.squad, "read") && (!canSq(acc3, match.squad, "scorer") || lu3.publishedAt))
        || ((acc3.member[match.squad] || (state.callups[match.id] || {})[session.playerId]) && lineupVisibleToPlayers(match));
      if (!okRead) return fail(403, "Composition pas encore publiée.");
      const image = await store.get(LINEUP_IMG_PREFIX + match.id);
      return ok({ image: image || null });
    }
    if (["listBackups", "getBackup", "restoreBackup"].includes(action)) {
      return await handleBackup(store, state, session, action, body);
    }
    if (["mailStatus", "sendTestMail"].includes(action)) {
      return await handleMail(store, state, session, action, body, event);
    }
    if (["getScoresheets", "saveScoresheet", "deleteScoresheet", "getRecaps", "previewRecapMail", "recapMailList", "sendRecapMails", "setCoachMvp", "voteMvp", "closeMvpVote"].includes(action)) {
      return await handleScoresheet(store, state, session, action, body, event);
    }
    // « deleteTeam » sert aussi au classement (avec teamId) : seul l'appel avec id vise les logos
    if (["listTeams", "saveTeam", "setTeamLogo"].includes(action) || (action === "deleteTeam" && !body.teamId)) {
      return await handleTeams(main, session, action, body);
    }
    if (["getOppLineups", "saveOppLineup", "getScout", "listScout", "saveScout"].includes(action)) {
      return await handleOpponents(store, state, session, action, body);
    }

    const result = await applyMutation(store, state, session, action, body, main);
    if (result.error) return fail(400, result.error);
    return ok({ state: sanitize(result.state, session), newToken: result.newToken });
  } catch (e) {
    return fail(500, "Erreur serveur: " + e.message);
  }
}
