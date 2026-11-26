# Privacidad

Youtube Clean no tiene cuenta, no tiene servidor y no tiene analítica.

## Qué se guarda

Los interruptores del panel. Nada más. El navegador los guarda en su almacenamiento sincronizado, en la clave `youtubeClean`. Si el navegador tiene la sincronización de extensiones activada, ese objeto viaja con el resto de datos de la cuenta del navegador, no con un servicio de este proyecto.

## Qué no se lee

- Historial, pestañas ajenas a YouTube, cookies, contraseñas o texto de la página fuera de lo necesario para ocultar un bloque.
- El video que estás viendo no se envía a ningún sitio.
- No hay peticiones de red añadidas por la extensión.

## Dónde corre

Solo en páginas de `youtube.com`, mediante un content script declarado en el manifiesto. Fuera de YouTube no se inyecta nada.

## Permisos

`storage`, para leer y guardar los ajustes. Firefox declara además `data_collection_permissions.required: ["none"]`.
