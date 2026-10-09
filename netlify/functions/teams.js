import { getStore } from "@netlify/blobs";
import { loadTeams, TEAM_LOGO_PREFIX } from "../lib/teams-data.js";

/* Équipes adverses et leurs logos (gérés depuis l'appli par le staff).
   GET /api/teams            → liste publique {id, name, aliases, color, logo}
   GET /api/teams?logo=<id>  → l'image du logo (PNG/JPEG/WebP)
   Public : seuls des noms de clubs et des logos, rien de personnel. */

function getBlobStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) return getStore({ name: "dragons-app", siteID, token });
  return getStore("dragons-app");
}

export default async (req) => {
  const url = new URL(req.url, "http://x");
  const store = getBlobStore();
  const id = url.searchParams.get("logo");
  if (id) {
    const raw = /^[a-z0-9-]{1,60}$/.test(id) ? await store.get(TEAM_LOGO_PREFIX + id) : null;
    const m = raw && raw.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
    if (!m) return new Response("introuvable", { status: 404 });
    return new Response(Buffer.from(m[2], "base64"), {
      status: 200,
      headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }
  const teams = await loadTeams(store);
  return new Response(JSON.stringify({ teams }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60", "Netlify-CDN-Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
};

export const config = { path: "/api/teams" };
