(function () {
  'use strict';
  var CLASES = window.CLASES || [];

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* Íconos de materia (SVG en línea, usan el color de acento de la tarjeta) */
  var ICONOS = {
    histograma: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="36" width="9" height="16" rx="2" fill="currentColor" opacity=".55"/><rect x="21.5" y="26" width="9" height="26" rx="2" fill="currentColor" opacity=".55"/><rect x="33" y="14" width="9" height="38" rx="2" fill="currentColor"/><rect x="44.5" y="30" width="9" height="22" rx="2" fill="currentColor" opacity=".55"/></svg>',
    libro: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 14h16a6 6 0 0 1 6 6v32a5 5 0 0 0-5-5H12Z" fill="currentColor" opacity=".55"/><path d="M52 14H36a6 6 0 0 0-6 6v32a5 5 0 0 1 5-5h17Z" fill="currentColor"/></svg>'
  };

  /* Avance guardado por cada guía: { checks: { id: true } } */
  function avance(c) {
    var hechos = 0;
    try {
      var s = JSON.parse(localStorage.getItem(c.storageKey)) || {};
      var checks = s.checks || {};
      Object.keys(checks).forEach(function (k) { if (checks[k]) hechos++; });
    } catch (e) { /* sin almacenamiento: se muestra en cero */ }
    return Math.min(hechos, c.entregables);
  }
  function estado(h, total) {
    if (h === 0) return { clase: 'nueva', texto: 'Sin empezar', cta: 'Empezar' };
    if (h >= total) return { clase: 'lista', texto: 'Completa ✔', cta: 'Repasar' };
    return { clase: 'curso', texto: 'En curso', cta: 'Continuar' };
  }

  var datos = CLASES.map(function (c) {
    var h = avance(c);
    return { c: c, hechos: h, est: estado(h, c.entregables) };
  });
  // Primero lo que está en curso, luego lo nuevo, al final lo completo; dentro, lo más reciente primero.
  var ORDEN = { curso: 0, nueva: 1, lista: 2 };
  datos.sort(function (a, b) {
    return (ORDEN[a.est.clase] - ORDEN[b.est.clase]) || String(b.c.fecha).localeCompare(String(a.c.fecha));
  });

  /* Resumen */
  var totalEnt = 0, totalHechos = 0, completas = 0;
  datos.forEach(function (d) { totalEnt += d.c.entregables; totalHechos += d.hechos; if (d.est.clase === 'lista') completas++; });
  $('#hubStats').innerHTML = [
    [datos.length, datos.length === 1 ? 'guía' : 'guías'],
    [totalHechos + '/' + totalEnt, 'entregables'],
    [completas, completas === 1 ? 'completa' : 'completas']
  ].map(function (s) { return '<div class="est-stat-card"><div class="est-stat-card__num">' + s[0] + '</div><div class="est-stat-card__label">' + s[1] + '</div></div>'; }).join('');

  /* Tarjetas */
  var grid = $('#hubGrid');
  function tarjeta(d) {
    var c = d.c, pct = c.entregables ? d.hechos / c.entregables : 0;
    return '<li class="hub-card hub-card--' + esc(c.color || 'violeta') + '" data-materia="' + esc(c.materia) + '">' +
      '<a class="hub-card__link" href="' + esc(c.href) + '">' +
        '<span class="hub-card__top">' +
          '<span class="hub-card__icon">' + (ICONOS[c.icono] || ICONOS.libro) + '</span>' +
          '<span class="hub-card__chip hub-card__chip--' + d.est.clase + '">' + d.est.texto + '</span>' +
        '</span>' +
        '<span class="hub-card__materia">' + esc(c.materia) + '</span>' +
        '<span class="hub-card__tema">' + esc(c.tema) + '</span>' +
        '<span class="hub-card__detalle">' + esc(c.detalle) + '</span>' +
        '<span class="hub-card__bar" aria-hidden="true"><span style="transform:scaleX(' + pct + ')"></span></span>' +
        '<span class="hub-card__foot"><span>' + d.hechos + ' de ' + c.entregables + ' entregables</span><span class="hub-card__cta">' + d.est.cta + ' →</span></span>' +
      '</a></li>';
  }
  var proxima = '<li class="hub-card hub-card--proxima" data-materia="*" aria-label="Espacio para la próxima guía">' +
    '<span class="hub-card__icon">' + ICONOS.libro + '</span>' +
    '<span class="hub-card__tema">Próxima tarea</span>' +
    '<span class="hub-card__detalle">Cuando llegue una clase nueva, su guía aparecerá aquí.</span></li>';

  function pintar(filtro) {
    grid.innerHTML = datos.filter(function (d) { return !filtro || d.c.materia === filtro; }).map(tarjeta).join('') + (filtro ? '' : proxima);
  }

  /* Filtros por materia: solo aparecen cuando hay más de una */
  var materias = datos.map(function (d) { return d.c.materia; }).filter(function (m, i, a) { return a.indexOf(m) === i; }).sort();
  var filtros = $('#hubFilters');
  if (materias.length > 1) {
    filtros.innerHTML = ['Todas'].concat(materias).map(function (m, i) {
      return '<button type="button" class="hub-filter" data-materia="' + (i ? esc(m) : '') + '" aria-pressed="' + (i === 0) + '">' + esc(m) + '</button>';
    }).join('');
    filtros.addEventListener('click', function (e) {
      var b = e.target.closest('.hub-filter'); if (!b) return;
      Array.prototype.forEach.call(filtros.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      pintar(b.dataset.materia);
    });
  } else {
    filtros.hidden = true;
  }
  pintar('');
})();
