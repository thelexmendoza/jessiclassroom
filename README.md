# jessiclassroom
Sitio de aprendizaje para Jessi

Guías de estudio interactivas pensadas para estudiar con TDAH. HTML, CSS y JS sin build: se abre con doble clic en `index.html`, que es la portada con una tarjeta por tarea.

## Estructura

```
jessiclassroom/
├── index.html          Portada: grid de tareas con el avance de cada una
├── estadistica.html    Guía de Estadística (Clases 2 y 3): marcado y avatares SVG (sprite inline)
├── favicon.ico         Ícono del sitio (16–256 px); favicon.svg y apple-touch-icon.png para navegadores modernos y iPhone
├── css/
│   ├── styles.css      Tokens de color en :root y componentes compartidos
│   └── portada.css     Grid y tarjetas de la portada
└── js/
    ├── clases.js       Catálogo de tareas que muestra la portada
    ├── portada.js      Pinta las tarjetas, el avance y los filtros por materia
    ├── data.js         Datos de la guía de Estadística y sus entregables (window.EST)
    └── app.js          Lógica de la guía: tablas, contador, calculadora, acordeones, carrusel, checklist, Pomodoro
```

En `estadistica.html`, `data.js` debe cargarse antes que `app.js`.

En local también existen `insuco/` (PDFs de clase) y la referencia de estilos; están en `.gitignore` y no se suben.

## Agregar una tarea nueva

1. Crea la página de la guía en la raíz, por ejemplo `biologia.html`, con su propio checklist. Que guarde su avance en `localStorage` con el formato `{ checks: { idEntregable: true } }`.
2. Agrega un objeto en `js/clases.js` con su materia, tema, página, número de entregables y clave de `localStorage`. Los campos están explicados al inicio del archivo.
3. La portada la muestra sola. Cuando hay más de una materia, aparecen los filtros.

## Dónde cambiar cosas

- **Paleta:** solo los tokens de `:root` al inicio de `css/styles.css`.
- **Datos o entregables de Estadística:** `js/data.js`. Las tablas de solución se calculan a partir de esos datos, no están escritas a mano.
- **Textos y diálogos de los personajes:** `estadistica.html`. Los mensajes de celebración y del temporizador están en `js/app.js` (`CHEERS` y `pSwitch`).

## Notas

- Los avatares están inline en `estadistica.html` porque `<use href="archivo.svg#id">` no funciona al abrir la página como archivo local en Chrome.
- El avance se guarda en `localStorage` (Estadística usa la clave `estadisticaTDAH.v1`), solo en el navegador donde se abre.
- Poppins se carga desde Google Fonts; sin conexión se usa la fuente de respaldo.
