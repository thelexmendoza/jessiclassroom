/* Catálogo de guías que aparecen en la portada (index.html).
   Para agregar una tarea nueva, copia un objeto y cambia sus datos:
   - id:          identificador único, sin espacios
   - materia:     nombre de la materia; también se usa para el filtro
   - tema:        título de la tarjeta
   - detalle:     clases o unidad que cubre
   - href:        página de la guía (en la raíz del sitio)
   - entregables: cuántos entregables tiene su checklist
   - storageKey:  clave de localStorage donde la guía guarda { checks: { id: true } }
   - color:       acento de la tarjeta: 'violeta', 'cian', 'amarillo', 'rosa' o 'verde'
   - icono:       'histograma' u otro de los íconos definidos en js/portada.js
   - fecha:       fecha de la clase o de entrega (AAAA-MM-DD), sirve para ordenar */
window.CLASES = [
  {
    id: 'estadistica-frecuencias',
    materia: 'Estadística',
    tema: 'Distribución de frecuencias',
    detalle: 'Clases 2 y 3 · simple y por intervalos',
    href: 'estadistica.html',
    entregables: 9,
    storageKey: 'estadisticaTDAH.v1',
    color: 'violeta',
    icono: 'histograma',
    fecha: '2026-09-12'
  }
];
