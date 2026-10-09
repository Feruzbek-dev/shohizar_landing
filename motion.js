// Motion (motion.dev) asosidagi animatsiyalar.
// script.js bu modulni dinamik import qiladi; yuklanmasa oddiy CSS reveal ishlaydi.
import { animate, inView, scroll, stagger, press } from 'https://cdn.jsdelivr.net/npm/motion@12.43.0/+esm';

const root = document.documentElement;
root.classList.add('has-motion');

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: 'spring', stiffness: 260, damping: 22 };
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Animatsiya tugagach inline stillarni tozalab, CSS hover effektlariga joy beramiz
const settle = (el) => {
  el.classList.add('is-in');
  el.style.opacity = '';
  el.style.transform = '';
  el.style.filter = '';
};

// Matnni so'zlarga bo'lib, har birini alohida span ichiga o'raymiz
const splitWords = (el) => {
  const words = [];
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(part); return; }
        const w = document.createElement('span');
        w.className = 'word';
        w.textContent = part;
        frag.append(w);
        words.push(w);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.classList.add('word');
      words.push(node);
    }
  });
  return words;
};

/* ===== Yuqoridagi progress chizig'i ===== */
const bar = document.createElement('div');
bar.className = 'scroll-progress';
document.body.append(bar);
scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));

/* ===== Header kirib kelishi ===== */
const header = $('#header') || $('.header');
if (header) animate(header, { y: [-40, 0], opacity: [0, 1] }, { duration: 0.7, ease: EASE });

/* ===== Hero ===== */
const hero = $('.hero');
const heroReveals = hero ? $$('.reveal', hero) : [];
if (hero) {
  const [content, visual] = heroReveals;

  if (content) {
    content.classList.add('is-in');
    const h1 = $('h1', content);
    const words = h1 ? splitWords(h1) : [];
    const parts = [...content.children].filter((c) => c !== h1);
    [...words, ...parts].forEach((w) => { w.style.opacity = '0'; });

    animate(words, { opacity: [0, 1], y: [36, 0], filter: ['blur(8px)', 'blur(0px)'] },
      { duration: 0.8, ease: EASE, delay: stagger(0.06, { startDelay: 0.15 }) });
    animate(parts, { opacity: [0, 1], y: [24, 0] },
      { duration: 0.8, ease: EASE, delay: stagger(0.12, { startDelay: 0.3 + words.length * 0.04 }) });

    const stats = $$('.hero__stats > div', content);
    animate(stats, { opacity: [0, 1], scale: [0.8, 1] }, { ...SPRING, delay: stagger(0.1, { startDelay: 1 }) });
  }

  if (visual) {
    animate(visual, { opacity: [0, 1], scale: [0.85, 1], rotate: [-4, 0] }, { duration: 1.1, ease: EASE, delay: 0.25 })
      .then(() => settle(visual));
    const cards = $$('.float-card', visual);
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      animate(card, { opacity: [0, 1], x: [i % 2 ? 60 : -60, 0] }, { ...SPRING, delay: 0.9 + i * 0.2 })
        .then(() => { card.style.opacity = ''; card.style.transform = ''; });
    });
  }

  // Parallaks: fon va asosiy rasm turli tezlikda siljiydi
  const bg = $('.hero__bg', hero);
  const opts = { target: hero, offset: ['start start', 'end start'] };
  if (bg) scroll(animate(bg, { y: [0, 160] }, { ease: 'linear' }), opts);
  const main = $('.hero__card--main, .anatomy', hero);
  if (main) scroll(animate(main, { y: [0, 70] }, { ease: 'linear' }), opts);
}

/* ===== Scroll orqali paydo bo'lish ===== */
const variantFor = (el) => {
  if (el.matches('.about__visual, .suit__col:first-child')) return { opacity: [0, 1], x: [-60, 0], rotate: [-3, 0] };
  if (el.matches('.about__content, .suit__col:last-child, .contact__map')) return { opacity: [0, 1], x: [60, 0] };
  if (el.matches('.price--featured')) {
    // Desktopda CSS scale(1.05) bor — animatsiya aynan shu holatda tugashi kerak
    el.classList.add('is-in');
    const base = getComputedStyle(el).transform;
    return { opacity: [0, 1], transform: ['translateY(60px) scale(0.9)', base === 'none' ? 'none' : base] };
  }
  if (el.matches('.timeline__item')) return { opacity: [0, 1], x: [-40, 0] };
  if (el.matches('.cta')) return { opacity: [0, 1], scale: [0.94, 1], y: [40, 0] };
  if (el.matches('.service, .feature, .price, .review, .option, .part, .care__card')) {
    return { opacity: [0, 1], y: [50, 0], scale: [0.96, 1] };
  }
  return { opacity: [0, 1], y: [32, 0] };
};

// Fikrlardagi yulduzchalarni alohida spanlarga bo'lamiz
$$('.review__stars').forEach((s) => {
  const chars = [...s.textContent.trim()];
  s.textContent = '';
  chars.forEach((c) => {
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = c;
    s.append(star);
  });
});

