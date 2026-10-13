import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from "react";
import { callApi } from "./api.js";

const LOGO_DATA_URI = "data:image/jpeg;base64,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";

/* ------------------------------------------------------------------ */
/* Data seeded from the club's spreadsheet ("Saisie équipe" tab)       */
/* ------------------------------------------------------------------ */

const POSTES = [
  "Lanceur", "Catcher", "Première base", "Deuxième base", "Troisième base",
  "Arrêt-court", "Champ gauche", "Champ centre", "Champ droit",
  "Champ extérieur", "Utility", "Manager",
];

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

function getInnings(match) {
  return match.innings || emptyInnings();
}

function inningsTotal(arr) {
  return arr.reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0);
}

/* Returns "V" (victoire), "D" (défaite), or null if the match hasn't
   been scored yet or is still tied (extra innings needed). */
/* Au baseball, il n'y a pas de match nul : la partie continue en manches
   supplémentaires jusqu'à ce qu'un vainqueur se dégage. Si les totaux sont
   encore égaux, on considère donc le match comme non résolu (pas encore
   terminé) plutôt que "nul". */
function matchResult(m) {
  const innings = m.innings || emptyInnings();
  const played = innings.dragons.some((v) => typeof v === "number") || innings.adversaire.some((v) => typeof v === "number");
  if (!played) return null;
  const dTotal = inningsTotal(innings.dragons);
  const aTotal = inningsTotal(innings.adversaire);
  if (dTotal > aTotal) return "V";
  if (dTotal < aTotal) return "D";
  return null;
}

const FR_MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function parseFrenchDateSortValue(dateStr) {
  if (!dateStr) return null;
  const normalized = dateStr.toLowerCase().trim();
  const match = normalized.match(/(\d{1,2})\s*(?:er)?\s+([a-zéûôî]+)/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  if (Number.isNaN(day)) return null;
  const monthIdx = FR_MONTHS.findIndex((m) => normalized.includes(m) || m.startsWith(match[2]));
  if (monthIdx === -1) return null;
  return monthIdx * 100 + day;
}

const STATUTS = [
  { value: "present", label: "Présent" },
  { value: "absent", label: "Absent" },
  { value: "reserve", label: "Sous réserve" },
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

const STAFF_ROLES = ["coach", "owner"];
export const APP_VERSION = "3.1"; // garder identique à public/version.js
function homeScreen(role) {
  return isStaffRole(role) || role === "scorer" ? "composition" : "player";
}
function isStaffRole(role) {
  return STAFF_ROLES.includes(role);
}

/* ---------------- V3 · équipes du club et droits (calculés par le serveur) ---------------- */
const SQUAD_KEY = "dragons-squad";
const LAYOUT_KEY = "dragons-layout";
function canSqC(access, sq, what) {
  return !!(access && access.squads && access.squads[sq] && access.squads[sq][what]);
}
function canAnyC(access, what) {
  return !!access && Object.values(access.squads || {}).some((x) => x[what]);
}
function canPlayerC(state, access, pid, what) {
  if (!access) return false;
  if (access.owner) return true;
  const sqs = Object.keys(((state && state.members) || {})[pid] || {});
  if (!sqs.length) return canAnyC(access, what);
  return sqs.some((sq) => canSqC(access, sq, what));
}
function canDeletePlayerC(state, access, pid) {
  if (!access) return false;
  if (access.owner) return true;
  const sqs = Object.keys(((state && state.members) || {})[pid] || {});
  if (!sqs.length) return canAnyC(access, "roster");
  return sqs.every((sq) => canSqC(access, sq, "roster"));
}
function squadById(state, id) {
  return ((state && state.squads) || []).find((q) => q.id === id) || null;
}
function SquadChip({ squad, small }) {
  if (!squad) return null;
  return (
    <span className={"squad-chip" + (small ? " small" : "")} style={{ "--sq": squad.color }}>
      <i aria-hidden="true" />{squad.name}
    </span>
  );
}
/* Joueurs d'une équipe : habituels, renforts possibles ; « appelés » pour un match. */
function memberOf(state, pid, sq) {
  return ((state.members || {})[pid] || {})[sq] || "";
}
function calledFor(state, matchId, pid) {
  return ((state.callups || {})[matchId] || {})[pid] || null;
}
function readStore(k, def) {
  try { return window.localStorage.getItem(k) || def; } catch (e) { return def; }
}
function writeStore(k, v) {
  try { window.localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ }
}
/* Mode d'affichage propre à l'appareil : auto / téléphone / tablette / ordinateur */
function useLayout() {
  const [mode, setModeState] = useState(() => readStore(LAYOUT_KEY, "auto"));
  const [w, setW] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 400));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const eff = mode === "auto" ? (w >= 1100 ? "desktop" : w >= 720 ? "tablet" : "phone") : mode;
  function setMode(v) { writeStore(LAYOUT_KEY, v); setModeState(v); }
  return { mode, eff, setMode };
}
const LAYOUT_LABELS = [["auto", "Auto"], ["phone", "Téléphone"], ["tablet", "Tablette"], ["desktop", "Ordinateur"]];
function LayoutPicker({ layout, compact }) {
  return (
    <div className={"layout-picker" + (compact ? " compact" : "")} role="radiogroup" aria-label="Affichage">
      {LAYOUT_LABELS.map(([k, l]) => (
        <button key={k} role="radio" aria-checked={layout.mode === k} className={"lp-btn" + (layout.mode === k ? " on" : "")} onClick={() => layout.setMode(k)}>{l}</button>
      ))}
    </div>
  );
}

/* Field positions used for the defensive lineup diagram (excludes
   Utility / Manager, which aren't a spot on the field). Coordinates are
   in a 0-100 viewBox shared with the SVG diamond drawing. */
/* Rows are spaced generously apart (each row's circle + name tag needs
   roughly 20 vertical units of clearance) so that no two labels can ever
   touch, even with the longest names the truncation allows. */
const FIELD_POSITIONS = [
  { key: "Champ centre", short: "CF", x: 50, y: 14 },
  { key: "Champ gauche", short: "LF", x: 20, y: 38 },
  { key: "Champ droit", short: "RF", x: 80, y: 38 },
  { key: "Arrêt-court", short: "SS", x: 27, y: 62 },
  { key: "Deuxième base", short: "2B", x: 73, y: 62 },
  { key: "Troisième base", short: "3B", x: 20, y: 86 },
  { key: "Première base", short: "1B", x: 80, y: 86 },
  { key: "Lanceur", short: "P", x: 50, y: 110 },
  { key: "Catcher", short: "C", x: 50, y: 134 },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
/* All password hashing, secret codes, and state persistence now live
   exclusively server-side in netlify/functions/api.js. This file only
   talks to that API — it never touches raw storage or secrets. */

const TOKEN_STORAGE_KEY = "dragons-session-token";

/* Saisons : la liste officielle vient du serveur (state.seasons) et la saison
   en cours (state.currentSeason) sert de filtre par défaut dans tous les onglets. */
const SeasonContext = createContext({ seasons: [], current: CURRENT_SEASON });
function useSeasonList(items) {
  const ctx = useContext(SeasonContext);
  return useMemo(() => {
    const set = new Set(ctx.seasons || []);
    (items || []).forEach((m) => set.add(m.season || "—"));
    const list = Array.from(set).sort((a, b) => b.localeCompare(a));
    list.current = list.includes(ctx.current) ? ctx.current : list[0];
    return list;
  }, [items, ctx.seasons, ctx.current]);
}

function getLineup(state, matchId) {
  const l = (state.lineups || {})[matchId] || { defense: {}, batting: [] };
  const batting = Array.from({ length: 9 }, (_, i) => (l.batting || [])[i] || "");
  return { ...l, defense: l.defense || {}, batting };
}

/* ------------------------------------------------------------------ */
/* Small UI atoms                                                      */
/* ------------------------------------------------------------------ */

function DebouncedInput({ value, onCommit, ...props }) {
  const [local, setLocal] = useState(value ?? "");
  useEffect(() => {
    setLocal(value ?? "");
  }, [value]);
  // Number inputs are usually adjusted with the little spinner arrows,
  // which don't reliably trigger a blur event. Committing immediately for
  // numbers avoids other parts of the UI (like PCT/GB) computing off a
  // stale, not-yet-saved value. Text inputs still commit on blur/Enter to
  // avoid a network call per keystroke.
  const isNumber = props.type === "number";
  return (
    <input
      {...props}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        if (isNumber) onCommit(e.target.value);
      }}
      onBlur={() => {
        if (!isNumber && local !== (value ?? "")) onCommit(local);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.target.blur();
      }}
    />
  );
}

function StatusPill({ value }) {
  const map = {
    present: { bg: "var(--ok)", label: "Présent" },
    absent: { bg: "var(--bad)", label: "Absent" },
    reserve: { bg: "var(--warn)", label: "Sous réserve" },
  };
  const s = map[value];
  if (!s) return <span className="pill pill-empty">—</span>;
  return (
    <span className="pill" style={{ background: s.bg }}>
      {s.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Main App                                                            */
/* ------------------------------------------------------------------ */

export default function DragonsApp() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null); // { username, playerId, role }
  const [authToken, setAuthToken] = useState(null);
  const [screen, setScreen] = useState("login"); // login | signup | player | coach
  const [busy, setBusy] = useState(false);
  const busyRef = React.useRef(false);

  useEffect(() => {
    let storedToken = null;
    try {
      storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      /* localStorage unavailable (private browsing, etc.) — proceed logged out */
    }
    callApi({ action: "getState", token: storedToken || undefined })
      .then((res) => {
        setState(res.state);
        if (res.session && storedToken) {
          setAuthToken(storedToken);
          setSession({
            username: res.session.username,
            role: res.session.role,
            playerId: res.session.playerId,
          });
          setScreen(homeScreen(res.session.role));
        }
        setLoading(false);
      })
      .catch((e) => {
        setError("Impossible de charger les données. Réessaie dans un instant.");
        setLoading(false);
      });
  }, []);

  // Données toujours fraîches : rechargement quand on revient sur l'appli et toutes les 2 min
  // (résultats saisis depuis la feuille de match, nouvelle compo, présences des autres…)
  const tokenRef = React.useRef(null);
  tokenRef.current = authToken;
  useEffect(() => {
    let last = Date.now();
    async function refresh(force) {
      if (document.visibilityState !== "visible" || busyRef.current) return;
      if (!force && Date.now() - last < 30000) return;
      last = Date.now();
      try {
        const res = await callApi({ action: "getState", token: tokenRef.current || undefined });
        if (res && res.state) setState(res.state);
        // droits changés par le propriétaire entre-temps : on suit sans se reconnecter
        if (res && res.session) setSession((cur) => (cur && cur.username === res.session.username ? { ...cur, role: res.session.role } : cur));
      } catch (e) { /* hors ligne : on garde l'affichage */ }
    }
    const onVis = () => refresh(false);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    const iv = setInterval(() => refresh(true), 2 * 60 * 1000);
    return () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", onVis); clearInterval(iv); };
  }, []);

  /* Every data-changing action goes through the server API. The server
     verifies the session token and the caller's role before doing
     anything — the client never computes permissions or touches raw
     storage itself. */
  async function callMutation(action, payload) {
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const res = await callApi({ action, token: authToken, ...payload });
      setState(res.state);
      if (res.newToken) {
        setAuthToken(res.newToken);
        try {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, res.newToken);
        } catch (e) {
          /* ignore storage errors */
        }
      }
      return true;
    } catch (e) {
      setError(e.message || "Une erreur est survenue. Réessaie.");
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  /* ---------------- Auth actions ---------------- */

  async function doSignup(form) {
    setBusy(true);
    setError("");
    try {
      if (form.password !== form.password2 && form.password2 !== undefined) {
        // handled by the form itself, but double-check defensively
      }
      const res = await callApi({
        action: "signup",
        password: form.password,
        playerId: form.playerId,
        newNom: form.newNom,
        newPrenom: form.newPrenom,
        isStaff: form.isStaff,
        staffCode: form.staffCode,
        isOwner: form.isOwner,
        ownerCode: form.ownerCode,
        live: form.live,
      });
      setState(res.state);
      setAuthToken(res.token);
      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      } catch (e) {
        /* ignore storage errors */
      }
      setSession({ username: res.username, playerId: res.playerId, role: res.role });
      setScreen(homeScreen(res.role));
    } catch (e) {
      setError(e.message || "Une erreur est survenue. Réessaie.");
    } finally {
      setBusy(false);
    }
  }

  async function doLogin(username, password) {
    setBusy(true);
    setError("");
    try {
      const res = await callApi({ action: "login", username, password });
      applyLogin(res);
    } catch (e) {
      setError(e.message || "Une erreur est survenue. Réessaie.");
    } finally {
      setBusy(false);
    }
  }

  function applyLogin(res) {
    setState(res.state);
    setAuthToken(res.token);
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    } catch (e) {
      /* ignore storage errors */
    }
    setSession({ username: res.username, playerId: res.playerId, role: res.role });
    setScreen(homeScreen(res.role));
  }
  // Lien « mot de passe oublié » : on arrive déconnecté sur l'écran du nouveau mot de passe
  const [resetTok, setResetTok] = useState(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("reset") || "";
      if (t) window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      return t;
    } catch (e) { return ""; }
  });
  function endReset() {
    setResetTok("");
    try { window.history.replaceState(null, "", window.location.pathname); } catch (e) { /* ignore */ }
  }

  async function doLogout() {
    try {
      await callApi({ action: "logout", token: authToken });
    } catch (e) {
      /* ignore — we're logging out client-side regardless */
    }
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    setAuthToken(null);
    setSession(null);
    setScreen("login");
    setError("");
  }

  /* ---------------- Player actions ---------------- */

  async function setPresence(playerId, matchId, statusValue) {
    await callMutation("setPresence", { playerId, matchId, statusValue });
  }

  async function setVehicule(playerId, matchId, value) {
    await callMutation("setVehicule", { playerId, matchId, value });
  }

  async function setPosition(playerId, slot, value) {
    await callMutation("setPosition", { playerId, slot, value });
  }

  async function setNumero(playerId, value) {
    await callMutation("setNumero", { playerId, value });
  }

  /* ---------------- Coach lineup actions ---------------- */

  async function setDefenseSlot(matchId, posteKey, playerId) {
    await callMutation("setDefenseSlot", { matchId, posteKey, playerId });
  }

  async function setBattingSlot(matchId, index, playerId) {
    await callMutation("setBattingSlot", { matchId, index, playerId });
  }

  /* ---------------- Match / results / standings actions ---------------- */

  async function updateMatchField(matchId, field, value) {
    await callMutation("updateMatchField", { matchId, field, value });
  }

  async function addSeason(season, makeCurrent) {
    return callMutation("addSeason", { season, makeCurrent });
  }

  async function setCurrentSeason(season) {
    return callMutation("setCurrentSeason", { season });
  }

  async function addMatch(season) {
    await callMutation("addMatch", { season });
  }

  async function deleteMatch(matchId) {
    await callMutation("deleteMatch", { matchId });
  }

  async function reorderMatches(orderedIds) {
    await callMutation("reorderMatches", { orderedIds });
  }

  async function setInning(matchId, team, inningIndex, value) {
    await callMutation("setInning", { matchId, team, inningIndex, value });
  }

  async function addTeam(season) {
    await callMutation("addTeam", { season });
  }

  async function updateTeamField(teamId, field, value) {
    await callMutation("updateTeamField", { teamId, field, value });
  }

  async function deleteTeam(teamId) {
    await callMutation("deleteTeam", { teamId });
  }

  /* ---------------- Account management actions ---------------- */

  async function doResetPassword(username, newPassword) {
    return callMutation("resetPassword", { username, newPassword });
  }

  async function doDeleteAccount(username) {
    const ok = await callMutation("deleteAccount", { username });
    if (ok && session && session.username === username) {
      doLogout();
    }
    return ok;
  }

  async function doSetAccountRole(username, newRole) {
    const ok = await callMutation("setAccountRole", { username, newRole });
    if (ok && session && session.username === username) {
      setSession({ ...session, role: newRole });
    }
    return ok;
  }

  async function doRenameAccount(oldUsername, newUsername) {
    const ok = await callMutation("renameAccount", { oldUsername, newUsername });
    if (ok && session && session.username === oldUsername) {
      setSession({ ...session, username: newUsername.trim().toLowerCase() });
    }
    return ok;
  }

  async function updatePlayerField(playerId, field, value) {
    await callMutation("updatePlayerField", { playerId, field, value });
  }

  async function deletePlayer(playerId) {
    const ok = await callMutation("deletePlayer", { playerId });
    if (ok && session && session.playerId === playerId) {
      doLogout();
    }
    return ok;
  }

  /* ---------------- Derived ---------------- */


  // Mise à jour automatique : si une nouvelle version est en ligne (onglet resté ouvert,
  // appli installée sur l'écran d'accueil…), on recharge la page une fois.
  useEffect(() => {
    let stop = false;
    async function check() {
      try {
        const txt = await (await fetch("/version.js?t=" + Date.now(), { cache: "no-store" })).text();
        const m = /DRAGONS_VERSION\s*=\s*"([^"]+)"/.exec(txt);
        if (!stop && m && m[1] !== APP_VERSION) {
          const k = "dragons-reloaded-" + m[1];
          if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, "1"); window.location.reload(); }
        }
      } catch (e) { /* hors ligne : on réessaiera */ }
    }
    check();
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    const iv = setInterval(check, 10 * 60 * 1000);
    return () => { stop = true; document.removeEventListener("visibilitychange", onVis); clearInterval(iv); };
  }, []);

  const me = useMemo(() => {
    if (!state || !session) return null;
    return state.roster.find((p) => p.id === session.playerId) || null;
  }, [state, session]);

  const layout = useLayout();
  const [squadPick, setSquadPick] = useState(() => readStore(SQUAD_KEY, ""));
  function pickSquad(v) { writeStore(SQUAD_KEY, v); setSquadPick(v); }

  /* ---------------- Render ---------------- */

  if (loading) {
    return (
      <div className="dragons-app">
        <style>{CSS}</style>
        <div className="center-screen">Chargement…</div>
      </div>
    );
  }

  const seasonCtx = { seasons: state.seasons || [], current: state.currentSeason || CURRENT_SEASON };
  const access = (session && state.access) || null;
  const squads = state.squads || [];
  const multi = squads.length > 1;
  const isTest = !!(access && access.space === "test");
  // Équipe affichée : choix mémorisé sur l'appareil, sinon l'équipe où on a un rôle, sinon celle dont on fait partie
  const defaultSq = (() => {
    if (!access) return squads[0] ? squads[0].id : "all";
    const staffSq = squads.find((q) => access.squads[q.id] && access.squads[q.id].role !== "trainer" && access.squads[q.id].role !== "owner");
    if (staffSq) return staffSq.id;
    const reg = squads.find((q) => access.member[q.id] === "reg") || squads.find((q) => access.member[q.id]);
    if (reg) return reg.id;
    return access.owner && squads[0] ? squads[0].id : "all";
  })();
  // Équipes proposées dans la barre : celles où on a un rôle (ou la casquette entraîneur) et celles où on joue
  const visSquads = !access ? [] : squads.filter((q) => access.owner || access.squads[q.id] || access.member[q.id]);
  const squadSel = !multi ? (squads[0] ? squads[0].id : "all") : squadPick === "all" || visSquads.some((q) => q.id === squadPick) ? squadPick : visSquads.some((q) => q.id === defaultSq) ? defaultSq : "all";
  const inSq = (m) => squadSel === "all" || m.squad === squadSel;
  const sqMatches = state.matches.filter(inSq);
  const staffLike = !!session && (isStaffRole(session.role) || (access && access.trainer));
  const canManage = canAnyC(access, "manage");
  const isScorerOnly = !!session && session.role === "scorer";

  // Rubriques visibles selon les droits (le serveur revérifie chaque action)
  const nav = !session ? [] : [
    me && !isScorerOnly ? { key: "player", label: "Ma présence" } : null,
    { key: "composition", label: "Composition" },
    staffLike ? { key: "coach", label: "Suivi" } : null,
    staffLike && (multi || canAnyC(access, "roster")) ? { key: "members", label: "Joueurs" } : null,
    canManage ? { key: "matches", label: "Matchs" } : null,
    { key: "roster", label: "Présences" },
    { key: "results", label: "Résultats" },
    { key: "standings", label: "Classement" },
    { key: "history", label: "Historique" },
    access && access.owner ? { key: "admin", label: "Administration" } : null,
    canAnyC(access, "compo") ? { key: "x-compo", label: "Compo & changements", href: "/compo/" } : null,
    canAnyC(access, "sheet") || canAnyC(access, "scorer") || (access && access.trainer) ? { key: "x-match", label: isScorerOnly ? "Feuille de match & adversaires" : "Feuille de match", href: "/match/" } : null,
    canAnyC(access, "scout") || (access && access.trainer) ? { key: "x-scout", label: "Adversaires", href: "/scout/" } : null,
  ].filter(Boolean);
  const navBtn = (it, cls) => it.href
    ? <a key={it.key} className={cls} href={it.href} style={{ textDecoration: "none" }}>{it.label}</a>
    : <button key={it.key} className={cls + (screen === it.key ? " active" : "")} onClick={() => setScreen(it.key)}>{it.label}</button>;
  const squadBar = session && multi && visSquads.length ? (
    <div className="squad-bar" role="tablist" aria-label="Équipe affichée">
      {visSquads.map((q) => (
        <button key={q.id} role="tab" aria-selected={squadSel === q.id} className={"sq-tab" + (squadSel === q.id ? " on" : "")} style={{ "--sq": q.color }} onClick={() => pickSquad(q.id)}>
          <i aria-hidden="true" />{q.name}
        </button>
      ))}
      <button role="tab" aria-selected={squadSel === "all"} className={"sq-tab" + (squadSel === "all" ? " on" : "")} onClick={() => pickSquad("all")}>Tout le club</button>
    </div>
  ) : null;
  const who = session ? (me ? `${me.prenom} ${me.nom}` : session.username) + (isScorerOnly ? " · scoreuse" : session.role === "owner" ? " · propriétaire" : "") : "";
  const desktop = session && layout.eff === "desktop";
  const multiCol = ["player", "coach", "roster", "history", "admin", "matches", "composition", "members"].includes(screen);
  const cols = layout.eff === "desktop" ? 3 : layout.eff === "tablet" ? 2 : 1;
  const sqProps = { squads, squadSel, access };

  return (
    <SeasonContext.Provider value={seasonCtx}>
    <div className={"dragons-app lay-" + layout.eff + (desktop ? " with-side" : "")}>
      <style>{CSS}</style>
      {isTest && (
        <div className="test-banner" role="status"><b>MODE TEST</b> · rien de ce que tu fais ici ne touche les vraies données du club.</div>
      )}

      {desktop ? (
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-emblem"><img src={LOGO_DATA_URI} alt="Logo Dragons de Ronchin" /></span>
            <div>
              <div className="brand-title">DRAGONS</div>
              <div className="brand-sub">{who}</div>
            </div>
          </div>
          {multi && (
            <div className="side-sec">
              <div className="side-label">Équipe</div>
              {squadBar}
            </div>
          )}
          <nav className="side-nav" aria-label="Rubriques">
            {nav.filter((x) => !x.href).map((it) => navBtn(it, "side-link"))}
            <div className="side-sep" />
            {nav.filter((x) => x.href).map((it) => navBtn(it, "side-link ext"))}
          </nav>
          <div className="side-bottom">
            <div className="side-label">Affichage</div>
            <LayoutPicker layout={layout} compact />
            <button className="btn-ghost small" style={{ marginTop: 10, width: "100%" }} onClick={doLogout}>Déconnexion</button>
          </div>
        </aside>
      ) : (
      <header className="topbar">
        <div className="brand">
          <span className="brand-emblem"><img src={LOGO_DATA_URI} alt="Logo Dragons de Ronchin" /></span>
          <div>
            <div className="brand-title">DRAGONS DE RONCHIN</div>
            <div className="brand-sub">Feuille de présence</div>
          </div>
        </div>
        {session && (
          <div className="topbar-right">
            <div className="tab-switch">
              {nav.map((it) => navBtn(it, "tsw"))}
            </div>
            <span className="who">{who}</span>
            <button className="btn-ghost" onClick={doLogout}>
              Déconnexion
            </button>
          </div>
        )}
        {squadBar && <div className="squad-row">{squadBar}</div>}
      </header>
      )}

      <main className={"content" + (session && multiCol && cols > 1 ? " cols-" + cols : "")}>
        {!session && resetTok && (
          <ResetPasswordView token={resetTok} onDone={(res) => { endReset(); applyLogin(res); }} onCancel={endReset} />
        )}

        {!session && !resetTok && screen === "login" && (
          <LoginView
            onLogin={doLogin}
            onGoSignup={() => { setError(""); setScreen("signup"); }}
            error={error}
            busy={busy}
          />
        )}

        {!session && screen === "signup" && (
          <SignupView
            roster={state.roster}
            claimedPlayerIds={state.claimedPlayerIds}
            onSubmit={doSignup}
            onGoLogin={() => { setError(""); setScreen("login"); }}
            error={error}
            busy={busy}
          />
        )}

        {session && error && <div className="error card wide" role="alert">{error}</div>}

        {session && screen === "player" && me && (
          <PlayerView
            token={authToken}
            player={me}
            state={state}
            {...sqProps}
            matches={state.matches}
            presence={state.presence[me.id] || {}}
            positions={state.positions[me.id] || {}}
            onSetPresence={(matchId, v, why) => callMutation("setPresence", { playerId: me.id, matchId, statusValue: v, why })}
            onAnswerCall={(matchId, ans) => callMutation("answerCallUp", { matchId, ans })}
            onSetVehicule={(matchId, v) => setVehicule(me.id, matchId, v)}
            onSetPosition={(slot, v) => setPosition(me.id, slot, v)}
            onSetNumero={(v) => setNumero(me.id, v)}
            onSetLiveConsent={(v) => callMutation("setLiveConsent", { playerId: me.id, ...v })}
            onSetMailPrefs={(v) => callMutation("setMailPrefs", { playerId: me.id, ...v })}
            onChangePassword={(newPassword) => doResetPassword(session.username, newPassword)}
            layout={layout}
            busy={busy}
          />
        )}
        {session && screen === "player" && !me && (
          <div className="card"><h2>Affichage</h2><LayoutPicker layout={layout} /></div>
        )}

        {session && screen === "roster" && staffLike && (
          <RelanceCard state={state} {...sqProps} />
        )}

        {session && screen === "roster" && staffLike && (
          <LiveLinkCard test={isTest} />
        )}

        {session && screen === "roster" && (
          <PresenceRosterView state={state} {...sqProps} />
        )}

        {session && screen === "results" && (
          <ResultsView
            matches={sqMatches}
            squads={multi && squadSel === "all" ? squads : null}
            canEditMatch={(m) => canSqC(access, m.squad, "sheet") || canSqC(access, m.squad, "manage")}
            onSetInning={(matchId, team, idx, value) => setInning(matchId, team, idx, value)}
          />
        )}

        {session && screen === "standings" && (
          <StandingsView
            standings={(state.standings || []).filter((t) => squadSel === "all" || t.squad === squadSel)}
            squads={squads}
            showSquad={multi && squadSel === "all"}
            canEditTeam={(t) => canSqC(access, t.squad, "manage")}
            canAdd={squadSel !== "all" ? canSqC(access, squadSel, "manage") : canManage}
            onUpdateField={(teamId, field, value) => updateTeamField(teamId, field, value)}
            onAddTeam={(season) => callMutation("addTeam", { season, squad: squadSel !== "all" ? squadSel : undefined })}
            onDeleteTeam={(teamId) => deleteTeam(teamId)}
            busy={busy}
          />
        )}

        {session && screen === "history" && (
          <HistoryView matches={sqMatches} lineups={state.lineups} roster={state.roster} token={authToken} myId={session.playerId} squadSel={multi ? squadSel : "all"} squads={squads} />
        )}

        {session && screen === "coach" && staffLike && (
          <CoachView
            state={state}
            {...sqProps}
            actingUser={session.username}
            onSetPresence={(playerId, matchId, v) => setPresence(playerId, matchId, v)}
            onCallUp={(matchId, playerId) => callMutation("callUp", { matchId, playerId })}
            onCancelCallUp={(matchId, playerId) => callMutation("cancelCallUp", { matchId, playerId })}
            onResetPassword={(username, newPassword) => doResetPassword(username, newPassword)}
            onDeleteAccount={(username) => doDeleteAccount(username)}
            onSetAccountRole={(username, role) => doSetAccountRole(username, role)}
            onCreateAccount={(data) => callMutation("createAccount", data)}
            onRenameAccount={(oldU, newU) => doRenameAccount(oldU, newU)}
            onDeletePlayer={(playerId) => deletePlayer(playerId)}
            onUpdatePlayerField={(playerId, field, value) => updatePlayerField(playerId, field, value)}
            onSetLiveConsent={(playerId, v) => callMutation("setLiveConsent", { playerId, ...v })}
            currentUsername={session.username}
            currentPlayerId={session.playerId}
            currentRole={session.role}
            busy={busy}
          />
        )}

        {session && screen === "members" && staffLike && (
          <MembersView state={state} {...sqProps} busy={busy}
            onSetMember={(playerId, squad, value) => callMutation("setMember", { playerId, squad, value })} />
        )}

        {session && screen === "admin" && access && access.owner && (
          <AdminView state={state} token={authToken} busy={busy} isTest={isTest}
            onSaveSquad={(q) => callMutation("saveSquad", q)}
            onDeleteSquad={(id) => callMutation("deleteSquad", { id })}
            onSetAccess={(username, v) => callMutation("setAccountAccess", { username, ...v })}
            onCreateAccount={(data) => callMutation("createAccount", data)}
            onRestored={(st) => setState(st)} />
        )}

        {session && screen === "composition" && (
          <LineupView state={state} {...sqProps} isStaff={staffLike} scorer={isScorerOnly} token={authToken} />
        )}

        {session && screen === "matches" && canManage && (
          <MatchesView
            token={authToken}
            matches={state.matches.filter((m) => inSq(m) && canSqC(access, m.squad, "manage"))}
            squads={squads}
            squadSel={squadSel}
            access={access}
            onAddSeason={addSeason}
            onSetCurrentSeason={setCurrentSeason}
            onUpdateField={(matchId, field, value) => updateMatchField(matchId, field, value)}
            onAddMatch={(season, squad) => callMutation("addMatch", { season, squad })}
            onDeleteMatch={(matchId) => deleteMatch(matchId)}
            onReorderMatches={(orderedIds) => reorderMatches(orderedIds)}
            busy={busy}
          />
        )}
      </main>

      <footer className="foot">
        Données partagées entre les membres connectés à cette application. Ce n'est pas un
        système d'authentification de niveau professionnel — évite de réutiliser un mot de
        passe important.
        <div style={{ marginTop: 4, opacity: 0.7 }}>Version {APP_VERSION}</div>
      </footer>
    </div>
    </SeasonContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

function LoginView({ onLogin, onGoSignup, error, busy }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [forgot, setForgot] = useState(false);

  return (
    <div className="card auth-card">
      <h2>Connexion</h2>
      <label className="field">
        <span>Identifiant</span>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex: prénom.nom" />
      </label>
      <label className="field">
        <span>Mot de passe</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <div className="error">{error}</div>}
      <button
        className="btn-primary"
        disabled={busy}
        onClick={() => onLogin(username, password)}
      >
        {busy ? "…" : "Se connecter"}
      </button>
      <button className="btn-link" onClick={onGoSignup}>
        Pas encore de compte ? Créer un compte
      </button>
      {!forgot ? (
        <button className="btn-link forgot-link" onClick={() => setForgot(true)}>Mot de passe oublié ?</button>
      ) : (
        <ForgotPasswordBox initial={username} onClose={() => setForgot(false)} />
      )}
    </div>
  );
}

