# Arquitectura

Youtube Clean es una extensión Manifest V3 sin build. Hay dos copias, `chrome/` y `firefox/`, porque el almacenamiento no se llama igual. El resto del comportamiento es el mismo.

```
chrome/ o firefox/
├── manifest.json          nombre, versión, permiso storage, content scripts
├── shared/defaults.js     valores por defecto y fusión con lo guardado
├── popup/                 panel de ajustes
├── content/content.js     lógica dentro de YouTube
├── content/youtube.css    ocultación según clases en <html>
├── assets/                iconos del panel
└── fonts/                 Inter, Barlow Semi Condensed y JetBrains Mono
```

## Permisos

El manifiesto pide un solo permiso: `storage`. El content script corre en `*://*.youtube.com/*` desde `document_start`, antes de que YouTube pinte la página. No hay service worker, ni host permissions extra, ni código remoto.

## Cómo viaja un ajuste

1. El popup lee y escribe el objeto `youtubeClean` en `storage.sync`.
2. El content script lo lee al arrancar y escucha `storage.onChanged`.
3. `youtubeCleanMerge` completa cualquier campo que falte con el valor por defecto. Un ajuste nuevo no deja la configuración antigua a medias.
4. `apply()` pone clases en `<html>` (`yc-hide-feed`, `yc-block-video-ads`, …) y lanza solo el trabajo que hace falta: observador del DOM, temporizador de anuncios o redirección de Shorts.

El CSS hace la ocultación. El JavaScript marca estantes de Shorts y secciones de recomendados, porque YouTube los inserta después de cargar y no siempre traen una clase estable.

## Chromium y Firefox

| | Chromium | Firefox |
|---|---|---|
| Carpeta | `chrome/` | `firefox/` |
| Almacenamiento | `chrome.storage` | `browser.storage`, con `chrome.storage` como respaldo |
| Manifiesto | Manifest V3 | Manifest V3 más `browser_specific_settings.gecko` |
| Id | El que asigna la tienda o el navegador | `youtube-clean@extension.local` |
| Firefox mínimo | — | 121 |

`shared/defaults.js` de Firefox define `youtubeCleanStorage` para elegir la API. En Chromium el popup y el content script llaman a `chrome.storage` directamente.

## Anuncios de video

Cada 200 ms, si el reproductor tiene la clase de anuncio, el script guarda volumen, silencio y velocidad, silencia el video, sube la velocidad y busca el botón de saltar. Cuando el anuncio desaparece, restaura esos tres valores.

## Shorts

`/shorts/<id>` se traduce a `https://www.youtube.com/watch?v=<id>`. La redirección escucha la carga inicial y los eventos `yt-navigate-start` y `state-navigatestart`, que YouTube dispara al cambiar de video sin recargar.

## Fuentes

El panel usa tres familias, incluidas en `fonts/` y bajo la [SIL Open Font License 1.1](https://openfontlicense.org/):

| Familia | Origen |
|---|---|
| Inter | [rsms/inter](https://github.com/rsms/inter) |
| Barlow Semi Condensed | [google/fonts](https://github.com/google/fonts), familia Barlow |
| JetBrains Mono | [JetBrains/JetBrainsMono](https://github.com/JetBrains/JetBrainsMono) |