$$('.reveal').filter((el) => !heroReveals.includes(el)).forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
  const idx = siblings.indexOf(el);
  el.style.opacity = '0';

  inView(el, () => {
    const delay = (idx % 3) * 0.1;
    animate(el, variantFor(el), { duration: 0.9, ease: EASE, delay }).then(() => settle(el));

    // Bo'lim sarlavhasi: ichidagi elementlar ketma-ket chiqadi
    if (el.matches('.section__head')) {
      animate([...el.children], { opacity: [0, 1], y: [18, 0] }, { duration: 0.7, ease: EASE, delay: stagger(0.08, { startDelay: delay }) });
    }

    const icon = $('.service__icon', el);
    if (icon) animate(icon, { scale: [0.4, 1], rotate: [-25, 0] }, { ...SPRING, delay: delay + 0.25 })
      .then(() => { icon.style.transform = ''; });

    const dot = $('.timeline__dot', el);
    if (dot) animate(dot, { scale: [0, 1] }, { ...SPRING, delay: delay + 0.15 });

    const num = $('.feature__num', el);
    if (num) animate(num, { opacity: [0, 1], x: [-20, 0] }, { duration: 0.6, ease: EASE, delay: delay + 0.2 });

    const stars = $$('.review__stars .star', el);
    if (stars.length) animate(stars, { opacity: [0, 1], scale: [0, 1], rotate: [-90, 0] }, { ...SPRING, delay: stagger(0.07, { startDelay: delay + 0.3 }) });

    const items = $$('.checklist li, .cta__list li, .price ul li', el);
    if (items.length) animate(items, { opacity: [0, 1], x: [-16, 0] }, { duration: 0.5, ease: EASE, delay: stagger(0.08, { startDelay: delay + 0.3 }) });

    const badge = $('.about__badge', el);
    if (badge) animate(badge, { opacity: [0, 1], scale: [0.5, 1] }, { ...SPRING, delay: delay + 0.5 })
      .then(() => { badge.style.transform = ''; });
  }, { amount: 0.15 });
});

/* ===== Ishonch tasmasi ===== */
const strip = $('.strip__inner');
if (strip) {
  const items = [...strip.children];
  items.forEach((i) => { i.style.opacity = '0'; });
  inView(strip, () => {
    animate(items, { opacity: [0, 1], y: [20, 0] }, { duration: 0.6, ease: EASE, delay: stagger(0.1) });
  }, { amount: 0.5 });
}

/* ===== Shifokor rasmi parallaksi ===== */
const photo = $('.about__photo img');
if (photo) {
  scroll(animate(photo, { y: [-30, 30], scale: [1.12, 1.12] }, { ease: 'linear' }),
    { target: photo.parentElement, offset: ['start end', 'end start'] });
}

/* ===== Kartalarga 3D egilish (faqat sichqoncha bilan) ===== */
if (finePointer) {
  $$('.service, .feature, .option').forEach((card) => {
    const lift = card.matches('.service, .feature') ? 'translateY(-6px) ' : '';
    card.addEventListener('pointermove', (e) => {
      if (!card.classList.contains('is-in')) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `${lift}perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg)`;
      card.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(py + 0.5) * 100}%`);
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ===== Tugmalar bosilganda "prujina" effekti ===== */
press('.btn, .fab, .socials a', (el) => {
  animate(el, { scale: 0.94 }, { duration: 0.12 });
  return () => animate(el, { scale: 1 }, SPRING).then(() => { el.style.transform = ''; });
});

/* ===== FAQ: silliq ochilish/yopilish ===== */
$$('.faq details').forEach((d) => {
  const summary = $('summary', d);
  const body = $$(':scope > :not(summary)', d);
  if (!summary || !body.length) return;
  let busy = false;
  summary.addEventListener('click', (e) => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    const start = d.offsetHeight;
    if (d.open) {
      const end = summary.offsetHeight;
      animate(body, { opacity: 0, y: -8 }, { duration: 0.2 });
      animate(d, { height: [`${start}px`, `${end}px`] }, { duration: 0.35, ease: EASE }).then(() => {
        d.open = false;
        d.style.height = '';
        body.forEach((b) => { b.style.opacity = ''; b.style.transform = ''; });
        busy = false;
      });
    } else {
      d.open = true;
      const end = d.offsetHeight;
      animate(body, { opacity: [0, 1], y: [-8, 0] }, { duration: 0.4, ease: EASE, delay: 0.1 });
      animate(d, { height: [`${start}px`, `${end}px`] }, { duration: 0.4, ease: EASE }).then(() => {
        d.style.height = '';
        busy = false;
      });
    }
  });
});

/* ===== Mobil menyu: havolalar ketma-ket chiqadi ===== */
const nav = $('#nav');
const burger = $('#burger');
if (nav && burger) {
  burger.addEventListener('click', () => {
    if (!nav.classList.contains('is-open')) return;
    animate([...nav.children], { opacity: [0, 1], x: [30, 0] }, { duration: 0.45, ease: EASE, delay: stagger(0.05, { startDelay: 0.1 }) });
  });
}

/* ===== Forma natijasi: xato bo'lsa silkinadi, muvaffaqiyatda "sakraydi" ===== */
const form = $('#form');
const note = $('#formNote');
if (form && note) {
  new MutationObserver(() => {
    if (note.classList.contains('is-err')) {
      animate(form, { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.45 }).then(() => { form.style.transform = ''; });
    } else if (note.classList.contains('is-ok')) {
      animate(note, { opacity: [0, 1], scale: [0.8, 1] }, SPRING);
    }
  }).observe(note, { attributes: true, attributeFilter: ['class'] });
}
