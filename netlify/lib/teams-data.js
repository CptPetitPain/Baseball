/* Données partagées : équipes adverses par défaut (logos fournis avec le site). */
export const TEAMS_KEY = "teams";
export const TEAM_LOGO_PREFIX = "teamlogo/";
export const DEFAULT_TEAMS = [
  { id: "apaches-peronne", name: "Apaches de Péronne", aliases: ["Péronne", "Apaches"], color: "#c8102e", logo: "/logos/apaches-peronne.png" },
  { id: "kraken-amiens", name: "Kraken d'Amiens", aliases: ["Amiens", "Kraken"], color: "#2f5f9e", logo: "/logos/kraken-amiens.png" },
  { id: "celtics-tournai", name: "Celtics de Tournai", aliases: ["Tournai", "Celtics"], color: "#1f8a3c", logo: "/logos/celtics-tournai.png" },
  { id: "imperials-compiegne", name: "Imperials de Compiègne", aliases: ["Compiègne", "Imperials"], color: "#d9a514", logo: "/logos/imperials-compiegne.png" },
  { id: "viperes", name: "Vipères", aliases: [], color: "#c8262b", logo: "/logos/viperes.png" },
  { id: "miners-bassin-minier", name: "Miners du Bassin Minier", aliases: ["Bassin Minier", "Miners"], color: "#d6a21e", logo: "/logos/miners-bassin-minier.png" },
];

export const TEAMS_DELETED_KEY = "teams-deleted";
/* Liste enregistrée + équipes fournies avec le site qui n'y sont pas encore
   (sauf celles que le staff a supprimées exprès). */
export async function loadTeams(store) {
  let saved = null, deleted = [];
  try { const raw = await store.get(TEAMS_KEY); if (raw) saved = JSON.parse(raw); } catch (e) {}
  try { const raw = await store.get(TEAMS_DELETED_KEY); if (raw) deleted = JSON.parse(raw); } catch (e) {}
  if (!saved) return DEFAULT_TEAMS.filter((d) => !deleted.includes(d.id));
  return [...saved, ...DEFAULT_TEAMS.filter((d) => !saved.some((x) => x.id === d.id) && !deleted.includes(d.id))];
}

