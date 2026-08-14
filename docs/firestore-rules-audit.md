# Auditoría de sincronización y reglas Firestore

Fecha de revisión: 2026-08-14

## Estado de GitHub

La rama remota `main` de `ShemaApp/ysoft` apunta al commit `91b1c461f58367db1e92279f460e2a7974fa6dc4`, cuyo mensaje es `feat: catalogo e inventario por ubicacion`. La API de GitHub también expone `screens.js` y `docs/fase2-qa.md` en esa rama. Si la interfaz web no muestra el cambio, debe revisarse que esté abierta la rama `main`, que el repositorio observado sea `ShemaApp/ysoft` y que no se esté consultando una copia de GitHub Pages con caché anterior.

## Hallazgo crítico en las reglas locales

La revisión local encontró llamadas como `anyRole('admin', 'vendedor', 'cajero', '')` y equivalentes en clientes, créditos, ventas, renglones de venta, movimientos de inventario, abonos y ajustes. Incluir la cadena vacía como rol permitido era inseguro: una cuenta cuyo perfil tuviera `role == ''` podría satisfacer la condición de autorización. La copia local ya fue corregida con funciones de aridad explícita (`anyRole3` y `anyRole4`) y no conserva roles vacíos.

La corrección aplicada elimina el argumento vacío de todas las llamadas de autorización y exige un rol explícito. Las reglas todavía deben incorporar de forma más completa el alcance `organizationId` y `locationId` en cada escritura operativa, junto con la operación autorizada y, cuando aplique, la vigencia del permiso temporal; esa ampliación queda pendiente de diseño y aprobación porque afecta el modelo de permisos por ubicación.

## Estado de publicación

Este documento no publica reglas ni modifica datos. La regla activa de Firebase no se pudo comparar directamente en esta revisión; por tanto, la corrección local debe probarse primero y posteriormente publicarse desde una sesión administrativa verificable. En esta iteración no se publicaron reglas ni se modificaron datos.
