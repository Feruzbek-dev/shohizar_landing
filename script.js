(function () {
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const fab = document.querySelector('.fab');

  // Header shadow + floating button on scroll
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 20);
    if (fab) fab.classList.toggle('is-visible', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const setMenu = (open) => {
    if (!nav || !burger) return;
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  if (burger && nav) {
    burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 80}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // Active nav link
  const links = nav ? [...nav.querySelectorAll('a')].filter((a) => a.getAttribute('href').startsWith('#')) : [];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  // Animated counters
  const counters = document.querySelectorAll('[data-count]');
  const fmt = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ');
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const dur = 1600;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
      });
    });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((c) => { c.textContent = fmt(Number(c.dataset.count)) + (c.dataset.suffix || ''); });
  }

  // Phone mask: +998 XX XXX XX XX
  const phone = document.querySelector('input[name="phone"]');
  if (phone) {
  phone.addEventListener('focus', () => { if (!phone.value) phone.value = '+998 '; });
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (!d.startsWith('998')) d = '998' + d;
    d = d.slice(0, 12);
    const p = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
    phone.value = '+' + p.join(' ');
  });
  }

  // Form
  const form = document.getElementById('form');
  const note = form && document.getElementById('formNote');
  const submitBtn = form && form.querySelector('button[type="submit"]');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const digits = phone.value.replace(/\D/g, '');
    const nameOk = name.value.trim().length >= 2;
    const phoneOk = digits.length === 12;
    name.classList.toggle('is-invalid', !nameOk);
    phone.classList.toggle('is-invalid', !phoneOk);
    note.className = 'form__note';
    if (!nameOk || !phoneOk) {
      note.textContent = "Iltimos, ism va telefon raqamni to'g'ri kiriting.";
      note.classList.add('is-err');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Yuborilmoqda...';
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.value.trim(),
          phone: phone.value,
          service: form.elements.service.value,
          website: form.elements.website.value,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || res.status);
      note.textContent = "Rahmat! Tez orada siz bilan bog'lanamiz.";
      note.classList.add('is-ok');
      form.reset();
    } catch (err) {
      note.innerHTML = "Xatolik yuz berdi. Iltimos, qo'ng'iroq qiling: <a href=\"tel:+998770665055\">+998 77 066 50 55</a>";
      note.classList.add('is-err');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Yuborish';
    }
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Boshqa sahifadan kelgan ?service=... ni forma tanloviga qo'yamiz
  const wanted = new URLSearchParams(location.search).get('service');
  if (form && wanted) {
    const opt = [...form.elements.service.options].find((o) => o.value === wanted);
    if (opt) form.elements.service.value = wanted;
  }
})();
