#!/usr/bin/env node
// Discord kartının görsellerini siteye indirir: Discord engelli ağlarda
// (ör. Türkiye) cdn.discordapp.com açılmadığı için sayfa Discord'a hiç gitmez.
//
//   node tools/dc-gorsel.mjs                 # https://akts.tr/api/discord'dan
//   node tools/dc-gorsel.mjs veri.json       # dosyadan (ör. assets/discord-ornek.json)
//
// Çıktı: assets/dc/<anahtar>.<uzantı> ve assets/dc/liste.json ({ anahtar: dosya }).
// Anahtar, Discord yolunun uzantısız hâli: "avatars/<id>/<hash>".
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

// curl: sistem sertifika deposunu ve vekil ayarlarını kullanır.
const indir = (u) => execFileSync('curl', ['-fsSL', '-m', '20', u], { maxBuffer: 32 << 20 });

const KOK = new URL('..', import.meta.url).pathname;
const HEDEF = join(KOK, 'assets/dc');
const kaynak = process.argv[2];

const veri = kaynak
  ? JSON.parse(await readFile(kaynak, 'utf8'))
  : JSON.parse(indir('https://akts.tr/api/discord').toString('utf8'));

export const dcAnahtar = (u) => {
  try {
    const x = new URL(u);
    if (!/^(cdn\.discordapp\.com|media\.discordapp\.net)$/.test(x.hostname)) return null;
    return x.pathname.replace(/^\//, '').replace(/\.(gif|png|jpe?g|webp)$/i, '');
  } catch { return null; }
};

const urller = new Set();
(function topla(v) {
  if (typeof v === 'string') { if (dcAnahtar(v)) urller.add(v); }
  else if (v && typeof v === 'object') Object.values(v).forEach(topla);
})(veri);

await mkdir(HEDEF, { recursive: true });
const listeYolu = join(HEDEF, 'liste.json');
const liste = existsSync(listeYolu) ? JSON.parse(await readFile(listeYolu, 'utf8')) : {};

for (const u of urller) {
  const anahtar = dcAnahtar(u);
  const animasyonlu = /\/a_[0-9a-f]+/.test(u) || /\.gif/i.test(u);
  // Animasyonlu banner GIF'i büyük: kartta 600px webp yeter, animasyon kalır.
  const x = new URL(u);
  x.pathname = x.pathname.replace(/\.(gif|png|jpe?g)$/i, '.webp');
  x.searchParams.set('size', anahtar.startsWith('banners/') ? '600' : anahtar.startsWith('emojis/') ? '64' : '256');
  if (animasyonlu) x.searchParams.set('animated', 'true');
  const dosya = anahtar.replace(/[^A-Za-z0-9_-]+/g, '-') + '.webp';
  let govde;
  try { govde = indir(x.href); } catch (e) { console.warn('atlandı', anahtar, e.status ?? ''); continue; }
  await writeFile(join(HEDEF, dosya), govde);
  liste[anahtar] = dosya;
  console.log('✓', anahtar, '→', dosya);
}

await writeFile(listeYolu, JSON.stringify(liste, null, 2) + '\n');
console.log(`${Object.keys(liste).length} görsel, ${listeYolu}`);
