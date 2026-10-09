/* Logos des équipes adverses.
   Pour ajouter un logo : déposer le fichier PNG dans /public/logos/ puis ajouter
   une ligne dans TEAMS (nom affiché + autres noms possibles + fichier).
   L'appli reconnaît l'adversaire par son nom (calendrier ou feuille de match). */
(function () {
  const TEAMS = [
    { name: "Apaches de Péronne", aliases: ["Péronne", "Apaches"], logo: "/logos/apaches-peronne.png", color: "#c8102e" },
    { name: "Kraken d'Amiens", aliases: ["Amiens", "Kraken"], logo: "/logos/kraken-amiens.png", color: "#2f5f9e" },
    { name: "Celtics de Tournai", aliases: ["Tournai", "Celtics"], logo: "/logos/celtics-tournai.png", color: "#1f8a3c" },
    { name: "Imperials de Compiègne", aliases: ["Compiègne", "Imperials"], logo: "/logos/imperials-compiegne.png", color: "#d9a514" },
    { name: "Vipères", aliases: [], logo: "/logos/viperes.png", color: "#c8262b" },
    { name: "Miners du Bassin Minier", aliases: ["Bassin Minier", "Miners"], logo: "/logos/miners-bassin-minier.png", color: "#d6a21e" },
  ];
  /* La liste à jour (équipes créées et logos déposés depuis l'appli) vient du serveur ;
     celle ci-dessus ne sert que si le réseau manque. */
  const DRAGONS = "/logos/dragons.png";
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  function find(name) {
    const n = norm(name);
    if (!n) return null;
    for (const t of TEAMS) {
      const keys = [t.name, ...(t.aliases || [])].map(norm).filter(Boolean);
      if (keys.some((k) => n === k || n.includes(k) || k.includes(n))) return t;
    }
    return null;
  }
  function url(name) {
    const t = find(name);
    return t && t.logo ? t.logo : null;
  }
  function initials(name) {
    const w = String(name || "?").split(/\s+/).filter((x) => x && !/^(de|du|des|la|le|les|d'|l')$/i.test(x));
    return ((w[0] || "?")[0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
  }
  /* Pastille HTML : le logo s'il existe, sinon les initiales */
  function badge(name, size) {
    const s = size || 40, u = url(name);
    if (u) return `<img src="${u}" alt="" width="${s}" height="${s}" style="width:${s}px;height:${s}px;object-fit:contain;border-radius:50%;background:#fff1;flex:none">`;
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${s}px;height:${s}px;border-radius:50%;background:#2a3a31;color:#e7efea;font:700 ${Math.round(s * 0.36)}px system-ui;flex:none">${initials(name)}</span>`;
  }
  function load(name) {
    const u = url(name);
    return new Promise((res) => {
      if (!u) return res(null);
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => res(null);
      i.src = u;
    });
  }
  /* image VS pour un match (home = à Ronchin) : celle du bon sens si elle existe, sinon l'autre */
  function vs(name, home) {
    const t = find(name);
    if (!t || !t.vs) return null;
    const f = home ? (t.vs.dom || t.vs.ext) : (t.vs.ext || t.vs.dom);
    return f ? "/logos/vs/" + f : null;
  }
  function color(name) { const t = find(name); return (t && t.color) || "#b8322a"; }
  const ready = fetch("/api/teams").then((r) => r.json()).then((d) => {
    if (d && Array.isArray(d.teams)) { TEAMS.splice(0, TEAMS.length, ...d.teams); }
    return TEAMS;
  }).catch(() => TEAMS);
  window.DragonsLogos = { TEAMS, DRAGONS, find, url, badge, load, initials, vs, color, ready };
})();
