# QA Fase 1 — Identidad y alcance operativo

## Estado

La pantalla `Acceso y alcance` está integrada detrás de Firebase Authentication y presenta de forma separada la sesión actual, organización, ubicación, rol operativo y permisos por operación.

## Validaciones realizadas

La copia de vista previa compila sin errores de sintaxis en los archivos JavaScript principales. La pantalla de acceso sigue visible cuando no existe una sesión autenticada, por lo que no se habilitan datos ni acciones operativas sin autenticación.

## Revisión pendiente

La revisión visual con un perfil autenticado no pudo completarse porque la sesión del navegador no llegó a la vista previa. No se debe interpretar la pantalla como autorización real: organización, ubicación y rol deben leerse del perfil autorizado y ser validados por Firestore.

## Decisión de seguridad

Esta fase no publica reglas nuevas, no crea datos reales y no habilita ventas, abonos, ajustes ni permisos temporales. La siguiente fase puede comenzar con el contrato de perfil y la administración de permisos, después de aprobar nombres de colecciones y estados.
