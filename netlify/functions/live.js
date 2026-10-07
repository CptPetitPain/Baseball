import { getStore } from "@netlify/blobs";

/* Page publique /live : renvoie les matchs diffusés en direct.
   Aucune connexion, aucune donnée privée (la tablette n'envoie qu'un résumé
   filtré). La réponse est mise en cache 15 s par le CDN Netlify : quel que soit
   le nombre de spectateurs, la fonction ne tourne qu'environ 4 fois par minute. */

const LIVE_PREFIX = "live/";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // un match reste visible 12 h après la dernière action

function getBlobStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) return getStore({ name: "dragons-app", siteID, token });
  return getStore("dragons-app");
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
    for (const b of blobs) {
      const raw = await store.get(b.key);
      if (!raw) continue;
      try {
        const g = JSON.parse(raw);
        if (Date.now() - (g.updated || 0) < MAX_AGE_MS) games.push(g);
      } catch (e) { /* entrée illisible ignorée */ }
    }
    games.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    return new Response(JSON.stringify({ games: games.slice(0, 3), now: Date.now() }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ games: [], error: "indisponible" }), {
      status: 200,
      headers: { ...headers, "Netlify-CDN-Cache-Control": "public, s-maxage=5" },
    });
  }
};

export const config = { path: "/api/live" };
