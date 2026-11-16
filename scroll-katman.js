/* scroll-katman.js — mevcut tasarımın üstüne gömülü, oranı ayarlanır kaydırma derinliği.
 *
 * Oran (0 = kapalı, 1 = tam):
 *   <html data-scroll-oran="0.5">       kalıcı ayar
 *   ?oran=0.8                            deneme için adres çubuğundan
 *   scrollKatman.oran = 0.3              konsoldan canlı
 *
 * İşaretler (hepsi isteğe bağlı):
 *   data-sk="cik"        kahraman alanı: kaydırınca sayfadan hızlı yukarı kayar ve söner
 *   data-sk="arka"       arka katman: daha yavaş kayar (derinlik)
 *   data-sk="derin"      kart içi öğe: ekran ortasına göre hafif kayar ve döner
 *   data-sk="kay"        başlık: ekrana girerken yandan yerine oturur
 *   data-sk="kat"        katmanlı öğe: data-sk-d (1,2,3…) derinliğiyle,
 *                        ekrana girerken ayrık gelir, tamamen görününce üst üste oturur;
 *                        data-sk-dinlen="0" durunca kalan yankıyı, data-sk-x="0" yana kaymayı kapatır
 *   data-sk-ilerleme     üstte ince ilerleme çizgisi
 *
 * Yalnız `translate`, `rotate`, `opacity` yazar; mevcut `transform`
 * animasyonlarıyla çakışmaz. prefers-reduced-motion'da kendini kapatır.
 */
(function () {
  var root = document.documentElement;
  var q = new URLSearchParams(location.search).get('oran');
  var oran = parseFloat(q != null ? q : root.getAttribute('data-scroll-oran'));
  if (isNaN(oran)) oran = 0.5;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');

  var els = {};
  ['cik', 'arka', 'derin', 'kay', 'kat'].forEach(function (k) {
    els[k] = [].slice.call(document.querySelectorAll('[data-sk="' + k + '"]'));
  });
  var bar = document.querySelector('[data-sk-ilerleme]');
  var raf = 0;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function frame() {
    raf = 0;
    var o = reduce.matches ? 0 : clamp(oran, 0, 1);
    var vh = innerHeight, y = scrollY;

    els.cik.forEach(function (el) {
      var h = el.offsetHeight || vh, p = clamp(y / h, 0, 1);
      el.style.translate = o ? '0 ' + (-p * 90 * o).toFixed(1) + 'px' : '';
      el.style.opacity = o ? (1 - p * 0.7 * o).toFixed(3) : '';
    });
    els.arka.forEach(function (el) {
      el.style.translate = o ? '0 ' + (y * 0.35 * o).toFixed(1) + 'px' : '';
    });
    els.derin.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = clamp(((r.top + r.height / 2) - vh / 2) / vh, -1, 1); // -1 üst, 1 alt
      el.style.translate = o ? '0 ' + (d * 46 * o).toFixed(1) + 'px' : '';
      el.style.rotate = o ? (d * 4 * o).toFixed(2) + 'deg' : '';
    });
    els.kay.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = clamp((vh - r.top) / (vh * 0.6), 0, 1);       // 0 girerken, 1 yerinde
      el.style.translate = o ? ((1 - p) * 48 * o).toFixed(1) + 'px 0' : '';
    });
    els.kat.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > vh + 100 || r.bottom < -100) return;
      var p = clamp((vh - r.top) / Math.max(r.height, 1), 0, 1); // 0 girerken, 1 tamamen görünür
      var d = parseFloat(el.getAttribute('data-sk-d')) || 1, k = (1 - p) * o;
      var rest = el.hasAttribute('data-sk-dinlen') ? parseFloat(el.getAttribute('data-sk-dinlen')) || 0 : 1; // durunca kalan yankı
      var sx = el.hasAttribute('data-sk-x') ? parseFloat(el.getAttribute('data-sk-x')) || 0 : 1;
      var x = ((k * d * 14) + (d - 1) * 20 * o * rest) * sx, yy = (k * d * 46) - (d - 1) * 24 * o * rest;
      el.style.translate = o ? x.toFixed(1) + 'px ' + yy.toFixed(1) + 'px' : '';
    });
    if (bar) {
      var max = root.scrollHeight - vh;
      bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0).toFixed(4) + ')';
      bar.style.opacity = o ? 1 : 0;
    }
  }
  function tick() { if (!raf) raf = requestAnimationFrame(frame); }

  if (bar) Object.assign(bar.style, {
    position: 'fixed', left: 0, right: 0, top: 0, height: '2px', zIndex: 9999,
    background: 'var(--brand, currentColor)', transformOrigin: '0 50%', pointerEvents: 'none'
  });
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  reduce.addEventListener && reduce.addEventListener('change', tick);
  frame();

  window.scrollKatman = {
    get oran() { return oran; },
    set oran(v) { oran = +v; root.setAttribute('data-scroll-oran', oran); tick(); }
  };
})();
