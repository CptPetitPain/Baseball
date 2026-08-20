import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

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
  return { dragons: Array(9).fill(null), adversaire: Array(9).fill(null) };
}

const MATCHES_SEED = [
  { id: "m1", label: "Match 1", date: "12 avril", opponent: "", innings: emptyInnings() },
  { id: "m2", label: "Match 2", date: "19 avril", opponent: "", innings: emptyInnings() },
  { id: "m3", label: "Match 3", date: "26 avril", opponent: "", innings: emptyInnings() },
  { id: "m4", label: "Match 4", date: "3 mai", opponent: "", innings: emptyInnings() },
  { id: "m5", label: "Match 5", date: "10 mai", opponent: "", innings: emptyInnings() },
  { id: "m6", label: "Match 6", date: "17 mai", opponent: "", innings: emptyInnings() },
  { id: "m7", label: "Match 7", date: "31 mai", opponent: "", innings: emptyInnings() },
  { id: "m8", label: "Match 8", date: "7 juin", opponent: "", innings: emptyInnings() },
  { id: "m9", label: "Match 9", date: "14 juin", opponent: "", innings: emptyInnings() },
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
  };
}

function normalizeState(s) {
  const base = defaultState();
  const matches = (s.matches && s.matches.length ? s.matches : base.matches).map((m) => ({
    ...m,
    innings: m.innings || emptyInnings(),
  }));
  return {
    roster: s.roster || base.roster,
    accounts: s.accounts || {},
    presence: s.presence || {},
    positions: s.positions || {},
    lineups: s.lineups || {},
    matches,
    standings: s.standings || [],
    auditLog: s.auditLog || [],
  };
}

function getLineup(state, matchId) {
  const l = state.lineups[matchId] || { defense: {}, batting: [] };
  const batting = Array.from({ length: 9 }, (_, i) => l.batting[i] || "");
  return { defense: l.defense || {}, batting };
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
  if (raw) return normalizeState(JSON.parse(raw));
  const initial = defaultState();
  await store.set(APP_KEY, JSON.stringify(initial));
  return initial;
}

