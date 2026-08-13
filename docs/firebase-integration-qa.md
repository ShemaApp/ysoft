# QA de integración Firebase

La configuración pública del proyecto `ysoft-637a137u53t99` ya está integrada en `firebase-init.js` y en la copia aislada. El repositorio conserva el SDK compat porque los módulos actuales usan `window.firebase`.

En el primer recargo del preview, la interfaz siguió mostrando `Modo revisión local`, lo que indicaba que la sesión del navegador estaba sirviendo una caché anterior del service worker. La versión del caché se incrementó a `ysoft-pwa-v2-firebase`. Después de retirar la instalación anterior y limpiar la caché local, la app reconoció Firebase y mostró `Acceso a Y Soft`.

Mientras no exista un usuario autenticado, el flujo no debe leer ni escribir datos operativos. La configuración por sí sola no habilita ventas persistentes: la app requiere Authentication y las reglas Firestore revisadas.
