// Etkileşimli nokta küresi — canvas 2D, WebGL yok.
// Yalnız ekrandayken + sekme görünürken çizer; hareket bitince rAF durur.
// prefers-reduced-motion: tek statik kare.
export function mountDotField(host, opts = {}) {
  const o = Object.assign({ gap: 11, mode: "globe", colors: ["#2a1206", "#be5819", "#ff5b4a", "#ffe2cf"] }, opts);
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  host.appendChild(cv);
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const pal = o.colors.map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
  const BUCKETS = 12;
  const fills = Array.from({ length: BUCKETS }, (_, b) => {
    const t = b / (BUCKETS - 1), s = t * (pal.length - 1), i = Math.min(pal.length - 2, s | 0), f = s - i;
    const c = pal[i].map((v, k) => Math.round(v + (pal[i + 1][k] - v) * f));
    return `rgb(${c})`;
  });

  let W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1, dots = [];
  let px = -1e4, py = -1e4, lx = -0.45, ly = -0.55, tlx = lx, tly = ly;
  let waves = [], raf = 0, visible = false, pageVisible = !document.hidden;

  function build() {
    const r = host.getBoundingClientRect();
    W = r.width; H = r.height;
    if (!W || !H) return;
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cx = W / 2; cy = H / 2; R = Math.min(W, H) / 2 - 6;
    const g = Math.max(8, o.gap * Math.min(1, R / 200 + 0.35));
    dots = [];
    const rows = Math.ceil(R / (g * 0.866));
    for (let j = -rows; j <= rows; j++) {
      const y = j * g * 0.866, off = (j & 1) * g / 2;
      for (let x = -R - off; x <= R; x += g) {
        const xx = x + off;
        const d = Math.hypot(xx, y) / R;
        if (o.mode === "globe" ? d > 1 : Math.abs(xx) > R || Math.abs(y) > R) continue;
        const nz = o.mode === "globe" ? Math.sqrt(Math.max(0, 1 - d * d)) : 1;
        dots.push({ ox: cx + xx, oy: cy + y, x: cx + xx, y: cy + y, vx: 0, vy: 0, nx: xx / R, ny: y / R, nz, g });
      }
    }
    draw();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const lz = Math.sqrt(Math.max(0.05, 1 - lx * lx - ly * ly));
    const paths = Array.from({ length: BUCKETS }, () => new Path2D());
    for (const p of dots) {
      // Lambert ışığı + imleç yakınlığı
      let lit = Math.max(0, p.nx * lx + p.ny * ly + p.nz * lz);
      const dx = p.x - px, dy = p.y - py, near = Math.max(0, 1 - Math.hypot(dx, dy) / (R * 0.55));
      const disp = Math.min(1, Math.hypot(p.x - p.ox, p.y - p.oy) / 14);
      lit = Math.min(1, 0.04 + lit * lit * 0.85 * (0.3 + 0.7 * p.nz) + near * near * 0.28 + disp * 0.35);
      const b = Math.min(BUCKETS - 1, (lit * BUCKETS) | 0);
      const rad = p.g * (0.12 + 0.2 * lit) * (0.55 + 0.45 * p.nz) + disp * 0.8;
      paths[b].moveTo(p.x + rad, p.y);
      paths[b].arc(p.x, p.y, rad, 0, 6.2832);
    }
    for (let b = 0; b < BUCKETS; b++) { ctx.fillStyle = fills[b]; ctx.fill(paths[b]); }
  }

  function step() {
    raf = 0;
    lx += (tlx - lx) * 0.12; ly += (tly - ly) * 0.12;
    let energy = Math.abs(tlx - lx) + Math.abs(tly - ly);
    const inf = R * 0.42, inf2 = inf * inf;
    for (const w of waves) w.r += R * 0.035;
    waves = waves.filter(w => w.r < R * 2.3);
    for (const p of dots) {
      let fx = (p.ox - p.x) * 0.07, fy = (p.oy - p.y) * 0.07;
      const dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
      if (d2 < inf2 && d2 > 0.01) {
        const d = Math.sqrt(d2), k = (1 - d / inf) ** 2 * 2.6;
        fx += dx / d * k; fy += dy / d * k;
      }
      for (const w of waves) {
        const ex = p.ox - w.x, ey = p.oy - w.y, d = Math.hypot(ex, ey) || 1, band = 1 - Math.abs(d - w.r) / 18;
        if (band > 0) { const k = band * 3.2 * (1 - w.r / (R * 2.3)); fx += ex / d * k; fy += ey / d * k; }
      }
      p.vx = (p.vx + fx) * 0.8; p.vy = (p.vy + fy) * 0.8;
      p.x += p.vx; p.y += p.vy;
      energy += Math.abs(p.vx) + Math.abs(p.vy);
    }
    draw();
    if (waves.length || energy > 0.02 * Math.max(1, dots.length / 100)) kick();
  }

  function kick() { if (!raf && visible && pageVisible && !reduce.matches) raf = requestAnimationFrame(step); }

  function local(e) {
    const r = cv.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top, r];
  }
  function onMove(e) {
    if (!visible) return;
    const [x, y, r] = local(e);
    px = x; py = y;
    // ışık imlece doğru döner (sayfanın neresinde olursa olsun)
    const ax = (x - cx) / Math.max(R, innerWidth * 0.4), ay = (y - cy) / Math.max(R, innerHeight * 0.5);
    const m = Math.hypot(ax, ay), s = m > 0.9 ? 0.9 / m : 1;
    tlx = ax * s; tly = ay * s;
    kick();
  }
  function onDown(e) {
    if (!visible) return;
    const [x, y] = local(e);
    if (Math.hypot(x - cx, y - cy) > R * 1.15) return;
    waves.push({ x, y, r: 0 });
    if (waves.length > 4) waves.shift();
    onMove(e);
  }
  function onLeave() { px = py = -1e4; kick(); }

  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(host);
  const ro = new ResizeObserver(build);
  ro.observe(host);
  const onVis = () => { pageVisible = !document.hidden; kick(); };
  document.addEventListener("visibilitychange", onVis);
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerdown", onDown, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  const onTouchEnd = () => setTimeout(onLeave, 250);
  addEventListener("touchend", onTouchEnd, { passive: true });
  const onReduce = () => { if (reduce.matches) { for (const p of dots) { p.x = p.ox; p.y = p.oy; } waves = []; draw(); } };
  reduce.addEventListener("change", onReduce);

  return () => {
    cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    removeEventListener("pointermove", onMove); removeEventListener("pointerdown", onDown);
    removeEventListener("touchend", onTouchEnd);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    reduce.removeEventListener("change", onReduce);
    cv.remove();
  };
}