async function saveAppState(store, state) {
  await store.set(APP_KEY, JSON.stringify(state));
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

function randomToken() {
  return crypto.randomBytes(24).toString("hex");
}

function sanitize(state) {
  const accounts = {};
  Object.entries(state.accounts).forEach(([uname, acc]) => {
    accounts[uname] = { playerId: acc.playerId, role: acc.role };
  });
  return { ...state, accounts };
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

async function requireSession(store, token) {
  if (!token) return null;
  const sessions = await loadSessions(store);
  const sess = sessions[token];
  if (!sess) return null;
  if (sess.expiresAt < Date.now()) return null;
  return sess;
}

async function createSession(store, username, role, playerId) {
  const sessions = await loadSessions(store);
  const token = randomToken();
  sessions[token] = { username, role, playerId, expiresAt: Date.now() + SESSION_TTL_MS };
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

async function doSignup(store, body) {
  const uname = (body.username || "").trim().toLowerCase();
  const password = body.password || "";
  if (!uname || !password) return fail(400, "Identifiant et mot de passe sont obligatoires.");
  if (password.length < 4) return fail(400, "Le mot de passe doit faire au moins 4 caractères.");

  let role = "player";
  if (body.isOwner) {
    if (!OWNER_CODE || body.ownerCode !== OWNER_CODE) return fail(403, "Code incorrect.");
    role = "owner";
  } else if (body.isStaff) {
    if (!STAFF_CODE || body.staffCode !== STAFF_CODE) return fail(403, "Code staff incorrect.");
    role = "coach";
  }

  const state = await loadAppState(store);
  if (state.accounts[uname]) return fail(409, "Cet identifiant est déjà pris.");

  let finalPlayerId = body.playerId;
  let roster = state.roster;
  let presence = state.presence;
  let positions = state.positions;

  if (body.playerId === "__new__") {
    const newNom = (body.newNom || "").trim();
    const newPrenom = (body.newPrenom || "").trim();
    if (!newNom && !newPrenom) return fail(400, "Indique ton nom et ton prénom.");
    finalPlayerId = slugify(newNom || "joueur", newPrenom) + "-" + crypto.randomBytes(3).toString("hex");
    roster = [...roster, { id: finalPlayerId, nom: newNom.toUpperCase(), prenom: newPrenom, numero: "", pos1: "", pos2: "", pos3: "" }];
    presence = { ...presence, [finalPlayerId]: {} };
    positions = { ...positions, [finalPlayerId]: { pos1: "", pos2: "", pos3: "" } };
  } else {
    const claimed = Object.values(state.accounts).some((a) => a.playerId === finalPlayerId);
    if (claimed) return fail(409, "Ce joueur a déjà un compte. Connecte-toi ou choisis \"Nouveau joueur\".");
  }

  const hash = sha256(password);
  let next = {
    ...state,
    roster,
    presence,
    positions,
    accounts: { ...state.accounts, [uname]: { passwordHash: hash, playerId: finalPlayerId, role } },
  };
  next = logAction(next, uname, "a créé son compte" + (role !== "player" ? ` (${role})` : ""));
  await saveAppState(store, next);

  const token = await createSession(store, uname, role, finalPlayerId);
  return ok({ token, username: uname, role, playerId: finalPlayerId, state: sanitize(next) });
}

async function doLogin(store, body) {
  const uname = (body.username || "").trim().toLowerCase();
  const password = body.password || "";
  const state = await loadAppState(store);
  const acc = state.accounts[uname];
  if (!acc) return fail(401, "Identifiant inconnu.");
  if (sha256(password) !== acc.passwordHash) return fail(401, "Mot de passe incorrect.");
  const token = await createSession(store, uname, acc.role, acc.playerId);
  return ok({ token, username: uname, role: acc.role, playerId: acc.playerId, state: sanitize(state) });
}

/* ------------------------------------------------------------------ */
/* Mutations — every role check happens here, server-side only         */
/* ------------------------------------------------------------------ */

function targetLabelFor(state, playerId) {
  const p = state.roster.find((r) => r.id === playerId);
  return p ? `${p.prenom} ${p.nom}` : playerId;
}

async function applyMutation(store, state, session, action, body) {
  const actingUser = session.username;
  const role = session.role;
  let s = state;

  switch (action) {
    case "setPresence": {
      const { playerId, matchId, statusValue } = body;
      if (playerId !== session.playerId && !isStaffRole(role)) return { error: "Action non autorisée." };
      const prev = s.presence[playerId] || {};
      s = { ...s, presence: { ...s.presence, [playerId]: { ...prev, [matchId]: statusValue } } };
      const matchLabel = s.matches.find((m) => m.id === matchId)?.label || matchId;
      const STATUTS = { present: "Présent", absent: "Absent", reserve: "Sous réserve" };
      const statusLabel = STATUTS[statusValue] || "Non renseigné";
      s = logAction(s, actingUser, `a mis à jour "${matchLabel}" → ${statusLabel} pour ${targetLabelFor(s, playerId)}`);
      break;
    }
    case "setVehicule": {
      const { playerId, matchId, value } = body;
      if (playerId !== session.playerId && !isStaffRole(role)) return { error: "Action non autorisée." };
      const key = matchId + "-vehicule";
      const prev = s.presence[playerId] || {};
      s = { ...s, presence: { ...s.presence, [playerId]: { ...prev, [key]: value } } };
      const matchLabel = s.matches.find((m) => m.id === matchId)?.label || matchId;
      s = logAction(s, actingUser, `a mis à jour véhicule "${matchLabel}" → ${value} pour ${targetLabelFor(s, playerId)}`);
      break;
    }
    case "setPosition": {
      const { playerId, slot, value } = body;
      if (playerId !== session.playerId && !isStaffRole(role)) return { error: "Action non autorisée." };
      if (!["pos1", "pos2", "pos3"].includes(slot)) return { error: "Poste invalide." };
      if (value && !POSTES.includes(value)) return { error: "Poste invalide." };
      const prev = s.positions[playerId] || {};
      s = { ...s, positions: { ...s.positions, [playerId]: { ...prev, [slot]: value } } };
      s = logAction(s, actingUser, `a changé sa position ${slot} → ${value || "—"} (${targetLabelFor(s, playerId)})`);
      break;
    }
    case "setNumero": {
      const { playerId, value } = body;
      if (playerId !== session.playerId && !isStaffRole(role)) return { error: "Action non autorisée." };
      const roster = s.roster.map((p) => (p.id === playerId ? { ...p, numero: value } : p));
      s = { ...s, roster };
      s = logAction(s, actingUser, `a changé son numéro de maillot → ${value || "—"} (${targetLabelFor(s, playerId)})`);
      break;
    }

    case "setDefenseSlot": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { matchId, posteKey, playerId } = body;
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
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { matchId, index, playerId } = body;
      const lineup = getLineup(s, matchId);
      const batting = [...lineup.batting];
      batting[index] = playerId || "";
      s = { ...s, lineups: { ...s.lineups, [matchId]: { ...lineup, batting } } };
      const matchLabel = s.matches.find((m) => m.id === matchId)?.label || matchId;
      s = logAction(s, actingUser, `a mis à jour l'ordre au bâton (position ${index + 1}) pour ${matchLabel}`);
      break;
    }

    case "updateMatchField": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { matchId, field, value } = body;
      if (!["label", "date", "opponent"].includes(field)) return { error: "Champ invalide." };
      const matches = s.matches.map((m) => (m.id === matchId ? { ...m, [field]: value } : m));
      s = { ...s, matches };
      const matchLabel = matches.find((m) => m.id === matchId)?.label || matchId;
      const fieldLabels = { label: "le nom", date: "la date", opponent: "l'équipe adverse" };
      s = logAction(s, actingUser, `a modifié ${fieldLabels[field] || field} de ${matchLabel}`);
      break;
    }
    case "addMatch": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const id = "m-" + Date.now().toString(36) + crypto.randomBytes(2).toString("hex");
      const newMatch = { id, label: `Match ${s.matches.length + 1}`, date: "", opponent: "", innings: emptyInnings() };
      s = { ...s, matches: [...s.matches, newMatch] };
      s = logAction(s, actingUser, `a ajouté "${newMatch.label}"`);
      break;
    }
    case "deleteMatch": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { matchId } = body;
      const removed = s.matches.find((m) => m.id === matchId);
      const matches = s.matches.filter((m) => m.id !== matchId);
      const lineups = { ...s.lineups };
      delete lineups[matchId];
      const presence = {};
      Object.entries(s.presence).forEach(([playerId, rec]) => {
        const { [matchId]: _a, [matchId + "-vehicule"]: _b, ...rest } = rec;
        presence[playerId] = rest;
      });
      s = { ...s, matches, lineups, presence };
      s = logAction(s, actingUser, `a supprimé "${removed ? removed.label : matchId}"`);
      break;
    }
    case "setInning": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { matchId, team, inningIndex, value } = body;
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

    case "addTeam": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const id = "t-" + Date.now().toString(36) + crypto.randomBytes(2).toString("hex");
      const newTeam = { id, team: "Nouvelle équipe", w: 0, l: 0, t: 0 };
      s = { ...s, standings: [...(s.standings || []), newTeam] };
      s = logAction(s, actingUser, "a ajouté une équipe au classement");
      break;
    }
    case "updateTeamField": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { teamId, field, value } = body;
      if (!["team", "w", "l", "t"].includes(field)) return { error: "Champ invalide." };
      const standings = (s.standings || []).map((t) => (t.id === teamId ? { ...t, [field]: value } : t));
      s = { ...s, standings };
      const team = standings.find((t) => t.id === teamId);
      s = logAction(s, actingUser, `a modifié le classement de "${team ? team.team : teamId}"`);
      break;
    }
    case "deleteTeam": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { teamId } = body;
      const removed = (s.standings || []).find((t) => t.id === teamId);
      s = { ...s, standings: (s.standings || []).filter((t) => t.id !== teamId) };
      s = logAction(s, actingUser, `a retiré "${removed ? removed.team : teamId}" du classement`);
      break;
    }

    case "resetPassword": {
      const { username, newPassword } = body;
      if (!newPassword || newPassword.length < 4) return { error: "Le nouveau mot de passe doit faire au moins 4 caractères." };
      if (!s.accounts[username]) return { error: "Compte introuvable." };
      if (isStaffRole(s.accounts[username].role) && role !== "owner" && username !== actingUser) {
        return { error: "Seul le compte propriétaire peut réinitialiser le mot de passe d'un membre du staff." };
      }
      if (!isStaffRole(role) && username !== actingUser) return { error: "Action non autorisée." };
      s = { ...s, accounts: { ...s.accounts, [username]: { ...s.accounts[username], passwordHash: sha256(newPassword) } } };
      s = logAction(s, actingUser, `a réinitialisé le mot de passe de "${username}"`);
      break;
    }
    case "deleteAccount": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { username } = body;
      if (!s.accounts[username]) return { error: "Compte introuvable." };
      if (isStaffRole(s.accounts[username].role) && role !== "owner") {
        return { error: "Seul le compte propriétaire peut supprimer un compte staff." };
      }
      const { [username]: _removed, ...rest } = s.accounts;
      s = { ...s, accounts: rest };
      s = logAction(s, actingUser, `a supprimé le compte "${username}"`);
      break;
    }
    case "setAccountRole": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { username, newRole } = body;
      if (!s.accounts[username]) return { error: "Compte introuvable." };
      if (!["player", "coach", "owner"].includes(newRole)) return { error: "Rôle invalide." };
      const currentRole = s.accounts[username].role;
      const touchesStaff = isStaffRole(currentRole) || isStaffRole(newRole);
      if (touchesStaff && role !== "owner") return { error: "Seul le compte propriétaire peut changer le rôle d'un membre du staff." };
      s = { ...s, accounts: { ...s.accounts, [username]: { ...s.accounts[username], role: newRole } } };
      s = logAction(s, actingUser, `a changé le rôle de "${username}" → ${newRole === "owner" ? "propriétaire" : newRole === "coach" ? "staff" : "joueur"}`);
      break;
    }
    case "renameAccount": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { oldUsername, newUsername } = body;
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
    case "deletePlayer": {
      if (!isStaffRole(role)) return { error: "Réservé au coaching staff." };
      const { playerId } = body;
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
      s = { ...s, roster, presence, positions, lineups, accounts };
      const label = removed ? `${removed.prenom} ${removed.nom}` : playerId;
      s = logAction(s, actingUser, `a supprimé le joueur "${label}"${linkedUsername ? ` (et son compte "${linkedUsername}")` : ""}`);
      break;
    }

    default:
      return { error: "Action inconnue." };
  }

  await saveAppState(store, s);
  return { state: s };
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
  const store = getBlobStore();

  try {
    if (action === "getState") {
      const state = await loadAppState(store);
      return ok({ state: sanitize(state) });
    }

    if (action === "signup") return await doSignup(store, body);
    if (action === "login") return await doLogin(store, body);

    if (action === "logout") {
      if (token) await destroySession(store, token);
      return ok({ success: true });
    }

    const session = await requireSession(store, token);
    if (!session) return fail(401, "Session invalide, reconnecte-toi.");

    const state = await loadAppState(store);
    const result = await applyMutation(store, state, session, action, body);
    if (result.error) return fail(400, result.error);
    return ok({ state: sanitize(result.state) });
  } catch (e) {
    return fail(500, "Erreur serveur: " + e.message);
  }
}
