// akts-3d — three.js tabanlı hero modülü: kristal küp (içinde altın N/A parası) + dağ kayası.
// mountCube(canvas, opts) / mountMoon(canvas, opts) → { destroy() }
// Tüm yuvalar TEK paylaşılan WebGLRenderer'ı kullanır (görünmez canvas → her yuvanın 2D canvas'ına drawImage).
// WebGL yoksa canvas'a data-akts3d-fallback konur (sayfa CSS ile statik poster gösterir).
import * as T from './vendor/three.module.min.js';

/* ---------- paylaşılan bağlam (referans sayımlı) ---------- */
let S = null; // { renderer, slots:Set, raf, refs, killT, env }
const reducedMQ = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

function shared() {
  if (S) { clearTimeout(S.killT); S.refs++; return S; }
  let renderer;
  try {
    const c = document.createElement('canvas');
    renderer = new T.WebGLRenderer({ canvas: c, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  renderer.setPixelRatio(1);
  renderer.setClearColor(0, 0);
  // three r160 şeffaf canvas'ta transmission RT'yi beyaza (0.5) temizliyor → cam süt gibi görünür. Engelle:
  renderer.getClearAlpha = () => 1;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  S = { renderer, slots: new Set(), raf: 0, refs: 1, killT: 0, env: null, last: 0 };
  const vis = () => kick();
  document.addEventListener('visibilitychange', vis);
  S.off = () => document.removeEventListener('visibilitychange', vis);
  return S;
}
function release() {
  if (!S || --S.refs > 0) return;
  const s = S;
  // StrictMode mount→destroy→mount: bağlamı hemen kapatma
  s.killT = setTimeout(() => {
    if (S !== s || s.refs > 0) return;
    cancelAnimationFrame(s.raf); s.off();
    s.env && s.env.dispose();
    s.renderer.dispose(); s.renderer.forceContextLoss();
    S = null;
  }, 1500);
}
function kick() { if (S && !S.raf) S.raf = requestAnimationFrame(loop); }
function loop(now) {
  S.raf = 0;
  if (document.hidden) { S.last = 0; return; }
  const dt = S.last ? Math.min((now - S.last) / 1000, 0.1) : 1 / 60; S.last = now;
  let again = false;
  for (const sl of S.slots) if (sl.visible && sl.step(dt, now)) { draw(sl, dt); again = again || sl.animating(); } else if (sl.visible) again = again || sl.animating();
  if (again) kick(); else S.last = 0;
}
function draw(sl, dt) {
  const r = S.renderer, c = sl.canvas;
  const dpr = Math.min(window.devicePixelRatio || 1, 2) * sl.scale;
  const w = Math.max(1, Math.round(c.clientWidth * dpr)), h = Math.max(1, Math.round(c.clientHeight * dpr));
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  // tampon yalnız büyür; yuvalar arasında yeniden boyutlandırma (pahalı) yok
  const sz = r.getSize(new T.Vector2());
  if (sz.x < w || sz.y < h) { r.setSize(Math.max(sz.x, w), Math.max(sz.y, h), false); sz.set(Math.max(sz.x, w), Math.max(sz.y, h)); }
  r.setViewport(0, 0, w, h);
  sl.camera.aspect = w / h; sl.camera.updateProjectionMatrix();
  const t0 = performance.now();
  r.setClearColor(0, 0);
  r.render(sl.scene, sl.camera);
  sl.ctx.clearRect(0, 0, w, h);
  sl.ctx.drawImage(r.domElement, 0, sz.y - h, w, h, 0, 0, w, h);
  // uyarlanır çözünürlük (ilk 30 çizim)
  if (sl.n < 30 && sl.adapt) { sl.acc += sl.animating() ? dt * 1000 : performance.now() - t0; if (++sl.n === 30 && sl.acc / 30 > 22 && sl.scale > 0.5) { sl.scale *= 0.75; sl.n = 0; sl.acc = 0; } }
}

/* ---------- yuva iskeleti ---------- */
function slot(canvas, opts, build) {
  const st = shared();
  if (!st) { canvas.setAttribute('data-akts3d-fallback', ''); return { destroy() {} }; }
  const ctx = canvas.getContext('2d');
  const sl = { canvas, ctx, visible: true, adapt: opts.adaptive !== false, scale: opts.scale || 1, n: 0, acc: 0, dirty: true,
    reduced: opts.reducedMotion ?? !!(reducedMQ && reducedMQ.matches) };
  const offs = [];
  sl.on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
  build(sl, st);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { sl.visible = es[es.length - 1].isIntersecting; if (sl.visible) { sl.dirty = true; kick(); } });
    io.observe(canvas); offs.push(() => io.disconnect());
  }
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(() => { sl.dirty = true; kick(); }); ro.observe(canvas); offs.push(() => ro.disconnect()); }
  if (reducedMQ && opts.reducedMotion == null) sl.on(reducedMQ, 'change', (e) => { sl.reduced = e.matches; sl.dirty = true; kick(); });
  st.slots.add(sl); kick();
  let gone = false;
  return {
    destroy() {
      if (gone) return; gone = true;
      offs.forEach((f) => f()); st.slots.delete(sl);
      sl.scene.traverse((o) => { o.geometry && o.geometry.dispose(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => { for (const k in x) x[k] && x[k].isTexture && x[k].dispose(); x.dispose(); }); });
      sl.dispose && sl.dispose();
      release();
    },
  };
}

