import React, { useState, useEffect, useMemo, useCallback } from "react";
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
function isStaffRole(role) {
  return STAFF_ROLES.includes(role);
}

/* Field positions used for the defensive lineup diagram (excludes
   Utility / Manager, which aren't a spot on the field). Coordinates are
   in a 0-100 viewBox shared with the SVG diamond drawing. */
/* Rows are spaced generously apart (each row's circle + name tag needs
   roughly 20 vertical units of clearance) so that no two labels can ever
   touch, even with the longest names the truncation allows. */
const FIELD_POSITIONS = [
  { key: "Champ centre", short: "CC", x: 50, y: 14 },
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

function getLineup(state, matchId) {
  const l = state.lineups[matchId] || { defense: {}, batting: [] };
  const batting = Array.from({ length: 9 }, (_, i) => l.batting[i] || "");
  return { defense: l.defense || {}, batting };
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
          setScreen(isStaffRole(res.session.role) ? "composition" : "player");
        }
        setLoading(false);
      })
      .catch((e) => {
        setError("Impossible de charger les données. Réessaie dans un instant.");
        setLoading(false);
      });
  }, []);

  /* Every data-changing action goes through the server API. The server
     verifies the session token and the caller's role before doing
     anything — the client never computes permissions or touches raw
     storage itself. */
  async function callMutation(action, payload) {
    setBusy(true);
    setError("");
    try {
      const res = await callApi({ action, token: authToken, ...payload });
      setState(res.state);
      return true;
    } catch (e) {
      setError(e.message || "Une erreur est survenue. Réessaie.");
      return false;
    } finally {
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
        username: form.username,
        password: form.password,
        playerId: form.playerId,
        newNom: form.newNom,
        newPrenom: form.newPrenom,
        isStaff: form.isStaff,
        staffCode: form.staffCode,
        isOwner: form.isOwner,
        ownerCode: form.ownerCode,
      });
      setState(res.state);
      setAuthToken(res.token);
      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      } catch (e) {
        /* ignore storage errors */
      }
      setSession({ username: res.username, playerId: res.playerId, role: res.role });
      setScreen(isStaffRole(res.role) ? "composition" : "player");
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
      setState(res.state);
      setAuthToken(res.token);
      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      } catch (e) {
        /* ignore storage errors */
      }
      setSession({ username: res.username, playerId: res.playerId, role: res.role });
      setScreen(isStaffRole(res.role) ? "composition" : "player");
    } catch (e) {
      setError(e.message || "Une erreur est survenue. Réessaie.");
    } finally {
      setBusy(false);
    }
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

  async function addMatch() {
    await callMutation("addMatch", {});
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

  async function addTeam() {
    await callMutation("addTeam", {});
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

  async function deletePlayer(playerId) {
    const ok = await callMutation("deletePlayer", { playerId });
    if (ok && session && session.playerId === playerId) {
      doLogout();
    }
    return ok;
  }

  /* ---------------- Derived ---------------- */


  const me = useMemo(() => {
    if (!state || !session) return null;
    return state.roster.find((p) => p.id === session.playerId) || null;
  }, [state, session]);

  /* ---------------- Render ---------------- */

  if (loading) {
    return (
      <div className="dragons-app">
        <style>{CSS}</style>
        <div className="center-screen">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="dragons-app">
      <style>{CSS}</style>

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
            {isStaffRole(session.role) ? (
              <div className="tab-switch">
                <button
                  className={screen === "composition" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("composition")}
                >
                  Composition
                </button>
                <button
                  className={screen === "coach" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("coach")}
                >
                  Suivi
                </button>
                <button
                  className={screen === "matches" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("matches")}
                >
                  Matchs
                </button>
                <button
                  className={screen === "roster" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("roster")}
                >
                  Présences
                </button>
                <button
                  className={screen === "results" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("results")}
                >
                  Résultats
                </button>
                <button
                  className={screen === "standings" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("standings")}
                >
                  Classement
                </button>
                <button
                  className={screen === "history" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("history")}
                >
                  Historique
                </button>
                <button
                  className={screen === "player" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("player")}
                >
                  Ma présence
                </button>
              </div>
            ) : (
              <div className="tab-switch">
                <button
                  className={screen === "player" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("player")}
                >
                  Ma présence
                </button>
                <button
                  className={screen === "roster" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("roster")}
                >
                  Présences
                </button>
                <button
                  className={screen === "results" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("results")}
                >
                  Résultats
                </button>
                <button
                  className={screen === "standings" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("standings")}
                >
                  Classement
                </button>
                <button
                  className={screen === "history" ? "tsw active" : "tsw"}
                  onClick={() => setScreen("history")}
                >
                  Historique
                </button>
              </div>
            )}
            <span className="who">
              {me ? `${me.prenom} ${me.nom}` : session.username}
            </span>
            <button className="btn-ghost" onClick={doLogout}>
              Déconnexion
            </button>
          </div>
        )}
      </header>

      <main className="content">
        {!session && screen === "login" && (
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
            accounts={state.accounts}
            onSubmit={doSignup}
            onGoLogin={() => { setError(""); setScreen("login"); }}
            error={error}
            busy={busy}
          />
        )}

        {session && screen === "player" && me && (
          <PlayerView
            player={me}
            matches={state.matches}
            presence={state.presence[me.id] || {}}
            positions={state.positions[me.id] || {}}
            onSetPresence={(matchId, v) => setPresence(me.id, matchId, v)}
            onSetVehicule={(matchId, v) => setVehicule(me.id, matchId, v)}
            onSetPosition={(slot, v) => setPosition(me.id, slot, v)}
            onSetNumero={(v) => setNumero(me.id, v)}
            busy={busy}
          />
        )}

        {session && screen === "roster" && (
          <PresenceRosterView state={state} />
        )}

        {session && screen === "results" && (
          <ResultsView
            matches={state.matches}
            canEdit={isStaffRole(session.role)}
            onSetInning={(matchId, team, idx, value) => setInning(matchId, team, idx, value)}
          />
        )}

        {session && screen === "standings" && (
          <StandingsView
            standings={state.standings}
            canEdit={isStaffRole(session.role)}
            onUpdateField={(teamId, field, value) => updateTeamField(teamId, field, value)}
            onAddTeam={() => addTeam()}
            onDeleteTeam={(teamId) => deleteTeam(teamId)}
            busy={busy}
          />
        )}

        {session && screen === "history" && (
          <HistoryView matches={state.matches} lineups={state.lineups} roster={state.roster} />
        )}

        {session && screen === "coach" && isStaffRole(session.role) && (
          <CoachView
            state={state}
            actingUser={session.username}
            onSetPresence={(playerId, matchId, v) => setPresence(playerId, matchId, v)}
            onResetPassword={(username, newPassword) => doResetPassword(username, newPassword)}
            onDeleteAccount={(username) => doDeleteAccount(username)}
            onSetAccountRole={(username, role) => doSetAccountRole(username, role)}
            onRenameAccount={(oldU, newU) => doRenameAccount(oldU, newU)}
            onDeletePlayer={(playerId) => deletePlayer(playerId)}
            currentUsername={session.username}
            currentPlayerId={session.playerId}
            currentRole={session.role}
            busy={busy}
          />
        )}

        {session && screen === "composition" && isStaffRole(session.role) && (
          <LineupView
            state={state}
            actingUser={session.username}
            onSetDefense={(matchId, poste, playerId) => setDefenseSlot(matchId, poste, playerId)}
            onSetBatting={(matchId, index, playerId) => setBattingSlot(matchId, index, playerId)}
            busy={busy}
          />
        )}

        {session && screen === "matches" && isStaffRole(session.role) && (
          <MatchesView
            matches={state.matches}
            onUpdateField={(matchId, field, value) => updateMatchField(matchId, field, value)}
            onAddMatch={() => addMatch()}
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
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

function LoginView({ onLogin, onGoSignup, error, busy }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      <div className="forgot-hint">
        Mot de passe oublié ? Demande à un membre du coaching staff de le réinitialiser
        (onglet Suivi → Comptes).
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Signup                                                              */
/* ------------------------------------------------------------------ */

function SignupView({ roster, accounts, onSubmit, onGoLogin, error, busy }) {
  const claimedIds = useMemo(
    () => new Set(Object.values(accounts).map((a) => a.playerId)),
    [accounts]
  );
  const available = roster
    .filter((p) => !claimedIds.has(p.id))
    .sort((a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom));

  const [playerId, setPlayerId] = useState(available[0]?.id || "__new__");
  const [newNom, setNewNom] = useState("");
  const [newPrenom, setNewPrenom] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [staffCode, setStaffCode] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [ownerCode, setOwnerCode] = useState("");

  const ownerModeAvailable = useMemo(() => {
    try {
      return typeof window !== "undefined" && window.location.search.includes("owner");
    } catch (e) {
      return false;
    }
  }, []);

  function suggestUsername(id) {
    if (id === "__new__") return;
    const p = roster.find((r) => r.id === id);
    if (p) setUsername(slugify(p.nom, p.prenom));
  }

  const mismatch = password && password2 && password !== password2;

  return (
    <div className="card auth-card">
      <h2>Créer un compte</h2>

      <label className="field">
        <span>Qui es-tu ?</span>
        <select
          value={playerId}
          onChange={(e) => {
            setPlayerId(e.target.value);
            suggestUsername(e.target.value);
          }}
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

      <label className="field">
        <span>Identifiant</span>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex: prénom.nom" />
      </label>
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

      {error && <div className="error">{error}</div>}

      <button
        className="btn-primary"
        disabled={busy || mismatch}
        onClick={() =>
          onSubmit({ playerId, newNom, newPrenom, username, password, isStaff, staffCode, isOwner, ownerCode })
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

function PlayerView({ player, matches, presence, positions, onSetPresence, onSetVehicule, onSetPosition, onSetNumero, busy }) {
  const upcomingMatches = matches.filter(
    (m) => (m.season || CURRENT_SEASON) === CURRENT_SEASON && matchResult(m) === null && !m.cancelled
  );

  return (
    <div>
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

      <div className="card">
        <h2>Mes présences</h2>
        <div className="hint" style={{ marginBottom: 12 }}>
          Seuls les matchs de la saison en cours qui n'ont pas encore de résultat s'affichent
          ici — une fois un match joué et son score saisi, il n'apparaît plus (plus de saisie à
          faire dessus).
        </div>
        <div className="match-list">
          {upcomingMatches.length === 0 && (
            <div className="hint">Tous les matchs de cette saison ont déjà été joués — rien à renseigner pour le moment.</div>
          )}
          {upcomingMatches.map((m) => {
            const status = presence[m.id];
            const vehicule = presence[m.id + "-vehicule"];
            return (
              <div className="match-row" key={m.id}>
                <div className="match-info">
                  <div className="match-name">{m.label}{m.opponent ? ` vs ${m.opponent}` : ""}</div>
                  <div className="match-date">{m.date}</div>
                </div>
                <div className="status-btns">
                  {STATUTS.map((st) => (
                    <button
                      key={st.value}
                      className={"status-btn " + st.value + (status === st.value ? " selected" : "")}
                      onClick={() => onSetPresence(m.id, st.value)}
                      disabled={busy}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Coach view                                                          */
/* ------------------------------------------------------------------ */

function CoachView({
  state,
  actingUser,
  onSetPresence,
  onResetPassword,
  onDeleteAccount,
  onSetAccountRole,
  onRenameAccount,
  onDeletePlayer,
  currentUsername,
  currentPlayerId,
  currentRole,
  busy,
}) {
  const [search, setSearch] = useState("");
  const [suiviSeasonFilter, setSuiviSeasonFilter] = useState(null);
  const suiviSeasons = useMemo(() => {
    const set = new Set(state.matches.map((m) => m.season || "—"));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [state.matches]);
  const effectiveSuiviSeason = suiviSeasonFilter ?? (suiviSeasons[0] || "all");
  const suiviMatches = useMemo(
    () => state.matches.filter((m) => effectiveSuiviSeason === "all" || (m.season || "—") === effectiveSuiviSeason),
    [state.matches, effectiveSuiviSeason]
  );
  const [activeMatch, setActiveMatch] = useState(state.matches[0].id);
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
    return state.roster
      .filter((p) => `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const statusA = (state.presence[a.id] || {})[activeMatch];
        const statusB = (state.presence[b.id] || {})[activeMatch];
        const orderA = statusOrder[statusA] ?? 3;
        const orderB = statusOrder[statusB] ?? 3;
        if (orderA !== orderB) return orderA - orderB;
        return (a.nom + a.prenom).localeCompare(b.nom + b.prenom);
      });
  }, [state.roster, state.presence, activeMatch, search]);

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, reserve: 0, unknown: 0 };
    state.roster.forEach((p) => {
      const v = (state.presence[p.id] || {})[activeMatch];
      if (v === "present") c.present++;
      else if (v === "absent") c.absent++;
      else if (v === "reserve") c.reserve++;
      else c.unknown++;
    });
    return c;
  }, [state, activeMatch]);

  const posteCounts = useMemo(() => {
    return POSTES.map((poste) => {
      const count = state.roster.filter((p) => {
        const status = (state.presence[p.id] || {})[activeMatch];
        if (status !== "present" && status !== "reserve") return false;
        const pos = state.positions[p.id] || {};
        return pos.pos1 === poste || pos.pos2 === poste || pos.pos3 === poste;
      }).length;
      return { poste, count };
    });
  }, [state, activeMatch]);

  function cycleStatus(playerId) {
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
    return p.id !== currentPlayerId && !playerLinkedStaffBlocked(p.id);
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
    return true;
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
      return { username, ...acc, playerName: player ? `${player.prenom} ${player.nom}` : acc.playerId };
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

  return (
    <div>
      <div className="card">
        <h2>Vue d'ensemble par match</h2>
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
            <div></div>
            <div>Joueur</div>
            <div>Postes</div>
            <div>Statut — {state.matches.find((m) => m.id === activeMatch)?.label}</div>
            <div>Actions</div>
          </div>
          {players.map((p) => {
            const pos = state.positions[p.id] || {};
            const status = (state.presence[p.id] || {})[activeMatch];
            return (
              <div className="grid-row grid-row-with-actions" key={p.id}>
                <div>
                  <input
                    type="checkbox"
                    checked={selectedPlayers.has(p.id)}
                    onChange={() => togglePlayerSelect(p.id)}
                    disabled={!canDeletePlayerRow(p)}
                  />
                </div>
                <div className="grid-name">{p.prenom} {p.nom}{p.numero ? ` · #${p.numero}` : ""}</div>
                <div className="grid-pos">
                  {[pos.pos1, pos.pos2, pos.pos3].filter(Boolean).join(" · ") || "—"}
                </div>
                <div>
                  <button className="cell-status" style={{ cursor: busy ? "wait" : "pointer" }} onClick={() => !busy && cycleStatus(p.id)}>
                    <StatusPill value={status} />
                  </button>
                </div>
                <div>
                  {playerDeleteConfirm === p.id ? (
                    <div className="reset-form">
                      <button className="btn-danger small" disabled={busy} onClick={() => handleDeletePlayer(p.id)}>
                        Confirmer
                      </button>
                      <button className="btn-ghost small" onClick={() => setPlayerDeleteConfirm(null)}>
                        Annuler
                      </button>
                    </div>
                  ) : (
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
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="hint">Clique sur un statut pour le faire tourner (Présent → Absent → Sous réserve → vide). Supprimer un joueur retire aussi ses présences, ses postes, sa place dans les compositions, et son compte s'il en a un.</div>
      </div>

      <div className="card">
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

      <div className="card">
        <h2>Comptes</h2>
        {resetMsg && <div className="ok-msg">{resetMsg}</div>}

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
                <span className="account-user">@{acc.username}{acc.role === "owner" ? " · propriétaire" : acc.role === "coach" ? " · staff" : ""}</span>
              </div>

              {editTarget === acc.username ? (
                <div className="reset-form">
                  <input
                    placeholder="Identifiant"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                  />
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                    <option value="player">Joueur</option>
                    {currentRole === "owner" && <option value="coach">Staff</option>}
                    {currentRole === "owner" && <option value="owner">Propriétaire</option>}
                  </select>
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

function LineupView({ state, actingUser, onSetDefense, onSetBatting, busy }) {
  const [matchId, setMatchId] = useState(state.matches[0].id);
  const lineup = getLineup(state, matchId);

  const eligible = useMemo(() => {
    return state.roster
      .map((p) => ({
        ...p,
        status: (state.presence[p.id] || {})[matchId],
        prefs: [
          (state.positions[p.id] || {}).pos1,
          (state.positions[p.id] || {}).pos2,
          (state.positions[p.id] || {}).pos3,
        ].filter(Boolean),
      }))
      .filter((p) => p.status === "present" || p.status === "reserve")
      .sort((a, b) => (a.status === b.status ? 0 : a.status === "present" ? -1 : 1));
  }, [state, matchId]);

  function playerLabel(p) {
    return `${p.prenom} ${p.nom}${p.numero ? " #" + p.numero : ""}`;
  }

  const usedInDefense = useMemo(
    () => new Set(Object.values(lineup.defense).filter(Boolean)),
    [lineup.defense]
  );
  const usedInBatting = useMemo(
    () => new Set(lineup.batting.filter(Boolean)),
    [lineup.batting]
  );

  async function handleDefenseChange(posteKey, playerId) {
    if (playerId) {
      const existingSlot = Object.entries(lineup.defense).find(
        ([slot, pid]) => pid === playerId && slot !== posteKey
      );
      if (existingSlot) {
        await onSetDefense(matchId, existingSlot[0], "");
      }
    }
    await onSetDefense(matchId, posteKey, playerId);
  }

  async function handleBattingChange(index, playerId) {
    if (playerId) {
      const existingIndex = lineup.batting.findIndex((pid, i) => pid === playerId && i !== index);
      if (existingIndex !== -1) {
        await onSetBatting(matchId, existingIndex, "");
      }
    }
    await onSetBatting(matchId, index, playerId);
  }

  return (
    <div>
      <div className="card">
        <h2>Composition — choisir le match</h2>
        <select className="match-select" value={matchId} onChange={(e) => setMatchId(e.target.value)}>
          {state.matches.map((m) => (
            <option key={m.id} value={m.id}>{m.label}{m.opponent ? ` vs ${m.opponent}` : ""} — {m.date}</option>
          ))}
        </select>
        <div className="hint">
          {eligible.length} joueur(s) disponible(s) (présents ou sous réserve) pour ce match.
        </div>
      </div>

      <div className="card">
        <h2>Défense — placement sur le terrain</h2>
        <div className="field-wrap">
          <FieldDiagram defense={lineup.defense} roster={state.roster} />
        </div>
        <div className="hint" style={{ marginBottom: 10 }}>
          Les joueurs déjà placés à un autre poste apparaissent en <span style={{ color: "var(--bad)" }}>rouge</span> dans
          les listes ci-dessous (les choisir ailleurs les y déplace — jamais de doublon). Une
          étoile ★ signale un poste souhaité par le joueur.
        </div>
        <div className="defense-list">
          {FIELD_POSITIONS.map((fp) => (
            <label className="field defense-row" key={fp.key}>
              <span>{fp.key}</span>
              <select
                value={lineup.defense[fp.key] || ""}
                onChange={(e) => handleDefenseChange(fp.key, e.target.value)}
                disabled={busy}
              >
                <option value="">—</option>
                {eligible.map((p) => {
                  const alreadyPlaced = usedInDefense.has(p.id) && lineup.defense[fp.key] !== p.id;
                  return (
                    <option key={p.id} value={p.id} style={alreadyPlaced ? { color: "#e05a4e" } : undefined}>
                      {alreadyPlaced ? "🔴 " : ""}{playerLabel(p)}{p.prefs.includes(fp.key) ? " ★" : ""}{alreadyPlaced ? " (déjà placé)" : ""}
                    </option>
                  );
                })}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Ordre au bâton</h2>
        <div className="hint" style={{ marginBottom: 10 }}>
          Même principe : les joueurs déjà positionnés dans l'ordre au bâton apparaissent en
          rouge — les choisir ailleurs les y déplace, jamais de doublon.
        </div>
        <div className="batting-list">
          {lineup.batting.map((playerId, idx) => (
            <label className="field defense-row" key={idx}>
              <span>{idx + 1}{idx === 0 ? "er" : "e"} au bâton</span>
              <select
                value={playerId || ""}
                onChange={(e) => handleBattingChange(idx, e.target.value)}
                disabled={busy}
              >
                <option value="">—</option>
                {eligible.map((p) => {
                  const alreadyPlaced = usedInBatting.has(p.id) && lineup.batting[idx] !== p.id;
                  return (
                    <option key={p.id} value={p.id} style={alreadyPlaced ? { color: "#e05a4e" } : undefined}>
                      {alreadyPlaced ? "🔴 " : ""}{playerLabel(p)}{alreadyPlaced ? " — déjà placé" : ""}
                    </option>
                  );
                })}
              </select>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Matches admin view (coach only) — edit dates, opponents, scores,   */
/* and a souvenir photo per match                                     */
/* ------------------------------------------------------------------ */

function MatchesView({ matches, onUpdateField, onAddMatch, onDeleteMatch, onReorderMatches, busy }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null); // matchId pending delete confirm
  const [seasonFilter, setSeasonFilter] = useState(null);

  const seasons = useMemo(() => {
    const set = new Set(matches.map((m) => m.season || "—"));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [matches]);

  const effectiveFilter = seasonFilter ?? (seasons[0] || "all");

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
    onAddMatch();
    if (effectiveFilter !== CURRENT_SEASON) setSeasonFilter(CURRENT_SEASON);
  }

  return (
    <div>
      <div className="card">
        <h2>Matchs de la saison</h2>
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
          <button className="btn-primary small" onClick={handleAddMatch} disabled={busy}>
            + Ajouter un match
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
                  <span>Saison</span>
                  <DebouncedInput
                    value={m.season || ""}
                    onCommit={(v) => onUpdateField(m.id, "season", v)}
                    disabled={busy}
                    placeholder="ex: 2026"
                  />
                </label>
              </div>
              <label className="field">
                <span>Équipe rencontrée</span>
                <DebouncedInput
                  value={m.opponent}
                  onCommit={(v) => onUpdateField(m.id, "opponent", v)}
                  disabled={busy}
                  placeholder="ex: Compiègne"
                />
              </label>
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

function ResultsView({ matches, canEdit, onSetInning }) {
  const [matchId, setMatchId] = useState(matches[0]?.id);
  const match = matches.find((m) => m.id === matchId) || matches[0];
  if (!match) {
    return (
      <div className="card">
        <h2>Résultats</h2>
        <div className="hint">Aucun match pour l'instant.</div>
      </div>
    );
  }
  const innings = getInnings(match);
  const dTotal = inningsTotal(innings.dragons);
  const aTotal = inningsTotal(innings.adversaire);

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
    <div className="card">
      <h2>Résultats — feuille de score</h2>
      <select className="match-select" value={match.id} onChange={(e) => setMatchId(e.target.value)}>
        {matches.map((m) => (
          <option key={m.id} value={m.id}>{m.label}{m.opponent ? ` vs ${m.opponent}` : ""}{m.cancelled ? " (annulé)" : ""}</option>
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

function StandingsView({ standings, canEdit, onUpdateField, onAddTeam, onDeleteTeam, busy }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState(null);

  const seasons = useMemo(() => {
    const set = new Set((standings || []).map((t) => t.season || "—"));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [standings]);

  const effectiveFilter = seasonFilter ?? (seasons[0] || "all");

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
    onAddTeam();
    if (effectiveFilter !== CURRENT_SEASON) setSeasonFilter(CURRENT_SEASON);
  }

  return (
    <div className="card">
      <h2>Classement</h2>
      {!canEdit && <div className="hint" style={{ marginBottom: 12 }}>Vue en lecture seule — mis à jour manuellement par le coaching staff d'après le classement officiel.</div>}
      {canEdit && (
        <div className="hint" style={{ marginBottom: 14 }}>
          Recopie les chiffres depuis la page de classement officielle de la ligue. Le PCT et
          le nombre de matchs d'écart (GB) se calculent automatiquement. Pour créer une nouvelle
          saison : ajoute une équipe, puis change le petit champ "Saison" sous son nom (ex:
          2027) — elle apparaîtra alors dans le sélecteur ci-dessous.
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
              {canEdit ? (
                <>
                  <DebouncedInput
                    className="standings-team-input"
                    value={team.team}
                    onCommit={(v) => onUpdateField(team.id, "team", v)}
                    disabled={busy}
                  />
                  <DebouncedInput
                    className="standings-season-input"
                    value={team.season || ""}
                    onCommit={(v) => { onUpdateField(team.id, "season", v); setSeasonFilter(v); }}
                    disabled={busy}
                    placeholder="Saison ex: 2027"
                  />
                </>
              ) : (
                <span className="standings-team-name">{team.team}</span>
              )}
            </div>
            {["w", "l", "t"].map((field) => (
              <div key={field} className={"sr-" + field}>
                <span className="sr-mobile-label">{field.toUpperCase()}</span>
                {canEdit ? (
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
            {canEdit && (
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
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <div className="standings-row">
            <div className="hint" style={{ padding: "8px 0" }}>Aucune équipe pour l'instant.</div>
          </div>
        )}
      </div>

      {canEdit && (
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

function HistoryView({ matches, lineups, roster }) {
  const seasons = useMemo(() => {
    const set = new Set(matches.map((m) => m.season || "—"));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [matches]);

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
  );
}

/* ------------------------------------------------------------------ */
/* Read-only presence roster view (for players)                        */
/* ------------------------------------------------------------------ */

function PresenceRosterView({ state }) {
  const [matchId, setMatchId] = useState(state.matches[0]?.id);
  const match = state.matches.find((m) => m.id === matchId) || state.matches[0];

  const rows = useMemo(() => {
    const statusOrder = { present: 0, reserve: 1, absent: 2 };
    return state.roster
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

  if (!match) {
    return (
      <div className="card">
        <h2>Présences de l'équipe</h2>
        <div className="hint">Aucun match pour l'instant.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Présences de l'équipe</h2>
      <select className="match-select" value={match.id} onChange={(e) => setMatchId(e.target.value)}>
        {state.matches.map((m) => (
          <option key={m.id} value={m.id}>{m.label}{m.opponent ? ` vs ${m.opponent}` : ""} — {m.date}</option>
        ))}
      </select>
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                               */
/* ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;700&display=swap');

.dragons-app {
  --bg: #0f2818;
  --panel: #143a24;
  --panel-alt: #1b4a2e;
  --line: rgba(212, 175, 55, 0.25);
  --gold: #d4af37;
  --cream: #f1ead6;
  --ok: #3f9e5e;
  --bad: #c0392b;
  --warn: #e0a83d;
  --muted: #9db8a5;
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
html, body { overflow-x: hidden; min-height: 100%; background: #0f2818; }

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
.tsw.active { background: var(--gold); color: #12280f; font-weight: 600; }

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

.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; font-size: 13px; color: var(--muted); }
.field input, .field select {
  background: #0c2015;
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
  color: #12280f;
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
  background: rgba(192, 57, 43, 0.15);
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
  background: #0c2015;
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
.status-btn.selected.present { background: var(--ok); border-color: var(--ok); color: #06210f; font-weight: 600; }
.status-btn.selected.absent { background: var(--bad); border-color: var(--bad); color: #2a0805; font-weight: 600; }
.status-btn.selected.reserve { background: var(--warn); border-color: var(--warn); color: #2a1c02; font-weight: 600; }

.vehicule-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); margin-left: auto; }

.pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #0c2015;
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
.mtab.active { background: var(--gold); color: #12280f; border-color: var(--gold); font-weight: 600; }

.counts-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.count-chip { font-size: 12px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line); }
.count-chip.present { color: var(--ok); }
.count-chip.absent { color: var(--bad); }
.count-chip.reserve { color: var(--warn); }
.count-chip.unknown { color: var(--muted); }

.search {
  width: 100%;
  box-sizing: border-box;
  background: #0c2015;
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
.grid-pos { font-size: 12px; color: var(--muted); }
.grid-header-with-actions, .grid-row-with-actions {
  grid-template-columns: 24px 2fr 2fr 1.2fr auto;
}
.grid-header-with-vehicule, .grid-row-with-vehicule {
  grid-template-columns: 2fr 2fr 1.2fr 90px;
}
.grid-vehicule { font-size: 12px; color: var(--cream); }
.cell-status { background: none; border: none; padding: 0; cursor: pointer; }

.hint { font-size: 12px; color: var(--muted); margin-top: 10px; }

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
  background: #0c2015;
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
.field-marker { fill: rgba(12,32,21,0.85); stroke: var(--gold); stroke-width: 0.6; }
.field-marker.filled { fill: var(--gold); stroke: var(--cream); }
.field-marker-label { font-family: 'Oswald', sans-serif; font-size: 5.4px; fill: var(--cream); font-weight: 700; }
.field-marker.filled + .field-marker-label { fill: #12280f; }
.field-marker-name-bg { fill: rgba(241, 234, 214, 0.92); }
.field-marker-name { font-family: 'Inter', sans-serif; font-size: 3.9px; font-weight: 700; fill: #12280f; }
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
.batting-row select { flex: 1; background: #0c2015; border: 1px solid var(--line); color: var(--cream); padding: 8px; border-radius: 8px; }

.btn-primary.small { width: auto; padding: 8px 14px; font-size: 13px; }
.btn-ghost.small { padding: 6px 10px; font-size: 12px; }

.forgot-hint {
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  margin-top: 14px;
  line-height: 1.5;
}

.ok-msg {
  background: rgba(63, 158, 94, 0.15);
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
  background: #0c2015;
}
.account-checkbox { flex: 0 0 auto; width: 16px; height: 16px; }
.bulk-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.bulk-confirm { display: flex; align-items: center; gap: 8px; }
.account-info { display: flex; flex-direction: column; }
.account-name { font-size: 13px; color: var(--cream); }
.account-user { font-size: 11px; color: var(--muted); font-family: 'Roboto Mono', monospace; }
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
.btn-danger:hover { background: rgba(192, 57, 43, 0.15); }
.btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }

.confirm-text { font-size: 12px; color: var(--muted); }

.reset-form { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.reset-form input {
  background: #143a24;
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
  background: #0c2015;
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
.loc-btn.active { background: var(--gold); color: #12280f; border-color: var(--gold); font-weight: 600; }
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
.poste-chip.poste-zero { border-color: var(--bad); color: #ff9d8f; background: rgba(192, 57, 43, 0.12); }
.poste-chip.poste-low { border-color: var(--warn); color: var(--warn); background: rgba(224, 168, 61, 0.1); }
.poste-chip.poste-ok { border-color: var(--ok); color: #8fe3ac; background: rgba(63, 158, 94, 0.1); }

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
  background: #0c2015;
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
  background: #0c2015;
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
  background: #0c2015;
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
  background: #0c2015;
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
  background: #0c2015;
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
  color: #0c2015;
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
  background: #0c2015;
}
.hist-row-title { font-size: 13px; color: var(--cream); }
.hist-row-season { color: var(--muted); font-size: 12px; }
.hist-row-date { font-size: 11px; color: var(--muted); font-family: 'Roboto Mono', monospace; }
.hist-row-right { display: flex; align-items: center; gap: 8px; }
.hist-row-score { font-family: 'Roboto Mono', monospace; color: var(--gold); font-weight: 700; }

.hist-row-wrap { display: flex; flex-direction: column; }
.hist-comp {
  border: 1px solid var(--line);
  border-top: none;
  border-radius: 0 0 10px 10px;
  padding: 12px;
  background: #0a1a10;
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
