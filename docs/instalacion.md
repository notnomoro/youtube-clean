# Instalación

Youtube Clean no se compila. Cada navegador carga una carpeta ya lista.

| Navegador | Carpeta |
|---|---|
| Chrome, Edge, Brave, Opera y otros Chromium | `chrome/` |
| Firefox 121 o posterior | `firefox/` |

La versión de la extensión está en `manifest.json`.

## Desde una release

1. Abre la [página de releases](https://github.com/notnomoro/youtube-clean/releases).
2. Descarga `youtube-clean-chrome.zip` o `youtube-clean-firefox.zip`.
3. Descomprime el zip. Dentro tiene que verse `manifest.json`, no otra carpeta con el mismo nombre.
4. Sigue los pasos del navegador, aquí abajo, y elige esa carpeta descomprimida.

## Chrome, Edge, Brave u Opera

1. Abre la página de extensiones:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
   - Opera: `opera://extensions`
2. Activa el **modo de desarrollador**.
3. Pulsa **Cargar descomprimida** y selecciona la carpeta `chrome/` (o la carpeta descomprimida de la release).
4. Fija Youtube Clean en la barra si quieres tener el icono a mano.
5. Abre [YouTube](https://www.youtube.com) o recarga la pestaña si ya estaba abierta.

## Firefox

1. Abre `about:debugging#/runtime/this-firefox`.
2. Pulsa **Cargar complemento temporal…**.
3. Elige el `manifest.json` de la carpeta `firefox/`.
4. Abre YouTube o recarga la pestaña.

En Firefox, un complemento cargado así se quita al cerrar el navegador. Para dejarlo instalado hace falta empaquetarlo como `.xpi` firmado o publicarlo en addons.mozilla.org. El zip de la release sirve para revisar el código y para esa carga temporal.

## Comprobar que está activa

El icono abre un panel de 360×600. Con la protección encendida, el texto dice «YouTube más limpio en esta pestaña». Los interruptores guardan al momento: no hay botón de aplicar.

Si YouTube ya estaba abierto, recarga la pestaña. El content script entra al empezar a cargar la página.

## Actualizar

Sustituye los archivos de la carpeta y pulsa el botón de recargar en la página de extensiones. Luego recarga YouTube.

## Empaquetar en local

Desde la raíz del repositorio, en PowerShell:

```powershell
./scripts/package.ps1
```

Genera `dist/youtube-clean-chrome.zip` y `dist/youtube-clean-firefox.zip`. Esas carpetas no se suben a git.