/* ---------- gürültü (JS, geometri için) ---------- */
function hash3(x, y, z, s) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(s, 1597334677);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, y, z, s) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let fx = x - xi, fy = y - yi, fz = z - zi;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
  const l = (a, b, t) => a + (b - a) * t, h = (i, j, k) => hash3(xi + i, yi + j, zi + k, s);
  return l(l(l(h(0, 0, 0), h(1, 0, 0), fx), l(h(0, 1, 0), h(1, 1, 0), fx), fy),
    l(l(h(0, 0, 1), h(1, 0, 1), fx), l(h(0, 1, 1), h(1, 1, 1), fx), fy), fz) * 2 - 1;
}
function fbm(x, y, z, s, o) { let a = 0.5, t = 0; for (let i = 0; i < o; i++) { t += a * vnoise(x, y, z, s + i); x *= 2.03; y *= 2.03; z *= 2.03; a *= 0.5; } return t; }
function ridged(x, y, z, s, o) { let a = 0.5, t = 0, w = 1; for (let i = 0; i < o; i++) { let n = 1 - Math.abs(vnoise(x, y, z, s + 7 * i)); n *= n * w; w = Math.min(1, n * 2); t += n * a; x *= 2.1; y *= 2.1; z *= 2.1; a *= 0.5; } return t; }
function rng(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

/* ---------- prosedürel stüdyo ortamı (siyah oda + beyaz paneller) ---------- */
function studioEnv(renderer) {
  const sc = new T.Scene();
  sc.add(new T.Mesh(new T.BoxGeometry(20, 20, 20), new T.MeshBasicMaterial({ color: 0x000000, side: T.BackSide })));
  const panel = (w, h, x, y, z, k) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color().setScalar(k), side: T.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); sc.add(m);
  };
  panel(0.7, 14, -6, 1, 6, 14); panel(0.35, 14, -4.6, 1, 7, 10); panel(0.6, 12, 6.5, 0, 6, 12); panel(16, 0.5, 0, 8, 3, 10);
  panel(3, 0.4, 1.5, 3.5, 9, 8); panel(0.5, 9, 3, 1, -8, 6); panel(12, 0.4, 0, -6, 6, 3); panel(0.6, 10, -8, 0, -3, 8);
  const pm = new T.PMREMGenerator(renderer);
  const rt = pm.fromScene(sc, 0.02);
  pm.dispose(); sc.traverse((o) => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); });
  return rt;
}

