# Durum — websitesi (eymen.akts.tr)

Güncelleme: 2026-10-21 | Son araç: claude

## Hedef

Kişisel portfolyo. Tek `index.html`; projeler `PROJECTS` dizisinde. Proje yayına
çıkınca ya da kapanınca bu dizi de güncellenir.

## Yapıldı

- [x] StudyTrack, Ezan Vaktim, Maske Pack, BlankReel kartları; OyunHub 40 oyun (f94a1e3). Canlıda.

- [x] Aktaş Fit kartı, Maske Packs → maskepacks.com, trCore açık kaynak (2026-09-25). Canlıda.

- [x] **2026-10-14 yeniden tasarım (CANLI):** editoryal koyu düzen — imlece tepki veren nokta alanı (canvas), harf harf açılan dev isim, kayan teknoloji şeridi, öne çıkan iki telefon, numaralı proje dizini (`PROJECTS` aynı veri), büyük mailto kapanışı. Vurgu rengi Akts turuncu-kırmızısı `#ff5b4a` (açık tema `#c8281c`). Profil fotoğrafı Snoopy (`profile.jpg?v=2`). Eski sürüm yerelde `index.onceki-2026-10-14.html`.

- [ ] **2026-10-21 "Nemy" turu (YEREL, yayınlanmadı):** aka Nemy, nokta alanı → paralaks yıldız, kart sahnesi (.fx rim/ark/parlama/filigran, dağıtılma girişi), navbar GitHub/mail/Discord hapları + kaydırınca cam, Discord profil kartı (assets/discord-ornek.json), 3D yuvaları (AKTS3D-BAGLA). Yedek `index.onceki-2026-10-21.html`.

## Sıradaki adım

Gizli depolar açılırsa kartlara `repo:` ekle (maske-pack, ezan-vaktim, studytrack, aktas-fit, blankreel/blankreel).

akts-3d modülü bitince index.html'deki `// AKTS3D-BAGLA` bloğunu aç; /api/discord canlıya alınınca kartı canlı veride kontrol et. Sonra yayın.

## Bilinen tuzaklar

- Cloudflare görselleri önbellekte tutuyor: aynı adla değişen dosyaya `?v=N` ver.

- Yayın: `rsync -a index.html assets akts:/var/www/portfolio/` (önce sunucuda
  `index.html.yedek-*` al). Dal `gizlilik-footer-404`, canlı bundan.
- Karo logoları 64'lük viewBox; akts-landing'deki 48'lik glifler 1.4545 ile ölçeklenip
  2 birim kaydırılıyor.
- Önizleme: `akts-landing/.claude/launch.json` içindeki `portfolyo` (4193).
