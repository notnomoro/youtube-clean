# Changelog

## [1.0.0] - 2026-11-26

Primera versión que se puede instalar.

### Añadido

- **Panel** (`popup/`): Protección, y dentro Anuncios, Shorts y Enfoque. Cada interruptor se guarda al momento.
- **Anuncios** (`content/content.js`): si el reproductor está en un anuncio, lo silencia, lo acelera y pulsa saltar. Al acabar, devuelve el volumen y la velocidad de antes. Los banners y los anuncios del feed se esconden por CSS.
- **Shorts**: una URL `/shorts/ID` pasa a `/watch?v=ID`. Se puede ocultar la pestaña y las tarjetas del inicio. Si la redirección está apagada, queda un botón para abrir el reproductor normal.
- **Enfoque**: feed, recomendados, tendencias, guía, campana, comentarios, chat, merch, sugerencias del reproductor, columna de la derecha y reproducción automática. También se puede quitar la playlist de un enlace.
- **Dos carpetas**: `chrome/` para Chrome, Edge, Brave y Opera, y `firefox/` para Firefox 121 o posterior. Hacen lo mismo; cambia la API con la que guardan los ajustes.
- **Notas** en `docs/`: instalación, qué hace cada interruptor, cómo está armada y qué datos toca.

[1.0.0]: https://github.com/notnomoro/youtube-clean/releases/tag/v1.0.0
