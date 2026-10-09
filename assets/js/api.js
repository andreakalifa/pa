/* =========================================================================
   PREMIUM ACADEMY EXPERIENCE - strato dati

   Tutto il sito parla SOLO con questo file. Nessun altro modulo legge
   PA_DATA direttamente. Ogni metodo restituisce una Promise, quindi il
   giorno in cui arriva Django basta sostituire l'adattatore in fondo:
   il resto del codice non cambia di una riga.

   PASSAGGIO A DJANGO
   ------------------
   1. Imposta PA_API_BASE prima di caricare questo file:
        <script>window.PA_API_BASE = '/api'</script>
   2. Da quel momento viene usato l'adattatore HTTP invece di quello finto.
   3. Endpoint attesi (DRF o viste normali, non cambia):
        GET    /api/events/                     -> [Evento]
        GET    /api/events/<id>/                -> Evento
        POST   /api/holds/        {slots:[{slotId,count}]}      -> {token, expiresAt}
        DELETE /api/holds/<token>/
        POST   /api/registrations/   (Idempotency-Key nell'header)  -> Iscrizione
        GET    /api/registrations/mine/         -> [Iscrizione]
   4. Codici di risposta che l'interfaccia sa già gestire:
        409 posto esaurito   {error:'slot_full', slotId}
        410 blocco scaduto   {error:'hold_expired'}
        402 pagamento rifiutato {error:'payment_declined', message}
   ========================================================================= */
