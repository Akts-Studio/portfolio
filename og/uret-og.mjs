// eymen.akts.tr link önizlemesi (1200x630): node og/uret-og.mjs  ->  og/eymen-akts-2026.png
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(path.join(os.homedir(), 'harness/tools/package.json'))('playwright');
const AD = path.dirname(new URL(import.meta.url).pathname);
const logo = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(os.homedir(), 'Desktop/projects/akts-landing/public/brand/akts-studio.svg')).toString('base64');
const F = '-apple-system, SF Pro Display, Helvetica Neue, Arial, sans-serif';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0d0f"/><stop offset="1" stop-color="#050506"/></linearGradient>
<radialGradient id="isik" cx="0.85" cy="0.15" r="0.8"><stop offset="0" stop-color="#ff5b4a" stop-opacity="0.38"/><stop offset="0.55" stop-color="#e6742e" stop-opacity="0.1"/><stop offset="1" stop-color="#e6742e" stop-opacity="0"/></radialGradient>
<linearGradient id="t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff5b4a"/><stop offset="1" stop-color="#e6742e"/></linearGradient>
<pattern id="n" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" fill="#fff" fill-opacity="0.07"/></pattern>
<pattern id="c" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M56 0H0V56" fill="none" stroke="#fff" stroke-opacity="0.035"/></pattern>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#c)"/><rect width="1200" height="630" fill="url(#n)"/><rect width="1200" height="630" fill="url(#isik)"/>
<circle cx="980" cy="315" r="300" fill="none" stroke="#ff5b4a" stroke-opacity="0.16"/><circle cx="980" cy="315" r="220" fill="none" stroke="#ff5b4a" stroke-opacity="0.12"/><circle cx="980" cy="315" r="140" fill="none" stroke="#e6742e" stroke-opacity="0.22"/>
<rect x="860" y="195" width="240" height="240" rx="56" fill="#0a0a0a" stroke="#fff" stroke-opacity="0.14" stroke-width="2"/>
<image href="${logo}" x="880" y="215" width="200" height="200"/>
<rect x="84" y="118" width="206" height="42" rx="21" fill="#ff5b4a" fill-opacity="0.14" stroke="#ff5b4a" stroke-opacity="0.55"/>
<circle cx="110" cy="139" r="6" fill="#ff5b4a"/>
<text x="128" y="146" font-size="20" font-weight="700" letter-spacing="3.5" fill="#ff5b4a" font-family="${F}">AKA NEMY</text>
<text x="80" y="312" font-size="132" font-weight="800" letter-spacing="-5" fill="#f5f4f1" font-family="${F}">Eymen</text>
<text x="80" y="428" font-size="132" font-weight="800" letter-spacing="-5" fill="url(#t)" font-family="${F}">Aktaş</text>
<rect x="84" y="462" width="96" height="6" rx="3" fill="url(#t)"/>
<text x="84" y="520" font-size="34" fill="#f5f4f1" fill-opacity="0.68" letter-spacing="-0.4" font-family="${F}">Android ve web geliştirici · Akts Studio</text>
<text x="1116" y="572" text-anchor="end" font-size="24" font-weight="600" fill="#f5f4f1" fill-opacity="0.45" font-family="${F}">eymen.akts.tr</text>
<rect x="0" y="624" width="1200" height="6" fill="url(#t)"/>
</svg>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(`<body style="margin:0;background:#050506">${svg}</body>`);
await p.screenshot({ path: path.join(AD, 'eymen-akts-2026.png'), clip: { x: 0, y: 0, width: 1200, height: 630 } });
await b.close();
