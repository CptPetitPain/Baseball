/* Carte des frappes (spray chart) — partagé entre la feuille de match et la page Adversaires.
   Coordonnées stockées en 0..1 sur le terrain dessiné (marbre en bas au centre). */
(function () {
  const W = 300, H = 290, HX = 150, HY = 272, R = 205, VY = 50; // R = clôture, VY = haut du cadre affiché
  const rad = Math.PI / 180;
  const pt = (deg, d) => [HX + Math.sin(deg * rad) * d, HY - Math.cos(deg * rad) * d];
  const f = (n) => Math.round(n * 10) / 10;
  const LP = pt(-45, R), RP = pt(45, R);
  const B1 = pt(45, 64), B2 = pt(0, 90.5), B3 = pt(-45, 64);
  const DIRT = 98;
  const IL = pt(-45, DIRT), IR = pt(45, DIRT);

  const COL = { hit: "#3FAE74", out: "#F2665A", on: "#F2B632" };
  const TYPES = { G: "Roulant", L: "Ligne", F: "Chandelle", B: "Amorti" };

  /* catégorie d'un résultat : hit (vert), out (rouge), on (jaune : erreur, choix du défenseur) */
  function cat(res) {
    if (["1B", "2B", "3B", "HR"].includes(res)) return "hit";
    return "out";
  }

  function field(opts) {
    const o = opts || {};
    return `<rect x="0" y="${VY}" width="${W}" height="${H - VY}" rx="14" fill="#13201A"/>
    <path d="M${HX} ${HY} L${f(LP[0])} ${f(LP[1])} A${R} ${R} 0 0 1 ${f(RP[0])} ${f(RP[1])} Z" fill="#1E4A31" stroke="#2F6B48" stroke-width="2"/>
    <path d="M${HX} ${HY} L${f(IL[0])} ${f(IL[1])} A${DIRT} ${DIRT} 0 0 1 ${f(IR[0])} ${f(IR[1])} Z" fill="#6B4A2E" opacity=".75"/>
    <path d="M${HX} ${HY} L${f(B1[0])} ${f(B1[1])} L${f(B2[0])} ${f(B2[1])} L${f(B3[0])} ${f(B3[1])} Z" fill="#1E4A31" stroke="#E7EFEA" stroke-opacity=".5" stroke-width="1.5"/>
    <line x1="${HX}" y1="${HY}" x2="${f(LP[0])}" y2="${f(LP[1])}" stroke="#E7EFEA" stroke-opacity=".75" stroke-width="1.5"/>
    <line x1="${HX}" y1="${HY}" x2="${f(RP[0])}" y2="${f(RP[1])}" stroke="#E7EFEA" stroke-opacity=".75" stroke-width="1.5"/>
    <circle cx="${HX}" cy="${HY - 46}" r="6" fill="#6B4A2E" stroke="#E7EFEA" stroke-opacity=".4"/>
    ${[B1, B2, B3].map(([x, y]) => `<rect x="${f(x) - 4}" y="${f(y) - 4}" width="8" height="8" transform="rotate(45 ${f(x)} ${f(y)})" fill="#E7EFEA"/>`).join("")}
    <path d="M${HX - 5} ${HY + 4} h10 v-4 l-5 -5 l-5 5 z" fill="#E7EFEA"/>
    ${o.labels === false ? "" : [["LF", -30, 165], ["CF", 0, 170], ["RF", 30, 165], ["SS", -14, 112], ["2B", 14, 112], ["3B", -36, 78], ["1B", 36, 78]].map(([t, a, d]) => { const [x, y] = pt(a, d); return `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" font-size="11" font-weight="700" fill="#E7EFEA" fill-opacity=".35" font-family="system-ui">${t}</text>`; }).join("")}`;
  }

  /* garde-fou : seul un HR peut être au-delà de la clôture ; un hit tombe en territoire bon */
  function fix(loc, res) {
    let dx = loc[0] * W - HX, dy = HY - loc[1] * H;
    let a = Math.atan2(dx, dy) / rad, d = Math.hypot(dx, dy);
    if (res === "HR") { if (d < R + 6) d = R + 10; }
    else if (d > R - 6) d = R - 8;
    if (cat(res) === "hit" && Math.abs(a) > 44) a = Math.sign(a) * 44;
    if (res === "HR" && Math.abs(a) > 44) a = Math.sign(a) * 44;
    const [x, y] = pt(a, d);
    const c = (v) => Math.round(Math.min(1, Math.max(0, v)) * 1000) / 1000;
    return [c(x / W), c(y / H)];
  }

  function dot(p, r) {
    const L = fix(p.loc, p.res);
    const x = L[0] * W, y = L[1] * H, c = COL[cat(p.res)];
    const rr = r || 6;
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${rr}" fill="${c}" stroke="#0E1511" stroke-width="1.5"><title>${p.title || ""}</title></circle>`;
  }

  /* points : [{loc:[x,y], res, bt, title}] */
  function svg(points, opts) {
    const o = opts || {};
    return `<svg viewBox="0 ${VY} ${W} ${H - VY}" ${o.attrs || ""} style="width:100%;max-width:${o.max || 420}px;display:block;margin:0 auto;touch-action:manipulation" role="img" aria-label="Carte des frappes">${field(o)}${(points || []).filter((p) => p.loc).map((p) => dot(p, o.r)).join("")}${o.extra || ""}</svg>`;
  }

  function legend() {
    const d = (c, t, ring) => `<span style="display:inline-flex;align-items:center;gap:5px"><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="${ring ? 5 : 6}" fill="${ring ? "none" : c}" stroke="${c}" stroke-width="${ring ? 2.5 : 0}"/></svg>${t}</span>`;
    return `<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;font-size:12.5px;color:#9AADA2;margin-top:6px">${d(COL.hit, "Hit")}${d(COL.out, "Pas de hit (out, erreur, FC)")}</div>`;
  }

  /* Zone d'un point. Le poste est calculé automatiquement (invisible à la saisie) :
     chaque défenseur a une position de base réaliste (en pieds depuis le marbre, angle
     -45° = ligne de 3e, +45° = ligne de 1re) et un rayon d'action ; la balle est attribuée
     au défenseur qui l'atteint le plus facilement (distance / portée). Les voltigeurs couvrent
     plus de terrain que les joueurs d'avant-champ ; le receveur prend les balles mortes devant
     le marbre et les fausses balles juste derrière. Échelle : 64 unités = 90 pieds (une base). */
  const FT = 90 / 64;
  const FIELDERS = [
    ["P", 0, 60, 0.55], ["C", 0, 0, 0.5],
    ["1B", 36, 108, 1], ["2B", 14, 145, 1.05], ["SS", -14, 145, 1.05], ["3B", -36, 108, 1],
    ["LF", -28, 245, 1.6], ["CF", 0, 265, 1.75], ["RF", 28, 245, 1.6],
  ].map(([pos, deg, ft, reach]) => ({ pos, reach, xy: pt(deg, ft / FT) }));
  function zone(loc) {
    const x = loc[0] * W, y = loc[1] * H, dx = x - HX, dy = HY - y;
    const a = Math.atan2(dx, dy) / rad, d = Math.hypot(dx, dy), ft = d * FT;
    const side = a < -15 ? "G" : a > 15 ? "D" : "C";
    const foul = Math.abs(a) > 45;
    let pos;
    if (ft < 30 && (foul || ft < 18)) pos = "C";
    else {
      let best = Infinity;
      for (const f of FIELDERS) {
        if (f.pos === "C") continue;
        const s = Math.hypot(x - f.xy[0], y - f.xy[1]) / f.reach;
        if (s < best) { best = s; pos = f.pos; }
      }
    }
    return { a, d, ft, side, deep: ft >= 160, foul, pos };
  }

  /* résumé lisible : où il frappe, quel type, quels postes */
  function summary(points) {
    const ps = (points || []).filter((p) => p.loc);
    const n = ps.length;
    if (!n) return "";
    const pc = (k) => Math.round((k / n) * 100);
    const z = ps.map((p) => zone(p.loc));
    const g = z.filter((x) => x.side === "G").length, c = z.filter((x) => x.side === "C").length, dr = z.filter((x) => x.side === "D").length;
    const deep = z.filter((x) => x.deep).length;
    const bt = { G: 0, L: 0, F: 0, B: 0 };
    ps.forEach((p) => { if (bt[p.bt] !== undefined) bt[p.bt]++; });
    const btN = bt.G + bt.L + bt.F + bt.B;
    const posC = {};
    z.forEach((x) => { posC[x.pos] = (posC[x.pos] || 0) + 1; });
    const top = Object.entries(posC).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => `${k} (${v})`).join(", ");
    const hits = ps.filter((p) => cat(p.res) === "hit");
    const hz = {};
    hits.forEach((p) => { const k = zone(p.loc).pos; hz[k] = (hz[k] || 0) + 1; });
    const htop = Object.entries(hz).sort((a, b) => b[1] - a[1])[0];
    const bar = `<div style="display:flex;height:10px;border-radius:5px;overflow:hidden;margin:6px 0 2px"><span style="flex:${g || 0.0001};background:#5B8DEF"></span><span style="flex:${c || 0.0001};background:#9AADA2"></span><span style="flex:${dr || 0.0001};background:#C77DFF"></span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#9AADA2"><span>Gauche ${pc(g)} %</span><span>Centre ${pc(c)} %</span><span>Droite ${pc(dr)} %</span></div>`;
    const lines = [
      `${n} balle${n > 1 ? "s" : ""} en jeu · ${pc(deep)} % au champ extérieur`,
      `Le plus souvent vers : ${top}`,
      htop ? `Hits surtout vers : ${htop[0]} (${htop[1]})` : "",
    ].filter(Boolean);
    return `${bar}<div style="font-size:13.5px;margin-top:6px;line-height:1.5">${lines.join("<br>")}</div>`;
  }

  /* point cliqué sur le SVG → coordonnées 0..1 */
  function locFromEvent(svgEl, ev) {
    const r = svgEl.getBoundingClientRect();
    const VH = H - VY, s = Math.min(r.width / W, r.height / VH), ox = r.left + (r.width - W * s) / 2, oy = r.top + (r.height - VH * s) / 2;
    const x = (ev.clientX - ox) / s / W, y = ((ev.clientY - oy) / s + VY) / H;
    const c = (v) => Math.round(Math.min(1, Math.max(0, v)) * 1000) / 1000;
    return [c(x), c(y)];
  }

  window.DragonsSpray = { fix, svg, legend, summary, zone, cat, locFromEvent, TYPES, COL, W, H };
})();
