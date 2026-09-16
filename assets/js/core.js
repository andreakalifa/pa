/* =========================================================
   PREMIUM ACADEMY — core condiviso
   Mappa Italia, QR, dettaglio evento, wizard iscrizione,
   area riservata, toast, countdown. Lo stile dei componenti
   si adatta a ogni proposta tramite variabili CSS (core.css).
   ========================================================= */
(function () {
  const D = window.PA_DATA;
  const BASE = window.PA_BASE || '../';
  const IMG = BASE + 'assets/img/';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const MON3 = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
  const DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

  const cat = id => D.categories.find(c => c.id === id);
  const coach = id => D.coaches.find(c => c.id === id);
  const eur = n => '€ ' + n.toLocaleString('it-IT', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

  function d(dateStr) { return dateStr instanceof Date ? dateStr : new Date(dateStr + 'T09:00:00'); }
  const fmt = {
    day: x => d(x).getDate(),
    mon3: x => MON3[d(x).getMonth()],
    month: x => MONTHS[d(x).getMonth()],
    weekday: x => DAYS[d(x).getDay()],
    short: x => d(x).getDate() + ' ' + MONTHS[d(x).getMonth()],
    range(e) { const a = e.startDate, b = e.endDate; return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MONTHS[a.getMonth()]} ${a.getFullYear()}` : `${a.getDate()} ${MONTHS[a.getMonth()]} – ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`; },
    rangeShort(e) { const a = e.startDate, b = e.endDate; return `${a.getDate()}–${b.getDate()} ${MON3[a.getMonth()]}`; },
    dayLong: x => { const y = d(x); return DAYS[y.getDay()] + ' ' + y.getDate() + ' ' + MONTHS[y.getMonth()]; }
  };

  /* ---------- stato registrazioni (localStorage) ---------- */
  const KEY = 'pa_regs_v1';
  const store = {
    all() { try { return JSON.parse(localStorage.getItem(KEY)) || seedRegs(); } catch (e) { return seedRegs(); } },
    save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { } },
    add(r) { const l = store.all(); l.unshift(r); store.save(l); }
  };
  function seedRegs() {
    const demo = [{ code: 'PA-7Q2K', eventId: 'pescara-2026', slotIds: ['pescara-2026-s3'], athlete: 'Matteo Lorenzi', email: 'demo@premiumacademy.it', total: 55, status: 'completata', created: '2026-08-30', waitlist: false }];
    try { localStorage.setItem(KEY, JSON.stringify(demo)); } catch (e) { }
    return demo;
  }

  /* ---------- eventi ---------- */
  function extraTaken(slotId) { return store.all().filter(r => !r.waitlist && r.slotIds.includes(slotId)).reduce((n, r) => n + (r.count || 1), 0); }
  function slotLeft(s) { return Math.max(0, s.cap - s.taken - extraTaken(s.id)); }
  function eventInfo(e) {
    const athletes = e.slots.filter(s => s.type === 'atleti');
    const cap = athletes.reduce((n, s) => n + s.cap, 0);
    const left = athletes.reduce((n, s) => n + slotLeft(s), 0);
    let status = 'open', label = 'Iscrizioni aperte';
    if (e.endDate < D.TODAY) { status = 'past'; label = 'Concluso'; }
    else if (e.opensOn && d(e.opensOn) > D.TODAY) { status = 'soon'; label = 'Apre il ' + fmt.short(e.opensOn); }
    else if (left === 0) { status = 'soldout'; label = 'Sold out · lista d’attesa'; }
    else if (left / cap <= 0.15) { status = 'last'; label = 'Ultimi ' + left + ' posti'; }
    const priceFrom = Math.min(...athletes.map(s => s.price));
    return { cap, left, status, label, priceFrom, pct: Math.round((1 - left / cap) * 100) };
  }
  const upcoming = () => D.events.filter(e => e.endDate >= D.TODAY).sort((a, b) => a.startDate - b.startDate);
  const past = () => D.events.filter(e => e.endDate < D.TODAY).sort((a, b) => b.startDate - a.startDate);
  const nextOpen = () => upcoming().find(e => ['open', 'last'].includes(eventInfo(e).status)) || upcoming()[0];
  const regions = () => [...new Set(upcoming().map(e => e.region))].sort();
  const months = () => [...new Map(upcoming().map(e => [e.startDate.getFullYear() * 12 + e.startDate.getMonth(), { key: e.start.slice(0, 7), label: MONTHS[e.startDate.getMonth()] + ' ' + e.startDate.getFullYear() }])).values()];
  function filter({ region = '', month = '', category = '', q = '', onlyOpen = false } = {}) {
    return upcoming().filter(e => (!region || e.region === region) && (!month || e.start.startsWith(month)) && (!category || e.slots.some(s => s.cat === category)) &&
      (!q || (e.city + ' ' + e.venue + ' ' + e.region).toLowerCase().includes(q.toLowerCase())) && (!onlyOpen || ['open', 'last'].includes(eventInfo(e).status)));
  }

  /* ---------- countdown ---------- */
  function countdown(target, cb) {
    const t = d(target).getTime();
    function tick() {
      // orologio "demo": parte da TODAY e scorre in tempo reale
      const now = D.TODAY.getTime() + (Date.now() - START);
      let s = Math.max(0, Math.floor((t - now) / 1000));
      const v = { days: Math.floor(s / 86400), hours: Math.floor(s % 86400 / 3600), minutes: Math.floor(s % 3600 / 60), seconds: s % 60 };
      cb(v);
    }
    tick(); return setInterval(tick, 1000);
  }
  const START = Date.now();
  const pad = n => String(n).padStart(2, '0');

  /* ---------- mappa Italia ---------- */
  const SHAPES = {
    main: [[7.5, 43.8], [7.0, 45.3], [6.9, 45.9], [7.9, 45.95], [8.4, 46.45], [9.0, 46.5], [9.5, 46.3], [10.2, 46.6], [10.5, 46.9], [11.2, 47.05], [12.2, 47.1], [12.7, 46.6], [13.7, 46.5], [13.5, 45.9], [13.8, 45.6], [13.1, 45.75], [12.3, 45.4], [12.5, 44.9], [12.3, 44.4], [12.6, 44.05], [13.5, 43.6], [14.2, 42.45], [15.0, 42.0], [16.1, 41.9], [15.9, 41.6], [16.9, 41.1], [17.95, 40.65], [18.5, 40.15], [18.35, 39.8], [17.99, 40.05], [17.2, 40.45], [16.6, 40.1], [16.55, 39.65], [17.1, 39.1], [16.5, 38.7], [16.0, 37.95], [15.65, 38.1], [15.7, 38.25], [15.9, 38.7], [16.15, 38.73], [16.0, 39.35], [15.7, 40.0], [14.75, 40.65], [14.5, 40.6], [14.25, 40.85], [13.55, 41.2], [12.6, 41.45], [12.2, 41.75], [11.8, 42.1], [11.1, 42.4], [10.5, 42.95], [10.3, 43.55], [9.85, 44.1], [8.9, 44.4], [8.45, 44.3]],
    sicily: [[15.55, 38.25], [15.2, 38.25], [14.0, 38.02], [13.35, 38.15], [12.5, 38.05], [12.42, 37.8], [12.6, 37.65], [13.1, 37.5], [13.6, 37.25], [14.25, 37.05], [15.1, 36.68], [15.3, 37.05], [15.1, 37.5], [15.3, 37.85]],
    sardinia: [[9.2, 41.25], [9.6, 41.0], [9.55, 40.9], [9.8, 40.5], [9.7, 40.0], [9.65, 39.5], [9.55, 39.15], [9.1, 39.2], [8.9, 38.9], [8.4, 39.0], [8.45, 39.45], [8.5, 39.9], [8.4, 40.3], [8.2, 40.6], [8.2, 40.95], [8.6, 40.85]]
  };
  const proj = (lon, lat) => [(lon - 6.5) * 37.2 + 10, (47.4 - lat) * 50 + 10];
  function inPoly(x, y, pts) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
  function italyMap({ style = 'line', gap = 9, events = upcoming(), pinR = 7 } = {}) {
    const polys = Object.values(SHAPES).map(p => p.map(([lo, la]) => proj(lo, la)));
    let body = '';
    if (style === 'dots') {
      for (let x = 0; x < 470; x += gap) for (let y = 0; y < 560; y += gap) if (polys.some(p => inPoly(x, y, p))) body += `<circle class="pa-map-dot" cx="${x}" cy="${y}" r="${gap * 0.28}"/>`;
    } else {
      body = polys.map(p => `<path class="pa-map-land" d="M${p.map(q => q.map(v => v.toFixed(1)).join(',')).join('L')}Z"/>`).join('');
    }
    const pins = events.map(e => { const [x, y] = proj(e.lon, e.lat); const st = eventInfo(e).status; return `<g class="pa-pin is-${st}" data-event="${e.id}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(e.city)}, ${fmt.range(e)}"><circle class="pa-pin-pulse" r="${pinR * 2}"/><circle class="pa-pin-dot" r="${pinR}"/><text class="pa-pin-label" x="${pinR + 6}" y="4">${esc(e.city)}</text></g>`; }).join('');
    return `<svg class="pa-map" viewBox="0 0 470 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mappa delle tappe in Italia">${body}${pins}</svg>`;
  }
  function bindMap(root, onPin) {
    $$('.pa-pin', root).forEach(p => { const go = () => (onPin || openEvent)(p.dataset.event); p.addEventListener('click', go); p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
  }

  /* ---------- QR finto ma credibile ---------- */
  function qr(text, size = 160) {
    const n = 25, cell = size / n; let h = 0; for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    const finder = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
    let r = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { if (finder(x, y)) continue; if (rnd() > 0.52) r += `<rect x="${x * cell}" y="${y * cell}" width="${cell + .3}" height="${cell + .3}"/>`; }
    const fp = (x, y) => `<rect x="${x * cell}" y="${y * cell}" width="${7 * cell}" height="${7 * cell}"/><rect x="${(x + 1) * cell}" y="${(y + 1) * cell}" width="${5 * cell}" height="${5 * cell}" fill="#fff"/><rect x="${(x + 2) * cell}" y="${(y + 2) * cell}" width="${3 * cell}" height="${3 * cell}"/>`;
    return `<svg class="pa-qr" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-label="QR code ${esc(text)}"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#111">${r}${fp(0, 0)}${fp(n - 7, 0)}${fp(0, n - 7)}</g></svg>`;
  }

  /* ---------- avatar coach ---------- */
  function avatar(c, cls = '') {
    if (c.img) return `<img class="pa-avatar ${cls}" src="${IMG + c.img}" alt="${esc(c.name)}">`;
    const ini = c.name.split(' ').map(w => w[0]).join('');
    return `<svg class="pa-avatar pa-avatar-ph ${cls}" viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(c.name)} (foto da inserire)"><rect width="300" height="380" fill="#2b2728"/><g stroke="#d70e20" stroke-width="3" opacity=".55">${[0, 1, 2, 3, 4, 5].map(i => `<line x1="${-60 + i * 70}" y1="380" x2="${80 + i * 70}" y2="0"/>`).join('')}</g><circle cx="150" cy="150" r="58" fill="#3a3536"/><path d="M52 380c8-78 48-118 98-118s90 40 98 118z" fill="#3a3536"/><text x="150" y="166" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="900" font-style="italic" font-size="44" fill="#fff">${ini}</text></svg>`;
  }

  /* ---------- placeholder foto evento ---------- */
  function photo(seed, label = '', variant = 0) {
    const tones = [['#d70e20', '#6d0710'], ['#2b2728', '#141213'], ['#3b3637', '#d70e20'], ['#ececec', '#bdbdbd']];
    const [a, b] = tones[variant % tones.length]; const id = 'g' + Math.random().toString(36).slice(2, 7);
    const lanes = [1, 2, 3, 4, 5].map(i => `<line x1="0" y1="${i * 66}" x2="600" y2="${i * 66}" stroke="rgba(255,255,255,.22)" stroke-width="3" stroke-dasharray="18 10"/>`).join('');
    return `<svg class="pa-photo" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label || 'Foto evento (placeholder)')}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="400" fill="url(#${id})"/>${lanes}<path d="M0 ${250 + seed % 40} Q150 ${210 + seed % 30} 300 ${250} T600 ${240}" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none"/>${label ? `<text x="24" y="376" font-family="Archivo, sans-serif" font-size="18" font-weight="700" fill="rgba(255,255,255,.85)">${esc(label)}</text>` : ''}</svg>`;
  }

  /* ---------- toast ---------- */
  function toast(msg) {
    let t = $('.pa-toast'); if (!t) { t = document.createElement('div'); t.className = 'pa-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('is-on'), 2600);
  }

  /* ---------- modal base ---------- */
  function modal(html, { wide = false, label = 'Finestra' } = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'pa-modal';
    wrap.innerHTML = `<div class="pa-modal-backdrop" data-close></div><div class="pa-modal-panel ${wide ? 'is-wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1"><button class="pa-modal-x" data-close aria-label="Chiudi">×</button><div class="pa-modal-body">${html}</div></div>`;
    document.body.appendChild(wrap); document.documentElement.classList.add('pa-lock');
    const prev = document.activeElement;
    requestAnimationFrame(() => { wrap.classList.add('is-open'); $('.pa-modal-panel', wrap).focus(); });
    const close = () => { wrap.classList.remove('is-open'); setTimeout(() => { wrap.remove(); if (!$('.pa-modal')) document.documentElement.classList.remove('pa-lock'); prev && prev.focus && prev.focus(); }, 250); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    return { el: wrap, body: $('.pa-modal-body', wrap), close };
  }

  /* ---------- dettaglio evento ---------- */
  function openEvent(id, tab = 'programma') {
    const e = D.events.find(x => x.id === id); if (!e) return;
    const info = eventInfo(e);
    const days = [...new Set(e.slots.map(s => s.date))];
    const m = modal(`
      <header class="pa-ev-head">
        <div class="pa-ev-kicker"><span class="pa-badge is-${info.status}">${esc(info.label)}</span><span>${esc(e.region)}</span></div>
        <h2 class="pa-ev-title">${esc(e.city)}</h2>
        <p class="pa-ev-meta">${fmt.range(e)}<br>${esc(e.venue)}, ${esc(e.pool)}</p>
        ${info.status !== 'past' ? `<div class="pa-ev-count" data-count></div>` : ''}
        <div class="pa-ev-actions">
          ${info.status === 'past' ? `<button class="pa-btn" data-gallery>Guarda la galleria</button>` : info.status === 'soon' ? `<button class="pa-btn" data-notify>Avvisami all’apertura</button>` : `<button class="pa-btn" data-reg>${info.status === 'soldout' ? 'Entra in lista d’attesa' : 'Iscriviti'}</button>`}
          <button class="pa-btn is-ghost" data-share>Condividi</button>
        </div>
      </header>
      <nav class="pa-tabs" role="tablist">${[['programma', 'Programma'], ['coach', 'Coach'], ['struttura', 'Struttura'], ['info', 'Info utili']].map(([k, l]) => `<button role="tab" data-tab="${k}" aria-selected="${k === tab}">${l}</button>`).join('')}</nav>
      <section class="pa-tabpanel" data-panel="programma">
        ${days.map(day => `<h3 class="pa-day">${fmt.dayLong(day)}</h3>
          <ul class="pa-slots">${e.slots.filter(s => s.date === day).map(s => { const left = slotLeft(s), c = cat(s.cat), pct = Math.round((1 - left / s.cap) * 100); return `
            <li class="pa-slot ${left === 0 ? 'is-full' : ''}">
              <div class="pa-slot-time">${s.start}<span>${s.end}</span></div>
              <div class="pa-slot-main"><strong>${esc(c.label)}</strong> <span class="pa-muted">${esc(c.ages)}</span><p>${esc(s.focus)}</p>
                <div class="pa-bar" aria-label="${pct}% posti occupati"><i style="width:${pct}%"></i></div>
                <small>${left === 0 ? 'Fascia piena' : left + ' posti su ' + s.cap}</small></div>
              <div class="pa-slot-cta"><b>${eur(s.price)}</b>${info.status === 'past' || info.status === 'soon' ? '' : `<button class="pa-btn is-sm ${left === 0 ? 'is-ghost' : ''}" data-reg-slot="${s.id}">${left === 0 ? 'Lista d’attesa' : 'Prenota'}</button>`}</div>
            </li>`; }).join('')}</ul>`).join('')}
        <div class="pa-note">Ogni fascia: 20′ attivazione a secco, 60′ in acqua, 10′ video feedback a bordo vasca. Da 2 fasce in su −15%.</div>
      </section>
      <section class="pa-tabpanel" data-panel="coach" hidden>
        <div class="pa-coachgrid">${e.coaches.map(coach).map(c => `<article class="pa-coach">${avatar(c)}<div><h4>${esc(c.name)}</h4><p class="pa-muted">${esc(c.role)}</p><p>${esc(c.bio)}</p></div></article>`).join('')}</div>
      </section>
      <section class="pa-tabpanel" data-panel="struttura" hidden>
        <div class="pa-venue">
          <div class="pa-venue-map">${photo(e.lat * 10 | 0, e.venue, 1)}</div>
          <dl class="pa-dl"><dt>Struttura</dt><dd>${esc(e.venue)}</dd><dt>Indirizzo</dt><dd>${esc(e.address)}</dd><dt>Vasca</dt><dd>${esc(e.pool)}</dd><dt>Parcheggio</dt><dd>${esc(e.parking)}</dd><dt>Hotel convenzionato</dt><dd>${esc(e.hotel)}</dd></dl>
        </div>
        <a class="pa-btn is-ghost" href="https://www.google.com/maps/search/${encodeURIComponent(e.address)}" target="_blank" rel="noopener">Apri in Google Maps</a>
      </section>
      <section class="pa-tabpanel" data-panel="info" hidden>
        <div class="pa-two">
          <div><h4>Cosa portare</h4><ul class="pa-list"><li>Costume, cuffia, occhialini (meglio due paia)</li><li>Accappatoio e ciabatte</li><li>Abbigliamento comodo per la parte a secco</li><li>Borraccia e uno snack</li><li>QR dell’iscrizione sul telefono</li></ul></div>
          <div><h4>Regolamento</h4><ul class="pa-list"><li>Check-in 30 minuti prima della fascia</li><li>Certificato medico valido obbligatorio</li><li>Minori con consenso del genitore firmato</li><li>Riprese video solo dallo staff</li></ul></div>
        </div>
        <h4>Domande frequenti</h4>${faqHtml(D.faq.slice(0, 5))}
      </section>`, { wide: true, label: 'Tappa di ' + e.city });
    const b = m.body;
    const cd = $('[data-count]', b);
    if (cd) { const h = countdown(e.startDate, v => { if (!document.body.contains(m.el)) return clearInterval(h); cd.innerHTML = `<span><b>${v.days}</b>giorni</span><span><b>${pad(v.hours)}</b>ore</span><span><b>${pad(v.minutes)}</b>min</span><span><b>${pad(v.seconds)}</b>sec</span>`; }); }
    $$('[data-tab]', b).forEach(t => t.addEventListener('click', () => { $$('[data-tab]', b).forEach(x => x.setAttribute('aria-selected', x === t)); $$('[data-panel]', b).forEach(p => p.hidden = p.dataset.panel !== t.dataset.tab); }));
    const act = $(`[data-tab="${tab}"]`, b); act && act.click();
    b.addEventListener('click', ev => {
      const t = ev.target.closest('button,a'); if (!t) return;
      if (t.dataset.reg !== undefined) { m.close(); openRegister({ eventId: e.id }); }
      if (t.dataset.regSlot) { m.close(); openRegister({ eventId: e.id, slotId: t.dataset.regSlot }); }
      if (t.dataset.share !== undefined) share(e);
      if (t.dataset.notify !== undefined) toast('Ti avviseremo il ' + fmt.short(e.opensOn) + ' all’apertura delle iscrizioni');
      if (t.dataset.gallery !== undefined) { m.close(); openAccount('media'); }
    });
    bindFaq(b);
    try { history.replaceState(null, '', '#evento=' + e.id); } catch (err) { }
  }
  function share(e) {
    const url = location.href.split('#')[0] + '#evento=' + e.id;
    const text = `Premium Academy a ${e.city}, ${fmt.range(e)}`;
    if (navigator.share) navigator.share({ title: text, url }).catch(() => { });
    else { navigator.clipboard && navigator.clipboard.writeText(url); toast('Link copiato. Puoi incollarlo su WhatsApp'); }
  }

  function faqHtml(list = D.faq) { return `<div class="pa-faq">${list.map(([q, a], i) => `<div class="pa-faq-item"><button class="pa-faq-q" aria-expanded="false" aria-controls="faq${i}${q.length}">${esc(q)}<span aria-hidden="true"></span></button><div class="pa-faq-a" id="faq${i}${q.length}" hidden><p>${esc(a)}</p></div></div>`).join('')}</div>`; }
  function bindFaq(root = document) { $$('.pa-faq-q', root).forEach(btn => { if (btn._b) return; btn._b = 1; btn.addEventListener('click', () => { const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', !open); btn.nextElementSibling.hidden = open; }); }); }

  /* ---------- wizard iscrizione ---------- */
  const CODES = { SOCIETA10: 0.10, PREMIUM20: 0.20 };
  function openRegister({ eventId, slotId } = {}) {
    const st = { step: 0, eventId: eventId || (nextOpen() || {}).id, slots: slotId ? [slotId] : [], who: 'genitore', athletes: [{ nome: '', cognome: '', nascita: '' }], society: '', fin: '', email: '', phone: '', shirt: 'M', parent: '', consent: false, cert: '', certExp: '', privacy: false, photo: true, code: '', pay: 'carta' };
    const STEPS = ['Fascia', 'Atleta', 'Documenti', 'Pagamento', 'Conferma'];
    const m = modal(`<div class="pa-wiz"><ol class="pa-steps">${STEPS.map((s, i) => `<li data-i="${i}"><span>${i + 1}</span>${s}</li>`).join('')}</ol><div class="pa-wiz-body"></div><div class="pa-wiz-foot"></div></div>`, { wide: true, label: 'Iscrizione' });
    const body = $('.pa-wiz-body', m.body), foot = $('.pa-wiz-foot', m.body);
    const ev = () => D.events.find(x => x.id === st.eventId);
    const selSlots = () => ev().slots.filter(s => st.slots.includes(s.id));
    const allFull = () => selSlots().length && selSlots().every(s => slotLeft(s) === 0);
    const count = () => st.who === 'societa' ? st.athletes.length : 1;
    function totals() {
      const open = selSlots().filter(s => slotLeft(s) > 0);
      const sub = open.reduce((n, s) => n + s.price, 0) * count();
      const pack = open.filter(s => s.type === 'atleti').length >= 2 ? sub * 0.15 : 0;
      const disc = CODES[st.code.toUpperCase()] ? (sub - pack) * CODES[st.code.toUpperCase()] : 0;
      return { sub, pack, disc, total: Math.max(0, sub - pack - disc) };
    }
    function age(n) { if (!n) return null; const b = new Date(n); let a = D.TODAY.getFullYear() - b.getFullYear(); if (D.TODAY < new Date(D.TODAY.getFullYear(), b.getMonth(), b.getDate())) a--; return a; }

    function render() {
      $$('.pa-steps li', m.body).forEach((li, i) => { li.classList.toggle('is-done', i < st.step); li.classList.toggle('is-on', i === st.step); });
      const e = ev();
      if (st.step === 0) {
        const opts = upcoming().filter(x => !['soon'].includes(eventInfo(x).status));
        body.innerHTML = `<h3 class="pa-h">Scegli tappa e fasce</h3>
          <label class="pa-field"><span>Tappa</span><select data-k="eventId">${opts.map(x => `<option value="${x.id}" ${x.id === st.eventId ? 'selected' : ''}>${esc(x.city)} · ${fmt.range(x)}</option>`).join('')}</select></label>
          <p class="pa-muted">Puoi selezionare più fasce. Da 2 fasce atleti in su lo sconto pacchetto del 15% è automatico.</p>
          <div class="pa-pick">${e.slots.map(s => { const left = slotLeft(s), c = cat(s.cat); return `<label class="pa-pick-item ${left === 0 ? 'is-full' : ''}"><input type="checkbox" value="${s.id}" ${st.slots.includes(s.id) ? 'checked' : ''}><span class="pa-pick-box"><b>${fmt.weekday(s.date).slice(0, 3)} ${s.start}–${s.end}</b><strong>${esc(c.label)}</strong><em>${esc(c.ages)}</em><small>${left === 0 ? 'Piena: lista d’attesa' : left + ' posti'} · ${eur(s.price)}</small></span></label>`; }).join('')}</div>`;
        $('[data-k="eventId"]', body).onchange = ev2 => { st.eventId = ev2.target.value; st.slots = []; render(); };
        $$('.pa-pick input', body).forEach(i => i.onchange = () => { st.slots = $$('.pa-pick input:checked', body).map(x => x.value); renderFoot(); });
      }
      if (st.step === 1) {
        const minors = st.athletes.some(a => age(a.nascita) !== null && age(a.nascita) < 18);
        body.innerHTML = `<h3 class="pa-h">Chi stai iscrivendo?</h3>
          <div class="pa-seg" role="radiogroup">${[['genitore', 'Sono un genitore'], ['atleta', 'Sono l’atleta'], ['societa', 'Iscrivo per una società']].map(([k, l]) => `<button type="button" role="radio" aria-checked="${st.who === k}" data-who="${k}">${l}</button>`).join('')}</div>
          <div class="pa-athletes">${st.athletes.map((a, i) => `<div class="pa-grid3" data-ath="${i}">
            <label class="pa-field"><span>Nome atleta</span><input data-a="nome" value="${esc(a.nome)}" autocomplete="off"></label>
            <label class="pa-field"><span>Cognome</span><input data-a="cognome" value="${esc(a.cognome)}"></label>
            <label class="pa-field"><span>Data di nascita</span><input type="date" data-a="nascita" value="${a.nascita}"></label>
            ${checkAge(a)}${st.who === 'societa' && st.athletes.length > 1 ? `<button type="button" class="pa-link" data-rm="${i}">Rimuovi</button>` : ''}</div>`).join('')}</div>
          ${st.who === 'societa' ? `<button type="button" class="pa-btn is-ghost is-sm" data-add>Aggiungi atleta</button>` : ''}
          <div class="pa-grid3">
            <label class="pa-field"><span>Società sportiva</span><input data-k="society" value="${esc(st.society)}" placeholder="Es. Nuoto Club Roma"></label>
            <label class="pa-field"><span>Tessera FIN (facoltativa)</span><input data-k="fin" value="${esc(st.fin)}" placeholder="Es. 123456"></label>
            <label class="pa-field"><span>Taglia t-shirt</span><select data-k="shirt">${['XS', 'S', 'M', 'L', 'XL'].map(x => `<option ${x === st.shirt ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
            <label class="pa-field"><span>Email</span><input type="email" data-k="email" value="${esc(st.email)}" placeholder="nome@email.it" required></label>
            <label class="pa-field"><span>Telefono</span><input type="tel" data-k="phone" value="${esc(st.phone)}" placeholder="333 000 0000"></label>
          </div>
          ${minors ? `<div class="pa-callout"><label class="pa-field"><span>Nome e cognome del genitore o tutore</span><input data-k="parent" value="${esc(st.parent)}"></label><label class="pa-check"><input type="checkbox" data-k="consent" ${st.consent ? 'checked' : ''}> Autorizzo la partecipazione del minore e accetto il regolamento</label></div>` : ''}`;
        $$('[data-who]', body).forEach(b => b.onclick = () => { st.who = b.dataset.who; if (st.who !== 'societa') st.athletes = st.athletes.slice(0, 1); render(); });
        $$('[data-ath]', body).forEach(row => $$('[data-a]', row).forEach(inp => inp.oninput = () => { st.athletes[+row.dataset.ath][inp.dataset.a] = inp.value; if (inp.type === 'date') render(); }));
        const add = $('[data-add]', body); if (add) add.onclick = () => { st.athletes.push({ nome: '', cognome: '', nascita: '' }); render(); };
        $$('[data-rm]', body).forEach(b => b.onclick = () => { st.athletes.splice(+b.dataset.rm, 1); render(); });
      }
      if (st.step === 2) {
        body.innerHTML = `<h3 class="pa-h">Documenti e consensi</h3>
          <label class="pa-drop"><input type="file" data-cert accept=".pdf,.jpg,.jpeg,.png"><span>${st.cert ? '<b>' + esc(st.cert) + '</b> caricato. Tocca per cambiarlo' : '<b>Carica il certificato medico</b><br>PDF o foto, massimo 10 MB. Puoi anche farlo dopo dall’area riservata.'}</span></label>
          <label class="pa-field is-half"><span>Scadenza certificato</span><input type="date" data-k="certExp" value="${st.certExp}"></label>
          <label class="pa-check"><input type="checkbox" data-k="photo" ${st.photo ? 'checked' : ''}> Autorizzo foto e video durante l’evento (galleria riservata ai partecipanti)</label>
          <label class="pa-check"><input type="checkbox" data-k="privacy" ${st.privacy ? 'checked' : ''}> Ho letto l’informativa privacy e il regolamento dell’evento</label>
          ${st.certExp && d(st.certExp) < ev().startDate ? `<p class="pa-warn">Il certificato scade prima dell’evento. Rinnovalo e caricalo entro 7 giorni dalla tappa.</p>` : ''}`;
        $('[data-cert]', body).onchange = x => { st.cert = x.target.files[0] ? x.target.files[0].name : ''; render(); };
      }
      if (st.step === 3) {
        const t = totals(), wl = allFull();
        body.innerHTML = `<h3 class="pa-h">${wl ? 'Conferma la lista d’attesa' : 'Riepilogo e pagamento'}</h3>
          <div class="pa-summary">
            <p><b>${esc(e.city)}</b> · ${fmt.range(e)}</p>
            <ul>${selSlots().map(s => `<li><span>${fmt.weekday(s.date).slice(0, 3)} ${s.start} · ${esc(cat(s.cat).label)}${slotLeft(s) === 0 ? ' (lista d’attesa)' : ''}</span><span>${slotLeft(s) === 0 ? '—' : eur(s.price * count())}</span></li>`).join('')}</ul>
            ${count() > 1 ? `<p class="pa-muted">${count()} atleti</p>` : ''}
            ${t.pack ? `<p class="pa-row"><span>Sconto pacchetto 15%</span><span>− ${eur(t.pack)}</span></p>` : ''}
            ${t.disc ? `<p class="pa-row"><span>Codice ${esc(st.code.toUpperCase())}</span><span>− ${eur(t.disc)}</span></p>` : ''}
            <p class="pa-row pa-total"><span>Totale</span><span>${eur(t.total)}</span></p>
          </div>
          ${wl ? `<p>Non paghi nulla ora. Se si libera un posto ti scriviamo a <b>${esc(st.email)}</b> e hai 24 ore per confermare.</p>` : `
          <div class="pa-grid3"><label class="pa-field"><span>Codice sconto società</span><input data-k="code" value="${esc(st.code)}" placeholder="Prova SOCIETA10"></label></div>
          <div class="pa-seg" role="radiogroup">${[['carta', 'Carta'], ['paypal', 'PayPal'], ['satispay', 'Satispay'], ['bonifico', 'Bonifico']].map(([k, l]) => `<button type="button" role="radio" aria-checked="${st.pay === k}" data-pay="${k}">${l}</button>`).join('')}</div>
          ${st.pay === 'carta' ? `<div class="pa-grid3"><label class="pa-field is-wide"><span>Numero carta</span><input inputmode="numeric" placeholder="4242 4242 4242 4242" data-card></label><label class="pa-field"><span>Scadenza</span><input placeholder="MM/AA"></label><label class="pa-field"><span>CVC</span><input placeholder="123"></label></div><p class="pa-muted">Demo: nessun addebito reale.</p>` : st.pay === 'bonifico' ? `<p class="pa-muted">Riceverai IBAN e causale via email. Il posto resta bloccato 48 ore.</p>` : `<p class="pa-muted">Verrai reindirizzato a ${st.pay === 'paypal' ? 'PayPal' : 'Satispay'} per completare il pagamento.</p>`}`}`;
        const code = $('[data-k="code"]', body); if (code) code.onchange = () => { st.code = code.value.trim(); if (st.code && !CODES[st.code.toUpperCase()]) toast('Codice non valido. Controlla maiuscole e spazi'); render(); };
        $$('[data-pay]', body).forEach(b => b.onclick = () => { st.pay = b.dataset.pay; render(); });
      }
      if (st.step === 4) {
        const r = st.result;
        body.innerHTML = `<div class="pa-done">
          <div class="pa-done-qr">${qr(r.code, 180)}<b>${r.code}</b></div>
          <div><h3 class="pa-h">${r.waitlist ? 'Sei in lista d’attesa' : 'Iscrizione confermata'}</h3>
          <p>${r.waitlist ? 'Ti avvisiamo appena si libera un posto.' : `Ti aspettiamo a <b>${esc(e.city)}</b>, ${esc(e.venue)}. Mostra questo QR al check-in, 30 minuti prima della fascia.`}</p>
          <p class="pa-muted">Riepilogo inviato a ${esc(st.email)}.</p>
          <div class="pa-ev-actions"><button class="pa-btn" data-account>Vai all’area riservata</button><button class="pa-btn is-ghost" data-ics>Aggiungi al calendario</button><a class="pa-btn is-ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Ci vediamo a Premium Academy ' + e.city + ' (' + fmt.range(e) + ')')}">Condividi su WhatsApp</a></div></div></div>`;
        $('[data-account]', body).onclick = () => { m.close(); openAccount(); };
        $('[data-ics]', body).onclick = () => ics(e, selSlots());
      }
      $$('[data-k]', body).forEach(inp => { if (inp.dataset.k === 'eventId' || inp.dataset.k === 'code') return; const h = () => { st[inp.dataset.k] = inp.type === 'checkbox' ? inp.checked : inp.value; if (inp.type === 'checkbox' || inp.type === 'date') render(); }; inp.addEventListener(inp.type === 'checkbox' || inp.tagName === 'SELECT' || inp.type === 'date' ? 'change' : 'input', h); });
      renderFoot();
    }
    function checkAge(a) {
      const y = age(a.nascita); if (y === null || !st.slots.length) return '';
      const bad = selSlots().filter(s => { const c = cat(s.cat); return s.type === 'atleti' && (y < c.min || y > c.max); });
      return bad.length ? `<p class="pa-warn is-row">${y} anni: fuori età per ${bad.map(s => cat(s.cat).label).join(', ')}. Torna al passo 1 per cambiare fascia.</p>` : `<p class="pa-ok is-row">${y} anni: categoria corretta</p>`;
    }
    function valid() {
      if (st.step === 0) return st.slots.length ? '' : 'Seleziona almeno una fascia';
      if (st.step === 1) {
        if (st.athletes.some(a => !a.nome || !a.cognome || !a.nascita)) return 'Completa nome, cognome e data di nascita';
        if (!/^\S+@\S+\.\S+$/.test(st.email)) return 'Inserisci un’email valida';
        if (st.athletes.some(a => { const y = age(a.nascita); return selSlots().some(s => s.type === 'atleti' && (y < cat(s.cat).min || y > cat(s.cat).max)); })) return 'Età fuori categoria per una fascia: torna indietro e cambia fascia';
        if (st.athletes.some(a => age(a.nascita) < 18) && (!st.parent || !st.consent)) return 'Serve il nome del genitore e il consenso';
      }
      if (st.step === 2 && !st.privacy) return 'Accetta informativa e regolamento per continuare';
      return '';
    }
    function renderFoot() {
      if (st.step === 4) { foot.innerHTML = ''; return; }
      const t = totals();
      const label = st.step === 3 ? (allFull() ? 'Conferma lista d’attesa' : `Paga ${eur(t.total)}`) : 'Continua';
      foot.innerHTML = `${st.step > 0 ? '<button class="pa-btn is-ghost" data-back>Indietro</button>' : '<span></span>'}<div class="pa-foot-r">${st.slots.length ? `<span class="pa-foot-total">${selSlots().length} ${selSlots().length === 1 ? 'fascia' : 'fasce'} · ${eur(t.total)}</span>` : ''}<button class="pa-btn" data-next>${label}</button></div>`;
      const back = $('[data-back]', foot); if (back) back.onclick = () => { st.step--; render(); };
      $('[data-next]', foot).onclick = async () => {
        const err = valid(); if (err) { toast(err); return; }
        if (st.step === 3) {
          const btn = $('[data-next]', foot); btn.disabled = true; btn.textContent = 'Elaborazione…';
          await new Promise(r => setTimeout(r, 1100));
          const code = 'PA-' + Math.random().toString(36).slice(2, 6).toUpperCase();
          const wl = allFull();
          st.result = { code, eventId: st.eventId, slotIds: st.slots.filter(id => wl || slotLeft(ev().slots.find(s => s.id === id)) > 0), athlete: st.athletes.map(a => a.nome + ' ' + a.cognome).join(', '), count: count(), email: st.email, total: t.total, status: wl ? 'lista d’attesa' : 'confermata', created: new Date().toISOString().slice(0, 10), waitlist: wl, cert: !!st.cert };
          store.add(st.result);
          document.dispatchEvent(new CustomEvent('pa:registered', { detail: st.result }));
        }
        st.step++; render(); body.scrollTop = 0; m.body.parentElement.scrollTop = 0;
      };
    }
    render();
  }

  function ics(e, slots) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Premium Academy//IT'];
    slots.forEach(s => { const dt = s.date.replace(/-/g, ''); lines.push('BEGIN:VEVENT', 'UID:' + s.id + '@premiumacademy', `DTSTART:${dt}T${s.start.replace(':', '')}00`, `DTEND:${dt}T${s.end.replace(':', '')}00`, `SUMMARY:Premium Academy ${e.city} · ${cat(s.cat).label}`, `LOCATION:${e.venue}, ${e.address}`, 'END:VEVENT'); });
    lines.push('END:VCALENDAR');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' })); a.download = 'premium-academy-' + e.id + '.ics'; a.click();
  }

  /* ---------- area riservata ---------- */
  function openAccount(tab = 'iscrizioni') {
    const regs = store.all();
    const m = modal(`<header class="pa-ev-head is-compact"><h2 class="pa-ev-title is-sm">La tua area</h2><p class="pa-ev-meta">Account demo · ${esc((regs[0] || {}).email || 'demo@premiumacademy.it')}</p></header>
      <nav class="pa-tabs" role="tablist">${[['iscrizioni', 'Iscrizioni'], ['documenti', 'Documenti'], ['media', 'Foto e video']].map(([k, l]) => `<button role="tab" data-tab="${k}" aria-selected="${k === tab}">${l}</button>`).join('')}</nav>
      <section data-panel="iscrizioni">${regs.length ? `<ul class="pa-regs">${regs.map(r => { const e = D.events.find(x => x.id === r.eventId); const p = eventInfo(e).status === 'past'; return `<li class="pa-reg">${qr(r.code, 96)}<div><b>${esc(e.city)}</b> <span class="pa-badge ${p ? 'is-past' : r.waitlist ? 'is-last' : 'is-open'}">${p ? 'Completata' : esc(r.status)}</span><p>${fmt.range(e)} · ${esc(r.athlete)}</p><p class="pa-muted">${r.slotIds.map(id => { const s = e.slots.find(x => x.id === id); return s ? fmt.weekday(s.date).slice(0, 3) + ' ' + s.start + ' ' + cat(s.cat).label : ''; }).join(' · ')} · codice ${r.code}</p></div><div class="pa-reg-cta">${p ? '<button class="pa-btn is-sm" data-cert-dl>Attestato</button>' : '<button class="pa-btn is-sm is-ghost" data-open="' + e.id + '">Programma</button>'}</div></li>`; }).join('')}</ul>` : `<div class="pa-empty"><p>Nessuna iscrizione ancora.</p><button class="pa-btn" data-new>Scegli una tappa</button></div>`}</section>
      <section data-panel="documenti" hidden><ul class="pa-docs">${regs.map(r => `<li><span>Ricevuta ${r.code}</span><button class="pa-link" data-doc>Scarica PDF</button></li><li><span>Certificato medico</span>${r.cert || r.status === 'completata' ? '<span class="pa-ok">Verificato</span>' : '<label class="pa-link">Carica ora<input type="file" hidden data-up></label>'}</li>`).join('')}</ul></section>
      <section data-panel="media" hidden><p class="pa-muted">Pescara, 12–13 settembre 2026 · 48 foto · 1 video analisi</p><div class="pa-media">${Array.from({ length: 8 }, (_, i) => `<figure>${photo(i * 37, i === 0 ? 'Video analisi: partenza' : '', i % 3)}</figure>`).join('')}</div></section>`, { wide: true, label: 'Area riservata' });
    const b = m.body;
    $$('[data-tab]', b).forEach(t => t.addEventListener('click', () => { $$('[data-tab]', b).forEach(x => x.setAttribute('aria-selected', x === t)); $$('[data-panel]', b).forEach(p => p.hidden = p.dataset.panel !== t.dataset.tab); }));
    $(`[data-tab="${tab}"]`, b).click();
    b.addEventListener('click', ev => { const t = ev.target.closest('button'); if (!t) return; if (t.dataset.open) { m.close(); setTimeout(() => openEvent(t.dataset.open), 260); } if (t.dataset.new !== undefined) { m.close(); openRegister(); } if (t.dataset.certDl !== undefined || t.dataset.doc !== undefined) toast('Demo: il PDF verrà generato dal backend'); });
    $$('[data-up]', b).forEach(i => i.onchange = () => toast('Certificato caricato. Lo verifichiamo entro 24 ore'));
  }

  /* ---------- newsletter + deep link ---------- */
  function bindNewsletter(form) { if (!form) return; form.addEventListener('submit', e => { e.preventDefault(); const i = form.querySelector('input[type=email]'); if (!i || !/^\S+@\S+\.\S+$/.test(i.value)) { toast('Inserisci un’email valida'); return; } i.value = ''; toast('Iscritto. Ti scriviamo quando apre la prossima tappa'); }); }
  function bindGlobal() {
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-pa]'); if (!t) return; e.preventDefault();
      const a = t.dataset.pa;
      if (a === 'event') openEvent(t.dataset.id, t.dataset.tab);
      if (a === 'register') openRegister({ eventId: t.dataset.id, slotId: t.dataset.slot });
      if (a === 'account') openAccount();
    });
    const h = location.hash.match(/evento=([\w-]+)/); if (h) setTimeout(() => openEvent(h[1]), 300);
    bindFaq(); $$('form[data-newsletter]').forEach(bindNewsletter);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', bindGlobal) : bindGlobal();

  window.PA = { D, IMG, $, $$, esc, fmt, eur, cat, coach, eventInfo, slotLeft, upcoming, past, nextOpen, regions, months, filter, countdown, pad, italyMap, bindMap, qr, avatar, photo, toast, modal, openEvent, openRegister, openAccount, faqHtml, bindFaq, store, share };
})();
