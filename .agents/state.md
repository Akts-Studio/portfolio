# Durum — websitesi (eymen.akts.tr)

Güncelleme: 2026-10-22 | Son araç: claude

## Hedef

Kişisel portfolyo. Tek `index.html`; projeler `PROJECTS` dizisinde. Proje yayına
çıkınca ya da kapanınca bu dizi de güncellenir.

## Yapıldı

- [x] StudyTrack, Ezan Vaktim, Maske Pack, BlankReel kartları; OyunHub 40 oyun (f94a1e3). Canlıda.

- [x] Aktaş Fit kartı, Maske Packs → maskepacks.com, trCore açık kaynak (2026-09-25). Canlıda.

- [x] **2026-10-14 yeniden tasarım (CANLI):** editoryal koyu düzen — imlece tepki veren nokta alanı (canvas), harf harf açılan dev isim, kayan teknoloji şeridi, öne çıkan iki telefon, numaralı proje dizini (`PROJECTS` aynı veri), büyük mailto kapanışı. Vurgu rengi Akts turuncu-kırmızısı `#ff5b4a` (açık tema `#c8281c`). Profil fotoğrafı Snoopy (`profile.jpg?v=2`). Eski sürüm yerelde `index.onceki-2026-10-14.html`.

- [x] **2026-10-21 "Nemy" turu (CANLI):** aka Nemy, statik yıldız alanı, kart sahnesi (.fx rim/ark/parlama/filigran, dağıtılma girişi), navbar GitHub/mail/Discord hapları + kaydırınca cam, Discord profil kartı (assets/discord-ornek.json). `akts-3d.js` ve Three vendor silindi; hero CSS ışık halkası + N monogramı. 375/768/1440 temiz; boşta rAF 0/sn, canvas/WebGL 0. Canlı: HTTP 200 + GPU ekran görüntüsü.

## Sıradaki adım

Gizli depolar açılırsa kartlara `repo:` ekle (maske-pack, ezan-vaktim, studytrack, aktas-fit, blankreel/blankreel).

/api/discord canlı verisiyle Discord kartını kontrol et.

## Bilinen tuzaklar

- Cloudflare görselleri önbellekte tutuyor: aynı adla değişen dosyaya `?v=N` ver.

- Yayın: `rsync -a index.html assets akts:/var/www/portfolio/` (önce sunucuda
  `index.html.yedek-*` al). Dal `gizlilik-footer-404`, canlı bundan.
- Karo logoları 64'lük viewBox; akts-landing'deki 48'lik glifler 1.4545 ile ölçeklenip
  2 birim kaydırılıyor.
- Önizleme: `akts-landing/.claude/launch.json` içindeki `portfolyo` (4193).

- [x] **2026-10-22 optimizasyon turu (CANLI, claude):** WebP görseller (profil 73KB→5KB, logolar), Inter latin-ext Türkçe alt kümesi 85→16KB, latin font preload, Discord banner statik webp?size=600, beat animasyonu box-shadow→opacity (boşta CPU 146→2 ms/sn). nginx: /assets/fonts 1y immutable. Mobil transfer 848→174KB.

- [x] **2026-10-22 hero nokta küresi (CANLI, claude):** N + dönen halka yerine `assets/dot-field.js` (canvas 2D, ~1k nokta): ışık imleci izler, imleç noktaları iter, tık/dokunuş dalga yayar. Yalnız ekranda+sekme görünürken, hareket bitince rAF 0; reduced-motion'da tek statik kare. Boşta 2.4 ms/sn (önce 2.2), imleç hareketinde script ~45-65 ms/sn. Boş `assets/vendor` silindi (yerel+sunucu). Landing'e uygulanmadı (Eymen landing'i 21 Ekim öncesine alıyor).


## 2026-10-22 (claude)
Navbar yüzen liquid glass kapsül yapıldı (backdrop blur+saturate, kenar parlaması, SVG kırılma; Discord/GitHub/mail hapları duruyor). CANLI.

## 2026-10-22 navbar ayrı haplar (claude)
Yeşil nokta kalktı, logo (favicon E) hapı; logo / bağlantılar / araçlar(GitHub, mail, tema) / Discord ayrı koyu sıcak cam haplar. SVG kırılma filtresi (titreme), max-width geçişi ve saat kaldırıldı; kaydırınca yalnız yükseklik küçülür. Discord bağlantısı sabit profil linki. CANLI (yedek: index.html.yedek-*).
