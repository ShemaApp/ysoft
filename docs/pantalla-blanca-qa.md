# QA — pantalla blanca al abrir Y Soft

Fecha de revisión: 2026-08-14.

## Evidencia de la grabación

La grabación muestra que la PWA se abre desde el icono de Android, presenta el splash con el logotipo y después conserva una franja verde superior con el resto de la pantalla en blanco. No se observan mensajes de error ni interacción adicional después de abrir la aplicación.

## Reproducción en GitHub Pages

La URL `https://shemaapp.github.io/ysoft/` sí monta actualmente el `#root` y presenta la pantalla de acceso de Y Soft. La consola del navegador no reportó errores durante la carga de esta reproducción.

Los scripts cargados en la página publicada corresponden a Firebase, `config.js`, `data.js`, `firestore-service.js`, `components.js`, `screens.js`, `screens-more.js` y `app.js`. El registro de Service Worker activo tiene como alcance `https://shemaapp.github.io/ysoft/`.

## Estado

El fallo sigue pendiente de reproducirse en el contexto exacto de la instalación PWA de Android. La siguiente revisión debe comparar la instalación con una pestaña normal, confirmar la versión de caché activa y capturar errores de ciclo de vida o de actualización del Service Worker cuando la PWA queda en blanco.

## Evidencia remota adicional

GitHub Pages entrega `sw.js` con `CACHE_NAME = 'ysoft-pwa-v6-catalogo-inventario'`, y sus cabeceras indican que el archivo fue actualizado el 2026-08-14 a las 05:16 UTC. El despliegue de Pages para el commit `b811dc7b1ad3160af98f3556898d49a0b5007a83` terminó con estado `success`; Pages está configurado desde `main` y la raíz del repositorio.

La página remota entrega también el `index.html` actual, con `firebase-init.js`, `config.js`, `data.js`, `firestore-service.js`, `components.js`, `screens.js`, `screens-more.js` y `app.js`. La reproducción en una pestaña normal monta correctamente la pantalla de acceso.

## Candidato principal del fallo

Antes de esta corrección, `404.html` cargaba la arquitectura histórica (`componentes/`, `pantallas/` y servicios antiguos) en lugar del shell actual. La entrada podía aparecer si la instalación Android conservaba un fallback de GitHub Pages o abría una ruta no resuelta. En ese caso, una sesión autenticada podía llegar a `app.js` sin el conjunto actual de `D.Screens` y dejar el contenido principal sin montar.

La corrección alinea `404.html` con `index.html`, fija `start_url` y `scope` explícitos a `/ysoft/`, cambia la caché a `v7-boot-fallback`, precarga los CDN de React/Firebase cuando el navegador lo permite y muestra un mensaje de error con botón de recarga si el arranque falla. Falta confirmar esta hipótesis en la instalación Android después del despliegue.
