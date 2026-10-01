# jessiclassroom
Sitio de aprendizaje para Jessi

## Estadística sin drama

Guía interactiva de las tareas de Estadística (Clases 2 y 3), pensada para estudiar con TDAH. HTML, CSS y JS sin build: se abre con doble clic en `index.html`.

### Estructura

```
jessiclassroom/
├── index.html          Marcado de la página y avatares SVG (sprite inline)
├── css/
│   └── styles.css      Tokens de color en :root y todos los componentes
└── js/
    ├── data.js         Datos de clase y lista de entregables (window.EST)
    └── app.js          Lógica: tablas, contador, calculadora, acordeones, carrusel, checklist, Pomodoro
```

`data.js` debe cargarse antes que `app.js`.

En local también existen `insuco/` (PDFs de clase) y la referencia de estilos; están en `.gitignore` y no se suben.

### Dónde cambiar cosas

- **Paleta:** solo los tokens de `:root` al inicio de `css/styles.css`.
- **Datos o entregables:** `js/data.js`. Las tablas de solución se calculan a partir de esos datos, no están escritas a mano.
- **Textos y diálogos de los personajes:** `index.html`. Los mensajes de celebración y del temporizador están en `js/app.js` (`CHEERS` y `pSwitch`).

### Notas

- Los avatares están inline en `index.html` porque `<use href="archivo.svg#id">` no funciona al abrir la página como archivo local en Chrome.
- El avance se guarda en `localStorage` con la clave `estadisticaTDAH.v1`, solo en el navegador donde se abre.
- Poppins se carga desde Google Fonts; sin conexión se usa la fuente de respaldo.