/* ---------- obsidyen yüz dokuları: kor kenar çizgisi + akkor glif ---------- */
function faceTextures(glyph) {
  const N = 512, mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, N, N); return [c, g]; };
  const border = (g) => {
    g.save(); g.filter = 'blur(6px)'; g.strokeStyle = '#ff5b4a'; g.lineWidth = 14; g.strokeRect(4, 4, N - 8, N - 8); g.restore();
    g.strokeStyle = '#ffb347'; g.lineWidth = 3; g.strokeRect(5, 5, N - 10, N - 10);
  };
  const P = (x, y) => [N / 2 + x * N, N / 2 - y * N];
  const pts = glyph === 'A' ? [[[-0.17, -0.2], [0, 0.2], [0.17, -0.2]], [[-0.09, -0.06], [0.09, -0.06]]]
    : [[[-0.14, -0.19], [-0.14, 0.19], [0.14, -0.19], [0.14, 0.19]]];
  const path = (g) => { g.beginPath(); for (const l of pts) l.forEach((p, i) => g[i ? 'lineTo' : 'moveTo'](...P(p[0], p[1]))); };
  const [ce, ge] = mk(); border(ge);
  const [cg, gg] = mk(); border(gg);
  gg.lineCap = 'square'; gg.lineJoin = 'miter';
  gg.save(); gg.filter = 'blur(22px)'; gg.strokeStyle = '#c8281c'; gg.lineWidth = 70; path(gg); gg.stroke(); gg.restore();
  gg.save(); gg.filter = 'blur(5px)'; gg.strokeStyle = '#ff5b4a'; gg.lineWidth = 34; path(gg); gg.stroke(); gg.restore();
  gg.strokeStyle = '#ffb347'; gg.lineWidth = 12; path(gg); gg.stroke();
  const [cb, gb] = mk(); gb.filter = 'blur(2px)'; gb.strokeStyle = '#fff'; gb.lineCap = 'square'; gb.lineWidth = 36; path(gb); gb.stroke();
  const t = (c, srgb) => { const x = new T.CanvasTexture(c); if (srgb) x.colorSpace = T.SRGBColorSpace; x.anisotropy = 4; return x; };
  return { edge: t(ce, 1), glyph: t(cg, 1), bump: t(cb, 0) };
}


/* ---------- küp ---------- */
export function mountCube(canvas, opts = {}) {
  canvas.style.touchAction = 'pan-y';
  canvas.style.cursor = 'grab';
  const idle = opts.idleSpeed ?? 0.35;
  const s = { yaw: opts.yaw ?? 0.6, pitch: 0.38, vy: idle, vp: 0, drag: false, px: 0, py: 0, pt: 0, spin: 0.5 };
  return slot(canvas, opts, (sl, st) => {
    if (!st.env) st.env = studioEnv(st.renderer);
    const scene = (sl.scene = new T.Scene());
    scene.environment = st.env.texture;
    sl.camera = new T.PerspectiveCamera(30, 1, 0.1, 50); sl.camera.position.set(0, 0, 5.2);
    const root = new T.Group(); scene.add(root);
    const shape = opts.shape === 'crystal' ? 'crystal' : 'cube';
    const ft = faceTextures(opts.glyph === 'A' ? 'A' : 'N');
    const base = { color: 0x060607, metalness: 0, roughness: 0.05, clearcoat: 0.5, clearcoatRoughness: 0.02, envMapIntensity: 0.7, specularIntensity: 0.6, emissive: 0xffffff };
    const side = new T.MeshPhysicalMaterial({ ...base, emissiveMap: ft.edge, bumpMap: null });
    const front = new T.MeshPhysicalMaterial({ ...base, emissiveMap: ft.glyph, bumpMap: ft.bump, bumpScale: -4 });
    const mats = [side, front];
    let body;
    if (shape === 'crystal') {
      const g = new T.OctahedronGeometry(0.95, 0); g.scale(1, 1.25, 1);
      body = new T.Mesh(g, new T.MeshPhysicalMaterial({ ...base, emissive: 0xff5b4a, emissiveIntensity: 0 })); mats.length = 0; mats.push(body.material);
    } else body = new T.Mesh(chamferBox(1.3, 0.035), [side, side, side, side, front, front]);
    root.add(body);
    sl.animating = () => !sl.reduced || s.drag || Math.abs(s.vy) > 0.01 || Math.abs(s.vp) > 0.01;
    sl.step = (dt) => {
      const target = sl.reduced ? 0 : idle, k = 1 - Math.exp(-dt * 2.2);
      if (!s.drag) { s.vy += (target - s.vy) * k; s.vp += ((0.38 - s.pitch) * 3 - s.vp) * k; s.yaw += s.vy * dt; s.pitch += s.vp * dt; }
      if (!sl.reduced) s.spin += dt * 0.5;
      root.rotation.set(s.pitch, s.yaw, 0.06, 'XYZ');
      const pulse = sl.reduced ? 1.2 : 1.15 + 0.3 * Math.sin(s.spin * 3.2);
      for (const m of mats) m.emissiveIntensity = shape === 'crystal' ? 0 : pulse;
      const moved = sl.animating() || sl.dirty; // nabız da animasyon sl.dirty = false;
      return moved;
    };
    sl.on(canvas, 'pointerdown', (e) => { s.drag = true; s.px = e.clientX; s.py = e.clientY; s.pt = performance.now(); canvas.style.cursor = 'grabbing'; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} kick(); });
    sl.on(canvas, 'pointermove', (e) => {
      if (!s.drag) return;
      const now = performance.now(), dt = Math.max((now - s.pt) / 1000, 1 / 240);
      const dx = (e.clientX - s.px) * 0.009, dy = e.pointerType === 'touch' ? 0 : (e.clientY - s.py) * 0.009;
      s.yaw += dx; s.pitch = Math.max(-1.3, Math.min(1.3, s.pitch + dy));
      s.vy = s.vy * 0.4 + (dx / dt) * 0.6; s.vp = s.vp * 0.4 + (dy / dt) * 0.6;
      s.px = e.clientX; s.py = e.clientY; s.pt = now; kick();
    });
    const up = () => { if (!s.drag) return; s.drag = false; canvas.style.cursor = 'grab'; s.vy = Math.max(-12, Math.min(12, s.vy)); s.vp = Math.max(-8, Math.min(8, s.vp)); kick(); };
    sl.on(canvas, 'pointerup', up); sl.on(canvas, 'pointercancel', up); sl.on(canvas, 'lostpointercapture', up);
  });
}

