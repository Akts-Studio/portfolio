# Durum — websitesi (eymen.akts.tr)

Güncelleme: 2026-10-14 | Son araç: claude

## Hedef

Kişisel portfolyo. Tek `index.html`; projeler `PROJECTS` dizisinde. Proje yayına
çıkınca ya da kapanınca bu dizi de güncellenir.

## Yapıldı

- [x] StudyTrack, Ezan Vaktim, Maske Pack, BlankReel kartları; OyunHub 40 oyun (f94a1e3). Canlıda.

- [x] Aktaş Fit kartı, Maske Packs → maskepacks.com, trCore açık kaynak (2026-09-25). Canlıda.

- [x] **2026-10-14 yeniden tasarım (CANLI):** editoryal koyu düzen — imlece tepki veren nokta alanı (canvas), harf harf açılan dev isim, kayan teknoloji şeridi, öne çıkan iki telefon, numaralı proje dizini (`PROJECTS` aynı veri), büyük mailto kapanışı. Vurgu rengi Akts turuncu-kırmızısı `#ff5b4a` (açık tema `#c8281c`). Profil fotoğrafı Snoopy (`profile.jpg?v=2`). Eski sürüm yerelde `index.onceki-2026-10-14.html`.

## Sıradaki adım

Gizli depolar açılırsa kartlara `repo:` ekle (maske-pack, ezan-vaktim, studytrack, aktas-fit, blankreel/blankreel).

## Bilinen tuzaklar

- Cloudflare görselleri önbellekte tutuyor: aynı adla değişen dosyaya `?v=N` ver.

- Yayın: `rsync -a index.html assets akts:/var/www/portfolio/` (önce sunucuda
  `index.html.yedek-*` al). Dal `gizlilik-footer-404`, canlı bundan.
- Karo logoları 64'lük viewBox; akts-landing'deki 48'lik glifler 1.4545 ile ölçeklenip
  2 birim kaydırılıyor.
- Önizleme: `akts-landing/.claude/launch.json` içindeki `portfolyo` (4193).