(function () {
  'use strict';

  const BASE = window.PA_API_BASE || null;

  /* Errore tipizzato: l'interfaccia decide cosa mostrare guardando .code */
  class ApiError extends Error {
    constructor(code, message, detail) {
      super(message || code);
      this.code = code;
      this.detail = detail || {};
    }
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const uid = () => (crypto && crypto.randomUUID ? crypto.randomUUID()
    : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

  /* =======================================================================
     ADATTATORE FINTO - legge data.js e localStorage.
     È quello attivo finché non esiste il backend.
     ======================================================================= */
  const mock = (() => {
    const D = window.PA_DATA;
    const KEY_REGS = 'pa_regs_v3';
    const KEY_HOLDS = 'pa_holds_v1';
    const HOLD_MINUTES = 10;

    /* localStorage può non esistere, essere pieno o lanciare in incognito.
       Qui sotto non si ingoia mai un errore in silenzio: chi chiama lo vede. */
    const ls = {
      read(key, fallback) {
        try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
        catch (e) { return fallback; }
      },
      write(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch (e) { throw new ApiError('storage_full', 'Non riesco a salvare sul questo dispositivo', { raw: e }); }
      }
    };

    const regs = () => ls.read(KEY_REGS, null) || seed();
    function seed() {
      const last = D.events.filter(e => e.endDate < D.TODAY).sort((a, b) => b.startDate - a.startDate)[0];
      const demo = last ? [{
        id: uid(), code: 'PA-7Q2K', eventId: last.id,
        lines: [{ slotId: last.id + '-s3', athlete: 'Matteo Lorenzi', price: 55, waitlist: false }],
        email: 'demo@premiumacademy.it', total: 55, status: 'completata',
        created: last.start, certOk: true
      }] : [];
      try { localStorage.setItem(KEY_REGS, JSON.stringify(demo)); } catch (e) { }
      return demo;
    }

    const holds = () => {
      const now = Date.now();
      const live = (ls.read(KEY_HOLDS, []) || []).filter(h => h.expiresAt > now);
      return live;
    };
    const saveHolds = list => { try { localStorage.setItem(KEY_HOLDS, JSON.stringify(list)); } catch (e) { } };

    /* Posti occupati = quelli di partenza + iscrizioni confermate + blocchi attivi.
       È la stessa somma che in Django farà una query con un COUNT. */
    function takenFor(slotId, exceptHold) {
      const fromRegs = regs()
        .filter(r => r.status !== 'annullata')
        .reduce((n, r) => n + r.lines.filter(l => l.slotId === slotId && !l.waitlist).length, 0);
      const fromHolds = holds()
        .filter(h => h.token !== exceptHold)
        .reduce((n, h) => n + h.slots.filter(s => s.slotId === slotId).reduce((m, s) => m + s.count, 0), 0);
      return fromRegs + fromHolds;
    }

    function hydrate(e, exceptHold) {
      const slots = e.slots.map(s => {
        const taken = s.taken + takenFor(s.id, exceptHold);
        return Object.assign({}, s, { taken: Math.min(s.cap, taken), left: Math.max(0, s.cap - taken) });
      });
      return Object.assign({}, e, { slots });
    }

    return {
      name: 'mock',
      async listEvents(opts) {
        await wait(90);
        return D.events.map(e => hydrate(e, opts && opts.exceptHold));
      },
      async getEvent(id, opts) {
        await wait(60);
        const e = D.events.find(x => x.id === id);
        if (!e) throw new ApiError('not_found', 'Tappa non trovata');
        return hydrate(e, opts && opts.exceptHold);
      },
      async holdSlots(lines) {
        await wait(260);
        for (const l of lines) {
          const ev = D.events.find(e => e.slots.some(s => s.id === l.slotId));
          const slot = ev && ev.slots.find(s => s.id === l.slotId);
          if (!slot) throw new ApiError('not_found', 'Fascia non trovata');
          if (l.waitlist) continue;
          if (slot.cap - (slot.taken + takenFor(l.slotId)) < 1) {
            throw new ApiError('slot_full', 'Il posto si è esaurito', { slotId: l.slotId });
          }
        }
        const token = uid();
        const expiresAt = Date.now() + HOLD_MINUTES * 60000;
        const bySlot = {};
        lines.filter(l => !l.waitlist).forEach(l => { bySlot[l.slotId] = (bySlot[l.slotId] || 0) + 1; });
        const list = holds();
        list.push({ token, expiresAt, slots: Object.entries(bySlot).map(([slotId, count]) => ({ slotId, count })) });
        saveHolds(list);
        return { token, expiresAt };
      },
      async releaseHold(token) {
        saveHolds(holds().filter(h => h.token !== token));
        return true;
      },
      async createRegistration(payload) {
        await wait(900);
        const { hold, lines, outcome } = payload;
        const live = holds().find(h => h.token === hold);
        if (hold && !live) throw new ApiError('hold_expired', 'Il blocco sul posto è scaduto');
        if (outcome === 'rifiutato') throw new ApiError('payment_declined', 'La carta è stata rifiutata dalla banca');
        if (outcome === 'esaurito') throw new ApiError('slot_full', 'Il posto si è esaurito', { slotId: lines[0] && lines[0].slotId });
        for (const l of lines) {
          if (l.waitlist) continue;
          const ev = D.events.find(e => e.slots.some(s => s.id === l.slotId));
          const slot = ev.slots.find(s => s.id === l.slotId);
          if (slot.cap - (slot.taken + takenFor(l.slotId, hold)) < 1) {
            throw new ApiError('slot_full', 'Il posto si è esaurito', { slotId: l.slotId });
          }
        }
        const rec = {
          id: uid(),
          code: 'PA-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
          eventId: payload.eventId, lines, email: payload.email, total: payload.total,
          status: lines.every(l => l.waitlist) ? 'lista d’attesa' : 'confermata',
          created: new Date().toISOString().slice(0, 10),
          certOk: !!payload.cert
        };
        const list = regs(); list.unshift(rec);
        ls.write(KEY_REGS, list);          // se lo spazio è finito, l'errore arriva a chi chiama
        await this.releaseHold(hold);
        return rec;
      },
      async myRegistrations() {
        await wait(60);
        const ids = new Set(window.PA_DATA.events.map(e => e.id));
        return regs().filter(r => ids.has(r.eventId));
      }
    };
  })();

  /* =======================================================================
     ADATTATORE HTTP - si attiva da solo quando esiste window.PA_API_BASE.
     ======================================================================= */
  const http = {
    name: 'http',
    async _call(path, opts) {
      const o = Object.assign({ headers: {} }, opts);
      o.headers['Accept'] = 'application/json';
      if (o.body) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(o.body); }
      const csrf = (document.cookie.match(/csrftoken=([^;]+)/) || [])[1];
      if (csrf && o.method && o.method !== 'GET') o.headers['X-CSRFToken'] = csrf;
      o.credentials = 'same-origin';
      let res;
      try { res = await fetch(BASE + path, o); }
      catch (e) { throw new ApiError('network', 'Connessione non riuscita', { raw: e }); }
      if (res.status === 204) return null;
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(data.error || 'http_' + res.status, data.message, data);
      return data;
    },
    listEvents() { return this._call('/events/'); },
    getEvent(id) { return this._call('/events/' + encodeURIComponent(id) + '/'); },
    holdSlots(lines) { return this._call('/holds/', { method: 'POST', body: { lines } }); },
    releaseHold(token) { return this._call('/holds/' + token + '/', { method: 'DELETE' }); },
    createRegistration(payload) {
      return this._call('/registrations/', {
        method: 'POST', body: payload,
        headers: { 'Idempotency-Key': payload.idempotencyKey }
      });
    },
    myRegistrations() { return this._call('/registrations/mine/'); }
  };

  const adapter = BASE ? http : mock;

  window.PA_API = {
    ApiError, uid, source: adapter.name,
    listEvents: (...a) => adapter.listEvents(...a),
    getEvent: (...a) => adapter.getEvent(...a),
    holdSlots: (...a) => adapter.holdSlots(...a),
    releaseHold: (...a) => adapter.releaseHold(...a),
    createRegistration: (...a) => adapter.createRegistration(...a),
    myRegistrations: (...a) => adapter.myRegistrations(...a)
  };
})();
