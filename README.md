# Doktor Shohizar — landing page

Tish shifokori Doktor Shohizar uchun zamonaviy, moslashuvchan (responsive) landing sahifa.

- Asosiy rang: purpur `#800080` (`styles.css` dagi `--primary` o'zgaruvchisi)
- Sof HTML/CSS/JS — build kerak emas, `index.html` ni brauzerda oching
- Bo'limlar: bosh ekran, xizmatlar, shifokor haqida, afzalliklar, narxlar, fikrlar, savollar, qabulga yozilish formasi, aloqa

## Almashtirilishi kerak bo'lgan ma'lumotlar
- Telefon raqam (`+998 77 066 50 55`), manzil, ish vaqti, Telegram/Instagram havolalari — `index.html`
- Narxlar, tajriba yillari, statistika
- Shifokor rasmi (hozir SVG illyustratsiya)

## Arizalarni Telegram botga yuborish

Qabul formasi arizani `/api/lead` ga yuboradi, u esa Telegram botga xabar jo'natadi
(`api/lead.js` — Vercel serverless funksiyasi). Bot tokeni faqat serverda saqlanadi, brauzerga chiqmaydi.

1. **Bot yarating:** Telegram'da [@BotFather](https://t.me/BotFather) → `/newbot` → tokenni nusxalang.
2. **Chat ID ni oling:**
   - Arizalar guruhga borsin desangiz — botni guruhga qo'shing va guruhda biror xabar yozing.
   - Shaxsiy chatga borsin desangiz — botga `/start` yozing.
   - Keyin brauzerda oching: `https://api.telegram.org/bot<TOKEN>/getUpdates` va `"chat":{"id": ...}` qiymatini oling
     (guruh ID si odatda `-100...` bilan boshlanadi).
3. **Vercel'ga joylang:** repozitoriyani [vercel.com](https://vercel.com) ga ulang (sozlama shart emas).
4. **Muhit o'zgaruvchilarini qo'shing:** Vercel → Project → Settings → Environment Variables:
   - `TELEGRAM_BOT_TOKEN` = bot tokeni
   - `TELEGRAM_CHAT_ID` = chat ID
   
   So'ng loyihani qayta deploy qiling.

Agar Telegram'ga yuborib bo'lmasa, foydalanuvchiga telefon raqam bilan xatolik xabari ko'rsatiladi.
Spamdan himoya uchun formada yashirin "honeypot" maydoni bor.

> `index.html` ni to'g'ridan-to'g'ri fayl sifatida ochsangiz, forma ishlamaydi — `/api/lead` faqat Vercel'da mavjud.
> Lokal sinash uchun: `npx vercel dev`.
