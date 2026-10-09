/* =========================================================================
   PREMIUM ACADEMY EXPERIENCE — tema chiaro e scuro

   Il tema CHIARO è il predefinito. La scelta resta su questo dispositivo.
   Per far seguire invece l'impostazione del sistema operativo quando
   l'utente non ha ancora scelto, cambia la riga segnata in readTheme.

   Lo scambio immediato all'apertura lo fa uno script in linea nel <head>
   di ogni pagina: serve perché la pagina non lampeggi di bianco prima di
   diventare scura. Questo file si occupa solo del pulsante.
   ========================================================================= */
(function () {
  'use strict';
  const KEY = 'pa-theme';
  const ICON = '<svg viewBox="0 0 256 256" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M204.37,51.6A108.08,108.08,0,1,0,236,128,108.09,108.09,0,0,0,204.37,51.6ZM176,197a83.43,83.43,0,0,1-16,8.75V113l16-16ZM68.6,68.58A84.08,84.08,0,0,1,178.3,60.7L60.72,178.33A84.08,84.08,0,0,1,68.6,68.58ZM96,177v28.69A83.63,83.63,0,0,1,77.7,195.3Zm24,34.62V153l16-16v74.64A84.68,84.68,0,0,1,120,211.62Zm80-40.27V84.65a84.24,84.24,0,0,1,0,86.7Z"/></svg>';

  function read() {
    try { const v = localStorage.getItem(KEY); if (v === 'dark' || v === 'light') return v; } catch (e) { }
    return 'light';   // per seguire il sistema: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function apply(t) {
    const dark = t === 'dark';
    const root = document.documentElement;
    if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#070d10' : '#ffffff');
    document.querySelectorAll('[data-theme-toggle]').forEach(b => {
      b.setAttribute('aria-pressed', String(dark));
      const label = dark ? 'Passa al tema chiaro' : 'Passa al tema scuro';
      b.setAttribute('aria-label', label);
      b.setAttribute('title', label);
      const vis = b.querySelector('[data-theme-label]');
      if (vis) vis.textContent = dark ? 'Tema chiaro' : 'Tema scuro';
    });
  }

  function set(t) { try { localStorage.setItem(KEY, t); } catch (e) { } apply(t); }

  function init() {
    apply(read());
    document.querySelectorAll('[data-theme-toggle]').forEach(b => {
      if (b.dataset.themeBound) return;
      b.dataset.themeBound = '1';
      if (!b.innerHTML.trim()) b.innerHTML = ICON;
      const slot = b.querySelector('[data-theme-icon]');
      if (slot && !slot.innerHTML.trim()) slot.innerHTML = ICON;
      b.addEventListener('click', () => {
        set(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });
    });
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
  window.PA_THEME = { read, set, apply };
})();
