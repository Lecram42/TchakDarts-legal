// Evening recap story card (9:16), drawn on Canvas. Shared by the app
// (share.js) and the TV page (tv/index.html loads a copy of this file).
'use strict';

function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function fitText(ctx, text, max, size, weight = 700, fam = 'Space Grotesk') {
  let s = size; do { ctx.font = `${weight} ${s}px '${fam}', system-ui, sans-serif`; s -= 2; } while (ctx.measureText(text).width > max && s > 14);
}

// Draws the story card. p = animation progress 0..1 (1 = everything shown).
// Shared with the TV page (same layout, see tv/index.html drawRecap).
function drawRecap(ctx, W, H, d, p = 1, accent = '#C6F432') {
  const ease = (a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
  const f = (x) => 1 - Math.pow(1 - x, 3);
  ctx.fillStyle = '#0D0E12'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.27, 30, W / 2, H * 0.27, W * 0.9); g.addColorStop(0, (d.mvp ? d.mvp.c : accent) + '30'); g.addColorStop(1, '#0D0E1200');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent; ctx.font = "700 76px 'Space Grotesk', sans-serif"; ctx.fillText('tchak', W / 2, 150);
  ctx.fillStyle = '#9BA1AD'; ctx.font = "700 30px 'Inter', sans-serif"; ctx.fillText((d.tx.title + ' · ' + d.date).toUpperCase(), W / 2, 205);
  // MVP
  let a = f(ease(0.02, 0.2));
  ctx.globalAlpha = a;
  if (d.mvp) {
    ctx.fillStyle = '#9BA1AD'; ctx.font = "700 32px 'Inter', sans-serif"; ctx.fillText(d.tx.mvp, W / 2, 330);
    ctx.fillStyle = d.mvp.c; fitText(ctx, d.mvp.n, W - 140, 150); ctx.fillText(d.mvp.n, W / 2, 330 + 150 * (0.6 + 0.4 * a));
  }
  // podium
  const pod = d.podium; const order = pod.length === 3 ? [1, 0, 2] : pod.length === 2 ? [1, 0] : [0];
  const colW = 280, baseY = 900, hs = [270, 190, 140];
  order.forEach((k, j) => {
    const r = pod[k]; if (!r) return;
    const x = W / 2 + (j - (order.length - 1) / 2) * (colW + 24);
    const e = f(ease(0.15 + j * 0.06, 0.4 + j * 0.06));
    const h = hs[k] * e;
    ctx.globalAlpha = Math.min(1, e * 1.4);
    rr(ctx, x - colW / 2, baseY - h, colW, h, 22); ctx.fillStyle = k === 0 ? r.c + '40' : '#1D2128'; ctx.fill();
    ctx.fillStyle = k === 0 ? r.c : '#5C6270'; ctx.font = "700 72px 'Space Grotesk', sans-serif"; ctx.fillText(String(k + 1), x, baseY - h + 86);
    ctx.fillStyle = r.c; fitText(ctx, r.n, colW - 10, 40, 700, 'Inter'); ctx.fillText(r.n, x, baseY - h - 46);
    ctx.fillStyle = '#9BA1AD'; ctx.font = "600 28px 'Inter', sans-serif"; ctx.fillText(r.w + ' ' + d.tx.wins, x, baseY - h - 12);
  });
  // highlight cards
  let y = 960;
  const card = (t0, title, big, sub, color) => {
    const e = f(ease(t0, t0 + 0.18));
    ctx.globalAlpha = e;
    const yy = y + (1 - e) * 40;
    rr(ctx, 80, yy, W - 160, 170, 28); ctx.fillStyle = '#17191F'; ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#9BA1AD'; ctx.font = "700 26px 'Inter', sans-serif"; ctx.fillText(title.toUpperCase(), 120, yy + 52);
    ctx.fillStyle = color || '#F2F3F5'; fitText(ctx, big, W - 260, 56); ctx.fillText(big, 120, yy + 118);
    ctx.fillStyle = '#9BA1AD'; ctx.font = "600 28px 'Inter', sans-serif"; ctx.fillText(sub, 120, yy + 154);
    ctx.textAlign = 'center';
    y += 196;
  };
  if (d.best) card(0.42, d.tx.best, d.best.darts.join('  '), d.best.n + ' · ' + (d.best.cr ? d.best.marks + ' ' + d.tx.marks : d.best.pts + ' pts'), d.best.c);
  if (d.blank) card(0.52, d.tx.blank, d.blank.n, d.blank.k + ' ' + d.tx.blanks, d.blank.c);
  // players: wins + favourite target
  const e = f(ease(0.62, 0.82));
  ctx.globalAlpha = e;
  const pl = d.players.slice(0, 6);
  pl.forEach((r, k) => {
    const yy = y + 50 + k * 58;
    ctx.textAlign = 'left'; ctx.fillStyle = r.c; ctx.beginPath(); ctx.arc(104, yy - 10, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F2F3F5'; fitText(ctx, r.n, 380, 34, 600, 'Inter'); ctx.fillText(r.n, 130, yy);
    ctx.textAlign = 'right'; ctx.fillStyle = '#9BA1AD'; ctx.font = "600 30px 'Inter', sans-serif";
    ctx.fillText((r.fav ? d.tx.fav + ' ' + (r.fav === 25 ? 'Bull' : r.fav) + '  ·  ' : '') + r.w + ' ' + d.tx.wins, W - 90, yy);
  });
  ctx.textAlign = 'center';
  ctx.globalAlpha = f(ease(0.75, 0.95));
  ctx.fillStyle = '#F2F3F5'; ctx.font = "700 36px 'Space Grotesk', sans-serif";
  ctx.fillText(d.games + ' ' + d.tx.games + '  ·  ' + d.dur, W / 2, H - 190);
  ctx.globalAlpha = 1;
}