function ForgotPasswordBox({ initial, onClose }) {
  const [ident, setIdent] = useState(initial || "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  async function send() {
    setErr(""); setMsg(""); setSending(true);
    try {
      const r = await callApi({ action: "forgotPassword", ident });
      setMsg(r.message || "Si un compte correspond, un lien vient d'être envoyé.");
    } catch (e) {
      setErr(e.message || "Erreur, réessaie.");
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="forgot-box">
      <div className="forgot-title">Mot de passe oublié</div>
      <div className="hint" style={{ margin: "0 0 8px" }}>Tape ton identifiant ou l'adresse mail de ton compte (Mon compte › Mails du club). Tu recevras un lien pour choisir un nouveau mot de passe.</div>
      <input value={ident} onChange={(e) => setIdent(e.target.value)} placeholder="identifiant ou adresse mail" onKeyDown={(e) => e.key === "Enter" && ident.trim() && send()} />
      {msg && <div className="ok-msg" style={{ marginTop: 8 }}>{msg}</div>}
      {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
      <div className="forgot-actions">
        <button className="btn-primary small" disabled={sending || !ident.trim()} onClick={send}>{sending ? "Envoi…" : "Recevoir le lien"}</button>
        <button className="btn-ghost small" onClick={onClose}>Fermer</button>
      </div>
      <div className="hint" style={{ marginTop: 8 }}>Pas d'adresse mail dans ton compte ? Demande au coaching staff de réinitialiser ton mot de passe.</div>
    </div>
  );
}

function ResetPasswordView({ token, onDone, onCancel }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    setErr("");
    if (pw.length < 6) return setErr("Au moins 6 caractères.");
    if (pw !== pw2) return setErr("Les deux mots de passe ne sont pas identiques.");
    setBusy(true);
    try {
      const res = await callApi({ action: "resetWithToken", resetToken: token, newPassword: pw });
      onDone(res);
    } catch (e) {
      setErr(e.message || "Erreur, réessaie.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="card auth-card">
      <h2>Nouveau mot de passe</h2>
      <label className="field"><span>Nouveau mot de passe</span><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></label>
      <label className="field"><span>Confirmer</span><input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" onKeyDown={(e) => e.key === "Enter" && submit()} /></label>
      {err && <div className="error">{err}</div>}
      <button className="btn-primary" disabled={busy} onClick={submit}>{busy ? "…" : "Enregistrer et me connecter"}</button>
      <button className="btn-link" onClick={onCancel}>Retour à la connexion</button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Signup                                                              */
/* ------------------------------------------------------------------ */

function slugUsernamePreview(prenom, nom) {
  const clean = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  return clean(prenom) + clean(nom);
}

/* ---------------- Accord d'affichage sur le live (RGPD) ---------------- */
function LiveConsentFields({ value, onChange, mode = "self" }) {
  const v = value || {};
  const staff = mode === "staff";
  return (
    <div className="consent-box">
      <div className="consent-title">📺 Suivi des matchs en direct</div>
      <p className="hint" style={{ marginTop: 0 }}>
        Pendant les matchs, une page publique (<b>/live</b>) affiche le score et les actions de jeu.
        {staff ? " Avec l'accord du joueur, son prénom et son nom peuvent y apparaître." : " Avec ton accord, ton prénom et ton nom peuvent y apparaître."}
      </p>
      {[
        ["adult", staff ? "Joueur majeur" : "Je suis majeur", staff ? "il donne son accord pour que son nom et son prénom apparaissent sur le live." : "je donne mon accord pour que mon nom et mon prénom apparaissent sur le live."],
        ["minor", staff ? "Joueur mineur" : "Je suis mineur", staff ? "il a l'accord de ses parents pour que son nom et son prénom apparaissent sur le live." : "j'ai l'accord de mes parents pour que mon nom et mon prénom apparaissent sur le live."],
        ["refused", staff ? "Refus" : "Je refuse", staff ? "seul son numéro de maillot apparaît sur le live." : "seul mon numéro de maillot apparaîtra sur le live."],
      ].map(([k, t, d]) => (
        <label className="checkbox-row" key={k}>
          <input type="checkbox" checked={liveChoice(v) === k}
            onChange={(e) => onChange(e.target.checked ? { ok: k !== "refused", minor: k === "minor", refused: k === "refused", parent: "" } : { ok: false, minor: false, refused: false, parent: "" })} />
          <span><b>{t}</b> : {d}</span>
        </label>
      ))}
      <div className="hint" style={{ marginTop: 4 }}>
        {staff ? "Sans réponse, seul son numéro de maillot est affiché." : "Sans réponse, il n'y aura que ton numéro de maillot. Tu peux changer d'avis à tout moment dans « Mon compte »."}
      </div>
    </div>
  );
}
/* Accord live : "adult" | "minor" (accord des parents) | "refused" | "" (pas encore répondu) */
function liveChoice(live) {
  if (!live) return "";
  if (live.ok) return live.minor ? "minor" : "adult";
  return live.refused ? "refused" : "";
}
function liveConsentLabel(live) {
  return { adult: "Live : accord ✓", minor: "Live : accord parents ✓", refused: "Live : refus", "": "Live : sans réponse" }[liveChoice(live)];
}
function LiveConsentCard({ player, onSave, busy }) {
  const cur = player.live || {};
  const [v, setV] = useState({ ok: !!cur.ok, minor: !!cur.minor, refused: !!cur.refused });
  const [msg, setMsg] = useState("");
  const dirty = liveChoice(v) !== liveChoice(cur);
  return (
    <div className="card">
      <h2>Affichage sur le live</h2>
      <div className="hint" style={{ marginTop: 0, marginBottom: 8 }}>Actuellement : <b>{{ adult: "nom et prénom affichés", minor: "nom et prénom affichés (accord des parents)", refused: "refus · numéro de maillot seulement", "": "pas encore répondu · numéro de maillot seulement" }[liveChoice(cur)]}</b>{cur.at ? ` · depuis le ${cur.at.split("-").reverse().join("/")}` : ""}</div>
      <LiveConsentFields value={v} onChange={setV} />
      {msg && <div className="hint">{msg}</div>}
      <button className="btn-primary small" style={{ marginTop: 8 }} disabled={busy || !dirty}
        onClick={async () => { await onSave(v); setMsg("Enregistré."); }}>Enregistrer</button>
    </div>
  );
}

/* Mails du club (opt-in) : récap perso et/ou récap de l'équipe après chaque match */
function MailPrefsCard({ player, onSave, busy }) {
  const cur = player.mail || {};
  const [email, setEmail] = useState(cur.email || "");
  const [me, setMe] = useState(!!cur.me);
  const [team, setTeam] = useState(!!cur.team);
  const [msg, setMsg] = useState("");
  const valid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const dirty = email.trim().toLowerCase() !== (cur.email || "") || me !== !!cur.me || team !== !!cur.team;
  return (
    <div className="card">
      <h2>Mails du club</h2>
      <div className="hint" style={{ marginTop: 0, marginBottom: 10 }}>Tu ne reçois que ce que tu coches. Rien n'est coché par défaut, et tu peux changer d'avis quand tu veux.</div>
      <label className="mail-field">Ton adresse mail
        <input type="email" inputMode="email" autoComplete="email" value={email} placeholder="prenom.nom@exemple.fr" onChange={(e) => { setEmail(e.target.value); if (!e.target.value) { setMe(false); setTeam(false); } }} />
      </label>
      {!valid && <div className="hint" style={{ color: "var(--bad)" }}>Cette adresse n'a pas l'air valide.</div>}
      <label className={"mail-opt" + (email ? "" : " off")}>
        <input type="checkbox" checked={me} disabled={!email} onChange={(e) => setMe(e.target.checked)} />
        <span><b>Mes résultats après chaque match</b><br /><small>Ta ligne de stats et ta carte des frappes (où sont tombées tes balles)</small></span>
      </label>
      <label className={"mail-opt" + (email ? "" : " off")}>
        <input type="checkbox" checked={team} disabled={!email} onChange={(e) => setTeam(e.target.checked)} />
        <span><b>Le récap de l'équipe</b><br /><small>Score par manche, les tops du match et les stats de tout le monde</small></span>
      </label>
      {email && !me && !team && <div className="hint">Aucune case cochée : on garde ton adresse (elle sert pour le mot de passe oublié) mais tu ne recevras pas de récap.</div>}
      {msg && <div className="hint">{msg}</div>}
      <button className="btn-primary small" style={{ marginTop: 8 }} disabled={busy || !dirty || !valid}
        onClick={async () => { await onSave({ email: email.trim(), me, team }); setMsg("Enregistré."); }}>Enregistrer</button>
    </div>
  );
}

/* Suivi des accords live : qui a accepté, refusé, pas répondu */
function LiveConsentTracker({ roster, claimed, onEdit }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const groups = { adult: [], minor: [], refused: [], "": [] };
  (roster || []).forEach((p) => groups[liveChoice(p.live)].push(p));
  Object.values(groups).forEach((g) => g.sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom)));
  const META = [["adult", "Accord (majeur)", "ok"], ["minor", "Accord parents (mineur)", "ok"], ["refused", "Refus", "bad"], ["", "Sans réponse", "warn"]];
  const shown = filter === null ? [] : META.filter(([k]) => filter === "all" || k === filter);
  return (
    <div className="consent-track">
      <button className="consent-track-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="consent-track-title">Accords live</span>
        <span className="consent-track-counts">
          {META.map(([k, l, c]) => <span key={k} className={"ct-pill " + c}>{groups[k].length} {k === "" ? "sans réponse" : k === "refused" ? "refus" : k === "minor" ? "accord parents" : groups[k].length > 1 ? "majeurs" : "majeur"}</span>)}
        </span>
        <span className="recap-chev">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="consent-track-body">
          <div className="ct-filters">
            {[["", "Sans réponse"], ["refused", "Refus"], ["minor", "Parents"], ["adult", "Majeurs"], ["all", "Tous"]].map(([k, l]) => (
              <button key={k} className={"ct-filter" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          {shown.map(([k, l, c]) => (
            <div key={k} className="ct-group">
              <div className={"ct-group-title " + c}>{l} · {groups[k].length}</div>
              {groups[k].length === 0 && <div className="hint">Personne.</div>}
              {groups[k].map((p) => (
                <button key={p.id} className="ct-row" onClick={() => onEdit(p.id)}>
                  <span>{p.prenom} {p.nom}{p.numero ? <span className="recap-num"> #{p.numero}</span> : null}</span>
                  <span className="ct-note">{k === "" ? (claimed.has(p.id) ? "compte créé, pas répondu" : "pas encore de compte") : p.live && p.live.at ? `le ${p.live.at.split("-").reverse().join("/")}` : ""}</span>
                </button>
              ))}
            </div>
          ))}
          <div className="hint">Clique sur un joueur pour modifier son accord (accord papier, correction…). Sans réponse ou refus : seul le numéro de maillot apparaît sur le live.</div>
        </div>
      )}
    </div>
  );
}

function StaffLiveEditor({ player, onSave, onClose, busy }) {
  const cur = player.live || {};
  const [v, setV] = useState({ ok: !!cur.ok, minor: !!cur.minor, refused: !!cur.refused });
  return (
    <div className="staff-live-editor" onClick={(e) => e.stopPropagation()}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{player.prenom} {player.nom}</div>
      <LiveConsentFields value={v} onChange={setV} mode="staff" />
      {cur.at && <div className="hint" style={{ marginTop: 0 }}>Dernier changement le {cur.at.split("-").reverse().join("/")}{cur.by ? ` par ${cur.by}` : ""}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="btn-primary small" disabled={busy} onClick={() => onSave(v)}>Enregistrer</button>
        <button className="btn-ghost small" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}

function SignupView({ roster, claimedPlayerIds, onSubmit, onGoLogin, error, busy }) {
  const claimedIds = useMemo(
    () => new Set(claimedPlayerIds || []),
    [claimedPlayerIds]
  );
  const available = roster
    .filter((p) => !claimedIds.has(p.id))
    .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom));

  const [playerId, setPlayerId] = useState(available[0]?.id || "__new__");
  const [newNom, setNewNom] = useState("");
  const [newPrenom, setNewPrenom] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [staffCode, setStaffCode] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [ownerCode, setOwnerCode] = useState("");
  const [live, setLive] = useState({ ok: false });

  const ownerModeAvailable = useMemo(() => {
    try {
      return typeof window !== "undefined" && window.location.search.includes("owner");
    } catch (e) {
      return false;
    }
  }, []);

  const usernamePreview = useMemo(() => {
    if (playerId === "__new__") return slugUsernamePreview(newPrenom, newNom);
    const p = roster.find((r) => r.id === playerId);
    return p ? slugUsernamePreview(p.prenom, p.nom) : "";
  }, [playerId, newNom, newPrenom, roster]);

  const mismatch = password && password2 && password !== password2;

  return (
    <div className="card auth-card">
      <h2>Créer un compte</h2>

      <label className="field">
        <span>Qui es-tu ?</span>
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
        >
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} {p.prenom}
            </option>
          ))}
          <option value="__new__">— Je ne suis pas dans la liste —</option>
        </select>
      </label>

      {playerId === "__new__" && (
        <div className="row-2">
          <label className="field">
            <span>Nom</span>
            <input value={newNom} onChange={(e) => setNewNom(e.target.value)} />
          </label>
          <label className="field">
            <span>Prénom</span>
            <input value={newPrenom} onChange={(e) => setNewPrenom(e.target.value)} />
          </label>
        </div>
      )}

      <div className="username-preview">
        <span>Ton identifiant de connexion sera :</span>
        <strong>{usernamePreview || "—"}</strong>
        <span className="hint" style={{ margin: 0 }}>
          Généré automatiquement à partir de ton nom, sans espace ni accent — rien à taper.
        </span>
      </div>
      <div className="row-2">
        <label className="field">
          <span>Mot de passe</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="field">
          <span>Confirmer</span>
          <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
        </label>
      </div>
      {mismatch && <div className="error">Les mots de passe ne correspondent pas.</div>}

      {!isOwner && (
        <label className="checkbox-row">
          <input type="checkbox" checked={isStaff} onChange={(e) => setIsStaff(e.target.checked)} />
          <span>Je fais partie du coaching staff</span>
        </label>
      )}
      {isStaff && !isOwner && (
        <label className="field">
          <span>Code staff</span>
          <input value={staffCode} onChange={(e) => setStaffCode(e.target.value)} placeholder="Code fourni par le club" />
        </label>
      )}

      {ownerModeAvailable && (
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isOwner}
            onChange={(e) => {
              setIsOwner(e.target.checked);
              if (e.target.checked) setIsStaff(false);
            }}
          />
          <span>Compte propriétaire (accès restreint)</span>
        </label>
      )}
      {isOwner && (
        <label className="field">
          <span>Code propriétaire</span>
          <input value={ownerCode} onChange={(e) => setOwnerCode(e.target.value)} placeholder="Code confidentiel" />
        </label>
      )}

      <LiveConsentFields value={live} onChange={setLive} />

      {error && <div className="error">{error}</div>}

      <button
        className="btn-primary"
        disabled={busy || mismatch}
        onClick={() =>
          onSubmit({ playerId, newNom, newPrenom, password, isStaff, staffCode, isOwner, ownerCode, live })
        }
      >
        {busy ? "…" : "Créer mon compte"}
      </button>
      <button className="btn-link" onClick={onGoLogin}>
        J'ai déjà un compte
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Player view                                                         */
/* ------------------------------------------------------------------ */

const WHY = [["d3", "Je joue en D3"], ["blesse", "Blessé"], ["dispo", "Pas dispo"]];
function PlayerView({ token, player, state, squads, access, matches, presence, positions, onSetPresence, onAnswerCall, onSetVehicule, onSetPosition, onSetNumero, onSetLiveConsent, onSetMailPrefs, onChangePassword, layout, busy }) {
  const multi = (squads || []).length > 1;
  const mine = access ? access.member || {} : {};
  const inMySquad = (m) => !!mine[m.squad] || !!calledFor(state, m.id, player.id);
  const upcomingMatches = matches.filter(
    (m) => (m.season || CURRENT_SEASON) === CURRENT_SEASON && matchResult(m) === null && !m.cancelled && inMySquad(m)
  ).map((m, i) => ({ m, i, d: matchDateOf(m) }))
    .sort((a, b) => (a.d && b.d ? a.d - b.d : a.d ? -1 : b.d ? 1 : a.i - b.i)).map((x) => x.m);
  // Appels en renfort en attente de réponse
  const calls = matches.filter((m) => !m.cancelled && matchResult(m) === null && (calledFor(state, m.id, player.id) || {}).ans === "");
  const mySquads = (squads || []).filter((q) => mine[q.id]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const pwMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  async function handleChangePassword() {
    setPwMsg("");
    setPwError("");
    if (!newPassword || newPassword.length < 6) {
      setPwError("Le nouveau mot de passe doit faire au moins 6 caractères.");
      return;
    }
    if (pwMismatch) {
      setPwError("Les mots de passe ne correspondent pas.");
      return;
    }
    const success = await onChangePassword(newPassword);
    if (success) {
      setNewPassword("");
      setConfirmPassword("");
      setPwMsg("Mot de passe mis à jour.");
    } else {
      setPwError("Une erreur est survenue. Réessaie.");
    }
  }

  return (
    <div>
      {calls.map((m) => {
        const c = calledFor(state, m.id, player.id);
        const q = squadById(state, m.squad);
        return (
          <div className="card call-card" key={"call-" + m.id}>
            <div className="call-tag">APPEL EN RENFORT{c.by ? <span> · par {c.by}</span> : null}</div>
            <div className="call-title">{q ? <>L'<b style={{ color: q.color }}>{q.name}</b> a besoin de toi :</> : "Le coach a besoin de toi :"}</div>
            <div className="call-when">{m.label}{m.opponent ? ` · ${m.opponent}` : ""} · {m.date || "date à définir"}{m.time ? ` · ${m.time}` : ""}</div>
            <div className="call-btns">
              <button className="btn-primary" disabled={busy} onClick={() => onAnswerCall(m.id, "yes")}>Je viens</button>
              <button className="btn-ghost" disabled={busy} onClick={() => onAnswerCall(m.id, "no")}>Pas dispo</button>
            </div>
          </div>
        );
      })}

      <MvpVoteCard token={token} myId={player.id} />

      <div className="card">
        <h2>Mes présences</h2>
        {multi && (
          <div className="hint" style={{ marginBottom: 8 }}>
            {mySquads.length ? <>Tes équipes : {mySquads.map((q) => <span key={q.id} style={{ marginRight: 6 }}><SquadChip squad={q} small />{mine[q.id] === "renf" ? " (renfort)" : ""}</span>)}</> : "Tu n'es encore dans aucune équipe : un coach t'ajoutera à son groupe. En attendant tu peux suivre le club, le live et les récaps."}
          </div>
        )}
        <div className="match-list">
          {upcomingMatches.length === 0 && (
            <div className="hint">{mySquads.length || !multi ? "Rien à renseigner pour le moment." : "Aucun match à renseigner."}</div>
          )}
          {upcomingMatches.map((m) => {
            const status = presence[m.id];
            const vehicule = presence[m.id + "-vehicule"];
            const why = presence[m.id + "-why"] || "";
            const call = calledFor(state, m.id, player.id);
            const onlyRenfort = mine[m.squad] === "renf" && !call;
            return (
              <div className="match-row" key={m.id}>
                <div className="match-info">
                  <div className="match-name">{m.label}{m.opponent ? ` vs ${m.opponent}` : ""} {multi && <SquadChip squad={squadById(state, m.squad)} small />}</div>
                  <div className="match-date">{m.date}{m.time ? ` · ${m.time}` : ""}{call && call.ans === "yes" ? " · renfort ✓" : onlyRenfort ? " · renfort possible (le coach t'appellera)" : ""}</div>
                </div>
                <div className="status-btns">
                  {STATUTS.map((st) => (
                    <button
                      key={st.value}
                      className={"status-btn " + st.value + (status === st.value ? " selected" : "")}
                      onClick={() => onSetPresence(m.id, st.value, st.value === "absent" ? why : "")}
                      disabled={busy}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
                {status === "absent" && (
                  <div className="why-row" role="group" aria-label="Raison de l'absence (facultatif)">
                    {WHY.map(([k, l]) => (
                      <button key={k} className={"why-btn" + (why === k ? " on" : "")} disabled={busy} onClick={() => onSetPresence(m.id, "absent", why === k ? "" : k)}>{l}</button>
                    ))}
                  </div>
                )}
                {m.location === "exterieur" && (
                  <label className="vehicule-toggle">
                    <input
                      type="checkbox"
                      checked={vehicule === "Oui"}
                      onChange={(e) => onSetVehicule(m.id, e.target.checked ? "Oui" : "Non")}
                      disabled={busy}
                    />
                    <span>Véhicule</span>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2>Mon compte</h2>
        <div className="row-2">
          <label className="field">
            <span>Nouveau mot de passe</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="field">
            <span>Confirmer</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={busy}
            />
          </label>
        </div>
        {pwError && <div className="error">{pwError}</div>}
        {pwMsg && <div className="ok-msg">{pwMsg}</div>}
        <button className="btn-primary small" onClick={handleChangePassword} disabled={busy || !newPassword}>
          Changer mon mot de passe
        </button>
      </div>

      <LiveConsentCard player={player} onSave={onSetLiveConsent} busy={busy} />
      <MailPrefsCard player={player} onSave={onSetMailPrefs} busy={busy} />
      <div className="card">
        <h2>Mes infos</h2>
        <div className="me-grid">
          <div>
            <div className="me-label">Joueur</div>
            <div className="me-value">{player.prenom} {player.nom}</div>
          </div>
        </div>
        <label className="field" style={{ maxWidth: 160 }}>
          <span>Numéro de maillot</span>
          <DebouncedInput
            value={player.numero || ""}
            onCommit={(v) => onSetNumero(v)}
            disabled={busy}
            placeholder="ex: 24"
            inputMode="numeric"
          />
        </label>
        <div className="pos-editor">
          {["pos1", "pos2", "pos3"].map((slot, i) => (
            <label className="field" key={slot}>
              <span>Poste {i + 1}</span>
              <select
                value={positions[slot] || ""}
                onChange={(e) => onSetPosition(slot, e.target.value)}
                disabled={busy}
              >
                <option value="">—</option>
                {POSTES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      {layout && (
        <div className="card">
          <h2>Affichage</h2>
          <div className="hint" style={{ marginBottom: 8 }}>Réglage propre à cet appareil : garde l'affichage téléphone même sur un grand écran, ou force la tablette / l'ordinateur.</div>
          <LayoutPicker layout={layout} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Coach view                                                          */
/* ------------------------------------------------------------------ */

/* Création d'un compte scoreuse (non lié à un joueur) par le propriétaire. */
function CreateAccountForm({ onCreate, onDone, busy }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  if (!open) {
    return (
      <button className="btn-primary small" style={{ marginBottom: 12 }} onClick={() => setOpen(true)}>
        + Créer un compte scoreuse
      </button>
    );
  }
  async function submit() {
    const ok = await onCreate({ username: username.trim().toLowerCase(), password, label: label.trim(), newRole: "scorer" });
    if (ok) {
      onDone(`Compte "${username.trim().toLowerCase()}" créé (scoreuse). Transmets l'identifiant et le mot de passe à la personne.`);
      setOpen(false); setLabel(""); setUsername(""); setPassword("");
    }
  }
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <h3 style={{ marginTop: 0 }}>Nouveau compte scoreuse</h3>
      <div className="hint" style={{ marginBottom: 8 }}>
        Lecture de la feuille de match en direct (noms complets), compos publiées et saisie du line-up adverse. Aucune modification possible ailleurs.
      </div>
      <div className="reset-form" style={{ flexWrap: "wrap" }}>
        <input placeholder="Nom affiché (ex. Marie)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input placeholder="Identifiant (ex. marie.score)" value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" />
        <input placeholder="Mot de passe (6 caractères min.)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary small" disabled={busy || !username.trim() || password.length < 6} onClick={submit}>Créer</button>
        <button className="btn-ghost small" onClick={() => setOpen(false)}>Annuler</button>
      </div>
    </div>
  );
}

function CoachView({
  state,
  squads,
  squadSel,
  access,
  actingUser,
  onSetLiveConsent,
  onSetPresence,
  onCallUp,
  onCancelCallUp,
  onResetPassword,
  onDeleteAccount,
  onSetAccountRole,
  onCreateAccount,
  onRenameAccount,
  onDeletePlayer,
  onUpdatePlayerField,
  currentUsername,
  currentPlayerId,
  currentRole,
  busy,
}) {
  const [search, setSearch] = useState("");
  const [editPlayerId, setEditPlayerId] = useState(null);
  const [liveEdit, setLiveEdit] = useState(null);
  const [editNom, setEditNom] = useState("");
  const [editPrenom, setEditPrenom] = useState("");
  const [suiviSeasonFilter, setSuiviSeasonFilter] = useState(null);
  const suiviSeasons = useSeasonList(state.matches);
  const effectiveSuiviSeason = suiviSeasonFilter ?? (suiviSeasons.current || "all");
  const multi = (squads || []).length > 1;
  const suiviMatches = useMemo(
    () => state.matches.filter((m) => (squadSel === "all" || m.squad === squadSel) && canSqC(access, m.squad, "read") && (effectiveSuiviSeason === "all" || (m.season || "—") === effectiveSuiviSeason)),
    [state.matches, effectiveSuiviSeason, squadSel]
  );
  const [activeMatch, setActiveMatch] = useState((state.matches[0] || {}).id);
  const [showAll, setShowAll] = useState(false);
  const curMatch = state.matches.find((m) => m.id === activeMatch) || null;
  const curSq = curMatch ? curMatch.squad : null;
  const curSquad = curSq ? squadById(state, curSq) : null;
  const canPresence = curSq ? canSqC(access, curSq, "presence") : false;
  const canCall = curSq ? canSqC(access, curSq, "compo") || canPresence : false;
  // Joueurs du match : habituels de l'équipe, renforts (possibles ou appelés), puis le reste du club
  const groupOf = (p) => {
    if (!curSq) return "reg";
    const mb = memberOf(state, p.id, curSq);
    if (mb === "reg") return "reg";
    if (mb === "renf" || calledFor(state, activeMatch, p.id)) return "renf";
    return "other";
  };
  const [resetTarget, setResetTarget] = useState(null); // username being reset
  const [resetValue, setResetValue] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [editTarget, setEditTarget] = useState(null); // username being edited
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState("player");
  const [deleteTarget, setDeleteTarget] = useState(null); // username pending delete confirm
  const [accountSearch, setAccountSearch] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState(() => new Set());
  const [playerDeleteConfirm, setPlayerDeleteConfirm] = useState(null); // playerId pending delete
  const [playerBulkConfirm, setPlayerBulkConfirm] = useState(false);
  const [playerBulkBusy, setPlayerBulkBusy] = useState(false);
  const [playerMsg, setPlayerMsg] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState(() => new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const players = useMemo(() => {
    const statusOrder = { present: 0, reserve: 1, absent: 2 };
    const gOrder = { reg: 0, renf: 1, other: 2 };
    return state.roster
      .filter((p) => `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => showAll || search.trim() || groupOf(p) !== "other")
      .sort((a, b) => {
        const ga = gOrder[groupOf(a)], gb = gOrder[groupOf(b)];
        if (ga !== gb) return ga - gb;
        const statusA = (state.presence[a.id] || {})[activeMatch];
        const statusB = (state.presence[b.id] || {})[activeMatch];
        const orderA = statusOrder[statusA] ?? 3;
        const orderB = statusOrder[statusB] ?? 3;
        if (orderA !== orderB) return orderA - orderB;
        return (a.nom + a.prenom).localeCompare(b.nom + b.prenom);
      });
  }, [state.roster, state.presence, state.members, state.callups, activeMatch, search, showAll]);
  const pool = state.roster.filter((p) => groupOf(p) === "reg" || (groupOf(p) === "renf" && ((state.presence[p.id] || {})[activeMatch] || calledFor(state, activeMatch, p.id))));
  const hiddenCount = state.roster.filter((p) => groupOf(p) === "other").length;

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, reserve: 0, unknown: 0 };
    pool.forEach((p) => {
      const v = (state.presence[p.id] || {})[activeMatch];
      if (v === "present") c.present++;
      else if (v === "absent") c.absent++;
      else if (v === "reserve") c.reserve++;
      else c.unknown++;
    });
    return c;
  }, [state, activeMatch, pool.length]);

  const posteCounts = useMemo(() => {
    return POSTES.map((poste) => {
      const count = pool.filter((p) => {
        const status = (state.presence[p.id] || {})[activeMatch];
        if (status !== "present" && status !== "reserve") return false;
        const pos = state.positions[p.id] || {};
        return pos.pos1 === poste || pos.pos2 === poste || pos.pos3 === poste;
      }).length;
      return { poste, count };
    });
  }, [state, activeMatch, pool.length]);

  function cycleStatus(playerId) {
    if (!canPresence) return;
    const current = (state.presence[playerId] || {})[activeMatch] || "";
    const order = ["", "present", "absent", "reserve"];
    const idx = order.indexOf(current);
    const next = order[(idx === -1 ? 0 : idx + 1) % order.length];
    onSetPresence(playerId, activeMatch, next);
  }

  function togglePlayerSelect(playerId) {
    setSelectedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  function playerLinkedStaffBlocked(playerId) {
    const linked = Object.values(state.accounts).find((a) => a.playerId === playerId);
    return Boolean(linked && isStaffRole(linked.role) && currentRole !== "owner");
  }

  function canDeletePlayerRow(p) {
    return p.id !== currentPlayerId && !playerLinkedStaffBlocked(p.id) && canDeletePlayerC(state, access, p.id);
  }

  function togglePlayerSelectAll(rows) {
    setSelectedPlayers((prev) => {
      const manageable = rows.filter(canDeletePlayerRow);
      const allSelected = manageable.length > 0 && manageable.every((p) => prev.has(p.id));
      if (allSelected) return new Set();
      return new Set(manageable.map((p) => p.id));
    });
  }

  async function handleDeletePlayer(playerId) {
    setPlayerMsg("");
    await onDeletePlayer(playerId);
    setPlayerDeleteConfirm(null);
    setPlayerMsg("Joueur supprimé.");
  }

  function startEditPlayer(p) {
    setEditPlayerId(p.id);
    setEditNom(p.nom || "");
    setEditPrenom(p.prenom || "");
    setPlayerMsg("");
  }

  async function handleSavePlayerName(playerId) {
    const p = players.find((pl) => pl.id === playerId);
    if (p && editNom.trim() !== p.nom) await onUpdatePlayerField(playerId, "nom", editNom.trim().toUpperCase());
    if (p && editPrenom.trim() !== p.prenom) await onUpdatePlayerField(playerId, "prenom", editPrenom.trim());
    setEditPlayerId(null);
    setPlayerMsg("Nom mis à jour.");
  }

  async function handlePlayerBulkDelete() {
    setPlayerBulkBusy(true);
    setPlayerMsg("");
    const ids = Array.from(selectedPlayers);
    for (const id of ids) {
      await onDeletePlayer(id);
    }
    setPlayerBulkBusy(false);
    setPlayerBulkConfirm(false);
    setSelectedPlayers(new Set());
    setPlayerMsg(`${ids.length} joueur(s) supprimé(s).`);
  }

  async function handleReset(username) {
    setResetMsg("");
    const ok = await onResetPassword(username, resetValue);
    if (ok) {
      setResetMsg(`Mot de passe de "${username}" mis à jour. Communique-le directement à la personne concernée.`);
      setResetTarget(null);
      setResetValue("");
    }
  }

  function startEdit(acc) {
    setEditTarget(acc.username);
    setEditUsername(acc.username);
    setEditRole(acc.role);
    setResetMsg("");
  }

  async function handleSaveEdit(oldUsername) {
    setResetMsg("");
    let ok = true;
    if (editUsername.trim().toLowerCase() !== oldUsername) {
      ok = await onRenameAccount(oldUsername, editUsername);
    }
    const finalUsername = ok ? editUsername.trim().toLowerCase() : oldUsername;
    if (ok && editRole !== state.accounts[oldUsername]?.role) {
      ok = await onSetAccountRole(finalUsername, editRole);
    }
    if (ok) {
      setEditTarget(null);
      setResetMsg("Compte mis à jour.");
    }
  }

  async function handleConfirmDelete(username) {
    await onDeleteAccount(username);
    setDeleteTarget(null);
    setResetMsg(`Compte "${username}" supprimé.`);
  }

  function canManageAccount(acc) {
    if (acc.username === currentUsername) return false;
    if (isStaffRole(acc.role) && currentRole !== "owner") return false;
    const linked = (state.accounts[acc.username] || {}).playerId;
    return linked ? canPlayerC(state, access, linked, "roster") : !!(access && access.owner);
  }

  function toggleSelect(username) {
    setSelectedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  }

  function toggleSelectAll(rows) {
    setSelectedAccounts((prev) => {
      const manageable = rows.filter(canManageAccount);
      const allSelected = manageable.length > 0 && manageable.every((r) => prev.has(r.username));
      if (allSelected) return new Set();
      return new Set(manageable.map((r) => r.username));
    });
  }

  async function handleBulkDelete() {
    setBulkBusy(true);
    setResetMsg("");
    const usernames = Array.from(selectedAccounts);
    for (const username of usernames) {
      await onDeleteAccount(username);
    }
    setBulkBusy(false);
    setBulkConfirm(false);
    setSelectedAccounts(new Set());
    setResetMsg(`${usernames.length} compte(s) supprimé(s).`);
  }

  const accountRows = Object.entries(state.accounts)
    .map(([username, acc]) => {
      const player = state.roster.find((p) => p.id === acc.playerId);
      return { username, ...acc, playerName: player ? `${player.prenom} ${player.nom}` : acc.label || (acc.role === "scorer" ? "Scoreuse" : acc.playerId || username) };
    })
    .filter((acc) =>
      accountSearch.trim() === "" ||
      `${acc.playerName} ${acc.username}`.toLowerCase().includes(accountSearch.toLowerCase())
    )
    .sort((a, b) => a.playerName.localeCompare(b.playerName));

  useEffect(() => {
    if (suiviMatches.length > 0 && !suiviMatches.some((m) => m.id === activeMatch)) {
      setActiveMatch(suiviMatches[0].id);
    }
  }, [suiviMatches, activeMatch]);

  const target = curSquad ? curSquad.target || 12 : 12;
  const readOnly = curSq && !canPresence;
  return (
    <div>
      <div className="card wide">
        <h2>Vue d'ensemble par match {multi && curSquad && <SquadChip squad={curSquad} />}</h2>
        {readOnly && <div className="ro-banner">Lecture seule · tu vois cette équipe avec ta casquette entraîneur, rien n'est modifiable ici.</div>}
        <select
          className="match-select"
          value={effectiveSuiviSeason}
          onChange={(e) => setSuiviSeasonFilter(e.target.value)}
        >
          {suiviSeasons.map((s) => (
            <option key={s} value={s}>Saison {s}</option>
          ))}
          <option value="all">Toutes les saisons</option>
        </select>
        <div className="match-tabs">
          {suiviMatches.map((m) => (
            <button
              key={m.id}
              className={"mtab" + (activeMatch === m.id ? " active" : "")}
              onClick={() => setActiveMatch(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        {curSq && (
          <div className="target-gauge" aria-label={`${counts.present} présents sur ${target} visés`}>
            <div className="tg-top"><b>{counts.present}</b> présent{counts.present > 1 ? "s" : ""} sur <b>{target}</b> visés<span className={counts.present >= 9 ? "tg-ok" : "tg-bad"}>{counts.present >= 9 ? "9 pour jouer ✓" : `il en manque ${9 - counts.present} pour jouer`}</span></div>
            <div className="tg-bar"><span style={{ width: Math.min(100, (counts.present / target) * 100) + "%" }} className={counts.present >= target ? "full" : counts.present >= 9 ? "ok" : "low"} /><i style={{ left: (9 / target) * 100 + "%" }} /></div>
          </div>
        )}
        <div className="counts-row">
          <span className="count-chip present">Présents: {counts.present}</span>
          <span className="count-chip absent">Absents: {counts.absent}</span>
          <span className="count-chip reserve">Sous réserve: {counts.reserve}</span>
          <span className="count-chip unknown">Non renseigné: {counts.unknown}</span>
        </div>

        <div className="poste-summary">
          <div className="poste-summary-title">Postes disponibles pour ce match</div>
          <div className="poste-chip-row">
            {posteCounts.map(({ poste, count }) => (
              <span
                key={poste}
                className={"poste-chip " + (count === 0 ? "poste-zero" : count === 1 ? "poste-low" : "poste-ok")}
              >
                {poste} <strong>{count}</strong>
              </span>
            ))}
          </div>
        </div>

        <LiveConsentTracker roster={state.roster} claimed={new Set(Object.values(state.accounts || {}).map((a) => a.playerId))} onEdit={(id) => { setSearch(""); setLiveEdit(id); setTimeout(() => { const el = document.querySelector(`[data-pid="${id}"]`); if (el) el.scrollIntoView({ block: "center", behavior: "smooth" }); }, 50); }} />

        <input
          className="search"
          placeholder="Rechercher un joueur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="bulk-bar">
          <label className="checkbox-row" style={{ marginBottom: 0 }}>
            <input
              type="checkbox"
              checked={players.filter(canDeletePlayerRow).length > 0 && players.filter(canDeletePlayerRow).every((p) => selectedPlayers.has(p.id))}
              onChange={() => togglePlayerSelectAll(players)}
            />
            <span>Tout sélectionner ({players.length})</span>
          </label>

          {selectedPlayers.size > 0 && !playerBulkConfirm && (
            <button className="btn-danger small" onClick={() => setPlayerBulkConfirm(true)}>
              Supprimer la sélection ({selectedPlayers.size})
            </button>
          )}
          {playerBulkConfirm && (
            <span className="bulk-confirm">
              <span className="confirm-text">Supprimer {selectedPlayers.size} joueur(s) ? Comptes liés compris.</span>
              <button className="btn-danger small" disabled={playerBulkBusy} onClick={handlePlayerBulkDelete}>
                {playerBulkBusy ? "…" : "Confirmer"}
              </button>
              <button className="btn-ghost small" onClick={() => setPlayerBulkConfirm(false)} disabled={playerBulkBusy}>
                Annuler
              </button>
            </span>
          )}
        </div>
        {playerMsg && <div className="ok-msg">{playerMsg}</div>}

        <div className="grid-table">
          <div className="grid-header grid-header-with-actions">
            <div className="gp-check"></div>
            <div className="gp-name">Joueur</div>
            <div className="gp-pos">Postes</div>
            <div className="gp-status">Statut — {state.matches.find((m) => m.id === activeMatch)?.label}</div>
            <div className="gp-actions">Actions</div>
          </div>
          {players.map((p, idx) => {
            const pos = state.positions[p.id] || {};
            const status = (state.presence[p.id] || {})[activeMatch];
            const why = (state.presence[p.id] || {})[activeMatch + "-why"];
            const g = groupOf(p);
            const prevG = idx > 0 ? groupOf(players[idx - 1]) : null;
            const call = calledFor(state, activeMatch, p.id);
            const head = curSq && g !== prevG ? (
              <div className="grid-group" key={"g-" + g}>{g === "reg" ? `Habituels · ${curSquad ? curSquad.name : ""}` : g === "renf" ? "Renforts possibles · appel au cas par cas" : "Autres joueurs du club"}</div>
            ) : null;
            return (
              <React.Fragment key={p.id}>
              {head}
              <div className={"grid-row grid-row-with-actions" + (g !== "reg" && curSq ? " row-renf" : "")} data-pid={p.id}>
                <div className="gp-check">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.has(p.id)}
                    onChange={() => togglePlayerSelect(p.id)}
                    disabled={!canDeletePlayerRow(p)}
                  />
                </div>
                {editPlayerId === p.id ? (
                  <div className="grid-name-edit gp-name">
                    <DebouncedInput
                      value={editPrenom}
                      onCommit={setEditPrenom}
                      placeholder="Prénom"
                      disabled={busy}
                    />
                    <DebouncedInput
                      value={editNom}
                      onCommit={setEditNom}
                      placeholder="Nom"
                      disabled={busy}
                    />
                  </div>
                ) : (
                  <div className="grid-name gp-name">{p.prenom} {p.nom}{p.numero ? ` · #${p.numero}` : ""}
                    <button className={"live-badge " + (liveChoice(p.live) || "none")} onClick={() => canPlayerC(state, access, p.id, "presence") && setLiveEdit(liveEdit === p.id ? null : p.id)} title="Accord d'affichage sur le live">{liveConsentLabel(p.live)}</button>
                    {liveEdit === p.id && (
                      <StaffLiveEditor player={p} busy={busy} onClose={() => setLiveEdit(null)} onSave={async (v) => { await onSetLiveConsent(p.id, v); setLiveEdit(null); }} />
                    )}
                  </div>
                )}
                <div className="grid-pos gp-pos">
                  {[pos.pos1, pos.pos2, pos.pos3].filter(Boolean).join(" · ") || "—"}
                </div>
                <div className="gp-status">
                  <button className="cell-status" style={{ cursor: busy ? "wait" : canPresence ? "pointer" : "default" }} onClick={() => !busy && cycleStatus(p.id)} disabled={!canPresence && !!curSq}>
                    <StatusPill value={status} />
                  </button>
                  {status === "absent" && why && <span className="why-tag">{{ d3: "joue en D3", blesse: "blessé", dispo: "pas dispo" }[why]}</span>}
                  {curSq && g !== "reg" && (call ? (
                    <span className={"call-state " + (call.ans || "wait")}>
                      {call.ans === "yes" ? "renfort ✓" : call.ans === "no" ? "a dit non" : "appelé…"}
                      {canCall && <button className="link-btn" onClick={() => onCancelCallUp(activeMatch, p.id)} disabled={busy}>annuler</button>}
                    </span>
                  ) : canCall ? (
                    <button className="btn-call" onClick={() => onCallUp(activeMatch, p.id)} disabled={busy}>Appeler</button>
                  ) : null)}
                </div>
                <div className="gp-actions">
                  {editPlayerId === p.id ? (
                    <div className="reset-form">
                      <button className="btn-primary small" disabled={busy} onClick={() => handleSavePlayerName(p.id)}>
                        Enregistrer
                      </button>
                      <button className="btn-ghost small" onClick={() => setEditPlayerId(null)}>
                        Annuler
                      </button>
                    </div>
                  ) : playerDeleteConfirm === p.id ? (
                    <div className="reset-form">
                      <button className="btn-danger small" disabled={busy} onClick={() => handleDeletePlayer(p.id)}>
                        Confirmer
                      </button>
                      <button className="btn-ghost small" onClick={() => setPlayerDeleteConfirm(null)}>
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="account-actions">
                      {(canPlayerC(state, access, p.id, "roster") || canPlayerC(state, access, p.id, "presence")) && (
                      <button className="btn-ghost small" onClick={() => startEditPlayer(p)} disabled={busy}>
                        Modifier
                      </button>)}
                      {canDeletePlayerC(state, access, p.id) && (
                      <button
                        className="btn-danger small"
                        onClick={() => { setPlayerDeleteConfirm(p.id); setPlayerMsg(""); }}
                        disabled={p.id === currentPlayerId || playerLinkedStaffBlocked(p.id)}
                        title={
                          p.id === currentPlayerId
                            ? "Tu ne peux pas te supprimer toi-même."
                            : playerLinkedStaffBlocked(p.id)
                            ? "Seul le compte propriétaire peut supprimer un membre du staff."
                            : ""
                        }
                      >
                        Supprimer
                      </button>)}
                      {!canPlayerC(state, access, p.id, "roster") && !canPlayerC(state, access, p.id, "presence") && <span className="hint-inline">autre équipe</span>}
                    </div>
                  )}
                </div>
              </div>
              </React.Fragment>
            );
          })}
        </div>
        {curSq && hiddenCount > 0 && !search.trim() && (
          <button className="btn-ghost small" style={{ marginTop: 10 }} onClick={() => setShowAll(!showAll)}>
            {showAll ? "Masquer les autres joueurs du club" : `Voir tout le club (${hiddenCount} autres joueurs, pour un dépannage)`}
          </button>
        )}
        <div className="hint">Clique sur un statut pour le faire tourner (Présent → Absent → Sous réserve → vide). Supprimer un joueur retire aussi ses présences, ses postes, sa place dans les compositions, et son compte s'il en a un.</div>
      </div>

      <div className="card wide">
        <h2>Journal des modifications</h2>
        <div className="audit-list">
          {state.auditLog.length === 0 && <div className="hint">Aucune modification pour l'instant.</div>}
          {state.auditLog.map((entry, i) => (
            <div className="audit-row" key={i}>
              <span className="audit-time">{entry.tsLabel}</span>
              <span className="audit-user">{entry.user}</span>
              <span className="audit-action">{entry.action}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card wide">
        <h2>Comptes</h2>
        {resetMsg && <div className="ok-msg">{resetMsg}</div>}
        {currentRole === "owner" && <CreateAccountForm onCreate={onCreateAccount} onDone={setResetMsg} busy={busy} />}

        <input
          className="search"
          placeholder="Rechercher un compte par nom ou identifiant…"
          value={accountSearch}
          onChange={(e) => setAccountSearch(e.target.value)}
        />

        <div className="bulk-bar">
          <label className="checkbox-row" style={{ marginBottom: 0 }}>
            <input
              type="checkbox"
              checked={accountRows.filter(canManageAccount).length > 0 && accountRows.filter(canManageAccount).every((r) => selectedAccounts.has(r.username))}
              onChange={() => toggleSelectAll(accountRows)}
            />
            <span>Tout sélectionner ({accountRows.length})</span>
          </label>

          {selectedAccounts.size > 0 && !bulkConfirm && (
            <button className="btn-danger small" onClick={() => setBulkConfirm(true)}>
              Supprimer la sélection ({selectedAccounts.size})
            </button>
          )}
          {bulkConfirm && (
            <span className="bulk-confirm">
              <span className="confirm-text">Supprimer {selectedAccounts.size} compte(s) ?</span>
              <button className="btn-danger small" disabled={bulkBusy} onClick={handleBulkDelete}>
                {bulkBusy ? "…" : "Confirmer"}
              </button>
              <button className="btn-ghost small" onClick={() => setBulkConfirm(false)} disabled={bulkBusy}>
                Annuler
              </button>
            </span>
          )}
        </div>

        <div className="accounts-list">
          {accountRows.map((acc) => {
            const manageable = canManageAccount(acc);
            return (
            <div className="account-row" key={acc.username}>
              <input
                type="checkbox"
                className="account-checkbox"
                checked={selectedAccounts.has(acc.username)}
                onChange={() => toggleSelect(acc.username)}
                disabled={!manageable}
              />
              <div className="account-info">
                <span className="account-name">{acc.playerName}</span>
                <span className="account-user">@{acc.username}{acc.role === "owner" ? " · propriétaire" : acc.role === "coach" ? " · staff" : acc.role === "scorer" ? " · scoreuse" : ""}</span>
              </div>

              {editTarget === acc.username ? (
                <div className="reset-form">
                  <input
                    placeholder="Identifiant"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                  />
                  {currentRole === "owner" && (
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                    <option value="player">Joueur</option>
                    <option value="scorer">Scoreuse</option>
                    <option value="coach">Staff</option>
                    <option value="owner">Propriétaire</option>
                  </select>)}
                  <button className="btn-primary small" disabled={busy} onClick={() => handleSaveEdit(acc.username)}>
                    Enregistrer
                  </button>
                  <button className="btn-ghost small" onClick={() => setEditTarget(null)}>
                    Annuler
                  </button>
                </div>
              ) : resetTarget === acc.username ? (
                <div className="reset-form">
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={resetValue}
                    onChange={(e) => setResetValue(e.target.value)}
                  />
                  <button className="btn-primary small" disabled={busy} onClick={() => handleReset(acc.username)}>
                    Valider
                  </button>
                  <button className="btn-ghost small" onClick={() => { setResetTarget(null); setResetValue(""); }}>
                    Annuler
                  </button>
                </div>
              ) : deleteTarget === acc.username ? (
                <div className="reset-form">
                  <span className="confirm-text">Supprimer ce compte ?</span>
                  <button className="btn-danger small" disabled={busy} onClick={() => handleConfirmDelete(acc.username)}>
                    Confirmer
                  </button>
                  <button className="btn-ghost small" onClick={() => setDeleteTarget(null)}>
                    Annuler
                  </button>
                </div>
              ) : (
                !manageable ? (
                <div className="account-actions"><span className="hint-inline">{acc.username === currentUsername ? "ton compte" : "géré par une autre équipe / le propriétaire"}</span></div>
                ) : (
                <div className="account-actions">
                  <button className="btn-ghost small" onClick={() => startEdit(acc)} disabled={!manageable}>
                    Modifier
                  </button>
                  <button
                    className="btn-ghost small"
                    onClick={() => { setResetTarget(acc.username); setResetValue(""); setResetMsg(""); }}
                    disabled={!manageable}
                  >
                    Réinitialiser le mot de passe
                  </button>
                  <button
                    className="btn-danger small"
                    onClick={() => { setDeleteTarget(acc.username); setResetMsg(""); }}
                    disabled={!manageable}
                    title={!manageable ? (acc.username === currentUsername ? "Tu ne peux pas supprimer ton propre compte ici." : "Seul le compte propriétaire peut gérer ce compte staff.") : ""}
                  >
                    Supprimer
                  </button>
                </div>
                )
              )}
            </div>
            );
          })}
          {accountRows.length === 0 && <div className="hint">Aucun compte trouvé.</div>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lineup / composition view (coach only)                              */
/* ------------------------------------------------------------------ */

function FieldDiagram({ defense, roster }) {
  function nameFor(playerId) {
    const p = roster.find((r) => r.id === playerId);
    if (!p) return "";
    const nom = p.nom || "";
    return nom.length > 9 ? nom.slice(0, 8) + "…" : nom;
  }

  return (
    <svg viewBox="0 0 100 150" className="field-svg">
      <rect x="0" y="0" width="100" height="150" rx="4" className="field-grass" />
      <path d="M 50 6 A 78 78 0 0 1 98 92 L 50 92 Z" className="field-outfield" />
      <path d="M 50 6 A 78 78 0 0 0 2 92 L 50 92 Z" className="field-outfield" />
      <polygon points="50,136 76,108 50,80 24,108" className="field-infield" />
      <line x1="50" y1="136" x2="2" y2="92" className="field-line" />
      <line x1="50" y1="136" x2="98" y2="92" className="field-line" />
      <circle cx="50" cy="136" r="1.8" className="field-base" />
      <circle cx="76" cy="108" r="1.8" className="field-base" />
      <circle cx="50" cy="80" r="1.8" className="field-base" />
      <circle cx="24" cy="108" r="1.8" className="field-base" />

      {FIELD_POSITIONS.map((fp) => {
        const playerId = defense[fp.key];
        return (
          <g key={fp.key}>
            <circle cx={fp.x} cy={fp.y} r="7.5" className={playerId ? "field-marker filled" : "field-marker"} />
            <text x={fp.x} y={fp.y + 1.4} textAnchor="middle" className="field-marker-label">
              {fp.short}
            </text>
            {playerId && (
              <rect
                x={fp.x - 17}
                y={fp.y + 11.5 - 4.6}
                width="34"
                height="6.4"
                rx="2"
                className="field-marker-name-bg"
              />
            )}
            <text x={fp.x} y={fp.y + 11.5} textAnchor="middle" className={playerId ? "field-marker-name" : "field-marker-name field-marker-name-empty"}>
              {playerId ? nameFor(playerId) : "—"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Relance des présences : message prêt à coller dans le groupe WhatsApp. */
function RelanceCard({ state, squadSel, access }) {
  const ctx = useContext(SeasonContext);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = useMemo(() => state.matches
    .filter((m) => !m.cancelled && (m.season || CURRENT_SEASON) === ctx.current && (!squadSel || squadSel === "all" || m.squad === squadSel) && canSqC(access, m.squad, "read"))
    .map((m) => ({ m, d: matchDateOf(m) }))
    .filter(({ d }) => !d || d.getTime() >= today.getTime())
    .sort((a, b) => (a.d ? a.d.getTime() : Infinity) - (b.d ? b.d.getTime() : Infinity)), [state.matches, ctx.current, squadSel]);
  const [matchId, setMatchId] = useState(null);
  const [withReserve, setWithReserve] = useState(false);
  const [copied, setCopied] = useState(false);
  const cur = upcoming.find((x) => x.m.id === matchId) || upcoming[0];
  if (!cur) return null;
  const m = cur.m;
  const short = (p) => `${p.prenom}${p.nom ? " " + p.nom[0] + "." : ""}`;
  const st = (p) => ((state.presence[p.id] || {})[m.id]) || "";
  // seulement les habituels de l'équipe du match et les renforts appelés
  const pool = state.roster.filter((p) => memberOf(state, p.id, m.squad) === "reg" || calledFor(state, m.id, p.id));
  const noAnswer = pool.filter((p) => !st(p));
  const reserve = pool.filter((p) => st(p) === "reserve");
  const counts = { present: pool.filter((p) => st(p) === "present").length, absent: pool.filter((p) => st(p) === "absent").length };
  const when = cur.d ? cur.d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : m.date;
  const lines = [
    `📣 Présences — ${m.label}${when ? " · " + when : ""}${m.opponent ? " · vs " + m.opponent : ""}`,
    "",
    noAnswer.length ? `Pas encore répondu (${noAnswer.length}) : ${noAnswer.map(short).join(", ")}` : "Tout le monde a répondu, merci ! 🙌",
  ];
  if (withReserve && reserve.length) lines.push(`Sous réserve, à confirmer (${reserve.length}) : ${reserve.map(short).join(", ")}`);
  if (noAnswer.length || (withReserve && reserve.length)) lines.push("", `Merci de remplir ta présence sur ${window.location.origin} 🙏`);
  const text = lines.join("\n");
  async function copy() {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch (err) { /* sélection manuelle */ } t.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="card">
      <h2>Relance WhatsApp</h2>
      <select className="match-select" value={m.id} onChange={(e) => setMatchId(e.target.value)}>
        {upcoming.map(({ m: x }) => <option key={x.id} value={x.id}>{x.label}{x.opponent ? ` vs ${x.opponent}` : ""} — {x.date || "date à définir"}</option>)}
      </select>
      <div className="hint" style={{ marginBottom: 8 }}>
        {counts.present} présent(s) · {reserve.length} sous réserve · {counts.absent} absent(s) · {noAnswer.length} sans réponse
      </div>
      <label className="hint" style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={withReserve} onChange={(e) => setWithReserve(e.target.checked)} />
        Ajouter aussi les « sous réserve » à confirmer
      </label>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(63, 174, 116,0.2)", borderRadius: 8, padding: 10, margin: "0 0 10px", userSelect: "text" }}>{text}</pre>
      <button className="btn-primary small" onClick={copy}>{copied ? "Copié ✓" : "Copier le message"}</button>
    </div>
  );
}

/* Lien et QR code de la page /live, à préparer avant le match et à envoyer sur WhatsApp. */
function loadQrLib() {
  if (window.qrcode) return Promise.resolve();
  return new Promise((ok, ko) => {
    const sc = document.createElement("script");
    sc.src = "/match/qrcode.js"; sc.onload = ok; sc.onerror = ko;
    document.head.appendChild(sc);
  });
}
function LiveLinkCard({ test }) {
  const url = window.location.origin + (test ? "/live?test=1" : "/live");
  const [svg, setSvg] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    loadQrLib().then(() => {
      const q = window.qrcode(0, "M"); q.addData(url); q.make();
      setSvg(q.createSvgTag({ cellSize: 6, margin: 0 }));
    }).catch(() => setSvg(""));
  }, []);
  async function makePng() {
    await loadQrLib();
    const q = window.qrcode(0, "M"); q.addData(url); q.make();
    const n = q.getModuleCount(), cell = Math.floor(560 / n), size = n * cell;
    const W = 800, H = 1000, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.fillStyle = "#0e1511"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#3fae74"; x.textAlign = "center"; x.font = "800 52px system-ui, sans-serif";
    x.fillText("DRAGONS DE RONCHIN", W / 2, 95);
    x.fillStyle = "#e7efea"; x.font = "500 34px system-ui, sans-serif";
    x.fillText("Suivez le match en direct", W / 2, 150);
    const ox = (W - size) / 2, oy = 200, pad = 28;
    x.fillStyle = "#ffffff"; x.fillRect(ox - pad, oy - pad, size + pad * 2, size + pad * 2);
    x.fillStyle = "#000000";
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(ox + k * cell, oy + r * cell, cell, cell);
    x.fillStyle = "#3fae74"; x.font = "700 34px system-ui, sans-serif";
    x.fillText(url.replace(/^https?:\/\//, ""), W / 2, oy + size + pad + 70);
    x.fillStyle = "#9aada2"; x.font = "400 26px system-ui, sans-serif";
    x.fillText("Score, actions et résultat en direct · sans compte", W / 2, oy + size + pad + 115);
    const blob = await new Promise((res) => c.toBlob(res, "image/png"));
    const file = new File([blob], "dragons-live-qr.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "Dragons de Ronchin en direct" }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "dragons-live-qr.png";
    document.body.appendChild(a); a.click(); a.remove();
    setMsg("Image téléchargée : envoie-la sur le groupe WhatsApp.");
  }
  async function copy() {
    const text = `⚾ Suivez le match des Dragons en direct : ${url}`;
    try { await navigator.clipboard.writeText(text); setMsg("Message copié."); }
    catch (e) { setMsg(text); }
  }
  return (
    <div className="card">
      <h2>Lien du live</h2>
      <div className="hint" style={{ marginBottom: 10 }}>
        À préparer avant le match : envoie l'image du QR code ou le lien sur WhatsApp. Le live ne
        montre quelque chose que lorsque la diffusion est activée sur la feuille de match.
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        {svg && <div style={{ background: "#fff", padding: 10, borderRadius: 8, width: 140, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svg.replace("<svg ", '<svg style="width:120px;height:120px" ') }} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <b style={{ color: "var(--gold)" }}>{url.replace(/^https?:\/\//, "")}</b>
          <button className="btn-primary small" onClick={makePng}>Image du QR code à partager</button>
          <button className="btn-ghost small" onClick={copy}>Copier le message avec le lien</button>
        </div>
      </div>
      {msg && <div className="hint" style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}

/* Sauvegardes — compte propriétaire uniquement (vérifié côté serveur). */
function BackupPanel({ token, onRestored }) {
  const [days, setDays] = useState(null);
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(null); // sauvegarde chargée, en attente de confirmation
  const [confirmText, setConfirmText] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    callApi({ action: "listBackups", token }).then((r) => setDays(r.backups || [])).catch(() => setDays([]));
  }, [token]);

  function download(obj, name) {
    const blob = new Blob([JSON.stringify(obj, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function get(day) {
    setWorking(true); setMsg("");
    try {
      const r = await callApi({ action: "getBackup", token, day: day || undefined });
      download(r.backup, `dragons-sauvegarde-${day || new Date().toISOString().slice(0, 10)}.json`);
      setMsg("Sauvegarde téléchargée. Garde-la en lieu sûr : elle contient les comptes.");
    } catch (e) { setMsg(e.message); }
    setWorking(false);
  }
  function pick(file) {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const b = JSON.parse(fr.result);
        if (b.kind !== "dragons-backup") throw new Error();
        setPending(b); setConfirmText(""); setMsg("");
      } catch (e) { setMsg("Ce fichier n'est pas une sauvegarde de l'appli Dragons."); }
    };
    fr.readAsText(file);
  }
  async function restore() {
    setWorking(true);
    try {
      const r = await callApi({ action: "restoreBackup", token, backup: pending });
      onRestored(r.state); setPending(null);
      setMsg(`Sauvegarde restaurée (${r.scoresheets} feuille(s) de match). L'état d'avant a été mis de côté sur le serveur.`);
    } catch (e) { setMsg(e.message); }
    setWorking(false);
  }

  return (
    <div className="card">
      <h2>Sauvegardes</h2>
      <div className="hint" style={{ marginBottom: 10 }}>
        Une copie automatique est faite chaque jour où l'appli est modifiée (30 jours conservés).
        Télécharge aussi une sauvegarde complète de temps en temps et garde-la hors de Netlify.
      </div>
      <div className="matches-toolbar" style={{ flexWrap: "wrap" }}>
        <button className="btn-primary small" disabled={working} onClick={() => get(null)}>Télécharger une sauvegarde complète</button>
        {days && days.length > 0 && (
          <select className="match-select" style={{ margin: 0, maxWidth: 260 }} defaultValue=""
            onChange={(e) => { if (e.target.value) get(e.target.value); e.target.value = ""; }}>
            <option value="">Copies automatiques…</option>
            {days.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <label className="btn-ghost small" style={{ cursor: "pointer" }}>
          Restaurer depuis un fichier
          <input type="file" accept=".json,application/json" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = ""; }} />
        </label>
      </div>
      {pending && (
        <div className="hint" style={{ marginTop: 12, border: "1px solid var(--bad)", borderRadius: 8, padding: 10 }}>
          Restaurer remplace <b>toutes</b> les données actuelles (comptes, présences, matchs, compositions)
          par celles du {String(pending.exportedAt || "").slice(0, 10) || "fichier"}. Tape <b>RESTAURER</b> pour confirmer.
          <div className="matches-toolbar" style={{ marginTop: 8 }}>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="RESTAURER" style={{ maxWidth: 160 }} />
            <button className="btn-primary small" disabled={working || confirmText !== "RESTAURER"} onClick={restore}>Restaurer</button>
            <button className="btn-ghost small" onClick={() => setPending(null)}>Annuler</button>
          </div>
        </div>
      )}
      {msg && <div className="hint" style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}

/* Date réelle d'un match ("12 avril", "12/04", "2027-04-12") — l'année vient de la saison. */
function matchDateOf(m) {
  const str = String(m.date || "").toLowerCase().trim();
  if (!str) return null;
  const year = parseInt(String(m.season || CURRENT_SEASON).slice(0, 4), 10) || new Date().getFullYear();
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const num = str.match(/(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?/);
  if (num) { let y = num[3] ? +num[3] : year; if (y < 100) y += 2000; return new Date(y, +num[2] - 1, +num[1]); }
  const fr = str.match(/(\d{1,2})\s*(?:er)?\s+([a-zéèêûôîà]+)/);
  if (!fr) return null;
  const mi = FR_MONTHS.findIndex((x) => x === fr[2] || x.startsWith(fr[2]) || fr[2].startsWith(x.slice(0, 4)));
  return mi === -1 ? null : new Date(year, mi, +fr[1]);
}
const DAY_MS = 24 * 60 * 60 * 1000;
const COMPO_KEEP_DAYS = 3; // un match passé reste 3 jours dans Composition, ensuite seulement dans Historique

/* Composition — lecture seule. Le staff la prépare dans « Compo & changements »
   puis l'envoie ici ; les joueurs la voient à partir de 2 jours avant le match. */
function LineupView({ state, squads, squadSel, access, isStaff: isStaffAny, token, scorer }) {
  const [images, setImages] = useState({}); // matchId:imageAt -> dataURL | "none"
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const multi = (squads || []).length > 1;
  // « staff » pour ce match : on encadre (ou on lit avec la casquette entraîneur) l'équipe du match
  const staffFor = (m) => isStaffAny && canSqC(access, m.squad, "read") && !canSqC(access, m.squad, "scorer");
  const list = useMemo(() => {
    return state.matches
      .filter((m) => !m.cancelled && (!squadSel || squadSel === "all" || m.squad === squadSel))
      .map((m) => ({ m, d: matchDateOf(m), lu: (state.lineups || {})[m.id] }))
      .filter(({ m, d }) => (d ? d.getTime() >= today.getTime() - COMPO_KEEP_DAYS * DAY_MS : staffFor(m)))
      .filter(({ m, lu }) => staffFor(m) || (lu && (lu.batting || []).some(Boolean)))
      .sort((a, b) => (a.d ? a.d.getTime() : Infinity) - (b.d ? b.d.getTime() : Infinity));
  }, [state.matches, state.lineups, isStaffAny, squadSel]);
  const [matchId, setMatchId] = useState(null);
  const cur = list.find((x) => x.m.id === matchId) || list[0];
  const curImageAt = cur ? getLineup(state, cur.m.id).imageAt : null;
  const imgKey = cur && curImageAt ? cur.m.id + ":" + curImageAt : null;
  useEffect(() => {
    if (!imgKey || (images[imgKey] && images[imgKey] !== "error")) return;
    const id = cur.m.id;
    callApi({ action: "getLineupImage", token, matchId: id })
      .then((r) => setImages((x) => ({ ...x, [imgKey]: r.image || "none" })))
      .catch(() => setImages((x) => ({ ...x, [imgKey]: "error" })));
  }, [imgKey]);

  if (!cur) {
    return (
      <div className="card">
        <h2>Composition</h2>
        <div className="hint">
          {isStaffAny
            ? "Aucun match à venir. Ajoute les prochains matchs dans l'onglet Matchs."
            : scorer ? "La composition apparaîtra ici dès que le coach l'aura envoyée." : "La composition du prochain match apparaîtra ici 2 jours avant la rencontre."}
        </div>
      </div>
    );
  }

  const { m, d } = cur;
  const isStaff = staffFor(m);
  const canEditCompo = canSqC(access, m.squad, "compo");
  const lineup = getLineup(state, m.id);
  const img = imgKey ? images[imgKey] : null;
  async function saveImg() {
    const blob = await (await fetch(img)).blob();
    const name = `dragons-compo-${(m.label || "match").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    const file = new File([blob], name, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "Composition" }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    const a = document.createElement("a"); a.href = img; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  const has = lineup.batting.some(Boolean) || Object.keys(lineup.defense).length > 0;
  const nameOf = (id) => {
    const p = state.roster.find((r) => r.id === id);
    return p ? `${p.prenom} ${p.nom}${p.numero ? " #" + p.numero : ""}` : "—";
  };
  const posOf = (id) => {
    const k = Object.keys(lineup.defense).find((key) => lineup.defense[key] === id);
    const fp = FIELD_POSITIONS.find((f) => f.key === k);
    return id && lineup.dh === id ? "DH" : fp ? fp.short : "";
  };
  const visibleFrom = d ? new Date(d.getTime() - 2 * DAY_MS) : null;
  const fmt = (x) => x.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <div className="card">
        <h2>Composition</h2>
        <select className="match-select" value={m.id} onChange={(e) => setMatchId(e.target.value)}>
          {list.map(({ m: x, lu }) => (
            <option key={x.id} value={x.id}>
              {multi && squadSel === "all" ? `[${(squadById(state, x.squad) || {}).name}] ` : ""}{x.label}{x.opponent ? ` vs ${x.opponent}` : ""} — {x.date || "date à définir"}{staffFor(x) && !(lu && (lu.batting || []).some(Boolean)) ? " (pas encore de compo)" : ""}
            </option>
          ))}
        </select>
        {isStaff && (
          <div className="hint">
            {visibleFrom
              ? (Date.now() >= visibleFrom.getTime()
                  ? "Visible par les joueurs."
                  : `Visible par les joueurs à partir du ${fmt(visibleFrom)}.`)
              : "Date du match non reconnue : les joueurs ne verront pas cette compo. Utilise un format comme « 12 avril »."}
            {canEditCompo ? <>{" "}Pour la modifier : <a href="/compo/" style={{ color: "var(--gold)" }}>Compo &amp; changements</a>.</> : " Lecture seule (casquette entraîneur)."}
          </div>
        )}
      </div>

      {imgKey && img && img !== "none" && img !== "error" ? (
        <div className="card">
          <img src={img} alt={`Composition ${m.label}`} style={{ display: "block", width: "100%", borderRadius: 10 }} />
          <button className="btn-primary small" style={{ marginTop: 12 }} onClick={saveImg}>Enregistrer / partager l'image</button>
        </div>
      ) : imgKey && !img ? (
        <div className="card"><div className="hint">Chargement de la composition…</div></div>
      ) : !has ? (
        <div className="card"><div className="hint">Pas encore de composition pour ce match.</div></div>
      ) : !isStaff ? (
        <div className="card"><div className="hint">
          {img === "error" ? "Pas de réseau : l'image de la composition n'a pas pu être chargée. Réessaie dans un instant." : "La composition arrive bientôt : le coach doit encore l'envoyer depuis Compo & changements."}
        </div></div>
      ) : (
        <>
          <div className="card" style={{ borderColor: "var(--gold)" }}>
            <div className="hint">⚠ Pas d'image pour cette compo : les joueurs ne voient rien tant qu'elle n'est pas renvoyée depuis <a href="/compo/" style={{ color: "var(--gold)" }}>Compo &amp; changements</a> (« Envoyer la compo »).</div>
          </div>
          <div className="card">
            <h2>Défense</h2>
            <div className="field-wrap">
              <FieldDiagram defense={lineup.defense} roster={state.roster} />
            </div>
          </div>
          <div className="card">
            <h2>Ordre au bâton</h2>
            <ol className="compo-order">
              {lineup.batting.map((id, i) => (
                <li key={i}>
                  <span className="compo-n">{i + 1}</span>
                  <span className="compo-name">{id ? nameOf(id) : "—"}</span>
                  <span className="compo-pos">{posOf(id)}</span>
                </li>
              ))}
            </ol>
            {lineup.dh && lineup.defense["Lanceur"] && (
              <div className="hint" style={{ marginTop: 8 }}>
                {nameOf(lineup.dh)} est frappeur désigné (DH) pour {nameOf(lineup.defense["Lanceur"])}.
              </div>
            )}
          </div>
          {lineup.subs && lineup.subs.length > 0 && (
            <div className="card">
              <h2>Changements prévus</h2>
              <ul className="compo-subs">
                {lineup.subs.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Matches admin view (coach only) — edit dates, opponents, scores,   */
/* and a souvenir photo per match                                     */
/* ------------------------------------------------------------------ */

function SeasonManager({ onAddSeason, onSetCurrentSeason, busy }) {
  const ctx = useContext(SeasonContext);
  const [draft, setDraft] = useState("");
  const [msg, setMsg] = useState("");
  const next = String((parseInt(ctx.seasons[0], 10) || new Date().getFullYear()) + 1);
  async function create(makeCurrent) {
    const v = (draft || next).trim();
    if (!/^[0-9]{4}([-/][0-9]{2,4})?$/.test(v)) { setMsg("Saison invalide, par exemple " + next + "."); return; }
    const ok = await onAddSeason(v, makeCurrent);
    if (ok) { setDraft(""); setMsg(`Saison ${v} créée${makeCurrent ? " et passée en cours" : ""}.`); }
  }
  return (
    <div className="card">
      <h2>Saisons</h2>
      <div className="hint" style={{ marginBottom: 10 }}>
        La saison en cours est affichée par défaut dans tous les onglets (Matchs, Suivi, Présences,
        Résultats, Classement). Les anciennes restent consultables avec le sélecteur de saison.
      </div>
      <div className="matches-toolbar" style={{ flexWrap: "wrap", alignItems: "center" }}>
        <label className="field" style={{ margin: 0 }}>
          <span>Saison en cours</span>
          <select className="match-select" style={{ margin: 0 }} value={ctx.current} disabled={busy}
            onChange={(e) => onSetCurrentSeason(e.target.value)}>
            {ctx.seasons.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="field" style={{ margin: 0 }}>
          <span>Nouvelle saison</span>
          <input value={draft} placeholder={next} onChange={(e) => { setDraft(e.target.value); setMsg(""); }} style={{ maxWidth: 120 }} />
        </label>
        <button className="btn-ghost small" disabled={busy} onClick={() => create(false)}>Créer</button>
        <button className="btn-primary small" disabled={busy} onClick={() => create(true)}>Créer et passer dessus</button>
      </div>
      {msg && <div className="hint" style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}

/* ---------------- Équipes adverses & logos ---------------- */
const normT = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
function findTeam(teams, name) {
  const n = normT(name);
  if (!n) return null;
  for (const t of teams || []) {
    const keys = [t.name, ...(t.aliases || [])].map(normT).filter(Boolean);
    if (keys.some((k) => n === k || n.includes(k) || k.includes(n))) return t;
  }
  return null;
}
function teamInitials(name) {
  const w = String(name || "?").split(/\s+/).filter((x) => x && !/^(de|du|des|la|le|les|d'|l')$/i.test(x));
  return ((w[0] || "?")[0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
}
function TeamBubble({ team, name, size = 44 }) {
  const st = { width: size, height: size, borderRadius: "50%", background: "#e7efea", display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flex: "none", boxShadow: `0 0 0 2px ${(team && team.color) || "#9aada2"}` };
  return (
    <span style={st}>
      {team && team.logo
        ? <img src={team.logo} alt="" style={{ width: "84%", height: "84%", objectFit: "contain" }} />
        : <b style={{ color: "#0e1511", fontSize: Math.round(size * 0.36) }}>{teamInitials((team && team.name) || name)}</b>}
    </span>
  );
}
function useTeams() {
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    fetch("/api/teams", { cache: "no-store" }).then((r) => r.json()).then((d) => setTeams(d.teams || [])).catch(() => {});
  }, []);
  return [teams, setTeams];
}
/* Image choisie → carré 256 px (PNG transparent), assez léger pour être stocké */
function imageToLogo(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Lecture impossible"));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image illisible"));
      img.onload = () => {
        const S = 256, c = document.createElement("canvas");
        c.width = S; c.height = S;
        const x = c.getContext("2d"), k = Math.min(S / img.width, S / img.height);
        const w = img.width * k, h = img.height * k;
        x.imageSmoothingQuality = "high";
        x.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
        let d = c.toDataURL("image/png");
        if (d.length > 350 * 1024) d = c.toDataURL("image/webp", 0.9);
        resolve(d);
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
function TeamEditor({ team, token, onSaved, onDeleted, onClose }) {
  const [name, setName] = useState(team.name || "");
  const [aliases, setAliases] = useState((team.aliases || []).join(", "));
  const [color, setColor] = useState(team.color || "#9aada2");
  const [logoData, setLogoData] = useState(null);
  const [msg, setMsg] = useState("");
  const [working, setWorking] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  async function pick(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try { setLogoData(await imageToLogo(f)); setMsg(""); } catch (err) { setMsg(err.message); }
  }
  async function save() {
    setWorking(true); setMsg("");
    try {
      let r = await callApi({ action: "saveTeam", token, team: { id: team.id, name, aliases, color } });
      const saved = r.teams.find((x) => normT(x.name) === normT(name)) || r.teams[r.teams.length - 1];
      if (logoData && saved) r = await callApi({ action: "setTeamLogo", token, id: saved.id, dataUrl: logoData });
      onSaved(r.teams);
    } catch (err) { setMsg(err.message); }
    setWorking(false);
  }
  async function del() {
    setWorking(true);
    try { const r = await callApi({ action: "deleteTeam", token, id: team.id }); onDeleted(r.teams); } catch (err) { setMsg(err.message); }
    setWorking(false);
  }
  const preview = { ...team, name, color, logo: logoData || team.logo };
  return (
    <div className="team-editor">
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12 }}>
        <TeamBubble team={preview} name={name} size={72} />
        <label className="btn-ghost small" style={{ cursor: "pointer" }}>
          {preview.logo ? "Changer le logo" : "Ajouter un logo"}
          <input type="file" accept="image/*" onChange={pick} style={{ display: "none" }} />
        </label>
      </div>
      <label className="field"><span>Nom de l'équipe</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex : Lions de Lille" /></label>
      <label className="field"><span>Autres noms (séparés par des virgules) — ville, surnom… tels qu'ils apparaissent dans le calendrier</span><input value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="ex : Lille, Lions" /></label>
      <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><span>Couleur du club</span><input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 52, height: 34, padding: 2 }} /></label>
      {msg && <div className="hint" style={{ color: "var(--bad)" }}>{msg}</div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
        <button className="btn-primary small" onClick={save} disabled={working || !name.trim()}>{working ? "…" : "Enregistrer"}</button>
        <button className="btn-ghost small" onClick={onClose} disabled={working}>Annuler</button>
        {team.id && (confirmDel
          ? <button className="btn-danger small" onClick={del} disabled={working}>Confirmer la suppression</button>
          : <button className="btn-danger small" onClick={() => setConfirmDel(true)} disabled={working}>Supprimer l'équipe</button>)}
      </div>
    </div>
  );
}
function TeamsManager({ teams, setTeams, token, editing, setEditing }) {
  const sorted = [...teams].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return (
    <div className="card" id="teams-manager">
      <h2>Équipes adverses &amp; logos</h2>
      <div className="hint" style={{ marginBottom: 12, marginTop: 0 }}>
        Crée une équipe, dépose son logo : il s'affiche tout seul sur le live, l'image de fin de match et la page Adversaires
        dès que le nom (ou un de ses autres noms) apparaît dans le calendrier.
      </div>
      <div className="teams-grid">
        {sorted.map((tm) => (
          <button key={tm.id} className={"team-chip" + (editing && editing.id === tm.id ? " active" : "")} onClick={() => setEditing(tm)}>
            <TeamBubble team={tm} size={40} />
            <span><b>{tm.name}</b>{tm.aliases && tm.aliases.length ? <small>{tm.aliases.join(", ")}</small> : null}</span>
          </button>
        ))}
        <button className="team-chip add" onClick={() => setEditing({ name: "", aliases: [], color: "#9aada2" })}>＋ Nouvelle équipe</button>
      </div>
      {editing && (
        <TeamEditor
          key={editing.id || "new:" + editing.name}
          team={editing}
          token={token}
          onSaved={(list) => { setTeams(list); setEditing(null); }}
          onDeleted={(list) => { setTeams(list); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function MatchesView({ token, matches, squads, squadSel, access, onUpdateField, onAddMatch, onDeleteMatch, onReorderMatches, onAddSeason, onSetCurrentSeason, busy }) {
  const multi = (squads || []).length > 1;
  const manageable = (squads || []).filter((q) => canSqC(access, q.id, "manage"));
  const [addSq, setAddSq] = useState(null);
  const addSquad = squadSel && squadSel !== "all" ? squadSel : (addSq || (manageable[0] || {}).id);
  const seasonCtx = useContext(SeasonContext);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // matchId pending delete confirm
  const [seasonFilter, setSeasonFilter] = useState(null);

  const seasons = useSeasonList(matches);
  const [teams, setTeams] = useTeams();
  const [editingTeam, setEditingTeam] = useState(null);
  function openTeam(tm) {
    setEditingTeam(tm);
    setTimeout(() => { const el = document.getElementById("teams-manager"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
  }

  const effectiveFilter = seasonFilter ?? (seasons.current || "all");

  const filteredMatches = useMemo(
    () => matches.filter((m) => effectiveFilter === "all" || (m.season || "—") === effectiveFilter),
    [matches, effectiveFilter]
  );

  function mergeReorder(newFilteredIds) {
    let ptr = 0;
    const merged = matches.map((m) => {
      if (effectiveFilter === "all" || (m.season || "—") === effectiveFilter) {
        const id = newFilteredIds[ptr];
        ptr++;
        return id;
      }
      return m.id;
    });
    onReorderMatches(merged);
  }

  function moveMatch(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= filteredMatches.length) return;
    const ids = filteredMatches.map((m) => m.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(target, 0, moved);
    mergeReorder(ids);
  }

  function sortByDate() {
    const withValue = filteredMatches.map((m, i) => ({ id: m.id, i, v: parseFrenchDateSortValue(m.date) }));
    withValue.sort((a, b) => {
      if (a.v === null && b.v === null) return a.i - b.i;
      if (a.v === null) return 1;
      if (b.v === null) return -1;
      return a.v - b.v;
    });
    mergeReorder(withValue.map((w) => w.id));
  }

  function handleAddMatch() {
    const target = effectiveFilter === "all" ? seasonCtx.current : effectiveFilter;
    onAddMatch(target, addSquad);
    setSeasonFilter(target);
  }

  return (
    <div>
      <SeasonManager onAddSeason={onAddSeason} onSetCurrentSeason={onSetCurrentSeason} busy={busy} />
      <TeamsManager teams={teams} setTeams={setTeams} token={token} editing={editingTeam} setEditing={setEditingTeam} />
      <datalist id="teams-datalist">{teams.map((tm) => <option key={tm.id} value={tm.name} />)}</datalist>
      <div className="card wide">
        <h2>Matchs de la saison {multi && squadSel !== "all" && <SquadChip squad={(squads || []).find((q) => q.id === squadSel)} />}</h2>
        <div className="hint" style={{ marginBottom: 14 }}>
          Renseigne le nom, la date, l'équipe rencontrée et le score final de chaque match.
          Ajoute ou supprime des matchs librement — le nombre de journées et de rencontres n'est
          pas figé. Utilise les flèches ↑↓ pour réordonner un match précis, ou trie
          automatiquement par date.
        </div>

        <select
          className="match-select"
          value={effectiveFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
        >
          {seasons.map((s) => (
            <option key={s} value={s}>Saison {s}</option>
          ))}
          <option value="all">Toutes les saisons</option>
        </select>

        <div className="matches-toolbar">
          {multi && squadSel === "all" && manageable.length > 1 && (
            <select className="match-select" style={{ margin: 0, maxWidth: 200 }} value={addSquad} onChange={(e) => setAddSq(e.target.value)} aria-label="Équipe du nouveau match">
              {manageable.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
          )}
          <button className="btn-primary small" onClick={handleAddMatch} disabled={busy || !addSquad}>
            + Ajouter un match{multi ? ` (${((squads || []).find((q) => q.id === addSquad) || {}).name || ""})` : ""}
          </button>
          <button className="btn-ghost small" onClick={sortByDate} disabled={busy || filteredMatches.length < 2}>
            Trier par date
          </button>
        </div>

        <div className="matches-admin-list">
          {filteredMatches.map((m, index) => (
            <div className="match-admin-card" key={m.id}>
              <div className="match-order-controls">
                <button
                  className="order-btn"
                  onClick={() => moveMatch(index, -1)}
                  disabled={busy || index === 0}
                  title="Monter"
                >
                  ↑
                </button>
                <button
                  className="order-btn"
                  onClick={() => moveMatch(index, 1)}
                  disabled={busy || index === filteredMatches.length - 1}
                  title="Descendre"
                >
                  ↓
                </button>
              </div>
              <div className="match-admin-header">
                <label className="field" style={{ flex: 1, marginBottom: 0 }}>
                  <span>Nom du match</span>
                  <DebouncedInput
                    value={m.label}
                    onCommit={(v) => onUpdateField(m.id, "label", v)}
                    disabled={busy}
                    placeholder="ex: J1 - Match 1"
                  />
                </label>
                {deleteConfirm === m.id ? (
                  <div className="reset-form">
                    <span className="confirm-text">Supprimer ?</span>
                    <button className="btn-danger small" disabled={busy} onClick={() => { onDeleteMatch(m.id); setDeleteConfirm(null); }}>
                      Confirmer
                    </button>
                    <button className="btn-ghost small" onClick={() => setDeleteConfirm(null)}>
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button className="btn-danger small" onClick={() => setDeleteConfirm(m.id)} disabled={busy}>
                    Supprimer ce match
                  </button>
                )}
              </div>
              {multi && (
                <label className="field" style={{ marginBottom: 10 }}>
                  <span>Équipe</span>
                  <select value={m.squad} onChange={(e) => onUpdateField(m.id, "squad", e.target.value)} disabled={busy || manageable.length < 2}>
                    {(squads || []).filter((q) => q.id === m.squad || canSqC(access, q.id, "manage")).map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
                  </select>
                </label>
              )}
              <div className="location-toggle">
                <button
                  className={"loc-btn" + (m.location !== "exterieur" ? " active" : "")}
                  onClick={() => onUpdateField(m.id, "location", "domicile")}
                  disabled={busy}
                >
                  🏠 Domicile
                </button>
                <button
                  className={"loc-btn" + (m.location === "exterieur" ? " active" : "")}
                  onClick={() => onUpdateField(m.id, "location", "exterieur")}
                  disabled={busy}
                >
                  🚌 Extérieur
                </button>
                <button
                  className={"loc-btn loc-btn-cancel" + (m.cancelled ? " active" : "")}
                  onClick={() => onUpdateField(m.id, "cancelled", !m.cancelled)}
                  disabled={busy}
                >
                  🌧️ {m.cancelled ? "Match annulé" : "Marquer annulé"}
                </button>
              </div>
              {m.cancelled && (
                <div className="hint" style={{ marginBottom: 10, color: "var(--bad)" }}>
                  Ce match est marqué comme annulé (pluie ou autre) — il n'apparaît plus dans
                  "Ma présence" et ne compte pas dans le bilan de l'équipe.
                </div>
              )}
              {m.location === "exterieur" && !m.cancelled && (
                <div className="hint" style={{ marginBottom: 10 }}>
                  Match à l'extérieur — le champ "Véhicule" apparaîtra pour les joueurs (covoiturage).
                </div>
              )}
              <div className="row-2">
                <label className="field">
                  <span>Date</span>
                  <DebouncedInput
                    value={m.date}
                    onCommit={(v) => onUpdateField(m.id, "date", v)}
                    disabled={busy}
                    placeholder="ex: 12 avril"
                  />
                </label>
                <label className="field">
                  <span>Heure</span>
                  <DebouncedInput
                    value={m.time || ""}
                    onCommit={(v) => onUpdateField(m.id, "time", v)}
                    disabled={busy}
                    placeholder="ex: 14h"
                  />
                </label>
                <label className="field">
                  <span>Saison</span>
                  <select
                    value={m.season || seasonCtx.current}
                    onChange={(e) => onUpdateField(m.id, "season", e.target.value)}
                    disabled={busy}
                  >
                    {seasons.filter((x) => x !== "—").map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Équipe rencontrée</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {m.opponent ? <TeamBubble team={findTeam(teams, m.opponent)} name={m.opponent} size={38} /> : null}
                  <DebouncedInput
                    value={m.opponent}
                    onCommit={(v) => onUpdateField(m.id, "opponent", v)}
                    disabled={busy}
                    placeholder="ex: Compiègne"
                    list="teams-datalist"
                    autoComplete="off"
                    style={{ flex: 1 }}
                  />
                </div>
              </label>
              {m.opponent && !findTeam(teams, m.opponent) && (
                <div className="hint" style={{ marginTop: -6, marginBottom: 10 }}>
                  Équipe inconnue, pas de logo.{" "}
                  <button className="link-btn" onClick={() => openTeam({ name: m.opponent, aliases: [], color: "#9aada2" })}>＋ Créer « {m.opponent} » et ajouter son logo</button>
                </div>
              )}
              {(() => {
                const innings = getInnings(m);
                const dTotal = inningsTotal(innings.dragons);
                const aTotal = inningsTotal(innings.adversaire);
                const played = innings.dragons.some((v) => typeof v === "number") || innings.adversaire.some((v) => typeof v === "number");
                return played ? (
                  <div className="match-score-summary">
                    Dragons {dTotal} — {aTotal} {m.opponent || "Adversaire"}
                    <span className="hint" style={{ display: "block", marginTop: 4 }}>
                      Détail manche par manche dans l'onglet Résultats
                    </span>
                  </div>
                ) : null;
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Results view (innings scoresheet) — coach can edit, players view   */
/* ------------------------------------------------------------------ */

function ResultsView({ matches, squads, canEditMatch, onSetInning }) {
  const seasons = useSeasonList(matches);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const effectiveSeason = seasonFilter ?? (seasons.current || "all");
  const seasonMatches = useMemo(
    () => matches.filter((m) => effectiveSeason === "all" || (m.season || "—") === effectiveSeason),
    [matches, effectiveSeason]
  );

  const [matchId, setMatchId] = useState(matches[0]?.id);
  const match = seasonMatches.find((m) => m.id === matchId) || seasonMatches[0];

  const seasonPicker = (
    <select
      className="match-select"
      value={effectiveSeason}
      onChange={(e) => { setSeasonFilter(e.target.value); setMatchId(null); }}
    >
      {seasons.map((s) => (
        <option key={s} value={s}>Saison {s}</option>
      ))}
      <option value="all">Toutes les saisons</option>
    </select>
  );

  if (!match) {
    return (
      <div className="card">
        <h2>Résultats</h2>
        {seasonPicker}
        <div className="hint">Aucun match pour cette saison.</div>
      </div>
    );
  }
  const innings = getInnings(match);
  const dTotal = inningsTotal(innings.dragons);
  const aTotal = inningsTotal(innings.adversaire);
  const canEdit = canEditMatch ? canEditMatch(match) : false;
  const sqName = (id) => ((squads || []).find((q) => q.id === id) || {}).name;

  function renderRow(teamKey, teamLabel, total) {
    return (
      <div className="innings-row">
        <div className="innings-team-label">{teamLabel}</div>
        {innings[teamKey].slice(0, 7).map((val, i) => (
          <div className="innings-cell" key={i}>
            {canEdit ? (
              <DebouncedInput
                type="number"
                value={val === null || val === undefined ? "" : val}
                onCommit={(v) => onSetInning(match.id, teamKey, i, v === "" ? null : Number(v))}
              />
            ) : (
              <span>{val === null || val === undefined ? "—" : val}</span>
            )}
          </div>
        ))}
        <div className="innings-total">{total}</div>
      </div>
    );
  }

  return (
    <div className="card wide">
      <h2>Résultats — feuille de score</h2>
      {seasonPicker}
      <select className="match-select" value={match.id} onChange={(e) => setMatchId(e.target.value)}>
        {seasonMatches.map((m) => (
          <option key={m.id} value={m.id}>{squads ? `[${sqName(m.squad)}] ` : ""}{m.label}{m.opponent ? ` vs ${m.opponent}` : ""}{m.cancelled ? " (annulé)" : ""}</option>
        ))}
      </select>
      {!canEdit && <div className="hint" style={{ marginBottom: 12 }}>Vue en lecture seule — seul le coaching staff peut saisir les scores.</div>}
      {match.cancelled && (
        <div className="hint" style={{ marginBottom: 12, color: "var(--bad)" }}>
          Ce match a été annulé (pluie ou autre) et n'a pas été rejoué — aucun score à saisir.
        </div>
      )}

      <div className="innings-table">
        <div className="innings-row innings-header">
          <div className="innings-team-label"></div>
          {Array.from({ length: 7 }, (_, i) => (
            <div className="innings-cell innings-header-cell" key={i}>{i + 1}</div>
          ))}
          <div className="innings-total innings-header-cell">Total</div>
        </div>
        {renderRow("dragons", "Dragons", dTotal)}
        {renderRow("adversaire", match.opponent || "Adversaire", aTotal)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Standings / classement view                                         */
/* ------------------------------------------------------------------ */

function StandingsView({ standings, squads, showSquad, canEditTeam, canAdd, onUpdateField, onAddTeam, onDeleteTeam, busy }) {
  const canEdit = !!canAdd || (standings || []).some((t) => canEditTeam && canEditTeam(t));
  const seasonCtx = useContext(SeasonContext);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);

  const seasons = useSeasonList(standings);

  const effectiveFilter = seasonFilter ?? (seasons.current || "all");

  const filteredStandings = useMemo(
    () => (standings || []).filter((t) => effectiveFilter === "all" || (t.season || "—") === effectiveFilter),
    [standings, effectiveFilter]
  );

  const rows = useMemo(() => {
    const withStats = filteredStandings.map((t) => {
      const w = Number(t.w) || 0;
      const l = Number(t.l) || 0;
      const tt = Number(t.t) || 0;
      const played = w + l + tt;
      const pct = played > 0 ? w / played : 0;
      return { ...t, w, l, t: tt, pct };
    });
    const sorted = [...withStats].sort((a, b) => b.pct - a.pct);
    const leader = sorted[0];
    return sorted.map((team) => {
      const gb = leader ? (leader.w - team.w + (team.l - leader.l)) / 2 : 0;
      return { ...team, gb };
    });
  }, [filteredStandings]);

  function handleAddTeam() {
    const target = effectiveFilter === "all" ? seasonCtx.current : effectiveFilter;
    onAddTeam(target);
    setSeasonFilter(target);
  }

  return (
    <div className="card wide">
      <h2>Classement</h2>
      {showSquad && <div className="hint" style={{ marginBottom: 10 }}>Choisis une équipe en haut pour voir son classement : chaque équipe a sa propre ligue.</div>}
      {!canEdit && <div className="hint" style={{ marginBottom: 12 }}>Vue en lecture seule — mis à jour manuellement par le coaching staff d'après le classement officiel.</div>}
      {canEdit && (
        <div className="hint" style={{ marginBottom: 14 }}>
          Recopie les chiffres depuis la page de classement officielle de la ligue. Le PCT et
          le nombre de matchs d'écart (GB) se calculent automatiquement. Les nouvelles saisons se
          créent dans l'onglet Matchs ; une équipe ajoutée va dans la saison sélectionnée ci-dessous.
        </div>
      )}

      <select
        className="match-select"
        value={effectiveFilter}
        onChange={(e) => setSeasonFilter(e.target.value)}
      >
        {seasons.map((s) => (
          <option key={s} value={s}>Saison {s}</option>
        ))}
        <option value="all">Toutes les saisons</option>
      </select>

      <div className="standings-table">
        <div className="standings-row standings-header">
          <div>#</div>
          <div>Équipe</div>
          <div>V</div>
          <div>D</div>
          <div>N</div>
          <div>PCT</div>
          <div>GB</div>
          {canEdit && <div></div>}
        </div>
        {rows.map((team, idx) => (
          <div className="standings-row" key={team.id}>
            <div className="standings-rank sr-rank">{idx + 1}</div>
            <div className="sr-team">
              {showSquad && <SquadChip squad={(squads || []).find((q) => q.id === team.squad)} small />}
              {canEditTeam && canEditTeam(team) ? (
                <>
                  <DebouncedInput
                    className="standings-team-input"
                    value={team.team}
                    onCommit={(v) => onUpdateField(team.id, "team", v)}
                    disabled={busy}
                  />
                  <select
                    className="standings-season-input"
                    value={team.season || seasonCtx.current}
                    onChange={(e) => { onUpdateField(team.id, "season", e.target.value); setSeasonFilter(e.target.value); }}
                    disabled={busy}
                  >
                    {seasons.filter((x) => x !== "—").map((x) => <option key={x} value={x}>Saison {x}</option>)}
                  </select>
                </>
              ) : (
                <span className="standings-team-name">{team.team}</span>
              )}
            </div>
            {["w", "l", "t"].map((field) => (
              <div key={field} className={"sr-" + field}>
                <span className="sr-mobile-label">{field.toUpperCase()}</span>
                {canEditTeam && canEditTeam(team) ? (
                  <DebouncedInput
                    type="number"
                    className="standings-num-input"
                    value={team[field]}
                    onCommit={(v) => onUpdateField(team.id, field, v === "" ? 0 : Number(v))}
                    disabled={busy}
                  />
                ) : (
                  <span>{team[field]}</span>
                )}
              </div>
            ))}
            <div className="sr-pct">
              <span className="sr-mobile-label">PCT</span>
              {team.pct.toFixed(3).replace(/^0/, "")}
            </div>
            <div className="sr-gb">
              <span className="sr-mobile-label">GB</span>
              {idx === 0 ? "—" : team.gb.toFixed(1)}
            </div>
            {canEdit && (canEditTeam && canEditTeam(team) ? (
              <div className="sr-actions">
                {deleteConfirm === team.id ? (
                  <div className="reset-form">
                    <button className="btn-danger small" disabled={busy} onClick={() => { onDeleteTeam(team.id); setDeleteConfirm(null); }}>
                      OK
                    </button>
                    <button className="btn-ghost small" onClick={() => setDeleteConfirm(null)}>
                      X
                    </button>
                  </div>
                ) : (
                  <button className="btn-danger small" onClick={() => setDeleteConfirm(team.id)} disabled={busy}>
                    Retirer
                  </button>
                )}
              </div>
            ) : <div />)}
          </div>
        ))}
        {rows.length === 0 && (
          <div className="standings-row">
            <div className="hint" style={{ padding: "8px 0" }}>Aucune équipe pour l'instant.</div>
          </div>
        )}
      </div>

      {canAdd && (
        <button className="btn-primary small" onClick={handleAddTeam} disabled={busy} style={{ marginTop: 14 }}>
          + Ajouter une équipe
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* History view — past matches across seasons, with a simple trend     */
/* ------------------------------------------------------------------ */

/* Récap d'un match saisi sur la feuille de match (lecture seule, tous les comptes) */
const RECAP_TAG = { "1B": "1B", "2B": "2B", "3B": "3B", HR: "HR", BB: "BB", HBP: "HBP", K: "K", KD: "K", GO: "GO", FO: "FO", E: "E", FC: "FC", SAC: "SAC", CI: "CI" };
const RECAP_HIT = new Set(["1B", "2B", "3B", "HR"]);
function recapAvg(h, ab) { return ab ? (h / ab).toFixed(3).replace(/^0/, "") : "—"; }
function recapSum(o) { return Object.values(o || {}).reduce((a, b) => a + (Number(b) || 0), 0); }

const RECAP_POS = { P: "lanceur", C: "receveur", "1B": "1re base", "2B": "2e base", "3B": "3e base", SS: "arrêt-court", LF: "champ gauche", CF: "champ centre", RF: "champ droit" };
const RECAP_RES = { "1B": "Simple", "2B": "Double", "3B": "Triple", HR: "Home run", GO: "Retiré au sol", FO: "Retiré en flèche", E: "Sur erreur", FC: "Choix défensif", SAC: "Sacrifice" };

/* Carte des frappes du récap (même dessin que la feuille de match, via /match/spray.js) */
function RecapSpray({ rc, myId }) {
  const withPts = (rc.rows || []).filter((r) => (r.spr || []).length);
  const [who, setWho] = useState(() => (withPts.some((r) => r.id === myId) ? myId : ""));
  const S = typeof window !== "undefined" ? window.DragonsSpray : null;
  if (!S) return <div className="hint">Carte indisponible.</div>;
  const sel = withPts.find((r) => r.id === who);
  const pts = (sel ? [sel] : withPts).flatMap((r) => r.spr.map(([x, y, res, bt, pos]) => ({ loc: [x, y], res, bt, pos, n: r.n, title: `${r.n} · ${RECAP_RES[res] || res}` })));
  const hits = pts.filter((p) => S.cat(p.res) === "hit").length;
  return (
    <div className="recap-spray">
      <select className="match-select" value={who} onChange={(e) => setWho(e.target.value)} aria-label="Joueur">
        <option value="">Toute l’équipe</option>
        {withPts.map((r) => <option key={r.id} value={r.id}>{r.n}{r.id === myId ? " (toi)" : ""}</option>)}
      </select>
      <div className="hint" style={{ textAlign: "center" }}>{pts.length} balle{pts.length > 1 ? "s" : ""} en jeu · {hits} hit{hits > 1 ? "s" : ""}</div>
      <div dangerouslySetInnerHTML={{ __html: S.svg(pts, { max: 380 }) + S.legend() }} />
      {sel && (
        <div className="recap-list">
          {sel.spr.map(([, , res, , pos], i) => (
            <div key={i} className="recap-li"><span className={"recap-tag" + (RECAP_HIT.has(res) ? " hit" : "")}>{RECAP_RES[res] || res}</span><span>vers {RECAP_POS[pos] || pos}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

/* MVP du match : choix du coach + vote des coéquipiers (3 jours, résultat caché jusqu'à la clôture) */
function MvpBox({ rc, myId, token, onChange }) {
  const mv = rc.mvp;
  const [pick, setPick] = useState(false);
  const [sel, setSel] = useState(mv && mv.coach ? mv.coach.pid : "");
  const [why, setWhy] = useState(mv && mv.coach ? mv.coach.why : "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (!mv) return null;
  const rows = rc.rows || [];
  const run = async (action, extra) => {
    setBusy(true); setErr("");
    try { const r = await callApi({ action, token, sheetId: rc.id, ...extra }); onChange(r.mvp); return true; }
    catch (e) { setErr(e.message); return false; }
    finally { setBusy(false); }
  };
  let close = "";
  try { close = new Date(mv.closesAt).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch (e) { /* ignore */ }
  return (
    <div className="mvp-box">
      <div className="mvp-line">
        <span className="mvp-ico" aria-hidden="true">🏆</span>
        <div className="mvp-main">
          <div className="mvp-k">MVP du coach</div>
          {mv.coach ? (
            <div><b>{mv.coach.n}</b>{mv.coach.why ? <span className="mvp-why"> « {mv.coach.why} »</span> : null}</div>
          ) : <div className="mvp-none">{mv.canPick ? "Pas encore choisi." : "Pas encore choisi par le coach."}</div>}
        </div>
        {mv.canPick && !pick && <button className="btn-ghost small" onClick={() => setPick(true)}>{mv.coach ? "Changer" : "Choisir"}</button>}
      </div>
      {pick && (
        <div className="mvp-pick">
          <select value={sel} onChange={(e) => setSel(e.target.value)}>
            <option value="">— Joueur —</option>
            {rows.map((r) => <option key={r.id} value={r.id}>{r.n}{r.num ? " #" + r.num : ""}</option>)}
          </select>
          <input value={why} maxLength={90} onChange={(e) => setWhy(e.target.value)} placeholder="Un petit mot (optionnel) : 2 sur 2 et un triple décisif" />
          <div className="mvp-actions">
            <button className="btn-primary small" disabled={busy || !sel} onClick={async () => { if (await run("setCoachMvp", { pid: sel, why })) setPick(false); }}>Valider</button>
            {mv.coach && <button className="btn-ghost small" disabled={busy} onClick={async () => { if (await run("setCoachMvp", { pid: null })) { setSel(""); setWhy(""); setPick(false); } }}>Retirer</button>}
            <button className="btn-ghost small" onClick={() => setPick(false)}>Annuler</button>
          </div>
        </div>
      )}
      <div className="mvp-line">
        <span className="mvp-ico" aria-hidden="true">🏅</span>
        <div className="mvp-main">
          <div className="mvp-k">MVP des coéquipiers</div>
          {mv.open ? (
            <div className="mvp-sub">Vote ouvert jusqu'au {close} · {mv.count} vote{mv.count > 1 ? "s" : ""} · résultat à la clôture</div>
          ) : mv.result ? (
            <div><b>{mv.result.map((x) => x.n).join(" & ")}</b> <span className="mvp-sub">· {mv.result[0].v} voix{mv.result.length > 1 ? " chacun (co-MVP)" : ""} sur {mv.count}</span></div>
          ) : <div className="mvp-none">Vote clos, pas de vote.</div>}
        </div>
        {mv.canPick && (mv.open
          ? <button className="btn-ghost small" disabled={busy} onClick={() => run("closeMvpVote", {})}>Clôturer</button>
          : <button className="btn-ghost small" disabled={busy} onClick={() => run("closeMvpVote", { reopen: true })}>Rouvrir 3 j</button>)}
      </div>
      {mv.canVote && (
        <div className="mvp-vote">
          <div className="mvp-sub" style={{ marginBottom: 6 }}>{mv.myVote ? "Ton vote (tu peux changer jusqu'à la clôture) :" : "Ton vote : qui a été le meilleur ? (pas toi 😉)"}</div>
          <div className="mvp-chips">
            {rows.filter((r) => r.id !== myId).map((r) => (
              <button key={r.id} className={"mvp-chip" + (mv.myVote === r.id ? " on" : "")} disabled={busy} onClick={() => run("voteMvp", { pid: r.id })}>{r.n}</button>
            ))}
          </div>
        </div>
      )}
      {err && <div className="error" style={{ marginTop: 6 }}>{err}</div>}
    </div>
  );
}

/* Accueil joueur : les votes MVP en attente (matchs joués, vote ouvert, pas encore voté) */
function MvpVoteCard({ token, myId }) {
  const [list, setList] = useState([]);
  const [done, setDone] = useState({});
  useEffect(() => {
    if (!token) return;
    let alive = true;
    callApi({ action: "getRecaps", token }).then((d) => { if (alive) setList((d.recaps || []).filter((rc) => rc.mvp && rc.mvp.canVote && !rc.mvp.myVote)); }).catch(() => {});
    return () => { alive = false; };
  }, [token]);
  if (!list.length) return null;
  return (
    <div className="card mvp-card">
      <div className="call-tag" style={{ background: "#E9C46A", color: "#1a1406" }}>VOTE MVP</div>
      {list.map((rc) => (
        <div key={rc.id} style={{ marginTop: 8 }}>
          <div className="call-when" style={{ marginBottom: 6 }}>{rc.home ? "Dragons – " + rc.opp : rc.opp + " – Dragons"} · {recapSum(rc.us)}-{recapSum(rc.them)}</div>
          {done[rc.id] ? <div className="ok-msg">Vote enregistré ✓ Résultat à la clôture, dans Historique.</div>
            : <MvpBox rc={rc} myId={myId} token={token} onChange={(mvp) => { setList((l) => l.map((x) => (x.id === rc.id ? { ...x, mvp } : x))); if (mvp.myVote) setDone((d) => ({ ...d, [rc.id]: true })); }} />}
        </div>
      ))}
    </div>
  );
}

function RecapCard({ rc, myId, token, onMvp }) {
  const [part, setPart] = useState("stats");
  const hasSpray = (rc.rows || []).some((r) => (r.spr || []).length);
  const inns = Math.max(rc.kind === "amical" ? 1 : 7, Number(rc.inns) || 7);
  const cols = Array.from({ length: inns }, (_, i) => i + 1);
  const rows = rc.rows || [];
  const T = rows.reduce((a, r) => { ["pa", "ab", "h", "d", "t", "hr", "r", "rbi", "bb", "k", "sb"].forEach((k) => (a[k] = (a[k] || 0) + (r[k] || 0))); return a; }, {});
  const cell = (o, i) => (o && o[i] != null ? o[i] : i <= (rc.inns || 0) ? 0 : "");
  return (
    <div className="hist-comp recap">
      {rc.mvp && <MvpBox rc={rc} myId={myId} token={token} onChange={onMvp} />}
      <div className="recap-scroll">
        <table className="recap-table recap-line">
          <thead><tr><th className="l">Manche</th>{cols.map((i) => <th key={i}>{i}</th>)}<th>R</th><th>H</th></tr></thead>
          <tbody>
            <tr><td className="l"><b>Dragons</b></td>{cols.map((i) => <td key={i}>{cell(rc.us, i)}</td>)}<td><b>{recapSum(rc.us)}</b></td><td>{T.h || 0}</td></tr>
            <tr><td className="l">{rc.opp}</td>{cols.map((i) => <td key={i}>{cell(rc.them, i)}</td>)}<td><b>{recapSum(rc.them)}</b></td><td></td></tr>
          </tbody>
        </table>
      </div>
      <div className="recap-tabs" role="tablist">
        {[["stats", "Stats"], ...(hasSpray ? [["spray", "Frappes"]] : []), ["pitch", "Lanceurs"], ["log", "Déroulé"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={part === k} className={"recap-tab" + (part === k ? " on" : "")} onClick={() => setPart(k)}>{l}</button>
        ))}
      </div>
      {part === "stats" && (
        <div className="recap-scroll">
          <table className="recap-table">
            <thead><tr><th className="l">Joueur</th><th>AB</th><th>H</th><th>R</th><th>RBI</th><th>HR</th><th>BB</th><th>K</th><th>SB</th><th>AVG</th><th className="l">Passages</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.id === myId ? "me" : ""}>
                  <td className="l"><b>{r.n}</b>{r.num ? <span className="recap-num"> #{r.num}</span> : null}</td>
                  <td>{r.ab}</td><td>{r.h}</td><td>{r.r}</td><td>{r.rbi}</td><td>{r.hr}</td><td>{r.bb}</td><td>{r.k}</td><td>{r.sb}</td><td>{recapAvg(r.h, r.ab)}</td>
                  <td className="l recap-res">{(r.res || []).map((x, i) => <span key={i} className={"recap-tag" + (RECAP_HIT.has(x) ? " hit" : "")}>{RECAP_TAG[x] || x}</span>)}</td>
                </tr>
              ))}
              <tr className="tot"><td className="l">Équipe</td><td>{T.ab || 0}</td><td>{T.h || 0}</td><td>{T.r || 0}</td><td>{T.rbi || 0}</td><td>{T.hr || 0}</td><td>{T.bb || 0}</td><td>{T.k || 0}</td><td>{T.sb || 0}</td><td>{recapAvg(T.h || 0, T.ab || 0)}</td><td></td></tr>
            </tbody>
          </table>
        </div>
      )}
      {part === "spray" && <RecapSpray rc={rc} myId={myId} />}
      {part === "pitch" && (
        <div className="recap-list">
          {(rc.pitchers || []).length === 0 && <div className="hint">Aucun lancer compté.</div>}
          {(rc.pitchers || []).map((p) => (
            <div key={p.id} className={"recap-li" + (p.id === myId ? " me" : "")}><b>{p.n}</b><span className="recap-big">{p.pc} <small>lancers</small></span></div>
          ))}
        </div>
      )}
      {part === "log" && (
        <div className="recap-log">
          {(rc.feed || []).length === 0 && <div className="hint">Pas de déroulé enregistré.</div>}
          {(rc.feed || []).map((f, i) => {
            const newInn = i === 0 || (rc.feed[i - 1] || {}).inn !== f.inn;
            return (
              <React.Fragment key={i}>
                {newInn && f.inn ? <div className="recap-inn">{f.inn}e manche</div> : null}
                <div className={"recap-ev k-" + (f.k || "")}>{f.txt}</div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecapsSection({ token, myId, squadSel, squads }) {
  const [recaps, setRecaps] = useState(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(null);
  const [all, setAll] = useState(false);
  useEffect(() => {
    if (!token) return;
    let alive = true;
    callApi({ action: "getRecaps", token })
      .then((d) => { if (alive) setRecaps(d.recaps || []); })
      .catch((e) => { if (alive) { setErr(e.message); setRecaps([]); } });
    return () => { alive = false; };
  }, [token]);
  if (recaps === null) return <div className="card"><h2>Récaps des matchs</h2><div className="hint">Chargement…</div></div>;
  const multi = (squads || []).length > 1;
  const shown = recaps.filter((rc) => !multi || !squadSel || squadSel === "all" || (rc.squad || squads[0].id) === squadSel);
  const list = all ? shown : shown.slice(0, 6);
  return (
    <div className="card">
      <h2>Récaps des matchs</h2>
      <div className="hint" style={{ marginBottom: 10 }}>Feuilles de match terminées, en lecture seule : score par manche, stats de chacun, lanceurs et déroulé.</div>
      {err && <div className="hint">Récaps indisponibles pour l’instant ({err}).</div>}
      {!err && shown.length === 0 && <div className="hint">Aucun match terminé pour l’instant. Le récap arrive ici dès que le coach clôt la feuille de match.</div>}
      <div className="hist-list">
        {list.map((rc) => {
          const us = recapSum(rc.us), them = recapSum(rc.them);
          const res = us > them ? "V" : us < them ? "D" : "N";
          const mine = myId && (rc.rows || []).find((r) => r.id === myId);
          const expanded = open === rc.id;
          let dateTxt = rc.date;
          try { dateTxt = new Date(rc.date + "T12:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); } catch (e) { /* keep raw */ }
          return (
            <div className="hist-row-wrap" key={rc.id}>
              <button className="hist-row recap-row" onClick={() => setOpen(expanded ? null : rc.id)} aria-expanded={expanded}>
                <div className="hist-row-main">
                  <div className="hist-row-title">{rc.home ? "Dragons – " + rc.opp : rc.opp + " – Dragons"}<span className="hist-row-season"> · {rc.kind === "amical" ? "Amical" : "Saison"}{multi && rc.squadName ? " · " + rc.squadName : ""}</span></div>
                  <div className="hist-row-date">{dateTxt}{mine && mine.ab ? ` · toi : ${mine.h}/${mine.ab}${mine.rbi ? `, ${mine.rbi} RBI` : ""}` : ""}</div>
                  {rc.mvp && (rc.mvp.coach || rc.mvp.result || (rc.mvp.canVote && !rc.mvp.myVote)) && (
                    <div className="hist-row-mvp">
                      {rc.mvp.coach && <span>🏆 {rc.mvp.coach.n}</span>}
                      {rc.mvp.result && <span>🏅 {rc.mvp.result.map((x) => x.n).join(" & ")}</span>}
                      {rc.mvp.canVote && !rc.mvp.myVote && <span className="mvp-todo">🗳️ vote MVP ouvert</span>}
                    </div>
                  )}
                </div>
                <div className="hist-row-right">
                  <span className="hist-row-score">{us} — {them}</span>
                  <span className="pill" style={{ background: res === "V" ? "var(--ok)" : res === "D" ? "var(--bad)" : "var(--warn)" }}>{res === "V" ? "Victoire" : res === "D" ? "Défaite" : "Nul"}</span>
                  <span className="recap-chev" aria-hidden="true">{expanded ? "▴" : "▾"}</span>
                </div>
              </button>
              {expanded && <RecapCard rc={rc} myId={myId} token={token} onMvp={(mvp) => setRecaps((l) => l.map((x) => (x.id === rc.id ? { ...x, mvp } : x)))} />}
            </div>
          );
        })}
      </div>
      {shown.length > 6 && <button className="btn-ghost small" style={{ marginTop: 10 }} onClick={() => setAll(!all)}>{all ? "Voir moins" : `Voir les ${shown.length} récaps`}</button>}
    </div>
  );
}

function HistoryView({ matches, lineups, roster, token, myId, squadSel, squads }) {
  const seasons = useSeasonList(matches);

  const [seasonFilter, setSeasonFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    return matches.filter((m) => seasonFilter === "all" || (m.season || "—") === seasonFilter);
  }, [matches, seasonFilter]);

  const rows = useMemo(() => {
    return filtered.map((m) => {
      const result = matchResult(m);
      const dTotal = inningsTotal((m.innings || emptyInnings()).dragons);
      const aTotal = inningsTotal((m.innings || emptyInnings()).adversaire);
      return { ...m, result, dTotal, aTotal };
    });
  }, [filtered]);

  const stats = useMemo(() => {
    const played = rows.filter((r) => r.result);
    const v = played.filter((r) => r.result === "V").length;
    const d = played.filter((r) => r.result === "D").length;
    const pct = played.length > 0 ? v / played.length : 0;
    return { v, d, played: played.length, pct };
  }, [rows]);

  const resultLabel = { V: "Victoire", D: "Défaite" };
  const resultClass = { V: "hist-v", D: "hist-d" };

  function playerName(playerId) {
    const p = roster.find((r) => r.id === playerId);
    return p ? `${p.prenom} ${p.nom}` : null;
  }

  return (
    <>
    <RecapsSection token={token} myId={myId} squadSel={squadSel} squads={squads} />
    <div className="card">
      <h2>Historique des matchs</h2>

      <select className="match-select" value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
        <option value="all">Toutes les saisons</option>
        {seasons.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="hist-summary">
        <div className="hist-stat">
          <div className="hist-stat-num">{stats.v}</div>
          <div className="hist-stat-label">Victoires</div>
        </div>
        <div className="hist-stat">
          <div className="hist-stat-num">{stats.d}</div>
          <div className="hist-stat-label">Défaites</div>
        </div>
        <div className="hist-stat">
          <div className="hist-stat-num">{stats.played > 0 ? Math.round(stats.pct * 100) + "%" : "—"}</div>
          <div className="hist-stat-label">Taux de victoire</div>
        </div>
      </div>

      {rows.some((r) => r.result) && (
        <div className="hist-trend">
          {rows.filter((r) => r.result).map((r) => (
            <span key={r.id} className={"hist-chip " + resultClass[r.result]} title={`${r.label} — ${resultLabel[r.result]}`}>
              {r.result}
            </span>
          ))}
        </div>
      )}

      <div className="hist-list">
        {rows.length === 0 && <div className="hint">Aucun match pour cette saison.</div>}
        {rows.map((r) => {
          const lineup = getLineup({ lineups }, r.id);
          const defenseEntries = FIELD_POSITIONS.filter((fp) => lineup.defense[fp.key]);
          const battingEntries = lineup.batting.filter(Boolean);
          const hasComposition = defenseEntries.length > 0 || battingEntries.length > 0;
          const expanded = expandedId === r.id;
          return (
            <div className="hist-row-wrap" key={r.id}>
              <div className="hist-row">
                <div className="hist-row-main">
                  <div className="hist-row-title">
                    {r.label}{r.opponent ? ` vs ${r.opponent}` : ""}
                    <span className="hist-row-season"> · {r.season || "—"}</span>
                  </div>
                  <div className="hist-row-date">{r.date}</div>
                </div>
                <div className="hist-row-right">
                  {r.result ? (
                    <>
                      <span className="hist-row-score">{r.dTotal} — {r.aTotal}</span>
                      <span className="pill" style={{
                        background: r.result === "V" ? "var(--ok)" : r.result === "D" ? "var(--bad)" : "var(--warn)",
                      }}>
                        {resultLabel[r.result]}
                      </span>
                    </>
                  ) : r.cancelled ? (
                    <span className="pill" style={{ background: "var(--bad)" }}>Annulé</span>
                  ) : (
                    <span className="pill pill-empty">Pas encore joué</span>
                  )}
                  <button
                    className="btn-ghost small"
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                  >
                    {expanded ? "Masquer" : "Composition"}
                  </button>
                </div>
              </div>
              {expanded && (
                <div className="hist-comp">
                  {!hasComposition && <div className="hint">Composition non renseignée pour ce match.</div>}
                  {defenseEntries.length > 0 && (
                    <div className="hist-comp-block">
                      <div className="hist-comp-title">Défense</div>
                      <div className="field-wrap field-wrap-history">
                        <FieldDiagram defense={lineup.defense} roster={roster} />
                      </div>
                    </div>
                  )}
                  {battingEntries.length > 0 && (
                    <div className="hist-comp-block">
                      <div className="hist-comp-title">Ordre au bâton</div>
                      <div className="hist-comp-batting">
                        {lineup.batting.map((playerId, idx) =>
                          playerId ? (
                            <div className="hist-comp-item" key={idx}>
                              <span className="hist-comp-poste">{idx + 1}</span>
                              <span>{playerName(playerId) || "—"}</span>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Read-only presence roster view (for players)                        */
/* ------------------------------------------------------------------ */

function PresenceRosterView({ state, squads, squadSel, access }) {
  const seasons = useSeasonList(state.matches);
  const [seasonFilter, setSeasonFilter] = useState(null);
  const effectiveSeason = seasonFilter ?? (seasons.current || "all");
  const multi = (squads || []).length > 1;
  // matchs des équipes dont on voit les présences (son équipe, ou celles qu'on encadre)
  const visible = (m) => canSqC(access, m.squad, "read") || (access && access.member[m.squad]) || calledFor(state, m.id, access && access.playerId);
  const seasonMatches = useMemo(
    () => state.matches.filter((m) => (effectiveSeason === "all" || (m.season || "—") === effectiveSeason) && (!squadSel || squadSel === "all" || m.squad === squadSel) && visible(m)),
    [state.matches, effectiveSeason, squadSel]
  );

  const [matchId, setMatchId] = useState(state.matches[0]?.id);
  const match = seasonMatches.find((m) => m.id === matchId) || seasonMatches[0];

  const rows = useMemo(() => {
    const statusOrder = { present: 0, reserve: 1, absent: 2 };
    return state.roster
      .filter((p) => !match || memberOf(state, p.id, match.squad) === "reg" || calledFor(state, match.id, p.id) || (state.presence[p.id] || {})[match.id])
      .map((p) => ({
        ...p,
        status: match ? (state.presence[p.id] || {})[match.id] : undefined,
      }))
      .sort((a, b) => {
        const orderA = statusOrder[a.status] ?? 3;
        const orderB = statusOrder[b.status] ?? 3;
        if (orderA !== orderB) return orderA - orderB;
        return (a.nom + a.prenom).localeCompare(b.nom + b.prenom);
      });
  }, [state, match]);

  return (
    <div className="card wide">
      <h2>Présences de l'équipe {multi && match && <SquadChip squad={squadById(state, match.squad)} />}</h2>
      <select
        className="match-select"
        value={effectiveSeason}
        onChange={(e) => { setSeasonFilter(e.target.value); setMatchId(null); }}
      >
        {seasons.map((s) => (
          <option key={s} value={s}>Saison {s}</option>
        ))}
        <option value="all">Toutes les saisons</option>
      </select>
      {!match ? (
        <div className="hint">{multi && access && !Object.keys(access.member || {}).length && !canAnyC(access, "read") ? "Les présences s'affichent pour les équipes dont tu fais partie." : "Aucun match pour cette saison."}</div>
      ) : (
      <select className="match-select" value={match.id} onChange={(e) => setMatchId(e.target.value)}>
        {seasonMatches.map((m) => (
          <option key={m.id} value={m.id}>{m.label}{m.opponent ? ` vs ${m.opponent}` : ""} — {m.date}</option>
        ))}
      </select>
      )}
      {match && (
      <div className="grid-table">
        <div className="grid-header grid-header-with-vehicule">
          <div>Joueur</div>
          <div>Postes</div>
          <div>Statut</div>
          <div>Véhicule</div>
        </div>
        {rows.map((p) => {
          const pos = state.positions[p.id] || {};
          const vehicule = (state.presence[p.id] || {})[match.id + "-vehicule"];
          return (
            <div className="grid-row grid-row-with-vehicule" key={p.id}>
              <div className="grid-name">{p.prenom} {p.nom}{p.numero ? ` · #${p.numero}` : ""}</div>
              <div className="grid-pos">{[pos.pos1, pos.pos2, pos.pos3].filter(Boolean).join(" · ") || "—"}</div>
              <div><StatusPill value={p.status} /></div>
              <div className="grid-vehicule">
                {vehicule === "Oui" ? "🚗 Oui" : vehicule === "Non" ? "Non" : "—"}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* V3 · Joueurs du club : habituel / renfort, équipe par équipe        */
/* ------------------------------------------------------------------ */
const MEMBER_NEXT = { "": "reg", reg: "renf", renf: "" };
function MembersView({ state, squads, squadSel, access, onSetMember, busy }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const cols = squads || [];
  const counts = cols.map((q) => ({
    q,
    reg: state.roster.filter((p) => memberOf(state, p.id, q.id) === "reg").length,
    renf: state.roster.filter((p) => memberOf(state, p.id, q.id) === "renf").length,
  }));
  const none = state.roster.filter((p) => cols.every((q) => !memberOf(state, p.id, q.id)));
  const rows = state.roster
    .filter((p) => `${p.prenom} ${p.nom} ${p.numero || ""}`.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => filter === "all" || (filter === "none" ? cols.every((q) => !memberOf(state, p.id, q.id)) : memberOf(state, p.id, filter)))
    .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom));
  const canCol = (q) => canSqC(access, q.id, "roster");
  return (
    <div>
      <div className="card wide">
        <h2>Joueurs du club · qui joue où</h2>
        <div className="hint" style={{ marginBottom: 10 }}>
          <b>Habituel</b> : présences demandées à chaque match de l'équipe. <b>Renfort</b> : seulement quand le coach l'appelle pour un match.
          Un appui fait tourner Habituel → Renfort → —. Chaque coach gère sa colonne, le propriétaire gère tout. Rien n'est figé : ça se change toute la saison.
        </div>
        <div className="members-sum">
          {counts.map(({ q, reg, renf }) => (
            <div className="ms-card" key={q.id} style={{ "--sq": q.color }}>
              <div className="ms-name"><i aria-hidden="true" />{q.name}{q.level ? <span> · {q.level}</span> : null}</div>
              <div className="ms-n"><b className={reg >= (q.target || 12) ? "ok" : "low"}>{reg}</b> / {q.target || 12} habituels · {renf} renfort{renf > 1 ? "s" : ""}</div>
              {reg < (q.target || 12) && <div className="ms-warn">Il en manque {(q.target || 12) - reg} pour l'objectif.</div>}
            </div>
          ))}
          <div className="ms-card none"><div className="ms-name">Sans équipe</div><div className="ms-n"><b>{none.length}</b> joueur{none.length > 1 ? "s" : ""}</div></div>
        </div>
        <div className="members-tools">
          <input className="search" style={{ margin: 0, flex: 1 }} placeholder="Rechercher un joueur…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="match-select" style={{ margin: 0, maxWidth: 220 }} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtre">
            <option value="all">Tous les joueurs</option>
            {cols.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
            <option value="none">Sans équipe</option>
          </select>
        </div>
        <div className="members-table" style={{ "--ncol": cols.length }}>
          <div className="mt-head">
            <span>Joueur</span>
            {cols.map((q) => <span key={q.id} style={{ color: q.color }}>{q.name}</span>)}
          </div>
          {rows.map((p) => (
            <div className="mt-row" key={p.id}>
              <span className="mt-name"><b>{p.prenom} {p.nom}</b>{p.numero ? <span className="recap-num"> #{p.numero}</span> : null}</span>
              {cols.map((q) => {
                const v = memberOf(state, p.id, q.id);
                return (
                  <button key={q.id} className={"mt-cell " + (v || "none")} style={{ "--sq": q.color }} disabled={busy || !canCol(q)}
                    title={canCol(q) ? "Changer" : "Pas de droit sur cette équipe"}
                    onClick={() => onSetMember(p.id, q.id, MEMBER_NEXT[v])}>
                    {v === "reg" ? "Habituel" : v === "renf" ? "Renfort" : "—"}
                  </button>
                );
              })}
            </div>
          ))}
          {rows.length === 0 && <div className="hint" style={{ padding: 10 }}>Aucun joueur.</div>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* V3 · Administration (propriétaire) : équipes, droits, espace test   */
/* ------------------------------------------------------------------ */
function SquadEditor({ squad, onSave, onDelete, busy, canDelete }) {
  const [v, setV] = useState({ name: squad ? squad.name : "", level: squad ? squad.level : "Régional", target: squad ? squad.target : 12, color: squad ? squad.color : "#F2B632" });
  const [confirm, setConfirm] = useState(false);
  const dirty = !squad || v.name !== squad.name || v.level !== squad.level || +v.target !== +squad.target || v.color !== squad.color;
  return (
    <div className="squad-edit" style={{ "--sq": v.color }}>
      <div className="se-grid">
        <label className="field"><span>Nom</span><input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="ex. Équipe 2" /></label>
        <label className="field"><span>Niveau / ligue</span><input value={v.level} onChange={(e) => setV({ ...v, level: e.target.value })} placeholder="ex. Régional" /></label>
        <label className="field"><span>Objectif joueurs</span><input type="number" min="9" max="40" value={v.target} onChange={(e) => setV({ ...v, target: e.target.value })} /></label>
        <label className="field"><span>Couleur</span><input type="color" value={v.color} onChange={(e) => setV({ ...v, color: e.target.value })} /></label>
      </div>
      <div className="reset-form">
        <button className="btn-primary small" disabled={busy || !v.name.trim() || !dirty} onClick={async () => { const ok = await onSave({ id: squad ? squad.id : undefined, ...v }); if (ok && !squad) setV({ name: "", level: "Régional", target: 12, color: "#6FA8FF" }); }}>{squad ? "Enregistrer" : "Créer l'équipe"}</button>
        {squad && onDelete && (confirm ? (
          <>
            <span className="confirm-text">Supprimer « {squad.name} » ?</span>
            <button className="btn-danger small" disabled={busy} onClick={() => { onDelete(squad.id); setConfirm(false); }}>Confirmer</button>
            <button className="btn-ghost small" onClick={() => setConfirm(false)}>Annuler</button>
          </>
        ) : (
          <button className="btn-danger small" disabled={busy || !canDelete} title={canDelete ? "" : "Impossible : l'équipe a des matchs, ou c'est la dernière"} onClick={() => setConfirm(true)}>Supprimer</button>
        ))}
      </div>
    </div>
  );
}

const SQ_ROLE_LABEL = { "": "Aucun rôle", coach: "Coach", staff: "Staff / adjoint", scorer: "Scoreuse" };
const PERM_LABELS = [["compo", "Compo et changements"], ["sheet", "Feuille de match et live"], ["scout", "Scouting des adversaires"], ["roster", "Gérer qui joue dans l'équipe"], ["presence", "Présences, accords live, relances"]];
function AccessEditor({ username, acc, squads, onSave, onClose, busy }) {
  const [sq, setSq] = useState({ ...(acc.squads || {}) });
  const [perms, setPerms] = useState(() => {
    const o = {};
    squads.forEach((q) => { o[q.id] = { compo: true, sheet: true, scout: true, roster: false, presence: true, ...((acc.perms || {})[q.id] || {}) }; });
    return o;
  });
  const [trainer, setTrainer] = useState(!!acc.trainer);
  return (
    <div className="access-edit">
      {squads.map((q) => (
        <div className="ae-sq" key={q.id} style={{ "--sq": q.color }}>
          <div className="ae-head"><SquadChip squad={q} small />
            <select value={sq[q.id] || ""} onChange={(e) => setSq({ ...sq, [q.id]: e.target.value })} aria-label={"Rôle dans " + q.name}>
              {Object.entries(SQ_ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          {sq[q.id] === "staff" && (
            <div className="ae-perms">
              {PERM_LABELS.map(([k, l]) => (
                <label key={k} className="checkbox-row">
                  <input type="checkbox" checked={!!perms[q.id][k]} onChange={(e) => setPerms({ ...perms, [q.id]: { ...perms[q.id], [k]: e.target.checked } })} />
                  <span>{l}</span>
                </label>
              ))}
            </div>
          )}
          {sq[q.id] === "coach" && <div className="hint" style={{ margin: "4px 0 0" }}>Le coach peut tout faire dans son équipe.</div>}
          {sq[q.id] === "scorer" && <div className="hint" style={{ margin: "4px 0 0" }}>Lecture de la feuille de match en direct, compos publiées, line-up adverse.</div>}
        </div>
      ))}
      <label className="checkbox-row trainer-row">
        <input type="checkbox" checked={trainer} onChange={(e) => setTrainer(e.target.checked)} />
        <span><b>Casquette entraîneur</b> · voit les autres équipes en lecture seule (présences, compos, scouting, feuilles), sans rien pouvoir y modifier.</span>
      </label>
      <div className="reset-form">
        <button className="btn-primary small" disabled={busy} onClick={async () => { const ok = await onSave(username, { squads: Object.fromEntries(Object.entries(sq).filter(([, v]) => v)), perms, trainer }); if (ok) onClose(); }}>Enregistrer les droits</button>
        <button className="btn-ghost small" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}

function TestSpacePanel({ token }) {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [label, setLabel] = useState("");
  const [pwd, setPwd] = useState("");
  const [kind, setKind] = useState("full");
  const [content, setContent] = useState("example");
  const [confirmReset, setConfirmReset] = useState(false);
  const [pwFor, setPwFor] = useState(null);
  const [pw2, setPw2] = useState("");
  const [working, setWorking] = useState(false);
  async function run(action, extra) {
    setWorking(true); setMsg("");
    try { const r = await callApi({ action, token, ...extra }); setData(r); return r; }
    catch (e) { setMsg(e.message); return null; }
    finally { setWorking(false); }
  }
  useEffect(() => { run("getTestSpace"); }, [token]);
  if (!data) return <div className="card"><h2>Espace de test</h2><div className="hint">{msg || "Chargement…"}</div></div>;
  return (
    <div className="card wide test-card">
      <h2>Espace de test</h2>
      <div className="hint" style={{ marginBottom: 10 }}>
        Un club à part, avec les mêmes écrans que le vrai : pour une réunion, ou pour faire essayer l'appli à des joueurs ou d'autres coachs.
        Les comptes test ont tous les droits dans cet espace et <b>aucun accès au vrai club</b> ; leurs matchs ne s'affichent jamais sur le vrai live
        (leur live : <a href="/live?test=1" target="_blank" rel="noreferrer">/live?test=1</a>). Contenu actuel : <b>{data.content === "example" ? "exemple (2 équipes, matchs fictifs)" : "vierge"}</b>.
      </div>
      <div className="test-accounts">
        {(data.accounts || []).length === 0 && <div className="hint">Aucun compte test pour l'instant.</div>}
        {(data.accounts || []).map((a) => (
          <div className="ta-row" key={a.username}>
            <div className="ta-info"><b>{a.username}</b><span>{a.label || "—"} · {a.kind === "full" ? "tous les droits" : "vue joueur"}{a.created ? " · créé le " + a.created.split("-").reverse().join("/") : ""}</span></div>
            {pwFor === a.username ? (
              <div className="reset-form">
                <input type="text" placeholder="Nouveau mot de passe" value={pw2} onChange={(e) => setPw2(e.target.value)} />
                <button className="btn-primary small" disabled={working || pw2.length < 6} onClick={async () => { if (await run("setTestPassword", { username: a.username, password: pw2 })) { setPwFor(null); setPw2(""); setMsg("Mot de passe changé."); } }}>OK</button>
                <button className="btn-ghost small" onClick={() => setPwFor(null)}>Annuler</button>
              </div>
            ) : (
              <div className="account-actions">
                <button className="btn-ghost small" onClick={() => { setPwFor(a.username); setPw2(""); }}>Mot de passe</button>
                <button className="btn-danger small" disabled={working} onClick={() => run("deleteTestAccount", { username: a.username })}>Supprimer</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="ta-new">
        <input placeholder="Nom (ex. Réunion, Coach Marc)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input placeholder="Mot de passe (6 caractères min.)" value={pwd} onChange={(e) => setPwd(e.target.value)} />
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type de compte test">
          <option value="full">Tous les droits</option>
          <option value="player">Vue joueur</option>
        </select>
        <button className="btn-primary small" disabled={working || !label.trim() || pwd.length < 6} onClick={async () => { const r = await run("createTestAccount", { label, password: pwd, kind }); if (r && r.created) { setMsg(`Compte « ${r.created} » créé. Identifiant : ${r.created} · mot de passe : ${pwd}`); setLabel(""); setPwd(""); } }}>+ Créer un compte test</button>
      </div>
      <div className="ta-reset">
        <div className="side-label" style={{ marginBottom: 6 }}>Remettre l'espace test à zéro</div>
        <div className="ta-content">
          <button className={"ta-opt" + (content === "blank" ? " on" : "")} onClick={() => setContent("blank")}><b>Vierge</b><span>tout est à créer</span></button>
          <button className={"ta-opt" + (content === "example" ? " on" : "")} onClick={() => setContent("example")}><b>Exemple</b><span>2 équipes, joueurs et matchs fictifs</span></button>
        </div>
        {confirmReset ? (
          <div className="reset-form" style={{ marginTop: 8 }}>
            <span className="confirm-text">Effacer tout le contenu de test (les comptes test restent) ?</span>
            <button className="btn-danger small" disabled={working} onClick={async () => { if (await run("resetTestSpace", { content })) setMsg("Espace test remis à zéro."); setConfirmReset(false); }}>Confirmer</button>
            <button className="btn-ghost small" onClick={() => setConfirmReset(false)}>Annuler</button>
          </div>
        ) : (
          <button className="btn-danger small" style={{ marginTop: 8 }} onClick={() => setConfirmReset(true)}>Remettre à zéro ({content === "example" ? "exemple" : "vierge"})</button>
        )}
      </div>
      {msg && <div className="ok-msg" style={{ marginTop: 10 }}>{msg}</div>}
    </div>
  );
}

/* Administration › Mails : état de l'envoi + mail de test */
function MailPanel({ token }) {
  const [st, setSt] = useState(null);
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    callApi({ action: "mailStatus", token }).then(setSt).catch((e) => setErr(e.message));
  }, [token]);
  async function test() {
    setMsg(""); setErr(""); setSending(true);
    try {
      const r = await callApi({ action: "sendTestMail", token, ...(to.trim() ? { to: to.trim() } : {}) });
      setMsg(`Mail de test envoyé à ${r.to}. Regarde ta boîte (et les spams).`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="card mail-card">
      <h2>Mails</h2>
      {!st && !err && <div className="hint">Chargement…</div>}
      {st && st.configured && (
        <div className="mail-state on">✅ Envoi activé · expéditeur « {st.name} » &lt;{st.from}&gt; · serveur {st.host}</div>
      )}
      {st && !st.configured && (
        <div className="mail-state off">
          ⚠️ Envoi pas encore activé. Dans Netlify › Site configuration › Environment variables, ajoute <code>SMTP_USER</code> (l'adresse Gmail) et <code>SMTP_PASS</code> (le mot de passe d'application Google), puis redéploie.
        </div>
      )}
      <div className="hint" style={{ margin: "8px 0" }}>Sert aux récaps de match (feuille de match › Récap › Envoyer les récaps) et au « mot de passe oublié ». Chaque joueur ne reçoit que ce qu'il a coché dans Mon compte.</div>
      {st && st.configured && (
        <div className="mail-test">
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Adresse de test (vide = la tienne, Mon compte)" />
          <button className="btn-primary small" disabled={sending} onClick={test}>{sending ? "Envoi…" : "Envoyer un mail de test"}</button>
        </div>
      )}
      {msg && <div className="ok-msg" style={{ marginTop: 8 }}>{msg}</div>}
      {err && <div className="error" style={{ marginTop: 8 }}>{err}</div>}
    </div>
  );
}

function AdminView({ state, token, busy, isTest, onSaveSquad, onDeleteSquad, onSetAccess, onCreateAccount, onRestored }) {
  const squads = state.squads || [];
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [newAcc, setNewAcc] = useState({ username: "", password: "", label: "", newRole: "coach", squad: squads[0] ? squads[0].id : "" });
  const rows = Object.entries(state.accounts || {})
    .map(([u, a]) => {
      const p = state.roster.find((x) => x.id === a.playerId);
      return { username: u, ...a, name: p ? `${p.prenom} ${p.nom}` : a.label || u };
    })
    .filter((r) => `${r.name} ${r.username}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.role === "owner" ? -1 : 0) - (b.role === "owner" ? -1 : 0) || a.name.localeCompare(b.name));
  const summary = (a) => {
    if (a.role === "owner") return "Propriétaire · accès à tout";
    const parts = squads.filter((x) => (a.squads || {})[x.id]).map((x) => `${SQ_ROLE_LABEL[a.squads[x.id]]} ${x.name}`);
    if (a.trainer) parts.push("casquette entraîneur");
    return parts.length ? parts.join(" · ") : "Joueur";
  };
  return (
    <div>
      <div className="card">
        <h2>Les équipes du club</h2>
        <div className="hint" style={{ marginBottom: 10 }}>Le nom se change quand tu veux (ex. « Équipe 1 » → « R1 » quand la ligue est connue). Objectif : nombre de joueurs visé par roster (9 minimum pour jouer).</div>
        {squads.map((x) => (
          <SquadEditor key={x.id + ":" + x.name + x.level + x.target + x.color} squad={x} busy={busy} onSave={onSaveSquad} onDelete={onDeleteSquad}
            canDelete={squads.length > 1 && !state.matches.some((m) => m.squad === x.id)} />
        ))}
        <div className="side-label" style={{ margin: "14px 0 6px" }}>Nouvelle équipe</div>
        <SquadEditor squad={null} busy={busy} onSave={onSaveSquad} />
      </div>

      <div className="card wide">
        <h2>Droits des comptes</h2>
        <div className="hint" style={{ marginBottom: 10 }}>Un rôle par équipe (coach, staff, scoreuse), des cases pour ce que le staff peut faire, et la casquette entraîneur pour voir les autres équipes en lecture.</div>
        <input className="search" placeholder="Rechercher un compte…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="accounts-list">
          {rows.map((r) => (
            <div className="account-row access-row" key={r.username}>
              <div className="account-info">
                <span className="account-name">{r.name}</span>
                <span className="account-user">@{r.username} · {summary(r)}</span>
              </div>
              {r.role !== "owner" && editing !== r.username && (
                <div className="account-actions"><button className="btn-ghost small" onClick={() => setEditing(r.username)}>Droits</button></div>
              )}
              {editing === r.username && (
                <AccessEditor username={r.username} acc={r} squads={squads} busy={busy} onSave={onSetAccess} onClose={() => setEditing(null)} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Créer un compte coach ou scoreuse</h2>
        <div className="hint" style={{ marginBottom: 8 }}>Pour une personne qui n'est pas joueur. Transmets-lui l'identifiant et le mot de passe.</div>
        <div className="row-2">
          <label className="field"><span>Nom affiché</span><input value={newAcc.label} onChange={(e) => setNewAcc({ ...newAcc, label: e.target.value })} placeholder="ex. Marie" /></label>
          <label className="field"><span>Identifiant</span><input value={newAcc.username} autoCapitalize="none" onChange={(e) => setNewAcc({ ...newAcc, username: e.target.value })} placeholder="ex. marie.score" /></label>
          <label className="field"><span>Mot de passe</span><input value={newAcc.password} onChange={(e) => setNewAcc({ ...newAcc, password: e.target.value })} placeholder="6 caractères min." /></label>
          <label className="field"><span>Rôle</span>
            <select value={newAcc.newRole} onChange={(e) => setNewAcc({ ...newAcc, newRole: e.target.value })}><option value="coach">Coach</option><option value="scorer">Scoreuse</option></select>
          </label>
          {squads.length > 1 && (
            <label className="field"><span>Équipe</span>
              <select value={newAcc.squad} onChange={(e) => setNewAcc({ ...newAcc, squad: e.target.value })}>{squads.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
            </label>
          )}
        </div>
        <button className="btn-primary small" disabled={busy || !newAcc.username.trim() || newAcc.password.length < 6} onClick={async () => {
          const u = newAcc.username.trim().toLowerCase();
          if (await onCreateAccount({ ...newAcc, username: u })) { setMsg(`Compte « ${u} » créé.`); setNewAcc({ ...newAcc, username: "", password: "", label: "" }); }
        }}>Créer le compte</button>
        {msg && <div className="ok-msg" style={{ marginTop: 8 }}>{msg}</div>}
      </div>

      {!isTest && <MailPanel token={token} />}
      {!isTest && <TestSpacePanel token={token} />}
      <BackupPanel token={token} onRestored={onRestored} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                               */
/* ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;700&display=swap');

.dragons-app {
  --bg: #0e1511;
  --panel: #17211b;
  --panel-alt: #1b3527;
  --line: #2a3a31;
  --gold: #3fae74;
  --cream: #e7efea;
  --ok: #43c383;
  --bad: #f2665a;
  --warn: #f2b632;
  --muted: #9aada2;
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--cream);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  max-width: 100vw;
  box-sizing: border-box;
}
.dragons-app * { box-sizing: border-box; }

/* ---------------- V3 · équipes, affichage ordinateur / tablette, mode test ---------------- */
.test-banner { background: repeating-linear-gradient(-45deg, #f2b632 0 14px, #e0a51f 14px 28px); color: #1a1406; padding: 8px 16px; font-size: 14px; text-align: center; }
.squad-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; padding: 3px 10px; border-radius: 99px; border: 1.5px solid var(--sq, var(--gold)); color: var(--cream); vertical-align: middle; white-space: nowrap; }
.squad-chip i { width: 9px; height: 9px; border-radius: 50%; background: var(--sq, var(--gold)); display: inline-block; }
.squad-chip.small { font-size: 11.5px; padding: 1px 8px; font-weight: 600; }
.squad-row { width: 100%; }
.squad-bar { display: flex; gap: 6px; flex-wrap: wrap; }
.sq-tab { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 14px; border-radius: 99px; border: 1.5px solid var(--line); background: transparent; color: var(--cream); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
.sq-tab i { width: 10px; height: 10px; border-radius: 50%; background: var(--sq, var(--muted)); }
.sq-tab.on { background: var(--cream); color: #0e1511; border-color: var(--cream); }
.layout-picker { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.layout-picker.compact { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.lp-btn { min-height: 40px; border-radius: 9px; border: 1.5px solid var(--line); background: transparent; color: var(--cream); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.lp-btn.on { background: var(--gold); color: #06130c; border-color: transparent; }

.dragons-app.with-side { display: grid; grid-template-columns: 252px minmax(0, 1fr); grid-template-rows: auto 1fr auto; }
.dragons-app.with-side .test-banner { grid-column: 1 / -1; }
.dragons-app.with-side .sidebar { grid-row: span 2; }
.sidebar { position: sticky; top: 0; align-self: start; height: 100vh; overflow-y: auto; background: #111a15; border-right: 1px solid var(--line); padding: 20px 14px; display: flex; flex-direction: column; gap: 18px; }
.sidebar .brand-title { font-size: 19px; }
.side-label { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-weight: 700; padding: 0 4px 6px; }
.sidebar .squad-bar { flex-direction: column; }
.sidebar .sq-tab { justify-content: flex-start; border-radius: 10px; }
.side-nav { display: flex; flex-direction: column; gap: 2px; }
.side-link { display: flex; align-items: center; min-height: 40px; padding: 0 12px; border-radius: 10px; border: none; background: transparent; color: var(--cream); font: inherit; font-size: 14.5px; text-align: left; cursor: pointer; }
.side-link:hover { background: rgba(255,255,255,0.05); }
.side-link.active { background: var(--panel); color: var(--gold); font-weight: 700; }
.side-link.ext { color: var(--muted); font-size: 14px; }
.side-sep { height: 1px; background: var(--line); margin: 8px 4px; }
.side-bottom { margin-top: auto; border-top: 1px solid var(--line); padding-top: 14px; }
.dragons-app.with-side .content { max-width: 1520px; padding: 26px 30px; }
.content.cols-2 { max-width: 1240px; columns: 2; column-gap: 18px; }
.content.cols-3 { columns: 3; column-gap: 18px; }
.content.cols-2 > div:not(.card), .content.cols-3 > div:not(.card) { display: contents; }
.content.cols-2 .card, .content.cols-3 .card { break-inside: avoid; display: inline-block; width: 100%; }
.content.cols-2 .card.wide, .content.cols-3 .card.wide { column-span: all; display: block; }
.lay-tablet .content { max-width: 1240px; }

.call-card { border: 2px solid var(--gold); background: linear-gradient(180deg, rgba(63,174,116,0.12), var(--panel)); }
.call-tag { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: .06em; padding: 3px 8px; border-radius: 6px; background: var(--gold); color: #06130c; }
.call-tag span { font-weight: 600; }
.call-title { font-size: 16px; margin: 10px 0 4px; }
.call-when { font-family: 'Oswald', sans-serif; font-size: 20px; text-transform: uppercase; letter-spacing: .5px; }
.call-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.call-btns button { min-height: 46px; }
.why-row { display: flex; gap: 6px; flex-wrap: wrap; width: 100%; margin-top: 4px; }
.why-btn { min-height: 34px; padding: 0 12px; border-radius: 99px; border: 1.5px solid var(--line); background: transparent; color: var(--cream); font: inherit; font-size: 13px; cursor: pointer; }
.why-btn.on { border-color: var(--bad); color: #f7948b; background: rgba(242,102,90,0.12); font-weight: 700; }
.why-tag { display: inline-block; margin-left: 6px; font-size: 11.5px; color: #f7948b; }
.call-state { display: inline-flex; gap: 6px; align-items: center; margin-left: 6px; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 99px; }
.call-state.yes { background: rgba(63,174,116,0.18); color: #8fe0b5; }
.call-state.no { background: rgba(242,102,90,0.16); color: #f7948b; }
.call-state.wait { background: rgba(242,182,50,0.16); color: #f7cf6e; }
.btn-call { margin-left: 6px; min-height: 30px; padding: 0 10px; border-radius: 8px; border: none; background: var(--gold); color: #06130c; font: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; }
.grid-group { padding: 10px 4px 6px; font-size: 11.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); font-weight: 700; border-bottom: 1px solid var(--line); }
.row-renf { background: rgba(242,182,50,0.04); }
.ro-banner { margin: 0 0 10px; padding: 8px 12px; border-radius: 10px; border: 1.5px solid #6fa8ff; background: rgba(111,168,255,0.1); color: #a9cbff; font-size: 13.5px; }
.target-gauge { margin: 6px 0 12px; }
.tg-top { display: flex; gap: 6px; align-items: baseline; flex-wrap: wrap; font-size: 14px; }
.tg-top b { font-family: 'Oswald', sans-serif; font-size: 22px; color: var(--gold); }
.tg-ok { margin-left: auto; font-size: 12px; color: #8fe0b5; }
.tg-bad { margin-left: auto; font-size: 12px; color: #f7948b; font-weight: 700; }
.tg-bar { position: relative; height: 10px; border-radius: 5px; background: var(--line); margin-top: 6px; }
.tg-bar span { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 5px; }
.tg-bar span.low { background: var(--bad); } .tg-bar span.ok { background: var(--warn); } .tg-bar span.full { background: var(--gold); }
.tg-bar i { position: absolute; top: -3px; width: 2px; height: 16px; background: var(--cream); }

.members-sum { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.ms-card { flex: 1 1 180px; border: 1.5px solid var(--sq, var(--line)); border-radius: 12px; padding: 10px 12px; }
.ms-card.none { border-style: dashed; border-color: var(--line); }
.ms-name { display: flex; align-items: center; gap: 6px; font-weight: 700; }
.ms-name i { width: 9px; height: 9px; border-radius: 50%; background: var(--sq); }
.ms-name span { font-weight: 400; color: var(--muted); font-size: 12.5px; }
.ms-n { font-size: 13px; color: var(--muted); margin-top: 4px; }
.ms-n b { font-family: 'Oswald', sans-serif; font-size: 20px; color: var(--cream); }
.ms-n b.ok { color: #8fe0b5; } .ms-n b.low { color: #f7cf6e; }
.ms-warn { font-size: 12px; color: #f7cf6e; margin-top: 2px; }
.members-tools { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.members-table { display: flex; flex-direction: column; }
.mt-head, .mt-row { display: grid; grid-template-columns: minmax(0, 1fr) repeat(var(--ncol), 104px); gap: 6px; align-items: center; }
.mt-head { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); font-weight: 700; padding: 0 4px 6px; }
.mt-head span:not(:first-child) { text-align: center; }
.mt-row { min-height: 50px; border-top: 1px solid var(--line); padding: 0 4px; }
.mt-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mt-cell { min-height: 38px; border-radius: 10px; font: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; }
.mt-cell.reg { border: none; background: var(--sq); color: #0e1511; }
.mt-cell.renf { border: 1.5px dashed var(--sq); background: transparent; color: var(--cream); }
.mt-cell.none { border: 1.5px solid var(--line); background: transparent; color: #46564c; }
.mt-cell:disabled { cursor: default; opacity: .75; }
@media (max-width: 520px) { .mt-head, .mt-row { grid-template-columns: minmax(0, 1fr) repeat(var(--ncol), 84px); } }

.squad-edit { border: 1.5px solid var(--sq, var(--line)); border-radius: 12px; padding: 12px; margin-bottom: 10px; }
.se-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
.se-grid .field, .se-grid input { min-width: 0; width: 100%; }
.se-grid input[type=color] { width: 100%; height: 40px; padding: 2px; border-radius: 8px; border: 1px solid var(--line); background: transparent; }
.ta-new input, .ta-new select, .ta-row input { background: var(--bg); color: var(--cream); border: 1px solid var(--line); border-radius: 8px; padding: 0 10px; font: inherit; font-size: 14px; }
.test-card a { color: var(--gold); }
.access-row { flex-wrap: wrap; }
.access-edit { width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: 8px; padding: 10px; border-radius: 10px; background: rgba(255,255,255,0.03); }
.ae-sq { border-left: 3px solid var(--sq); padding-left: 10px; }
.ae-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ae-head select { min-height: 38px; }
.ae-perms { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0 12px; margin-top: 6px; }
.trainer-row { border: 1.5px solid #6fa8ff; border-radius: 10px; padding: 8px 10px; background: rgba(111,168,255,0.08); }
.test-accounts { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.ta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.04); }
.ta-info { display: flex; flex-direction: column; flex: 1; min-width: 160px; }
.ta-info span { font-size: 12.5px; color: var(--muted); }
.ta-new { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.ta-new input, .ta-new select { flex: 1 1 160px; min-height: 40px; }
.ta-reset { margin-top: 16px; border-top: 1px solid var(--line); padding-top: 12px; }
.ta-content { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ta-opt { min-height: 60px; border-radius: 12px; border: 1.5px solid var(--line); background: transparent; color: var(--cream); font: inherit; display: flex; flex-direction: column; justify-content: center; gap: 2px; cursor: pointer; }
.ta-opt span { font-size: 12px; color: var(--muted); }
.ta-opt.on { border-color: var(--gold); background: rgba(63,174,116,0.12); }
html, body { overflow-x: hidden; min-height: 100%; background: #0e1511; }

.center-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--cream);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, var(--panel-alt), var(--panel));
  flex-wrap: wrap;
  gap: 12px;
}

.brand { display: flex; align-items: center; gap: 10px; }
.brand-emblem {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--cream);
  overflow: hidden;
  flex: 0 0 auto;
  border: 2px solid var(--gold);
}
.brand-emblem img { width: 100%; height: 100%; object-fit: cover; }
.brand-title {
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  letter-spacing: 1px;
  color: var(--gold);
}
.brand-sub { font-size: 12px; color: var(--muted); }

.topbar-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.who { font-size: 13px; color: var(--muted); }

.tab-switch {
  display: flex;
  flex-wrap: wrap;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: visible;
  max-width: 100%;
}
.tsw {
  background: transparent;
  border: none;
  flex: 0 0 auto;
  white-space: nowrap;
  color: var(--cream);
  padding: 6px 10px;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
}
.tsw.active { background: var(--gold); color: #06130c; font-weight: 600; }

.btn-ghost {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--cream);
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.btn-ghost:hover { border-color: var(--gold); }

.content {
  flex: 1;
  padding: 20px;
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 18px;
}

.card h2 {
  font-family: 'Oswald', sans-serif;
  color: var(--gold);
  font-size: 17px;
  letter-spacing: 0.5px;
  margin: 0 0 14px 0;
  text-transform: uppercase;
}

.auth-card { max-width: 420px; margin: 40px auto; }

.username-preview {
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: #121a15;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--muted);
}
.username-preview strong {
  color: var(--gold);
  font-family: 'Roboto Mono', monospace;
  font-size: 15px;
}

.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; font-size: 13px; color: var(--muted); }
.field input, .field select {
  background: #121a15;
  border: 1px solid var(--line);
  color: var(--cream);
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}
.field input:focus, .field select:focus { outline: 2px solid var(--gold); outline-offset: 1px; }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 12px; color: var(--muted); }

.btn-primary {
  width: 100%;
  background: var(--gold);
  color: #06130c;
  border: none;
  padding: 11px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  margin-top: 6px;
}
.btn-primary:disabled { opacity: 0.6; cursor: wait; }

.btn-link {
  background: none;
  border: none;
  color: var(--muted);
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
  margin-top: 10px;
  width: 100%;
}

.error {
  background: rgba(242, 102, 90, 0.15);
  border: 1px solid var(--bad);
  color: #ff9d8f;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 10px;
}

.me-grid { margin-bottom: 12px; }
.me-label { font-size: 12px; color: var(--muted); }
.me-value { font-family: 'Roboto Mono', monospace; font-size: 16px; color: var(--cream); }

.pos-editor { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
@media (max-width: 600px) { .pos-editor { grid-template-columns: 1fr; } .row-2 { grid-template-columns: 1fr; } }

.match-list { display: flex; flex-direction: column; gap: 10px; }
.match-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  background: #121a15;
}
.match-info { min-width: 110px; }
.match-name { font-family: 'Oswald', sans-serif; color: var(--cream); font-size: 14px; }
.match-date { font-size: 12px; color: var(--muted); font-family: 'Roboto Mono', monospace; }

.status-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.status-btn {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--cream);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
}
.status-btn.selected.present { background: var(--ok); border-color: var(--ok); color: #050d08; font-weight: 600; }
.status-btn.selected.absent { background: var(--bad); border-color: var(--bad); color: #2a0805; font-weight: 600; }
.status-btn.selected.reserve { background: var(--warn); border-color: var(--warn); color: #2a1c02; font-weight: 600; }

.vehicule-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); margin-left: auto; }

.pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #121a15;
}
.pill-empty { background: transparent; border: 1px dashed var(--line); color: var(--muted); font-weight: 400; }

.match-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.mtab {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--cream);
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}
.mtab.active { background: var(--gold); color: #06130c; border-color: var(--gold); font-weight: 600; }

.counts-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.count-chip { font-size: 12px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line); }
.count-chip.present { color: var(--ok); }
.count-chip.absent { color: var(--bad); }
.count-chip.reserve { color: var(--warn); }
.count-chip.unknown { color: var(--muted); }

.search {
  width: 100%;
  box-sizing: border-box;
  background: #121a15;
  border: 1px solid var(--line);
  color: var(--cream);
  padding: 9px 10px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}

.grid-table { display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
.grid-header, .grid-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1.2fr;
  gap: 8px;
  padding: 9px 12px;
  align-items: center;
}
.grid-header { background: var(--panel-alt); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); }
.grid-row { border-top: 1px solid var(--line); font-size: 13px; }
.grid-row:nth-child(even) { background: rgba(255,255,255,0.02); }
.grid-name { font-family: 'Inter', sans-serif; }
.grid-name-edit { display: flex; flex-direction: column; gap: 4px; }
.grid-name-edit input {
  background: #121a15;
  border: 1px solid var(--line);
  color: var(--cream);
  padding: 5px 7px;
  border-radius: 6px;
  font-size: 12px;
}
.grid-pos { font-size: 12px; color: var(--muted); }
.grid-header-with-actions, .grid-row-with-actions {
  grid-template-columns: 24px 2fr 2fr 1.2fr auto;
}

@media (max-width: 640px) {
  .grid-header-with-actions { display: none; }
  .grid-row-with-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "check name"
      "pos pos"
      "status status"
      "actions actions";
    gap: 8px;
    padding: 12px;
  }
  .gp-check { grid-area: check; align-self: start; }
  .gp-name { grid-area: name; }
  .gp-pos { grid-area: pos; }
  .gp-status { grid-area: status; }
  .gp-actions { grid-area: actions; }
  .gp-actions .account-actions,
  .gp-actions .reset-form { flex-wrap: wrap; }
}
.grid-header-with-vehicule, .grid-row-with-vehicule {
  grid-template-columns: 2fr 2fr 1.2fr 90px;
}
.grid-vehicule { font-size: 12px; color: var(--cream); }
.cell-status { background: none; border: none; padding: 0; cursor: pointer; }

.hint { font-size: 12px; color: var(--muted); margin-top: 10px; }
.teams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; }
.team-chip { display: flex; align-items: center; gap: 10px; text-align: left; padding: 8px 10px; border-radius: 12px; border: 1.5px solid var(--line, #2a3a31); background: transparent; color: inherit; cursor: pointer; font: inherit; }
.team-chip span { display: flex; flex-direction: column; min-width: 0; }
.team-chip b { font-size: 14px; }
.team-chip small { font-size: 11.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.team-chip.active { border-color: var(--accent, #3fae74); }
.team-chip.add { justify-content: center; border-style: dashed; font-weight: 700; color: var(--muted); min-height: 58px; }
.team-editor { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--line, #2a3a31); }
.consent-box { border: 1.5px solid var(--line, #2a3a31); border-radius: 12px; padding: 12px; margin: 10px 0; text-align: left; }
.consent-title { font-weight: 800; margin-bottom: 6px; }
.consent-age { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 4px; }
.live-badge { display: inline-block; margin-left: 8px; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 99px; border: 1px solid var(--line, #2a3a31); background: transparent; color: var(--muted); cursor: pointer; vertical-align: middle; }
.live-badge.adult, .live-badge.minor { color: var(--accent, #3fae74); border-color: var(--accent, #3fae74); }
.live-badge.refused { color: #f2665a; border-color: rgba(242,102,90,.6); }
.live-badge.none { color: #f2b632; border-color: rgba(242,182,50,.5); border-style: dashed; }
.consent-track { border: 1px solid var(--line); border-radius: 12px; margin: 10px 0; background: rgba(255,255,255,0.02); }
.consent-track-head { width: 100%; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 12px; background: transparent; border: none; color: var(--cream); font: inherit; cursor: pointer; text-align: left; min-height: 48px; }
.consent-track-title { font-weight: 700; font-size: 14px; }
.consent-track-counts { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
.ct-pill { font-size: 12px; font-weight: 700; padding: 3px 9px; border-radius: 99px; }
.ct-pill.ok { background: rgba(63,174,116,.18); color: #8fe0b5; }
.ct-pill.bad { background: rgba(242,102,90,.16); color: #f7948b; }
.ct-pill.warn { background: rgba(242,182,50,.16); color: #f7cf6e; }
.consent-track-body { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 10px; }
.ct-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.ct-filter { min-height: 36px; padding: 0 12px; border-radius: 99px; border: 1px solid var(--line); background: transparent; color: var(--cream); font: inherit; font-size: 13px; cursor: pointer; }
.ct-filter.on { background: var(--gold); color: #06130c; border-color: transparent; font-weight: 700; }
.ct-group { display: flex; flex-direction: column; gap: 4px; }
.ct-group-title { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; font-weight: 700; }
.ct-group-title.ok { color: #8fe0b5; } .ct-group-title.bad { color: #f7948b; } .ct-group-title.warn { color: #f7cf6e; }
.ct-row { display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 8px; background: rgba(255,255,255,0.04); border: none; color: var(--cream); font: inherit; font-size: 14px; cursor: pointer; text-align: left; min-height: 40px; }
.ct-note { color: var(--muted); font-size: 12px; white-space: nowrap; }
.staff-live-editor { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 60; width: min(92vw, 460px); max-height: 90vh; overflow: auto; background: var(--card, #17211b); border: 1px solid var(--line, #2a3a31); border-radius: 16px; padding: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.6); font-weight: 400; font-size: 14px; text-align: left; }
.staff-live-editor .consent-box { margin-top: 0; }
.link-btn { background: none; border: none; padding: 0; color: var(--accent, #3fae74); font: inherit; font-weight: 700; cursor: pointer; text-decoration: underline; }

.audit-list { display: flex; flex-direction: column; gap: 6px; max-height: 320px; overflow-y: auto; }
.audit-row {
  display: grid;
  grid-template-columns: 90px 120px 1fr;
  gap: 8px;
  font-size: 12px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--line);
}
.audit-time { color: var(--muted); font-family: 'Roboto Mono', monospace; }
.audit-user { color: var(--gold); font-weight: 600; }
.audit-action { color: var(--cream); }

.match-select {
  width: 100%;
  box-sizing: border-box;
  background: #121a15;
  border: 1px solid var(--line);
  color: var(--cream);
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 8px;
}

.field-wrap { max-width: 400px; margin: 0 auto 16px auto; }
.field-svg { width: 100%; height: auto; display: block; }
.field-grass { fill: #1e5c34; }
.field-outfield { fill: #23663a; }
.field-infield { fill: #b98a55; stroke: var(--cream); stroke-width: 0.4; }
.field-line { stroke: var(--cream); stroke-width: 0.6; }
.field-base { fill: var(--cream); }
.field-marker { fill: rgba(14, 21, 17,0.85); stroke: var(--gold); stroke-width: 0.6; }
.field-marker.filled { fill: var(--gold); stroke: var(--cream); }
.field-marker-label { font-family: 'Oswald', sans-serif; font-size: 5.4px; fill: var(--cream); font-weight: 700; }
.field-marker.filled + .field-marker-label { fill: #06130c; }
.field-marker-name-bg { fill: rgba(231, 239, 234, 0.92); }
.field-marker-name { font-family: 'Inter', sans-serif; font-size: 3.9px; font-weight: 700; fill: #06130c; }
.field-marker-name-empty { fill: var(--muted); }

.defense-list { display: flex; flex-direction: column; gap: 8px; }
.defense-row { flex-direction: row; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 0; }
.defense-row span { flex: 0 0 130px; color: var(--cream); font-size: 13px; }
.defense-row select { flex: 1; min-width: 0; }

@media (max-width: 520px) {
  .defense-row {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
  .defense-row span { flex: none; }
  .defense-row select { width: 100%; }
}

.batting-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.batting-row { display: flex; align-items: center; gap: 8px; }
.batting-num {
  font-family: 'Roboto Mono', monospace;
  color: var(--gold);
  font-weight: 700;
  width: 22px;
  text-align: center;
}
.batting-row select { flex: 1; background: #121a15; border: 1px solid var(--line); color: var(--cream); padding: 8px; border-radius: 8px; }

.btn-primary.small { width: auto; padding: 8px 14px; font-size: 13px; }
.btn-ghost.small { padding: 6px 10px; font-size: 12px; }

.mail-state { padding: 10px 12px; border-radius: 10px; font-size: 14px; line-height: 1.45; }
.mail-state.on { background: rgba(63,174,116,.12); border: 1px solid rgba(63,174,116,.5); }
.mail-state.off { background: rgba(224,168,46,.12); border: 1px solid rgba(224,168,46,.5); }
.mail-state code { font-size: 13px; }
.mail-test { display: flex; gap: 8px; flex-wrap: wrap; }
.mail-test input { flex: 1 1 220px; min-width: 0; }
.forgot-link { margin-top: 2px; }
.forgot-box { margin-top: 12px; padding: 14px; border: 1px solid var(--line, #2a3a31); border-radius: 12px; }
.forgot-box input { width: 100%; box-sizing: border-box; }
.forgot-title { font-weight: 700; margin-bottom: 4px; }
.forgot-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.forgot-hint {
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  margin-top: 14px;
  line-height: 1.5;
}

.ok-msg {
  background: rgba(67, 195, 131, 0.15);
  border: 1px solid var(--ok);
  color: #b6e6c5;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 10px;
}

.accounts-list { display: flex; flex-direction: column; gap: 10px; }
.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  background: #121a15;
}
.account-checkbox { flex: 0 0 auto; width: 16px; height: 16px; }
.bulk-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.bulk-confirm { display: flex; align-items: center; gap: 8px; }
.account-info { display: flex; flex-direction: column; }
.account-name { font-size: 13px; color: var(--cream); }
.account-user { font-size: 11px; color: var(--muted); font-family: 'Roboto Mono', monospace; }
.hint-inline { font-size: 12px; opacity: .6; font-style: italic; }
.account-actions { display: flex; gap: 6px; flex-wrap: wrap; }

.btn-danger {
  background: transparent;
  border: 1px solid var(--bad);
  color: #ff9d8f;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}
.btn-danger:hover { background: rgba(242, 102, 90, 0.15); }
.btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }

.confirm-text { font-size: 12px; color: var(--muted); }

.reset-form { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.reset-form input {
  background: #17211b;
  border: 1px solid var(--line);
  color: var(--cream);
  padding: 7px 8px;
  border-radius: 8px;
  font-size: 13px;
}

.matches-admin-list { display: flex; flex-direction: column; gap: 16px; }
.match-admin-card {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 14px;
  background: #121a15;
}
.match-admin-title {
  font-family: 'Oswald', sans-serif;
  color: var(--gold);
  font-size: 14px;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  text-transform: uppercase;
}
.location-toggle { display: flex; gap: 6px; margin-bottom: 10px; }
.loc-btn {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}
.loc-btn.active { background: var(--gold); color: #06130c; border-color: var(--gold); font-weight: 600; }
.loc-btn-cancel.active { background: var(--bad); border-color: var(--bad); color: #fff; }

.matches-toolbar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }

.match-order-controls { display: flex; gap: 6px; margin-bottom: 10px; }
.order-btn {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--cream);
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.order-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
.order-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.match-admin-header {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.match-score-summary {
  margin-top: 10px;
  font-family: 'Roboto Mono', monospace;
  color: var(--cream);
  font-size: 14px;
  text-align: center;
  background: var(--panel-alt);
  border-radius: 8px;
  padding: 8px;
}

.poste-summary { margin-bottom: 12px; }
.poste-summary-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
  margin-bottom: 8px;
}
.poste-chip-row { display: flex; gap: 6px; flex-wrap: wrap; }
.poste-chip {
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  color: var(--cream);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.poste-chip strong { font-family: 'Roboto Mono', monospace; }
.poste-chip.poste-zero { border-color: var(--bad); color: #ff9d8f; background: rgba(242, 102, 90, 0.12); }
.poste-chip.poste-low { border-color: var(--warn); color: var(--warn); background: rgba(242, 182, 50, 0.1); }
.poste-chip.poste-ok { border-color: var(--ok); color: #8fe3ac; background: rgba(67, 195, 131, 0.1); }

.innings-table {
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
  overflow-x: auto;
}
.innings-row {
  display: grid;
  grid-template-columns: 90px repeat(7, minmax(32px, 1fr)) 56px;
  align-items: center;
  border-top: 1px solid var(--line);
}
.innings-row:first-child { border-top: none; }
.innings-header { background: var(--panel-alt); }
.innings-header-cell {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
  text-align: center;
}
.innings-team-label {
  padding: 8px 10px;
  font-size: 13px;
  color: var(--cream);
  font-family: 'Oswald', sans-serif;
}
.innings-cell {
  text-align: center;
  padding: 4px;
  border-left: 1px solid var(--line);
}
.innings-cell input {
  width: 100%;
  box-sizing: border-box;
  background: #121a15;
  border: 1px solid var(--line);
  color: var(--cream);
  text-align: center;
  padding: 6px 2px;
  border-radius: 6px;
  font-size: 13px;
}
.innings-cell span { font-family: 'Roboto Mono', monospace; color: var(--cream); font-size: 13px; }
.innings-total {
  text-align: center;
  padding: 8px 4px;
  border-left: 1px solid var(--gold);
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
  color: var(--gold);
}

.standings-table {
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}
.standings-row {
  display: grid;
  grid-template-columns: 28px 2fr 44px 44px 44px 60px 50px;
  gap: 6px;
  align-items: center;
  padding: 8px 10px;
  border-top: 1px solid var(--line);
  font-size: 13px;
}
.standings-row:first-child { border-top: none; }
.standings-header {
  background: var(--panel-alt);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
}
.standings-rank { font-family: 'Roboto Mono', monospace; color: var(--gold); font-weight: 700; }
.standings-team-name { color: var(--cream); }
.standings-num-input {
  width: 100%;
  box-sizing: border-box;
  background: #121a15;
  border: 1px solid var(--line);
  color: var(--cream);
  text-align: center;
  padding: 5px 2px;
  border-radius: 6px;
  font-size: 13px;
}
.standings-table .field input {
  padding: 6px 8px;
  font-size: 13px;
}
.standings-team-input {
  width: 100%;
  box-sizing: border-box;
  background: #121a15;
  border: 1px solid var(--line);
  color: var(--cream);
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
}
.standings-season-input {
  width: 100%;
  box-sizing: border-box;
  background: transparent;
  border: none;
  color: var(--muted);
  padding: 3px 8px 0;
  font-size: 11px;
}
.standings-season-input:focus {
  background: #121a15;
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--cream);
}

.sr-mobile-label { display: none; }

@media (max-width: 600px) {
  .standings-header { display: none; }
  .standings-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas:
      "team team team"
      "w l t"
      "pct pct gb"
      "actions actions actions";
    gap: 8px;
    padding: 12px;
  }
  .sr-rank { display: none; }
  .sr-team { grid-area: team; }
  .sr-w { grid-area: w; }
  .sr-l { grid-area: l; }
  .sr-t { grid-area: t; }
  .sr-pct { grid-area: pct; }
  .sr-gb { grid-area: gb; }
  .sr-actions { grid-area: actions; }
  .sr-mobile-label {
    display: block;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--muted);
    margin-bottom: 3px;
  }
  .standings-num-input { text-align: left; }
}


.hist-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 14px 0;
}
.hist-stat {
  background: #121a15;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px;
  text-align: center;
}
.hist-stat-num { font-family: 'Roboto Mono', monospace; font-size: 20px; color: var(--gold); font-weight: 700; }
.hist-stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

.hist-trend { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 16px; }
.hist-chip {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #121a15;
  cursor: default;
}
.hist-chip.hist-v { background: var(--ok); }
.hist-chip.hist-d { background: var(--bad); }

.hist-list { display: flex; flex-direction: column; gap: 8px; }
.hist-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  background: #121a15;
}
.hist-row-title { font-size: 13px; color: var(--cream); }
.hist-row-season { color: var(--muted); font-size: 12px; }
.compo-order { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.compo-order li { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(63, 174, 116,0.15); }
.compo-n { color: var(--gold); font-weight: 700; text-align: center; }
.compo-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.compo-pos { color: var(--gold); font-size: 13px; font-weight: 600; }
.compo-subs { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
.hist-row-date { font-size: 11px; color: var(--muted); font-family: 'Roboto Mono', monospace; }
.hist-row-right { display: flex; align-items: center; gap: 8px; }
.hist-row-score { font-family: 'Roboto Mono', monospace; color: var(--gold); font-weight: 700; }

.hist-row-wrap { display: flex; flex-direction: column; }
.recap-row { width: 100%; text-align: left; font: inherit; color: inherit; cursor: pointer; min-height: 52px; }
.recap-chev { color: var(--muted); font-size: 14px; }
.recap { display: flex; flex-direction: column; gap: 10px; }
.recap-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.recap-table { border-collapse: collapse; width: 100%; font-size: 13px; color: var(--cream); }
.recap-table th, .recap-table td { padding: 6px 7px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap; }
.recap-table th { color: var(--muted); font-size: 11px; font-weight: 600; }
.recap-table .l { text-align: left; }
.recap-table tr.tot td { font-weight: 700; border-top: 1px solid var(--line); }
.recap-table tr.me td { background: rgba(63,174,116,0.14); }
.recap-line td, .recap-line th { font-family: 'Roboto Mono', monospace; }
.recap-num { color: var(--muted); font-size: 12px; }
.recap-res { display: flex; gap: 3px; flex-wrap: nowrap; }
.recap-tag { font-size: 11px; padding: 1px 5px; border-radius: 4px; background: rgba(255,255,255,0.07); color: var(--muted); }
.recap-tag.hit { background: rgba(63,174,116,0.25); color: #8FE0B5; font-weight: 700; }
.mvp-box { border: 1px solid rgba(240,200,90,.35); background: rgba(240,200,90,.07); border-radius: 12px; padding: 10px 12px; margin-bottom: 12px; display: grid; gap: 10px; }
.mvp-line { display: flex; align-items: center; gap: 10px; }
.mvp-ico { font-size: 22px; line-height: 1; }
.mvp-main { flex: 1; min-width: 0; font-size: 14px; }
.mvp-k { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #E9C46A; margin-bottom: 2px; }
.mvp-why { font-style: italic; color: var(--muted); }
.mvp-sub { font-size: 12.5px; color: var(--muted); }
.mvp-none { font-size: 13px; color: var(--muted); }
.mvp-pick { display: grid; gap: 8px; }
.mvp-pick select, .mvp-pick input { width: 100%; box-sizing: border-box; }
.mvp-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.mvp-vote { border-top: 1px solid rgba(255,255,255,.08); padding-top: 8px; }
.mvp-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.mvp-chip { min-height: 36px; padding: 0 12px; border-radius: 18px; border: 1px solid var(--line); background: transparent; color: var(--cream); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.mvp-chip.on { background: #E9C46A; color: #1a1406; border-color: transparent; }
.hist-row-mvp { display: flex; gap: 10px; flex-wrap: wrap; font-size: 12px; margin-top: 3px; color: #E9C46A; }
.hist-row-mvp .mvp-todo { color: var(--green, #3FAE74); font-weight: 700; }
.recap-tabs { display: flex; gap: 6px; }
.recap-spray { display: flex; flex-direction: column; gap: 8px; }
.mail-field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--muted); margin-bottom: 10px; }
.mail-field input { min-height: 44px; }
.mail-opt { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-top: 1px solid var(--line); color: var(--cream); font-size: 14px; cursor: pointer; }
.mail-opt input { width: 22px; height: 22px; margin-top: 1px; flex: none; accent-color: var(--gold); }
.mail-opt small { color: var(--muted); font-size: 12.5px; }
.mail-opt.off { opacity: .5; cursor: default; }
.recap-tab { flex: 1; min-height: 40px; border-radius: 8px; border: 1px solid var(--line); background: transparent; color: var(--cream); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.recap-tab.on { background: var(--green, #3FAE74); color: #06130C; border-color: transparent; }
.recap-list { display: flex; flex-direction: column; gap: 4px; }
.recap-li { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-radius: 8px; background: rgba(255,255,255,0.04); color: var(--cream); font-size: 14px; }
.recap-li.me { background: rgba(63,174,116,0.14); }
.recap-big { font-family: 'Roboto Mono', monospace; font-weight: 700; color: var(--gold); }
.recap-big small { color: var(--muted); font-weight: 400; font-size: 11px; }
.recap-log { display: flex; flex-direction: column; gap: 3px; max-height: 420px; overflow-y: auto; }
.recap-inn { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: var(--gold); margin-top: 8px; font-weight: 700; }
.recap-ev { font-size: 13px; color: var(--cream); padding: 4px 8px; border-left: 2px solid var(--line); }
.recap-ev.k-RUN { border-left-color: #3FAE74; font-weight: 700; }
.recap-ev.k-HR, .recap-ev.k-2B, .recap-ev.k-3B, .recap-ev.k-1B { border-left-color: #8FE0B5; }
.recap-ev.k-OPA { color: var(--muted); }
.hist-comp {
  border: 1px solid var(--line);
  border-top: none;
  border-radius: 0 0 10px 10px;
  padding: 12px;
  background: #0a110d;
  margin-top: -1px;
}
.hist-comp-block { margin-bottom: 12px; }
.hist-comp-block:last-child { margin-bottom: 0; }
.hist-comp-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
  margin-bottom: 6px;
}
.field-wrap-history { max-width: 400px; margin: 0 auto; }
.hist-comp-batting { display: flex; flex-direction: column; gap: 4px; }
.hist-comp-item {
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: var(--cream);
}
.hist-comp-poste {
  color: var(--gold);
  font-family: 'Roboto Mono', monospace;
  min-width: 22px;
  flex-shrink: 0;
}

.foot {
  text-align: center;
  font-size: 11px;
  color: var(--muted);
  padding: 14px;
  border-top: 1px solid var(--line);
}
`;
