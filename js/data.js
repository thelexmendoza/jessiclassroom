/* Datos de la guía: transcritos de "Clase 2 estadistica.pdf" y "Clase 3 estadistica.pdf". */
var EST = window.EST || (window.EST = {});

/* Conjuntos de datos de los ejemplos y ejercicios */
EST.DATA = {
  salarios: [52,54,55,54,53,56,54,58,51,54,54,51,54,55,54,56,52,54,53,55,55,55,52,55,53,57,54,55,53,55,56,53,57,54,53,50,55,52,53,54,52,57,56,51,58,55,53,54,53,56],
  ausencias: [1,0,2,1,3,1,4,3,2,5,3,2,4,2,0,3,1,2,0,2,1,1,0,1,0,0,1,2,1,3,4,0,2,3,2,0,0,2,5,2,2,4,2,1,3,1,2,1,0,2],
  agua: [4,8,8,13,15,20,10,19,9,18,17,16,16,29,17,23,3,17,25,10,18,29,6,23,11,23,10,21,21,6,22,18,13,23,12,23,17,22,18,27,27,17,13,13,10,31,11,26,22,5,5,18,16,13,30,23,2,26,17,15,21,14,29,18,20,9,10,21,9,30,13,18,34,17,4,29,16,12,23,8,26,8,28,8,16,29,18,2,17,13,21,13,16,26,18,9,18,13,12,21,27,21,9,26,24,8,10,16,33,21,14,16,19,17,17,24,5,20,14,16,12,12,5,13,17,7,12,14,1,16,25,20,14,20,14,6,9,13,22,10,6,21,20,5,20,28,17,21,4,33,12,25,9,17,14,20,10,25,12,32,15,25,16,22,13,15,25,2,9,24,25,12,15,22,17,7,24,15,24,11,22,10,21,14],
  notas: [27,36,36,20,43,26,41,27,32,36,36,14,30,36,16,48,36,44,36,22,45,32,37,28,37,36,37,49,29,31,22,33,33,41,32,39,17,38,31,21,23,31,26,28,45,27,36,41,22,26,42,36,28,31,42,42,12,31,41,22,32,39,36,37,31,31,35,24,33,42,13,33,26,42,26,41,26,37,25,26,37,37,29,46,31,25,31,38,25,32,33,17,34,23,26,18,19,31,27,33,26,38,38,31,20,41,32,27,40,31,27,41,31,36,15,16,36,22,21,27,40,21,32,27,21,32,32,42,32,31]
};

/* Baldosas "De las Casas": solo las fi por intervalo (100–800, A = 100), tal como vienen en la Clase 3 */
EST.BALDOSAS_F = [4,10,21,33,18,9,5];

/* Entregables: alimentan las tarjetas del resumen y el checklist */
EST.DELIV = [
  { id:'m1-vocab', meta:'Clase 2 · Repaso',    title:'Repasar n, xi, fi, fa, fr y fra', href:'#m1-vocab' },
  { id:'m1-preg',  meta:'Clase 2 · Preguntas', title:'Preguntas 1, 2 y 3 (frecuencias)', href:'#m1-preguntas' },
  { id:'m1-tabla', meta:'Clase 2 · Ej. 5',     title:'Tabla simple de las ausencias (50 obreras)', href:'#m1-turno' },
  { id:'m1-concl', meta:'Clase 2 · Ej. 6',     title:'3 conclusiones de las ausencias', href:'#m1-turno' },
  { id:'m2-preg',  meta:'Clase 3 · Cuestionario', title:'Preguntas 1, 2 y 3 (intervalos)', href:'#m2-preguntas' },
  { id:'m2-agua8', meta:'Clase 3 · Ej. 4.1',   title:'Agua de 184 familias con m = 8', href:'#m2-agua' },
  { id:'m2-agua9', meta:'Clase 3 · Ej. 4.2',   title:'Agua de 184 familias con m = 9', href:'#m2-agua' },
  { id:'m2-comp',  meta:'Clase 3 · Ej. 4.3',   title:'Comparar las dos tablas del agua', href:'#m2-agua' },
  { id:'m2-notas', meta:'Clase 3 · Ej. 5',     title:'Calificaciones (130): tabla por intervalos + 4 conclusiones', href:'#m2-notas' }
];
