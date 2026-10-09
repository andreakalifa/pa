/* =========================================================================
   PREMIUM ACADEMY EXPERIENCE - componenti condivisi

   Mappa d'Italia, scheda tappa, percorso di iscrizione, area riservata,
   modale accessibile, cronometro, QR.

   Nessuna funzione qui dentro legge PA_DATA per i posti disponibili:
   quelli arrivano sempre da PA_API, che oggi risponde dalla memoria e
   domani risponderà da Django.
   ========================================================================= */
(function () {
  'use strict';

  const D = window.PA_DATA;
  const API = window.PA_API;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const MON3 = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  const DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

  const cap1 = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const cat = id => D.categories.find(c => c.id === id);
  const coach = id => D.coaches.find(c => c.id === id);
  const eur = n => '€ ' + Number(n).toLocaleString('it-IT', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const pad = n => String(n).padStart(2, '0');
  const toDate = x => x instanceof Date ? x : new Date(x + 'T09:00:00');

  const fmt = {
    day: x => toDate(x).getDate(),
    mon3: x => MON3[toDate(x).getMonth()],
    month: x => MONTHS[toDate(x).getMonth()],
    weekday: x => DAYS[toDate(x).getDay()],
    wd3: x => DAYS[toDate(x).getDay()].slice(0, 3),
    short: x => toDate(x).getDate() + ' ' + MONTHS[toDate(x).getMonth()],
    dayLong: x => { const d = toDate(x); return cap1(DAYS[d.getDay()]) + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; },
    range(e) {
      const a = toDate(e.start), b = new Date(a); b.setDate(b.getDate() + 1);
      return a.getMonth() === b.getMonth()
        ? `${a.getDate()}-${b.getDate()} ${MONTHS[a.getMonth()]} ${a.getFullYear()}`
        : `${a.getDate()} ${MONTHS[a.getMonth()]} - ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
    },
    rangeShort(e) { const a = toDate(e.start), b = new Date(a); b.setDate(b.getDate() + 1); return `${a.getDate()}-${b.getDate()} ${MON3[a.getMonth()]}`; }
  };

  /* ---------- icone (Phosphor Bold, viewBox 256) ---------- */
  const ICON = {
    x: '<path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"/>',
    arrow: '<path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z"/>',
    timer: '<path d="M128,44a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,44Zm0,168a72,72,0,1,1,72-72A72.08,72.08,0,0,1,128,212ZM164.49,99.51a12,12,0,0,1,0,17l-28,28a12,12,0,0,1-17-17l28-28A12,12,0,0,1,164.49,99.51ZM92,16A12,12,0,0,1,104,4h48a12,12,0,0,1,0,24H104A12,12,0,0,1,92,16Z"/>',
    warning: '<path d="M240.26,186.1,152.81,34.23h0a28.74,28.74,0,0,0-49.62,0L15.74,186.1a27.45,27.45,0,0,0,0,27.71A28.31,28.31,0,0,0,40.55,228h174.9a28.31,28.31,0,0,0,24.79-14.19A27.45,27.45,0,0,0,240.26,186.1Zm-20.8,15.7a4.46,4.46,0,0,1-4,2.2H40.55a4.46,4.46,0,0,1-4-2.2,3.56,3.56,0,0,1,0-3.73L124,46.2a4.77,4.77,0,0,1,8,0l87.44,151.87A3.56,3.56,0,0,1,219.46,201.8ZM116,136V104a12,12,0,0,1,24,0v32a12,12,0,0,1-24,0Zm28,40a16,16,0,1,1-16-16A16,16,0,0,1,144,176Z"/>',
    check: '<path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"/>',
    whatsapp: '<path d="M187.3,159.06A36.09,36.09,0,0,1,152,188a84.09,84.09,0,0,1-84-84A36.09,36.09,0,0,1,96.94,68.7,12,12,0,0,1,110,75.1l11.48,23a12,12,0,0,1-.75,12l-8.52,12.78a44.56,44.56,0,0,0,20.91,20.91l12.78-8.52a12,12,0,0,1,12-.75l23,11.48A12,12,0,0,1,187.3,159.06ZM236,128A108,108,0,0,1,78.77,224.15L46.34,235A20,20,0,0,1,21,209.66l10.81-32.43A108,108,0,1,1,236,128Zm-24,0A84,84,0,1,0,55.27,170.06a12,12,0,0,1,1,9.81l-9.93,29.79,29.79-9.93a12.1,12.1,0,0,1,3.8-.62,12,12,0,0,1,6,1.62A84,84,0,0,0,212,128Z"/>',
    instagram: '<path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,72a24,24,0,1,1,24-24A24,24,0,0,1,128,152ZM176,20H80A60.07,60.07,0,0,0,20,80v96a60.07,60.07,0,0,0,60,60h96a60.07,60.07,0,0,0,60-60V80A60.07,60.07,0,0,0,176,20Zm36,156a36,36,0,0,1-36,36H80a36,36,0,0,1-36-36V80A36,36,0,0,1,80,44h96a36,36,0,0,1,36,36ZM196,76a16,16,0,1,1-16-16A16,16,0,0,1,196,76Z"/>',
    facebook: '<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm12,191.13V156h20a12,12,0,0,0,0-24H140V112a12,12,0,0,1,12-12h16a12,12,0,0,0,0-24H152a36,36,0,0,0-36,36v20H96a12,12,0,0,0,0,24h20v55.13a84,84,0,1,1,24,0Z"/>',
    contrast: '<path d="M204.37,51.6A108.08,108.08,0,1,0,236,128,108.09,108.09,0,0,0,204.37,51.6ZM176,197a83.43,83.43,0,0,1-16,8.75V113l16-16ZM68.6,68.58A84.08,84.08,0,0,1,178.3,60.7L60.72,178.33A84.08,84.08,0,0,1,68.6,68.58ZM96,177v28.69A83.63,83.63,0,0,1,77.7,195.3Zm24,34.62V153l16-16v74.64A84.68,84.68,0,0,1,120,211.62Zm80-40.27V84.65a84.24,84.24,0,0,1,0,86.7Z"/>'
  };
  const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 256 256" width="20" height="20" fill="currentColor" aria-hidden="true">${ICON[n] || ''}</svg>`;

  /* ---------- cache degli eventi (popolata dall'API) ---------- */
  let EVENTS = [];
  const byId = id => EVENTS.find(e => e.id === id);
  const slotById = id => { for (const e of EVENTS) { const s = e.slots.find(x => x.id === id); if (s) return s; } return null; };
  const eventOfSlot = id => EVENTS.find(e => e.slots.some(s => s.id === id));

  async function load(force) {
    if (EVENTS.length && !force) return EVENTS;
    EVENTS = await API.listEvents();
    return EVENTS;
  }
  async function refresh(id) {
    const fresh = await API.getEvent(id);
    const i = EVENTS.findIndex(e => e.id === id);
    if (i >= 0) EVENTS[i] = fresh; else EVENTS.push(fresh);
    return fresh;
  }

  function eventInfo(e) {
    const ath = e.slots.filter(s => s.type === 'atleti');
    const cap = ath.reduce((n, s) => n + s.cap, 0);
    const left = ath.reduce((n, s) => n + (s.left != null ? s.left : s.cap - s.taken), 0);
    let status = 'open', label = 'Iscrizioni aperte';
    if (e.endDate < D.TODAY) { status = 'past'; label = 'Conclusa'; }
    else if (e.opensOn && toDate(e.opensOn) > D.TODAY) { status = 'soon'; label = 'Apre il ' + fmt.short(e.opensOn); }
    else if (left === 0) { status = 'soldout'; label = 'Sold out, lista d’attesa'; }
    else if (left / cap <= 0.15) { status = 'last'; label = 'Ultimi ' + left + ' posti'; }
    return { cap, left, status, label, pct: Math.round((1 - left / cap) * 100), priceFrom: Math.min(...ath.map(s => s.price)) };
  }
  const slotLeft = s => (s.left != null ? s.left : Math.max(0, s.cap - s.taken));
  const upcoming = () => EVENTS.filter(e => e.endDate >= D.TODAY).sort((a, b) => a.startDate - b.startDate);
  const past = () => EVENTS.filter(e => e.endDate < D.TODAY).sort((a, b) => b.startDate - a.startDate);
  const nextOpen = () => upcoming().find(e => ['open', 'last'].includes(eventInfo(e).status)) || upcoming()[0];
  const regions = () => [...new Set(upcoming().map(e => e.region))].sort();
  const months = () => [...new Map(upcoming().map(e => [e.start.slice(0, 7), { key: e.start.slice(0, 7), label: cap1(fmt.month(e.start)) + ' ' + e.startDate.getFullYear() }])).values()];
  function filter({ region = '', month = '', category = '', q = '' } = {}) {
    return upcoming().filter(e =>
      (!region || e.region === region) && (!month || e.start.startsWith(month)) &&
      (!category || e.slots.some(s => s.cat === category)) &&
      (!q || (e.city + ' ' + e.venue + ' ' + e.region).toLowerCase().includes(q.toLowerCase())));
  }
  const ageOf = n => {
    if (!n) return null;
    const b = new Date(n); if (isNaN(b)) return null;
    let a = D.TODAY.getFullYear() - b.getFullYear();
    if (D.TODAY < new Date(D.TODAY.getFullYear(), b.getMonth(), b.getDate())) a--;
    return a;
  };
  const fitsAge = (slot, age) => { const c = cat(slot.cat); return age != null && age >= c.min && age <= c.max; };

  /* ---------- cronometro ---------- */
  const START = Date.now();
  function countdown(target, cb, realClock) {
    const t = target instanceof Date ? target.getTime() : toDate(target).getTime();
    const tick = () => {
      // le tappe usano l'orologio della demo, i blocchi sul posto quello vero
      const now = realClock ? Date.now() : D.TODAY.getTime() + (Date.now() - START);
      let s = Math.max(0, Math.floor((t - now) / 1000));
      cb({ days: Math.floor(s / 86400), hours: Math.floor(s % 86400 / 3600), minutes: Math.floor(s % 3600 / 60), seconds: s % 60, over: s === 0 });
    };
    tick();
    const h = setInterval(tick, 1000);
    return () => clearInterval(h);
  }
  const clockHtml = v => `<span><b>${v.days}</b>giorni</span><span><b>${pad(v.hours)}</b>ore</span><span><b>${pad(v.minutes)}</b>min</span><span><b>${pad(v.seconds)}</b>sec</span>`;

  /* ---------- mappa d'Italia ---------- */
  const SHAPES = {
    main: [[7.5, 43.8], [7.0, 45.3], [6.9, 45.9], [7.9, 45.95], [8.4, 46.45], [9.0, 46.5], [9.5, 46.3], [10.2, 46.6], [10.5, 46.9], [11.2, 47.05], [12.2, 47.1], [12.7, 46.6], [13.7, 46.5], [13.5, 45.9], [13.8, 45.6], [13.1, 45.75], [12.3, 45.4], [12.5, 44.9], [12.3, 44.4], [12.6, 44.05], [13.5, 43.6], [14.2, 42.45], [15.0, 42.0], [16.1, 41.9], [15.9, 41.6], [16.9, 41.1], [17.95, 40.65], [18.5, 40.15], [18.35, 39.8], [17.99, 40.05], [17.2, 40.45], [16.6, 40.1], [16.55, 39.65], [17.1, 39.1], [16.5, 38.7], [16.0, 37.95], [15.65, 38.1], [15.7, 38.25], [15.9, 38.7], [16.15, 38.73], [16.0, 39.35], [15.7, 40.0], [14.75, 40.65], [14.5, 40.6], [14.25, 40.85], [13.55, 41.2], [12.6, 41.45], [12.2, 41.75], [11.8, 42.1], [11.1, 42.4], [10.5, 42.95], [10.3, 43.55], [9.85, 44.1], [8.9, 44.4], [8.45, 44.3]],
    sicily: [[15.55, 38.25], [15.2, 38.25], [14.0, 38.02], [13.35, 38.15], [12.5, 38.05], [12.42, 37.8], [12.6, 37.65], [13.1, 37.5], [13.6, 37.25], [14.25, 37.05], [15.1, 36.68], [15.3, 37.05], [15.1, 37.5], [15.3, 37.85]],
    sardinia: [[9.2, 41.25], [9.6, 41.0], [9.55, 40.9], [9.8, 40.5], [9.7, 40.0], [9.65, 39.5], [9.55, 39.15], [9.1, 39.2], [8.9, 38.9], [8.4, 39.0], [8.45, 39.45], [8.5, 39.9], [8.4, 40.3], [8.2, 40.6], [8.2, 40.95], [8.6, 40.85]]
  };
  const proj = (lon, lat) => [(lon - 6.5) * 37.2 + 10, (47.4 - lat) * 50 + 10];
  function italyMap({ events = upcoming(), pinR = 7 } = {}) {
    const polys = Object.values(SHAPES).map(p => p.map(([lo, la]) => proj(lo, la)));
    const land = polys.map(p => `<path class="pa-map-land" d="M${p.map(q => q.map(v => v.toFixed(1)).join(',')).join('L')}Z"/>`).join('');
    const pins = events.map(e => {
      const [x, y] = proj(e.lon, e.lat), st = eventInfo(e).status;
      return `<g class="pa-pin is-${st}" data-event="${esc(e.id)}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">`
        + `<circle class="pa-pin-pulse" r="${pinR * 2}"/>`
        + `<circle class="pa-pin-hit" r="40"/>`
        + `<circle class="pa-pin-dot" r="${pinR}"/>`
        + `<text class="pa-pin-label" x="${pinR + 7}" y="4">${esc(e.city)}</text></g>`;
    }).join('');
    return `<svg class="pa-map" viewBox="0 0 470 560" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Le tappe sulla mappa d'Italia">${land}${pins}</svg>`;
  }
  /* i pin diventano bottoni veri: raggiungibili con Tab, azionabili con Invio */
  function bindMap(root, onPin) {
    $$('.pa-pin', root).forEach(p => {
      const e = byId(p.dataset.event); if (!e) return;
      p.setAttribute('role', 'button');
      p.setAttribute('tabindex', '0');
      p.setAttribute('aria-label', `${e.city}, ${fmt.range(e)}. ${eventInfo(e).label}`);
      const go = () => (onPin || openEvent)(p.dataset.event);
      p.addEventListener('click', go);
      p.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
    });
  }

  /* ---------- QR ---------- *
     Oggi è un disegno deterministico ricavato dal codice: serve a far vedere
     com'è fatto il pass. Con il backend diventerà un token firmato, così il
     lettore al check-in potrà verificarlo anche senza rete.                  */
  function qr(text, size = 150) {
    const n = 25, cell = size / n;
    let h = 0; for (const c of String(text)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    const finder = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
    let r = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { if (finder(x, y)) continue; if (rnd() > .52) r += `<rect x="${(x * cell).toFixed(2)}" y="${(y * cell).toFixed(2)}" width="${(cell + .3).toFixed(2)}" height="${(cell + .3).toFixed(2)}"/>`; }
    const fp = (x, y) => `<rect x="${x * cell}" y="${y * cell}" width="${7 * cell}" height="${7 * cell}"/><rect x="${(x + 1) * cell}" y="${(y + 1) * cell}" width="${5 * cell}" height="${5 * cell}" fill="#fff"/><rect x="${(x + 2) * cell}" y="${(y + 2) * cell}" width="${3 * cell}" height="${3 * cell}"/>`;
    return `<svg class="qr" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Codice QR del pass ${esc(text)}"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#0b1114">${r}${fp(0, 0)}${fp(n - 7, 0)}${fp(0, n - 7)}</g></svg>`;
  }

  /* ---------- segnaposto grafici ---------- */
  function avatar(c, cls = '') {
    if (c.img) return `<img class="pa-avatar ${cls}" src="assets/img/${c.img}" alt="${esc(c.name)}" width="300" height="400" loading="lazy" decoding="async">`;
    const ini = c.name.split(' ').map(w => w[0]).join('');
    return `<svg class="pa-avatar ${cls}" viewBox="0 0 300 400" role="img" aria-label="${esc(c.name)}, fotografia da inserire"><rect width="300" height="400" fill="var(--raised)"/><g stroke="var(--red)" stroke-width="2" opacity=".55">${[0, 1, 2, 3, 4].map(i => `<line x1="0" y1="${40 + i * 80}" x2="300" y2="${40 + i * 80}" stroke-dasharray="16 10"/>`).join('')}</g><circle cx="150" cy="158" r="54" fill="var(--ph-figure)"/><path d="M56 400c6-74 46-112 94-112s88 38 94 112z" fill="var(--ph-figure)"/><text x="150" y="174" text-anchor="middle" font-family="Archivo PA, sans-serif" font-weight="800" font-size="42" fill="var(--bg)">${esc(ini)}</text></svg>`;
  }
  function photo(seed, label = '') {
    const id = 'g' + Math.random().toString(36).slice(2, 7);
    const lanes = [1, 2, 3, 4, 5].map(i => `<line x1="0" y1="${i * 66}" x2="600" y2="${i * 66}" stroke="var(--bg)" stroke-width="2" stroke-dasharray="20 12" opacity=".45"/>`).join('');
    return `<svg class="pa-photo" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label || 'Fotografia della tappa, da inserire')}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--ph-figure)"/><stop offset="1" stop-color="var(--raised)"/></linearGradient></defs><rect width="600" height="400" fill="url(#${id})"/>${lanes}<path d="M0 ${250 + seed % 40} Q150 ${210 + seed % 30} 300 250 T600 240" stroke="var(--red)" opacity=".55" stroke-width="3" fill="none"/>${label ? `<text x="24" y="372" font-family="Archivo PA, sans-serif" font-size="17" font-weight="600" fill="var(--bg)">${esc(label)}</text>` : ''}</svg>`;
  }

  /* ---------- toast ----------
     L'elemento nasce vuoto al caricamento della pagina: una regione live
     inserita già piena non verrebbe annunciata dallo screen reader.         */
  let toastEl = null, toastTimer = null;
  function initToast() {
    if (toastEl) return;
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  function toast(msg, bad) {
    initToast();
    toastEl.textContent = msg;
    toastEl.classList.toggle('is-bad', !!bad);
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 4200);
  }

  /* ---------- modale accessibile ----------
     Trattiene davvero il focus, rende inerte il resto della pagina e può
     chiedere conferma prima di chiudere.                                    */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  let openModals = 0;

  function modal(html, opts = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'pa-modal';
    wrap.innerHTML = `<div class="pa-modal-back" data-close></div>`
      + `<div class="pa-modal-panel ${opts.wide ? 'is-wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(opts.label || 'Finestra')}" tabindex="-1">`
      + `<button class="pa-modal-x" data-close aria-label="Chiudi">${icon('x')}</button>`
      + `<div class="pa-modal-body">${html}</div></div>`;
    document.body.appendChild(wrap);
    const panel = $('.pa-modal-panel', wrap);
    const body = $('.pa-modal-body', wrap);
    const opener = document.activeElement;

    const outside = Array.from(document.body.children).filter(n => n !== wrap && n.tagName !== 'SCRIPT');
    if (openModals === 0) outside.forEach(n => { n.inert = true; n.setAttribute('aria-hidden', 'true'); });
    openModals++;
    document.documentElement.classList.add('pa-lock');
    requestAnimationFrame(() => { wrap.classList.add('is-open'); panel.focus(); });

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); requestClose(); return; }
      if (e.key !== 'Tab') return;
      const f = $$(FOCUSABLE, panel).filter(n => n.offsetParent !== null || n === document.activeElement);
      if (!f.length) { e.preventDefault(); panel.focus(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    function onFocusIn(e) { if (!wrap.contains(e.target)) { e.stopPropagation(); panel.focus(); } }
    wrap.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocusIn, true);
    wrap.addEventListener('click', e => { if (e.target.closest('[data-close]')) requestClose(); });

    function requestClose() {
      if (typeof opts.confirmClose === 'function' && opts.confirmClose()) { showLeave(); return; }
      close();
    }
    function showLeave() {
      const prev = body.innerHTML;
      body.innerHTML = `<div class="pa-leave"><h3>Esci dall’iscrizione?</h3>`
        + `<p>${esc(opts.leaveText || 'Quello che hai compilato resta salvato su questo dispositivo: puoi riprendere più tardi da dove eri.')}</p>`
        + `<div class="pa-leave-act"><button class="btn" data-stay>Riprendi</button><button class="btn ghost" data-leave>Esci</button></div></div>`;
      $('[data-stay]', body).focus();
      $('[data-stay]', body).onclick = () => { body.innerHTML = prev; if (opts.onRestore) opts.onRestore(body); };
      $('[data-leave]', body).onclick = () => close();
    }
    function close() {
      wrap.classList.remove('is-open');
      wrap.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocusIn, true);
      if (opts.onClose) opts.onClose();
      setTimeout(() => {
        wrap.remove();
        openModals = Math.max(0, openModals - 1);
        if (openModals === 0) {
          outside.forEach(n => { n.inert = false; n.removeAttribute('aria-hidden'); });
          document.documentElement.classList.remove('pa-lock');
        }
        if (opener && opener.focus) opener.focus();
      }, 260);
    }
    return { el: wrap, panel, body, close, requestClose };
  }

  /* ---------- schede (widget tab completo) ---------- */
  function bindTabs(root) {
    const list = $('[role="tablist"]', root); if (!list) return;
    const tabs = $$('[role="tab"]', list);
    const show = t => {
      tabs.forEach(x => { x.setAttribute('aria-selected', String(x === t)); x.tabIndex = x === t ? 0 : -1; });
      $$('[role="tabpanel"]', root).forEach(p => { p.hidden = p.id !== t.getAttribute('aria-controls'); });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowLeft: -1, Home: 'f', End: 'l' }[e.key];
        if (!k) return; e.preventDefault();
        const n = k === 'f' ? tabs[0] : k === 'l' ? tabs[tabs.length - 1] : tabs[(i + k + tabs.length) % tabs.length];
        n.focus(); show(n);
      });
    });
    show(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  }

  /* ---------- FAQ ---------- */
  function faqHtml(list = D.faq, idPrefix = 'faq') {
    return `<div class="faq">${list.map(([q, a], i) => {
      const id = `${idPrefix}-${i}`;
      return `<div class="faq-item"><h3 style="margin:0"><button class="faq-q" aria-expanded="false" aria-controls="${id}">${esc(q)}<i aria-hidden="true"></i></button></h3>`
        + `<div class="faq-a" id="${id}" hidden><p>${esc(a)}</p></div></div>`;
    }).join('')}</div>`;
  }
  function bindFaq(root = document) {
    $$('.faq-q', root).forEach(b => {
      if (b.dataset.b) return; b.dataset.b = '1';
      b.addEventListener('click', () => {
        const open = b.getAttribute('aria-expanded') === 'true';
        b.setAttribute('aria-expanded', String(!open));
        document.getElementById(b.getAttribute('aria-controls')).hidden = open;
      });
    });
  }

  /* =======================================================================
     SCHEDA TAPPA
     ======================================================================= */
  async function openEvent(id, tab = 'programma') {
    const m = modal(`<div class="skel" style="height:220px"></div><div class="skel skel-slot"></div><div class="skel skel-slot"></div>`,
      { wide: true, label: 'Dettaglio della tappa' });
    let e;
    try { e = await refresh(id); }
    catch (err) {
      m.body.innerHTML = `<h2 class="pa-h">Non riesco a caricare la tappa</h2><p class="pa-sub">${esc(err.message)}</p><button class="btn" data-retry>Riprova</button>`;
      $('[data-retry]', m.body).onclick = () => { m.close(); setTimeout(() => openEvent(id, tab), 280); };
      return;
    }
    const info = eventInfo(e);
    const days = [...new Set(e.slots.map(s => s.date))];
    const P = n => `ev-${e.id}-${n}`;

    m.body.innerHTML = `
      <header class="pa-ev-head">
        <div class="pa-ev-kick"><span class="badge is-${info.status}">${esc(info.label)}</span><span class="muted">${esc(e.region)}</span></div>
        <h2 class="pa-ev-title">${esc(e.city)}</h2>
        <p class="pa-ev-meta">${fmt.range(e)}<br>${esc(e.venue)}, ${esc(e.pool)}</p>
        ${info.status === 'past' ? '' : `<div class="clock pa-ev-clock" id="${P('clock')}" aria-label="Tempo che manca alla tappa"></div>`}
        <div class="pa-ev-act">
          ${info.status === 'past' ? `<button class="btn" data-gallery>Guarda le foto</button>`
        : info.status === 'soon' ? `<button class="btn" data-notify>Avvisami all’apertura</button>`
          : `<button class="btn" data-reg>${info.status === 'soldout' ? 'Entra in lista d’attesa' : 'Prenota il posto'}</button>`}
          <button class="btn ghost" data-share>Condividi</button>
        </div>
      </header>
      <div class="pa-tabs" role="tablist" aria-label="Sezioni della tappa">
        ${[['programma', 'Programma'], ['coach', 'Coach'], ['struttura', 'Struttura'], ['info', 'Info utili']]
        .map(([k, l]) => `<button role="tab" id="${P('t-' + k)}" aria-controls="${P('p-' + k)}" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}">${l}</button>`).join('')}
      </div>
      <section role="tabpanel" id="${P('p-programma')}" aria-labelledby="${P('t-programma')}" tabindex="0" ${tab === 'programma' ? '' : 'hidden'}>
        ${days.map(day => `<h3 class="pa-day">${fmt.dayLong(day)}</h3>
          <ul class="pa-slots">${e.slots.filter(s => s.date === day).map(s => {
          const left = slotLeft(s), c = cat(s.cat), pct = Math.round((1 - left / s.cap) * 100);
          return `<li class="pa-slot ${left === 0 ? 'is-full' : ''}">
              <div class="pa-slot-time mono">${s.start}<span>${s.end}</span></div>
              <div>
                <div class="pa-slot-cat">${esc(c.label)}<span>${esc(c.ages)}</span></div>
                <p class="pa-slot-focus">${esc(s.focus)}</p>
                <div class="fill ${left === 0 ? 'is-full' : ''}"><i style="--w:${pct}%"></i></div>
                <small class="pa-slot-left num">${left === 0 ? 'Fascia piena' : `${s.cap - left} iscritti su ${s.cap}, restano ${left} posti`}</small>
              </div>
              <div class="pa-slot-cta">
                <span class="pa-slot-price">${eur(s.price)}</span>
                ${['past', 'soon'].includes(info.status) ? '' : `<button class="btn sm ${left === 0 ? 'ghost' : ''}" data-reg-slot="${s.id}">${left === 0 ? 'Lista d’attesa' : 'Prenota'}</button>`}
              </div></li>`;
        }).join('')}</ul>`).join('')}
        <p class="pa-note">Ogni fascia dura 90 minuti: 20 di attivazione a secco, 60 in acqua, 10 di video a bordo vasca. Sconto gruppo del 15% da due posti in su.</p>
      </section>
      <section role="tabpanel" id="${P('p-coach')}" aria-labelledby="${P('t-coach')}" tabindex="0" ${tab === 'coach' ? '' : 'hidden'}>
        <div class="pa-coachlist">${e.coaches.map(coach).filter(Boolean).map(c => `<article class="pa-coach">${avatar(c)}<div><h4>${esc(c.name)}</h4><p class="role">${esc(c.role)}</p><p>${esc(c.bio)}</p></div></article>`).join('')}</div>
      </section>
      <section role="tabpanel" id="${P('p-struttura')}" aria-labelledby="${P('t-struttura')}" tabindex="0" ${tab === 'struttura' ? '' : 'hidden'}>
        <div class="pa-venue"><div>${photo(Math.round(e.lat * 10), e.venue)}</div>
          <dl class="pa-dl"><dt>Struttura</dt><dd>${esc(e.venue)}</dd><dt>Indirizzo</dt><dd>${esc(e.address)}</dd><dt>Vasca</dt><dd>${esc(e.pool)}</dd><dt>Parcheggio</dt><dd>${esc(e.parking)}</dd><dt>Hotel</dt><dd>${esc(e.hotel)}</dd></dl>
        </div>
        <a class="btn ghost" href="https://www.google.com/maps/search/${encodeURIComponent(e.address)}" target="_blank" rel="noopener">Apri su Google Maps</a>
      </section>
      <section role="tabpanel" id="${P('p-info')}" aria-labelledby="${P('t-info')}" tabindex="0" ${tab === 'info' ? '' : 'hidden'}>
        <div class="pa-two">
          <div><h4>Cosa portare</h4><ul class="pa-list"><li>Costume, cuffia e due paia di occhialini</li><li>Accappatoio e ciabatte</li><li>Abbigliamento comodo per la parte a secco</li><li>Borraccia e uno snack</li><li>Il QR dell’iscrizione sul telefono</li></ul></div>
          <div><h4>Regole della tappa</h4><ul class="pa-list"><li>Check-in 30 minuti prima della fascia</li><li>Certificato medico valido obbligatorio</li><li>Consenso del genitore per i minori</li><li>Riprese video riservate allo staff</li></ul></div>
        </div>
        <h4>Domande frequenti</h4>${faqHtml(D.faq.slice(0, 5), 'evfaq-' + e.id)}
      </section>`;

    bindTabs(m.body); bindFaq(m.body);
    const ck = $('#' + P('clock'), m.body);
    let stopClock = null;
    if (ck) stopClock = countdown(e.startDate, v => { if (document.body.contains(ck)) ck.innerHTML = clockHtml(v); else stopClock && stopClock(); });

    m.body.addEventListener('click', ev => {
      const t = ev.target.closest('button'); if (!t) return;
      if (t.dataset.reg !== undefined) { m.close(); setTimeout(() => openRegister({ eventId: e.id }), 280); }
      if (t.dataset.regSlot) { const s = t.dataset.regSlot; m.close(); setTimeout(() => openRegister({ eventId: e.id, slotId: s }), 280); }
      if (t.dataset.share !== undefined) share(e);
      if (t.dataset.notify !== undefined) toast('Ti avvisiamo il ' + fmt.short(e.opensOn) + ', appena aprono le iscrizioni');
      if (t.dataset.gallery !== undefined) { m.close(); setTimeout(() => openAccount('media'), 280); }
    });
    try { history.replaceState(null, '', '#evento=' + e.id); } catch (err) { }
  }

  function share(e) {
    const url = location.href.split('#')[0] + '#evento=' + e.id;
    const text = `Premium Academy Experience a ${e.city}, ${fmt.range(e)}`;
    if (navigator.share) { navigator.share({ title: text, url }).catch(() => { }); return; }
    if (navigator.clipboard) { navigator.clipboard.writeText(url).then(() => toast('Link copiato, puoi incollarlo su WhatsApp')); return; }
    toast('Copia questo indirizzo: ' + url);
  }

  /* =======================================================================
     PERCORSO DI ISCRIZIONE
     Ordine: atleta ed età -> fascia compatibile -> dati -> pagamento.
     ======================================================================= */
  const CODES = { SOCIETA10: .10, PREMIUM20: .20 };
  const DRAFT = 'pa_draft_v1';
  const STEPS = ['Atleta', 'Fascia', 'Dati', 'Pagamento', 'Conferma'];

  function blankAthlete() { return { nome: '', cognome: '', nascita: '', shirt: 'M', slotId: '' }; }

  async function openRegister({ eventId, slotId } = {}) {
    const first = nextOpen();
    const st = {
      step: 0, eventId: eventId || (first && first.id), who: 'genitore',
      athletes: [blankAthlete()],
      email: '', phone: '', society: '', fin: '', parent: '', consent: false,
      cert: '', certExp: '', privacy: false, photo: false,
      code: '', hold: null, idem: API.uid(), outcome: 'riuscito', result: null, errs: {}, busy: false
    };
    if (slotId) { st.athletes[0].slotId = slotId; }

    const m = modal(`<div class="pa-wiz"><ol class="pa-steps" id="wiz-steps"></ol><div id="wiz-body"></div><div class="wiz-foot" id="wiz-foot"></div></div>`, {
      wide: true, label: 'Iscrizione alla tappa',
      confirmClose: () => st.step > 0 && !st.result,
      onRestore: () => render(),
      onClose: () => { if (st.hold && !st.result) API.releaseHold(st.hold.token).catch(() => { }); stopHold(); }
    });
    const steps = $('#wiz-steps', m.body), body = $('#wiz-body', m.body), foot = $('#wiz-foot', m.body);

    /* --- bozza --- */
    const saveDraft = () => { try { sessionStorage.setItem(DRAFT, JSON.stringify({ t: Date.now(), st: Object.assign({}, st, { result: null, errs: {}, busy: false }) })); } catch (e) { } };
    const clearDraft = () => { try { sessionStorage.removeItem(DRAFT); } catch (e) { } };
    let draft = null;
    try { const raw = sessionStorage.getItem(DRAFT); if (raw) { const d = JSON.parse(raw); if (Date.now() - d.t < 7200000 && d.st.step > 0) draft = d.st; } } catch (e) { }

    /* --- prenotazione temporanea --- */
    let holdStop = null;
    function stopHold() { if (holdStop) { holdStop(); holdStop = null; } }
    async function takeHold() {
      if (st.hold) { await API.releaseHold(st.hold.token).catch(() => { }); st.hold = null; }
      const lines = payLines();
      if (!lines.length) return;
      try { st.hold = await API.holdSlots(lines); }
      catch (err) {
        if (err.code === 'slot_full') { st.errs.slot = 'Il posto si è appena esaurito. Scegli un’altra fascia o entra in lista d’attesa.'; st.step = 1; render(); return false; }
        toast(err.message || 'Non riesco a bloccare il posto', true); return false;
      }
      return true;
    }

    /* --- dati derivati --- */
    const ev = () => byId(st.eventId);
    function payLines() {
      return st.athletes.filter(a => a.slotId).map(a => {
        const s = slotById(a.slotId);
        return { slotId: a.slotId, athlete: (a.nome + ' ' + a.cognome).trim(), price: s ? s.price : 0, waitlist: s ? slotLeft(s) === 0 : false };
      });
    }
    function totals() {
      const lines = payLines();
      const paying = lines.filter(l => !l.waitlist);
      const sub = paying.reduce((n, l) => n + l.price, 0);
      const group = paying.length >= 2 ? sub * .15 : 0;
      const rate = CODES[st.code.trim().toUpperCase()] || 0;
      const disc = rate ? (sub - group) * rate : 0;
      return { lines, sub, group, disc, posti: paying.length, total: Math.max(0, Math.round((sub - group - disc) * 100) / 100) };
    }
    const count = () => st.athletes.length;

    /* --- validazione, campo per campo --- */
    function validate() {
      const e = {};
      if (st.step === 0) {
        st.athletes.forEach((a, i) => {
          if (!a.nome.trim()) e['a' + i + 'nome'] = 'Manca il nome';
          if (!a.cognome.trim()) e['a' + i + 'cognome'] = 'Manca il cognome';
          if (!a.nascita) e['a' + i + 'nascita'] = 'Manca la data di nascita';
          else {
            const y = ageOf(a.nascita);
            if (y == null || y < 0) e['a' + i + 'nascita'] = 'Data non valida';
            else if (y < 8) e['a' + i + 'nascita'] = 'Le tappe partono dagli 8 anni compiuti';
            else if (y > 99) e['a' + i + 'nascita'] = 'Controlla la data';
          }
        });
      }
      if (st.step === 1) {
        st.athletes.forEach((a, i) => { if (!a.slotId) e['a' + i + 'slot'] = 'Scegli una fascia per ' + (a.nome || 'questo atleta'); });
      }
      if (st.step === 2) {
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(st.email.trim())) e.email = 'Serve un indirizzo email valido: ci mandiamo il pass';
        if (st.athletes.some(a => ageOf(a.nascita) < 18)) {
          if (!st.parent.trim()) e.parent = 'Serve il nome di chi esercita la responsabilità genitoriale';
          if (!st.consent) e.consent = 'Serve l’autorizzazione per far partecipare il minore';
        }
        if (!st.privacy) e.privacy = 'Per proseguire devi accettare informativa e regolamento';
        if (st.certExp && toDate(st.certExp) < ev().startDate) e.certExp = 'Questo certificato scade prima della tappa';
      }
      return e;
    }

    /* --- rendering --- */
    function renderSteps() {
      steps.innerHTML = STEPS.map((s, i) => `<li class="${i < st.step ? 'is-done' : ''} ${i === st.step ? 'is-on' : ''}"><b>${i < st.step ? '✓' : i + 1}</b>${s}</li>`).join('');
      const on = $('.is-on', steps);
      if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }

    function errBlock() {
      const keys = Object.keys(st.errs); if (!keys.length) return '';
      return `<div class="errsum" role="alert"><p>Controlla ${keys.length === 1 ? 'questo punto' : 'questi punti'} per proseguire</p><ul>${keys.map(k => `<li>${esc(st.errs[k])}</li>`).join('')}</ul></div>`;
    }
    const fieldErr = k => st.errs[k] ? `<span class="field-err" id="err-${k}">${esc(st.errs[k])}</span>` : '';
    const aria = k => st.errs[k] ? ` aria-invalid="true" aria-describedby="err-${k}"` : '';

    function render() {
      renderSteps();
      if (st.step === 0) renderAthletes();
      else if (st.step === 1) renderSlots();
      else if (st.step === 2) renderData();
      else if (st.step === 3) renderPay();
      else renderDone();
      renderFoot();
      bindInputs();
      const bad = $('[aria-invalid="true"]', body);
      if (bad) bad.focus();
      else { const h = $('.pa-h', body); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    }

    function renderAthletes() {
      const multi = st.who === 'societa';
      body.innerHTML = `${errBlock()}
        <h2 class="pa-h">Chi va in vasca</h2>
        <p class="pa-sub">Partiamo dall’età, così ti mostriamo subito la fascia giusta: ogni fascia oraria è riservata a una categoria.</p>
        <div class="seg" role="radiogroup" aria-label="Chi sta iscrivendo">
          ${[['genitore', 'Sono un genitore'], ['atleta', 'Sono l’atleta'], ['societa', 'Iscrivo per una società']]
          .map(([k, l]) => `<button type="button" role="radio" aria-checked="${st.who === k}" data-who="${k}">${l}</button>`).join('')}
        </div>
        ${st.athletes.map((a, i) => {
        const y = ageOf(a.nascita);
        return `<div class="ath" data-ath="${i}">
            <div class="ath-head"><h4>${multi ? 'Atleta ' + (i + 1) : 'Dati dell’atleta'}</h4>
              ${multi && st.athletes.length > 1 ? `<button type="button" class="link" data-rm="${i}">Rimuovi</button>` : ''}</div>
            <div class="grid-2">
              <label class="field"><span>Nome</span><input data-a="${i}:nome" value="${esc(a.nome)}" autocomplete="given-name"${aria('a' + i + 'nome')}>${fieldErr('a' + i + 'nome')}</label>
              <label class="field"><span>Cognome</span><input data-a="${i}:cognome" value="${esc(a.cognome)}" autocomplete="family-name"${aria('a' + i + 'cognome')}>${fieldErr('a' + i + 'cognome')}</label>
              <label class="field"><span>Data di nascita</span><input type="date" lang="it" data-a="${i}:nascita" value="${esc(a.nascita)}" max="${new Date().toISOString().slice(0, 10)}"${aria('a' + i + 'nascita')}>${fieldErr('a' + i + 'nascita')}
                ${y != null && y >= 8 && !st.errs['a' + i + 'nascita'] ? `<span class="field-ok">${y} anni, categoria ${esc(catFor(y))}</span>` : ''}</label>
              <label class="field"><span>Taglia t-shirt</span><select data-a="${i}:shirt">${['XS', 'S', 'M', 'L', 'XL'].map(x => `<option ${x === a.shirt ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
            </div></div>`;
      }).join('')}
        ${multi ? `<button type="button" class="btn ghost sm" data-add>Aggiungi un altro atleta</button>` : ''}`;
      $$('[data-who]', body).forEach(b => b.onclick = () => {
        st.who = b.dataset.who;
        if (st.who !== 'societa') st.athletes = st.athletes.slice(0, 1);
        st.errs = {}; render();
      });
      const add = $('[data-add]', body);
      if (add) add.onclick = () => { st.athletes.push(blankAthlete()); render(); };
      $$('[data-rm]', body).forEach(b => b.onclick = () => { st.athletes.splice(+b.dataset.rm, 1); render(); });
    }
    function catFor(y) { const c = D.categories.find(c => c.id !== 'all' && y >= c.min && y <= c.max); return c ? c.label : 'da verificare'; }

    function renderSlots() {
      const e = ev();
      body.innerHTML = `${errBlock()}<h2 class="pa-h">La fascia</h2>
        <p class="pa-sub">Queste sono le fasce aperte all’età ${st.athletes.length > 1 ? 'di ogni atleta' : 'dell’atleta'} a <strong>${esc(e.city)}</strong>, ${fmt.range(e)}.</p>
        <label class="field" style="max-width:420px"><span>Cambia tappa</span><select data-k="eventId">
          ${upcoming().filter(x => eventInfo(x).status !== 'soon').map(x => `<option value="${x.id}" ${x.id === st.eventId ? 'selected' : ''}>${esc(x.city)}, ${fmt.range(x)}</option>`).join('')}
        </select></label>
        ${st.athletes.map((a, i) => {
        const y = ageOf(a.nascita);
        const fit = e.slots.filter(s => fitsAge(s, y));
        const rest = e.slots.filter(s => !fitsAge(s, y));
        return `<div class="ath" data-slotfor="${i}">
            <div class="ath-head"><h4>${esc((a.nome + ' ' + a.cognome).trim() || 'Atleta ' + (i + 1))}${y != null ? ', ' + y + ' anni' : ''}</h4></div>
            ${fieldErr('a' + i + 'slot')}
            ${fit.length ? `<div class="pick">${fit.map(s => pickRow(s, i, a.slotId)).join('')}</div>`
            : `<p class="pick-none">Nessuna fascia di questa tappa è aperta a ${y} anni. Prova a cambiare tappa qui sopra, oppure guarda le altre fasce.</p>`}
            ${rest.length ? `<details class="pick-more"><summary class="link">Mostra anche le altre ${rest.length} fasce</summary><div class="pick" style="margin-top:12px">${rest.map(s => pickRow(s, i, a.slotId, true)).join('')}</div></details>` : ''}
          </div>`;
      }).join('')}`;
      $('[data-k="eventId"]', body).onchange = async ev2 => {
        st.eventId = ev2.target.value;
        st.athletes.forEach(a => a.slotId = '');
        body.innerHTML = `<div class="skel skel-slot"></div><div class="skel skel-slot"></div><div class="skel skel-slot"></div>`;
        try { await refresh(st.eventId); } catch (err) { toast(err.message, true); }
        render();
      };
      $$('.pick input', body).forEach(inp => inp.onchange = () => {
        const [i, sid] = inp.value.split('|');
        st.athletes[+i].slotId = sid;
        delete st.errs['a' + i + 'slot']; delete st.errs.slot;
        renderFoot();
      });
    }
    function pickRow(s, i, chosen, dim) {
      const left = slotLeft(s), c = cat(s.cat);
      return `<label class="pick-item ${left === 0 ? 'is-full' : ''}">
        <input type="radio" name="slot-${i}" value="${i}|${s.id}" ${chosen === s.id ? 'checked' : ''}>
        <span class="pick-box">
          <span class="t">${s.start}<span>${cap1(fmt.wd3(s.date))}</span></span>
          <span class="c">${esc(c.label)}<span>${esc(c.ages)}. ${esc(s.focus)}</span></span>
          <span class="p">${left === 0 ? '<b>Attesa</b>nessun pagamento' : '<b>' + eur(s.price) + '</b>' + left + ' posti liberi'}</span>
        </span></label>`;
    }

    function renderData() {
      const minors = st.athletes.some(a => ageOf(a.nascita) < 18);
      body.innerHTML = `${errBlock()}<h2 class="pa-h">I tuoi dati</h2>
        <p class="pa-sub">Servono per mandarti il pass e per farti entrare in vasca. Niente di più.</p>

        <h3 class="pa-day">Come ti contattiamo</h3>
        <div class="grid-2">
          <label class="field"><span>Email</span><input type="email" data-k="email" value="${esc(st.email)}" placeholder="nome@email.it" autocomplete="email" inputmode="email"${aria('email')}>${fieldErr('email')}</label>
          <label class="field"><span>Telefono (facoltativo)</span><input type="tel" data-k="phone" value="${esc(st.phone)}" placeholder="333 000 0000" autocomplete="tel" inputmode="tel"></label>
        </div>

        <h3 class="pa-day">Società sportiva</h3>
        <div class="grid-2">
          <label class="field"><span>Società (facoltativa)</span><input data-k="society" value="${esc(st.society)}" placeholder="Es. Nuoto Club Roma" autocomplete="organization"></label>
          <label class="field"><span>Tessera FIN (facoltativa)</span><input data-k="fin" value="${esc(st.fin)}" placeholder="Es. 123456" inputmode="numeric"></label>
        </div>

        ${minors ? `<h3 class="pa-day">Per i minori</h3>
        <div class="callout">
          <label class="field"><span>Nome e cognome di chi esercita la responsabilità genitoriale</span><input data-k="parent" value="${esc(st.parent)}" autocomplete="name"${aria('parent')}>${fieldErr('parent')}</label>
          <label class="check"><input type="checkbox" data-k="consent" ${st.consent ? 'checked' : ''}${aria('consent')}> <span>Autorizzo la partecipazione del minore e dichiaro di aver letto il <a href="regolamento.html" target="_blank" rel="noopener">regolamento della tappa</a>.</span></label>
          ${fieldErr('consent')}
        </div>` : ''}

        <h3 class="pa-day">Certificato medico</h3>
        <label class="drop"><input type="file" data-cert accept=".pdf,.jpg,.jpeg,.png">
          <span>${st.cert ? `<b>${esc(st.cert)}</b> caricato. Tocca per sostituirlo.` : '<b>Carica il certificato</b><br>PDF o fotografia, fino a 10 MB.'}</span></label>
        <div class="grid-2">
          <label class="field"><span>Scadenza del certificato</span><input type="date" lang="it" data-k="certExp" value="${esc(st.certExp)}"${aria('certExp')}>${fieldErr('certExp')}</label>
        </div>
        <p class="pa-note">Puoi caricarlo anche dopo, dall’area riservata, ma deve arrivare entro 7 giorni dalla tappa: senza certificato valido non si entra in vasca.</p>

        <h3 class="pa-day">Consensi</h3>
        <label class="check"><input type="checkbox" data-k="privacy" ${st.privacy ? 'checked' : ''}${aria('privacy')}> <span>Ho letto l’<a href="privacy.html" target="_blank" rel="noopener">informativa privacy</a> e il <a href="regolamento.html" target="_blank" rel="noopener">regolamento</a>.</span></label>
        ${fieldErr('privacy')}
        <label class="check"><input type="checkbox" data-k="photo" ${st.photo ? 'checked' : ''}> <span>Autorizzo foto e video durante la tappa, per la galleria riservata ai partecipanti. <span class="muted">È facoltativo: se non lo spunti, l’iscrizione e la fascia restano identiche.</span></span></label>
        <p class="muted" style="font-size:14px;max-width:62ch">I dati dell’atleta sono conservati da Premium Academy Experience per il tempo necessario alla tappa e agli obblighi di legge, e non vengono ceduti a terzi. Puoi chiederne la cancellazione scrivendo a ${esc(D.brand.email)}.</p>`;
      $('[data-cert]', body).onchange = x => { st.cert = x.target.files[0] ? x.target.files[0].name : ''; render(); };
    }

    function renderPay() {
      const t = totals(), e = ev();
      const allWait = t.lines.length > 0 && t.lines.every(l => l.waitlist);
      body.innerHTML = `${errBlock()}
        <h2 class="pa-h">${allWait ? 'Conferma la lista d’attesa' : 'Riepilogo e pagamento'}</h2>
        ${allWait ? '' : `<div class="hold" id="hold-strip"></div>`}
        <div class="summary">
          <h4>${esc(e.city)}, ${fmt.range(e)}</h4>
          ${t.lines.map(l => {
        const s = slotById(l.slotId), c = s ? cat(s.cat) : null;
        return `<div class="sum-row"><span><b>${esc(l.athlete || 'Atleta')}</b>
              <small>${cap1(fmt.wd3(s.date))} ${s.start}-${s.end}, ${esc(c.label)}${l.waitlist ? '. In lista d’attesa' : ''}</small></span>
              <span class="v">${l.waitlist ? 'in attesa' : eur(l.price)}</span></div>`;
      }).join('')}
          ${t.group ? `<div class="sum-row"><span>Sconto gruppo, ${t.posti} posti</span><span class="v">- ${eur(t.group)}</span></div>` : ''}
          ${t.disc ? `<div class="sum-row"><span>Codice ${esc(st.code.toUpperCase())}</span><span class="v">- ${eur(t.disc)}</span></div>` : ''}
          <div class="sum-total"><b>Totale</b><span class="v">${eur(t.total)}</span></div>
        </div>
        ${allWait ? `<p>Non paghi nulla adesso. Se si libera un posto scriviamo a <strong>${esc(st.email)}</strong> e hai 24 ore per confermare.</p>`
          : `<div class="grid-2"><label class="field"><span>Codice sconto</span><input data-k="code" value="${esc(st.code)}" placeholder="Se ne hai uno"></label></div>
        <div class="payhost">
          <div class="payhost-row">
            <p>I dati della carta vengono inseriti direttamente sul modulo protetto del gestore dei pagamenti. Noi non li vediamo e non li conserviamo.</p>
            <span class="payhost-logo">${icon('check')} Pagamento protetto</span>
          </div>
        </div>
        <div class="demo"><label for="demo-out">Prototipo, nessun addebito reale. Esito da simulare:</label>
          <select id="demo-out" data-k="outcome">
            <option value="riuscito" ${st.outcome === 'riuscito' ? 'selected' : ''}>Pagamento riuscito</option>
            <option value="rifiutato" ${st.outcome === 'rifiutato' ? 'selected' : ''}>Carta rifiutata</option>
            <option value="esaurito" ${st.outcome === 'esaurito' ? 'selected' : ''}>Posto esaurito nel frattempo</option>
          </select></div>
        <p class="muted" style="font-size:14px">Rimborso completo fino a 14 giorni prima della tappa, metà fino a 7 giorni. Dopo puoi cedere il posto a un altro atleta della stessa categoria.</p>`}`;
      const code = $('[data-k="code"]', body);
      if (code) {
        const apply = () => {
          const v = code.value.trim().toUpperCase();
          st.code = code.value;
          if (v && !CODES[v]) toast('Codice non valido, controlla le lettere', true);
          renderPay(); bindInputs(); renderFoot();
          const c2 = $('[data-k="code"]', body); if (c2) { c2.focus(); c2.setSelectionRange(c2.value.length, c2.value.length); }
        };
        code.addEventListener('change', apply);
        code.addEventListener('keydown', e2 => { if (e2.key === 'Enter') { e2.preventDefault(); apply(); } });
      }
      startHoldStrip();
    }

    function startHoldStrip() {
      stopHold();
      const strip = $('#hold-strip', body);
      if (!strip || !st.hold) return;
      holdStop = countdown(new Date(st.hold.expiresAt), v => {
        if (!document.body.contains(strip)) { stopHold(); return; }
        if (v.over) {
          strip.className = 'hold is-over';
          strip.innerHTML = `${icon('warning')}<span>Il posto non è più bloccato.</span><button class="btn sm" data-rehold>Ricontrolla la disponibilità</button>`;
          $('[data-rehold]', strip).onclick = async () => {
            strip.innerHTML = 'Controllo in corso…';
            await refresh(st.eventId).catch(() => { });
            const ok = await takeHold();
            if (ok) { renderPay(); bindInputs(); renderFoot(); }
          };
          stopHold(); return;
        }
        const mins = v.days * 1440 + v.hours * 60 + v.minutes;
        strip.className = 'hold' + (mins < 2 ? ' is-warn' : '');
        strip.innerHTML = `${icon('timer')}<span>Posto bloccato per te ancora per <b>${pad(mins)}:${pad(v.seconds)}</b></span>`;
      }, true);
    }

    function renderDone() {
      const r = st.result, e = byId(r.eventId) || ev();
      const l = r.lines[0], s = l ? slotById(l.slotId) : null;
      const wait = r.status === 'lista d’attesa';
      const coachNames = e.coaches.map(c => coach(c)).filter(Boolean).map(c => c.name).join(', ');
      body.innerHTML = `<div class="done">
        <div class="done-top">
          <div>
            <span class="badge ${wait ? 'is-last' : 'is-open'}">${wait ? 'Sei in lista d’attesa' : 'Iscrizione confermata'}</span>
            <p class="done-name">${esc(r.lines.map(x => x.athlete).join(', '))}</p>
            ${wait ? `<p>Ti scriviamo a <strong>${esc(r.email)}</strong> appena si libera un posto.</p>`
          : `<div class="done-when">
                   <span class="mono">${cap1(fmt.wd3(s.date))} ${s.date.slice(8, 10)} ${fmt.month(s.date)}, ore ${s.start}</span>
                   <span>${esc(cat(s.cat).label)}, ${esc(s.focus).toLowerCase()}</span>
                   <span class="muted">${esc(e.venue)}, ${esc(e.city)}</span>
                   <span class="muted">In vasca con ${esc(coachNames)}</span>
                 </div>`}
          </div>
          <div class="done-qr">${qr(r.code, 140)}<code>${esc(r.code)}</code></div>
        </div>
        ${wait ? '' : `<div class="done-next"><b>${r.certOk ? 'Ci siamo quasi' : 'Manca una cosa sola'}</b>
          <p>${r.certOk ? 'Mostra il QR al check-in, 30 minuti prima della fascia.' : 'Carica il certificato medico dall’area riservata entro 7 giorni dalla tappa. Senza, non si entra in vasca.'}</p></div>`}
        <div class="done-act">
          ${r.certOk ? '' : `<button class="btn" data-account>Carica il certificato</button>`}
          <button class="btn ${r.certOk ? '' : 'ghost'}" data-ics>Aggiungi al calendario</button>
          <a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Ci vediamo a Premium Academy Experience, ' + e.city + ', ' + fmt.range(e))}">Condividi su WhatsApp</a>
          ${r.certOk ? `<button class="btn ghost" data-account>Vai all’area riservata</button>` : ''}
        </div>
        <p class="muted" style="font-size:14px">Riepilogo inviato a ${esc(r.email)}.</p></div>`;
      $$('[data-account]', body).forEach(b => b.onclick = () => { m.close(); setTimeout(() => openAccount(r.certOk ? 'iscrizioni' : 'documenti'), 280); });
      $('[data-ics]', body).onclick = () => ics(e, r.lines.map(x => slotById(x.slotId)).filter(Boolean));
    }

    function bindInputs() {
      $$('[data-k]', body).forEach(inp => {
        if (inp.dataset.k === 'eventId' || inp.dataset.k === 'code') return;
        const k = inp.dataset.k;
        const ev2 = inp.type === 'checkbox' || inp.tagName === 'SELECT' || inp.type === 'date' ? 'change' : 'input';
        inp.addEventListener(ev2, () => {
          st[k] = inp.type === 'checkbox' ? inp.checked : inp.value;
          if (st.errs[k]) { delete st.errs[k]; render(); return; }
          if (k === 'certExp' || k === 'photo') { /* nessun ridisegno */ }
        });
      });
      $$('[data-a]', body).forEach(inp => {
        const [i, f] = inp.dataset.a.split(':');
        const ev2 = inp.tagName === 'SELECT' || inp.type === 'date' ? 'change' : 'input';
        inp.addEventListener(ev2, () => {
          st.athletes[+i][f] = inp.value;
          const key = 'a' + i + f;
          if (st.errs[key] || f === 'nascita') { delete st.errs[key]; if (f === 'nascita') render(); }
        });
      });
    }

    function renderFoot() {
      if (st.step === 4) { foot.innerHTML = ''; return; }
      const t = totals();
      const allWait = t.lines.length > 0 && t.lines.every(l => l.waitlist);
      const label = st.step === 3 ? (allWait ? 'Conferma la lista d’attesa' : 'Paga ' + eur(t.total)) : 'Continua';
      foot.innerHTML = `${st.step > 0 ? '<button class="btn ghost" data-back>Indietro</button>' : '<span></span>'}
        <div class="r">${t.lines.length ? `<span class="wiz-tot">${t.posti || t.lines.length} ${(t.posti || t.lines.length) === 1 ? 'posto' : 'posti'}, <b>${eur(t.total)}</b></span>` : ''}
        <button class="btn" data-next ${st.busy ? 'disabled' : ''}>${st.busy ? 'Attendi…' : label}</button></div>`;
      const back = $('[data-back]', foot);
      if (back) back.onclick = () => { st.step--; st.errs = {}; saveDraft(); render(); };
      $('[data-next]', foot).onclick = next;
    }

    async function next() {
      st.errs = validate();
      if (Object.keys(st.errs).length) { render(); return; }
      if (st.step === 1) {
        st.busy = true; renderFoot();
        const ok = await takeHold();
        st.busy = false;
        if (ok === false) { renderFoot(); return; }
      }
      if (st.step === 3) {
        st.busy = true; renderFoot();
        const t = totals();
        try {
          const rec = await API.createRegistration({
            eventId: st.eventId, lines: t.lines, email: st.email.trim(), total: t.total,
            hold: st.hold && st.hold.token, idempotencyKey: st.idem, cert: st.cert,
            athletes: st.athletes, society: st.society, fin: st.fin, parent: st.parent,
            photoConsent: st.photo, outcome: st.outcome
          });
          st.result = rec; st.busy = false; st.step = 4;
          clearDraft(); stopHold();
          document.dispatchEvent(new CustomEvent('pa:registered', { detail: rec }));
          await refresh(st.eventId).catch(() => { });
          render();
        } catch (err) {
          st.busy = false;
          handlePayError(err);
        }
        return;
      }
      st.step++; st.errs = {}; saveDraft(); render();
      m.panel.scrollTop = 0;
    }

    function handlePayError(err) {
      if (err.code === 'payment_declined') {
        st.errs.pay = err.message + '. Prova con un’altra carta, oppure scegli un altro metodo.';
        render(); return;
      }
      if (err.code === 'hold_expired') {
        st.hold = null; st.errs.pay = 'Il blocco sul posto è scaduto. Ricontrolla la disponibilità e riprova.';
        render(); return;
      }
      if (err.code === 'slot_full') {
        showConflict(err.detail.slotId); return;
      }
      if (err.code === 'storage_full') {
        st.errs.pay = 'La memoria del browser è piena, non riesco a salvare l’iscrizione. Libera spazio e riprova.';
        render(); return;
      }
      st.errs.pay = (err.message || 'Qualcosa non ha funzionato') + '. Riprova tra un momento.';
      render();
    }

    async function showConflict(slotId) {
      await refresh(st.eventId).catch(() => { });
      const e = ev();
      const gone = slotById(slotId);
      const y = ageOf(st.athletes[0] && st.athletes[0].nascita);
      const alt = e.slots.filter(s => s.id !== slotId && fitsAge(s, y) && slotLeft(s) > 0);
      body.innerHTML = `<h2 class="pa-h">Il posto è andato</h2>
        <p class="pa-sub">Qualcun altro ha completato l’iscrizione alla fascia ${gone ? cap1(fmt.wd3(gone.date)) + ' ' + gone.start : ''} mentre stavi pagando. Non è stato addebitato nulla.</p>
        ${alt.length ? `<p>Su questa tappa restano libere ${alt.length === 1 ? 'questa fascia' : 'queste fasce'}:</p>
        <div class="pick">${alt.map(s => pickRow(s, 0, '')).join('')}</div>
        <div class="done-act" style="margin-top:20px"><button class="btn" data-pick>Scegli questa fascia</button><button class="btn ghost" data-wait>Entra in lista d’attesa</button></div>`
          : `<div class="done-act"><button class="btn" data-wait>Entra in lista d’attesa</button><button class="btn ghost" data-other>Guarda un’altra tappa</button></div>`}`;
      foot.innerHTML = `<button class="btn ghost" data-back2>Indietro</button><span></span>`;
      $('[data-back2]', foot).onclick = () => { st.step = 1; st.errs = {}; render(); };
      $$('.pick input', body).forEach(i => i.onchange = () => { st.athletes[0].slotId = i.value.split('|')[1]; });
      const pick = $('[data-pick]', body);
      if (pick) pick.onclick = async () => {
        if (!st.athletes[0].slotId || st.athletes[0].slotId === slotId) { toast('Scegli prima una fascia', true); return; }
        st.idem = API.uid(); await takeHold(); st.step = 3; st.errs = {}; render();
      };
      $('[data-wait]', body).onclick = () => { st.athletes[0].slotId = slotId; st.idem = API.uid(); st.hold = null; st.step = 3; st.errs = {}; render(); };
      const other = $('[data-other]', body);
      if (other) other.onclick = () => { st.step = 1; st.errs = {}; render(); };
    }

    /* --- avvio: carica la tappa, poi eventuale bozza --- */
    body.innerHTML = `<div class="skel" style="height:160px"></div>`;
    renderSteps();
    try { await refresh(st.eventId); }
    catch (err) { body.innerHTML = `<h2 class="pa-h">Non riesco a caricare le fasce</h2><p class="pa-sub">${esc(err.message)}</p>`; return; }

    if (draft && !eventId) {
      body.innerHTML = `<h2 class="pa-h">Riprendiamo da dove eri?</h2>
        <p class="pa-sub">Hai lasciato un’iscrizione a metà poco fa. I dati sono ancora qui.</p>
        <div class="done-act"><button class="btn" data-resume>Riprendi</button><button class="btn ghost" data-fresh>Ricomincia</button></div>`;
      foot.innerHTML = '';
      $('[data-resume]', body).focus();
      $('[data-resume]', body).onclick = async () => {
        Object.assign(st, draft, { errs: {}, busy: false, result: null });
        try { await refresh(st.eventId); } catch (e2) { }
        if (st.step > 1) { const ok = await takeHold(); if (ok === false) return; }
        render();
      };
      $('[data-fresh]', body).onclick = () => { clearDraft(); render(); };
      return;
    }
    render();
  }

  function ics(e, slots) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Premium Academy Experience//IT', 'CALSCALE:GREGORIAN'];
    slots.forEach(s => {
      const dt = s.date.replace(/-/g, '');
      lines.push('BEGIN:VEVENT', 'UID:' + s.id + '@premiumacademy',
        `DTSTART:${dt}T${s.start.replace(':', '')}00`, `DTEND:${dt}T${s.end.replace(':', '')}00`,
        `SUMMARY:Premium Academy Experience ${e.city}, ${cat(s.cat).label}`,
        `LOCATION:${e.venue}\\, ${e.address}`, 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
    a.download = 'premium-academy-' + e.id + '.ics'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* =======================================================================
     AREA RISERVATA
     ======================================================================= */
  async function openAccount(tab = 'iscrizioni') {
    const m = modal(`<div class="skel" style="height:200px"></div>`, { wide: true, label: 'Area riservata' });
    let regs = [];
    try { regs = await API.myRegistrations(); } catch (e) { }
    const lastPast = past()[0];
    const P = n => 'acc-' + n;
    m.body.innerHTML = `
      <header class="pa-ev-head" style="padding-bottom:18px">
        <h2 class="pa-ev-title" style="font-size:clamp(32px,4.4vw,46px)">La tua area</h2>
        <p class="pa-ev-meta">${regs.length ? esc(regs[0].email) : 'Nessuna iscrizione ancora'}</p>
      </header>
      <div class="pa-tabs" role="tablist" aria-label="Sezioni dell'area riservata">
        ${[['iscrizioni', 'Iscrizioni'], ['documenti', 'Documenti'], ['media', 'Foto e video']]
        .map(([k, l]) => `<button role="tab" id="${P('t-' + k)}" aria-controls="${P('p-' + k)}" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}">${l}</button>`).join('')}
      </div>
      <section role="tabpanel" id="${P('p-iscrizioni')}" aria-labelledby="${P('t-iscrizioni')}" tabindex="0" ${tab === 'iscrizioni' ? '' : 'hidden'}>
        ${regs.length ? `<ul class="regs">${regs.map(r => {
          const e = byId(r.eventId); if (!e) return '';
          const done = eventInfo(e).status === 'past';
          return `<li class="reg">
            <span class="qr-wrap">${qr(r.code, 80)}</span>
            <div><b>${esc(e.city)}</b> <span class="badge ${done ? 'is-past' : r.status === 'confermata' ? 'is-open' : 'is-last'}">${done ? 'Completata' : esc(r.status)}</span>
              <p>${fmt.range(e)}, ${esc(r.lines.map(l => l.athlete).join(', '))}</p>
              <p class="muted">${r.lines.map(l => { const s = slotById(l.slotId); return s ? cap1(fmt.wd3(s.date)) + ' ' + s.start + ', ' + cat(s.cat).label : ''; }).filter(Boolean).join(' / ')}<br>Codice ${esc(r.code)}</p></div>
            <div>${done ? `<button class="btn sm ghost" data-doc>Attestato</button>` : `<button class="btn sm ghost" data-open="${e.id}">Programma</button>`}</div></li>`;
        }).join('')}</ul>` : `<div class="empty"><p>Non hai ancora iscrizioni.</p><button class="btn" data-new>Scegli una tappa</button></div>`}
      </section>
      <section role="tabpanel" id="${P('p-documenti')}" aria-labelledby="${P('t-documenti')}" tabindex="0" ${tab === 'documenti' ? '' : 'hidden'}>
        ${regs.length ? `<ul class="docs">${regs.map(r => `
          <li><span>Ricevuta ${esc(r.code)}</span><button class="link" data-doc>Scarica il PDF</button></li>
          <li><span>Certificato medico, ${esc(r.lines.map(l => l.athlete).join(', '))}</span>
            ${r.certOk ? '<span class="badge is-open">Verificato</span>'
          : `<label class="link">Carica adesso<input type="file" hidden data-up accept=".pdf,.jpg,.jpeg,.png"></label>`}</li>`).join('')}</ul>`
        : '<div class="empty"><p>Qui troverai ricevute e certificati.</p></div>'}
      </section>
      <section role="tabpanel" id="${P('p-media')}" aria-labelledby="${P('t-media')}" tabindex="0" ${tab === 'media' ? '' : 'hidden'}>
        <p class="muted">${lastPast ? esc(lastPast.city) + ', ' + fmt.range(lastPast) + '. 48 foto e 1 video analisi' : 'Le foto compaiono dopo la tua prima tappa'}</p>
        <div class="media">${Array.from({ length: 8 }, (_, i) => `<figure>${photo(i * 37, i === 0 ? 'Video analisi della partenza' : '')}</figure>`).join('')}</div>
      </section>`;
    bindTabs(m.body);
    m.body.addEventListener('click', ev2 => {
      const t = ev2.target.closest('button'); if (!t) return;
      if (t.dataset.open) { const id = t.dataset.open; m.close(); setTimeout(() => openEvent(id), 280); }
      if (t.dataset.new !== undefined) { m.close(); setTimeout(() => openRegister({}), 280); }
      if (t.dataset.doc !== undefined) toast('Nel prototipo il PDF non viene generato: lo produrrà il backend');
    });
    $$('[data-up]', m.body).forEach(i => i.onchange = () => toast('Certificato caricato. Lo verifichiamo entro 24 ore'));
  }

  /* ---------- avvio ---------- */
  function boot() {
    initToast();
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-pa]'); if (!t) return;
      e.preventDefault();
      const a = t.dataset.pa;
      if (a === 'event') openEvent(t.dataset.id, t.dataset.tab);
      if (a === 'register') openRegister({ eventId: t.dataset.id, slotId: t.dataset.slot });
      if (a === 'account') openAccount();
    });
    bindFaq();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();

  window.PA = {
    D, API, $, $$, esc, cap1, fmt, eur, pad, cat, coach, icon, ICON,
    load, refresh, events: () => EVENTS, byId, slotById, eventOfSlot,
    eventInfo, slotLeft, upcoming, past, nextOpen, regions, months, filter, ageOf, fitsAge,
    countdown, clockHtml, italyMap, bindMap, qr, avatar, photo,
    toast, modal, bindTabs, faqHtml, bindFaq,
    openEvent, openRegister, openAccount, share, ics
  };
})();
