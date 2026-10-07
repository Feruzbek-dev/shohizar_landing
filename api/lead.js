// Vercel serverless funksiya: qabul formasidan kelgan arizani Telegram botga yuboradi.
// Kerakli muhit o'zgaruvchilari (Vercel → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN — @BotFather bergan token
//   TELEGRAM_CHAT_ID   — arizalar boradigan chat/guruh ID si (bir nechta bo'lsa, vergul bilan)

const SERVICES = [
  'Konsultatsiya',
  'Implantatsiya',
  'Breket / elayner',
  'Oqartirish',
  'Karies davolash',
  'Protezlash',
  'Tish kanallarini davolash',
];

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = process.env;
  if (!token || !chatId) {
    console.error('TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan');
    return res.status(500).json({ ok: false, error: 'Server not configured' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  // Honeypot: botlar yashirin maydonni to'ldiradi — jimgina "muvaffaqiyat" qaytaramiz
  if (body.website) return res.status(200).json({ ok: true });

  const name = String(body.name || '').trim().slice(0, 80);
  const digits = String(body.phone || '').replace(/\D/g, '');
  const service = SERVICES.includes(body.service) ? body.service : 'Konsultatsiya';

  if (name.length < 2 || !/^998\d{9}$/.test(digits)) {
    return res.status(400).json({ ok: false, error: 'Invalid name or phone' });
  }

  const phone = `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
  const text = [
    '🦷 <b>Yangi ariza — saytdan</b>',
    '',
    `👤 <b>Ism:</b> ${escapeHtml(name)}`,
    `📞 <b>Telefon:</b> <a href="tel:+${digits}">${phone}</a>`,
    `🩺 <b>Xizmat:</b> ${escapeHtml(service)}`,
    `🕘 <b>Vaqt:</b> ${time}`,
  ].join('\n');

  // TELEGRAM_CHAT_ID bir nechta bo'lishi mumkin: vergul bilan ajratiladi (123,456,-100789)
  const chatIds = chatId.split(',').map((s) => s.trim()).filter(Boolean);

  try {
    const results = await Promise.all(chatIds.map(async (id) => {
      const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: id, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      });
      const data = await tg.json();
      if (!data.ok) console.error(`Telegram xatosi (chat ${id}):`, data.description);
      return data.ok;
    }));
    // Kamida bitta chatga yetib borgan bo'lsa — muvaffaqiyat
    if (!results.some(Boolean)) {
      return res.status(502).json({ ok: false, error: 'Telegram error' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram bilan bog\'lanib bo\'lmadi:', err);
    return res.status(502).json({ ok: false, error: 'Telegram unreachable' });
  }
};
