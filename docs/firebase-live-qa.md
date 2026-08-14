# QA de conexión real a Firebase

## Verificación de sesión

El 14 de agosto de 2026 la vista previa cargó la configuración pública del proyecto `ysoft-637a137u53t99` y mostró correctamente el formulario de Firebase Authentication. Después de iniciar sesión con una cuenta autorizada, la aplicación mostró la pantalla protegida de Y Soft, el encabezado común, los movimientos de revisión y las operaciones de turno.

## Estado observado

La autenticación funciona en la vista previa. La siguiente validación debe confirmar que el usuario autenticado tenga un documento `users/{uid}` con `organizationId`, `role` y, opcionalmente, `locationId`; las reglas Firestore dependen de ese perfil para autorizar lecturas y escrituras.

No se ejecutaron escrituras de prueba todavía. La validación de ventas, abonos y ajustes se hará únicamente con una operación real iniciada por el usuario y después de comprobar que las reglas publicadas coinciden con `firestore.rules`.

## Bloqueo encontrado

La sesión autenticada mantiene el UID `bS6CMFXNkOfBkiOCe20QdRREpQq1` y el servicio `firestore-service.js` se carga correctamente. La lectura de `users/{uid}` devuelve `Missing or insufficient permissions`, lo que confirma que las reglas que están activas en Firebase todavía son las reglas de arranque restrictivas. No se debe intentar escribir hasta publicar las reglas revisadas y crear el perfil de autorización del usuario.

La consola administrativa de Firebase se abrió con la cuenta de Google que tiene acceso al proyecto YSoft. La publicación de reglas queda pendiente de terminar la carga de la sección Firestore.

La ruta directa `/firestore/rules` permanece en estado de carga y no expone todavía el editor ni el botón de publicación. No se realizó ninguna publicación parcial.

La consulta administrativa directa a la API de Firestore respondió `401 UNAUTHENTICATED`; la sesión de la consola no expone un token OAuth utilizable desde el contexto de la aplicación. Por seguridad, no se intentó publicar reglas mediante una credencial improvisada ni mediante datos de la aplicación.

La ruta administrativa `https://console.firebase.google.com/project/ysoft-637a137u53t99/firestore/databases` también queda en carga en esta sesión; no se pudo confirmar desde la interfaz si la base fue inicializada.

Tras abrir Cloud Shell desde la consola, el panel de bases cargó correctamente y confirmó la base `(default)` en `nam5`, edición Estándar, modo Nativa. No se creó una base adicional.

Se activó Cloud Shell desde la consola de Firebase para intentar la publicación autenticada de reglas; el panel quedó cargando y todavía no expuso una terminal interactiva.

La autorización de Cloud Shell abrió el flujo OAuth de Google y después el navegador quedó en una pestaña `about:blank`; no se ejecutó ningún comando ni se publicó ninguna regla desde Cloud Shell.

La sesión administrativa de Google quedó cerrada al volver al selector de cuentas. No se publicaron reglas, no se crearon datos de prueba y la aplicación conserva la validación por perfil y el bloqueo de escrituras cuando Firestore rechaza la autorización.
