# Contribuir

Youtube Clean se mantiene en este repositorio. Los cambios pequeños y los informes claros ayudan más que un parche enorme sin contexto.

## Antes de abrir un issue

- Comprueba que el fallo sigue en la última versión.
- Recarga la pestaña de YouTube. La extensión se aplica al cargar la página y en cada navegación interna.
- Indica el navegador y su versión, y si usaste la carpeta `chrome/` o `firefox/`.

Usa las plantillas de [issues](https://github.com/notnomoro/youtube-clean/issues/new/choose): error o idea.

## Cambios de código

1. Haz fork y crea una rama desde `main`.
2. La interfaz y los textos de la extensión están en español. Mantén ese idioma en el popup.
3. Si un ajuste existe en Chromium, debe existir también en Firefox, salvo que la diferencia sea solo de API (`chrome.*` frente a `browser.*`).
4. No añadas permisos, hosts ni peticiones de red si el cambio no los necesita. Hoy la extensión solo pide `storage` y solo corre en `youtube.com`.
5. Abre un pull request contra `main` y describe qué cambia para quien usa la extensión.

No hace falta un entorno de compilación. Carga la carpeta `chrome/` o `firefox/` como extensión descomprimida y prueba el ajuste en YouTube. Si el cambio se ve en pantalla, adjunta una captura.

## Estilo

El popup, el content script y los valores por defecto ya tienen una forma. Sigue esa forma: nombres claros, sin dependencias nuevas y sin ofuscar el código.
