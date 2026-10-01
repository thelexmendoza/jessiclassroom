(function () {
  'use strict';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'estadisticaTDAH.v1';

  var DATA = window.EST.DATA, BALDOSAS_F = window.EST.BALDOSAS_F, DELIV = window.EST.DELIV;

  /* ---------- Almacenamiento seguro ---------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* sin almacenamiento: la página sigue funcionando */ } }
  var state = load();
  state.checks = state.checks || {};
  state.aus = state.aus || [];

  /* ---------- Utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fmt(x, d) { var v = Number(x.toFixed(d)); return String(v); }
  function fix(x, d) { return x.toFixed(d); }
  function h(tag, attrs, html) { var el = document.createElement(tag); if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); }); if (html != null) el.innerHTML = html; return el; }

  function simpleRows(d) {
    var c = {}; d.forEach(function (x) { c[x] = (c[x] || 0) + 1; });
    var keys = Object.keys(c).map(Number).sort(function (a, b) { return a - b; });
    var fa = 0, n = d.length;
    return keys.map(function (k) { fa += c[k]; return { x: k, f: c[k], fa: fa, fr: c[k] / n, fra: fa / n }; });
  }
  function intervalRows(d, L, A, m) {
    var n = d.length, fa = 0, rows = [];
    for (var i = 0; i < m; i++) {
      var lo = L + i * A, hi = lo + A;
      var f = d.filter(function (x) { return x >= lo - 1e-9 && x < hi - 1e-9; }).length;
      fa += f;
      rows.push({ lo: lo, hi: hi, x: (lo + hi) / 2, f: f, fa: fa, fr: f / n, fra: fa / n });
    }
    return rows;
  }
  function fromFreq(fs, L, A) {
    var n = fs.reduce(function (a, b) { return a + b; }, 0), fa = 0;
    return fs.map(function (f, i) { var lo = L + i * A, hi = lo + A; fa += f; return { lo: lo, hi: hi, x: (lo + hi) / 2, f: f, fa: fa, fr: f / n, fra: fa / n }; });
  }

  var HEAD = { x: 'x<sub>i</sub>', iv: 'Intervalo [L<sub>i</sub>, L<sub>s</sub>)', mc: 'Marca X', f: 'f<sub>i</sub>', fa: 'fa', fr: 'fr', fra: 'fra' };
  function renderTable(table, rows, cols, opts) {
    opts = opts || {};
    var dec = opts.dec || 2, isNew = opts.isNew || [], hot = opts.hot;
    var html = '';
    if (opts.caption) html += '<caption>' + opts.caption + '</caption>';
    html += '<thead><tr>' + cols.map(function (c) { return '<th scope="col">' + HEAD[c] + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr' + (hot != null && String(r.x) === String(hot) ? ' class="is-hot"' : '') + '>';
      cols.forEach(function (c) {
        var v;
        if (c === 'iv') v = fmt(r.lo, 2) + ' – ' + fmt(r.hi, 2);
        else if (c === 'mc') v = fmt(r.x, 2);
        else if (c === 'fr' || c === 'fra') v = fix(r[c], dec);
        else v = r[c];
        html += '<td' + (isNew.indexOf(c) > -1 ? ' class="is-new"' : '') + '>' + v + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody>';
    var n = rows.length ? rows[rows.length - 1].fa : 0;
    if (cols.indexOf('f') > -1) {
      html += '<tfoot><tr>' + cols.map(function (c, i) {
        if (i === 0) return '<td>Sumas</td>';
        if (c === 'f') return '<td>' + n + '</td>';
        if (c === 'fr') return '<td>' + fix(1, dec) + '</td>';
        return '<td></td>';
      }).join('') + '</tr></tfoot>';
    }
    table.innerHTML = html;
  }

  /* ---------- Tablas declaradas en el HTML ---------- */
  $all('table[data-simple]').forEach(function (t) {
    renderTable(t, simpleRows(DATA[t.dataset.simple]), t.dataset.cols.split(','), {
      caption: t.dataset.caption, hot: t.dataset.hot, isNew: (t.dataset.new || '').split(',')
    });
  });
  $all('table[data-interval]').forEach(function (t) {
    var rows = intervalRows(DATA[t.dataset.interval], +t.dataset.l, +t.dataset.a, +t.dataset.m);
    renderTable(t, rows, ['iv','mc','f','fa','fr','fra'], { caption: t.dataset.caption, dec: 3 });
  });
  $all('table[data-baldosas]').forEach(function (t) {
    renderTable(t, fromFreq(BALDOSAS_F, 100, 100), ['iv','mc','f','fa','fr','fra'], { caption: 'Resistencia de 100 baldosas (Kg/cm²)' });
  });

  /* ---------- Chips de datos ---------- */
  function fillChips(el, arr) { el.innerHTML = arr.map(function (v) { return '<span class="est-chip">' + v + '</span>'; }).join(''); }
  $all('[data-chips]').forEach(function (el) {
    var arr = DATA[el.dataset.chips].slice();
    if (el.hasAttribute('data-sorted')) arr.sort(function (a, b) { return a - b; });
    el.setAttribute('aria-label', arr.length + ' datos');
    fillChips(el, arr);
  });
  $all('[data-sort]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.getElementById(btn.dataset.sort);
      var on = btn.getAttribute('aria-pressed') !== 'true';
      var arr = DATA[el.dataset.chips].slice();
      if (on) arr.sort(function (a, b) { return a - b; });
      fillChips(el, arr);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'Volver al orden original' : 'Ordenar de menor a mayor';
      var mm = $('[data-minmax="' + btn.dataset.sort + '"]');
      if (mm && mm.getAttribute('aria-pressed') === 'true') markMinMax(el, true);
    });
  });
  function markMinMax(el, on) {
    var arr = DATA[el.dataset.chips], mn = Math.min.apply(null, arr), mx = Math.max.apply(null, arr);
    $all('.est-chip', el).forEach(function (c) {
      var v = +c.textContent;
      c.classList.toggle('is-min', on && v === mn);
      c.classList.toggle('is-max', on && v === mx);
    });
  }
  $all('[data-minmax]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      markMinMax(document.getElementById(btn.dataset.minmax), on);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'Quitar resaltado' : 'Resaltar mínimo y máximo';
    });
  });

  /* ---------- Toast con personaje ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(who, msg) {
    $('use', toastEl).setAttribute('href', '#av-' + who);
    $('p', toastEl).textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 4200);
  }
  var CHEERS = [
    ['siete', '¡Listo! Esto merece música épica. No hay presupuesto para música épica. Imagínala.'],
    ['moda', 'Entregable completado. Esto es tendencia. Tú eres tendencia.'],
    ['fermin', 'Uno más al montón. Lo guardo. Aquí no se tira nada.'],
    ['siete', 'Otro menos. A ti sí te redondean hacia arriba. A mí nunca.'],
    ['moda', 'Ok, eso estuvo icónico. Siguiente.'],
    ['fermin', 'Acumulado. Lento pero seguro. Como yo.']
  ];
  var cheerIdx = 0;

  /* ---------- Contador de ausencias ---------- */
  var ausChips = $('#ausChips'), ausTally = $('#ausTally'), ausStatus = $('#ausStatus');
  ausChips.innerHTML = DATA.ausencias.map(function (v, i) {
    return '<button type="button" class="est-chip" data-i="' + i + '" aria-pressed="false" aria-label="Dato ' + (i + 1) + ': ' + v + ' días">' + v + '</button>';
  }).join('');
  function tallyMarks(n) { var s = ''; for (var i = 0; i < n; i++) { s += '|'; if (i % 5 === 4) s += ' '; } return s || '—'; }
  function renderAus(announce) {
    var marked = state.aus, counts = [0,0,0,0,0,0];
    $all('.est-chip', ausChips).forEach(function (c) {
      var on = marked.indexOf(+c.dataset.i) > -1;
      c.classList.toggle('is-marked', on);
      c.setAttribute('aria-pressed', String(on));
      if (on) counts[DATA.ausencias[+c.dataset.i]]++;
    });
    var total = marked.length;
    ausStatus.textContent = total + ' de 50 contados';
    var html = '<thead><tr><th scope="col">x<sub>i</sub> (días)</th><th scope="col" style="text-align:left">Palomitas</th><th scope="col">Conteo</th></tr></thead><tbody>';
    counts.forEach(function (c, v) { html += '<tr><td>' + v + '</td><td class="est-tally">' + tallyMarks(c) + '</td><td>' + c + '</td></tr>'; });
    html += '</tbody><tfoot><tr><td>Total</td><td></td><td>' + total + '</td></tr></tfoot>';
    ausTally.innerHTML = html;
    if (announce && total === 50) toast('moda', '¡Contaste los 50! Ahora mira qué valor ganó. Pista: soy yo. Siempre soy yo.');
  }
  ausChips.addEventListener('click', function (e) {
    var b = e.target.closest('.est-chip'); if (!b) return;
    var i = +b.dataset.i, k = state.aus.indexOf(i);
    if (k > -1) state.aus.splice(k, 1); else state.aus.push(i);
    save(state); renderAus(true);
  });
  $('#ausReset').addEventListener('click', function () { state.aus = []; save(state); renderAus(false); });
  renderAus(false);

  /* ---------- Tooltips: que no se salgan de la pantalla ---------- */
  $all('.est-term').forEach(function (term) {
    var tip = $('.est-tooltip', term);
    function place() {
      term.style.setProperty('--tip-x', '0px');
      var r = tip.getBoundingClientRect(), margin = 12, shift = 0;
      if (r.left < margin) shift = margin - r.left;
      else if (r.right > window.innerWidth - margin) shift = window.innerWidth - margin - r.right;
      term.style.setProperty('--tip-x', shift + 'px');
    }
    term.addEventListener('mouseenter', place);
    term.addEventListener('focusin', place);
  });

  /* ---------- Entregables + checklist ---------- */
  var delivList = $('#delivList'), checkList = $('#checkList');
  delivList.innerHTML = DELIV.map(function (d) {
    return '<a class="est-deliv__item" href="' + d.href + '" data-deliv="' + d.id + '"><span class="est-deliv__check" aria-hidden="true">✔</span><span><span class="est-deliv__meta">' + d.meta + '</span><span class="est-deliv__title">' + d.title + '</span><span class="sr-only" data-status> (pendiente)</span></span></a>';
  }).join('');
  checkList.innerHTML = DELIV.map(function (d) {
    return '<li><label class="est-check"><input type="checkbox" data-check="' + d.id + '"><span><span class="est-check__meta">' + d.meta + '</span><span class="est-check__text">' + d.title + '</span></span></label></li>';
  }).join('');
  // El repaso de vocabulario también se puede marcar en su bloque.
  var vocabDone = h('label', { 'class': 'est-done', style: 'margin-top:16px' }, '<input type="checkbox" data-check="m1-vocab"> Ya volteé y entendí las 6 tarjetas');
  $('#m1-vocab').appendChild(vocabDone);

  function syncChecks() {
    var done = 0;
    DELIV.forEach(function (d) {
      var on = !!state.checks[d.id]; if (on) done++;
      $all('input[data-check="' + d.id + '"]').forEach(function (i) { i.checked = on; });
      var card = $('[data-deliv="' + d.id + '"]');
      card.classList.toggle('is-done', on);
      $('[data-status]', card).textContent = on ? ' (hecho)' : ' (pendiente)';
    });
    var pct = Math.round(done / DELIV.length * 100);
    $('#progFill').style.transform = 'scaleX(' + (done / DELIV.length) + ')';
    $('#navProgress').style.transform = 'scaleX(' + (done / DELIV.length) + ')';
    $('#progBar').setAttribute('aria-valuenow', done);
    $('#progBar').setAttribute('aria-valuemax', DELIV.length);
    $('#progLabel').textContent = done + ' de ' + DELIV.length + ' entregables' + (done === DELIV.length ? ' · ¡todo listo!' : '');
    $('#heroPct').textContent = pct + '%';
    return done;
  }
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t.matches || !t.matches('input[data-check]')) return;
    state.checks[t.dataset.check] = t.checked; save(state);
    var done = syncChecks();
    if (t.checked) {
      if (done === DELIV.length) toast('siete', 'TODO entregado. Estoy llorando. De felicidad. Hasta el .64 aplaude.');
      else { var c = CHEERS[cheerIdx++ % CHEERS.length]; toast(c[0], c[1]); }
    }
  });
  $('#resetAll').addEventListener('click', function () {
    if (!window.confirm('¿Borrar todas las marcas de avance?')) return;
    state.checks = {}; state.aus = []; save(state); syncChecks(); renderAus(false);
    toast('fermin', 'Borrado. Me duele, pero lo hice.');
  });
  syncChecks();

  /* ---------- Tarjetas que se voltean ---------- */
  $all('.est-flip__inner').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.parentElement, on = !card.classList.contains('is-flipped');
      card.classList.toggle('is-flipped', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  });
  // Volteo automático de la primera tarjeta al entrar en pantalla (como timeline-auto-flip.js).
  if (!REDUCED && 'IntersectionObserver' in window) {
    $all('[data-autoflip]').forEach(function (group) {
      var first = $('.est-flip', group); if (!first) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.disconnect();
          setTimeout(function () {
            if (first.classList.contains('is-flipped')) return;
            first.classList.add('is-flipped');
            $('.est-flip__inner', first).setAttribute('aria-pressed', 'true');
          }, 1500);
        });
      }, { threshold: 0.35 });
      io.observe(group);
    });
  }

  /* ---------- Acordeones ---------- */
  $all('.est-acc__btn').forEach(function (btn, i) {
    var panel = btn.nextElementSibling, id = 'acc-' + i;
    panel.id = id; btn.setAttribute('aria-controls', id);
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      btn.parentElement.classList.toggle('is-open', open);
    });
  });

  /* ---------- Carruseles ---------- */
  $all('[data-carousel]').forEach(function (car) {
    var track = $('.est-carousel__track', car), slides = $all('.est-carousel__slide', car);
    var dots = $('.est-carousel__dots', car), count = $('.est-carousel__count', car);
    var prev = $('[data-prev]', car), next = $('[data-next]', car), cur = 0;
    dots.innerHTML = slides.map(function (_, i) { return '<button type="button" class="est-carousel__dot" role="tab" aria-label="Ir al paso ' + (i + 1) + '"></button>'; }).join('');
    var dotEls = $all('.est-carousel__dot', dots);
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var s = slides[i];
      track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2, behavior: REDUCED ? 'auto' : 'smooth' });
      set(i);
    }
    function set(i) {
      cur = i;
      dotEls.forEach(function (d, k) { d.classList.toggle('is-active', k === i); d.setAttribute('aria-selected', String(k === i)); });
      count.textContent = (i + 1) + ' / ' + slides.length;
      prev.disabled = i === 0; next.disabled = i === slides.length - 1;
    }
    prev.addEventListener('click', function () { go(cur - 1); });
    next.addEventListener('click', function () { go(cur + 1); });
    dotEls.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    var raf;
    track.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bd = Infinity;
        slides.forEach(function (s, i) { var d = Math.abs(s.offsetLeft + s.clientWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
        if (best !== cur) set(best);
      });
    });
    car.addEventListener('keydown', function (e) {
      if (e.target.closest('input,select')) return;
      if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); }
    });
    set(0);
  });

  /* ---------- Calculadora de intervalos ---------- */
  var cData = $('#cData'), cM = $('#cM'), cA = $('#cA'), cL = $('#cL'), cOut = $('#cOut'), cChecks = $('#cChecks');
  var cShow = $('#cShow'), cWrap = $('#cTableWrap'), cTable = $('#cTable');
  function calc() {
    var d = DATA[cData.value], n = d.length;
    var mn = Math.min.apply(null, d), mx = Math.max.apply(null, d), R = mx - mn;
    var st = 1 + 3.322 * Math.log10(n);
    var m = Math.round(+cM.value) || 0, A = parseFloat(cA.value);
    var items = [['n', n], ['X<sub>min</sub>', mn], ['X<sub>max</sub>', mx], ['R', R], ['Sturges', fmt(st, 2)], ['R ÷ m', m ? fmt(R / m, 3) : '—']];
    var checks = [], ok = false;
    if (A > 0 && m > 0) {
      var Ra = m * A, a = Ra - R;
      var Lsug = Math.floor(mn - a / 2); if (Lsug < 0 && mn >= 0) Lsug = 0;
      var L = cL.value === '' ? Lsug : parseFloat(cL.value);
      var LS = L + m * A;
      items.push(['Ra = m·A', fmt(Ra, 2)], ['a = Ra − R', fmt(a, 2)], ['LIPI', fmt(L, 2) + (cL.value === '' ? ' (sugerido)' : '')], ['LSUI', fmt(LS, 2)]);
      var c1 = A > R / m, c2 = a >= 0 && a <= A, c3 = L <= mn, c4 = LS > mx;
      checks.push([c1, 'A es mayor que R ÷ m (' + fmt(R / m, 3) + ')']);
      checks.push([c2, 'El sobrante a (' + fmt(a, 2) + ') no es mayor que A']);
      checks.push([c3, 'El primer intervalo empieza en o antes de X<sub>min</sub>']);
      checks.push([c4, 'El último intervalo termina después de X<sub>max</sub> (intervalos abiertos a la derecha)']);
      ok = c1 && c2 && c3 && c4;
      calc.rows = intervalRows(d, L, A, m);
      calc.caption = (cData.value === 'agua' ? 'Agua' : 'Calificaciones') + ' · m = ' + m + ', A = ' + fmt(A, 2) + ', LIPI = ' + fmt(L, 2);
    } else {
      checks.push([false, 'Escribe una amplitud A para ver el resto']);
      calc.rows = null;
    }
    cOut.innerHTML = items.map(function (it) { return '<li><span>' + it[0] + '</span><b>' + it[1] + '</b></li>'; }).join('');
    cChecks.innerHTML = checks.map(function (c) { return '<li class="' + (c[0] ? 'ok' : 'bad') + '">' + c[1] + '</li>'; }).join('');
    cShow.disabled = !calc.rows;
    if (calc.rows) renderTable(cTable, calc.rows, ['iv','mc','f','fa','fr','fra'], { caption: calc.caption + (ok ? '' : ' · ⚠ revisa las reglas'), dec: 3 });
    else { cWrap.hidden = true; cShow.setAttribute('aria-expanded', 'false'); cShow.textContent = 'Ver la tabla que resulta'; }
  }
  [cData, cM, cA, cL].forEach(function (el) { el.addEventListener('input', calc); });
  cData.addEventListener('change', function () { cM.value = 8; cA.value = ''; cL.value = ''; calc(); });
  cShow.addEventListener('click', function () {
    var open = cWrap.hidden;
    cWrap.hidden = !open;
    cShow.setAttribute('aria-expanded', String(open));
    cShow.textContent = open ? 'Ocultar la tabla' : 'Ver la tabla que resulta';
  });
  calc();

  /* ---------- Navegación ---------- */
  var subnav = $('#subnav'), hero = $('#inicio'), toggle = $('#navToggle'), menu = $('#navMenu');
  function onScroll() { subnav.classList.toggle('is-visible', window.scrollY > hero.offsetHeight * 0.6); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
  });
  $all('.est-subnav__link').forEach(function (a) {
    a.addEventListener('click', function () { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); });
  });
  if ('IntersectionObserver' in window) {
    var links = $all('.est-subnav__link');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          var on = l.getAttribute('href') === '#' + en.target.id;
          l.classList.toggle('is-active', on);
          if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['inicio','entregables','mision-1','mision-2','checklist'].forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ---------- Pomodoro 15 + 5 ---------- */
  var P = { focus: 15 * 60, rest: 5 * 60 };
  var pomo = { mode: 'focus', left: P.focus, running: false, timer: null, started: false };
  var fab = $('#pomoFab'), panel = $('#pomoPanel'), tEl = $('#pomoTime'), fabT = $('#pomoFabTime');
  var modeEl = $('#pomoMode'), stEl = $('#pomoState'), tog = $('#pomoToggle'), skip = $('#pomoSkip');
  function mmss(s) { var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }
  function pRender() {
    tEl.textContent = fabT.textContent = mmss(pomo.left);
    modeEl.textContent = pomo.mode === 'focus' ? 'Foco · 15 min' : 'Descanso · 5 min';
    skip.textContent = pomo.mode === 'focus' ? 'Saltar a descanso' : 'Saltar a foco';
    tog.textContent = pomo.running ? 'Pausar' : (pomo.started ? 'Seguir' : 'Iniciar');
    stEl.className = 'est-pomo__state' + (pomo.running ? ' is-running' : (pomo.started ? ' is-paused' : ''));
    stEl.textContent = pomo.running ? (pomo.mode === 'focus' ? 'Corriendo · a lo tuyo' : 'Descansando') : (pomo.started ? 'En pausa' : 'Listo para empezar');
    fab.classList.toggle('is-running', pomo.running);
    fab.classList.toggle('is-paused', !pomo.running && pomo.started);
    fab.setAttribute('aria-label', 'Temporizador: ' + mmss(pomo.left) + ', ' + stEl.textContent);
  }
  function pSwitch(mode) {
    pomo.mode = mode; pomo.left = P[mode];
    if (mode === 'rest') toast('siete', 'Descanso de 5. Levántate, toma agua y estírate. Las redes pueden esperar… un poquito.');
    else toast('moda', 'Volvimos. Otros 15 minutos de pura tendencia.');
  }
  function pTick() {
    pomo.left--;
    if (pomo.left <= 0) pSwitch(pomo.mode === 'focus' ? 'rest' : 'focus');
    pRender();
  }
  function pStart() { if (pomo.running) return; pomo.running = true; pomo.started = true; pomo.timer = setInterval(pTick, 1000); pRender(); }
  function pPause() { pomo.running = false; clearInterval(pomo.timer); pRender(); }
  function openPanel(open) { panel.hidden = !open; fab.setAttribute('aria-expanded', String(open)); }
  fab.addEventListener('click', function () { openPanel(panel.hidden); });
  tog.addEventListener('click', function () { pomo.running ? pPause() : pStart(); });
  $('#pomoReset').addEventListener('click', function () { pPause(); pomo.mode = 'focus'; pomo.left = P.focus; pomo.started = false; pRender(); });
  skip.addEventListener('click', function () { pSwitch(pomo.mode === 'focus' ? 'rest' : 'focus'); pRender(); });
  $all('[data-pomo-start]').forEach(function (b) { b.addEventListener('click', function () { openPanel(true); pStart(); toast('siete', '15 minutos. Tú y yo. Y nada de abrir otra pestaña "solo un segundo".'); }); });
  pRender();
})();