// İnce pahlı kutu: her köşe noktası küçük bir küreye yuvarlanan alt bölümlenmiş kutu.
function chamferBox(size, r) {
  const g = new T.BoxGeometry(size, size, size, 24, 24, 24), p = g.attributes.position, h = size / 2 - r, v = new T.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const c = new T.Vector3(Math.max(-h, Math.min(h, v.x)), Math.max(-h, Math.min(h, v.y)), Math.max(-h, Math.min(h, v.z)));
    v.sub(c).normalize().multiplyScalar(r).add(c); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/* ---------- dağ kayası ---------- */
function rockGeometry(seed, detail) {
  const g = new T.SphereGeometry(1, detail * 2, detail);
  const p = g.attributes.position, n = p.count, col = new Float32Array(n * 3);
  const R = rng(seed + 1), planes = [];
  for (let i = 0; i < 22; i++) { // kırık düzlemler → keskin, düz yüzlü kütle
    const u = R() * 2 - 1, a = R() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    planes.push([s * Math.cos(a), u, s * Math.sin(a), 0.7 + R() * 0.3]);
  }
  for (let i = 0; i < n; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    let r = 1.5;
    for (const q of planes) { const d = x * q[0] + y * q[1] + z * q[2]; if (d > 0.05) r = Math.min(r, q[3] / d); }
    const wx = fbm(x * 1.4, y * 1.4, z * 1.4, seed, 3) * 0.7, wy = fbm(x * 1.4 + 5, y * 1.4, z * 1.4, seed, 3) * 0.7;
    const rd = ridged(x * 2.2 + wx, y * 2.2 + wy, z * 2.2, seed + 3, 4);
    const tv = rd * 5 + fbm(x * 3, y * 3, z * 3, seed + 5, 2), tf = Math.floor(tv), st = (tf + T.MathUtils.smoothstep(tv - tf, 0.35, 0.65)) / 5; // yumuşak teras (merdiven yok)
    const fine = fbm(x * 6, y * 6, z * 6, seed + 9, 2);
    const disp = 0.22 * (rd * 0.6 + st * 0.4) + fine * 0.02;
    r *= 0.9 + disp;
    p.setXYZ(i, x * r * 1.55, y * r * 1.05, z * r * 0.95);
    const cav = Math.max(0, Math.min(1, 0.25 + rd * 0.9 + fine * 0.6));
    const shade = 0.04 + 0.1 * cav;
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = shade;
  }
  g.setAttribute('color', new T.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

// fragmentte gürültü tabanlı ayrıntı normali (yakın bakışta keskin taş dokusu)
function rockMaterial() {
  const m = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
  m.userData.uTime = { value: 0 };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = m.userData.uTime;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP=position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vOP;uniform float uTime;
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){return n3(p)*.5+n3(p*2.1)*.25+n3(p*4.3)*.125;}`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{vec3 q=vOP*34.;float e=.03;float b=fb(q);vec3 gr=vec3(fb(q+vec3(e,0,0))-b,fb(q+vec3(0,e,0))-b,fb(q+vec3(0,0,e))-b)/e;
 normal=normalize(normal-(viewMatrix*vec4(gr,0.)).xyz*.05);
 diffuseColor.rgb*=.75+.5*b;}`).replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{float n=fb(vOP*2.6+3.1)/.875;float ln=1.-abs(n*2.-1.);float mk=smoothstep(.6,.7,n3(vOP*1.3+11.));
 float cr=smoothstep(.97,.997,ln)*mk;float hot=smoothstep(.99,1.,ln)*mk;
 totalEmissiveRadiance+=(vec3(1.,.22,.12)*cr*.9+vec3(1.,.5,.18)*hot*.7)*(1.+.35*sin(uTime*1.3+vOP.x*4.));}`);
  };
  return m;
}

export function mountMoon(canvas, opts = {}) {
  const seed = opts.seed ?? 1;
  const L = opts.light || [1, 0.9, 0.35]; // sağ üstten sert ışık
  const par = opts.parallax ?? 3; // derece
  return slot(canvas, { scale: 0.7, ...opts }, (sl, st) => {
    const scene = (sl.scene = new T.Scene());
    sl.camera = new T.PerspectiveCamera(28, 1, 0.1, 50); sl.camera.position.set(0, 0, 6.2);
    const rock = new T.Mesh(rockGeometry(seed, opts.detail || 220), rockMaterial());
    rock.castShadow = rock.receiveShadow = true;
    const base = new T.Euler(0.3 + seed * 0.7, seed * 1.9, seed * 0.4);
    rock.rotation.copy(base);
    scene.add(rock);
    const sun = new T.DirectionalLight(0xffffff, 3.2);
    sun.position.set(L[0], L[1], L[2]).normalize().multiplyScalar(6);
    sun.castShadow = true; sun.shadow.autoUpdate = false; sun.shadow.needsUpdate = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -2.6, right: 2.6, top: 2.6, bottom: -2.6, near: 1, far: 14 });
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    scene.add(sun);
    scene.add(new T.HemisphereLight(0xffffff, 0x000000, 0.04));
    const tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    const D = (par * Math.PI) / 180;
    const onMove = (e) => { tgt.y = ((e.clientX / innerWidth) * 2 - 1) * D; tgt.x = ((e.clientY / innerHeight) * 2 - 1) * D * 0.6 + scrollTilt(); if (!sl.reduced) kick(); };
    const scrollTilt = () => Math.max(-1, Math.min(1, scrollY / innerHeight)) * D * 0.6;
    const onScroll = () => { tgt.x = scrollTilt(); if (!sl.reduced) kick(); };
    sl.on(window, 'pointermove', onMove, { passive: true }); sl.on(window, 'scroll', onScroll, { passive: true });
    let lastDraw = 0;
    sl.animating = () => !sl.reduced;
    sl.step = (dt, now) => {
      const k = 1 - Math.exp(-dt * 3);
      const moving = !sl.reduced && (Math.abs(tgt.x - cur.x) > 1e-4 || Math.abs(tgt.y - cur.y) > 1e-4);
      if (moving) { cur.x += (tgt.x - cur.x) * k; cur.y += (tgt.y - cur.y) * k; sun.shadow.needsUpdate = true; }
      if (sl.dirty) sun.shadow.needsUpdate = true;
      rock.rotation.set(base.x + cur.x, base.y + cur.y, base.z);
      const pulse = !sl.reduced && now - lastDraw > 100; // kor nabzı ~10 fps yeter
      const need = moving || sl.dirty || pulse; sl.dirty = false;
      if (need) { lastDraw = now; rock.material.userData.uTime.value = now / 1000; }
      return need;
    };
  });
}
