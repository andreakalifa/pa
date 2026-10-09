/* =========================================================
   PREMIUM ACADEMY EXPERIENCE — dati di esempio (placeholder)
   Sostituisci qui eventi, coach e testi: è l'unico file
   da toccare per cambiare i contenuti del sito.

   DATE: la demo si aggiorna da sola. Ogni tappa è definita
   con "w", cioè quante settimane dista dal primo sabato
   utile (w negativo = tappa già conclusa). Quando passerai
   alle date reali, sostituisci "w" con "start: 'AAAA-MM-GG'".
   ========================================================= */
window.PA_DATA = (function () {
  const TODAY = new Date(); TODAY.setHours(10, 0, 0, 0);

  // primo sabato utile dopo oggi: le tappe cadono sempre nel weekend
  const toSat = (6 - TODAY.getDay() + 7) % 7;
  const SAT = new Date(TODAY); SAT.setHours(9, 0, 0, 0);
  SAT.setDate(SAT.getDate() + (toSat < 1 ? toSat + 7 : toSat));
  const iso = dt => new Date(dt.getTime() - dt.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const weeksFromSat = w => { const d = new Date(SAT); d.setDate(d.getDate() + w * 7); return iso(d); };
  const daysFromToday = n => { const d = new Date(TODAY); d.setDate(d.getDate() + n); return iso(d); };

  const categories = [
    { id: 'esoB', label: 'Esordienti B', ages: '8–9 anni', min: 8, max: 9 },
    { id: 'esoA', label: 'Esordienti A', ages: '10–11 anni', min: 10, max: 11 },
    { id: 'rag', label: 'Ragazzi', ages: '12–14 anni', min: 12, max: 14 },
    { id: 'jun', label: 'Juniores', ages: '15–16 anni', min: 15, max: 16 },
    { id: 'ass', label: 'Assoluti', ages: '17+ anni', min: 17, max: 99 },
    { id: 'mas', label: 'Master', ages: '25+ anni', min: 25, max: 99 },
    { id: 'all', label: 'Clinic allenatori', ages: 'Uditori', min: 18, max: 99 }
  ];

  const coaches = [
    { id: 'calvi', name: 'Alessandro Calvi', role: 'Head coach · Tecnica', focus: 'Tecnica di nuotata e virate', img: 'coach-calvi.jpg',
      bio: 'Fondatore di Premium Academy. Porta in vasca un metodo costruito su dettagli piccoli e ripetibili: posizione del capo, rollio, uscita dalla virata. (Bio placeholder da sostituire)',
      stats: [['Anni in vasca', '20+'], ['Clinic tenuti', '120'], ['Atleti seguiti', '3.000+']], tags: ['Stile libero', 'Virate', 'Tecnica'] },
    { id: 'orsi', name: 'Marco Orsi', role: 'Head coach · Velocità', focus: 'Partenze, subacquea e sprint', img: 'coach-orsi.jpg',
      bio: 'Velocista della nazionale italiana. Nei suoi blocchi lavora su reazione dal blocco, fase subacquea e ritmo sui 50 metri. (Bio placeholder da sostituire)',
      stats: [['Nazionale', 'Azzurro'], ['Specialità', '50 / 100 SL'], ['Focus', 'Partenze']], tags: ['Sprint', 'Partenze', '5° stile'] },
    { id: 'ferraris', name: 'Giulia Ferraris', role: 'Guest coach · Dorso', focus: 'Dorso e partenza dal muro', img: null,
      bio: 'Finalista olimpica nei 200 dorso (profilo di esempio). Allena la sensibilità della presa e la gestione della fase subacquea sul dorso.',
      stats: [['Olimpiadi', '2'], ['Medaglie europee', '4'], ['Specialità', '200 DO']], tags: ['Dorso', 'Subacquea'] },
    { id: 'benassi', name: 'Luca Benassi', role: 'Guest coach · Rana', focus: 'Rana, timing e scivolata', img: null,
      bio: 'Ranista azzurro (profilo di esempio). Lavora sul timing tra gambata e bracciata e sulla filamentazione nella scivolata.',
      stats: [['Titoli italiani', '9'], ['Record', '2'], ['Specialità', '100 RA']], tags: ['Rana', 'Timing'] },
    { id: 'monti', name: 'Sara Monti', role: 'Guest coach · Farfalla e misti', focus: 'Farfalla e cambi nei misti', img: null,
      bio: 'Mistista con due partecipazioni olimpiche (profilo di esempio). Specialista dei passaggi di stile e della respirazione in farfalla.',
      stats: [['Olimpiadi', '2'], ['Medaglie mondiali', '1'], ['Specialità', '400 MI']], tags: ['Farfalla', 'Misti'] },
    { id: 'rinaldi', name: 'Davide Rinaldi', role: 'Guest coach · Fondo', focus: 'Ritmo gara e acque libere', img: null,
      bio: 'Fondista e campione europeo di open water (profilo di esempio). Insegna a gestire il ritmo e a nuotare puliti quando si è stanchi.',
      stats: [['Titoli europei', '2'], ['Km in gara', '1.500+'], ['Specialità', '10 km']], tags: ['Fondo', 'Ritmo'] },
    { id: 'vitale', name: 'Chiara Vitale', role: 'Preparatrice atletica', focus: 'Preparazione a secco e mobilità', img: null,
      bio: 'Preparatrice atletica federale (profilo di esempio). Cura la parte a secco: attivazione, mobilità di spalle e core per la tecnica.',
      stats: [['Squadre seguite', '14'], ['Anni', '12'], ['Focus', 'A secco']], tags: ['Mobilità', 'Core'] }
  ];

  // Modello fasce orarie (uguale per ogni tappa, personalizzabile)
  const slotTemplate = [
    { d: 0, start: '09:00', end: '10:30', cat: 'esoA', cap: 20, price: 45, type: 'atleti', focus: 'Stile libero e virata a capriola' },
    { d: 0, start: '10:45', end: '12:15', cat: 'rag', cap: 24, price: 55, type: 'atleti', focus: 'Partenze dal blocco e subacquea' },
    { d: 0, start: '15:00', end: '16:30', cat: 'jun', cap: 24, price: 55, type: 'atleti', focus: 'Virate e 5° stile' },
    { d: 0, start: '16:45', end: '18:15', cat: 'ass', cap: 24, price: 55, type: 'atleti', focus: 'Sprint: partenza, ritmo, arrivo' },
    { d: 1, start: '09:00', end: '10:30', cat: 'esoB', cap: 16, price: 45, type: 'atleti', focus: 'Acquaticità e posizione del corpo' },
    { d: 1, start: '10:45', end: '12:15', cat: 'mas', cap: 20, price: 55, type: 'atleti', focus: 'Efficienza di bracciata' },
    { d: 1, start: '14:30', end: '17:00', cat: 'all', cap: 30, price: 35, type: 'uditori', focus: 'Metodo Premium: come impostare il lavoro tecnico' }
  ];

  const rawEvents = [
    { id: 'roma', w: 2, city: 'Roma', region: 'Lazio', venue: 'Polo Natatorio Roma Nord', address: 'Via dello Sport 12, Roma', pool: 'Vasca 50 m · 10 corsie', lat: 41.93, lon: 12.47, coaches: ['calvi', 'orsi', 'ferraris'], fill: 0.72, hotel: 'Hotel Aurelia (−15% con codice PA)', parking: 'Parcheggio interno gratuito, 200 posti' },
    { id: 'milano', w: 4, city: 'Milano', region: 'Lombardia', venue: 'Centro Nuoto Milano Est', address: 'Viale delle Corsie 4, Milano', pool: 'Vasca 25 m · 8 corsie', lat: 45.47, lon: 9.19, coaches: ['orsi', 'benassi', 'vitale'], fill: 0.46, hotel: 'NH Lambrate (tariffa convenzionata)', parking: 'Parcheggio a pagamento, M2 a 300 m' },
    { id: 'napoli', w: 6, city: 'Napoli', region: 'Campania', venue: 'Piscina Comunale Fuorigrotta', address: 'Via Olimpica 88, Napoli', pool: 'Vasca 50 m · 8 corsie', lat: 40.84, lon: 14.25, coaches: ['calvi', 'monti'], fill: 0.9, hotel: 'Hotel Mergellina (−10%)', parking: 'Parcheggio pubblico adiacente' },
    { id: 'firenze', w: 8, city: 'Firenze', region: 'Toscana', venue: 'Centro Acquatico Firenze Sud', address: 'Via del Galluzzo 21, Firenze', pool: 'Vasca 50 m · 10 corsie', lat: 43.77, lon: 11.25, coaches: ['calvi', 'orsi', 'rinaldi'], fill: 0.31, hotel: 'Hotel Porta Romana (colazione inclusa)', parking: 'Parcheggio interno gratuito' },
    { id: 'bari', w: 11, city: 'Bari', region: 'Puglia', venue: 'Stadio del Nuoto Bari', address: 'Lungomare Sud 3, Bari', pool: 'Vasca 50 m · 8 corsie', lat: 41.12, lon: 16.87, coaches: ['orsi', 'ferraris'], fill: 1, hotel: 'Hotel Adriatico (−15%)', parking: 'Parcheggio gratuito lato mare' },
    { id: 'torino', w: 15, city: 'Torino', region: 'Piemonte', venue: 'Piscina Olimpica Torino', address: 'Corso Sebastopoli 50, Torino', pool: 'Vasca 50 m · 10 corsie', lat: 45.07, lon: 7.69, coaches: ['calvi', 'benassi', 'vitale'], fill: 0.14, hotel: 'Hotel Lingotto (tariffa sport)', parking: 'Parcheggio multipiano a 200 m' },
    { id: 'palermo', w: 18, city: 'Palermo', region: 'Sicilia', venue: 'Piscina Comunale Palermo', address: 'Viale del Fante 11, Palermo', pool: 'Vasca 50 m · 8 corsie', lat: 38.12, lon: 13.36, coaches: ['orsi', 'monti', 'rinaldi'], fill: 0.08, hotel: 'Hotel Favorita (−10%)', parking: 'Parcheggio interno' },
    { id: 'bologna', w: 21, city: 'Bologna', region: 'Emilia-Romagna', venue: 'Centro Nuoto Bologna Est', address: 'Via Stalingrado 77, Bologna', pool: 'Vasca 25 m · 10 corsie', lat: 44.49, lon: 11.34, coaches: ['calvi', 'orsi'], fill: 0.04, hotel: 'Hotel Fiera (convenzione società)', parking: 'Parcheggio gratuito' },
    { id: 'cagliari', w: 25, city: 'Cagliari', region: 'Sardegna', venue: 'Piscina Terramaini', address: 'Via Newton 2, Cagliari', pool: 'Vasca 50 m · 8 corsie', lat: 39.23, lon: 9.13, coaches: ['calvi', 'ferraris', 'vitale'], fill: 0, opensOn: daysFromToday(38), hotel: 'Hotel Poetto (−10%)', parking: 'Parcheggio pubblico' },
    { id: 'pescara', w: -4, city: 'Pescara', region: 'Abruzzo', venue: 'Piscina Le Naiadi', address: 'Viale della Riviera 1, Pescara', pool: 'Vasca 50 m · 10 corsie', lat: 42.46, lon: 14.21, coaches: ['calvi', 'orsi'], fill: 1, hotel: '—', parking: '—' },
    { id: 'verona', w: -20, city: 'Verona', region: 'Veneto', venue: 'Centro Nuoto Verona', address: 'Via Monte Baldo 9, Verona', pool: 'Vasca 25 m · 8 corsie', lat: 45.44, lon: 10.99, coaches: ['calvi', 'benassi'], fill: 1, hotel: '—', parking: '—' }
  ];

  function seeded(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; }; }

  const events = rawEvents.map(e => {
    const rnd = seeded(e.id);
    const start = e.start || weeksFromSat(e.w);           // "start" esplicito oppure calcolato da "w"
    const s = new Date(start + 'T09:00:00');
    const end = new Date(s); end.setDate(end.getDate() + 1);
    const slots = slotTemplate.map((t, i) => {
      const day = new Date(s); day.setDate(day.getDate() + t.d);
      let taken = Math.round(t.cap * Math.min(1, Math.max(0, e.fill + (rnd() - 0.5) * 0.35)));
      if (e.fill >= 1) taken = t.cap;
      if (e.fill === 0) taken = 0;
      return { id: e.id + '-s' + (i + 1), date: iso(day), start: t.start, end: t.end, cat: t.cat, cap: t.cap, taken, price: t.price, type: t.type, focus: t.focus };
    });
    return Object.assign({}, e, { start, startDate: s, endDate: end, slots });
  });

  const testimonials = [
    { name: 'Francesca R.', who: 'Mamma di Tommaso, Esordienti A', city: 'Roma', text: 'Tommaso è tornato a casa ripetendo la virata a voce. In due settimane il suo allenatore ci ha detto che la differenza si vede.' },
    { name: 'Matteo L.', who: 'Juniores, 16 anni', city: 'Pescara', text: 'Mi hanno filmato la partenza e me l’hanno fatta rivedere a bordo vasca. Ho capito in un minuto cosa sbagliavo da un anno.' },
    { name: 'Coach Daniele P.', who: 'Allenatore, Nuoto Club Adriatico', city: 'Pescara', text: 'Abbiamo iscritto 14 ragazzi in blocco. Organizzazione precisa, fasce rispettate al minuto, e io mi sono portato a casa idee per tutta la stagione.' },
    { name: 'Elena V.', who: 'Master, 41 anni', city: 'Verona', text: 'Pensavo fosse una cosa per ragazzini. Invece la fascia Master è stata la mattina di nuoto più utile degli ultimi dieci anni.' }
  ];

  const faq = [
    ['Chi può partecipare?', 'Nuotatori tesserati e non, dagli 8 anni in su. Ogni fascia oraria è dedicata a una categoria, così in acqua si lavora con atleti di livello simile.'],
    ['Serve il certificato medico?', 'Sì, un certificato per attività sportiva non agonistica o agonistica in corso di validità. Lo carichi durante l’iscrizione o nell’area riservata entro 7 giorni dall’evento.'],
    ['Posso iscrivermi a più fasce?', 'Ogni fascia è dedicata a una categoria, quindi di norma un atleta ne frequenta una. Se prenoti più posti, per esempio due fratelli o un gruppo, lo sconto del 15% si applica in automatico.'],
    ['Cosa succede se una fascia è piena?', 'Puoi entrare in lista d’attesa senza pagare. Se si libera un posto ti scriviamo e hai 24 ore per confermare.'],
    ['Posso annullare?', 'Rimborso completo fino a 14 giorni prima dell’evento, 50% fino a 7 giorni. Dopo puoi cedere il posto a un altro atleta della stessa categoria.'],
    ['Sono un allenatore, posso assistere?', 'Sì, con la fascia Clinic allenatori della domenica pomeriggio. Le società possono anche iscrivere più atleti in un’unica pratica.'],
    ['I genitori possono restare in tribuna?', 'Sì, la tribuna è aperta per tutta la durata della fascia. Il piano vasca è riservato ad atleti e staff.'],
    ['Riceverò foto e video?', 'Entro 5 giorni trovi nell’area riservata la galleria dell’evento e, per le fasce con video analisi, il clip della tua partenza o virata.']
  ];

  const articles = [
    { title: 'Tre errori nella virata a capriola che ti costano mezzo secondo', tag: 'Virate', min: 4, date: '2026-09-02', coach: 'calvi' },
    { title: 'Partenza dal blocco: cosa guardare nei primi 15 metri', tag: 'Partenze', min: 6, date: '2026-08-20', coach: 'orsi' },
    { title: 'Il quinto stile spiegato ai genitori', tag: '5° stile', min: 3, date: '2026-07-28', coach: 'orsi' },
    { title: 'Riscaldamento a secco in 12 minuti prima della gara', tag: 'A secco', min: 5, date: '2026-07-10', coach: 'vitale' }
  ];

  const sponsors = ['Nordic Lane', 'Vela Sport', 'H2O Lab', 'Acquaviva', 'Blocco Otto', 'Turn & Go'];

  const sessions = [
    { id: 'tecnica', title: 'Tecnica di nuotata', text: 'Posizione del corpo, presa e rollio, lavorati su esercizi progressivi.' },
    { id: 'virate', title: 'Virate', text: 'Avvicinamento al muro, capriola, spinta e uscita in subacquea.' },
    { id: 'partenze', title: 'Partenze', text: 'Reazione dal blocco, entrata in acqua e primi 15 metri.' },
    { id: 'quinto', title: '5° stile', text: 'La gambata a delfino subacquea che fa la differenza dopo ogni muro.' }
  ];

  const steps = [
    ['Scegli la tappa', 'Filtra per città, mese o categoria e apri il programma.'],
    ['Prenota la fascia', 'Ogni fascia è una categoria: scegli quella giusta e vedi i posti rimasti.'],
    ['Carica i documenti', 'Dati atleta, certificato medico e, per i minori, il consenso del genitore.'],
    ['Entra in vasca', 'Mostra il QR al check-in. Foto, video e attestato arrivano nell’area riservata.']
  ];

  return { TODAY, categories, coaches, events, testimonials, faq, articles, sponsors, sessions, steps,
    brand: { name: 'Premium Academy Experience', short: 'Premium Academy', claim: 'Un weekend imperdibile interamente dedicato ai nuotatori', whatsapp: '393337442984', phone: '333 744 2984', email: 'info@premiumacademy.it', instagram: '#', facebook: '#' } };
})();
