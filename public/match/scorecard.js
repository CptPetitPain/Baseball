/* Image de fin de match (score seulement), partagée par la feuille de match et la page /live.
   Tout est dessiné dans le navigateur : aucun coût côté serveur.
   d = { opp, date, us: {manche: points}, them: {...}, inn, first: 'att'|'def', home } */
(function () {
  const C = { bg: "#0e1511", card: "#17211b", line: "#2a3a31", ink: "#e7efea", muted: "#9aada2", gold: "#3fae74", red: "#b8322a" };
  const FONT = "system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,sans-serif";
  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + (+b || 0), 0);

  function loadLogo() {
    return new Promise((res) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => res(null);
      i.src = "/match/icon-192.png";
    });
  }
  function rr(x, X, Y, w, h, r) {
    x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r);
    x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath();
  }
  function fit(x, t, max) {
    if (x.measureText(t).width <= max) return t;
    while (t.length > 1 && x.measureText(t + "…").width > max) t = t.slice(0, -1);
    return t + "…";
  }
  function fmtDate(iso) {
    try { return new Date(iso + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return iso || ""; }
  }

  async function draw(d) {
    const W = 1080, H = 1080, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    const us = sum(d.us), them = sum(d.them), opp = d.opp || "Adversaire";
    x.fillStyle = C.bg; x.fillRect(0, 0, W, H);

    const logo = await loadLogo();
    if (logo) x.drawImage(logo, W / 2 - 70, 60, 140, 140);
    x.textAlign = "center"; x.fillStyle = C.gold; x.font = `700 46px ${FONT}`;
    x.fillText("DRAGONS DE RONCHIN", W / 2, 260);
    x.fillStyle = C.muted; x.font = `400 30px ${FONT}`;
    x.fillText(fmtDate(d.date) + (d.home ? " · à domicile" : " · à l’extérieur"), W / 2, 305);

    const res = us > them ? "VICTOIRE" : us < them ? "DÉFAITE" : "MATCH NUL";
    x.fillStyle = us > them ? C.gold : C.ink; x.font = `800 64px ${FONT}`;
    x.fillText(res, W / 2, 410);

    rr(x, 70, 450, W - 140, 260, 28); x.fillStyle = C.card; x.fill();
    // pastilles : notre logo à gauche, logo adverse (ou initiales) à droite
    const disc = (cx, cy, r, img, txt) => {
      x.save(); x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fillStyle = "#0e1511"; x.fill(); x.clip();
      if (img) x.drawImage(img, cx - r, cy - r, r * 2, r * 2);
      else { x.fillStyle = C.line; x.fillRect(cx - r, cy - r, r * 2, r * 2); x.fillStyle = C.ink; x.font = `800 ${Math.round(r * 0.8)}px ${FONT}`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, cx, cy + 2); x.textBaseline = "alphabetic"; }
      x.restore(); x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.strokeStyle = C.line; x.lineWidth = 3; x.stroke();
    };
    const L = window.DragonsLogos, oppLogo = L ? await L.load(opp) : null;
    disc(150, 505, 34, logo, "DR");
    disc(W - 150, 505, 34, oppLogo, L ? L.initials(opp) : opp.slice(0, 2).toUpperCase());
    x.font = `600 34px ${FONT}`; x.fillStyle = C.muted;
    x.textAlign = "left"; x.fillText("Dragons", 200, 517);
    x.textAlign = "right"; x.fillText(fit(x, opp, 300), W - 200, 517);
    x.fillStyle = C.ink; x.font = `800 170px ${FONT}`;
    x.textAlign = "left"; x.fillText(String(us), 120, 670);
    x.textAlign = "right"; x.fillText(String(them), W - 120, 670);
    x.textAlign = "center"; x.fillStyle = C.gold; x.font = `700 90px ${FONT}`; x.fillText("–", W / 2, 640);

    // score par manche
    const inns = Math.max(7, d.inn || 1), top = 760, left = 70, wName = 230, cw = (W - 140 - wName - 90) / inns;
    rr(x, 70, top, W - 140, 220, 24); x.fillStyle = C.card; x.fill();
    x.font = `600 28px ${FONT}`; x.fillStyle = C.muted; x.textAlign = "center";
    for (let i = 0; i < inns; i++) x.fillText(String(i + 1), left + wName + cw * i + cw / 2, top + 55);
    x.fillText("R", W - 70 - 45, top + 55);
    const ourFirst = d.first === "att";
    const rows = ourFirst ? [["Dragons", d.us], [opp, d.them]] : [[opp, d.them], ["Dragons", d.us]];
    rows.forEach(([name, o], r) => {
      const y = top + 120 + r * 70;
      x.textAlign = "left"; x.fillStyle = C.ink; x.font = `600 32px ${FONT}`;
      x.fillText(fit(x, name, wName - 30), left + 30, y);
      x.textAlign = "center"; x.font = `500 32px ${FONT}`;
      for (let i = 0; i < inns; i++) {
        const v = (o || {})[i + 1];
        const played = i + 1 < (d.inn || 1) || ((o || {})[i + 1] != null);
        x.fillText(v != null ? String(v) : played ? "0" : "", left + wName + cw * i + cw / 2, y);
      }
      x.fillStyle = C.gold; x.font = `800 34px ${FONT}`; x.fillText(String(sum(o)), W - 70 - 45, y);
    });
    x.fillStyle = C.red; x.fillRect(0, H - 14, W, 14);
    return c;
  }

  /* Affiche l'image dans un calque avec Enregistrer / Partager. */
  async function show(d, mount) {
    const c = await draw(d);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const name = `dragons-${(d.opp || "match").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}-${d.date || ""}.png`;
    const url = URL.createObjectURL(blob);
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:16px";
    el.innerHTML = `<div style="background:#17211b;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;align-items:center;max-width:100%;max-height:100%">
      <img src="${url}" alt="Score final" style="max-width:min(420px,100%);max-height:62vh;border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
        <button data-sc="share" style="font:600 15px ${FONT};background:#3fae74;color:#06130c;border:0;border-radius:10px;padding:12px 16px">Enregistrer / partager</button>
        <button data-sc="close" style="font:600 15px ${FONT};background:transparent;color:#e7efea;border:1px solid #2a3a31;border-radius:10px;padding:12px 16px">Fermer</button>
      </div>
      <div style="font:13px ${FONT};color:#9aada2;text-align:center">Sur téléphone, un appui long sur l’image marche aussi.</div></div>`;
    (mount || document.body).appendChild(el);
    el.addEventListener("click", async (e) => {
      const a = e.target.closest("[data-sc]");
      if (e.target === el || (a && a.dataset.sc === "close")) { el.remove(); URL.revokeObjectURL(url); return; }
      if (a && a.dataset.sc === "share") {
        const file = new File([blob], name, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], title: "Dragons de Ronchin" }); return; } catch (err) { if (err && err.name === "AbortError") return; }
        }
        const link = document.createElement("a");
        link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
      }
    });
  }

  window.DragonsScorecard = { draw, show };
})();
