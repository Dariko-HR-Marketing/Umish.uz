# umish.uz: serverga yuborish (deploy)

Sayt statik: serverda faqat fayllar turadi, Nginx ularni beradi. Yangilash = serverdagi nusxani GitHub'dagi `main` bilan tenglashtirish.

## 1. Bir martalik tayyorlash (serverda)

```bash
# Sayt papkasi git nusxa bo'lishi kerak (agar hali bo'lmasa)
cd /var/www && sudo git clone https://github.com/Dariko-HR-Marketing/Umish.uz.git umish.uz
sudo chown -R "$USER":"$USER" /var/www/umish.uz
```

Nginx sozlamasi: `deploy/nginx-umish.conf` ni mavjud sozlamangiz bilan solishtiring. Muhim qismlari:
- `js/cad-3d.js` (3D maneken) to'g'ri MIME turi (`text/javascript`) bilan berilishi shart;
- `gzip` yoqilgan bo'lsin (3D kutubxonasi ~700 KB, siqilganda ~170 KB);
- `.git`, `deploy`, `scripts`, `docs` papkalari tashqariga berilmasin;
- HTML/CSS/JS `no-cache` (ETag bilan tekshiriladi), rasmlar 7 kun keshlanadi.

Tekshirish:

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -sI https://umish.uz/js/cad-3d.js | grep -i content-type    # text/javascript bo'lishi kerak
curl -sI -H 'Accept-Encoding: gzip' https://umish.uz/js/vendor/three.module.min.js | grep -i content-encoding
```

## 2. Yangilash

**Qo'lda (har doim ishlaydi):**

```bash
SITE_DIR=/var/www/umish.uz bash /var/www/umish.uz/deploy/deploy.sh
```

Skript: `git fetch` → o'zgarish bo'lmasa to'xtaydi → `git reset --hard origin/main` → `node scripts/check.mjs` (Node bo'lsa) → xato bo'lsa **oldingi versiyaga qaytadi**.
Eslatma: serverdagi qo'lda qilingan o'zgarishlar yangilashda o'chadi. Sayt faylini serverda tahrirlamang.

**Avtomatik, variant A: cron (eng oddiy)**

```bash
crontab -e
*/5 * * * * SITE_DIR=/var/www/umish.uz /var/www/umish.uz/deploy/deploy.sh >> /var/log/umish-deploy.log 2>&1
```

`main` ga yangi o'zgarish tushsa, 5 daqiqa ichida sayt yangilanadi.

**Avtomatik, variant B: GitHub Actions (darhol)**

`.github/workflows/deploy.yml` tayyor, lekin o'chirilgan. Yoqish:
1. Serverda deploy uchun alohida SSH kalit yarating va ochiq qismini `~/.ssh/authorized_keys` ga qo'shing.
2. GitHub → Settings → Secrets and variables → Actions:
   - Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY` (yopiq kalit);
   - Variables: `DEPLOY_ENABLED=true`, `SITE_DIR=/var/www/umish.uz`.
3. `main` ga har birlashtirishda yoki Actions'dan qo'lda ishga tushiring.

Ikkala variantni bir vaqtda yoqish shart emas.

## 3. Yangilashdan keyin tekshiruv

- Brauzerda `Ctrl+Shift+R`, konsolda xato yo'qligini ko'ring.
- Kalkulyator: 3D maneken ochilyaptimi, slayder o'zgarganda forma o'zgaryaptimi.
- `curl -s https://umish.uz/ | grep -c cad-3d` o'rniga: `curl -sI https://umish.uz/js/cad-3d.js` 200 qaytarsin.

## 4. Orqaga qaytarish (agar kerak bo'lsa)

```bash
cd /var/www/umish.uz && git log --oneline -5      # kerakli commitni toping
git reset --hard <commit> && sudo systemctl reload nginx
```
Keyin `main` da muammoni tuzatgunga qadar avtomatik yangilashni vaqtincha o'chiring (cron qatorini izohga oling).

## 5. Mahalliy tekshiruv (dasturchi uchun)

```bash
node scripts/check.mjs            # JS sintaksisi, havolalar, JSON-LD, sitemap
python3 -m http.server 8099       # saytni serverdan oching (3D moduli file:// da ishlamaydi)
```
