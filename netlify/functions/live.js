import { getStore } from "@netlify/blobs";

/* Page publique /live : renvoie les matchs diffusés en direct.
   Aucune connexion, aucune donnée privée (la tablette n'envoie qu'un résumé
   filtré). La réponse est mise en cache 15 s par le CDN Netlify : quel que soit
   le nombre de spectateurs, la fonction ne tourne qu'environ 4 fois par minute. */

const LIVE_PREFIX = "live/";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // un match en cours reste visible 12 h après la dernière action
const AFTER_END_MS = 15 * 60 * 1000; // un match terminé reste visible 15 min (image du score)

function getBlobStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) return getStore({ name: "dragons-app", siteID, token });
  return getStore("dragons-app");
}

/* Prochain match du calendrier (public : adversaire, date, heure, domicile/extérieur) pour la
   page d'attente du live. Dates saisies en texte libre : « 12 avril », « dim. 12 avril »,
   « 12/04 », « 12/04/2027 », « 2027-04-12 ». L'année vient de la saison si elle manque. */
const MOIS = { janv: 1, janvier: 1, fev: 2, fevr: 2, fevrier: 2, mars: 3, avr: 4, avril: 4, mai: 5, juin: 6, juil: 7, juillet: 7, aout: 8, sept: 9, septembre: 9, oct: 10, octobre: 10, nov: 11, novembre: 11, dec: 12, decembre: 12 };
const pad = (n) => String(n).padStart(2, "0");
function parseDate(txt, season) {
  const s = String(txt || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const yS = (String(season || "").match(/\d{4}/) || [])[0];
  m = s.match(/(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?/);
  if (m) { const y = m[3] ? (m[3].length === 2 ? "20" + m[3] : m[3]) : yS; return y ? `${y}-${pad(m[2])}-${pad(m[1])}` : null; }
  m = s.match(/(\d{1,2})\s*(?:er)?\s+([a-z]+)\.?(?:\s+(\d{4}))?/);
  if (m && MOIS[m[2]]) { const y = m[3] || yS; return y ? `${y}-${pad(MOIS[m[2]])}-${pad(m[1])}` : null; }
  return null;
}
function parseTime(txt) {
  const m = String(txt || "").match(/(\d{1,2})\s*[h:]\s*(\d{2})?/i);
  if (!m || +m[1] > 23) return null;
  return `${pad(m[1])}:${m[2] || "00"}`;
}
async function nextMatch(store, playedToday) {
  try {
    const raw = await store.get("dragons-presence-app-v1");
    if (!raw) return null;
    const st = JSON.parse(raw);
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
    const nowHM = new Date().toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });
    const limit = new Date(Date.now() + 7 * 864e5).toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
    const list = (st.matches || [])
      .filter((m) => !m.cancelled && m.opponent)
      .map((m) => ({ opp: m.opponent, label: m.label || "", day: parseDate(m.date, m.season), time: parseTime(m.time), home: m.location === "domicile" }))
      .filter((m) => m.day && m.day >= today && m.day <= limit)
      // match du jour déjà joué (live terminé aujourd'hui) : on passe au suivant
      .filter((m) => !(playedToday && m.day === today && (!m.time || m.time <= nowHM)))
      .sort((a, b) => (a.day + (a.time || "")).localeCompare(b.day + (b.time || "")));
    return list[0] ? { ...list[0], today: list[0].day === today } : null;
  } catch (e) { return null; }
}

export default async () => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=5",
    "Netlify-CDN-Cache-Control": "public, durable, s-maxage=15, stale-while-revalidate=30",
  };
  try {
    const store = getBlobStore();
    const { blobs } = await store.list({ prefix: LIVE_PREFIX });
    const games = [];
    const todayP = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
    let playedToday = false;
    for (const b of blobs) {
      const raw = await store.get(b.key);
      if (!raw) continue;
      try {
        const g = JSON.parse(raw);
        const age = Date.now() - (g.updated || 0);
        if (g.updated && new Date(g.updated).toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" }) === todayP) playedToday = true;
        if (age < (g.over ? AFTER_END_MS : MAX_AGE_MS)) games.push(g);
      } catch (e) { /* entrée illisible ignorée */ }
    }
    games.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    // Si un match est en cours, on n'affiche que lui (l'image d'un match fini disparaît).
    if (games.some((g) => !g.over)) games.splice(0, games.length, ...games.filter((g) => !g.over));
    const next = games.some((g) => !g.over) ? null : await nextMatch(store, playedToday);
    return new Response(JSON.stringify({ games: games.slice(0, 3), next, now: Date.now() }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ games: [], error: "indisponible" }), {
      status: 200,
      headers: { ...headers, "Netlify-CDN-Cache-Control": "public, s-maxage=5" },
    });
  }
};

export const config = { path: "/api/live" };
